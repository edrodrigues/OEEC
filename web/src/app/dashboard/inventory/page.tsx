"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
import { cn } from "@/lib/utils";

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
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showNewInventory, setShowNewInventory] = useState(false);
  const [newInvYear, setNewInvYear] = useState(new Date().getFullYear());

  // Wizard state
  const [currentStep, setCurrentStep] = useState("intro");
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");

  // Records state
  const [stationaryRecords, setStationaryRecords] = useState<any[]>([]);
  const [mobileRecords, setMobileRecords] = useState<any[]>([]);
  const [electricityLocationRecords, setElectricityLocationRecords] = useState<any[]>([]);
  const [electricityMarketRecords, setElectricityMarketRecords] = useState<any[]>([]);
  const [businessTravelRecords, setBusinessTravelRecords] = useState<any[]>([]);
  const [commuteRecords, setCommuteRecords] = useState<any[]>([]);
  const [remoteWorkRecords, setRemoteWorkRecords] = useState<any[]>([]);

  // Auto-save debounce
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pendingChangesRef = useRef(false);

  useEffect(() => {
    if (!user?.organizationId) return;
    loadInventories();
  }, [user?.organizationId]);

  useEffect(() => {
    if (selectedInventory) {
      loadAllRecords(selectedInventory.id);
    }
  }, [selectedInventory?.id]);

  // Auto-save on changes
  useEffect(() => {
    if (!selectedInventory || currentStep === "intro" || currentStep === "review") return;
    if (pendingChangesRef.current) return;

    pendingChangesRef.current = true;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      setSaveStatus("saving");
      pendingChangesRef.current = false;
      // Auto-save is triggered by individual record additions
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    }, 5000);

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [stationaryRecords, mobileRecords, electricityLocationRecords, electricityMarketRecords, businessTravelRecords, commuteRecords, remoteWorkRecords]);

  async function loadInventories() {
    setLoading(true);
    const invs = await getInventories(user!.organizationId!);
    setInventories(invs);
    if (invs.length > 0) setSelectedInventory(invs[0]);
    setLoading(false);
  }

  async function loadAllRecords(inventoryId: string) {
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
  }

  async function handleCreateInventory() {
    if (!user) return;
    setCreating(true);
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
    await loadInventories();
    const newInv = inventories.find((i) => i.id === id) || { id, year: newInvYear } as Inventory;
    setSelectedInventory({ ...newInv, year: newInvYear } as Inventory);
    setShowNewInventory(false);
    setCreating(false);
  }

  function handleIntroSave(data: Partial<Inventory>) {
    if (!selectedInventory) return;
    setSelectedInventory((prev) => prev ? { ...prev, ...data } : null);
  }

  // Record handlers
  async function handleAddStationary(record: any) {
    if (!selectedInventory) return;
    await createStationaryCombustion({ ...record, inventoryId: selectedInventory.id });
    await loadAllRecords(selectedInventory.id);
    setSaveStatus("saved");
    setTimeout(() => setSaveStatus("idle"), 2000);
  }

  async function handleDeleteStationary(id: string) {
    if (!selectedInventory) return;
    await deleteStationaryCombustion(id);
    await loadAllRecords(selectedInventory.id);
  }

  async function handleAddMobile(record: any) {
    if (!selectedInventory) return;
    await createMobileCombustion({ ...record, inventoryId: selectedInventory.id });
    await loadAllRecords(selectedInventory.id);
    setSaveStatus("saved");
    setTimeout(() => setSaveStatus("idle"), 2000);
  }

  async function handleDeleteMobile(id: string) {
    if (!selectedInventory) return;
    await deleteMobileCombustion(id);
    await loadAllRecords(selectedInventory.id);
  }

  async function handleAddElectricityLocation(record: any) {
    if (!selectedInventory) return;
    await createElectricityConsumption({ ...record, inventoryId: selectedInventory.id });
    await loadAllRecords(selectedInventory.id);
    setSaveStatus("saved");
    setTimeout(() => setSaveStatus("idle"), 2000);
  }

  async function handleDeleteElectricityLocation(id: string) {
    if (!selectedInventory) return;
    await deleteElectricityConsumption(id);
    await loadAllRecords(selectedInventory.id);
  }

  async function handleAddElectricityMarket(record: any) {
    if (!selectedInventory) return;
    await createMarketBasedEnergy({ ...record, inventoryId: selectedInventory.id });
    await loadAllRecords(selectedInventory.id);
    setSaveStatus("saved");
    setTimeout(() => setSaveStatus("idle"), 2000);
  }

  async function handleDeleteElectricityMarket(id: string) {
    if (!selectedInventory) return;
    await deleteMarketBasedEnergy(id);
    await loadAllRecords(selectedInventory.id);
  }

  async function handleAddBusinessTravel(record: any) {
    if (!selectedInventory) return;
    await createBusinessTravel({ ...record, inventoryId: selectedInventory.id });
    await loadAllRecords(selectedInventory.id);
    setSaveStatus("saved");
    setTimeout(() => setSaveStatus("idle"), 2000);
  }

  async function handleDeleteBusinessTravel(id: string) {
    if (!selectedInventory) return;
    await deleteBusinessTravel(id);
    await loadAllRecords(selectedInventory.id);
  }

  async function handleAddCommute(record: any) {
    if (!selectedInventory) return;
    await createCommute({ ...record, inventoryId: selectedInventory.id });
    await loadAllRecords(selectedInventory.id);
    setSaveStatus("saved");
    setTimeout(() => setSaveStatus("idle"), 2000);
  }

  async function handleDeleteCommute(id: string) {
    if (!selectedInventory) return;
    await deleteCommute(id);
    await loadAllRecords(selectedInventory.id);
  }

  async function handleAddRemoteWork(record: any) {
    if (!selectedInventory) return;
    await createRemoteWork({ ...record, inventoryId: selectedInventory.id });
    await loadAllRecords(selectedInventory.id);
    setSaveStatus("saved");
    setTimeout(() => setSaveStatus("idle"), 2000);
  }

  async function handleDeleteRemoteWork(id: string) {
    if (!selectedInventory) return;
    await deleteRemoteWork(id);
    await loadAllRecords(selectedInventory.id);
  }

  // Navigation
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

  // Calculate totals
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
      {/* Inventory Selector */}
      {!selectedInventory && (
        <div className="rounded-xl border border-[#d1c5ae]/20 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-[#1b1c1c]">Selecione ou crie um inventário</h2>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <select
              value=""
              onChange={(e) => {
                const inv = inventories.find((i) => i.id === e.target.value);
                setSelectedInventory(inv || null);
              }}
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
        </WizardLayout>
      )}
    </div>
  );
}
