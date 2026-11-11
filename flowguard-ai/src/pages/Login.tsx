
import { useState } from "react";
import {
  ShieldCheck,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
} from "lucide-react";

interface LoginProps {
  onLogin?: () => void;
  onRegister?: () => void;
  onBack?: () => void;
}

interface LoginResponse {
  message: string;
  access_token: string;
  token_type: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
}

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ||
  "http://127.0.0.1:8000";

export default function Login({
  onLogin,
  onRegister,
  onBack,
}: LoginProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setError("");

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
            password,
          }),
        }
      );

      const data: LoginResponse | { detail?: string } =
        await response.json();

      if (!response.ok) {
        throw new Error(
          "detail" in data
            ? data.detail || "Login failed."
            : "Login failed."
        );
      }

      if (
        !("access_token" in data) ||
        !data.access_token ||
        !data.user
      ) {
        throw new Error("Invalid login response from server.");
      }

      // Save authentication token.
      localStorage.setItem(
        "access_token",
        data.access_token
      );

      // Save logged-in user information.
      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );

      // Clear password from the form.
      setPassword("");

      // Navigate to dashboard after successful login.
      onLogin?.();

    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to connect to FlowGuard AI."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#05030b] text-white">

      {/* Background glow */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-purple-700/20 blur-[140px]" />

      <div className="pointer-events-none absolute bottom-0 right-0 h-[350px] w-[350px] rounded-full bg-violet-600/10 blur-[120px]" />

      {/* Navbar */}
      <header className="relative z-10 flex items-center justify-between border-b border-white/[0.07] px-5 py-5 sm:px-10">

        <button
          onClick={onBack}
          className="flex items-center gap-3"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-purple-400/30 bg-purple-500/10">
            <ShieldCheck className="h-5 w-5 text-purple-300" />
          </div>

          <span className="text-lg font-bold tracking-tight">
            FlowGuard
            <span className="text-purple-400"> AI</span>
          </span>
        </button>

        <button
          onClick={onRegister}
          className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-gray-300 transition hover:border-purple-400/40 hover:text-white"
        >
          Create account
        </button>

      </header>

      {/* Main */}
      <main className="relative z-10 flex min-h-[calc(100vh-81px)] items-center justify-center px-4 py-10">

        <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-white/[0.08] bg-[#0b0815]/90 shadow-[0_0_100px_rgba(139,92,246,0.08)] lg:grid-cols-2">

          {/* Left panel */}
          <section className="relative hidden flex-col justify-between overflow-hidden border-r border-white/[0.07] bg-gradient-to-br from-purple-950/60 via-[#100b1e] to-[#080611] p-10 lg:flex">

            <div className="absolute -right-20 top-20 h-64 w-64 rounded-full border border-purple-400/10" />

            <div className="absolute -right-10 top-32 h-48 w-48 rounded-full border border-purple-400/10" />

            <div>
              <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-2xl border border-purple-400/20 bg-purple-500/10">
                <Sparkles className="h-6 w-6 text-purple-300" />
              </div>

              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-purple-300">
                Intelligent financial security
              </p>

              <h1 className="max-w-sm text-4xl font-bold leading-tight">
                Your transactions.
                <br />
                <span className="text-purple-400">
                  Protected by intelligence.
                </span>
              </h1>

              <p className="mt-5 max-w-sm text-sm leading-7 text-gray-400">
                Monitor transactions, detect suspicious activity,
                and manage financial security through one intelligent
                platform.
              </p>
            </div>

            <div className="relative mt-12 rounded-2xl border border-purple-400/15 bg-black/20 p-5">

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10">
                    <ShieldCheck className="h-5 w-5 text-purple-300" />
                  </div>

                  <div>
                    <p className="text-sm font-medium">
                      Security monitoring
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      Your dashboard awaits
                    </p>
                  </div>
                </div>

                <span className="rounded-full border border-purple-400/20 bg-purple-400/10 px-3 py-1 text-xs text-purple-300">
                  AI
                </span>
              </div>

              <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/5">
                <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-purple-600 to-violet-300" />
              </div>

            </div>

          </section>

          {/* Login form */}
          <section className="flex items-center justify-center p-6 sm:p-10 lg:p-12">

            <div className="w-full max-w-md">

              <div className="mb-8">

                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl border border-purple-400/20 bg-purple-500/10 lg:hidden">
                  <ShieldCheck className="h-6 w-6 text-purple-300" />
                </div>

                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-purple-400">
                  Welcome back
                </p>

                <h2 className="text-3xl font-bold tracking-tight">
                  Sign in to FlowGuard
                </h2>

                <p className="mt-3 text-sm text-gray-400">
                  Enter your details to access your account.
                </p>

              </div>

              <form
                onSubmit={handleSubmit}
                className="space-y-5"
              >

                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-medium text-gray-300"
                  >
                    Email address
                  </label>

                  <div className="relative">

                    <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />

                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      disabled={loading}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full rounded-xl border border-white/10 bg-white/[0.03] py-3.5 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-purple-400/60 focus:ring-2 focus:ring-purple-500/10 disabled:opacity-50"
                    />

                  </div>
                </div>

                {/* Password */}
                <div>
                  <div className="mb-2 flex items-center justify-between">

                    <label
                      htmlFor="password"
                      className="text-sm font-medium text-gray-300"
                    >
                      Password
                    </label>

                    <button
                      type="button"
                      className="text-xs text-purple-400 transition hover:text-purple-300"
                      onClick={() =>
                        alert("Password recovery is not implemented yet.")
                      }
                    >
                      Forgot password?
                    </button>

                  </div>

                  <div className="relative">

                    <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />

                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      required
                      value={password}
                      disabled={loading}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full rounded-xl border border-white/10 bg-white/[0.03] py-3.5 pl-11 pr-12 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-purple-400/60 focus:ring-2 focus:ring-purple-500/10 disabled:opacity-50"
                    />

                    <button
                      type="button"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 transition hover:text-purple-300"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>

                  </div>
                </div>

                {/* Error message */}
                {error && (
                  <div
                    role="alert"
                    className="rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-300"
                  >
                    {error}
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-purple-900/20 transition hover:from-purple-500 hover:to-violet-500 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Signing in..." : "Sign in"}

                  {!loading && (
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                  )}
                </button>

              </form>

              {/* Register */}
              <div className="mt-7 text-center text-sm text-gray-400">

                Don't have an account?

                <button
                  onClick={onRegister}
                  className="ml-1.5 font-semibold text-purple-400 transition hover:text-purple-300"
                >
                  Create account
                </button>

              </div>

              {/* Footer */}
              <div className="mt-10 flex items-center justify-center gap-2 border-t border-white/[0.07] pt-6 text-xs text-gray-500">
                <ShieldCheck className="h-3.5 w-3.5 text-purple-400" />
                Secure access to your FlowGuard account
              </div>

            </div>

          </section>

        </div>

      </main>

    </div>
  );
}
