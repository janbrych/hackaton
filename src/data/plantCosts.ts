// Hydrogen plant cost data based on 2024 market prices (EUR/CZK)
export const EXCHANGE_RATE = 25.2; // CZK per EUR

export interface PlantConfig {
  capacityMW: number; // Electrolyzer capacity in MW
  capitalCostEUR: number; // Total CAPEX EUR
  annualOpexEUR: number; // Annual OPEX EUR
  hydrogenProductionKgPerYear: number;
  electricityNeededMWhPerKgH2: number; // ~50 kWh/kg H2
  reconversionEfficiency: number; // % electricity back from H2
  lifespanYears: number;
}

export const PLANT_SIZES: Record<string, PlantConfig> = {
  small: {
    capacityMW: 5,
    capitalCostEUR: 8_500_000,
    annualOpexEUR: 320_000,
    hydrogenProductionKgPerYear: 876_000, // ~100 kg/h at full load
    electricityNeededMWhPerKgH2: 0.05,
    reconversionEfficiency: 0.55,
    lifespanYears: 20,
  },
  medium: {
    capacityMW: 20,
    capitalCostEUR: 28_000_000,
    annualOpexEUR: 980_000,
    hydrogenProductionKgPerYear: 3_504_000,
    electricityNeededMWhPerKgH2: 0.05,
    reconversionEfficiency: 0.57,
    lifespanYears: 25,
  },
  large: {
    capacityMW: 100,
    capitalCostEUR: 110_000_000,
    annualOpexEUR: 3_800_000,
    hydrogenProductionKgPerYear: 17_520_000,
    electricityNeededMWhPerKgH2: 0.048,
    reconversionEfficiency: 0.60,
    lifespanYears: 30,
  },
};

export const GRID_CONNECTION_COST_EUR_PER_KM = 180_000; // MV line
export const LAND_COST_BASE_EUR_PER_HA = 15_000;
export const HYDROGEN_MARKET_PRICE_EUR_PER_KG = 4.5; // Green hydrogen 2024
export const ELECTRICITY_SELL_PRICE_CZK_PER_MWH = 1_850; // ~73 EUR/MWh

// Electrolyzer efficiency data
export const ELECTROLYZER_EFFICIENCY = {
  pem: {
    name: "PEM Elektrolyzér",
    efficiency: 0.68, // kWh H2 / kWh electricity
    startupTime: "minutes",
    bestFor: "Variable renewable surplus",
  },
  alkaline: {
    name: "Alkalický elektrolyzér",
    efficiency: 0.72,
    startupTime: "hours",
    bestFor: "Baseload surplus",
  },
};

// Czech state subsidy programs
export const SUBSIDIES = {
  mpo_hydrogen: {
    name: "MPO – Vodíkové technologie",
    maxGrant: 0.45, // 45% of CAPEX
    source: "ERDF/OP TAK",
    deadline: "2026-12-31",
  },
  rep_cz: {
    name: "REPowerEU – Obnovitelný vodík",
    maxGrant: 0.30,
    source: "EU Recovery Fund",
    deadline: "2026-06-30",
  },
};
