"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { Loader2, Building2, MapPin, Users, Check } from "lucide-react";
import type { OrganizationType, OrganizationSize } from "@/types";

const sectors = [
  "Indústria",
  "Comércio",
  "Serviços",
  "Administração Pública",
  "Saúde",
  "Educação",
  "Transporte",
  "Agronegócio",
  "Construção Civil",
  "Outro",
];

const organizationTypes: { value: OrganizationType; label: string }[] = [
  { value: "public", label: "Pública" },
  { value: "private", label: "Privada" },
  { value: "industry", label: "Indústria" },
  { value: "municipality", label: "Município" },
  { value: "concessionaire", label: "Concessionária" },
];

const organizationSizes: { value: OrganizationSize; label: string }[] = [
  { value: "micro", label: "Microempresa" },
  { value: "small", label: "Pequena" },
  { value: "medium", label: "Média" },
  { value: "large", label: "Grande" },
  { value: "enterprise", label: "Enterprise" },
];

const brazilianStates = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS",
  "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC",
  "SP", "SE", "TO",
];

export default function OnboardingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    cnpj: "",
    sector: "",
    organizationType: "" as OrganizationType | "",
    city: "",
    state: "",
    size: "" as OrganizationSize | "",
    unitsCount: 1,
    population: "",
    builtArea: "",
    employeesCount: "",
  });

  const isMunicipality = formData.organizationType === "municipality";

  const updateField = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const formatCNPJ = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 14);
    if (digits.length <= 2) return digits;
    if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
    if (digits.length <= 8)
      return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
    if (digits.length <= 12)
      return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
  };

  const handleCNPJChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateField("cnpj", formatCNPJ(e.target.value));
  };

  const canProceedStep1 = formData.name && formData.cnpj && formData.organizationType && formData.sector;
  const canProceedStep2 = formData.city && formData.state && formData.size;

  const handleSubmit = async () => {
    if (!user) return;
    setError("");
    setLoading(true);

    try {
      const orgData = {
        name: formData.name,
        cnpj: formData.cnpj,
        sector: formData.sector,
        organizationType: formData.organizationType,
        city: formData.city,
        state: formData.state,
        size: formData.size,
        unitsCount: formData.unitsCount,
        ownerId: user.id,
        ...(isMunicipality && { population: formData.population ? Number(formData.population) : undefined }),
        ...(formData.builtArea && { builtArea: Number(formData.builtArea) }),
        ...(formData.employeesCount && { employeesCount: Number(formData.employeesCount) }),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const orgRef = doc(db, "organizations");
      await setDoc(orgRef, orgData);

      await setDoc(doc(db, "users", user.id), {
        ...user,
        organizationId: orgRef.id,
        role: "admin",
        updatedAt: serverTimestamp(),
      });

      router.push("/");
    } catch {
      setError("Erro ao criar organização. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fbf9f8] px-4 py-12">
      <div className="w-full max-w-2xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#efc13e]">
            <span className="text-xl font-bold text-[#1b1c1c]">O</span>
          </div>
          <h1 className="text-2xl font-bold text-[#1b1c1c]">Configurar Organização</h1>
          <p className="mt-1 text-sm text-[#4e4634]">
            Preencha os dados da sua organização para começar
          </p>
        </div>

        <div className="mb-8 flex items-center justify-center gap-4">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold",
                  step > s
                    ? "bg-[#efc13e] text-[#1b1c1c]"
                    : step === s
                      ? "bg-[#efc13e] text-[#1b1c1c]"
                      : "bg-[#e4e2e2] text-[#807662]"
                )}
              >
                {step > s ? <Check className="h-4 w-4" /> : s}
              </div>
              {s < 3 && (
                <div
                  className={cn(
                    "h-0.5 w-16",
                    step > s ? "bg-[#efc13e]" : "bg-[#e4e2e2]"
                  )}
                />
              )}
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-[#d1c5ae]/20 bg-white p-6 shadow-sm sm:p-8">
          {error && (
            <div className="mb-4 rounded-lg border border-[#ba1a1a]/20 bg-[#ffdad6] px-4 py-3 text-sm text-[#93000a]">
              {error}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div className="mb-4 flex items-center gap-2 text-lg font-semibold text-[#1b1c1c]">
                <Building2 className="h-5 w-5 text-[#efc13e]" />
                Dados da Organização
              </div>

              <div>
                <label className="block text-sm font-medium text-[#4e4634]">
                  Nome da organização *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  className="mt-1 w-full rounded-lg border border-[#d1c5ae] bg-[#f5f3f3] px-3 py-2.5 text-sm text-[#1b1c1c] focus:border-[#efc13e] focus:outline-none focus:ring-2 focus:ring-[#efc13e]/20"
                  placeholder="Ex: Prefeitura de São Paulo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#4e4634]">
                  CNPJ *
                </label>
                <input
                  type="text"
                  required
                  value={formData.cnpj}
                  onChange={handleCNPJChange}
                  className="mt-1 w-full rounded-lg border border-[#d1c5ae] bg-[#f5f3f3] px-3 py-2.5 text-sm text-[#1b1c1c] focus:border-[#efc13e] focus:outline-none focus:ring-2 focus:ring-[#efc13e]/20"
                  placeholder="00.000.000/0000-00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#4e4634]">
                  Tipo de organização *
                </label>
                <select
                  required
                  value={formData.organizationType}
                  onChange={(e) => updateField("organizationType", e.target.value)}
                  className="mt-1 w-full rounded-lg border border-[#d1c5ae] bg-[#f5f3f3] px-3 py-2.5 text-sm text-[#1b1c1c] focus:border-[#efc13e] focus:outline-none focus:ring-2 focus:ring-[#efc13e]/20"
                >
                  <option value="">Selecione...</option>
                  {organizationTypes.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#4e4634]">
                  Setor econômico *
                </label>
                <select
                  required
                  value={formData.sector}
                  onChange={(e) => updateField("sector", e.target.value)}
                  className="mt-1 w-full rounded-lg border border-[#d1c5ae] bg-[#f5f3f3] px-3 py-2.5 text-sm text-[#1b1c1c] focus:border-[#efc13e] focus:outline-none focus:ring-2 focus:ring-[#efc13e]/20"
                >
                  <option value="">Selecione...</option>
                  {sectors.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="mb-4 flex items-center gap-2 text-lg font-semibold text-[#1b1c1c]">
                <MapPin className="h-5 w-5 text-[#efc13e]" />
                Localização e Porte
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-[#4e4634]">
                    Cidade *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => updateField("city", e.target.value)}
                    className="mt-1 w-full rounded-lg border border-[#d1c5ae] bg-[#f5f3f3] px-3 py-2.5 text-sm text-[#1b1c1c] focus:border-[#efc13e] focus:outline-none focus:ring-2 focus:ring-[#efc13e]/20"
                    placeholder="Ex: São Paulo"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#4e4634]">
                    Estado *
                  </label>
                  <select
                    required
                    value={formData.state}
                    onChange={(e) => updateField("state", e.target.value)}
                    className="mt-1 w-full rounded-lg border border-[#d1c5ae] bg-[#f5f3f3] px-3 py-2.5 text-sm text-[#1b1c1c] focus:border-[#efc13e] focus:outline-none focus:ring-2 focus:ring-[#efc13e]/20"
                  >
                    <option value="">UF</option>
                    {brazilianStates.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#4e4634]">
                  Porte da organização *
                </label>
                <select
                  required
                  value={formData.size}
                  onChange={(e) => updateField("size", e.target.value)}
                  className="mt-1 w-full rounded-lg border border-[#d1c5ae] bg-[#f5f3f3] px-3 py-2.5 text-sm text-[#1b1c1c] focus:border-[#efc13e] focus:outline-none focus:ring-2 focus:ring-[#efc13e]/20"
                >
                  <option value="">Selecione...</option>
                  {organizationSizes.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#4e4634]">
                  Número de unidades operacionais
                </label>
                <input
                  type="number"
                  min={1}
                  value={formData.unitsCount}
                  onChange={(e) => updateField("unitsCount", Number(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-[#d1c5ae] bg-[#f5f3f3] px-3 py-2.5 text-sm text-[#1b1c1c] focus:border-[#efc13e] focus:outline-none focus:ring-2 focus:ring-[#efc13e]/20"
                />
              </div>

              {isMunicipality && (
                <div>
                  <label className="block text-sm font-medium text-[#4e4634]">
                    População do município
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formData.population}
                    onChange={(e) => updateField("population", e.target.value)}
                    className="mt-1 w-full rounded-lg border border-[#d1c5ae] bg-[#f5f3f3] px-3 py-2.5 text-sm text-[#1b1c1c] focus:border-[#efc13e] focus:outline-none focus:ring-2 focus:ring-[#efc13e]/20"
                    placeholder="Ex: 500000"
                  />
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="mb-4 flex items-center gap-2 text-lg font-semibold text-[#1b1c1c]">
                <Users className="h-5 w-5 text-[#efc13e]" />
                Informações Adicionais
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-[#4e4634]">
                    Área construída (m²)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formData.builtArea}
                    onChange={(e) => updateField("builtArea", e.target.value)}
                    className="mt-1 w-full rounded-lg border border-[#d1c5ae] bg-[#f5f3f3] px-3 py-2.5 text-sm text-[#1b1c1c] focus:border-[#efc13e] focus:outline-none focus:ring-2 focus:ring-[#efc13e]/20"
                    placeholder="Ex: 10000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#4e4634]">
                    Número de colaboradores
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formData.employeesCount}
                    onChange={(e) => updateField("employeesCount", e.target.value)}
                    className="mt-1 w-full rounded-lg border border-[#d1c5ae] bg-[#f5f3f3] px-3 py-2.5 text-sm text-[#1b1c1c] focus:border-[#efc13e] focus:outline-none focus:ring-2 focus:ring-[#efc13e]/20"
                    placeholder="Ex: 250"
                  />
                </div>
              </div>

              <div className="rounded-lg border border-[#efc13e]/20 bg-[#fffcf0] p-4">
                <h3 className="text-sm font-semibold text-[#765b00]">Resumo</h3>
                <dl className="mt-2 space-y-1 text-sm text-[#4e4634]">
                  <div className="flex justify-between">
                    <span>Organização:</span>
                    <span className="font-medium text-[#1b1c1c]">{formData.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>CNPJ:</span>
                    <span className="font-medium text-[#1b1c1c]">{formData.cnpj}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tipo:</span>
                    <span className="font-medium text-[#1b1c1c]">
                      {organizationTypes.find((t) => t.value === formData.organizationType)?.label}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Localização:</span>
                    <span className="font-medium text-[#1b1c1c]">
                      {formData.city}/{formData.state}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Porte:</span>
                    <span className="font-medium text-[#1b1c1c]">
                      {organizationSizes.find((s) => s.value === formData.size)?.label}
                    </span>
                  </div>
                </dl>
              </div>
            </div>
          )}

          <div className="mt-6 flex justify-between">
            {step > 1 ? (
              <button
                onClick={() => setStep(step - 1)}
                className="rounded-lg border border-[#d1c5ae] px-4 py-2.5 text-sm font-medium text-[#4e4634] hover:bg-[#f5f3f3]"
              >
                Voltar
              </button>
            ) : (
              <div />
            )}

            {step < 3 ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={
                  (step === 1 && !canProceedStep1) || (step === 2 && !canProceedStep2)
                }
                className={cn(
                  "rounded-lg bg-[#efc13e] px-6 py-2.5 text-sm font-semibold text-[#1b1c1c] transition-all hover:scale-[1.02]",
                  ((step === 1 && !canProceedStep1) || (step === 2 && !canProceedStep2)) &&
                    "cursor-not-allowed opacity-50 hover:scale-100"
                )}
              >
                Próximo
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className={cn(
                  "flex items-center gap-2 rounded-lg bg-[#efc13e] px-6 py-2.5 text-sm font-semibold text-[#1b1c1c] transition-all hover:scale-[1.02]",
                  loading && "cursor-not-allowed opacity-70"
                )}
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Criar organização
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
