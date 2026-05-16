export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  organizationId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type UserRole = "admin" | "editor" | "viewer" | "auditor";

export interface Organization {
  id: string;
  name: string;
  cnpj: string;
  sector: string;
  organizationType: OrganizationType;
  city: string;
  state: string;
  size: OrganizationSize;
  unitsCount: number;
  population?: number;
  builtArea?: number;
  employeesCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

export type OrganizationType =
  | "public"
  | "private"
  | "industry"
  | "municipality"
  | "concessionaire";

export type OrganizationSize = "micro" | "small" | "medium" | "large" | "enterprise";

export interface OperationalUnit {
  id: string;
  organizationId: string;
  name: string;
  city: string;
  state: string;
  address: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuditLog {
  id: string;
  userId: string;
  organizationId: string;
  action: string;
  entity: string;
  entityId: string;
  changes: Record<string, unknown>;
  timestamp: Date;
}
