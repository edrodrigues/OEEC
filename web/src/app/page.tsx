import Link from "next/link";
import {
  Sun,
  BarChart3,
  Leaf,
  Building2,
  TrendingUp,
  Shield,
  Globe2,
  Zap,
  ArrowRight,
  Menu,
  X,
  CheckCircle2,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#fbf9f8]">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-[#d1c5ae]/20 bg-[#fbf9f8]/80 backdrop-blur-md">
        <nav className="mx-auto flex max-w-[1440px] items-center justify-between px-4 py-4 sm:px-6 lg:px-12">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#efc13e]">
              <Sun className="h-5 w-5 text-[#1b1c1c]" />
            </div>
            <span className="text-xl font-bold text-[#1b1c1c]">OEEC</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm font-medium text-[#4e4634] hover:text-[#765b00] transition-colors">
              Recursos
            </a>
            <a href="#modules" className="text-sm font-medium text-[#4e4634] hover:text-[#765b00] transition-colors">
              Módulos
            </a>
            <a href="#about" className="text-sm font-medium text-[#4e4634] hover:text-[#765b00] transition-colors">
              Sobre
            </a>
            <Link
              href="/login"
              className="text-sm font-semibold text-[#765b00] hover:underline"
            >
              Entrar
            </Link>
            <Link
              href="/register"
              className="rounded-full bg-[#efc13e] px-5 py-2.5 text-sm font-semibold text-[#1b1c1c] transition-all hover:scale-[1.02] hover:shadow-lg"
            >
              Criar conta
            </Link>
          </div>

          {/* Mobile menu button */}
          <MobileMenu />
        </nav>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden px-4 pb-20 pt-16 sm:px-6 sm:pb-28 sm:pt-24 lg:px-12">
        {/* Solar glow */}
        <div className="pointer-events-none absolute -right-32 -top-32 h-[500px] w-[500px] rounded-full bg-[#efc13e]/10 blur-3xl" />
        <div className="pointer-events-none absolute -left-24 top-24 h-[300px] w-[300px] rounded-full bg-[#ffdf93]/10 blur-3xl" />

        <div className="relative mx-auto max-w-[1440px]">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#d1c5ae]/30 bg-white px-4 py-2 text-sm font-medium text-[#4e4634]">
              <Zap className="h-4 w-4 text-[#efc13e]" />
              Plataforma de Inteligência Energética
            </div>

            <h1 className="font-sans text-4xl font-bold leading-[1.17] tracking-[-0.02em] text-[#1b1c1c] sm:text-5xl lg:text-6xl">
              Eficiência energética{" "}
              <span className="text-[#765b00]">iluminada</span> para cidades
              do futuro
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-7 text-[#4e4634] sm:text-xl">
              O Observatório de Eficiência Energética das Cidades monitora,
              analisa e otimiza o consumo de energia com dados em tempo real,
              relatórios ESG e indicadores climáticos.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/register"
                className="group flex items-center gap-2 rounded-full bg-[#efc13e] px-8 py-3.5 text-base font-semibold text-[#1b1c1c] transition-all hover:scale-[1.02] hover:shadow-lg"
              >
                Começar agora
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/login"
                className="flex items-center gap-2 rounded-full border border-[#d1c5ae] bg-white px-8 py-3.5 text-base font-semibold text-[#4e4634] transition-colors hover:bg-[#f5f3f3]"
              >
                Fazer login
              </Link>
            </div>
          </div>

          {/* Hero visual */}
          <div className="mx-auto mt-16 max-w-4xl">
            <div className="rounded-2xl border border-[#d1c5ae]/20 bg-white p-2 shadow-[0_8px_24px_rgba(239,193,62,0.08)] sm:rounded-xl">
              <div className="overflow-hidden rounded-lg bg-[#f5f3f3]">
                <div className="grid grid-cols-2 gap-4 p-6 sm:grid-cols-4 sm:p-8">
                  {[
                    { label: "Consumo (kWh)", value: "12.4M", change: "-8.2%", up: false },
                    { label: "Eficiência", value: "94.7%", change: "+3.1%", up: true },
                    { label: "CO₂ Evitado", value: "2.8kt", change: "+12.4%", up: true },
                    { label: "Score ESG", value: "A+", change: "+2pts", up: true },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-xl border border-[#d1c5ae]/10 bg-white p-4 text-center"
                    >
                      <p className="text-xs font-medium text-[#807662]">{stat.label}</p>
                      <p className="mt-1 text-2xl font-bold text-[#1b1c1c] sm:text-3xl">
                        {stat.value}
                      </p>
                      <p
                        className={`mt-1 text-xs font-semibold ${stat.up ? "text-green-600" : "text-[#765b00]"}`}
                      >
                        {stat.change}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-y border-[#d1c5ae]/15 bg-white">
        <div className="mx-auto max-w-[1440px] px-4 py-10 sm:px-6 sm:py-14 lg:px-12">
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {[
              { value: "150+", label: "Cidades monitoradas" },
              { value: "2.4M", label: "Dados em tempo real" },
              { value: "99.9%", label: "Uptime garantido" },
              { value: "40%", label: "Redução média de consumo" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-bold text-[#765b00] sm:text-4xl">{stat.value}</p>
                <p className="mt-1 text-sm text-[#4e4634]">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-4 py-20 sm:px-6 sm:py-28 lg:px-12">
        <div className="mx-auto max-w-[1440px]">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold leading-10 tracking-[-0.01em] text-[#1b1c1c] sm:text-4xl">
              Recursos que{" "}
              <span className="text-[#765b00]">transformam</span> dados em
              decisão
            </h2>
            <p className="mt-4 text-lg text-[#4e4634]">
              Uma plataforma completa para gestão energética inteligente,
              conformidade ESG e ação climática.
            </p>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: BarChart3,
                title: "Dashboard em Tempo Real",
                description:
                  "Monitore consumo, geração e eficiência energética com visualizações interativas e alertas inteligentes.",
              },
              {
                icon: Leaf,
                title: "Relatórios ESG",
                description:
                  "Gere relatórios de sustentabilidade alinhados com GRI, CDP e TCFD automaticamente.",
              },
              {
                icon: Building2,
                title: "Inventário de Emissões",
                description:
                  "Calcule e gerencie emissões de escopo 1, 2 e 3 com metodologias certificadas pelo GHG Protocol.",
              },
              {
                icon: TrendingUp,
                title: "Ranking de Eficiência",
                description:
                  "Compare desempenho energético entre unidades, cidades e regiões com benchmarks setoriais.",
              },
              {
                icon: Shield,
                title: "Carbono & Créditos",
                description:
                  "Acompanhe seu balanço de carbono e gerencie créditos com rastreabilidade completa.",
              },
              {
                icon: Globe2,
                title: "Mapa Energético",
                description:
                  "Visualize infraestrutura energética em mapas interativos com dados geoespaciais.",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="group rounded-xl border border-[#d1c5ae]/15 bg-white p-6 transition-all hover:border-[#efc13e]/40 hover:shadow-[0_8px_24px_rgba(239,193,62,0.08)]"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[#efc13e]/10 text-[#765b00] transition-colors group-hover:bg-[#efc13e]/20">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-[#1b1c1c]">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-[#4e4634]">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modules */}
      <section
        id="modules"
        className="border-t border-[#d1c5ae]/15 bg-white px-4 py-20 sm:px-6 sm:py-28 lg:px-12"
      >
        <div className="mx-auto max-w-[1440px]">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold leading-10 tracking-[-0.01em] text-[#1b1c1c] sm:text-4xl">
              Módulos da plataforma
            </h2>
            <p className="mt-4 text-lg text-[#4e4634]">
              Cada módulo foi projetado para atender demandas específicas de
              gestão energética e sustentabilidade.
            </p>
          </div>

          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { name: "Dashboard", desc: "Visão geral e KPIs energéticos" },
              { name: "Inventário", desc: "Gestão de emissões GHG" },
              { name: "Ranking", desc: "Benchmark de eficiência" },
              { name: "Mapa", desc: "Visualização geoespacial" },
              { name: "Relatórios", desc: "Geração automatizada ESG" },
              { name: "Carbono", desc: "Balanço e créditos de carbono" },
              { name: "ESG", desc: "Indicadores de sustentabilidade" },
              { name: "Organização", desc: "Gestão de entidades e usuários" },
              { name: "Configurações", desc: "Personalização da plataforma" },
            ].map((mod) => (
              <div
                key={mod.name}
                className="flex items-start gap-4 rounded-lg border border-[#d1c5ae]/10 bg-[#f5f3f3]/50 p-4"
              >
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#efc13e]" />
                <div>
                  <p className="font-semibold text-[#1b1c1c]">{mod.name}</p>
                  <p className="text-sm text-[#4e4634]">{mod.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About / CTA */}
      <section
        id="about"
        className="relative overflow-hidden px-4 py-20 sm:px-6 sm:py-28 lg:px-12"
      >
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#fbf9f8] via-[#f5f3f3] to-[#fbf9f8]" />
        <div className="relative mx-auto max-w-[1440px]">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold leading-10 tracking-[-0.01em] text-[#1b1c1c] sm:text-4xl">
              Pronto para iluminar sua gestão energética?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-[#4e4634]">
              Junte-se a cidades e organizações que já estão transformando dados
              em eficiência real com a plataforma OEEC.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/register"
                className="group flex items-center gap-2 rounded-full bg-[#efc13e] px-8 py-3.5 text-base font-semibold text-[#1b1c1c] transition-all hover:scale-[1.02] hover:shadow-lg"
              >
                Criar conta gratuita
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/login"
                className="text-sm font-semibold text-[#765b00] hover:underline"
              >
                Já tenho uma conta →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#d1c5ae]/15 bg-white">
        <div className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 lg:px-12">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#efc13e]">
                <Sun className="h-4 w-4 text-[#1b1c1c]" />
              </div>
              <span className="text-sm font-semibold text-[#1b1c1c]">
                OEEC
              </span>
            </div>

            <p className="text-sm text-[#4e4634]">
              &copy; {new Date().getFullYear()} Observatório de Eficiência
              Energética das Cidades. Todos os direitos reservados.
            </p>

            <div className="flex items-center gap-6">
              <a
                href="#"
                className="text-sm text-[#4e4634] transition-colors hover:text-[#765b00]"
              >
                Privacidade
              </a>
              <a
                href="#"
                className="text-sm text-[#4e4634] transition-colors hover:text-[#765b00]"
              >
                Termos
              </a>
              <a
                href="#"
                className="text-sm text-[#4e4634] transition-colors hover:text-[#765b00]"
              >
                Contato
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* Mobile menu */
function MobileMenu() {
  return (
    <details className="group md:hidden">
      <summary className="flex cursor-pointer list-none items-center justify-center rounded-lg p-2 text-[#4e4634] hover:bg-[#f5f3f3]">
        <Menu className="h-5 w-5 group-open:hidden" />
        <X className="hidden h-5 w-5 group-open:block" />
      </summary>
      <div className="absolute right-4 top-16 z-50 w-64 rounded-xl border border-[#d1c5ae]/20 bg-white p-4 shadow-[0_8px_24px_rgba(239,193,62,0.08)]">
        <div className="flex flex-col gap-1">
          <a
            href="#features"
            className="rounded-lg px-3 py-2 text-sm font-medium text-[#4e4634] hover:bg-[#f5f3f3]"
          >
            Recursos
          </a>
          <a
            href="#modules"
            className="rounded-lg px-3 py-2 text-sm font-medium text-[#4e4634] hover:bg-[#f5f3f3]"
          >
            Módulos
          </a>
          <a
            href="#about"
            className="rounded-lg px-3 py-2 text-sm font-medium text-[#4e4634] hover:bg-[#f5f3f3]"
          >
            Sobre
          </a>
          <div className="my-2 border-t border-[#d1c5ae]/15" />
          <Link
            href="/login"
            className="rounded-lg px-3 py-2 text-sm font-semibold text-[#765b00] hover:bg-[#f5f3f3]"
          >
            Entrar
          </Link>
          <Link
            href="/register"
            className="mt-1 rounded-full bg-[#efc13e] px-4 py-2.5 text-center text-sm font-semibold text-[#1b1c1c] transition-all hover:shadow-lg"
          >
            Criar conta
          </Link>
        </div>
      </div>
    </details>
  );
}
