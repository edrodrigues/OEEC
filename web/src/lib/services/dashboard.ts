import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  onSnapshot,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface DashboardSummary {
  totalEnergyConsumption: number;
  totalEmissions: number;
  scope1Emissions: number;
  scope2LocationEmissions: number;
  scope2MarketEmissions: number;
  scope3Emissions: number;
  energyIntensity: number;
  renewablePercentage: number;
  tdLossPercentage: number;
  yearOverYearChange: number;
}

export interface MonthlyData {
  month: string;
  consumption: number;
  emissions: number;
}

export interface ScopeBreakdown {
  name: string;
  value: number;
  color: string;
  percentage: number;
}

export async function getDashboardSummary(
  organizationId: string
): Promise<DashboardSummary> {
  const inventoriesSnap = await getDocs(
    query(
      collection(db, "inventories"),
      where("organizationId", "==", organizationId),
      orderBy("year", "desc")
    )
  );

  if (inventoriesSnap.empty) {
    return {
      totalEnergyConsumption: 0,
      totalEmissions: 0,
      scope1Emissions: 0,
      scope2LocationEmissions: 0,
      scope2MarketEmissions: 0,
      scope3Emissions: 0,
      energyIntensity: 0,
      renewablePercentage: 0,
      tdLossPercentage: 0,
      yearOverYearChange: 0,
    };
  }

  const inventories = inventoriesSnap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  }));
  const latestInventory = inventories[0];

  const [stationary, electricity, tdLosses, marketBased] =
    await Promise.all([
      getDocs(
        query(
          collection(db, "stationary_combustion"),
          where("inventoryId", "==", latestInventory.id)
        )
      ),
      getDocs(
        query(
          collection(db, "electricity_consumption"),
          where("inventoryId", "==", latestInventory.id)
        )
      ),
      getDocs(
        query(
          collection(db, "td_losses"),
          where("inventoryId", "==", latestInventory.id)
        )
      ),
      getDocs(
        query(
          collection(db, "market_based_energy"),
          where("inventoryId", "==", latestInventory.id)
        )
      ),
    ]);

  const scope1 = stationary.docs.reduce(
    (sum, d) => sum + (d.data().emissionCO2e || 0),
    0
  );
  const scope2Location = electricity.docs.reduce(
    (sum, d) => sum + (d.data().totalEmissions || 0),
    0
  );
  const scope2Market = marketBased.docs.reduce(
    (sum, d) => sum + (d.data().totalEmissions || 0),
    0
  );
  const scope3 = tdLosses.docs.reduce(
    (sum, d) => sum + (d.data().totalCO2e || 0),
    0
  );
  const totalEmissions = scope1 + scope2Location + scope2Market + scope3;

  const totalEnergy =
    electricity.docs.reduce(
      (sum, d) => sum + (d.data().annualConsumption || 0),
      0
    ) +
    marketBased.docs.reduce(
      (sum, d) => sum + (d.data().annualEnergy || 0),
      0
    );

  const renewableEnergy = marketBased.docs.reduce((sum, d) => {
    const data = d.data();
    return (
      sum +
      (data.renewablePercentage
        ? (data.annualEnergy * data.renewablePercentage) / 100
        : 0)
    );
  }, 0);

  const tdLossTotal = tdLosses.docs.reduce(
    (sum, d) => sum + (d.data().annualLosses || 0),
    0
  );
  const tdLossPercentage =
    totalEnergy > 0 ? (tdLossTotal / totalEnergy) * 100 : 0;

  const renewablePercentage =
    totalEnergy > 0 ? (renewableEnergy / totalEnergy) * 100 : 0;

  const orgDoc = await getDoc(doc(db, "organizations", organizationId));
  const orgData = orgDoc.exists() ? orgDoc.data() : null;
  const builtArea = orgData?.builtArea || 0;
  const energyIntensity =
    totalEnergy > 0 && builtArea > 0 ? totalEnergy / builtArea : 0;

  const yoyResults = await getYearOverYearComparison(organizationId);
  let yearOverYearChange = 0;
  if (yoyResults.length >= 2) {
    const latest = yoyResults[yoyResults.length - 1].emissions;
    const previous = yoyResults[yoyResults.length - 2].emissions;
    yearOverYearChange = previous > 0 ? ((latest - previous) / previous) * 100 : 0;
  }

  return {
    totalEnergyConsumption: totalEnergy,
    totalEmissions,
    scope1Emissions: scope1,
    scope2LocationEmissions: scope2Location,
    scope2MarketEmissions: scope2Market,
    scope3Emissions: scope3,
    energyIntensity,
    renewablePercentage,
    tdLossPercentage,
    yearOverYearChange,
  };
}

