import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface ESGIndicator {
  id: string;
  organizationId: string;
  year: number;
  environmental: EnvironmentalScore;
  social: SocialScore;
  governance: GovernanceScore;
  overallScore: number;
  odsAlignment: ODSAlignment;
  createdAt: Date;
  updatedAt: Date;
}

export interface EnvironmentalScore {
  energyIntensity: number;
  carbonIntensity: number;
  renewablePercentage: number;
  wasteManagement: number;
  waterUsage: number;
  biodiversity: number;
  totalScore: number;
}

export interface SocialScore {
  workforceDiversity: number;
  employeeSafety: number;
  communityEngagement: number;
  trainingHours: number;
  laborPractices: number;
  humanRights: number;
  wasteManagement: number;
  waterUsage: number;
  biodiversity: number;
  totalScore: number;
}

export interface GovernanceScore {
  boardDiversity: number;
  antiCorruption: number;
  transparency: number;
  riskManagement: number;
  compliance: number;
  ethicsPolicy: number;
  totalScore: number;
}

export interface ODSAlignment {
  ods7: number;
  ods11: number;
  ods12: number;
  ods13: number;
  ods15: number;
}

export interface BenchmarkData {
  sector: string;
  metric: string;
  average: number;
  percentile25: number;
  percentile75: number;
  top10: number;
}

const ESG_COLLECTION = "esg_indicators";
const BENCHMARK_COLLECTION = "benchmarks";

export async function getESGData(
  organizationId: string,
  year?: number
): Promise<ESGIndicator | null> {
  let q = query(
    collection(db, ESG_COLLECTION),
    where("organizationId", "==", organizationId),
    orderBy("year", "desc")
  );

  if (year) {
    q = query(
      collection(db, ESG_COLLECTION),
      where("organizationId", "==", organizationId),
      where("year", "==", year),
      orderBy("year", "desc")
    );
  }

  const snap = await getDocs(q);
  if (snap.empty) return null;
  return { id: snap.docs[0].id, ...snap.docs[0].data() } as ESGIndicator;
}

export async function getESGHistory(organizationId: string) {
  const q = query(
    collection(db, ESG_COLLECTION),
    where("organizationId", "==", organizationId),
    orderBy("year", "asc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() })) as ESGIndicator[];
}

export async function calculateAndSaveESG(
  organizationId: string,
  inventoryId: string,
  year: number,
  socialData: Partial<SocialScore>,
  governanceData: Partial<GovernanceScore>,
  environmentalData?: Partial<EnvironmentalScore>
): Promise<string> {
  const stationarySnap = await getDocs(
    query(
      collection(db, "stationary_combustion"),
      where("inventoryId", "==", inventoryId)
    )
  );
  const electricitySnap = await getDocs(
    query(
      collection(db, "electricity_consumption"),
      where("inventoryId", "==", inventoryId)
    )
  );
  const marketBasedSnap = await getDocs(
    query(
      collection(db, "market_based_energy"),
      where("inventoryId", "==", inventoryId)
    )
  );

  const scope1 = stationarySnap.docs.reduce(
    (sum, d) => sum + (d.data().emissionCO2e || 0),
    0
  );
  const scope2 = electricitySnap.docs.reduce(
    (sum, d) => sum + (d.data().totalEmissions || 0),
    0
  );
  const totalEnergy = electricitySnap.docs.reduce(
    (sum, d) => sum + (d.data().annualConsumption || 0),
    0
  );
  const totalEmissions = scope1 + scope2;

  const renewableEnergy = marketBasedSnap.docs.reduce((sum, d) => {
    const data = d.data();
    return (
      sum +
      (data.renewablePercentage
        ? (data.annualEnergy * data.renewablePercentage) / 100
        : 0)
    );
  }, 0);

  const renewablePercentage =
    totalEnergy > 0 ? (renewableEnergy / totalEnergy) * 100 : 0;

  const energyIntensity = totalEnergy > 0 ? totalEnergy : 0;
  const carbonIntensity = totalEnergy > 0 ? totalEmissions / totalEnergy : 0;

  const envScore: EnvironmentalScore = {
    energyIntensity: Math.max(0, 100 - energyIntensity * 0.01),
    carbonIntensity: Math.max(0, 100 - carbonIntensity * 10),
    renewablePercentage,
    wasteManagement: environmentalData?.wasteManagement || 0,
    waterUsage: environmentalData?.waterUsage || 0,
    biodiversity: environmentalData?.biodiversity || 0,
    totalScore: 0,
  };
  envScore.totalScore =
    (envScore.energyIntensity +
      envScore.carbonIntensity +
      envScore.renewablePercentage +
      envScore.wasteManagement +
      envScore.waterUsage +
      envScore.biodiversity) /
    6;

  const socialScore: SocialScore = {
    workforceDiversity: socialData.workforceDiversity || 0,
    employeeSafety: socialData.employeeSafety || 0,
    communityEngagement: socialData.communityEngagement || 0,
    trainingHours: socialData.trainingHours || 0,
    laborPractices: socialData.laborPractices || 0,
    humanRights: socialData.humanRights || 0,
    wasteManagement: socialData.wasteManagement || 0,
    waterUsage: socialData.waterUsage || 0,
    biodiversity: socialData.biodiversity || 0,
    totalScore: 0,
  };
  socialScore.totalScore =
    (socialScore.workforceDiversity +
      socialScore.employeeSafety +
      socialScore.communityEngagement +
      socialScore.trainingHours +
      socialScore.laborPractices +
      socialScore.humanRights +
      socialScore.wasteManagement +
      socialScore.waterUsage +
      socialScore.biodiversity) /
    9;

  const governanceScore: GovernanceScore = {
    boardDiversity: governanceData.boardDiversity || 0,
    antiCorruption: governanceData.antiCorruption || 0,
    transparency: governanceData.transparency || 0,
    riskManagement: governanceData.riskManagement || 0,
    compliance: governanceData.compliance || 0,
    ethicsPolicy: governanceData.ethicsPolicy || 0,
    totalScore: 0,
  };
  governanceScore.totalScore =
    (governanceScore.boardDiversity +
      governanceScore.antiCorruption +
      governanceScore.transparency +
      governanceScore.riskManagement +
      governanceScore.compliance +
      governanceScore.ethicsPolicy) /
    6;

  const overallScore =
    (envScore.totalScore * 0.5 +
      socialScore.totalScore * 0.25 +
      governanceScore.totalScore * 0.25);

  const odsAlignment: ODSAlignment = {
    ods7: renewablePercentage,
    ods11: Math.max(0, 100 - carbonIntensity * 5),
    ods12: Math.max(0, 100 - energyIntensity * 0.005),
    ods13: Math.max(0, 100 - totalEmissions * 0.01),
    ods15: envScore.biodiversity,
  };

  const ref = doc(collection(db, ESG_COLLECTION));
  await setDoc(ref, {
    id: ref.id,
    organizationId,
    year,
    environmental: envScore,
    social: socialScore,
    governance: governanceScore,
    overallScore,
    odsAlignment,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return ref.id;
}

export async function updateESGIndicator(
  id: string,
  data: Partial<ESGIndicator>
) {
  await updateDoc(doc(db, ESG_COLLECTION, id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function getBenchmarks(sector: string) {
  const q = query(
    collection(db, BENCHMARK_COLLECTION),
    where("sector", "==", sector)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data()) as BenchmarkData[];
}
