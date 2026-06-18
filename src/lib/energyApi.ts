// Czech energy data service
// Uses ENTSO-E API when ENTSOE_API_KEY is set, otherwise returns realistic simulated data

export interface LiveGeneration {
  solar: number;     // MW
  wind: number;      // MW
  nuclear: number;   // MW
  hydro: number;     // MW
  thermal: number;   // MW
  total: number;     // MW
  consumption: number; // MW
  surplus: number;   // MW (positive = surplus, negative = deficit)
  timestamp: string;
  isLive: boolean;
}

export interface SurplusHistoryPoint {
  hour: string;
  surplus: number;   // MW
  price: number;     // CZK per MWh
  stored: number;    // MW
}

export interface RegionSurplus {
  regionId: string;
  regionName: string;
  currentSurplus: number; // MW
  status: 'surplus' | 'deficit' | 'balanced';
}

// Czech regions with realistic baseline renewable capacity
const CZECH_REGIONS = [
  { id: 'JHC', name: 'Jihočeský', renewableFactor: 1.4 },
  { id: 'JHM', name: 'Jihomoravský', renewableFactor: 1.2 },
  { id: 'KVK', name: 'Karlovarský', renewableFactor: 0.7 },
  { id: 'KHK', name: 'Královéhradecký', renewableFactor: 0.9 },
  { id: 'LBK', name: 'Liberecký', renewableFactor: 0.6 },
  { id: 'MSK', name: 'Moravskoslezský', renewableFactor: 0.8 },
  { id: 'OLK', name: 'Olomoucký', renewableFactor: 0.9 },
  { id: 'PAK', name: 'Pardubický', renewableFactor: 1.0 },
  { id: 'PLK', name: 'Plzeňský', renewableFactor: 1.1 },
  { id: 'PHA', name: 'Praha', renewableFactor: 0.3 },
  { id: 'STC', name: 'Středočeský', renewableFactor: 1.3 },
  { id: 'ULK', name: 'Ústecký', renewableFactor: 1.5 },
  { id: 'VYS', name: 'Vysočina', renewableFactor: 1.2 },
  { id: 'ZLK', name: 'Zlínský', renewableFactor: 0.8 },
];

function getSimulatedGeneration(now: Date): LiveGeneration {
  const hour = now.getHours();
  const month = now.getMonth(); // 0-11

  // Season factor (summer = more solar, winter = less)
  const isSummer = month >= 4 && month <= 8;
  const isWinter = month <= 1 || month >= 10;
  const seasonFactor = isSummer ? 1.0 : isWinter ? 0.5 : 0.75;

  // Nuclear: ~4000 MW baseline (Dukovany ~2000 MW + Temelín ~2000 MW)
  // Slight variation due to maintenance/load-following
  const nuclear = 3900 + Math.sin(now.getTime() / 3600000) * 150;

  // Solar: peaks midday (11:00-14:00), 0 at night
  // Czech installed solar capacity ~2500 MW peak
  let solar = 0;
  if (hour >= 6 && hour <= 20) {
    const solarPeak = Math.sin(((hour - 6) / 14) * Math.PI);
    solar = Math.max(0, solarPeak * 2400 * seasonFactor * (0.6 + Math.random() * 0.4));
  }

  // Wind: variable, slightly higher at night and in winter
  const windBase = isWinter ? 450 : 280;
  const windVariance = 250;
  const wind = Math.max(0, Math.min(800,
    windBase + Math.sin(now.getTime() / 7200000) * windVariance * 0.6 +
    (Math.random() - 0.5) * windVariance
  ));

  // Hydro: ~350 MW average, pumped storage compensates
  const hydro = 280 + Math.sin(now.getTime() / 1800000) * 120 + Math.random() * 60;

  // Thermal (coal + gas): fills the gap, usually 800-2500 MW
  const thermalBase = isWinter ? 2200 : 1400;
  const thermal = Math.max(400, thermalBase - solar * 0.3 + (Math.random() - 0.5) * 300);

  const total = nuclear + solar + wind + hydro + thermal;

  // Consumption: higher during day/winter, lower at night/weekend
  const isWeekend = now.getDay() === 0 || now.getDay() === 6;
  let consumption = 7200;
  if (hour >= 7 && hour <= 21) consumption += 800; // daytime
  if (isWinter) consumption += 700;
  if (isSummer && hour >= 10 && hour <= 18) consumption += 200; // AC
  if (isWeekend) consumption -= 600;
  consumption += (Math.random() - 0.5) * 400;

  const surplus = total - consumption;

  return {
    solar: Math.round(solar),
    wind: Math.round(wind),
    nuclear: Math.round(nuclear),
    hydro: Math.round(hydro),
    thermal: Math.round(thermal),
    total: Math.round(total),
    consumption: Math.round(consumption),
    surplus: Math.round(surplus),
    timestamp: now.toISOString(),
    isLive: false,
  };
}

