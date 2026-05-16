"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { Loader2, ArrowLeft, CheckCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await resetPassword(email);
      setSent(true);
    } catch {
      setError("Erro ao enviar e-mail de recuperação.");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#fbf9f8] px-4">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-7 w-7 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-[#1b1c1c]">E-mail enviado</h1>
          <p className="mt-2 text-sm text-[#4e4634]">
            Verifique sua caixa de entrada para redefinir sua senha.
          </p>
          <Link
            href="/login"
            className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#765b00] hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#fbf9f8] px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#efc13e]">
            <span className="text-xl font-bold text-[#1b1c1c]">O</span>
          </div>
          <h1 className="text-2xl font-bold text-[#1b1c1c]">Recuperar Senha</h1>
          <p className="mt-1 text-sm text-[#4e4634]">
            Informe seu e-mail para receber o link de recuperação
          </p>
        </div>

        <div className="rounded-xl border border-[#d1c5ae]/20 bg-white p-6 shadow-sm sm:p-8">
          {error && (
            <div className="mb-4 rounded-lg border border-[#ba1a1a]/20 bg-[#ffdad6] px-4 py-3 text-sm text-[#93000a]">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-[#4e4634]"
              >
                E-mail
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-lg border border-[#d1c5ae] bg-[#f5f3f3] px-3 py-2.5 text-sm text-[#1b1c1c] placeholder-[#807662] focus:border-[#efc13e] focus:outline-none focus:ring-2 focus:ring-[#efc13e]/20"
                placeholder="seu@email.com"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={cn(
                "flex w-full items-center justify-center rounded-lg bg-[#efc13e] px-4 py-2.5 text-sm font-semibold text-[#1b1c1c] transition-all hover:scale-[1.02] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#efc13e]/50",
                loading && "cursor-not-allowed opacity-70"
              )}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Enviar link"
              )}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-[#4e4634]">
          <Link href="/login" className="inline-flex items-center gap-2 font-semibold text-[#765b00] hover:underline">
            <ArrowLeft className="h-4 w-4" />
            Voltar ao login
          </Link>
        </p>
      </div>
    </div>
  );
}
