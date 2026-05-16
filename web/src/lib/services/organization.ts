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
  type FirestoreDataConverter,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Organization, OperationalUnit, User, AuditLog } from "@/types";

const ORGANIZATIONS_COLLECTION = "organizations";
const UNITS_COLLECTION = "operational_units";
const AUDIT_COLLECTION = "audit_logs";

export async function getOrganization(id: string) {
  const snap = await getDoc(doc(db, ORGANIZATIONS_COLLECTION, id));
  return snap.exists() ? (snap.data() as Organization) : null;
}

export async function getOrganizationsByUserId(userId: string) {
  const q = query(
    collection(db, ORGANIZATIONS_COLLECTION),
    where("ownerId", "==", userId)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Organization[];
}

export async function createOrganization(
  data: Omit<Organization, "id" | "createdAt" | "updatedAt">,
  ownerId: string
) {
  const ref = doc(collection(db, ORGANIZATIONS_COLLECTION));
  await setDoc(ref, {
    ...data,
    id: ref.id,
    ownerId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateOrganization(
  id: string,
  data: Partial<Organization>
) {
  await updateDoc(doc(db, ORGANIZATIONS_COLLECTION, id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteOrganization(id: string) {
  await deleteDoc(doc(db, ORGANIZATIONS_COLLECTION, id));
}

export async function getOperationalUnits(organizationId: string) {
  const q = query(
    collection(db, UNITS_COLLECTION),
    where("organizationId", "==", organizationId),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() })) as OperationalUnit[];
}

export async function createOperationalUnit(
  organizationId: string,
  data: Omit<OperationalUnit, "id" | "createdAt" | "updatedAt">
) {
  const ref = doc(collection(db, UNITS_COLLECTION));
  await setDoc(ref, {
    ...data,
    id: ref.id,
    organizationId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateOperationalUnit(
  id: string,
  data: Partial<OperationalUnit>
) {
  await updateDoc(doc(db, UNITS_COLLECTION, id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteOperationalUnit(id: string) {
  await deleteDoc(doc(db, UNITS_COLLECTION, id));
}

export async function logAudit(
  data: Omit<AuditLog, "id" | "timestamp">
) {
  const ref = doc(collection(db, AUDIT_COLLECTION));
  await setDoc(ref, {
    ...data,
    id: ref.id,
    timestamp: serverTimestamp(),
  });
}

export async function getUser(id: string) {
  const snap = await getDoc(doc(db, "users", id));
  return snap.exists() ? (snap.data() as User) : null;
}

export async function getUsersByOrganization(organizationId: string) {
  const q = query(
    collection(db, "users"),
    where("organizationId", "==", organizationId)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() })) as User[];
}

export async function updateUserRole(userId: string, role: User["role"]) {
  await updateDoc(doc(db, "users", userId), {
    role,
    updatedAt: serverTimestamp(),
  });
}
