"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Check, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { AutoSaveIndicator } from "./shared/AutoSaveIndicator";

export interface WizardStep {
  id: string;
  label: string;
  shortLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  scope?: string;
}

interface WizardLayoutProps {
  steps: WizardStep[];
  currentStep: string;
  completedSteps: string[];
  onStepChange: (stepId: string) => void;
  onNext: () => void;
  onPrev: () => void;
  canProceed: boolean;
  canGoBack: boolean;
  isLastStep: boolean;
  isFirstStep: boolean;
  saveStatus: "idle" | "saving" | "saved" | "error";
  children: React.ReactNode;
  title: string;
  description: string;
}

export function WizardLayout({
  steps,
  currentStep,
  completedSteps,
  onStepChange,
  onNext,
  onPrev,
  canProceed,
  canGoBack,
  isLastStep,
  isFirstStep,
  saveStatus,
  children,
  title,
  description,
}: WizardLayoutProps) {
  const [showMobileSteps, setShowMobileSteps] = useState(false);

  const currentIndex = steps.findIndex((s) => s.id === currentStep);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1b1c1c] sm:text-3xl">{title}</h1>
          <p className="mt-1 text-sm text-[#4e4634]">{description}</p>
        </div>
        <AutoSaveIndicator status={saveStatus} />
      </div>

      {/* Desktop Stepper */}
      <div className="hidden overflow-x-auto rounded-xl border border-[#d1c5ae]/20 bg-white p-3 sm:block">
        <div className="flex items-center gap-1 min-w-max">
          {steps.map((step, i) => {
            const isCompleted = completedSteps.includes(step.id);
            const isCurrent = step.id === currentStep;
            const Icon = step.icon;

            return (
              <div key={step.id} className="flex items-center">
                <button
                  onClick={() => onStepChange(step.id)}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isCurrent
                      ? "bg-[#efc13e] text-[#1b1c1c]"
                      : isCompleted
                        ? "bg-green-50 text-green-700 hover:bg-green-100"
                        : "text-[#807662] hover:bg-[#f5f3f3]"
                  )}
                >
                  <div className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold",
                    isCurrent
                      ? "bg-[#1b1c1c] text-[#efc13e]"
                      : isCompleted
                        ? "bg-green-600 text-white"
                        : "bg-[#e4e2e2] text-[#807662]"
                  )}>
                    {isCompleted ? <Check className="h-3.5 w-3.5" /> : i + 1}
                  </div>
                  <span className="whitespace-nowrap">{step.label}</span>
                  {step.scope && (
                    <span className={cn(
                      "rounded-full px-1.5 py-0.5 text-[10px]",
                      isCurrent ? "bg-[#1b1c1c]/10" : "bg-[#e4e2e2]"
                    )}>
                      {step.scope}
                    </span>
                  )}
                </button>
                {i < steps.length - 1 && (
                  <ChevronRight className="mx-1 h-4 w-4 text-[#d1c5ae]" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile Step Selector */}
      <div className="sm:hidden">
        <button
          onClick={() => setShowMobileSteps(!showMobileSteps)}
          className="flex w-full items-center justify-between rounded-lg border border-[#d1c5ae] bg-white px-4 py-3 text-sm font-medium text-[#1b1c1c]"
        >
          <span>Passo {currentIndex + 1}: {steps[currentIndex]?.label}</span>
          <ChevronRight className={cn("h-4 w-4 transition-transform", showMobileSteps && "rotate-90")} />
        </button>
        {showMobileSteps && (
          <div className="mt-2 space-y-1 rounded-lg border border-[#d1c5ae] bg-white p-2">
            {steps.map((step, i) => {
              const isCompleted = completedSteps.includes(step.id);
              const isCurrent = step.id === currentStep;
              const Icon = step.icon;
              return (
                <button
                  key={step.id}
                  onClick={() => { onStepChange(step.id); setShowMobileSteps(false); }}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm",
                    isCurrent ? "bg-[#efc13e] text-[#1b1c1c]" : isCompleted ? "text-green-700" : "text-[#4e4634]"
                  )}
                >
                  <div className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold",
                    isCurrent ? "bg-[#1b1c1c] text-[#efc13e]" : isCompleted ? "bg-green-600 text-white" : "bg-[#e4e2e2]"
                  )}>
                    {isCompleted ? <Check className="h-3.5 w-3.5" /> : i + 1}
                  </div>
                  <span>{step.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="min-h-[400px]">
        {children}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between rounded-xl border border-[#d1c5ae]/20 bg-white p-4">
        <button
          onClick={onPrev}
          disabled={isFirstStep || !canGoBack}
          className={cn(
            "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
            isFirstStep || !canGoBack
              ? "cursor-not-allowed text-[#d1c5ae]"
              : "text-[#4e4634] hover:bg-[#f5f3f3]"
          )}
        >
          <ChevronLeft className="h-4 w-4" />
          Anterior
        </button>

        <span className="text-sm text-[#807662]">
          {currentIndex + 1} de {steps.length}
        </span>

        <button
          onClick={onNext}
          disabled={!canProceed}
          className={cn(
            "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all",
            canProceed
              ? "bg-[#efc13e] text-[#1b1c1c] hover:scale-[1.02]"
              : "cursor-not-allowed bg-[#e4e2e2] text-[#807662]"
          )}
        >
          {isLastStep ? "Finalizar" : "Próximo"}
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
