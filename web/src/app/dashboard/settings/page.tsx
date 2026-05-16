"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { updateProfile, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { cn } from "@/lib/utils";
import {
  Loader2,
  User,
  Shield,
  Bell,
  Palette,
  Save,
  Eye,
  EyeOff,
} from "lucide-react";

export default function SettingsPage() {
  const { user, firebaseUser } = useAuth();
  const [activeTab, setActiveTab] = useState<"profile" | "security" | "notifications" | "appearance">("profile");
  const [saving, setSaving] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
  });

  // Sync profile form when user data arrives
  if (user && profileForm.name === "" && profileForm.email === "") {
    setProfileForm({ name: user.name, email: user.email });
  }

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [notifications, setNotifications] = useState({
    emailReports: true,
    emailAlerts: true,
    emailRanking: false,
    pushNotifications: true,
  });

  async function handleSaveProfile() {
    setSaving(true);
    if (firebaseUser) {
      await updateProfile(firebaseUser, { displayName: profileForm.name });
    }
    setSaving(false);
  }

  async function handleChangePassword() {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) return;
    if (passwordForm.newPassword.length < 6) return;
    setSaving(true);
    if (firebaseUser && passwordForm.currentPassword) {
      const credential = EmailAuthProvider.credential(
        firebaseUser.email!,
        passwordForm.currentPassword
      );
      await reauthenticateWithCredential(firebaseUser, credential);
      await updatePassword(firebaseUser, passwordForm.newPassword);
    }
    setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setSaving(false);
  }

  const tabs = [
    { id: "profile" as const, label: "Perfil", icon: User },
    { id: "security" as const, label: "Segurança", icon: Shield },
    { id: "notifications" as const, label: "Notificações", icon: Bell },
    { id: "appearance" as const, label: "Aparência", icon: Palette },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1b1c1c] sm:text-3xl">
          Configurações
        </h1>
        <p className="mt-1 text-[#4e4634]">
          Gerencie preferências da conta e da organização.
        </p>
      </div>

      <div className="flex gap-1 overflow-x-auto rounded-xl border border-[#d1c5ae]/20 bg-white p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              activeTab === tab.id
                ? "bg-[#efc13e] text-[#1b1c1c]"
                : "text-[#4e4634] hover:bg-[#f5f3f3]"
            )}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "profile" && (
        <div className="rounded-xl border border-[#d1c5ae]/20 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-[#1b1c1c]">Dados do Perfil</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-[#4e4634]">Nome</label>
              <input
                type="text"
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                className="mt-1 w-full rounded-lg border border-[#d1c5ae] bg-[#f5f3f3] px-3 py-2.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#4e4634]">E-mail</label>
              <input
                type="email"
                value={profileForm.email}
                disabled
                className="mt-1 w-full rounded-lg border border-[#d1c5ae] bg-[#e4e2e2] px-3 py-2.5 text-sm text-[#807662]"
              />
            </div>
          </div>
          <button
            onClick={handleSaveProfile}
            disabled={saving}
            className={cn(
              "mt-4 flex items-center gap-2 rounded-lg bg-[#efc13e] px-4 py-2 text-sm font-semibold text-[#1b1c1c] hover:scale-[1.02]",
              saving && "cursor-not-allowed opacity-70"
            )}
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Salvar
          </button>
        </div>
      )}

      {activeTab === "security" && (
        <div className="rounded-xl border border-[#d1c5ae]/20 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-[#1b1c1c]">Alterar Senha</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#4e4634]">Senha atual</label>
              <div className="relative mt-1">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  className="w-full rounded-lg border border-[#d1c5ae] bg-[#f5f3f3] px-3 py-2.5 pr-10 text-sm"
                />
                <button
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#807662]"
                >
                  {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#4e4634]">Nova senha</label>
              <div className="relative mt-1">
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="w-full rounded-lg border border-[#d1c5ae] bg-[#f5f3f3] px-3 py-2.5 pr-10 text-sm"
                />
                <button
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#807662]"
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#4e4634]">Confirmar nova senha</label>
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                className="mt-1 w-full rounded-lg border border-[#d1c5ae] bg-[#f5f3f3] px-3 py-2.5 text-sm"
              />
            </div>
            <button
              onClick={handleChangePassword}
              disabled={saving || !passwordForm.currentPassword || !passwordForm.newPassword}
              className={cn(
                "flex items-center gap-2 rounded-lg bg-[#efc13e] px-4 py-2 text-sm font-semibold text-[#1b1c1c] hover:scale-[1.02]",
                (!passwordForm.currentPassword || !passwordForm.newPassword || saving) && "cursor-not-allowed opacity-50"
              )}
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Alterar senha
            </button>
          </div>
        </div>
      )}

      {activeTab === "notifications" && (
        <div className="rounded-xl border border-[#d1c5ae]/20 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-[#1b1c1c]">Preferências de Notificação</h3>
          <div className="space-y-4">
            {Object.entries({
              emailReports: "Relatórios por e-mail",
              emailAlerts: "Alertas de inconsistência",
              emailRanking: "Atualizações de ranking",
              pushNotifications: "Notificações push",
            }).map(([key, label]) => (
              <label key={key} className="flex items-center justify-between rounded-lg border border-[#d1c5ae]/10 p-3">
                <span className="text-sm text-[#4e4634]">{label}</span>
                <input
                  type="checkbox"
                  checked={notifications[key as keyof typeof notifications]}
                  onChange={(e) => setNotifications({ ...notifications, [key]: e.target.checked })}
                  className="h-4 w-4 accent-[#efc13e]"
                />
              </label>
            ))}
          </div>
        </div>
      )}

      {activeTab === "appearance" && (
        <div className="rounded-xl border border-[#d1c5ae]/20 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-[#1b1c1c]">Aparência</h3>
          <p className="text-sm text-[#4e4634]">
            O tema Solar SaaS está ativo. Temas adicionais estarão disponíveis em breve.
          </p>
          <div className="mt-4 flex gap-3">
            <div className="rounded-lg border-2 border-[#efc13e] p-3 text-center">
              <div className="h-8 w-16 rounded bg-[#fbf9f8]" />
              <p className="mt-1 text-xs text-[#4e4634]">Claro</p>
            </div>
            <div className="rounded-lg border border-[#d1c5ae]/20 p-3 text-center opacity-50">
              <div className="h-8 w-16 rounded bg-[#303031]" />
              <p className="mt-1 text-xs text-[#4e4634]">Escuro (em breve)</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
