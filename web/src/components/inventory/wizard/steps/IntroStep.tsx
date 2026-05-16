"use client";

import { useState } from "react";
import type { Inventory } from "@/lib/data/inventory-types";
import { SECTORS } from "@/lib/data/emission-factors";

const ORG_TYPES = ["Indústria", "Comércio", "Serviços", "Agronegócio", "Governo", "ONG"];
const STATES = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"];

interface IntroStepProps {
  inventory: Inventory | null;
  onSave: (data: Partial<Inventory>) => void;
}

export function IntroStep({ inventory, onSave }: IntroStepProps) {
  const [form, setForm] = useState({
    year: inventory?.year || new Date().getFullYear(),
    organizationName: inventory?.organizationName || "",
    technicalResponsible: inventory?.technicalResponsible || "",
    responsibleRole: inventory?.responsibleRole || "",
    contactPhone: inventory?.contactPhone || "",
    contactEmail: inventory?.contactEmail || "",
    operationalUnit: inventory?.operationalUnit || "",
    city: inventory?.city || "",
    state: inventory?.state || "",
    sector: inventory?.sector || "",
    organizationType: inventory?.organizationType || "",
    address: inventory?.address || "",
    notes: inventory?.notes || "",
  });

  function update(field: string, value: string | number) {
    setForm((prev) => ({ ...prev, [field]: value }));
    onSave({ [field]: value });
  }

  const isComplete = form.year && form.organizationName && form.technicalResponsible;

  return (
    <div className="rounded-xl border border-[#d1c5ae]/20 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-[#1b1c1c]">Dados do Inventário</h2>
        <p className="text-sm text-[#4e4634]">Informações básicas sobre a organização e o responsável técnico.</p>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="mb-3 text-sm font-semibold text-[#765b00]">Informações Gerais</h3>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-[#4e4634]">Ano de inventário *</label>
              <input type="number" value={form.year} onChange={(e) => update("year", Number(e.target.value))} className="w-full rounded-lg border border-[#d1c5ae] bg-white px-3 py-2 text-sm focus:border-[#efc13e] focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-[#4e4634]">Organização *</label>
              <input value={form.organizationName} onChange={(e) => update("organizationName", e.target.value)} placeholder="Nome da organização" className="w-full rounded-lg border border-[#d1c5ae] bg-white px-3 py-2 text-sm focus:border-[#efc13e] focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-[#4e4634]">Tipo de organização</label>
              <select value={form.organizationType} onChange={(e) => update("organizationType", e.target.value)} className="w-full rounded-lg border border-[#d1c5ae] bg-white px-3 py-2 text-sm focus:border-[#efc13e] focus:outline-none">
                <option value="">Selecionar...</option>
                {ORG_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold text-[#765b00]">Localização</h3>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-[#4e4634]">Endereço</label>
              <input value={form.address} onChange={(e) => update("address", e.target.value)} placeholder="Endereço completo" className="w-full rounded-lg border border-[#d1c5ae] bg-white px-3 py-2 text-sm focus:border-[#efc13e] focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-[#4e4634]">Unidade operacional</label>
              <input value={form.operationalUnit} onChange={(e) => update("operationalUnit", e.target.value)} placeholder="Nome da unidade" className="w-full rounded-lg border border-[#d1c5ae] bg-white px-3 py-2 text-sm focus:border-[#efc13e] focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-[#4e4634]">Cidade</label>
              <input value={form.city} onChange={(e) => update("city", e.target.value)} placeholder="Cidade" className="w-full rounded-lg border border-[#d1c5ae] bg-white px-3 py-2 text-sm focus:border-[#efc13e] focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-[#4e4634]">Estado</label>
              <select value={form.state} onChange={(e) => update("state", e.target.value)} className="w-full rounded-lg border border-[#d1c5ae] bg-white px-3 py-2 text-sm focus:border-[#efc13e] focus:outline-none">
                <option value="">Selecionar...</option>
                {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-[#4e4634]">Setor</label>
              <select value={form.sector} onChange={(e) => update("sector", e.target.value)} className="w-full rounded-lg border border-[#d1c5ae] bg-white px-3 py-2 text-sm focus:border-[#efc13e] focus:outline-none">
                <option value="">Selecionar...</option>
                {SECTORS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold text-[#765b00]">Responsável Técnico *</h3>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-[#4e4634]">Nome</label>
              <input value={form.technicalResponsible} onChange={(e) => update("technicalResponsible", e.target.value)} placeholder="Nome completo" className="w-full rounded-lg border border-[#d1c5ae] bg-white px-3 py-2 text-sm focus:border-[#efc13e] focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-[#4e4634]">Cargo</label>
              <input value={form.responsibleRole} onChange={(e) => update("responsibleRole", e.target.value)} placeholder="Cargo / Função" className="w-full rounded-lg border border-[#d1c5ae] bg-white px-3 py-2 text-sm focus:border-[#efc13e] focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-[#4e4634]">E-mail</label>
              <input type="email" value={form.contactEmail} onChange={(e) => update("contactEmail", e.target.value)} placeholder="email@empresa.com" className="w-full rounded-lg border border-[#d1c5ae] bg-white px-3 py-2 text-sm focus:border-[#efc13e] focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-[#4e4634]">Telefone</label>
              <input value={form.contactPhone} onChange={(e) => update("contactPhone", e.target.value)} placeholder="(00) 00000-0000" className="w-full rounded-lg border border-[#d1c5ae] bg-white px-3 py-2 text-sm focus:border-[#efc13e] focus:outline-none" />
            </div>
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold text-[#765b00]">Observações</h3>
          <textarea
            value={form.notes}
            onChange={(e) => update("notes", e.target.value)}
            placeholder="Notas adicionais sobre o inventário..."
            rows={3}
            className="w-full rounded-lg border border-[#d1c5ae] bg-white px-3 py-2 text-sm focus:border-[#efc13e] focus:outline-none"
          />
        </div>
      </div>

      {!isComplete && (
        <div className="mt-4 rounded-lg border border-[#efc13e]/30 bg-[#fffcf0] p-3">
          <p className="text-xs text-[#765b00]">
            Preencha os campos obrigatórios (*) para habilitar o próximo passo.
          </p>
        </div>
      )}
    </div>
  );
}
