export interface CzechRegion {
  id: string;
  name: string;
  lat: number;
  lng: number;
  population: number;
  area: number; // km²
  // Energy data (annual, MWh)
  energyProduction: number;
  energyConsumption: number;
  renewableCapacity: number; // MW installed
  solarPotential: number; // kWh/kWp/year
  windPotential: number; // avg m/s
  industrialLoad: number; // MW peak industrial
  gridLossFactor: number; // % transmission losses to nearest hub
  existingStorage: number; // MWh existing storage capacity
  surplusHours: number; // avg hours/year with surplus
  avgElectricityPrice: number; // CZK/kWh retail
  landCostIndex: number; // relative 0-1 (1 = most expensive)
  // Calculated
  annualSurplus?: number; // MWh
  plantFeasibility?: number; // 0-100 score
}

export const CZECH_REGIONS: CzechRegion[] = [
  {
    id: "PHA",
    name: "Praha",
    lat: 50.0755,
    lng: 14.4378,
    population: 1335084,
    area: 496,
    energyProduction: 1200,
    energyConsumption: 6800,
    renewableCapacity: 45,
    solarPotential: 1020,
    windPotential: 3.2,
    industrialLoad: 850,
    gridLossFactor: 2.1,
    existingStorage: 0,
    surplusHours: 120,
    avgElectricityPrice: 4.8,
    landCostIndex: 1.0,
  },
  {
    id: "STC",
    name: "Středočeský kraj",
    lat: 50.0217,
    lng: 14.6521,
    population: 1434028,
    area: 11014,
    energyProduction: 3800,
    energyConsumption: 4200,
    renewableCapacity: 420,
    solarPotential: 1050,
    windPotential: 4.1,
    industrialLoad: 680,
    gridLossFactor: 3.2,
    existingStorage: 320,
    surplusHours: 680,
    avgElectricityPrice: 4.5,
    landCostIndex: 0.6,
  },
  {
    id: "JHC",
    name: "Jihočeský kraj",
    lat: 49.0024,
    lng: 14.4968,
    population: 652589,
    area: 10057,
    energyProduction: 16800, // Temelín nuclear
    energyConsumption: 2100,
    renewableCapacity: 380,
    solarPotential: 1080,
    windPotential: 4.8,
    industrialLoad: 320,
    gridLossFactor: 4.1,
    existingStorage: 120,
    surplusHours: 2800,
    avgElectricityPrice: 4.2,
    landCostIndex: 0.3,
  },
  {
    id: "PLK",
    name: "Plzeňský kraj",
    lat: 49.7384,
    lng: 13.3736,
    population: 582786,
    area: 7561,
    energyProduction: 2900,
    energyConsumption: 2800,
    renewableCapacity: 290,
    solarPotential: 1010,
    windPotential: 4.5,
    industrialLoad: 480,
    gridLossFactor: 3.8,
    existingStorage: 80,
    surplusHours: 510,
    avgElectricityPrice: 4.3,
    landCostIndex: 0.35,
  },
  {
    id: "KVK",
    name: "Karlovarský kraj",
    lat: 50.2279,
    lng: 12.8716,
    population: 287153,
    area: 3314,
    energyProduction: 4200,
    energyConsumption: 1100,
    renewableCapacity: 180,
    solarPotential: 980,
    windPotential: 5.2,
    industrialLoad: 290,
    gridLossFactor: 5.1,
    existingStorage: 40,
    surplusHours: 1420,
    avgElectricityPrice: 4.1,
    landCostIndex: 0.25,
  },
  {
    id: "ULK",
    name: "Ústecký kraj",
    lat: 50.6607,
    lng: 14.0323,
    population: 810639,
    area: 5335,
    energyProduction: 18500, // Lignite plants + Dukovany
    energyConsumption: 3200,
    renewableCapacity: 520,
    solarPotential: 970,
    windPotential: 5.8,
    industrialLoad: 1200,
    gridLossFactor: 3.5,
    existingStorage: 680, // Přečerpávací elektrárna Štěchovice area
    surplusHours: 3100,
    avgElectricityPrice: 4.0,
    landCostIndex: 0.2,
  },
  {
    id: "LBK",
    name: "Liberecký kraj",
    lat: 50.7663,
    lng: 15.0543,
    population: 444975,
    area: 3163,
    energyProduction: 980,
    energyConsumption: 1400,
    renewableCapacity: 210,
    solarPotential: 960,
    windPotential: 5.4,
    industrialLoad: 380,
    gridLossFactor: 4.8,
    existingStorage: 20,
    surplusHours: 380,
    avgElectricityPrice: 4.4,
    landCostIndex: 0.3,
  },
  {
    id: "HKK",
    name: "Královéhradecký kraj",
    lat: 50.2092,
    lng: 15.8328,
    population: 549743,
    area: 4759,
    energyProduction: 1800,
    energyConsumption: 1900,
    renewableCapacity: 180,
    solarPotential: 990,
    windPotential: 4.3,
    industrialLoad: 420,
    gridLossFactor: 4.2,
    existingStorage: 60,
    surplusHours: 420,
    avgElectricityPrice: 4.3,
    landCostIndex: 0.32,
  },
  {
    id: "PAK",
    name: "Pardubický kraj",
    lat: 49.9453,
    lng: 16.2868,
    population: 523827,
    area: 4519,
    energyProduction: 2100,
    energyConsumption: 2000,
    renewableCapacity: 160,
    solarPotential: 1010,
    windPotential: 3.9,
    industrialLoad: 510,
    gridLossFactor: 3.9,
    existingStorage: 40,
    surplusHours: 490,
    avgElectricityPrice: 4.3,
    landCostIndex: 0.3,
  },
  {
    id: "VYS",
    name: "Kraj Vysočina",
    lat: 49.3988,
    lng: 15.5968,
    population: 508952,
    area: 6795,
    energyProduction: 1600,
    energyConsumption: 1700,
    renewableCapacity: 240,
    solarPotential: 1040,
    windPotential: 4.6,
    industrialLoad: 340,
    gridLossFactor: 4.5,
    existingStorage: 30,
    surplusHours: 560,
    avgElectricityPrice: 4.2,
    landCostIndex: 0.22,
  },
  {
    id: "JHM",
    name: "Jihomoravský kraj",
    lat: 49.2006,
    lng: 16.6084,
    population: 1195227,
    area: 7195,
    energyProduction: 5800,
    energyConsumption: 4500,
    renewableCapacity: 680,
    solarPotential: 1120,
    windPotential: 3.8,
    industrialLoad: 820,
    gridLossFactor: 3.1,
    existingStorage: 280,
    surplusHours: 780,
    avgElectricityPrice: 4.5,
    landCostIndex: 0.5,
  },
  {
    id: "OLK",
    name: "Olomoucký kraj",
    lat: 49.5938,
    lng: 17.2509,
    population: 632279,
    area: 5267,
    energyProduction: 2200,
    energyConsumption: 2300,
    renewableCapacity: 190,
    solarPotential: 1000,
    windPotential: 3.5,
    industrialLoad: 480,
    gridLossFactor: 4.0,
    existingStorage: 50,
    surplusHours: 390,
    avgElectricityPrice: 4.2,
    landCostIndex: 0.28,
  },
  {
    id: "ZLK",
    name: "Zlínský kraj",
    lat: 49.2247,
    lng: 17.6695,
    population: 583056,
    area: 3964,
    energyProduction: 1900,
    energyConsumption: 2100,
    renewableCapacity: 140,
    solarPotential: 1010,
    windPotential: 3.6,
    industrialLoad: 520,
    gridLossFactor: 4.3,
    existingStorage: 30,
    surplusHours: 360,
    avgElectricityPrice: 4.2,
    landCostIndex: 0.27,
  },
  {
    id: "MSK",
    name: "Moravskoslezský kraj",
    lat: 49.8209,
    lng: 18.2625,
    population: 1183278,
    area: 5427,
    energyProduction: 8200, // Heavy industry + coal
    energyConsumption: 7800,
    renewableCapacity: 320,
    solarPotential: 980,
    windPotential: 4.0,
    industrialLoad: 2100, // Steel mills, ArcelorMittal etc.
    gridLossFactor: 3.6,
    existingStorage: 180,
    surplusHours: 620,
    avgElectricityPrice: 4.1,
    landCostIndex: 0.3,
  },
];

