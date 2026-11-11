
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import {
  Activity,
  Shield,
  ShieldAlert,
  LayoutDashboard,
  ArrowUpRight,
  Bell,
  Search,
  Menu,
  X,
  CreditCard,
  Users,
  Settings,
  LogOut,
  CircleDollarSign,
  CheckCircle2,
  Clock,
  TrendingUp,
  Wallet,
  RefreshCw,
} from "lucide-react";

/* =========================================================
   TYPES
========================================================= */

interface DashboardProps {
  onLogout?: () => void;
}

interface User {
  id: number;
  name: string;
  email: string;
}

interface Transaction {
  id: number;
  transaction_id: string;
  customer_name: string;
  amount: number;
  payment_method: string;
  status: string;
  risk_score: number;
  risk_level: string;
}

interface DashboardData {
  user: User;
  total_transactions: number;
  total_amount: number;
  fraud_detected: number;
  high_risk_transactions: number;
  medium_risk_transactions: number;
  low_risk_transactions: number;
  average_risk_score: number;
  completed_transactions: number;
  pending_transactions: number;
  failed_transactions: number;
  blocked_transactions: number;
}

/* =========================================================
   CONFIGURATION
========================================================= */

const API_URL = "http://127.0.0.1:8000";

const navigation = [
  { name: "Overview", icon: LayoutDashboard, path: "/dashboard" },
  { name: "Transactions", icon: CreditCard, path: "/transactions" },
  { name: "Payments", icon: Wallet, path: "/payment" },
  { name: "Fraud Detection", icon: ShieldAlert, path: "/fraud-detection" },
  { name: "Customers", icon: Users, path: "/customers" },
  { name: "Analytics", icon: TrendingUp, path: "/analytics" },
  { name: "Settings", icon: Settings, path: "/settings" },
];

/* =========================================================
   HELPERS
========================================================= */

function getInitials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);

  if (words.length === 0) return "U";

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  return (
    words[0][0] + words[words.length - 1][0]
  ).toUpperCase();
}

function formatMoney(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(amount) || 0);
}

function formatDate(value?: string) {
  if (!value) return "Date unavailable";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString();
}

/* =========================================================
   DASHBOARD
========================================================= */

