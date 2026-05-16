import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface Inventory {
  id: string;
  organizationId: string;
  year: number;
  organizationName: string;
  address: string;
  technicalResponsible: string;
  responsibleRole: string;
  contactPhone: string;
  contactEmail: string;
  operationalUnit: string;
  city: string;
  state: string;
  sector: string;
  organizationType: string;
  status: "draft" | "in_progress" | "completed" | "audited";
  notes: string;
  completionPercentage: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface StationaryCombustion {
  id: string;
  inventoryId: string;
  sourceName: string;
  description: string;
  sector: string;
  fuelType: string;
  quantity: number;
  unit: string;
  conversionFactor: number;
  factorCO2: number;
  factorCH4: number;
  factorN2O: number;
  emissionCO2: number;
  emissionCH4: number;
  emissionN2O: number;
  emissionCO2e: number;
  biogenicCO2: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ElectricityConsumption {
  id: string;
  inventoryId: string;
  description: string;
  location: string;
  monthlyConsumption: Record<string, number>;
  annualConsumption: number;
  sinFactors: Record<string, number>;
  annualSinFactor: number;
  totalEmissions: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface TDLosses {
  id: string;
  inventoryId: string;
  description: string;
  monthlyLosses: Record<string, number>;
  annualLosses: number;
  sinFactor: number;
  emissionCO2: number;
  emissionCH4: number;
  emissionN2O: number;
  totalCO2e: number;
  lossPercentage: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ThermalEnergy {
  id: string;
  inventoryId: string;
  description: string;
  fuelType: string;
  boilerEfficiency: number;
  steamPurchasedGJ: number;
  estimatedEnergyConsumption: number;
  factorCO2: number;
  factorCH4: number;
  factorN2O: number;
  emissionCO2: number;
  emissionCH4: number;
  emissionN2O: number;
  totalCO2e: number;
  biogenicCO2: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface MarketBasedEnergy {
  id: string;
  inventoryId: string;
  description: string;
  generationType: string;
  fuelSource: string;
  hasOwnFactor: boolean;
  plantEfficiency: number;
  monthlyEnergy: Record<string, number>;
  annualEnergy: number;
  supplierEmissionFactor: number;
  suggestedFactor: number;
  totalEmissions: number;
  renewablePercentage: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmissionFactor {
  id: string;
  category: string;
  fuelSource: string;
  unit: string;
  factorCO2: number;
  factorCH4: number;
  factorN2O: number;
  gwpCO2: number;
  gwpCH4: number;
  gwpN2O: number;
  year: number;
  source: string;
  isActive: boolean;
}

export interface ConsumptionRecord {
  id: string;
  inventoryId: string;
  unitId: string;
  entryType: string;
  quantity: number;
  unitOfMeasure: string;
  monthYear: string;
  calculatedEmissions: Record<string, number>;
  attachmentUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const INVENTORIES_COLLECTION = "inventories";
const STATIONARY_COMBUSTION_COLLECTION = "stationary_combustion";
const ELECTRICITY_COLLECTION = "electricity_consumption";
const TD_LOSSES_COLLECTION = "td_losses";
const THERMAL_ENERGY_COLLECTION = "thermal_energy";
const MARKET_BASED_COLLECTION = "market_based_energy";
const EMISSION_FACTORS_COLLECTION = "emission_factors";
const CONSUMPTION_RECORDS_COLLECTION = "consumption_records";

export async function getInventories(organizationId: string) {
  const q = query(
    collection(db, INVENTORIES_COLLECTION),
    where("organizationId", "==", organizationId),
    orderBy("year", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Inventory[];
}

export async function getInventory(id: string) {
  const snap = await getDoc(doc(db, INVENTORIES_COLLECTION, id));
  return snap.exists() ? (snap.data() as Inventory) : null;
}

export async function createInventory(
  data: Omit<Inventory, "id" | "createdAt" | "updatedAt" | "completionPercentage" | "status">
) {
  const ref = doc(collection(db, INVENTORIES_COLLECTION));
  await setDoc(ref, {
    ...data,
    id: ref.id,
    status: "draft",
    completionPercentage: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateInventory(id: string, data: Partial<Inventory>) {
  await updateDoc(doc(db, INVENTORIES_COLLECTION, id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteInventory(id: string) {
  await deleteDoc(doc(db, INVENTORIES_COLLECTION, id));
}

export async function getStationaryCombustion(inventoryId: string) {
  const q = query(
    collection(db, STATIONARY_COMBUSTION_COLLECTION),
    where("inventoryId", "==", inventoryId)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() })) as StationaryCombustion[];
}

export async function createStationaryCombustion(
  data: Omit<StationaryCombustion, "id" | "createdAt" | "updatedAt">
) {
  const ref = doc(collection(db, STATIONARY_COMBUSTION_COLLECTION));
  await setDoc(ref, {
    ...data,
    id: ref.id,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateStationaryCombustion(
  id: string,
  data: Partial<StationaryCombustion>
) {
  await updateDoc(doc(db, STATIONARY_COMBUSTION_COLLECTION, id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteStationaryCombustion(id: string) {
  await deleteDoc(doc(db, STATIONARY_COMBUSTION_COLLECTION, id));
}

export async function getElectricityConsumption(inventoryId: string) {
  const q = query(
    collection(db, ELECTRICITY_COLLECTION),
    where("inventoryId", "==", inventoryId)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() })) as ElectricityConsumption[];
}

export async function createElectricityConsumption(
  data: Omit<ElectricityConsumption, "id" | "createdAt" | "updatedAt">
) {
  const ref = doc(collection(db, ELECTRICITY_COLLECTION));
  await setDoc(ref, {
    ...data,
    id: ref.id,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateElectricityConsumption(
  id: string,
  data: Partial<ElectricityConsumption>
) {
  await updateDoc(doc(db, ELECTRICITY_COLLECTION, id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteElectricityConsumption(id: string) {
  await deleteDoc(doc(db, ELECTRICITY_COLLECTION, id));
}

export async function getTDLosses(inventoryId: string) {
  const q = query(
    collection(db, TD_LOSSES_COLLECTION),
    where("inventoryId", "==", inventoryId)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() })) as TDLosses[];
}

export async function createTDLosses(
  data: Omit<TDLosses, "id" | "createdAt" | "updatedAt">
) {
  const ref = doc(collection(db, TD_LOSSES_COLLECTION));
  await setDoc(ref, {
    ...data,
    id: ref.id,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateTDLosses(id: string, data: Partial<TDLosses>) {
  await updateDoc(doc(db, TD_LOSSES_COLLECTION, id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteTDLosses(id: string) {
  await deleteDoc(doc(db, TD_LOSSES_COLLECTION, id));
}

export async function getThermalEnergy(inventoryId: string) {
  const q = query(
    collection(db, THERMAL_ENERGY_COLLECTION),
    where("inventoryId", "==", inventoryId)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() })) as ThermalEnergy[];
}

export async function createThermalEnergy(
  data: Omit<ThermalEnergy, "id" | "createdAt" | "updatedAt">
) {
  const ref = doc(collection(db, THERMAL_ENERGY_COLLECTION));
  await setDoc(ref, {
    ...data,
    id: ref.id,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateThermalEnergy(
  id: string,
  data: Partial<ThermalEnergy>
) {
  await updateDoc(doc(db, THERMAL_ENERGY_COLLECTION, id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteThermalEnergy(id: string) {
  await deleteDoc(doc(db, THERMAL_ENERGY_COLLECTION, id));
}

export async function getMarketBasedEnergy(inventoryId: string) {
  const q = query(
    collection(db, MARKET_BASED_COLLECTION),
    where("inventoryId", "==", inventoryId)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() })) as MarketBasedEnergy[];
}

export async function createMarketBasedEnergy(
  data: Omit<MarketBasedEnergy, "id" | "createdAt" | "updatedAt">
) {
  const ref = doc(collection(db, MARKET_BASED_COLLECTION));
  await setDoc(ref, {
    ...data,
    id: ref.id,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateMarketBasedEnergy(
  id: string,
  data: Partial<MarketBasedEnergy>
) {
  await updateDoc(doc(db, MARKET_BASED_COLLECTION, id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteMarketBasedEnergy(id: string) {
  await deleteDoc(doc(db, MARKET_BASED_COLLECTION, id));
}

export async function getEmissionFactors(category?: string) {
  let q = query(
    collection(db, EMISSION_FACTORS_COLLECTION),
    where("isActive", "==", true)
  );
  if (category) {
    q = query(
      collection(db, EMISSION_FACTORS_COLLECTION),
      where("isActive", "==", true),
      where("category", "==", category)
    );
  }
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() })) as EmissionFactor[];
}

export async function getEmissionFactor(id: string) {
  const snap = await getDoc(doc(db, EMISSION_FACTORS_COLLECTION, id));
  return snap.exists() ? (snap.data() as EmissionFactor) : null;
}

export async function createEmissionFactor(
  data: Omit<EmissionFactor, "id">
) {
  const ref = doc(collection(db, EMISSION_FACTORS_COLLECTION));
  await setDoc(ref, { ...data, id: ref.id });
  return ref.id;
}

export async function updateEmissionFactor(
  id: string,
  data: Partial<EmissionFactor>
) {
  await updateDoc(doc(db, EMISSION_FACTORS_COLLECTION, id), data);
}

export async function deleteEmissionFactor(id: string) {
  await deleteDoc(doc(db, EMISSION_FACTORS_COLLECTION, id));
}

export async function getConsumptionRecords(inventoryId: string) {
  const q = query(
    collection(db, CONSUMPTION_RECORDS_COLLECTION),
    where("inventoryId", "==", inventoryId),
    orderBy("monthYear", "asc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() })) as ConsumptionRecord[];
}

export async function createConsumptionRecord(
  data: Omit<ConsumptionRecord, "id" | "createdAt" | "updatedAt">
) {
  const ref = doc(collection(db, CONSUMPTION_RECORDS_COLLECTION));
  await setDoc(ref, {
    ...data,
    id: ref.id,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateConsumptionRecord(
  id: string,
  data: Partial<ConsumptionRecord>
) {
  await updateDoc(doc(db, CONSUMPTION_RECORDS_COLLECTION, id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteConsumptionRecord(id: string) {
  await deleteDoc(doc(db, CONSUMPTION_RECORDS_COLLECTION, id));
}
