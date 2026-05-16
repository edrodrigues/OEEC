export type ReportingMode = "monthly" | "annual";

export type FuelComposition = "fossil" | "biofuel" | "mixed";

export type InventoryStatus = "draft" | "in_progress" | "completed" | "audited";

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
  status: InventoryStatus;
  notes: string;
  completionPercentage: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface MonthlyData {
  jan: number;
  fev: number;
  mar: number;
  abr: number;
  mai: number;
  jun: number;
  jul: number;
  ago: number;
  set: number;
  out: number;
  nov: number;
  dez: number;
}

export interface EmissionResult {
  co2: number;
  ch4: number;
  n2o: number;
  co2e: number;
  biogenicCO2: number;
}

// Stationary Combustion
export interface StationaryCombustionRecord {
  id: string;
  inventoryId: string;
  registryId: string;
  description: string;
  fuel: string;
  quantity: number;
  unit: string;
  fuelComposition: FuelComposition;
  fossilQuantity: number;
  biofuelQuantity: number;
  emissionFactors: {
    fossil: { co2: number; ch4: number; n2o: number };
    biofuel: { co2: number; ch4: number; n2o: number };
  };
  totalCO2e: number;
  biogenicCO2: number;
  createdAt: Date;
  updatedAt: Date;
}

// Mobile Combustion
export interface MobileCombustionRecord {
  id: string;
  inventoryId: string;
  fleetId: string;
  description: string;
  modal: "road" | "rail" | "waterway" | "air";
  calculationMethod: "byFleetType" | "byFuelType" | "byDistance";
  vehicleType?: string;
  fuelType?: string;
  fleetYear?: number;
  reportingMode: ReportingMode;
  monthlyConsumption?: MonthlyData;
  annualConsumption?: number;
  monthlyDistance?: MonthlyData;
  annualDistance?: number;
  averageConsumption?: number;
  consumptionUnit?: string;
  unit: string;
  fossilFuel?: string;
  biofuel?: string;
  emissionFactors: {
    fossil: { co2: number; ch4: number; n2o: number };
    biofuel: { co2: number; ch4: number; n2o: number };
  };
  totalCO2e: number;
  biogenicCO2: number;
  createdAt: Date;
  updatedAt: Date;
}

// Electricity - Location Based
export interface ElectricityLocationRecord {
  id: string;
  inventoryId: string;
  sourceId: string;
  description: string;
  sourceType: "sin" | "electricVehicle" | "isolatedSystem";
  vehicleType?: string;
  reportingMode: ReportingMode;
  monthlyConsumption?: MonthlyData;
  annualConsumption?: number;
  monthlyDistance?: MonthlyData;
  annualDistance?: number;
  averageConsumption?: number;
  consumptionUnit?: string;
  monthlyEmissions?: MonthlyData;
  totalCO2: number;
  totalCH4: number;
  totalN2O: number;
  totalCO2e: number;
  createdAt: Date;
  updatedAt: Date;
}

// Electricity - Market Based
export interface ElectricityMarketRecord {
  id: string;
  inventoryId: string;
  sourceId: string;
  description: string;
  generationType: string;
  fuel: string;
  hasCustomEmissionFactor: boolean;
  plantEfficiency?: number;
  reportingMode: ReportingMode;
  monthlyConsumption?: MonthlyData;
  annualConsumption?: number;
  customEmissionFactors?: { co2: number; ch4: number; n2o: number; biogenicCO2: number };
  suggestedEmissionFactors?: { co2: number; ch4: number; n2o: number; biogenicCO2: number };
  totalCO2: number;
  totalCH4: number;
  totalN2O: number;
  totalCO2e: number;
  totalBiogenicCO2: number;
  createdAt: Date;
  updatedAt: Date;
}

// Business Travel
export interface BusinessTravelRecord {
  id: string;
  inventoryId: string;
  tripId: string;
  description: string;
  travelType: "air" | "rail" | "bus" | "car" | "ferry";
  calculationMethod?: "byAirport" | "byDistance" | "byFleetType" | "byFuelType";
  tripType?: string;
  transportType?: string;
  busType?: string;
  ferryType?: string;
  vehicleType?: string;
  fleetYear?: number;
  passengers?: number;
  segmentDistance?: number;
  segmentsFlown?: number;
  totalDistance?: number;
  reportingMode?: ReportingMode;
  monthlyConsumption?: MonthlyData;
  annualConsumption?: number;
  monthlyDistance?: MonthlyData;
  annualDistance?: number;
  averageConsumption?: number;
  consumptionUnit?: string;
  unit?: string;
  fossilFuel?: string;
  biofuel?: string;
  emissionFactors: {
    co2: number;
    ch4: number;
    n2o: number;
    fossil?: { co2: number; ch4: number; n2o: number };
    biofuel?: { co2: number; ch4: number; n2o: number };
  };
  totalCO2: number;
  totalCH4: number;
  totalN2O: number;
  totalCO2e: number;
  biogenicCO2: number;
  createdAt: Date;
  updatedAt: Date;
}

// Commute (Casa-Trabalho)
export interface CommuteRecord {
  id: string;
  inventoryId: string;
  collaboratorId: string;
  description: string;
  commuteType: "publicTransport" | "privateVehicle" | "remoteWork";
  transportSubType?: "metroRail" | "bus" | "ferry";
  calculationMethod?: "byFleetType" | "byFuelType" | "byDistance";
  vehicleType?: string;
  fleetYear?: number;
  fuelType?: string;
  passengers?: number;
  segmentDistance?: number;
  workDaysPerYear?: number;
  dailyDistance?: number;
  dailyFuelConsumption?: number;
  fuelUnit?: string;
  averageConsumption?: number;
  consumptionUnit?: string;
  reportingMode?: ReportingMode;
  monthlyConsumption?: MonthlyData;
  monthlyDistance?: MonthlyData;
  annualConsumption?: number;
  annualDistance?: number;
  fossilFuel?: string;
  biofuel?: string;
  emissionFactors: {
    co2: number;
    ch4: number;
    n2o: number;
    fossil?: { co2: number; ch4: number; n2o: number };
    biofuel?: { co2: number; ch4: number; n2o: number };
  };
  totalCO2: number;
  totalCH4: number;
  totalN2O: number;
  totalCO2e: number;
  biogenicCO2: number;
  createdAt: Date;
  updatedAt: Date;
}

// Remote Work
export interface RemoteWorkRecord {
  id: string;
  inventoryId: string;
  description: string;
  numberOfEmployees: number;
  remoteDaysPerWeek: number;
  electricityConsumptionPerEmployee: number;
  totalElectricityConsumption: number;
  emissionFactor: number;
  totalCO2: number;
  totalCH4: number;
  totalN2O: number;
  totalCO2e: number;
  createdAt: Date;
  updatedAt: Date;
}

// Inventory totals summary
export interface InventoryTotals {
  scope1: {
    stationaryCombustion: number;
    mobileCombustion: number;
    total: number;
  };
  scope2: {
    locationBased: number;
    marketBased: number;
    total: number;
  };
  scope3: {
    businessTravel: number;
    commute: number;
    total: number;
  };
  grandTotal: number;
  totalBiogenicCO2: number;
}