// Parse ENTSO-E XML response for actual generation per type
function parseEntsoeGeneration(xml: string, timestamp: string): Partial<LiveGeneration> {
  const result: Partial<LiveGeneration> = {};

  // Map ENTSO-E PsrType codes to our fields
  const typeMap: Record<string, keyof LiveGeneration> = {
    B01: 'hydro',       // Biomass (treating as thermal)
    B04: 'thermal',     // Fossil Gas
    B05: 'thermal',     // Fossil Hard coal
    B06: 'thermal',     // Fossil Oil
    B09: 'hydro',       // Geothermal
    B10: 'hydro',       // Hydro Pumped Storage
    B11: 'hydro',       // Hydro Run-of-river
    B14: 'nuclear',     // Nuclear
    B16: 'solar',       // Solar
    B19: 'wind',        // Wind Offshore
    B20: 'wind',        // Wind Onshore
  };

  // Extract TimeSeries blocks
  const timeSeriesRegex = /<TimeSeries>([\s\S]*?)<\/TimeSeries>/g;
  let match;

  while ((match = timeSeriesRegex.exec(xml)) !== null) {
    const block = match[1];
    const psrMatch = block.match(/<psrType>(B\d+)<\/psrType>/);
    const quantityMatch = block.match(/<quantity>([\d.]+)<\/quantity>/);

    if (psrMatch && quantityMatch) {
      const psrType = psrMatch[1];
      const quantity = parseFloat(quantityMatch[1]);
      const field = typeMap[psrType];

      if (field) {
        const current = (result[field] as number) ?? 0;
        (result as Record<string, number>)[field as string] = current + quantity;
      }
    }
  }

  return result;
}

// Try energy-charts.info first – free, no key, CC BY 4.0 (Fraunhofer ISE)
async function fetchEnergyChartsGeneration(): Promise<LiveGeneration | null> {
  try {
    const res = await fetch(
      'https://api.energy-charts.info/public_power?country=cz',
      { next: { revalidate: 300 } } // cache 5 min
    );
    if (!res.ok) return null;
    const data = await res.json();

    // data.production_types is array of { name, data: number[] }
    // data.unix_seconds is array of timestamps; last value = most recent
    const types: Array<{ name: string; data: (number | null)[] }> = data.production_types ?? [];

    // Find last index where at least nuclear OR solar has a real value
    // (Load updates faster than generation types, so lastIdx of unix_seconds may be stale)
    const nuclearSeries = types.find((t) => t.name === 'Nuclear');
    let lastIdx = (data.unix_seconds?.length ?? 1) - 1;
    if (nuclearSeries) {
      for (let i = lastIdx; i >= 0; i--) {
        const v = nuclearSeries.data[i];
        if (v !== null && v !== undefined && !Number.isNaN(Number(v))) {
          lastIdx = i;
          break;
        }
      }
    }

    // Exact field names from energy-charts.info CZ endpoint
    const getExact = (exactNames: string[]): number => {
      return Math.round(exactNames.reduce((acc: number, n: string) => {
        const found = types.find((t) => t.name === n);
        const raw = found?.data?.[lastIdx];
        const v = raw !== null && raw !== undefined ? Number(raw) : 0;
        return acc + (v > 0 ? v : 0);
      }, 0));
    };

    const nuclear  = getExact(['Nuclear']);
    const solar    = getExact(['Solar']);
    const wind     = getExact(['Wind onshore', 'Wind offshore']);
    const hydro    = getExact(['Hydro Run-of-River', 'Hydro water reservoir', 'Hydro pumped storage']);
    const thermal  = getExact([
      'Fossil brown coal / lignite', 'Fossil hard coal', 'Fossil oil', 'Fossil gas',
      'Biomass', 'Waste', 'Others', 'Other renewables',
    ]);
    const total    = nuclear + solar + wind + hydro + thermal;
    // Load is negative by convention in energy-charts
    const loadEntry = types.find((t) => t.name === 'Load');
    const consumption = loadEntry
      ? Math.abs(loadEntry.data?.[lastIdx] ?? 0)
      : 7800;
    const surplus = total - consumption;

    if (total < 100) return null; // data looks invalid

    return {
      solar, wind, nuclear, hydro, thermal, total,
      consumption: Math.round(consumption),
      surplus: Math.round(surplus),
      timestamp: new Date((data.unix_seconds?.[lastIdx] ?? Date.now() / 1000) * 1000).toISOString(),
      isLive: true,
    };
  } catch {
    return null;
  }
}