export default function Dashboard({
  onLogout,
}: DashboardProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState("");

  const [user, setUser] = useState<User>({
    id: 0,
    name: "",
    email: "",
  });

  const [dashboard, setDashboard] =
    useState<DashboardData | null>(null);

  const [transactions, setTransactions] =
    useState<Transaction[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const activePage =
    navigation.find((item) => item.path === location.pathname)
      ?.name || "Overview";

  const initials = getInitials(user.name || "User");

  /* =========================================================
     FETCH AUTHENTICATED DATA
  ========================================================= */

  async function loadDashboard() {
    const token = localStorage.getItem("access_token");

    if (!token) {
      navigate("/login");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const headers = {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      };

      const [dashboardResponse, transactionsResponse] =
        await Promise.all([
          fetch(`${API_URL}/api/dashboard`, {
            method: "GET",
            headers,
          }),

          fetch(`${API_URL}/api/transactions`, {
            method: "GET",
            headers,
          }),
        ]);

      if (
        dashboardResponse.status === 401 ||
        transactionsResponse.status === 401
      ) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
        navigate("/login");
        return;
      }

      if (
        !dashboardResponse.ok ||
        !transactionsResponse.ok
      ) {
        throw new Error(
          "Unable to load dashboard data. Please try again."
        );
      }

      const dashboardData: DashboardData =
        await dashboardResponse.json();

      const transactionData: Transaction[] =
        await transactionsResponse.json();

      setDashboard(dashboardData);
      setTransactions(
        Array.isArray(transactionData)
          ? transactionData
          : []
      );

      setUser(dashboardData.user);

      // Keep the authenticated user's information available
      // to the rest of the frontend.
      localStorage.setItem(
        "user",
        JSON.stringify(dashboardData.user)
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  /* =========================================================
     NAVIGATION
  ========================================================= */

  function handleNavigation(path: string) {
    setMenuOpen(false);
    navigate(path);
  }

  function handleLogout() {
    setMenuOpen(false);

    localStorage.removeItem("access_token");
    localStorage.removeItem("user");

    if (onLogout) {
      onLogout();
    } else {
      navigate("/login");
    }
  }

  /* =========================================================
     FILTER TRANSACTIONS
  ========================================================= */

  const filteredTransactions = transactions.filter(
    (transaction) => {
      const query = search.toLowerCase();

      return (
        transaction.transaction_id?.toLowerCase().includes(query) ||
        transaction.customer_name?.toLowerCase().includes(query) ||
        transaction.status?.toLowerCase().includes(query) ||
        transaction.risk_level?.toLowerCase().includes(query)
      );
    }
  );

  /* =========================================================
     SUCCESS RATE
  ========================================================= */

  const totalTransactions =
    dashboard?.total_transactions ?? 0;

  const completedTransactions =
    dashboard?.completed_transactions ?? 0;

  const successRate =
    totalTransactions > 0
      ? (
          (completedTransactions / totalTransactions) *
          100
        ).toFixed(1)
      : "0.0";

  /* =========================================================
     LOADING STATE
  ========================================================= */

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#05030b] text-white">
        <div className="text-center">
          <RefreshCw className="mx-auto h-8 w-8 animate-spin text-purple-400" />

          <p className="mt-4 text-sm text-[#D4D0E0]">
            Loading your FlowGuard dashboard...
          </p>
        </div>
      </div>
    );
  }

  /* =========================================================
     ERROR STATE
  ========================================================= */

  if (error || !dashboard) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#05030b] p-6 text-white">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0b0815] p-8 text-center">
          <ShieldAlert className="mx-auto h-10 w-10 text-purple-300" />

          <h2 className="mt-4 text-xl font-bold">
            Dashboard unavailable
          </h2>

          <p className="mt-3 text-sm text-[#D4D0E0]">
            {error || "Unable to load your account."}
          </p>

          <button
            onClick={loadDashboard}
            className="mt-6 rounded-xl bg-purple-600 px-6 py-3 text-sm font-semibold text-white hover:bg-purple-500"
          >
            Try again
          </button>

          <button
            onClick={handleLogout}
            className="ml-2 rounded-xl border border-white/10 px-6 py-3 text-sm text-white hover:bg-white/10"
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  /* =========================================================
     MAIN UI
  ========================================================= */

  return (
    <div className="min-h-screen bg-[#05030b] text-white">

      {/* MOBILE OVERLAY */}

      {menuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 lg:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* SIDEBAR */}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-white/10 bg-[#090611] transition-transform duration-300 ${
          menuOpen
            ? "translate-x-0"
            : "-translate-x-full"
        } lg:translate-x-0`}
      >
        {/* BRAND */}

        <div className="flex h-20 items-center justify-between border-b border-white/10 px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-purple-400/30 bg-purple-500/10">
              <Shield className="h-5 w-5 text-purple-300" />
            </div>

            <div>
              <h1 className="text-lg font-bold">
                FlowGuard{" "}
                <span className="text-purple-400">
                  AI
                </span>
              </h1>

              <p className="text-xs text-[#D4D0E0]">
                Financial security
              </p>
            </div>
          </div>

          <button
            onClick={() => setMenuOpen(false)}
            className="rounded-lg p-2 hover:bg-white/10 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* NAVIGATION */}

        <div className="flex-1 overflow-y-auto px-4 py-6">
          <p className="mb-4 px-3 text-xs font-semibold uppercase tracking-widest text-[#D4D0E0]">
            Workspace
          </p>

          <nav className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;

              const active = activePage === item.name;

              return (
                <button
                  key={item.name}
                  onClick={() =>
                    handleNavigation(item.path)
                  }
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                    active
                      ? "border border-purple-400/20 bg-purple-500/15 text-white"
                      : "text-white hover:bg-white/[0.05]"
                  }`}
                >
                  <Icon
                    className={`h-5 w-5 ${
                      active
                        ? "text-purple-300"
                        : "text-[#D4D0E0]"
                    }`}
                  />

                  {item.name}

                  {active && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-purple-400" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* SECURITY CENTER */}

          <div className="mt-8 rounded-2xl border border-purple-400/20 bg-purple-500/[0.06] p-4">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-purple-300" />

              <span className="text-sm font-semibold">
                Security center
              </span>
            </div>

            <p className="mt-2 text-xs leading-5 text-[#D4D0E0]">
              Review your transaction activity and security alerts.
            </p>

            <button
              onClick={() =>
                handleNavigation("/fraud-detection")
              }
              className="mt-3 flex items-center gap-1 text-xs font-semibold text-purple-300 hover:text-purple-200"
            >
              View alerts
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* USER PROFILE */}

        <div className="border-t border-white/10 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-purple-400/30 bg-purple-500/20 text-sm font-bold">
              {initials}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">
                {user.name}
              </p>

              <p className="truncate text-xs text-[#D4D0E0]">
                {user.email}
              </p>
            </div>

            <button
              onClick={handleLogout}
              title="Logout"
              className="rounded-lg p-2 hover:bg-white/10"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}

      <main className="min-h-screen lg:ml-72">

        {/* HEADER */}

        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-white/10 bg-[#05030b]/95 px-4 backdrop-blur-xl sm:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMenuOpen(true)}
              className="rounded-xl border border-white/10 p-2.5 hover:bg-white/10 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div>
              <h2 className="text-lg font-bold sm:text-xl">
                {activePage}
              </h2>

              <p className="hidden text-xs text-[#D4D0E0] sm:block">
                Monitor your financial activity
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadDashboard}
              title="Refresh dashboard"
              className="rounded-xl border border-white/10 p-2.5 hover:bg-white/10"
            >
              <RefreshCw className="h-4 w-4 text-purple-300" />
            </button>

            <button
              onClick={() =>
                handleNavigation("/fraud-detection")
              }
              className="relative rounded-xl border border-white/10 p-2.5 hover:bg-white/10"
            >
              <Bell className="h-5 w-5" />

              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-purple-400" />
            </button>

            <button
              onClick={() =>
                handleNavigation("/settings")
              }
              className="flex h-9 w-9 items-center justify-center rounded-full border border-purple-400/30 bg-purple-500/15 text-xs font-bold"
            >
              {initials}
            </button>
          </div>
        </header>

        <div className="mx-auto max-w-[1600px] p-4 sm:p-8">

          {/* PAGE INTRO */}

          <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm text-[#D4D0E0]">
                Welcome back,{" "}
                <span className="font-semibold text-purple-300">
                  {user.name}
                </span>
              </p>

              <h1 className="mt-1 text-2xl font-bold sm:text-3xl">
                Financial overview
              </h1>

              <p className="mt-2 text-sm text-[#D4D0E0]">
                Here is your real transaction activity.
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5">
              <Activity className="h-4 w-4 text-purple-300" />

              <span className="text-xs font-medium">
                Live account data
              </span>
            </div>
          </div>

          {/* STATISTICS */}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

            <StatCard
              title="Total transactions"
              value={totalTransactions.toLocaleString()}
              change="Your account"
              icon={Activity}
            />

            <StatCard
              title="Transaction volume"
              value={formatMoney(dashboard.total_amount)}
              change="Total amount"
              icon={CircleDollarSign}
            />

            <StatCard
              title="Fraud alerts"
              value={dashboard.fraud_detected.toLocaleString()}
              change="High-risk transactions"
              icon={ShieldAlert}
              warning
            />

            <StatCard
              title="Successful payments"
              value={`${successRate}%`}
              change={`${completedTransactions} completed`}
              icon={CheckCircle2}
              positive
            />

          </div>

          {/* CHARTS AND SECURITY */}

          <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-3">

            {/* TRANSACTION SUMMARY */}

            <section className="rounded-2xl border border-white/10 bg-[#0b0815] p-5 sm:p-6 xl:col-span-2">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold">
                    Transaction summary
                  </h3>

                  <p className="mt-1 text-xs text-[#D4D0E0]">
                    Your account transaction statistics
                  </p>
                </div>

                <Activity className="h-5 w-5 text-purple-300" />
              </div>

              <div className="mt-7 grid grid-cols-2 gap-4 sm:grid-cols-4">
                <SummaryItem
                  label="Completed"
                  value={dashboard.completed_transactions}
                />

                <SummaryItem
                  label="Pending"
                  value={dashboard.pending_transactions}
                />

                <SummaryItem
                  label="Failed"
                  value={dashboard.failed_transactions}
                />

                <SummaryItem
                  label="Blocked"
                  value={dashboard.blocked_transactions}
                />
              </div>

              <div className="mt-8">
                <div className="mb-2 flex justify-between text-xs">
                  <span className="text-[#D4D0E0]">
                    Payment success rate
                  </span>

                  <span className="font-semibold text-white">
                    {successRate}%
                  </span>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-purple-700 to-purple-400 transition-all"
                    style={{
                      width: `${Math.min(
                        Number(successRate),
                        100
                      )}%`,
                    }}
                  />
                </div>
              </div>
            </section>

            {/* SECURITY OVERVIEW */}

            <section className="rounded-2xl border border-white/10 bg-[#0b0815] p-5 sm:p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold">
                  Security overview
                </h3>

                <Shield className="h-5 w-5 text-purple-300" />
              </div>

              <p className="mt-2 text-xs text-[#D4D0E0]">
                Risk distribution
              </p>

              <div className="mt-7 space-y-5">
                <RiskRow
                  label="High risk"
                  value={dashboard.high_risk_transactions}
                  color="bg-purple-300"
                  total={totalTransactions}
                />

                <RiskRow
                  label="Medium risk"
                  value={dashboard.medium_risk_transactions}
                  color="bg-violet-400"
                  total={totalTransactions}
                />

                <RiskRow
                  label="Low risk"
                  value={dashboard.low_risk_transactions}
                  color="bg-purple-700"
                  total={totalTransactions}
                />
              </div>

              <div className="mt-7 border-t border-white/10 pt-5">
                <p className="text-xs text-[#D4D0E0]">
                  Average risk score
                </p>

                <p className="mt-2 text-2xl font-bold">
                  {Number(
                    dashboard.average_risk_score
                  ).toFixed(1)}
                </p>
              </div>
            </section>
          </div>

          {/* RECENT TRANSACTIONS */}

          <section className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-[#0b0815]">

            <div className="flex flex-col justify-between gap-4 border-b border-white/10 p-5 sm:flex-row sm:items-center sm:p-6">
              <div>
                <h3 className="text-base font-bold">
                  Recent transactions
                </h3>

                <p className="mt-1 text-xs text-[#D4D0E0]">
                  Transactions belonging to your account
                </p>
              </div>

              <div className="relative w-full sm:max-w-xs">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#D4D0E0]" />

                <input
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search transactions..."
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] py-2.5 pl-10 pr-4 text-sm text-white outline-none placeholder:text-[#B8B2C8] focus:border-purple-400/50"
                />
              </div>
            </div>

            {/* MOBILE */}

            <div className="divide-y divide-white/10 md:hidden">
              {filteredTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold">
                        {transaction.customer_name}
                      </p>

                      <p className="mt-1 text-xs text-[#D4D0E0]">
                        {transaction.transaction_id}
                      </p>
                    </div>

                    <p className="text-sm font-bold">
                      {formatMoney(transaction.amount)}
                    </p>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                    <StatusBadge status={transaction.status} />

                    <RiskBadge risk={transaction.risk_level} />
                  </div>
                </div>
              ))}

              {filteredTransactions.length === 0 && (
                <EmptyTransactions />
              )}
            </div>

            {/* DESKTOP */}

            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[750px] text-left">
                <thead className="bg-white/[0.02]">
                  <tr className="border-b border-white/10">
                    {[
                      "Transaction",
                      "Customer",
                      "Amount",
                      "Payment",
                      "Status",
                      "Risk",
                    ].map((heading) => (
                      <th
                        key={heading}
                        className="px-6 py-4 text-xs font-semibold text-white"
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {filteredTransactions.map((transaction) => (
                    <tr
                      key={transaction.id}
                      className="border-b border-white/[0.06] transition hover:bg-white/[0.02]"
                    >
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium">
                          {transaction.transaction_id}
                        </p>
                      </td>

                      <td className="px-6 py-4">
                        <p className="text-sm font-medium">
                          {transaction.customer_name}
                        </p>
                      </td>

                      <td className="px-6 py-4 text-sm font-semibold">
                        {formatMoney(transaction.amount)}
                      </td>

                      <td className="px-6 py-4 text-sm text-[#D4D0E0]">
                        {transaction.payment_method}
                      </td>

                      <td className="px-6 py-4">
                        <StatusBadge status={transaction.status} />
                      </td>

                      <td className="px-6 py-4">
                        <RiskBadge risk={transaction.risk_level} />
                      </td>
                    </tr>
                  ))}

                  {filteredTransactions.length === 0 && (
                    <tr>
                      <td colSpan={6}>
                        <EmptyTransactions />
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* FOOTER */}

            <div className="flex items-center justify-between border-t border-white/10 px-5 py-4 sm:px-6">
              <p className="text-xs text-[#D4D0E0]">
                Showing {filteredTransactions.length} transactions
              </p>

              <button
                onClick={() =>
                  handleNavigation("/transactions")
                }
                className="flex items-center gap-1 text-xs font-semibold text-purple-300 hover:text-purple-200"
              >
                View transactions

                <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </section>

          {/* FOOTER */}

          <footer className="mt-8 flex flex-col justify-between gap-2 border-t border-white/10 pt-5 sm:flex-row sm:items-center">
            <p className="text-xs text-[#D4D0E0]">
              FlowGuard AI · Financial security dashboard
            </p>

            <p className="text-xs text-[#D4D0E0]">
              Connected to authenticated backend
            </p>
          </footer>

        </div>
      </main>
    </div>
  );
}

/* =========================================================
   STATISTICS CARD
========================================================= */

function StatCard({
  title,
  value,
  change,
  icon: Icon,
  positive,
  warning,
}: {
  title: string;
  value: string;
  change: string;
  icon: typeof Activity;
  positive?: boolean;
  warning?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0b0815] p-5 transition hover:border-purple-400/20 sm:p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-[#D4D0E0]">
            {title}
          </p>

          <p className="mt-3 break-words text-2xl font-bold sm:text-3xl">
            {value}
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-purple-400/20 bg-purple-500/10">
          <Icon className="h-5 w-5 text-purple-300" />
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        {positive && (
          <ArrowUpRight className="h-3.5 w-3.5 text-purple-300" />
        )}

        {warning && (
          <Clock className="h-3.5 w-3.5 text-purple-300" />
        )}

        <span className="text-xs font-medium text-white">
          {change}
        </span>
      </div>
    </div>
  );
}

/* =========================================================
   SUMMARY ITEM
========================================================= */

function SummaryItem({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
      <p className="text-xs text-[#D4D0E0]">
        {label}
      </p>

      <p className="mt-2 text-2xl font-bold">
        {value}
      </p>
    </div>
  );
}

/* =========================================================
   RISK ROW
========================================================= */

function RiskRow({
  label,
  value,
  color,
  total,
}: {
  label: string;
  value: number;
  color: string;
  total: number;
}) {
  const percentage =
    total > 0 ? (value / total) * 100 : 0;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-full ${color}`} />

          <span className="text-sm text-white">
            {label}
          </span>
        </div>

        <span className="text-sm font-semibold">
          {value}
        </span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className={`h-full rounded-full ${color}`}
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>
    </div>
  );
}

/* =========================================================
   STATUS BADGE
========================================================= */

function StatusBadge({
  status,
}: {
  status: string;
}) {
  const styles: Record<string, string> = {
    Completed:
      "border-purple-400/25 bg-purple-500/10 text-white",

    Pending:
      "border-white/15 bg-white/[0.04] text-white",

    Failed:
      "border-red-400/25 bg-red-500/10 text-red-200",

    Blocked:
      "border-purple-700/40 bg-purple-900/20 text-white",

    Review:
      "border-violet-300/25 bg-violet-400/10 text-white",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${
        styles[status] ||
        "border-white/15 bg-white/[0.04] text-white"
      }`}
    >
      {status}
    </span>
  );
}

/* =========================================================
   RISK BADGE
========================================================= */

function RiskBadge({
  risk,
}: {
  risk: string;
}) {
  return (
    <span className="inline-flex items-center gap-2 text-xs font-medium text-white">
      <span
        className={`h-2 w-2 rounded-full ${
          risk === "High"
            ? "bg-purple-300"
            : risk === "Medium"
              ? "bg-violet-400"
              : "bg-purple-600"
        }`}
      />

      {risk || "Low"}
    </span>
  );
}

/* =========================================================
   EMPTY TRANSACTIONS
========================================================= */

function EmptyTransactions() {
  return (
    <div className="px-6 py-12 text-center">
      <CreditCard className="mx-auto h-9 w-9 text-purple-300" />

      <h3 className="mt-4 text-sm font-semibold text-white">
        No transactions yet
      </h3>

      <p className="mt-2 text-xs text-[#D4D0E0]">
        Your transactions will appear here when you make your first payment.
      </p>
    </div>
  );
}
