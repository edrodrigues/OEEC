"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import {
  getInventories,
  createInventory,
  updateInventory,
  deleteInventory,
  getStationaryCombustion,
  createStationaryCombustion,
  updateStationaryCombustion,
  deleteStationaryCombustion,
  getElectricityConsumption,
  createElectricityConsumption,
  updateElectricityConsumption,
  deleteElectricityConsumption,
  getTDLosses,
  createTDLosses,
  updateTDLosses,
  deleteTDLosses,
  getThermalEnergy,
  createThermalEnergy,
  updateThermalEnergy,
  deleteThermalEnergy,
  getMarketBasedEnergy,
  createMarketBasedEnergy,
  updateMarketBasedEnergy,
  deleteMarketBasedEnergy,
  getEmissionFactors,
  type Inventory,
  type StationaryCombustion,
  type ElectricityConsumption,
  type TDLosses,
  type ThermalEnergy,
  type MarketBasedEnergy,
  type EmissionFactor,
} from "@/lib/services/inventory";
import {
  calculateStationaryCombustion,
  calculateElectricityEmissions,
  calculateTDLosses,
  calculateThermalEnergy,
  calculateMarketBased,
  calculateRenewablePercentage,
  isRenewable,
  validateConsumptionData,
} from "@/lib/calculations/emissions";
import { cn } from "@/lib/utils";
import {
  FileText,
  Flame,
  Zap,
  Cable,
  Factory,
  ShoppingCart,
  Plus,
  Trash2,
  Pencil,
  Check,
  X,
  Loader2,
  AlertTriangle,
  Save,
  BarChart3,
  TrendingUp,
  AlertCircle,
} from "lucide-react";

const MONTHS = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez",
];

const FUEL_TYPES = ["GLP", "Gás Natural", "Diesel", "Óleo Combustível", "Biomassa", "Carvão", "Lenha"];
const UNITS_MAP: Record<string, string[]> = {
  "GLP": ["kg", "L", "m³"],
  "Gás Natural": ["m³", "Nm³"],
  "Diesel": ["L", "m³"],
  "Óleo Combustível": ["L", "m³", "kg"],
  "Biomassa": ["kg", "t"],
  "Carvão": ["kg", "t"],
  "Lenha": ["m³", "kg", "t"],
};

const GENERATION_TYPES = ["Solar", "Eólica", "Biomassa", "Térmica", "Hídrica", "Nuclear", "Gás Natural"];

const SECTORS = ["Industrial", "Comercial", "Residencial", "Público"];

const SUBMODULES = [
  { id: "intro", label: "Introdução", icon: FileText },
  { id: "stationary", label: "Combustão Estacionária", icon: Flame },
  { id: "electricity", label: "Energia Elétrica", icon: Zap },
  { id: "tdlosses", label: "Perdas T&D", icon: Cable },
  { id: "thermal", label: "Energia Térmica", icon: Factory },
  { id: "marketbased", label: "Escolha de Compra", icon: ShoppingCart },
];

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  draft: { label: "Rascunho", color: "bg-[#e4e2e2] text-[#4e4634]" },
  in_progress: { label: "Em andamento", color: "bg-[#efc13e]/10 text-[#765b00]" },
  completed: { label: "Concluído", color: "bg-green-100 text-green-700" },
  audited: { label: "Auditado", color: "bg-blue-100 text-blue-700" },
};

