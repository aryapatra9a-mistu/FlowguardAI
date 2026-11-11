
import {
  ArrowRight,
  Activity,
  ShieldCheck,
  BrainCircuit,
  LockKeyhole,
  Zap,
  Fingerprint,
  CreditCard,
  Sparkles,
  Menu,
  X,
  TrendingUp,
  ShieldAlert,
  CheckCircle2,
  Clock,
  CircleDollarSign,
  Wallet,
  ChevronRight,
  Shield,
} from "lucide-react";

import { useState } from "react";
import { useNavigate } from "react-router-dom";


export default function Landing() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const goToLogin = () => {
    setMenuOpen(false);
    navigate("/login");
  };

  const features = [
    {
      icon: ShieldCheck,
      title: "TrustGuard AI",
      description:
        "Identify duplicate payment attempts and unusual transaction patterns before they become costly problems.",
      color: "text-purple-400",
    },
    {
      icon: BrainCircuit,
      title: "RecoveryPilot AI",
      description:
        "Understand failed and pending payments with intelligent explanations and safer recovery recommendations.",
      color: "text-fuchsia-400",
    },
    {
      icon: Activity,
      title: "MerchantMind AI",
      description:
        "Transform payment performance data into actionable insights that help merchants improve success rates.",
      color: "text-violet-400",
    },
  ];

  const transactions = [
    {
      name: "Online payment",
      id: "FG-20481",
      amount: "$128.00",
      status: "Verified",
      color: "text-emerald-400",
      icon: CreditCard,
    },
    {
      name: "Merchant checkout",
      id: "FG-20482",
      amount: "$84.50",
      status: "Pending",
      color: "text-amber-400",
      icon: Wallet,
    },
    {
      name: "Digital purchase",
      id: "FG-20483",
      amount: "$42.00",
      status: "Failed",
      color: "text-red-400",
      icon: CircleDollarSign,
    },
  ];

  return (
    <main className="min-h-screen overflow-hidden bg-[#050309] text-white">

      {/* BACKGROUND GLOW */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-48 top-20 h-[500px] w-[500px] rounded-full bg-purple-700/15 blur-[150px]" />

        <div className="absolute right-0 top-40 h-[500px] w-[500px] rounded-full bg-violet-600/10 blur-[150px]" />

        <div className="absolute bottom-0 left-1/2 h-[400px] w-[700px] -translate-x-1/2 rounded-full bg-purple-900/10 blur-[150px]" />
      </div>

      {/* NAVIGATION */}

      <header className="relative z-20 border-b border-white/[0.07] bg-[#050309]/80 backdrop-blur-xl">

        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10">

          {/* LOGO */}

          <a href="/" className="flex items-center gap-3">

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-purple-400/30 bg-gradient-to-br from-purple-500 to-violet-800 shadow-[0_0_30px_rgba(139,92,246,0.25)]">

              <ShieldCheck size={25} />

            </div>

            <div>

              <div className="text-xl font-bold tracking-tight">

                FlowGuard <span className="text-purple-400">AI</span>

              </div>

              <div className="text-[9px] font-semibold tracking-[0.3em] text-gray-500">

                PAYMENT INTELLIGENCE

              </div>

            </div>

          </a>

          {/* DESKTOP NAV */}

          <div className="hidden items-center gap-9 md:flex">

            <a
              href="#intelligence"
              className="text-sm text-gray-400 transition hover:text-purple-300"
            >
              Intelligence
            </a>

            <a
              href="#how-it-works"
              className="text-sm text-gray-400 transition hover:text-purple-300"
            >
              How it works
            </a>

            <a
              href="#security"
              className="text-sm text-gray-400 transition hover:text-purple-300"
            >
              Security
            </a>

          </div>

          {/* ACTIONS */}

          <div className="hidden items-center gap-5 md:flex">

            <button
              onClick={goToLogin}
              className="text-sm font-medium text-gray-300 transition hover:text-white"
            >
              Sign in
            </button>

            <button
              onClick={goToLogin}
              className="rounded-xl border border-purple-400/30 bg-gradient-to-r from-purple-600 to-violet-600 px-5 py-3 text-sm font-semibold shadow-[0_0_25px_rgba(139,92,246,0.2)] transition hover:-translate-y-0.5 hover:shadow-[0_0_35px_rgba(139,92,246,0.4)]"
            >
              Get started <ArrowRight className="ml-2 inline" size={15} />
            </button>

          </div>

          {/* MOBILE MENU */}

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="rounded-lg border border-white/10 p-2 md:hidden"
            aria-label="Toggle navigation"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

        </nav>

        {menuOpen && (

          <div className="border-t border-white/10 bg-[#0a0711] px-6 py-6 md:hidden">

            <div className="flex flex-col gap-5">

              <a href="#intelligence" onClick={() => setMenuOpen(false)}>
                Intelligence
              </a>

              <a href="#how-it-works" onClick={() => setMenuOpen(false)}>
                How it works
              </a>

              <a href="#security" onClick={() => setMenuOpen(false)}>
                Security
              </a>

              <button
                onClick={goToLogin}
                className="rounded-xl bg-purple-600 px-5 py-3 font-semibold"
              >
                Get started
              </button>

            </div>

          </div>

        )}

      </header>

      {/* HERO */}

      <section className="relative z-10 mx-auto grid max-w-7xl items-center gap-16 px-6 pb-24 pt-20 lg:grid-cols-2 lg:px-10 lg:pb-32 lg:pt-28">

        {/* HERO CONTENT */}

        <div>

          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-purple-500/25 bg-purple-500/[0.07] px-4 py-2">

            <span className="h-2 w-2 animate-pulse rounded-full bg-purple-400" />

            <span className="text-[11px] font-semibold tracking-[0.15em] text-purple-300">

              THE NEXT LAYER OF PAYMENT TRUST

            </span>

          </div>

          <h1 className="max-w-3xl text-5xl font-bold leading-[1.08] tracking-[-0.05em] sm:text-6xl lg:text-[76px]">

            Payments are

            <br />

            complicated.

            <br />

            <span className="bg-gradient-to-r from-purple-400 via-violet-300 to-fuchsia-400 bg-clip-text text-transparent">

              Trust shouldn't be.

            </span>

          </h1>

          <p className="mt-7 max-w-xl text-base leading-8 text-gray-400 sm:text-lg">

            Meet the intelligence layer that protects payments, explains failures,
            and turns uncertainty into confident decisions.

          </p>

          {/* CTA */}

          <div className="mt-9 flex flex-wrap gap-4">

            <button
              onClick={goToLogin}
              className="group rounded-xl border border-purple-400/40 bg-gradient-to-r from-purple-600 to-violet-600 px-6 py-4 text-sm font-semibold shadow-[0_0_30px_rgba(139,92,246,0.25)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_0_45px_rgba(139,92,246,0.4)]"
            >

              Experience FlowGuard

              <ArrowRight
                size={17}
                className="ml-2 inline transition group-hover:translate-x-1"
              />

            </button>

            <a
              href="#intelligence"
              className="rounded-xl border border-white/10 bg-white/[0.03] px-6 py-4 text-sm font-semibold text-gray-300 transition hover:border-purple-400/30 hover:bg-purple-500/[0.05]"
            >

              Discover intelligence

            </a>

          </div>

          {/* TRUST INDICATORS */}

          <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-xs text-gray-500">

            <div className="flex items-center gap-2">

              <LockKeyhole size={14} className="text-purple-400" />

              Secure architecture

            </div>

            <div className="flex items-center gap-2">

              <ShieldAlert size={14} className="text-purple-400" />

              Risk-aware recovery

            </div>

            <div className="flex items-center gap-2">

              <CheckCircle2 size={14} className="text-purple-400" />

              PayPal Sandbox

            </div>

          </div>

        </div>

        {/* DASHBOARD PREVIEW */}

        <div className="relative">

          <div className="absolute -inset-8 rounded-[40px] bg-purple-600/[0.08] blur-[70px]" />

          <div className="relative overflow-hidden rounded-[26px] border border-purple-400/20 bg-[#100d19] p-5 shadow-[0_30px_100px_rgba(0,0,0,0.6)] sm:p-7">

            {/* HEADER */}

            <div className="flex items-center justify-between">

              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-purple-400/20 bg-purple-500/10">

                  <Activity size={21} className="text-purple-400" />

                </div>

                <div>

                  <div className="text-sm font-semibold">
                    Payment intelligence
                  </div>

                  <div className="mt-1 text-xs text-gray-500">
                    Overview / Monitoring
                  </div>

                </div>

              </div>

              <span className="rounded-lg border border-amber-500/20 bg-amber-500/[0.07] px-3 py-2 text-[10px] font-bold tracking-wide text-amber-400">

                DEMO DATA

              </span>

            </div>

            {/* CHART CARD */}

            <div className="mt-7 rounded-2xl border border-white/[0.06] bg-[#15111f] p-5">

              <div className="flex items-center justify-between">

                <span className="text-xs text-gray-400">
                  Sample transaction volume
                </span>

                <TrendingUp size={17} className="text-purple-400" />

              </div>

              <div className="mt-3 flex items-end justify-between">

                <div className="text-3xl font-bold tracking-tight">
                  $24,680
                </div>

                <span className="rounded-lg bg-emerald-500/10 px-3 py-2 text-[10px] font-semibold text-emerald-400">
                  Sample
                </span>

              </div>

              <div className="mt-2 text-[10px] text-gray-500">
                Illustrative dashboard preview
              </div>

              {/* BAR CHART */}

              <div className="mt-7 flex h-24 items-end gap-2">

                {[30, 45, 34, 61, 42, 72, 52, 83, 55, 66, 88, 73].map(
                  (height, index) => (

                    <div
                      key={index}
                      className="flex-1 rounded-t-md bg-gradient-to-t from-purple-800 to-purple-400 transition duration-300 hover:from-purple-600 hover:to-fuchsia-300"
                      style={{ height: `${height}%` }}
                    />

                  )
                )}

              </div>

            </div>

            {/* AI INSIGHT */}

            <div className="mt-4 rounded-2xl border border-purple-400/20 bg-gradient-to-r from-purple-500/[0.08] to-violet-500/[0.03] p-4">

              <div className="flex items-start gap-3">

                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-purple-500/10">

                  <Sparkles size={17} className="text-purple-400" />

                </div>

                <div className="flex-1">

                  <div className="flex items-center justify-between">

                    <span className="text-xs font-semibold">
                      RecoveryPilot AI
                    </span>

                    <span className="text-[9px] font-bold text-purple-400">
                      DEMO
                    </span>

                  </div>

                  <p className="mt-2 text-xs leading-5 text-gray-400">

                    Sample insight: verify the original payment status before
                    attempting recovery.

                  </p>

                </div>

              </div>

            </div>

            {/* TRANSACTION PREVIEW */}

            <div className="mt-6">

              <div className="mb-4 flex items-center justify-between">

                <span className="text-xs font-semibold">
                  Transaction preview
                </span>

                <span className="text-[10px] text-gray-500">
                  Illustrative records
                </span>

              </div>

              <div className="space-y-3">

                {transactions.map((transaction) => {

                  const Icon = transaction.icon;

                  return (

                    <div
                      key={transaction.id}
                      className="flex items-center justify-between rounded-xl border border-white/[0.05] bg-white/[0.02] p-3 transition hover:border-purple-400/20 hover:bg-purple-500/[0.03]"
                    >

                      <div className="flex items-center gap-3">

                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.04]">

                          <Icon size={16} className="text-gray-400" />

                        </div>

                        <div>

                          <div className="text-xs font-medium">
                            {transaction.name}
                          </div>

                          <div className="mt-1 text-[10px] text-gray-500">
                            {transaction.id}
                          </div>

                        </div>

                      </div>

                      <div className="text-right">

                        <div className="text-xs font-semibold">
                          {transaction.amount}
                        </div>

                        <div className={`mt-1 text-[10px] ${transaction.color}`}>
                          {transaction.status}
                        </div>

                      </div>

                    </div>

                  );

                })}

              </div>

            </div>

            {/* FOOTER */}

            <div className="mt-5 flex items-center justify-between border-t border-white/[0.06] pt-4">

              <div className="flex items-center gap-2 text-[10px] text-gray-500">

                <Shield size={13} className="text-purple-400" />

                Illustrative records only

              </div>

              <div className="text-[10px] font-medium text-purple-400">

                FlowGuard AI

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* INTELLIGENCE SECTION */}

      <section
        id="intelligence"
        className="relative z-10 border-t border-white/[0.06] bg-[#08050d] px-6 py-24 lg:px-10"
      >

        <div className="mx-auto max-w-7xl">

          <div className="max-w-2xl">

            <div className="text-xs font-semibold tracking-[0.2em] text-purple-400">

              PAYMENT INTELLIGENCE

            </div>

            <h2 className="mt-5 text-3xl font-bold tracking-tight sm:text-5xl">

              Three intelligent layers.

              <br />

              <span className="text-purple-400">
                One trusted experience.
              </span>

            </h2>

            <p className="mt-5 max-w-xl leading-7 text-gray-400">

              From transaction protection to payment recovery and merchant
              intelligence, FlowGuard brings clarity to every payment decision.

            </p>

          </div>

          <div className="mt-14 grid gap-5 md:grid-cols-3">

            {features.map((feature, index) => {

              const Icon = feature.icon;

              return (

                <div
                  key={feature.title}
                  className="group rounded-2xl border border-white/[0.07] bg-[#100c18] p-7 transition duration-300 hover:-translate-y-1 hover:border-purple-400/30 hover:shadow-[0_20px_60px_rgba(139,92,246,0.08)]"
                >

                  <div className="flex items-center justify-between">

                    <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-purple-400/20 bg-purple-500/[0.08]">

                      <Icon size={23} className={feature.color} />

                    </div>

                    <span className="text-xs text-gray-600">
                      0{index + 1}
                    </span>

                  </div>

                  <h3 className="mt-7 text-xl font-semibold">
                    {feature.title}
                  </h3>

                  <p className="mt-4 text-sm leading-7 text-gray-400">
                    {feature.description}
                  </p>

                  <div className="mt-7 flex items-center gap-2 text-xs font-medium text-purple-400">

                    Explore intelligence

                    <ChevronRight
                      size={15}
                      className="transition group-hover:translate-x-1"
                    />

                  </div>

                </div>

              );

            })}

          </div>

        </div>

      </section>

      {/* HOW IT WORKS */}

      <section
        id="how-it-works"
        className="relative z-10 border-t border-white/[0.06] px-6 py-24 lg:px-10"
      >

        <div className="mx-auto max-w-7xl">

          <div className="text-center">

            <div className="text-xs font-semibold tracking-[0.2em] text-purple-400">

              HOW IT WORKS

            </div>

            <h2 className="mt-5 text-3xl font-bold sm:text-5xl">

              Intelligence at every step.

            </h2>

            <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-gray-400">

              A smarter payment experience built around verification, transparency,
              and safer decisions.

            </p>

          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">

            {[
              {
                icon: CreditCard,
                title: "Payment initiated",
                description:
                  "A customer begins a payment through a supported provider.",
              },
              {
                icon: Fingerprint,
                title: "Intelligence activated",
                description:
                  "Transaction monitoring checks for duplicates and unusual patterns.",
              },
              {
                icon: ShieldCheck,
                title: "Trusted decisions",
                description:
                  "Verified payment information supports safer recovery decisions.",
              },
            ].map((step, index) => {

              const Icon = step.icon;

              return (

                <div key={step.title} className="relative text-center">

                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-purple-400/20 bg-purple-500/[0.08] shadow-[0_0_30px_rgba(139,92,246,0.08)]">

                    <Icon size={25} className="text-purple-400" />

                  </div>

                  <div className="mt-6 text-[10px] font-bold tracking-[0.2em] text-purple-400">

                    STEP 0{index + 1}

                  </div>

                  <h3 className="mt-3 text-lg font-semibold">
                    {step.title}
                  </h3>

                  <p className="mx-auto mt-3 max-w-xs text-sm leading-7 text-gray-400">
                    {step.description}
                  </p>

                </div>

              );

            })}

          </div>

        </div>

      </section>

      {/* SECURITY */}

      <section
        id="security"
        className="relative z-10 border-t border-white/[0.06] bg-[#090610] px-6 py-24 lg:px-10"
      >

        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">

          <div>

            <div className="text-xs font-semibold tracking-[0.2em] text-purple-400">

              SECURITY BY DESIGN

            </div>

            <h2 className="mt-5 text-3xl font-bold leading-tight sm:text-5xl">

              Trust is not a feature.

              <br />

              <span className="text-purple-400">
                It's the foundation.
              </span>

            </h2>

            <p className="mt-6 max-w-xl text-sm leading-7 text-gray-400">

              FlowGuard is designed around payment verification, responsible
              recovery, and clear separation between real provider data and
              illustrative demonstrations.

            </p>

          </div>

          <div className="grid gap-4 sm:grid-cols-2">

            {[
              {
                icon: LockKeyhole,
                title: "Secure architecture",
                text: "Sensitive payment operations stay on the backend.",
              },
              {
                icon: ShieldAlert,
                title: "Risk monitoring",
                text: "Identify potentially duplicated or unusual activity.",
              },
              {
                icon: CheckCircle2,
                title: "Verified status",
                text: "Payment success depends on provider verification.",
              },
              {
                icon: Clock,
                title: "Safer recovery",
                text: "Check the original payment before attempting recovery.",
              },
            ].map((item) => {

              const Icon = item.icon;

              return (

                <div
                  key={item.title}
                  className="rounded-2xl border border-white/[0.07] bg-[#100c18] p-5"
                >

                  <Icon size={21} className="text-purple-400" />

                  <h3 className="mt-4 text-sm font-semibold">
                    {item.title}
                  </h3>

                  <p className="mt-2 text-xs leading-6 text-gray-400">
                    {item.text}
                  </p>

                </div>

              );

            })}

          </div>

        </div>

      </section>

      {/* FINAL CTA */}

      <section className="relative z-10 px-6 py-24 lg:px-10">

        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl border border-purple-400/20 bg-[#100b19] px-7 py-16 text-center sm:px-14">

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-purple-600/[0.12] via-transparent to-violet-600/[0.08]" />

          <div className="relative">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-purple-400/30 bg-purple-500/10">

              <Zap size={25} className="text-purple-400" />

            </div>

            <h2 className="mt-7 text-3xl font-bold sm:text-5xl">

              Payments deserve

              <br />

              <span className="text-purple-400">
                a smarter layer.
              </span>

            </h2>

            <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-gray-400">

              Experience a new approach to payment intelligence, recovery, and
              transaction trust.

            </p>

            <button
              onClick={goToLogin}
              className="mt-9 rounded-xl border border-purple-400/30 bg-gradient-to-r from-purple-600 to-violet-600 px-7 py-4 text-sm font-semibold shadow-[0_0_35px_rgba(139,92,246,0.2)] transition hover:-translate-y-1 hover:shadow-[0_0_45px_rgba(139,92,246,0.4)]"
            >

              Get started

              <ArrowRight size={16} className="ml-2 inline" />

            </button>

          </div>

        </div>

      </section>

      {/* FOOTER */}

      <footer className="relative z-10 border-t border-white/[0.07] px-6 py-8 lg:px-10">

        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 sm:flex-row">

          <a href="/" className="flex items-center gap-3">

            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-600">

              <ShieldCheck size={18} />

            </div>

            <span className="text-sm font-semibold">

              FlowGuard <span className="text-purple-400">AI</span>

            </span>

          </a>

          <p className="text-center text-xs text-gray-500">

            © {new Date().getFullYear()} FlowGuard AI. The Intelligence Layer
            for Trustworthy Payments.

          </p>

          <div className="flex items-center gap-2 text-xs text-gray-500">

            <ShieldCheck size={14} className="text-purple-400" />

            Built for payment trust

          </div>

        </div>

      </footer>

    </main>
  );
}
