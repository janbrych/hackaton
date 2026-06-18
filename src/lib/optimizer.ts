import { REGIONS_WITH_CALCULATIONS, type CzechRegion } from "@/data/czechRegions";
import { PLANT_SIZES, EXCHANGE_RATE, SUBSIDIES } from "@/data/plantCosts";

export interface PlantRecommendation {
  regionId: string;
  regionName: string;
  plantSize: "small" | "medium" | "large";
  quantity: number;
  totalCapacityMW: number;
  capitalCostCZK: number;
  annualRevenueCZK: number;
  paybackYears: number;
  feasibilityScore: number;
  annualSurplusMWh: number;
  reasoning: string[];
  gridDistanceKm: number;
  subsidyAmount: number;
  netCapitalCost: number;
}

export interface NetworkOptimization {
  recommendations: PlantRecommendation[];
  totalCapacityMW: number;
  totalCapitalCostCZK: number;
  totalAnnualRevenueCZK: number;
  avgPaybackYears: number;
  coveragePercent: number;
  annualCO2SavedTons: number;
  totalSurplusCoveredMWh: number;
}

const SURPLUS_PER_MW_ELECTROLYZER = 8_760 * 0.45; // hours * capacity factor
const H2_ENERGY_CONTENT = 33.33; // kWh/kg
const CO2_SAVED_PER_MWH = 0.412; // tons CO2 / MWh (Czech grid factor 2024, ČEPS)

export function optimizePlantNetwork(
  minFeasibility = 45,
  budgetCZK?: number
): NetworkOptimization {
  const eligible = REGIONS_WITH_CALCULATIONS
    .filter((r) => (r.plantFeasibility ?? 0) >= minFeasibility)
    .sort((a, b) => (b.plantFeasibility ?? 0) - (a.plantFeasibility ?? 0));

  const recommendations: PlantRecommendation[] = [];
  let remainingBudget = budgetCZK ?? Infinity;

  for (const region of eligible) {
    const surplus = region.annualSurplus ?? 0;
    if (surplus < 5000) continue; // min 5 GWh surplus

    // Select plant size based on surplus
    let size: "small" | "medium" | "large";
    let qty: number;

    if (surplus > 200_000) {
      size = "large";
      qty = Math.min(3, Math.ceil(surplus / 400_000));
    } else if (surplus > 50_000) {
      size = "medium";
      qty = Math.min(4, Math.ceil(surplus / 80_000));
    } else {
      size = "small";
      qty = Math.min(3, Math.ceil(surplus / 20_000));
    }

    const plant = PLANT_SIZES[size];
    const capexEUR = plant.capitalCostEUR * qty;
    const capexCZK = capexEUR * EXCHANGE_RATE;

    if (capexCZK > remainingBudget) {
      // Try smaller size
      if (size === "large") {
        size = "medium";
        qty = 1;
      } else if (size === "medium") {
        size = "small";
        qty = 1;
      } else {
        continue;
      }
    }

    const finalPlant = PLANT_SIZES[size];
    const finalCapexEUR = finalPlant.capitalCostEUR * qty;
    const finalCapexCZK = finalCapexEUR * EXCHANGE_RATE;
    const totalCapMW = finalPlant.capacityMW * qty;

    // Revenue calculation
    const mwhConverted = totalCapMW * SURPLUS_PER_MW_ELECTROLYZER * 0.55; // reconversion
    const electricityRevenueCZK = mwhConverted * 1850; // CZK/MWh
    const opexCZK = finalPlant.annualOpexEUR * qty * EXCHANGE_RATE;
    const annualRevenueCZK = electricityRevenueCZK - opexCZK;

    // Subsidy
    const maxSubsidyRate = Math.max(
      SUBSIDIES.mpo_hydrogen.maxGrant,
      SUBSIDIES.rep_cz.maxGrant
    );
    const subsidyAmount = finalCapexCZK * maxSubsidyRate;
    const netCapital = finalCapexCZK - subsidyAmount;

    const payback = netCapital / Math.max(1, annualRevenueCZK);

    // Grid distance estimate (simplified)
    const gridDistKm = region.gridLossFactor * 8;

    const reasoning: string[] = [];
    if (region.energyProduction > region.energyConsumption) {
      reasoning.push(`Región má přebytek ${((region.energyProduction - region.energyConsumption) / 1000).toFixed(1)} TWh/rok`);
    }
    if (region.renewableCapacity > 300) {
      reasoning.push(`${region.renewableCapacity} MW nainstalovaných OZE – vysoký potenciál přebytků`);
    }
    if (region.surplusHours > 800) {
      reasoning.push(`${region.surplusHours} h/rok s přebytkem energie v síti`);
    }
    if (region.landCostIndex < 0.35) {
      reasoning.push(`Nízké náklady na pozemky (index ${region.landCostIndex})`);
    }
    if (region.id === "ULK") {
      reasoning.push("Brownfield po těžebním průmyslu – vhodná infrastruktura");
    }

    recommendations.push({
      regionId: region.id,
      regionName: region.name,
      plantSize: size,
      quantity: qty,
      totalCapacityMW: totalCapMW,
      capitalCostCZK: finalCapexCZK,
      annualRevenueCZK,
      paybackYears: Math.round(payback * 10) / 10,
      feasibilityScore: region.plantFeasibility ?? 0,
      annualSurplusMWh: surplus,
      reasoning,
      gridDistanceKm: Math.round(gridDistKm),
      subsidyAmount: Math.round(subsidyAmount),
      netCapitalCost: Math.round(netCapital),
    });

    remainingBudget -= finalCapexCZK;
  }

  const totalCapMW = recommendations.reduce((s, r) => s + r.totalCapacityMW, 0);
  const totalCapex = recommendations.reduce((s, r) => s + r.capitalCostCZK, 0);
  const totalRevenue = recommendations.reduce((s, r) => s + r.annualRevenueCZK, 0);
  const totalSurplus = recommendations.reduce((s, r) => s + r.annualSurplusMWh, 0);
  const avgPayback = recommendations.length
    ? recommendations.reduce((s, r) => s + r.paybackYears, 0) / recommendations.length
    : 0;

  const totalMwhConverted = totalCapMW * SURPLUS_PER_MW_ELECTROLYZER * 0.55;

  return {
    recommendations,
    totalCapacityMW: Math.round(totalCapMW),
    totalCapitalCostCZK: Math.round(totalCapex),
    totalAnnualRevenueCZK: Math.round(totalRevenue),
    avgPaybackYears: Math.round(avgPayback * 10) / 10,
    coveragePercent: Math.min(100, Math.round((recommendations.length / REGIONS_WITH_CALCULATIONS.length) * 100)),
    annualCO2SavedTons: Math.round(totalMwhConverted * CO2_SAVED_PER_MWH),
    totalSurplusCoveredMWh: Math.round(totalSurplus),
  };
}

