"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import {
  getOrganization,
  updateOrganization,
  getOperationalUnits,
  createOperationalUnit,
  updateOperationalUnit,
  deleteOperationalUnit,
  getUsersByOrganization,
  updateUserRole,
  logAudit,
} from "@/lib/services/organization";
import { cn } from "@/lib/utils";
import {
  Building2,
  MapPin,
  Users,
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  Shield,
  Loader2,
  Save,
} from "lucide-react";
import type { Organization, OperationalUnit, User, UserRole } from "@/types";

const organizationTypes: Record<string, string> = {
  public: "Pública",
  private: "Privada",
  industry: "Indústria",
  municipality: "Município",
  concessionaire: "Concessionária",
};

const organizationSizes: Record<string, string> = {
  micro: "Microempresa",
  small: "Pequena",
  medium: "Média",
  large: "Grande",
  enterprise: "Enterprise",
};

const roleLabels: Record<UserRole, string> = {
  admin: "Administrador",
  editor: "Editor",
  viewer: "Visualizador",
  auditor: "Auditor",
};

export default function OrganizationPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"details" | "units" | "team">("details");
  const [org, setOrg] = useState<Organization | null>(null);
  const [units, setUnits] = useState<OperationalUnit[]>([]);
  const [team, setTeam] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingUnit, setEditingUnit] = useState<string | null>(null);
  const [newUnit, setNewUnit] = useState(false);

  const [editForm, setEditForm] = useState({
    name: "",
    city: "",
    state: "",
    address: "",
  });

  useEffect(() => {
    if (!user?.organizationId) return;
    loadData(user.organizationId);
  }, [user?.organizationId]);

  async function loadData(orgId: string) {
    setLoading(true);
    const [orgData, unitsData, teamData] = await Promise.all([
      getOrganization(orgId),
      getOperationalUnits(orgId),
      getUsersByOrganization(orgId),
    ]);
    setOrg(orgData);
    setUnits(unitsData);
    setTeam(teamData);
    setLoading(false);
  }

  async function handleSaveOrg() {
    if (!org) return;
    setSaving(true);
    await updateOrganization(org.id, { name: org.name });
    await logAudit({
      userId: user?.id || "",
      organizationId: org.id,
      action: "UPDATE",
      entity: "organization",
      entityId: org.id,
      changes: { name: org.name },
    });
    setSaving(false);
  }

  async function handleCreateUnit() {
    if (!org) return;
    setSaving(true);
    await createOperationalUnit(org.id, {
      organizationId: org.id,
      name: editForm.name,
      city: editForm.city,
      state: editForm.state,
      address: editForm.address,
    } as Omit<OperationalUnit, "id" | "createdAt" | "updatedAt">);
    await logAudit({
      userId: user?.id || "",
      organizationId: org.id,
      action: "CREATE",
      entity: "operational_unit",
      entityId: "",
      changes: editForm,
    });
    setNewUnit(false);
    setEditForm({ name: "", city: "", state: "", address: "" });
    await loadData(org.id);
    setSaving(false);
  }

  async function handleSaveUnit(id: string) {
    if (!org) return;
    setSaving(true);
    await updateOperationalUnit(id, editForm);
    await logAudit({
      userId: user?.id || "",
      organizationId: org.id,
      action: "UPDATE",
      entity: "operational_unit",
      entityId: id,
      changes: editForm,
    });
    setEditingUnit(null);
    await loadData(org.id);
    setSaving(false);
  }

  async function handleDeleteUnit(id: string) {
    if (!org) return;
    setSaving(true);
    await deleteOperationalUnit(id);
    await logAudit({
      userId: user?.id || "",
      organizationId: org.id,
      action: "DELETE",
      entity: "operational_unit",
      entityId: id,
      changes: {},
    });
    await loadData(org.id);
    setSaving(false);
  }

  async function handleRoleChange(userId: string, newRole: UserRole) {
    if (!org) return;
    setSaving(true);
    await updateUserRole(userId, newRole);
    await logAudit({
      userId: user?.id || "",
      organizationId: org.id,
      action: "UPDATE_ROLE",
      entity: "user",
      entityId: userId,
      changes: { role: newRole },
    });
    await loadData(org.id);
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#efc13e]" />
      </div>
    );
  }

  if (!org) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center">
        <Building2 className="h-12 w-12 text-[#d1c5ae]" />
        <h2 className="mt-4 text-lg font-semibold text-[#1b1c1c]">
          Nenhuma organização encontrada
        </h2>
        <p className="mt-1 text-sm text-[#4e4634]">
          Complete o onboarding para configurar sua organização.
        </p>
      </div>
    );
  }

  const tabs = [
    { id: "details" as const, label: "Dados da Organização", icon: Building2 },
    { id: "units" as const, label: "Unidades Operacionais", icon: MapPin },
    { id: "team" as const, label: "Equipe", icon: Users },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1b1c1c] sm:text-3xl">
          Organização
        </h1>
        <p className="mt-1 text-[#4e4634]">
          Gerencie os dados da sua organização e unidades operacionais.
        </p>
      </div>

      <div className="border-b border-[#e4e2e2]">
        <nav className="-mb-px flex gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 border-b-2 px-1 py-3 text-sm font-medium",
                activeTab === tab.id
                  ? "border-[#efc13e] text-[#765b00]"
                  : "border-transparent text-[#4e4634] hover:border-[#d1c5ae] hover:text-[#1b1c1c]"
              )}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === "details" && (
        <div className="rounded-xl border border-[#d1c5ae]/20 bg-white p-6 shadow-sm">
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-[#4e4634]">
                  Nome da organização
                </label>
                <input
                  type="text"
                  value={org.name}
                  onChange={(e) =>
                    setOrg({ ...org, name: e.target.value })
                  }
                  className="mt-1 w-full rounded-lg border border-[#d1c5ae] bg-[#f5f3f3] px-3 py-2.5 text-sm text-[#1b1c1c] focus:border-[#efc13e] focus:outline-none focus:ring-2 focus:ring-[#efc13e]/20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#4e4634]">
                  CNPJ
                </label>
                <p className="mt-1 rounded-lg bg-[#f5f3f3] px-3 py-2.5 text-sm text-[#1b1c1c]">
                  {org.cnpj}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#4e4634]">
                  Tipo
                </label>
                <p className="mt-1 rounded-lg bg-[#f5f3f3] px-3 py-2.5 text-sm text-[#1b1c1c]">
                  {organizationTypes[org.organizationType] || org.organizationType}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#4e4634]">
                  Setor
                </label>
                <p className="mt-1 rounded-lg bg-[#f5f3f3] px-3 py-2.5 text-sm text-[#1b1c1c]">
                  {org.sector}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#4e4634]">
                  Cidade / Estado
                </label>
                <p className="mt-1 rounded-lg bg-[#f5f3f3] px-3 py-2.5 text-sm text-[#1b1c1c]">
                  {org.city}/{org.state}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#4e4634]">
                  Porte
                </label>
                <p className="mt-1 rounded-lg bg-[#f5f3f3] px-3 py-2.5 text-sm text-[#1b1c1c]">
                  {organizationSizes[org.size] || org.size}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#4e4634]">
                  Unidades operacionais
                </label>
                <p className="mt-1 rounded-lg bg-[#f5f3f3] px-3 py-2.5 text-sm text-[#1b1c1c]">
                  {org.unitsCount}
                </p>
              </div>

              {org.population && (
                <div>
                  <label className="block text-sm font-medium text-[#4e4634]">
                    População
                  </label>
                  <p className="mt-1 rounded-lg bg-[#f5f3f3] px-3 py-2.5 text-sm text-[#1b1c1c]">
                    {org.population.toLocaleString("pt-BR")}
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={handleSaveOrg}
              disabled={saving}
              className={cn(
                "flex items-center gap-2 rounded-lg bg-[#efc13e] px-4 py-2 text-sm font-semibold text-[#1b1c1c] transition-all hover:scale-[1.02]",
                saving && "cursor-not-allowed opacity-70"
              )}
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Salvar alterações
            </button>
          </div>
        </div>
      )}

      {activeTab === "units" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#1b1c1c]">
              Unidades Operacionais
            </h2>
            <button
              onClick={() => setNewUnit(true)}
              className="flex items-center gap-2 rounded-lg bg-[#efc13e] px-4 py-2 text-sm font-semibold text-[#1b1c1c] transition-all hover:scale-[1.02]"
            >
              <Plus className="h-4 w-4" />
              Nova Unidade
            </button>
          </div>

          {newUnit && (
            <div className="rounded-xl border border-[#efc13e]/30 bg-[#fffcf0] p-4">
              <h3 className="mb-3 text-sm font-semibold text-[#765b00]">
                Nova Unidade Operacional
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  placeholder="Nome da unidade"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                  className="rounded-lg border border-[#d1c5ae] bg-white px-3 py-2 text-sm focus:border-[#efc13e] focus:outline-none"
                />
                <input
                  placeholder="Cidade"
                  value={editForm.city}
                  onChange={(e) =>
                    setEditForm({ ...editForm, city: e.target.value })
                  }
                  className="rounded-lg border border-[#d1c5ae] bg-white px-3 py-2 text-sm focus:border-[#efc13e] focus:outline-none"
                />
                <input
                  placeholder="Estado (UF)"
                  value={editForm.state}
                  onChange={(e) =>
                    setEditForm({ ...editForm, state: e.target.value })
                  }
                  className="rounded-lg border border-[#d1c5ae] bg-white px-3 py-2 text-sm focus:border-[#efc13e] focus:outline-none"
                />
                <input
                  placeholder="Endereço"
                  value={editForm.address}
                  onChange={(e) =>
                    setEditForm({ ...editForm, address: e.target.value })
                  }
                  className="rounded-lg border border-[#d1c5ae] bg-white px-3 py-2 text-sm focus:border-[#efc13e] focus:outline-none"
                />
              </div>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={handleCreateUnit}
                  disabled={saving || !editForm.name}
                  className={cn(
                    "flex items-center gap-1 rounded-lg bg-[#efc13e] px-3 py-1.5 text-sm font-medium text-[#1b1c1c]",
                    (!editForm.name || saving) && "cursor-not-allowed opacity-50"
                  )}
                >
                  <Check className="h-3.5 w-3.5" />
                  Criar
                </button>
                <button
                  onClick={() => {
                    setNewUnit(false);
                    setEditForm({ name: "", city: "", state: "", address: "" });
                  }}
                  className="flex items-center gap-1 rounded-lg border border-[#d1c5ae] px-3 py-1.5 text-sm text-[#4e4634]"
                >
                  <X className="h-3.5 w-3.5" />
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {units.length === 0 && !newUnit ? (
            <div className="rounded-xl border border-dashed border-[#d1c5ae] bg-white p-8 text-center">
              <MapPin className="mx-auto h-8 w-8 text-[#d1c5ae]" />
              <p className="mt-2 text-sm text-[#4e4634]">
                Nenhuma unidade operacional cadastrada.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {units.map((unit) => (
                <div
                  key={unit.id}
                  className="rounded-xl border border-[#d1c5ae]/20 bg-white p-4 shadow-sm"
                >
                  {editingUnit === unit.id ? (
                    <div className="space-y-3">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <input
                          value={editForm.name}
                          onChange={(e) =>
                            setEditForm({ ...editForm, name: e.target.value })
                          }
                          className="rounded-lg border border-[#d1c5ae] px-3 py-2 text-sm focus:border-[#efc13e] focus:outline-none"
                        />
                        <input
                          value={editForm.city}
                          onChange={(e) =>
                            setEditForm({ ...editForm, city: e.target.value })
                          }
                          className="rounded-lg border border-[#d1c5ae] px-3 py-2 text-sm focus:border-[#efc13e] focus:outline-none"
                        />
                        <input
                          value={editForm.state}
                          onChange={(e) =>
                            setEditForm({ ...editForm, state: e.target.value })
                          }
                          className="rounded-lg border border-[#d1c5ae] px-3 py-2 text-sm focus:border-[#efc13e] focus:outline-none"
                        />
                        <input
                          value={editForm.address}
                          onChange={(e) =>
                            setEditForm({ ...editForm, address: e.target.value })
                          }
                          className="rounded-lg border border-[#d1c5ae] px-3 py-2 text-sm focus:border-[#efc13e] focus:outline-none"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSaveUnit(unit.id)}
                          disabled={saving}
                          className="flex items-center gap-1 rounded-lg bg-[#efc13e] px-3 py-1.5 text-sm font-medium text-[#1b1c1c]"
                        >
                          <Check className="h-3.5 w-3.5" />
                          Salvar
                        </button>
                        <button
                          onClick={() => setEditingUnit(null)}
                          className="flex items-center gap-1 rounded-lg border border-[#d1c5ae] px-3 py-1.5 text-sm text-[#4e4634]"
                        >
                          <X className="h-3.5 w-3.5" />
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-[#1b1c1c]">
                          {unit.name}
                        </h3>
                        <p className="text-sm text-[#4e4634]">
                          {unit.city}/{unit.state} — {unit.address}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingUnit(unit.id);
                            setEditForm({
                              name: unit.name,
                              city: unit.city,
                              state: unit.state,
                              address: unit.address,
                            });
                          }}
                          className="rounded-lg p-2 text-[#4e4634] hover:bg-[#f5f3f3]"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUnit(unit.id)}
                          className="rounded-lg p-2 text-[#ba1a1a] hover:bg-[#fff5f5]"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "team" && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-[#1b1c1c]">
            Equipe
          </h2>

          <div className="rounded-xl border border-[#d1c5ae]/20 bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead className="border-b border-[#e4e2e2] bg-[#f5f3f3]">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-[#4e4634]">
                    Nome
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-[#4e4634]">
                    E-mail
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-[#4e4634]">
                    Função
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-[#4e4634]">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {team.map((member) => (
                  <tr
                    key={member.id}
                    className="border-b border-[#e4e2e2]/50 last:border-0"
                  >
                    <td className="px-4 py-3 font-medium text-[#1b1c1c]">
                      {member.name}
                    </td>
                    <td className="px-4 py-3 text-[#4e4634]">
                      {member.email}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={member.role}
                        onChange={(e) =>
                          handleRoleChange(member.id, e.target.value as UserRole)
                        }
                        disabled={member.id === user?.id}
                        className="rounded-lg border border-[#d1c5ae] bg-[#f5f3f3] px-2 py-1 text-xs focus:border-[#efc13e] focus:outline-none disabled:opacity-50"
                      >
                        <option value="admin">Administrador</option>
                        <option value="editor">Editor</option>
                        <option value="viewer">Visualizador</option>
                        <option value="auditor">Auditor</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                          member.role === "admin"
                            ? "bg-[#efc13e]/10 text-[#765b00]"
                            : member.role === "editor"
                              ? "bg-[#765b00]/10 text-[#765b00]"
                              : member.role === "auditor"
                                ? "bg-[#5f5e5e]/10 text-[#5f5e5e]"
                                : "bg-[#e4e2e2] text-[#4e4634]"
                        )}
                      >
                        <Shield className="h-3 w-3" />
                        {roleLabels[member.role]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
