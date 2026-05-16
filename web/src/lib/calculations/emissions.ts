export const GWP = {
  CO2: 1,
  CH4: 27.2,
  N2O: 273,
} as const;

export interface EmissionResult {
  co2: number;
  ch4: number;
  n2o: number;
  co2e: number;
  biogenicCO2: number;
}

export function calculateStationaryCombustion(
  quantity: number,
  factorCO2: number,
  factorCH4: number,
  factorN2O: number,
  conversionFactor: number = 1,
  isBiogenic: boolean = false
): EmissionResult {
  const adjustedQuantity = quantity * conversionFactor;
  const co2 = adjustedQuantity * factorCO2;
  const ch4 = adjustedQuantity * factorCH4;
  const n2o = adjustedQuantity * factorN2O;
  const co2e = co2 * GWP.CO2 + ch4 * GWP.CH4 + n2o * GWP.N2O;
  const biogenicCO2 = isBiogenic ? co2 : 0;

  return { co2, ch4, n2o, co2e, biogenicCO2 };
}

export function calculateElectricityEmissions(
  consumptionMWh: number,
  sinFactor: number
): EmissionResult {
  const co2e = consumptionMWh * sinFactor;
  return { co2: co2e, ch4: 0, n2o: 0, co2e, biogenicCO2: 0 };
}

export function calculateTDLosses(
  lossesMWh: number,
  sinFactor: number,
  totalConsumptionMWh: number
): EmissionResult & { lossPercentage: number } {
  const co2e = lossesMWh * sinFactor;
  const lossPercentage =
    totalConsumptionMWh > 0 ? (lossesMWh / totalConsumptionMWh) * 100 : 0;

  return {
    co2: co2e,
    ch4: 0,
    n2o: 0,
    co2e,
    biogenicCO2: 0,
    lossPercentage,
  };
}

export function calculateThermalEnergy(
  steamPurchasedGJ: number,
  boilerEfficiency: number,
  factorCO2: number,
  factorCH4: number,
  factorN2O: number,
  isBiogenic: boolean = false
): EmissionResult {
  if (boilerEfficiency <= 0) {
    return { co2: 0, ch4: 0, n2o: 0, co2e: 0, biogenicCO2: 0 };
  }
  const estimatedConsumption = steamPurchasedGJ / (boilerEfficiency / 100);
  const co2 = estimatedConsumption * factorCO2;
  const ch4 = estimatedConsumption * factorCH4;
  const n2o = estimatedConsumption * factorN2O;
  const co2e = co2 * GWP.CO2 + ch4 * GWP.CH4 + n2o * GWP.N2O;
  const biogenicCO2 = isBiogenic ? co2 : 0;

  return { co2, ch4, n2o, co2e, biogenicCO2 };
}

export function calculateMarketBased(
  energyMWh: number,
  emissionFactor: number
): EmissionResult {
  const co2e = energyMWh * emissionFactor;
  return { co2: co2e, ch4: 0, n2o: 0, co2e, biogenicCO2: 0 };
}

export function calculateRenewablePercentage(
  renewableMWh: number,
  totalMWh: number
): number {
  if (totalMWh === 0) return 0;
  return (renewableMWh / totalMWh) * 100;
}

export const renewableGenerationTypes = [
  "Solar",
  "Eólica",
  "Biomassa",
  "Hídrica",
  "Geotérmica",
];

export function isRenewable(generationType: string): boolean {
  return renewableGenerationTypes.includes(generationType);
}

export interface ValidationResult {
  isValid: boolean;
  warnings: string[];
  errors: string[];
}

export function validateConsumptionData(
  currentValue: number,
  previousValue: number | null,
  fieldName: string
): ValidationResult {
  const warnings: string[] = [];
  const errors: string[] = [];

  if (currentValue < 0) {
    errors.push(`${fieldName} não pode ser negativo.`);
  }

  if (previousValue !== null && previousValue > 0) {
    const change = ((currentValue - previousValue) / previousValue) * 100;
    if (change > 500) {
      warnings.push(
        `${fieldName} aumentou ${change.toFixed(0)}% em relação ao período anterior. Verifique o valor.`
      );
    } else if (change < -80) {
      warnings.push(
        `${fieldName} diminuiu ${Math.abs(change).toFixed(0)}% em relação ao período anterior. Verifique o valor.`
      );
    }
  }

  return {
    isValid: errors.length === 0,
    warnings,
    errors,
  };
}