export function calculateROI(
  regionId: string,
  monthlySurplusKwh: number,
  userType: "household" | "business"
): {
  monthlyIncomeCZK: number;
  annualIncomeCZK: number;
  pricePerKwhCZK: number;
  regionMultiplier: number;
  breakEvenMonths: number;
} {
  const region = REGIONS_WITH_CALCULATIONS.find((r) => r.id === regionId);
  if (!region) throw new Error("Region not found");

  // Base price varies by region feasibility (higher demand = better price)
  const feasibility = region.plantFeasibility ?? 50;
  const basePrice = 1.2; // CZK/kWh baseline
  const regionMultiplier = 0.7 + (feasibility / 100) * 0.8; // 0.7 - 1.5x
  const userMultiplier = userType === "business" ? 1.15 : 1.0;

  const pricePerKwh = basePrice * regionMultiplier * userMultiplier;
  const monthlyIncome = monthlySurplusKwh * pricePerKwh;
  const annualIncome = monthlyIncome * 12;

  // Break-even for basic solar installation (75,000 CZK average)
  const installCost = userType === "business" ? 300_000 : 75_000;
  const breakEven = installCost / Math.max(1, monthlyIncome);

  return {
    monthlyIncomeCZK: Math.round(monthlyIncome),
    annualIncomeCZK: Math.round(annualIncome),
    pricePerKwhCZK: Math.round(pricePerKwh * 100) / 100,
    regionMultiplier: Math.round(regionMultiplier * 100) / 100,
    breakEvenMonths: Math.round(breakEven),
  };
}