export function subscribeToInventory(
  inventoryId: string,
  callback: (data: Record<string, unknown>) => void
) {
  const unsubscribers: (() => void)[] = [];

  const collections = [
    "stationary_combustion",
    "electricity_consumption",
    "td_losses",
    "thermal_energy",
    "market_based_energy",
  ];

  collections.forEach((col) => {
    const q = query(
      collection(db, col),
      where("inventoryId", "==", inventoryId)
    );
    const unsub = onSnapshot(q, () => {
      callback({ collection: col, updatedAt: new Date() });
    });
    unsubscribers.push(unsub);
  });

  return () => unsubscribers.forEach((unsub) => unsub());
}

export async function getScopeBreakdown(
  inventoryId: string
): Promise<ScopeBreakdown[]> {
  const [stationary, electricity, tdLosses, thermal, marketBased] =
    await Promise.all([
      getDocs(
        query(
          collection(db, "stationary_combustion"),
          where("inventoryId", "==", inventoryId)
        )
      ),
      getDocs(
        query(
          collection(db, "electricity_consumption"),
          where("inventoryId", "==", inventoryId)
        )
      ),
      getDocs(
        query(
          collection(db, "td_losses"),
          where("inventoryId", "==", inventoryId)
        )
      ),
      getDocs(
        query(
          collection(db, "thermal_energy"),
          where("inventoryId", "==", inventoryId)
        )
      ),
      getDocs(
        query(
          collection(db, "market_based_energy"),
          where("inventoryId", "==", inventoryId)
        )
      ),
    ]);

  const scope1 = stationary.docs.reduce(
    (sum, d) => sum + (d.data().emissionCO2e || 0),
    0
  );
  const scope2 =
    electricity.docs.reduce(
      (sum, d) => sum + (d.data().totalEmissions || 0),
      0
    ) +
    marketBased.docs.reduce(
      (sum, d) => sum + (d.data().totalEmissions || 0),
      0
    );
  const scope3 = tdLosses.docs.reduce(
    (sum, d) => sum + (d.data().totalCO2e || 0),
    0
  );
  const thermalEmissions = thermal.docs.reduce(
    (sum, d) => sum + (d.data().totalCO2e || 0),
    0
  );

  const total = scope1 + scope2 + scope3 + thermalEmissions;

  return [
    {
      name: "Escopo 1",
      value: scope1,
      color: "#efc13e",
      percentage: total > 0 ? (scope1 / total) * 100 : 0,
    },
    {
      name: "Escopo 2",
      value: scope2,
      color: "#765b00",
      percentage: total > 0 ? (scope2 / total) * 100 : 0,
    },
    {
      name: "Escopo 3",
      value: scope3,
      color: "#5f5e5e",
      percentage: total > 0 ? (scope3 / total) * 100 : 0,
    },
    {
      name: "Energia Térmica",
      value: thermalEmissions,
      color: "#615e55",
      percentage: total > 0 ? (thermalEmissions / total) * 100 : 0,
    },
  ];
}

