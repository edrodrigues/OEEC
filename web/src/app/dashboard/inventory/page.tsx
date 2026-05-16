"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import {
  getInventories,
  createInventory,
  updateInventory,
  getStationaryCombustion,
  createStationaryCombustion,
  deleteStationaryCombustion,
  getElectricityConsumption,
  createElectricityConsumption,
  deleteElectricityConsumption,
  getMarketBasedEnergy,
  createMarketBasedEnergy,
  deleteMarketBasedEnergy,
  getMobileCombustion,
  createMobileCombustion,
  deleteMobileCombustion,
  getBusinessTravel,
  createBusinessTravel,
  deleteBusinessTravel,
  getCommute,
  createCommute,
  deleteCommute,
  getRemoteWork,
  createRemoteWork,
  deleteRemoteWork,
  type Inventory,
} from "@/lib/services/inventory";
import { WizardLayout, type WizardStep } from "@/components/inventory/wizard/WizardLayout";
import { IntroStep } from "@/components/inventory/wizard/steps/IntroStep";
import { StationaryCombustionStep } from "@/components/inventory/wizard/steps/StationaryCombustionStep";
import { MobileCombustionStep } from "@/components/inventory/wizard/steps/MobileCombustionStep";
import { ElectricityLocationStep } from "@/components/inventory/wizard/steps/ElectricityLocationStep";
import { ElectricityMarketStep } from "@/components/inventory/wizard/steps/ElectricityMarketStep";
import { BusinessTravelStep } from "@/components/inventory/wizard/steps/BusinessTravelStep";
import { CommuteStep } from "@/components/inventory/wizard/steps/CommuteStep";
import { ReviewStep } from "@/components/inventory/wizard/steps/ReviewStep";
import { FileText, Flame, Car, Zap, ShoppingCart, Plane, Home, BarChart3, Plus, Loader2 } from "lucide-react";
import type { InventoryTotals } from "@/lib/data/inventory-types";

const WIZARD_STEPS: WizardStep[] = [
  { id: "intro", label: "Introdução", shortLabel: "Intro", icon: FileText },
  { id: "stationary", label: "Comb. Estacionária", shortLabel: "Estacionária", icon: Flame, scope: "Escopo 1" },
  { id: "mobile", label: "Comb. Móvel", shortLabel: "Móvel", icon: Car, scope: "Escopo 1" },
  { id: "electricity-location", label: "Energia (Localização)", shortLabel: "Localização", icon: Zap, scope: "Escopo 2" },
  { id: "electricity-market", label: "Energia (Compra)", shortLabel: "Compra", icon: ShoppingCart, scope: "Escopo 2" },
  { id: "business-travel", label: "Viagens Negócio", shortLabel: "Viagens", icon: Plane, scope: "Escopo 3" },
  { id: "commute", label: "Casa-Trabalho", shortLabel: "Casa-Trab.", icon: Home, scope: "Escopo 3" },
  { id: "review", label: "Revisão", shortLabel: "Revisão", icon: BarChart3 },
];

type SaveStatus = "idle" | "saving" | "saved" | "error";