export async function fetchLiveGeneration(): Promise<LiveGeneration> {
  // 1. Try free energy-charts.info API (no key needed)
  const energyCharts = await fetchEnergyChartsGeneration();
  if (energyCharts) return energyCharts;

  // 2. Try ENTSO-E with API key
  const apiKey = process.env.ENTSOE_API_KEY;
  if (apiKey) {
    try {
      const now = new Date();
      // ENTSO-E requires UTC time range; fetch last 2h window
      const periodStart = new Date(now.getTime() - 2 * 3600 * 1000);
      const fmt = (d: Date) =>
        d.toISOString().replace(/[-:T]/g, '').slice(0, 12); // YYYYMMDDHHmm

      const url =
        `https://web-api.tp.entsoe.eu/api` +
        `?documentType=A75` +
        `&processType=A16` +
        `&in_Domain=10YCZ-CEPS-----N` +
        `&out_Domain=10YCZ-CEPS-----N` +
        `&periodStart=${fmt(periodStart)}` +
        `&periodEnd=${fmt(now)}` +
        `&securityToken=${apiKey}`;

      const res = await fetch(url, { next: { revalidate: 60 } });

      if (res.ok) {
        const xml = await res.text();
        const parsed = parseEntsoeGeneration(xml, now.toISOString());

        // Fill any missing sources with simulated fallback
        const simulated = getSimulatedGeneration(now);
        const live: LiveGeneration = {
          solar: parsed.solar ?? simulated.solar,
          wind: parsed.wind ?? simulated.wind,
          nuclear: parsed.nuclear ?? simulated.nuclear,
          hydro: parsed.hydro ?? simulated.hydro,
          thermal: parsed.thermal ?? simulated.thermal,
          total: 0,
          consumption: simulated.consumption,
          surplus: 0,
          timestamp: now.toISOString(),
          isLive: true,
        };
        live.total = live.solar + live.wind + live.nuclear + live.hydro + live.thermal;
        live.surplus = live.total - live.consumption;
        return live;
      }
    } catch {
      // Fall through to simulation
    }
  }

  return getSimulatedGeneration(new Date());
}

export async function fetchSurplusHistory(hours: number): Promise<SurplusHistoryPoint[]> {
  const now = new Date();
  const result: SurplusHistoryPoint[] = [];

  for (let i = hours - 1; i >= 0; i--) {
    const t = new Date(now.getTime() - i * 3600 * 1000);
    const gen = getSimulatedGeneration(t);
    const surplus = gen.surplus;

    // Price model: negative surplus = high prices, high surplus = low/negative prices
    // Czech day-ahead price range: ~500-4000 CZK/MWh typical
    const basePriceEur = 80; // EUR/MWh typical Czech base
    const surplusEffect = surplus * -0.015; // surplus drives price down
    const price = Math.max(
      -200,
      (basePriceEur + surplusEffect + (Math.random() - 0.5) * 15) * 25 // EUR->CZK ~25
    );

    // Stored: fraction of surplus actually stored (limited by storage capacity)
    const stored = surplus > 0
      ? Math.min(surplus * 0.6, 400) // can store up to 400 MW
      : 0;

    result.push({
      hour: `${t.getHours()}:00`,
      surplus: Math.round(surplus),
      price: Math.round(price),
      stored: Math.round(stored),
    });
  }

  return result;
}

export async function fetchRegionSurplus(): Promise<RegionSurplus[]> {
  const now = new Date();
  const baseGen = getSimulatedGeneration(now);
  const totalSurplus = baseGen.surplus;

  return CZECH_REGIONS.map((region) => {
    // Distribute surplus across regions weighted by renewable capacity factor
    const share = region.renewableFactor / CZECH_REGIONS.reduce((s, r) => s + r.renewableFactor, 0);
    const regionSurplus = Math.round(totalSurplus * share + (Math.random() - 0.5) * 80);

    let status: RegionSurplus['status'];
    if (regionSurplus > 30) status = 'surplus';
    else if (regionSurplus < -30) status = 'deficit';
    else status = 'balanced';

    return {
      regionId: region.id,
      regionName: region.name,
      currentSurplus: regionSurplus,
      status,
    };
  });
}