export async function getMonthlyTrend(
  inventoryId: string
): Promise<MonthlyData[]> {
  const electricitySnap = await getDocs(
    query(
      collection(db, "electricity_consumption"),
      where("inventoryId", "==", inventoryId)
    )
  );

  const months = [
    "Jan",
    "Fev",
    "Mar",
    "Abr",
    "Mai",
    "Jun",
    "Jul",
    "Ago",
    "Set",
    "Out",
    "Nov",
    "Dez",
  ];

  if (electricitySnap.empty) {
    return months.map((m) => ({ month: m, consumption: 0, emissions: 0 }));
  }

  const records = electricitySnap.docs.map((d) => d.data());
  const monthlyConsumption: Record<string, number> = {};
  const monthlyEmissions: Record<string, number> = {};

  records.forEach((record) => {
    const monthly = record.monthlyConsumption || {};
    const factors = record.sinFactors || {};
    months.forEach((m) => {
      monthlyConsumption[m] =
        (monthlyConsumption[m] || 0) + (monthly[m] || 0);
      monthlyEmissions[m] =
        (monthlyEmissions[m] || 0) + (monthly[m] || 0) * (factors[m] || 0);
    });
  });

  return months.map((m) => ({
    month: m,
    consumption: monthlyConsumption[m] || 0,
    emissions: monthlyEmissions[m] || 0,
  }));
}

export async function getYearOverYearComparison(
  organizationId: string
): Promise<{ year: number; emissions: number; energy: number }[]> {
  const inventoriesSnap = await getDocs(
    query(
      collection(db, "inventories"),
      where("organizationId", "==", organizationId),
      orderBy("year", "asc")
    )
  );

  const results: { year: number; emissions: number; energy: number }[] = [];

  for (const invDoc of inventoriesSnap.docs) {
    const inv = invDoc.data();
    const invId = invDoc.id;

    const [stationary, electricity, tdLosses, marketBased] = await Promise.all([
      getDocs(
        query(
          collection(db, "stationary_combustion"),
          where("inventoryId", "==", invId)
        )
      ),
      getDocs(
        query(
          collection(db, "electricity_consumption"),
          where("inventoryId", "==", invId)
        )
      ),
      getDocs(
        query(
          collection(db, "td_losses"),
          where("inventoryId", "==", invId)
        )
      ),
      getDocs(
        query(
          collection(db, "market_based_energy"),
          where("inventoryId", "==", invId)
        )
      ),
    ]);

    const emissions =
      stationary.docs.reduce(
        (sum, d) => sum + (d.data().emissionCO2e || 0),
        0
      ) +
      electricity.docs.reduce(
        (sum, d) => sum + (d.data().totalEmissions || 0),
        0
      ) +
      tdLosses.docs.reduce((sum, d) => sum + (d.data().totalCO2e || 0), 0) +
      marketBased.docs.reduce(
        (sum, d) => sum + (d.data().totalEmissions || 0),
        0
      );

    const energy =
      electricity.docs.reduce(
        (sum, d) => sum + (d.data().annualConsumption || 0),
        0
      ) +
      marketBased.docs.reduce(
        (sum, d) => sum + (d.data().annualEnergy || 0),
        0
      );

    results.push({ year: inv.year, emissions, energy });
  }

  return results;
}

export async function getFuelBreakdown(
  inventoryId: string
): Promise<{ fuel: string; emissions: number }[]> {
  const stationarySnap = await getDocs(
    query(
      collection(db, "stationary_combustion"),
      where("inventoryId", "==", inventoryId)
    )
  );

  const breakdown: Record<string, number> = {};
  stationarySnap.docs.forEach((d) => {
    const data = d.data();
    const fuel = data.fuelType || "Outro";
    breakdown[fuel] = (breakdown[fuel] || 0) + (data.emissionCO2e || 0);
  });

  return Object.entries(breakdown)
    .map(([fuel, emissions]) => ({ fuel, emissions }))
    .sort((a, b) => b.emissions - a.emissions);
}
