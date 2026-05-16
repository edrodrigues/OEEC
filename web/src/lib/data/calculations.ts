import { GWP } from "@/lib/data/emission-factors";
import type { MonthlyData } from "@/lib/data/inventory-types";

export function emptyMonthly(): MonthlyData {
  return { jan: 0, fev: 0, mar: 0, abr: 0, mai: 0, jun: 0, jul: 0, ago: 0, set: 0, out: 0, nov: 0, dez: 0 };
}

export function sumMonthly(data: MonthlyData | undefined): number {
  if (!data) return 0;
  return Object.values(data).reduce((a, b) => a + b, 0);
}

export function calculateEmissions(
  quantity: number,
  factorCO2: number,
  factorCH4: number,
  factorN2O: number
): { co2: number; ch4: number; n2o: number; co2e: number } {
  const co2 = quantity * factorCO2 / 1000;
  const ch4 = quantity * (factorCH4 || 0) / 1000;
  const n2o = quantity * (factorN2O || 0) / 1000;
  const co2e = co2 + ch4 * GWP.CH4 + n2o * GWP.N2O;
  return { co2, ch4, n2o, co2e };
}

export function calculateStationaryEmissions(
  quantity: number,
  unit: string,
  fossilFuel: string | null,
  biofuel: string | null,
  fossilFactors: { co2: number; ch4: number; n2o: number } | null,
  biofuelFactors: { co2: number; ch4: number; n2o: number } | null
): { fossilCO2e: number; biofuelCO2e: number; totalCO2e: number; biogenicCO2: number; fossilQuantity: number; biofuelQuantity: number } {
  const fossilQty = fossilFuel ? quantity : 0;
  const biofuelQty = biofuel ? quantity : 0;

  let fossilCO2e = 0;
  let biofuelCO2e = 0;
  let biogenicCO2 = 0;

  if (fossilFactors && fossilQty > 0) {
    const e = calculateEmissions(fossilQty, fossilFactors.co2, fossilFactors.ch4 || 0, fossilFactors.n2o || 0);
    fossilCO2e = e.co2e;
  }

  if (biofuelFactors && biofuelQty > 0) {
    const e = calculateEmissions(biofuelQty, biofuelFactors.co2, biofuelFactors.ch4 || 0, biofuelFactors.n2o || 0);
    biofuelCO2e = e.co2e;
    biogenicCO2 = biofuelQty * biofuelFactors.co2 / 1000;
  }

  return {
    fossilCO2e,
    biofuelCO2e,
    totalCO2e: fossilCO2e + biofuelCO2e,
    biogenicCO2,
    fossilQuantity: fossilQty,
    biofuelQuantity: biofuelQty,
  };
}

export function calculateMonthlyEmissions(
  monthlyData: MonthlyData,
  factorCO2: number,
  factorCH4: number,
  factorN2O: number
): { monthly: number[]; total: number } {
  const monthly = Object.values(monthlyData).map((qty) => {
    const e = calculateEmissions(qty, factorCO2, factorCH4, factorN2O);
    return e.co2e;
  });
  const total = monthly.reduce((a, b) => a + b, 0);
  return { monthly, total };
}

export function calculateDistanceEmissions(
  distanceKm: number,
  factorCO2PerKm: number,
  factorCH4PerKm: number,
  factorN2OPerKm: number,
  passengers: number = 1
): { co2: number; ch4: number; n2o: number; co2e: number } {
  const totalDistance = distanceKm * passengers;
  const co2 = totalDistance * factorCO2PerKm / 1000;
  const ch4 = totalDistance * (factorCH4PerKm || 0) / 1000;
  const n2o = totalDistance * (factorN2OPerKm || 0) / 1000;
  const co2e = co2 + ch4 * GWP.CH4 + n2o * GWP.N2O;
  return { co2, ch4, n2o, co2e };
}

export function calculateRemoteWorkEmissions(
  employees: number,
  remoteDaysPerWeek: number,
  electricityPerEmployeeMWh: number,
  emissionFactorTPerMWh: number
): { totalElectricity: number; totalCO2e: number } {
  const workDaysPerYear = 230;
  const remoteDaysPerYear = (remoteDaysPerWeek / 5) * workDaysPerYear;
  const dailyElectricity = electricityPerEmployeeMWh / workDaysPerYear;
  const totalElectricity = employees * dailyElectricity * remoteDaysPerYear;
  const totalCO2e = totalElectricity * emissionFactorTPerMWh;
  return { totalElectricity, totalCO2e };
}

export function isRenewable(generationType: string): boolean {
  return ["Solar", "Eólica", "Biomassa", "Hídrica", "Geotérmica"].includes(generationType);
}