// Calculate derived values
export const REGIONS_WITH_CALCULATIONS = CZECH_REGIONS.map((r) => {
  const annualSurplus = (r.energyProduction - r.energyConsumption) * 1000; // Convert GWh to MWh equivalent proxy
  const surplusFromRenewables =
    r.renewableCapacity * r.surplusHours * 0.4; // MWh from renewables during surplus hours

  const totalSurplus = Math.max(0, surplusFromRenewables + annualSurplus * 0.01);

  // Feasibility score 0-100
  const surplusScore = Math.min(40, (totalSurplus / 50000) * 40);
  const populationScore = Math.min(
    20,
    (r.population / 1500000) * 20
  );
  const renewableScore = Math.min(20, (r.renewableCapacity / 700) * 20);
  const costScore = (1 - r.landCostIndex) * 15;
  const gridScore = Math.max(0, 5 - r.gridLossFactor);

  const feasibility = Math.round(
    surplusScore + populationScore + renewableScore + costScore + gridScore
  );

  return {
    ...r,
    annualSurplus: Math.round(totalSurplus),
    plantFeasibility: Math.min(100, feasibility),
  };
});

export function getRegionById(id: string): CzechRegion | undefined {
  return REGIONS_WITH_CALCULATIONS.find((r) => r.id === id);
}
