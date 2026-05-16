"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export default function LoginPage() {
  const { signIn, signInWithGoogle } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signIn(email, password);
      router.push("/dashboard");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Erro ao fazer login. Verifique suas credenciais.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError("");
    setLoading(true);

    try {
      await signInWithGoogle();
      router.push("/dashboard");
    } catch {
      setError("Erro ao fazer login com Google.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#fbf9f8] px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#efc13e]">
            <span className="text-xl font-bold text-[#1b1c1c]">O</span>
          </div>
          <h1 className="text-2xl font-bold text-[#1b1c1c]">OEEC</h1>
          <p className="mt-1 text-sm text-[#4e4634]">
            Observatório de Eficiência Energética das Cidades
          </p>
        </div>

        <div className="rounded-xl border border-[#d1c5ae]/20 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-xl font-semibold text-[#1b1c1c]">Entrar</h2>
          <p className="mt-1 text-sm text-[#4e4634]">
            Acesse sua conta para continuar
          </p>

          {error && (
            <div className="mt-4 rounded-lg border border-[#ba1a1a]/20 bg-[#ffdad6] px-4 py-3 text-sm text-[#93000a]">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
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

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-[#4e4634]"
              >
                Senha
              </label>
              <div className="relative mt-1">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-[#d1c5ae] bg-[#f5f3f3] px-3 py-2.5 pr-10 text-sm text-[#1b1c1c] placeholder-[#807662] focus:border-[#efc13e] focus:outline-none focus:ring-2 focus:ring-[#efc13e]/20"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#807662] hover:text-[#4e4634]"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Link
                href="/forgot-password"
                className="text-sm font-medium text-[#765b00] hover:underline"
              >
                Esqueceu a senha?
              </Link>
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
                "Entrar"
              )}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#d1c5ae]/30" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-2 text-[#807662]">ou continue com</span>
              </div>
            </div>

            <button
              onClick={handleGoogle}
              disabled={loading}
              className={cn(
                "mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-[#d1c5ae] bg-white px-4 py-2.5 text-sm font-medium text-[#4e4634] transition-colors hover:bg-[#f5f3f3]",
                loading && "cursor-not-allowed opacity-70"
              )}
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google
            </button>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-[#4e4634]">
          Não tem uma conta?{" "}
          <Link href="/register" className="font-semibold text-[#765b00] hover:underline">
            Criar conta
          </Link>
        </p>
      </div>
    </div>
  );
}
