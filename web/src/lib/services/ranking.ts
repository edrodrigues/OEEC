import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface RankingEntry {
  id: string;
  organizationId: string;
  organizationName: string;
  city: string;
  state: string;
  sector: string;
  organizationType: string;
  size: string;
  year: number;
  scoreTotal: number;
  tier: "A" | "B" | "C" | "D" | "E";
  breakdown: RankingBreakdown;
  sealUrl: string;
  position?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface RankingBreakdown {
  energyConsumption: number;
  energyIntensity: number;
  scope2Location: number;
  scope2Market: number;
  renewablePercentage: number;
  tdLosses: number;
  dataQuality: number;
}

export const RANKING_WEIGHTS = {
  energyConsumption: 0.15,
  energyIntensity: 0.2,
  scope2Location: 0.15,
  scope2Market: 0.15,
  renewablePercentage: 0.15,
  tdLosses: 0.1,
  dataQuality: 0.1,
};

const RANKING_COLLECTION = "rankings";

export function calculateTier(score: number): "A" | "B" | "C" | "D" | "E" {
  if (score >= 85) return "A";
  if (score >= 70) return "B";
  if (score >= 55) return "C";
  if (score >= 40) return "D";
  return "E";
}

export function calculateScore(breakdown: RankingBreakdown): number {
  return (
    breakdown.energyConsumption * RANKING_WEIGHTS.energyConsumption +
    breakdown.energyIntensity * RANKING_WEIGHTS.energyIntensity +
    breakdown.scope2Location * RANKING_WEIGHTS.scope2Location +
    breakdown.scope2Market * RANKING_WEIGHTS.scope2Market +
    breakdown.renewablePercentage * RANKING_WEIGHTS.renewablePercentage +
    breakdown.tdLosses * RANKING_WEIGHTS.tdLosses +
    breakdown.dataQuality * RANKING_WEIGHTS.dataQuality
  );
}

export async function getRankings(year?: number, sector?: string) {
  let q = query(
    collection(db, RANKING_COLLECTION),
    orderBy("scoreTotal", "desc")
  );

  if (year) {
    q = query(
      collection(db, RANKING_COLLECTION),
      where("year", "==", year),
      orderBy("scoreTotal", "desc")
    );
  }

  const snap = await getDocs(q);
  let results = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as RankingEntry[];

  if (sector) {
    results = results.filter((r) => r.sector === sector);
  }

  return results.map((r, i) => ({ ...r, position: i + 1 }));
}

export async function getOrganizationRanking(organizationId: string) {
  const q = query(
    collection(db, RANKING_COLLECTION),
    where("organizationId", "==", organizationId),
    orderBy("year", "desc")
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return { id: snap.docs[0].id, ...snap.docs[0].data() } as RankingEntry;
}

export async function createOrUpdateRanking(
  organizationId: string,
  organizationName: string,
  city: string,
  state: string,
  sector: string,
  organizationType: string,
  size: string,
  year: number,
  breakdown: RankingBreakdown
): Promise<string> {
  const scoreTotal = calculateScore(breakdown);
  const tier = calculateTier(scoreTotal);

  const existingQ = query(
    collection(db, RANKING_COLLECTION),
    where("organizationId", "==", organizationId),
    where("year", "==", year)
  );
  const existingSnap = await getDocs(existingQ);

  if (!existingSnap.empty) {
    const existingId = existingSnap.docs[0].id;
    await updateDoc(doc(db, RANKING_COLLECTION, existingId), {
      scoreTotal,
      tier,
      breakdown,
      updatedAt: serverTimestamp(),
    });
    return existingId;
  }

  const ref = doc(collection(db, RANKING_COLLECTION));
  await setDoc(ref, {
    id: ref.id,
    organizationId,
    organizationName,
    city,
    state,
    sector,
    organizationType,
    size,
    year,
    scoreTotal,
    tier,
    breakdown,
    sealUrl: `/seals/${tier.toLowerCase()}.svg`,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getRankingByRegion(state: string, year: number) {
  const q = query(
    collection(db, RANKING_COLLECTION),
    where("state", "==", state),
    where("year", "==", year),
    orderBy("scoreTotal", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() })) as RankingEntry[];
}