export default function InventoryPage() {
  const { user } = useAuth();
  const [activeSubmodule, setActiveSubmodule] = useState("intro");
  const [inventories, setInventories] = useState<Inventory[]>([]);
  const [selectedInventory, setSelectedInventory] = useState<Inventory | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showNewInventory, setShowNewInventory] = useState(false);
  const [warnings, setWarnings] = useState<string[]>([]);

  const [introForm, setIntroForm] = useState({
    year: new Date().getFullYear(),
    organizationName: "",
    address: "",
    technicalResponsible: "",
    responsibleRole: "",
    contactPhone: "",
    contactEmail: "",
    operationalUnit: "",
    city: "",
    state: "",
    sector: "",
    organizationType: "",
    notes: "",
  });

  const [stationaryRecords, setStationaryRecords] = useState<StationaryCombustion[]>([]);
  const [electricityRecords, setElectricityRecords] = useState<ElectricityConsumption[]>([]);
  const [tdLossRecords, setTdLossRecords] = useState<TDLosses[]>([]);
  const [thermalRecords, setThermalRecords] = useState<ThermalEnergy[]>([]);
  const [marketBasedRecords, setMarketBasedRecords] = useState<MarketBasedEnergy[]>([]);
  const [emissionFactors, setEmissionFactors] = useState<EmissionFactor[]>([]);

  const [editingRecord, setEditingRecord] = useState<string | null>(null);
  const [newRecord, setNewRecord] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.organizationId) return;
    loadData();
  }, [user?.organizationId]);

  useEffect(() => {
    if (selectedInventory) {
      loadInventoryData(selectedInventory.id);
    }
  }, [selectedInventory?.id]);

  async function loadData() {
    setLoading(true);
    const invs = await getInventories(user!.organizationId!);
    setInventories(invs);
    if (invs.length > 0) setSelectedInventory(invs[0]);
    const factors = await getEmissionFactors();
    setEmissionFactors(factors);
    setLoading(false);
  }

  async function loadInventoryData(inventoryId: string) {
    const [stationary, electricity, td, thermal, market] = await Promise.all([
      getStationaryCombustion(inventoryId),
      getElectricityConsumption(inventoryId),
      getTDLosses(inventoryId),
      getThermalEnergy(inventoryId),
      getMarketBasedEnergy(inventoryId),
    ]);
    setStationaryRecords(stationary);
    setElectricityRecords(electricity);
    setTdLossRecords(td);
    setThermalRecords(thermal);
    setMarketBasedRecords(market);
  }

  async function handleCreateInventory() {
    if (!user) return;
    setSaving(true);
    const id = await createInventory({
      organizationId: user.organizationId!,
      ...introForm,
    });
    await loadData();
    setShowNewInventory(false);
    setSaving(false);
  }

  async function handleAddStationary() {
    if (!selectedInventory) return;
    setSaving(true);
    const record: Omit<StationaryCombustion, "id" | "createdAt" | "updatedAt"> = {
      inventoryId: selectedInventory.id,
      sourceName: "",
      description: "",
      sector: "",
      fuelType: "",
      quantity: 0,
      unit: "",
      conversionFactor: 1,
      factorCO2: 0,
      factorCH4: 0,
      factorN2O: 0,
      emissionCO2: 0,
      emissionCH4: 0,
      emissionN2O: 0,
      emissionCO2e: 0,
      biogenicCO2: 0,
    };
    const emissions = calculateStationaryCombustion(
      record.quantity,
      record.factorCO2,
      record.factorCH4,
      record.factorN2O,
      record.conversionFactor
    );
    await createStationaryCombustion({
      ...record,
      ...emissions,
    });
    setNewRecord(null);
    await loadInventoryData(selectedInventory.id);
    setSaving(false);
  }

  async function handleAddElectricity() {
    if (!selectedInventory) return;
    setSaving(true);
    const record: Omit<ElectricityConsumption, "id" | "createdAt" | "updatedAt"> = {
      inventoryId: selectedInventory.id,
      description: "",
      location: "",
      monthlyConsumption: {},
      sinFactors: {},
      annualConsumption: 0,
      annualSinFactor: 0,
      totalEmissions: 0,
    };
    const annualConsumption = Object.values(record.monthlyConsumption).reduce((a, b) => a + b, 0);
    const factors = Object.values(record.sinFactors);
    const annualSinFactor = factors.length > 0 ? factors.reduce((a, b) => a + b, 0) / factors.length : 0;
    const totalEmissions = annualConsumption * annualSinFactor;
    await createElectricityConsumption({
      ...record,
      annualConsumption,
      annualSinFactor,
      totalEmissions,
    });
    setNewRecord(null);
    await loadInventoryData(selectedInventory.id);
    setSaving(false);
  }

  async function handleAddTDLosses() {
    if (!selectedInventory) return;
    setSaving(true);
    const record: Omit<TDLosses, "id" | "createdAt" | "updatedAt"> = {
      inventoryId: selectedInventory.id,
      description: "",
      monthlyLosses: {},
      annualLosses: 0,
      sinFactor: 0,
      emissionCO2: 0,
      emissionCH4: 0,
      emissionN2O: 0,
      totalCO2e: 0,
      lossPercentage: 0,
    };
    const annualLosses = Object.values(record.monthlyLosses).reduce((a, b) => a + b, 0);
    const totalConsumption = electricityRecords.reduce((a, r) => a + r.annualConsumption, 0);
    const result = calculateTDLosses(annualLosses, record.sinFactor, totalConsumption);
    await createTDLosses({
      ...record,
      annualLosses,
      ...result,
    });
    setNewRecord(null);
    await loadInventoryData(selectedInventory.id);
    setSaving(false);
  }

  async function handleAddThermal() {
    if (!selectedInventory) return;
    setSaving(true);
    const record: Omit<ThermalEnergy, "id" | "createdAt" | "updatedAt"> = {
      inventoryId: selectedInventory.id,
      description: "",
      fuelType: "",
      boilerEfficiency: 0,
      steamPurchasedGJ: 0,
      estimatedEnergyConsumption: 0,
      factorCO2: 0,
      factorCH4: 0,
      factorN2O: 0,
      emissionCO2: 0,
      emissionCH4: 0,
      emissionN2O: 0,
      totalCO2e: 0,
      biogenicCO2: 0,
    };
    const emissions = calculateThermalEnergy(
      record.steamPurchasedGJ,
      record.boilerEfficiency,
      record.factorCO2,
      record.factorCH4,
      record.factorN2O
    );
    await createThermalEnergy({
      ...record,
      estimatedEnergyConsumption: record.steamPurchasedGJ / (record.boilerEfficiency / 100),
      ...emissions,
    });
    setNewRecord(null);
    await loadInventoryData(selectedInventory.id);
    setSaving(false);
  }

  async function handleAddMarketBased() {
    if (!selectedInventory) return;
    setSaving(true);
    const record: Omit<MarketBasedEnergy, "id" | "createdAt" | "updatedAt"> = {
      inventoryId: selectedInventory.id,
      description: "",
      generationType: "",
      fuelSource: "",
      hasOwnFactor: false,
      plantEfficiency: 0,
      monthlyEnergy: {},
      annualEnergy: 0,
      supplierEmissionFactor: 0,
      suggestedFactor: 0,
      totalEmissions: 0,
      renewablePercentage: 0,
    };
    const annualEnergy = Object.values(record.monthlyEnergy).reduce((a, b) => a + b, 0);
    const factor = record.hasOwnFactor ? record.supplierEmissionFactor : record.suggestedFactor;
    const totalEmissions = annualEnergy * factor;
    const renewableMonthly = Object.entries(record.monthlyEnergy).reduce((acc, [month, energy]) => {
      return acc + (isRenewable(record.generationType) ? energy : 0);
    }, 0);
    const renewablePercentage = calculateRenewablePercentage(renewableMonthly, annualEnergy);
    await createMarketBasedEnergy({
      ...record,
      annualEnergy,
      totalEmissions,
      renewablePercentage,
    });
    setNewRecord(null);
    await loadInventoryData(selectedInventory.id);
    setSaving(false);
  }

  function calculateCompletionPercentage(): number {
    if (!selectedInventory) return 0;
    let completed = 0;
    const total = 5;
    if (selectedInventory.year && selectedInventory.technicalResponsible) completed++;
    if (stationaryRecords.length > 0) completed++;
    if (electricityRecords.length > 0) completed++;
    if (tdLossRecords.length > 0) completed++;
    if (thermalRecords.length > 0 || marketBasedRecords.length > 0) completed++;
    return Math.round((completed / total) * 100);
  }

  const totalEmissions =
    stationaryRecords.reduce((a, r) => a + r.emissionCO2e, 0) +
    electricityRecords.reduce((a, r) => a + r.totalEmissions, 0) +
    tdLossRecords.reduce((a, r) => a + r.totalCO2e, 0) +
    thermalRecords.reduce((a, r) => a + r.totalCO2e, 0) +
    marketBasedRecords.reduce((a, r) => a + r.totalEmissions, 0);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#efc13e]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1b1c1c] sm:text-3xl">
            Inventário Energético
          </h1>
          <p className="mt-1 text-[#4e4634]">
            Registre e gerencie seu inventário de consumo energético por escopo.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedInventory?.id || ""}
            onChange={(e) => {
              const inv = inventories.find((i) => i.id === e.target.value);
              setSelectedInventory(inv || null);
            }}
            className="rounded-lg border border-[#d1c5ae] bg-white px-3 py-2 text-sm focus:border-[#efc13e] focus:outline-none"
          >
            <option value="">Selecionar inventário...</option>
            {inventories.map((inv) => (
              <option key={inv.id} value={inv.id}>
                Inventário {inv.year}
              </option>
            ))}
          </select>

          <button
            onClick={() => setShowNewInventory(true)}
            className="flex items-center gap-2 rounded-lg bg-[#efc13e] px-4 py-2 text-sm font-semibold text-[#1b1c1c] transition-all hover:scale-[1.02]"
          >
            <Plus className="h-4 w-4" />
            Novo Inventário
          </button>
        </div>
      </div>

      {showNewInventory && (
        <div className="rounded-xl border border-[#efc13e]/30 bg-[#fffcf0] p-4">
          <h3 className="mb-3 text-sm font-semibold text-[#765b00]">Novo Inventário</h3>
          <div className="grid gap-3 sm:grid-cols-3">
            <input
              type="number"
              placeholder="Ano"
              value={introForm.year}
              onChange={(e) => setIntroForm({ ...introForm, year: Number(e.target.value) })}
              className="rounded-lg border border-[#d1c5ae] bg-white px-3 py-2 text-sm"
            />
            <input
              placeholder="Responsável técnico"
              value={introForm.technicalResponsible}
              onChange={(e) => setIntroForm({ ...introForm, technicalResponsible: e.target.value })}
              className="rounded-lg border border-[#d1c5ae] bg-white px-3 py-2 text-sm"
            />
            <input
              placeholder="Cargo"
              value={introForm.responsibleRole}
              onChange={(e) => setIntroForm({ ...introForm, responsibleRole: e.target.value })}
              className="rounded-lg border border-[#d1c5ae] bg-white px-3 py-2 text-sm"
            />
          </div>
          <div className="mt-3 flex gap-2">
            <button
              onClick={handleCreateInventory}
              disabled={saving || !introForm.year || !introForm.technicalResponsible}
              className={cn(
                "flex items-center gap-1 rounded-lg bg-[#efc13e] px-3 py-1.5 text-sm font-medium text-[#1b1c1c]",
                (!introForm.year || !introForm.technicalResponsible || saving) && "cursor-not-allowed opacity-50"
              )}
            >
              <Check className="h-3.5 w-3.5" />
              Criar
            </button>
            <button
              onClick={() => setShowNewInventory(false)}
              className="flex items-center gap-1 rounded-lg border border-[#d1c5ae] px-3 py-1.5 text-sm text-[#4e4634]"
            >
              <X className="h-3.5 w-3.5" />
              Cancelar
            </button>
          </div>
        </div>
      )}

      {selectedInventory && (
        <>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-[#4e4634]">Progresso do inventário</span>
                <span className="font-semibold text-[#765b00]">{calculateCompletionPercentage()}%</span>
              </div>
              <div className="mt-1 h-2 overflow-hidden rounded-full bg-[#e4e2e2]">
                <div
                  className="h-full rounded-full bg-[#efc13e] transition-all"
                  style={{ width: `${calculateCompletionPercentage()}%` }}
                />
              </div>
            </div>

            <span
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium",
                STATUS_MAP[selectedInventory.status]?.color
              )}
            >
              {STATUS_MAP[selectedInventory.status]?.label}
            </span>
          </div>

          {warnings.length > 0 && (
            <div className="rounded-lg border border-[#efc13e]/30 bg-[#fffcf0] p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 text-[#765b00]" />
                <div>
                  <p className="text-sm font-medium text-[#765b00]">Alertas de validação</p>
                  <ul className="mt-1 space-y-1">
                    {warnings.map((w, i) => (
                      <li key={i} className="text-xs text-[#4e4634]">{w}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-1 overflow-x-auto rounded-xl border border-[#d1c5ae]/20 bg-white p-1">
            {SUBMODULES.map((sub) => (
              <button
                key={sub.id}
                onClick={() => setActiveSubmodule(sub.id)}
                className={cn(
                  "flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  activeSubmodule === sub.id
                    ? "bg-[#efc13e] text-[#1b1c1c]"
                    : "text-[#4e4634] hover:bg-[#f5f3f3]"
                )}
              >
                <sub.icon className="h-4 w-4" />
                {sub.label}
              </button>
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-4">
            <SummaryCard
              title="Emissões Totais"
              value={totalEmissions.toFixed(1)}
              unit="tCO₂e"
              icon={BarChart3}
            />
            <SummaryCard
              title="Escopo 1"
              value={stationaryRecords.reduce((a, r) => a + r.emissionCO2e, 0).toFixed(1)}
              unit="tCO₂e"
              icon={Flame}
            />
            <SummaryCard
              title="Escopo 2"
              value={(
                electricityRecords.reduce((a, r) => a + r.totalEmissions, 0) +
                marketBasedRecords.reduce((a, r) => a + r.totalEmissions, 0)
              ).toFixed(1)}
              unit="tCO₂e"
              icon={Zap}
            />
            <SummaryCard
              title="Escopo 3"
              value={tdLossRecords.reduce((a, r) => a + r.totalCO2e, 0).toFixed(1)}
              unit="tCO₂e"
              icon={Cable}
            />
          </div>

          {activeSubmodule === "intro" && <IntroTab inventory={selectedInventory} />}

          {activeSubmodule === "stationary" && (
            <StationaryTab
              records={stationaryRecords}
              emissionFactors={emissionFactors}
              newRecord={newRecord === "stationary"}
              setNewRecord={setNewRecord}
              onAdd={handleAddStationary}
              saving={saving}
            />
          )}

          {activeSubmodule === "electricity" && (
            <ElectricityTab
              records={electricityRecords}
              newRecord={newRecord === "electricity"}
              setNewRecord={setNewRecord}
              onAdd={handleAddElectricity}
              saving={saving}
            />
          )}

          {activeSubmodule === "tdlosses" && (
            <TDLossesTab
              records={tdLossRecords}
              newRecord={newRecord === "tdlosses"}
              setNewRecord={setNewRecord}
              onAdd={handleAddTDLosses}
              saving={saving}
            />
          )}

          {activeSubmodule === "thermal" && (
            <ThermalTab
              records={thermalRecords}
              newRecord={newRecord === "thermal"}
              setNewRecord={setNewRecord}
              onAdd={handleAddThermal}
              saving={saving}
            />
          )}

          {activeSubmodule === "marketbased" && (
            <MarketBasedTab
              records={marketBasedRecords}
              newRecord={newRecord === "marketbased"}
              setNewRecord={setNewRecord}
              onAdd={handleAddMarketBased}
              saving={saving}
            />
          )}
        </>
      )}

      {!selectedInventory && !showNewInventory && (
        <div className="flex min-h-[60vh] flex-col items-center justify-center">
          <FileText className="h-12 w-12 text-[#d1c5ae]" />
          <h2 className="mt-4 text-lg font-semibold text-[#1b1c1c]">
            Nenhum inventário encontrado
          </h2>
          <p className="mt-1 text-sm text-[#4e4634]">
            Crie um novo inventário para começar.
          </p>
        </div>
      )}
    </div>
  );
}

function SummaryCard({ title, value, unit, icon: Icon }: { title: string; value: string; unit: string; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="rounded-xl border border-[#d1c5ae]/20 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-[#765b00]" />
        <span className="text-xs font-medium text-[#4e4634]">{title}</span>
      </div>
      <div className="mt-1 flex items-baseline gap-1">
        <span className="text-xl font-bold text-[#1b1c1c]">{value}</span>
        <span className="text-xs text-[#807662]">{unit}</span>
      </div>
    </div>
  );
}

function IntroTab({ inventory }: { inventory: Inventory }) {
  return (
    <div className="rounded-xl border border-[#d1c5ae]/20 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-[#1b1c1c]">
        Introdução / Cadastro do Inventário
      </h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <InfoField label="Ano inventariado" value={inventory.year.toString()} />
        <InfoField label="Organização" value={inventory.organizationName} />
        <InfoField label="Responsável técnico" value={inventory.technicalResponsible} />
        <InfoField label="Cargo" value={inventory.responsibleRole} />
        <InfoField label="Telefone" value={inventory.contactPhone} />
        <InfoField label="E-mail" value={inventory.contactEmail} />
        <InfoField label="Unidade operacional" value={inventory.operationalUnit} />
        <InfoField label="Cidade / Estado" value={`${inventory.city}/${inventory.state}`} />
        <InfoField label="Setor" value={inventory.sector} />
        <InfoField label="Tipo" value={inventory.organizationType} />
      </div>
      {inventory.notes && (
        <div className="mt-4">
          <label className="block text-sm font-medium text-[#4e4634]">Observações</label>
          <p className="mt-1 rounded-lg bg-[#f5f3f3] p-3 text-sm text-[#1b1c1c]">{inventory.notes}</p>
        </div>
      )}
    </div>
  );
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="block text-sm font-medium text-[#4e4634]">{label}</label>
      <p className="mt-1 rounded-lg bg-[#f5f3f3] px-3 py-2 text-sm text-[#1b1c1c]">
        {value || "—"}
      </p>
    </div>
  );
}

function StationaryTab({ records, emissionFactors, newRecord, setNewRecord, onAdd, saving }: {
  records: StationaryCombustion[];
  emissionFactors: EmissionFactor[];
  newRecord: boolean;
  setNewRecord: (v: string | null) => void;
  onAdd: () => void;
  saving: boolean;
}) {
  const [form, setForm] = useState({
    sourceName: "",
    description: "",
    sector: "",
    fuelType: "",
    quantity: 0,
    unit: "",
    conversionFactor: 1,
    factorCO2: 0,
    factorCH4: 0,
    factorN2O: 0,
  });

  function handleFuelChange(fuel: string) {
    setForm({ ...form, fuelType: fuel, unit: "" });
    const factor = emissionFactors.find((f) => f.fuelSource === fuel);
    if (factor) {
      setForm((prev) => ({
        ...prev,
        fuelType: fuel,
        factorCO2: factor.factorCO2,
        factorCH4: factor.factorCH4,
        factorN2O: factor.factorN2O,
      }));
    }
  }

  const emissions = calculateStationaryCombustion(
    form.quantity, form.factorCO2, form.factorCH4, form.factorN2O, form.conversionFactor
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[#1b1c1c]">Combustão Estacionária (Escopo 1)</h2>
        <button
          onClick={() => setNewRecord("stationary")}
          className="flex items-center gap-2 rounded-lg bg-[#efc13e] px-4 py-2 text-sm font-semibold text-[#1b1c1c] hover:scale-[1.02]"
        >
          <Plus className="h-4 w-4" />
          Novo Registro
        </button>
      </div>

      {newRecord && (
        <div className="rounded-xl border border-[#efc13e]/30 bg-[#fffcf0] p-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <input placeholder="Nome da fonte" value={form.sourceName} onChange={(e) => setForm({ ...form, sourceName: e.target.value })} className="rounded-lg border border-[#d1c5ae] bg-white px-3 py-2 text-sm" />
            <select value={form.fuelType} onChange={(e) => handleFuelChange(e.target.value)} className="rounded-lg border border-[#d1c5ae] bg-white px-3 py-2 text-sm">
              <option value="">Combustível...</option>
              {FUEL_TYPES.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
            <select value={form.sector} onChange={(e) => setForm({ ...form, sector: e.target.value })} className="rounded-lg border border-[#d1c5ae] bg-white px-3 py-2 text-sm">
              <option value="">Setor...</option>
              {SECTORS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <input type="number" placeholder="Quantidade" value={form.quantity || ""} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })} className="rounded-lg border border-[#d1c5ae] bg-white px-3 py-2 text-sm" />
            <select value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} className="rounded-lg border border-[#d1c5ae] bg-white px-3 py-2 text-sm">
              <option value="">Unidade...</option>
              {(UNITS_MAP[form.fuelType] || ["kg", "L", "m³", "t"]).map((u) => <option key={u} value={u}>{u}</option>)}
            </select>
            <input type="number" placeholder="Fator de conversão" value={form.conversionFactor} onChange={(e) => setForm({ ...form, conversionFactor: Number(e.target.value) })} className="rounded-lg border border-[#d1c5ae] bg-white px-3 py-2 text-sm" />
          </div>
          <div className="mt-3 flex items-center gap-4 rounded-lg bg-white p-3">
            <span className="text-xs font-medium text-[#4e4634]">Emissões calculadas:</span>
            <span className="text-xs text-[#1b1c1c]">CO₂: {emissions.co2.toFixed(2)}</span>
            <span className="text-xs text-[#1b1c1c]">CH₄: {emissions.ch4.toFixed(4)}</span>
            <span className="text-xs text-[#1b1c1c]">N₂O: {emissions.n2o.toFixed(4)}</span>
            <span className="text-xs font-semibold text-[#765b00]">CO₂e: {emissions.co2e.toFixed(2)}</span>
          </div>
          <div className="mt-3 flex gap-2">
            <button onClick={onAdd} disabled={saving || !form.sourceName || !form.fuelType} className={cn("flex items-center gap-1 rounded-lg bg-[#efc13e] px-3 py-1.5 text-sm font-medium text-[#1b1c1c]", (!form.sourceName || !form.fuelType || saving) && "cursor-not-allowed opacity-50")}>
              <Check className="h-3.5 w-3.5" />
              Adicionar
            </button>
            <button onClick={() => setNewRecord(null)} className="flex items-center gap-1 rounded-lg border border-[#d1c5ae] px-3 py-1.5 text-sm text-[#4e4634]">
              <X className="h-3.5 w-3.5" />
              Cancelar
            </button>
          </div>
        </div>
      )}

      {records.length === 0 && !newRecord ? (
        <div className="rounded-xl border border-dashed border-[#d1c5ae] bg-white p-8 text-center">
          <Flame className="mx-auto h-8 w-8 text-[#d1c5ae]" />
          <p className="mt-2 text-sm text-[#4e4634]">Nenhum registro de combustão estacionária.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[#d1c5ae]/20 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-[#e4e2e2] bg-[#f5f3f3]">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-[#4e4634]">Fonte</th>
                <th className="px-4 py-3 text-left font-medium text-[#4e4634]">Combustível</th>
                <th className="px-4 py-3 text-left font-medium text-[#4e4634]">Qtd</th>
                <th className="px-4 py-3 text-left font-medium text-[#4e4634]">CO₂</th>
                <th className="px-4 py-3 text-left font-medium text-[#4e4634]">CH₄</th>
                <th className="px-4 py-3 text-left font-medium text-[#4e4634]">N₂O</th>
                <th className="px-4 py-3 text-left font-medium text-[#4e4634]">CO₂e</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.id} className="border-b border-[#e4e2e2]/50 last:border-0">
                  <td className="px-4 py-3 font-medium text-[#1b1c1c]">{r.sourceName}</td>
                  <td className="px-4 py-3 text-[#4e4634]">{r.fuelType}</td>
                  <td className="px-4 py-3 text-[#4e4634]">{r.quantity} {r.unit}</td>
                  <td className="px-4 py-3 text-[#4e4634]">{r.emissionCO2.toFixed(2)}</td>
                  <td className="px-4 py-3 text-[#4e4634]">{r.emissionCH4.toFixed(4)}</td>
                  <td className="px-4 py-3 text-[#4e4634]">{r.emissionN2O.toFixed(4)}</td>
                  <td className="px-4 py-3 font-semibold text-[#765b00]">{r.emissionCO2e.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function ElectricityTab({ records, newRecord, setNewRecord, onAdd, saving }: {
  records: ElectricityConsumption[];
  newRecord: boolean;
  setNewRecord: (v: string | null) => void;
  onAdd: () => void;
  saving: boolean;
}) {
  const [form, setForm] = useState({
    description: "",
    location: "",
    monthlyConsumption: {} as Record<string, number>,
    sinFactors: {} as Record<string, number>,
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[#1b1c1c]">Energia Elétrica — Localização (Escopo 2)</h2>
        <button onClick={() => setNewRecord("electricity")} className="flex items-center gap-2 rounded-lg bg-[#efc13e] px-4 py-2 text-sm font-semibold text-[#1b1c1c] hover:scale-[1.02]">
          <Plus className="h-4 w-4" />
          Novo Registro
        </button>
      </div>

      {newRecord && (
        <div className="rounded-xl border border-[#efc13e]/30 bg-[#fffcf0] p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <input placeholder="Descrição" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="rounded-lg border border-[#d1c5ae] bg-white px-3 py-2 text-sm" />
            <input placeholder="Localização" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="rounded-lg border border-[#d1c5ae] bg-white px-3 py-2 text-sm" />
          </div>
          <div className="mt-3">
            <p className="mb-2 text-xs font-medium text-[#4e4634]">Consumo mensal (MWh)</p>
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
              {MONTHS.map((m, i) => (
                <div key={m}>
                  <label className="text-[10px] text-[#807662]">{m}</label>
                  <input
                    type="number"
                    value={form.monthlyConsumption[m] || ""}
                    onChange={(e) => setForm({ ...form, monthlyConsumption: { ...form.monthlyConsumption, [m]: Number(e.target.value) } })}
                    className="w-full rounded border border-[#d1c5ae] bg-white px-2 py-1 text-xs"
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <button onClick={onAdd} disabled={saving || !form.description} className={cn("flex items-center gap-1 rounded-lg bg-[#efc13e] px-3 py-1.5 text-sm font-medium text-[#1b1c1c]", (!form.description || saving) && "cursor-not-allowed opacity-50")}>
              <Check className="h-3.5 w-3.5" />
              Adicionar
            </button>
            <button onClick={() => setNewRecord(null)} className="flex items-center gap-1 rounded-lg border border-[#d1c5ae] px-3 py-1.5 text-sm text-[#4e4634]">
              <X className="h-3.5 w-3.5" />
              Cancelar
            </button>
          </div>
        </div>
      )}

      {records.length === 0 && !newRecord ? (
        <div className="rounded-xl border border-dashed border-[#d1c5ae] bg-white p-8 text-center">
          <Zap className="mx-auto h-8 w-8 text-[#d1c5ae]" />
          <p className="mt-2 text-sm text-[#4e4634]">Nenhum registro de consumo elétrico.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[#d1c5ae]/20 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-[#e4e2e2] bg-[#f5f3f3]">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-[#4e4634]">Descrição</th>
                <th className="px-4 py-3 text-left font-medium text-[#4e4634]">Local</th>
                <th className="px-4 py-3 text-left font-medium text-[#4e4634]">Consumo Anual (MWh)</th>
                <th className="px-4 py-3 text-left font-medium text-[#4e4634]">Fator SIN</th>
                <th className="px-4 py-3 text-left font-medium text-[#4e4634]">Emissões (tCO₂e)</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.id} className="border-b border-[#e4e2e2]/50 last:border-0">
                  <td className="px-4 py-3 font-medium text-[#1b1c1c]">{r.description}</td>
                  <td className="px-4 py-3 text-[#4e4634]">{r.location}</td>
                  <td className="px-4 py-3 text-[#4e4634]">{r.annualConsumption.toFixed(2)}</td>
                  <td className="px-4 py-3 text-[#4e4634]">{r.annualSinFactor.toFixed(4)}</td>
                  <td className="px-4 py-3 font-semibold text-[#765b00]">{r.totalEmissions.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function TDLossesTab({ records, newRecord, setNewRecord, onAdd, saving }: {
  records: TDLosses[];
  newRecord: boolean;
  setNewRecord: (v: string | null) => void;
  onAdd: () => void;
  saving: boolean;
}) {
  const [form, setForm] = useState({
    description: "",
    monthlyLosses: {} as Record<string, number>,
    sinFactor: 0,
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[#1b1c1c]">Perdas T&D (Escopo 3)</h2>
        <button onClick={() => setNewRecord("tdlosses")} className="flex items-center gap-2 rounded-lg bg-[#efc13e] px-4 py-2 text-sm font-semibold text-[#1b1c1c] hover:scale-[1.02]">
          <Plus className="h-4 w-4" />
          Novo Registro
        </button>
      </div>

      {newRecord && (
        <div className="rounded-xl border border-[#efc13e]/30 bg-[#fffcf0] p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <input placeholder="Descrição" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="rounded-lg border border-[#d1c5ae] bg-white px-3 py-2 text-sm" />
            <input type="number" placeholder="Fator SIN" value={form.sinFactor || ""} onChange={(e) => setForm({ ...form, sinFactor: Number(e.target.value) })} className="rounded-lg border border-[#d1c5ae] bg-white px-3 py-2 text-sm" />
          </div>
          <div className="mt-3">
            <p className="mb-2 text-xs font-medium text-[#4e4634]">Perdas mensais (MWh)</p>
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
              {MONTHS.map((m) => (
                <div key={m}>
                  <label className="text-[10px] text-[#807662]">{m}</label>
                  <input type="number" value={form.monthlyLosses[m] || ""} onChange={(e) => setForm({ ...form, monthlyLosses: { ...form.monthlyLosses, [m]: Number(e.target.value) } })} className="w-full rounded border border-[#d1c5ae] bg-white px-2 py-1 text-xs" />
                </div>
              ))}
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <button onClick={onAdd} disabled={saving || !form.description} className={cn("flex items-center gap-1 rounded-lg bg-[#efc13e] px-3 py-1.5 text-sm font-medium text-[#1b1c1c]", (!form.description || saving) && "cursor-not-allowed opacity-50")}>
              <Check className="h-3.5 w-3.5" />
              Adicionar
            </button>
            <button onClick={() => setNewRecord(null)} className="flex items-center gap-1 rounded-lg border border-[#d1c5ae] px-3 py-1.5 text-sm text-[#4e4634]">
              <X className="h-3.5 w-3.5" />
              Cancelar
            </button>
          </div>
        </div>
      )}

      {records.length === 0 && !newRecord ? (
        <div className="rounded-xl border border-dashed border-[#d1c5ae] bg-white p-8 text-center">
          <Cable className="mx-auto h-8 w-8 text-[#d1c5ae]" />
          <p className="mt-2 text-sm text-[#4e4634]">Nenhum registro de perdas T&D.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[#d1c5ae]/20 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-[#e4e2e2] bg-[#f5f3f3]">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-[#4e4634]">Descrição</th>
                <th className="px-4 py-3 text-left font-medium text-[#4e4634]">Perdas Anuais (MWh)</th>
                <th className="px-4 py-3 text-left font-medium text-[#4e4634]">% Perda</th>
                <th className="px-4 py-3 text-left font-medium text-[#4e4634]">Emissões (tCO₂e)</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.id} className="border-b border-[#e4e2e2]/50 last:border-0">
                  <td className="px-4 py-3 font-medium text-[#1b1c1c]">{r.description}</td>
                  <td className="px-4 py-3 text-[#4e4634]">{r.annualLosses.toFixed(2)}</td>
                  <td className="px-4 py-3 text-[#4e4634]">{r.lossPercentage.toFixed(1)}%</td>
                  <td className="px-4 py-3 font-semibold text-[#765b00]">{r.totalCO2e.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function ThermalTab({ records, newRecord, setNewRecord, onAdd, saving }: {
  records: ThermalEnergy[];
  newRecord: boolean;
  setNewRecord: (v: string | null) => void;
  onAdd: () => void;
  saving: boolean;
}) {
  const [form, setForm] = useState({
    description: "",
    fuelType: "",
    boilerEfficiency: 0,
    steamPurchasedGJ: 0,
    factorCO2: 0,
    factorCH4: 0,
    factorN2O: 0,
  });

  const emissions = calculateThermalEnergy(
    form.steamPurchasedGJ, form.boilerEfficiency, form.factorCO2, form.factorCH4, form.factorN2O
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[#1b1c1c]">Compra de Energia Térmica (Escopo 2)</h2>
        <button onClick={() => setNewRecord("thermal")} className="flex items-center gap-2 rounded-lg bg-[#efc13e] px-4 py-2 text-sm font-semibold text-[#1b1c1c] hover:scale-[1.02]">
          <Plus className="h-4 w-4" />
          Novo Registro
        </button>
      </div>

      {newRecord && (
        <div className="rounded-xl border border-[#efc13e]/30 bg-[#fffcf0] p-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <input placeholder="Descrição" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="rounded-lg border border-[#d1c5ae] bg-white px-3 py-2 text-sm" />
            <select value={form.fuelType} onChange={(e) => setForm({ ...form, fuelType: e.target.value })} className="rounded-lg border border-[#d1c5ae] bg-white px-3 py-2 text-sm">
              <option value="">Combustível...</option>
              {FUEL_TYPES.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
            <input type="number" placeholder="Eficiência da caldeira (%)" value={form.boilerEfficiency || ""} onChange={(e) => setForm({ ...form, boilerEfficiency: Number(e.target.value) })} className="rounded-lg border border-[#d1c5ae] bg-white px-3 py-2 text-sm" />
            <input type="number" placeholder="Vapor comprado (GJ)" value={form.steamPurchasedGJ || ""} onChange={(e) => setForm({ ...form, steamPurchasedGJ: Number(e.target.value) })} className="rounded-lg border border-[#d1c5ae] bg-white px-3 py-2 text-sm" />
            <input type="number" placeholder="Fator CO₂" value={form.factorCO2 || ""} onChange={(e) => setForm({ ...form, factorCO2: Number(e.target.value) })} className="rounded-lg border border-[#d1c5ae] bg-white px-3 py-2 text-sm" />
            <input type="number" placeholder="Fator CH₄" value={form.factorCH4 || ""} onChange={(e) => setForm({ ...form, factorCH4: Number(e.target.value) })} className="rounded-lg border border-[#d1c5ae] bg-white px-3 py-2 text-sm" />
          </div>
          <div className="mt-3 flex items-center gap-4 rounded-lg bg-white p-3">
            <span className="text-xs font-medium text-[#4e4634]">Emissões calculadas:</span>
            <span className="text-xs text-[#1b1c1c]">CO₂: {emissions.co2.toFixed(2)}</span>
            <span className="text-xs font-semibold text-[#765b00]">CO₂e: {emissions.co2e.toFixed(2)}</span>
          </div>
          <div className="mt-3 flex gap-2">
            <button onClick={onAdd} disabled={saving || !form.description} className={cn("flex items-center gap-1 rounded-lg bg-[#efc13e] px-3 py-1.5 text-sm font-medium text-[#1b1c1c]", (!form.description || saving) && "cursor-not-allowed opacity-50")}>
              <Check className="h-3.5 w-3.5" />
              Adicionar
            </button>
            <button onClick={() => setNewRecord(null)} className="flex items-center gap-1 rounded-lg border border-[#d1c5ae] px-3 py-1.5 text-sm text-[#4e4634]">
              <X className="h-3.5 w-3.5" />
              Cancelar
            </button>
          </div>
        </div>
      )}

      {records.length === 0 && !newRecord ? (
        <div className="rounded-xl border border-dashed border-[#d1c5ae] bg-white p-8 text-center">
          <Factory className="mx-auto h-8 w-8 text-[#d1c5ae]" />
          <p className="mt-2 text-sm text-[#4e4634]">Nenhum registro de energia térmica.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[#d1c5ae]/20 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-[#e4e2e2] bg-[#f5f3f3]">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-[#4e4634]">Descrição</th>
                <th className="px-4 py-3 text-left font-medium text-[#4e4634]">Combustível</th>
                <th className="px-4 py-3 text-left font-medium text-[#4e4634]">Eficiência</th>
                <th className="px-4 py-3 text-left font-medium text-[#4e4634]">Vapor (GJ)</th>
                <th className="px-4 py-3 text-left font-medium text-[#4e4634]">CO₂e</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.id} className="border-b border-[#e4e2e2]/50 last:border-0">
                  <td className="px-4 py-3 font-medium text-[#1b1c1c]">{r.description}</td>
                  <td className="px-4 py-3 text-[#4e4634]">{r.fuelType}</td>
                  <td className="px-4 py-3 text-[#4e4634]">{r.boilerEfficiency}%</td>
                  <td className="px-4 py-3 text-[#4e4634]">{r.steamPurchasedGJ}</td>
                  <td className="px-4 py-3 font-semibold text-[#765b00]">{r.totalCO2e.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function MarketBasedTab({ records, newRecord, setNewRecord, onAdd, saving }: {
  records: MarketBasedEnergy[];
  newRecord: boolean;
  setNewRecord: (v: string | null) => void;
  onAdd: () => void;
  saving: boolean;
}) {
  const [form, setForm] = useState({
    description: "",
    generationType: "",
    fuelSource: "",
    hasOwnFactor: false,
    plantEfficiency: 0,
    monthlyEnergy: {} as Record<string, number>,
    supplierEmissionFactor: 0,
    suggestedFactor: 0,
  });

  const annualEnergy = Object.values(form.monthlyEnergy).reduce((a, b) => a + b, 0);
  const factor = form.hasOwnFactor ? form.supplierEmissionFactor : form.suggestedFactor;
  const totalEmissions = annualEnergy * factor;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[#1b1c1c]">Escolha de Compra — Market-Based (Escopo 2)</h2>
        <button onClick={() => setNewRecord("marketbased")} className="flex items-center gap-2 rounded-lg bg-[#efc13e] px-4 py-2 text-sm font-semibold text-[#1b1c1c] hover:scale-[1.02]">
          <Plus className="h-4 w-4" />
          Novo Registro
        </button>
      </div>

      {newRecord && (
        <div className="rounded-xl border border-[#efc13e]/30 bg-[#fffcf0] p-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <input placeholder="Descrição" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="rounded-lg border border-[#d1c5ae] bg-white px-3 py-2 text-sm" />
            <select value={form.generationType} onChange={(e) => setForm({ ...form, generationType: e.target.value })} className="rounded-lg border border-[#d1c5ae] bg-white px-3 py-2 text-sm">
              <option value="">Tipo de geração...</option>
              {GENERATION_TYPES.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
            <label className="flex items-center gap-2 rounded-lg border border-[#d1c5ae] bg-white px-3 py-2 text-sm">
              <input type="checkbox" checked={form.hasOwnFactor} onChange={(e) => setForm({ ...form, hasOwnFactor: e.target.checked })} />
              Possui fator próprio?
            </label>
            <input type="number" placeholder="Fator do fornecedor" value={form.supplierEmissionFactor || ""} onChange={(e) => setForm({ ...form, supplierEmissionFactor: Number(e.target.value) })} className="rounded-lg border border-[#d1c5ae] bg-white px-3 py-2 text-sm" />
            <input type="number" placeholder="Fator sugerido" value={form.suggestedFactor || ""} onChange={(e) => setForm({ ...form, suggestedFactor: Number(e.target.value) })} className="rounded-lg border border-[#d1c5ae] bg-white px-3 py-2 text-sm" />
          </div>
          <div className="mt-3">
            <p className="mb-2 text-xs font-medium text-[#4e4634]">Energia mensal (MWh)</p>
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
              {MONTHS.map((m) => (
                <div key={m}>
                  <label className="text-[10px] text-[#807662]">{m}</label>
                  <input type="number" value={form.monthlyEnergy[m] || ""} onChange={(e) => setForm({ ...form, monthlyEnergy: { ...form.monthlyEnergy, [m]: Number(e.target.value) } })} className="w-full rounded border border-[#d1c5ae] bg-white px-2 py-1 text-xs" />
                </div>
              ))}
            </div>
          </div>
          <div className="mt-3 flex items-center gap-4 rounded-lg bg-white p-3">
            <span className="text-xs font-medium text-[#4e4634]">Resumo:</span>
            <span className="text-xs text-[#1b1c1c]">Anual: {annualEnergy.toFixed(2)} MWh</span>
            <span className="text-xs font-semibold text-[#765b00]">CO₂e: {totalEmissions.toFixed(2)}</span>
            {isRenewable(form.generationType) && (
              <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">Renovável</span>
            )}
          </div>
          <div className="mt-3 flex gap-2">
            <button onClick={onAdd} disabled={saving || !form.description} className={cn("flex items-center gap-1 rounded-lg bg-[#efc13e] px-3 py-1.5 text-sm font-medium text-[#1b1c1c]", (!form.description || saving) && "cursor-not-allowed opacity-50")}>
              <Check className="h-3.5 w-3.5" />
              Adicionar
            </button>
            <button onClick={() => setNewRecord(null)} className="flex items-center gap-1 rounded-lg border border-[#d1c5ae] px-3 py-1.5 text-sm text-[#4e4634]">
              <X className="h-3.5 w-3.5" />
              Cancelar
            </button>
          </div>
        </div>
      )}

      {records.length === 0 && !newRecord ? (
        <div className="rounded-xl border border-dashed border-[#d1c5ae] bg-white p-8 text-center">
          <ShoppingCart className="mx-auto h-8 w-8 text-[#d1c5ae]" />
          <p className="mt-2 text-sm text-[#4e4634]">Nenhum registro de escolha de compra.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[#d1c5ae]/20 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-[#e4e2e2] bg-[#f5f3f3]">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-[#4e4634]">Descrição</th>
                <th className="px-4 py-3 text-left font-medium text-[#4e4634]">Geração</th>
                <th className="px-4 py-3 text-left font-medium text-[#4e4634]">Energia Anual (MWh)</th>
                <th className="px-4 py-3 text-left font-medium text-[#4e4634]">Renovável</th>
                <th className="px-4 py-3 text-left font-medium text-[#4e4634]">CO₂e</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.id} className="border-b border-[#e4e2e2]/50 last:border-0">
                  <td className="px-4 py-3 font-medium text-[#1b1c1c]">{r.description}</td>
                  <td className="px-4 py-3 text-[#4e4634]">{r.generationType}</td>
                  <td className="px-4 py-3 text-[#4e4634]">{r.annualEnergy.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    {isRenewable(r.generationType) ? (
                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">{r.renewablePercentage.toFixed(0)}%</span>
                    ) : (
                      <span className="text-[#807662]">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-semibold text-[#765b00]">{r.totalEmissions.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