export default function InventoryPage() {
  const { user } = useAuth();
  const [inventories, setInventories] = useState<Inventory[]>([]);
  const [selectedInventory, setSelectedInventory] = useState<Inventory | null>(null);
  const [selectedId, setSelectedId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showNewInventory, setShowNewInventory] = useState(false);
  const [newInvYear, setNewInvYear] = useState(new Date().getFullYear());

  const [currentStep, setCurrentStep] = useState("intro");
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");

  const [stationaryRecords, setStationaryRecords] = useState<any[]>([]);
  const [mobileRecords, setMobileRecords] = useState<any[]>([]);
  const [electricityLocationRecords, setElectricityLocationRecords] = useState<any[]>([]);
  const [electricityMarketRecords, setElectricityMarketRecords] = useState<any[]>([]);
  const [businessTravelRecords, setBusinessTravelRecords] = useState<any[]>([]);
  const [commuteRecords, setCommuteRecords] = useState<any[]>([]);
  const [remoteWorkRecords, setRemoteWorkRecords] = useState<any[]>([]);

  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pendingIntroChangesRef = useRef<Partial<Inventory> | null>(null);

  useEffect(() => {
    if (!user?.organizationId) return;
    loadInventories();
  }, [user?.organizationId]);

  useEffect(() => {
    if (selectedInventory) {
      setSelectedId(selectedInventory.id);
      loadAllRecords(selectedInventory.id);
    }
  }, [selectedInventory?.id]);

  useEffect(() => {
    if (!selectedInventory || currentStep === "intro" || currentStep === "review") return;
    const changes = pendingIntroChangesRef.current;
    if (!changes) return;

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      try {
        setSaveStatus("saving");
        await updateInventory(selectedInventory.id, changes);
        setSelectedInventory((prev) => prev ? { ...prev, ...changes } : null);
        pendingIntroChangesRef.current = null;
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 2000);
      } catch {
        setSaveStatus("error");
        setTimeout(() => setSaveStatus("idle"), 3000);
      }
    }, 3000);

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [selectedInventory, currentStep, stationaryRecords.length, mobileRecords.length, electricityLocationRecords.length, electricityMarketRecords.length, businessTravelRecords.length, commuteRecords.length, remoteWorkRecords.length]);

  async function loadInventories() {
    setLoading(true);
    try {
      const invs = await getInventories(user!.organizationId!);
      setInventories(invs);
      if (invs.length > 0) {
        setSelectedInventory(invs[0]);
        setSelectedId(invs[0].id);
      }
    } catch {
      setSaveStatus("error");
    } finally {
      setLoading(false);
    }
  }

  async function loadAllRecords(inventoryId: string) {
    try {
      const [stationary, mobile, elecLoc, elecMarket, bizTravel, commute, remote] = await Promise.all([
        getStationaryCombustion(inventoryId),
        getMobileCombustion(inventoryId),
        getElectricityConsumption(inventoryId),
        getMarketBasedEnergy(inventoryId),
        getBusinessTravel(inventoryId),
        getCommute(inventoryId),
        getRemoteWork(inventoryId),
      ]);
      setStationaryRecords(stationary);
      setMobileRecords(mobile);
      setElectricityLocationRecords(elecLoc);
      setElectricityMarketRecords(elecMarket);
      setBusinessTravelRecords(bizTravel);
      setCommuteRecords(commute);
      setRemoteWorkRecords(remote);
    } catch {
      setSaveStatus("error");
    }
  }

  async function handleCreateInventory() {
    if (!user) return;
    setCreating(true);
    try {
      const id = await createInventory({
        organizationId: user.organizationId!,
        year: newInvYear,
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
      const newInv: Inventory = {
        id,
        organizationId: user.organizationId!,
        year: newInvYear,
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
        status: "draft",
        notes: "",
        completionPercentage: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setInventories((prev) => [newInv, ...prev]);
      setSelectedInventory(newInv);
      setSelectedId(id);
      setCurrentStep("intro");
      setCompletedSteps([]);
      setShowNewInventory(false);
    } catch {
      setSaveStatus("error");
    } finally {
      setCreating(false);
    }
  }

  function handleIntroSave(data: Partial<Inventory>) {
    if (!selectedInventory) return;
    pendingIntroChangesRef.current = { ...pendingIntroChangesRef.current, ...data };
    setSelectedInventory((prev) => prev ? { ...prev, ...data } : null);
  }

  async function withSaveStatus(fn: () => Promise<void>) {
    try {
      setSaveStatus("saving");
      await fn();
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  }

  async function handleAddStationary(record: any) {
    if (!selectedInventory) return;
    await withSaveStatus(async () => {
      await createStationaryCombustion({ ...record, inventoryId: selectedInventory.id });
      await loadAllRecords(selectedInventory.id);
    });
  }

  async function handleDeleteStationary(id: string) {
    if (!selectedInventory) return;
    if (!confirm("Tem certeza que deseja excluir este registro?")) return;
    await withSaveStatus(async () => {
      await deleteStationaryCombustion(id);
      await loadAllRecords(selectedInventory.id);
    });
  }

  async function handleAddMobile(record: any) {
    if (!selectedInventory) return;
    await withSaveStatus(async () => {
      await createMobileCombustion({ ...record, inventoryId: selectedInventory.id });
      await loadAllRecords(selectedInventory.id);
    });
  }

  async function handleDeleteMobile(id: string) {
    if (!selectedInventory) return;
    if (!confirm("Tem certeza que deseja excluir este registro?")) return;
    await withSaveStatus(async () => {
      await deleteMobileCombustion(id);
      await loadAllRecords(selectedInventory.id);
    });
  }

  async function handleAddElectricityLocation(record: any) {
    if (!selectedInventory) return;
    await withSaveStatus(async () => {
      await createElectricityConsumption({ ...record, inventoryId: selectedInventory.id });
      await loadAllRecords(selectedInventory.id);
    });
  }

  async function handleDeleteElectricityLocation(id: string) {
    if (!selectedInventory) return;
    if (!confirm("Tem certeza que deseja excluir este registro?")) return;
    await withSaveStatus(async () => {
      await deleteElectricityConsumption(id);
      await loadAllRecords(selectedInventory.id);
    });
  }

  async function handleAddElectricityMarket(record: any) {
    if (!selectedInventory) return;
    await withSaveStatus(async () => {
      await createMarketBasedEnergy({ ...record, inventoryId: selectedInventory.id });
      await loadAllRecords(selectedInventory.id);
    });
  }

  async function handleDeleteElectricityMarket(id: string) {
    if (!selectedInventory) return;
    if (!confirm("Tem certeza que deseja excluir este registro?")) return;
    await withSaveStatus(async () => {
      await deleteMarketBasedEnergy(id);
      await loadAllRecords(selectedInventory.id);
    });
  }

  async function handleAddBusinessTravel(record: any) {
    if (!selectedInventory) return;
    await withSaveStatus(async () => {
      await createBusinessTravel({ ...record, inventoryId: selectedInventory.id });
      await loadAllRecords(selectedInventory.id);
    });
  }

  async function handleDeleteBusinessTravel(id: string) {
    if (!selectedInventory) return;
    if (!confirm("Tem certeza que deseja excluir este registro?")) return;
    await withSaveStatus(async () => {
      await deleteBusinessTravel(id);
      await loadAllRecords(selectedInventory.id);
    });
  }

  async function handleAddCommute(record: any) {
    if (!selectedInventory) return;
    await withSaveStatus(async () => {
      await createCommute({ ...record, inventoryId: selectedInventory.id });
      await loadAllRecords(selectedInventory.id);
    });
  }

  async function handleDeleteCommute(id: string) {
    if (!selectedInventory) return;
    if (!confirm("Tem certeza que deseja excluir este registro?")) return;
    await withSaveStatus(async () => {
      await deleteCommute(id);
      await loadAllRecords(selectedInventory.id);
    });
  }

  async function handleAddRemoteWork(record: any) {
    if (!selectedInventory) return;
    await withSaveStatus(async () => {
      await createRemoteWork({ ...record, inventoryId: selectedInventory.id });
      await loadAllRecords(selectedInventory.id);
    });
  }

  async function handleDeleteRemoteWork(id: string) {
    if (!selectedInventory) return;
    if (!confirm("Tem certeza que deseja excluir este registro?")) return;
    await withSaveStatus(async () => {
      await deleteRemoteWork(id);
      await loadAllRecords(selectedInventory.id);
    });
  }

  const currentIndex = WIZARD_STEPS.findIndex((s) => s.id === currentStep);
  const isFirstStep = currentIndex === 0;
  const isLastStep = currentIndex === WIZARD_STEPS.length - 1;

  function canProceedStep(stepId: string): boolean {
    switch (stepId) {
      case "intro": return !!(selectedInventory?.year && selectedInventory?.technicalResponsible);
      case "review": return true;
      default: return true;
    }
  }

  function handleNext() {
    if (isLastStep) return;
    const currentId = WIZARD_STEPS[currentIndex].id;
    if (canProceedStep(currentId) && !completedSteps.includes(currentId)) {
      setCompletedSteps((prev) => [...prev, currentId]);
    }
    setCurrentStep(WIZARD_STEPS[currentIndex + 1].id);
  }

  function handlePrev() {
    if (isFirstStep) return;
    setCurrentStep(WIZARD_STEPS[currentIndex - 1].id);
  }

  function handleStepChange(stepId: string) {
    const currentStepId = WIZARD_STEPS[currentIndex].id;
    if (canProceedStep(currentStepId) && !completedSteps.includes(currentStepId)) {
      setCompletedSteps((prev) => [...prev, currentStepId]);
    }
    setCurrentStep(stepId);
  }

  function handleSelectInventory(id: string) {
    const inv = inventories.find((i) => i.id === id);
    setSelectedInventory(inv || null);
    setSelectedId(id);
    setCurrentStep("intro");
    setCompletedSteps([]);
  }

  const totals: InventoryTotals = {
    scope1: {
      stationaryCombustion: stationaryRecords.reduce((a, r) => a + (r.totalCO2e || 0), 0),
      mobileCombustion: mobileRecords.reduce((a, r) => a + (r.totalCO2e || 0), 0),
      total: 0,
    },
    scope2: {
      locationBased: electricityLocationRecords.reduce((a, r) => a + (r.totalEmissions || r.totalCO2e || 0), 0),
      marketBased: electricityMarketRecords.reduce((a, r) => a + (r.totalEmissions || r.totalCO2e || 0), 0),
      total: 0,
    },
    scope3: {
      businessTravel: businessTravelRecords.reduce((a, r) => a + (r.totalCO2e || 0), 0),
      commute: commuteRecords.reduce((a, r) => a + (r.totalCO2e || 0), 0) + remoteWorkRecords.reduce((a, r) => a + (r.totalCO2e || 0), 0),
      total: 0,
    },
    grandTotal: 0,
    totalBiogenicCO2: 0,
  };
  totals.scope1.total = totals.scope1.stationaryCombustion + totals.scope1.mobileCombustion;
  totals.scope2.total = totals.scope2.locationBased + totals.scope2.marketBased;
  totals.scope3.total = totals.scope3.businessTravel + totals.scope3.commute;
  totals.grandTotal = totals.scope1.total + totals.scope2.total + totals.scope3.total;
  totals.totalBiogenicCO2 =
    stationaryRecords.reduce((a, r) => a + (r.biogenicCO2 || 0), 0) +
    mobileRecords.reduce((a, r) => a + (r.biogenicCO2 || 0), 0) +
    electricityMarketRecords.reduce((a, r) => a + (r.totalBiogenicCO2 || 0), 0);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#efc13e]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {!selectedInventory && (
        <div className="rounded-xl border border-[#d1c5ae]/20 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-[#1b1c1c]">Selecione ou crie um inventário</h2>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <select
              value={selectedId}
              onChange={(e) => handleSelectInventory(e.target.value)}
              className="flex-1 rounded-lg border border-[#d1c5ae] bg-white px-3 py-2 text-sm focus:border-[#efc13e] focus:outline-none"
            >
              <option value="">Selecionar inventário existente...</option>
              {inventories.map((inv) => (
                <option key={inv.id} value={inv.id}>Inventário {inv.year}</option>
              ))}
            </select>
            <button
              onClick={() => setShowNewInventory(true)}
              className="flex items-center gap-2 rounded-lg bg-[#efc13e] px-4 py-2 text-sm font-semibold text-[#1b1c1c] hover:scale-[1.02]"
            >
              <Plus className="h-4 w-4" />
              Novo Inventário
            </button>
          </div>

          {showNewInventory && (
            <div className="mt-4 rounded-lg border border-[#efc13e]/30 bg-[#fffcf0] p-4">
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  value={newInvYear}
                  onChange={(e) => setNewInvYear(Number(e.target.value))}
                  className="w-32 rounded-lg border border-[#d1c5ae] bg-white px-3 py-2 text-sm"
                  placeholder="Ano"
                />
                <button
                  onClick={handleCreateInventory}
                  disabled={creating || !newInvYear}
                  className="rounded-lg bg-[#efc13e] px-4 py-2 text-sm font-semibold text-[#1b1c1c] disabled:opacity-50"
                >
                  {creating ? "Criando..." : "Criar"}
                </button>
                <button
                  onClick={() => setShowNewInventory(false)}
                  className="rounded-lg border border-[#d1c5ae] px-4 py-2 text-sm text-[#4e4634]"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {selectedInventory && (
        <WizardLayout
          steps={WIZARD_STEPS}
          currentStep={currentStep}
          completedSteps={completedSteps}
          onStepChange={handleStepChange}
          onNext={handleNext}
          onPrev={handlePrev}
          canProceed={canProceedStep(currentStep)}
          canGoBack={!isFirstStep}
          isLastStep={isLastStep}
          isFirstStep={isFirstStep}
          saveStatus={saveStatus}
          title={`Inventário ${selectedInventory.year}`}
          description="Preencha cada seção do inventário de emissões de gases de efeito estufa."
        >
          <div key={`${selectedInventory.id}-${currentStep}`}>
            {currentStep === "intro" && (
              <IntroStep inventory={selectedInventory} onSave={handleIntroSave} />
            )}

            {currentStep === "stationary" && (
              <StationaryCombustionStep
                records={stationaryRecords}
                onAdd={handleAddStationary}
                onDelete={handleDeleteStationary}
              />
            )}

            {currentStep === "mobile" && (
              <MobileCombustionStep
                records={mobileRecords}
                onAdd={handleAddMobile}
                onDelete={handleDeleteMobile}
              />
            )}

            {currentStep === "electricity-location" && (
              <ElectricityLocationStep
                records={electricityLocationRecords}
                onAdd={handleAddElectricityLocation}
                onDelete={handleDeleteElectricityLocation}
              />
            )}

            {currentStep === "electricity-market" && (
              <ElectricityMarketStep
                records={electricityMarketRecords}
                onAdd={handleAddElectricityMarket}
                onDelete={handleDeleteElectricityMarket}
              />
            )}

            {currentStep === "business-travel" && (
              <BusinessTravelStep
                records={businessTravelRecords}
                onAdd={handleAddBusinessTravel}
                onDelete={handleDeleteBusinessTravel}
              />
            )}

            {currentStep === "commute" && (
              <CommuteStep
                commuteRecords={commuteRecords}
                remoteWorkRecords={remoteWorkRecords}
                onAddCommute={handleAddCommute}
                onAddRemoteWork={handleAddRemoteWork}
                onDeleteCommute={handleDeleteCommute}
                onDeleteRemoteWork={handleDeleteRemoteWork}
              />
            )}

            {currentStep === "review" && (
              <ReviewStep
                totals={totals}
                inventoryName={selectedInventory.organizationName || "Inventário"}
                inventoryYear={selectedInventory.year}
                recordCounts={{
                  stationary: stationaryRecords.length,
                  mobile: mobileRecords.length,
                  electricityLocation: electricityLocationRecords.length,
                  electricityMarket: electricityMarketRecords.length,
                  businessTravel: businessTravelRecords.length,
                  commute: commuteRecords.length,
                  remoteWork: remoteWorkRecords.length,
                }}
              />
            )}
          </div>
        </WizardLayout>
      )}
    </div>
  );
}
