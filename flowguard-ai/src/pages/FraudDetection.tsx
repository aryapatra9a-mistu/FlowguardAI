import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, ShieldAlert, ShieldCheck, Activity, Search,
  Filter, Eye, AlertTriangle, XCircle, TrendingUp,
  RefreshCw, ChevronDown,
} from "lucide-react";

type RiskLevel = "High" | "Medium" | "Low";

type ApiTransaction = {
  id: number;
  transaction_id: string;
  customer_name: string;
  amount: number;
  payment_method: string;
  status: string;
  risk_score: number;
  risk_level: string;
};

type FraudTransaction = {
  id: string;
  customer: string;
  amount: number;
  method: string;
  risk: RiskLevel;
  score: number;
  status: string;
};

const API_URL = "http://127.0.0.1:8000";

const formatAmount = (amount: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(amount);

const normalizeRisk = (risk: string): RiskLevel => {
  const value = risk?.toLowerCase();
  if (value === "high") return "High";
  if (value === "medium") return "Medium";
  return "Low";
};

export default function FraudDetection() {
  const navigate = useNavigate();

  const [transactions, setTransactions] = useState<FraudTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selected, setSelected] = useState<FraudTransaction | null>(null);

  const loadTransactions = async () => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      setError("Please log in to view your transactions.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/api/transactions`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
        navigate("/login");
        return;
      }

      if (!response.ok) {
        throw new Error(`Unable to load transactions. HTTP ${response.status}`);
      }

      const data: ApiTransaction[] = await response.json();

      setTransactions(
        data.map((item) => ({
          id: item.transaction_id || String(item.id),
          customer: item.customer_name || "Unknown customer",
          amount: Number(item.amount) || 0,
          method: item.payment_method || "Not specified",
          risk: normalizeRisk(item.risk_level),
          score: Math.max(0, Math.min(100, Number(item.risk_score) || 0)),
          status: item.status || "Pending",
        }))
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load transaction data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  const highRisk = transactions.filter(t => t.risk === "High").length;
  const mediumRisk = transactions.filter(t => t.risk === "Medium").length;
  const lowRisk = transactions.filter(t => t.risk === "Low").length;
  const blocked = transactions.filter(
    t => t.status.toLowerCase() === "blocked"
  ).length;

  const flagged = transactions.filter(
    t => t.risk === "High" || t.risk === "Medium"
  ).length;

  const filteredTransactions = useMemo(() => {
    const query = search.trim().toLowerCase();

    return transactions.filter(t => {
      const searchMatch =
        !query ||
        t.id.toLowerCase().includes(query) ||
        t.customer.toLowerCase().includes(query) ||
        t.method.toLowerCase().includes(query);

      const riskMatch = riskFilter === "All" || t.risk === riskFilter;

      const statusMatch =
        statusFilter === "All" ||
        t.status.toLowerCase() === statusFilter.toLowerCase();

      return searchMatch && riskMatch && statusMatch;
    });
  }, [transactions, search, riskFilter, statusFilter]);

  const resetFilters = () => {
    setSearch("");
    setRiskFilter("All");
    setStatusFilter("All");
  };

  const exportCSV = () => {
    const headers = [
      "Transaction ID",
      "Customer",
      "Amount",
      "Payment Method",
      "Risk",
      "Risk Score",
      "Status",
    ];

    const rows = filteredTransactions.map(t => [
      t.id, t.customer, t.amount, t.method, t.risk, t.score, t.status,
    ]);

    const csv = [headers, ...rows]
      .map(row =>
        row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "flowguard-fraud-transactions.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  const riskStyle = (risk: RiskLevel) => {
    if (risk === "High")
      return "border-red-500/20 bg-red-500/10 text-red-300";
    if (risk === "Medium")
      return "border-amber-500/20 bg-amber-500/10 text-amber-300";
    return "border-emerald-500/20 bg-emerald-500/10 text-emerald-300";
  };

  const statusStyle = (status: string) => {
    const value = status.toLowerCase();
    if (value === "blocked" || value === "failed") return "text-red-300";
    if (value === "completed") return "text-emerald-300";
    return "text-amber-300";
  };

  return (
    <div className="min-h-screen bg-[#070610] text-white">
      <div className="mx-auto max-w-[1600px] px-4 py-5 sm:px-6 lg:px-8">

        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-gray-300 transition hover:border-purple-400/30 hover:bg-purple-500/10 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </button>

          <span className="flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/[0.06] px-3 py-1.5 text-xs text-emerald-300">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
            Live account monitoring
          </span>
        </div>

        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-purple-400/20 bg-purple-500/10">
              <ShieldAlert className="h-6 w-6 text-purple-300" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Fraud Detection
              </h1>
              <p className="mt-1 text-sm text-gray-400">
                Monitor suspicious transactions and review risk signals.
              </p>
            </div>
          </div>

          <button
            onClick={loadTransactions}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl border border-purple-400/20 bg-purple-500/10 px-4 py-2.5 text-xs text-purple-200 hover:bg-purple-500/20 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh data
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-400/20 bg-red-400/[0.06] p-4 text-sm text-red-200">
            {error}
          </div>
        )}

        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard title="High Risk" value={highRisk} description="High-risk transactions" icon={ShieldAlert} color="red" />
          <MetricCard title="Medium Risk" value={mediumRisk} description="Requires additional review" icon={AlertTriangle} color="amber" />
          <MetricCard title="Low Risk" value={lowRisk} description="Lower-risk transactions" icon={ShieldCheck} color="emerald" />
          <MetricCard title="Blocked" value={blocked} description="Blocked transactions" icon={XCircle} color="purple" />
        </div>

        <div className="mb-8 grid grid-cols-1 gap-5 xl:grid-cols-3">
          <div className="rounded-2xl border border-white/[0.08] bg-[#0d0b18] p-5 sm:p-6 xl:col-span-2">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-white">Risk Overview</h2>
                <p className="mt-1 text-xs text-gray-500">
                  Distribution of your transaction risk levels
                </p>
              </div>
              <Activity className="h-5 w-5 text-purple-300" />
            </div>

            {loading ? (
              <p className="text-sm text-gray-400">Loading risk statistics...</p>
            ) : (
              <div className="space-y-5">
                <RiskBar label="High Risk" count={highRisk} total={transactions.length} color="bg-red-400" />
                <RiskBar label="Medium Risk" count={mediumRisk} total={transactions.length} color="bg-amber-400" />
                <RiskBar label="Low Risk" count={lowRisk} total={transactions.length} color="bg-emerald-400" />
              </div>
            )}

            <div className="mt-6 flex gap-4 border-t border-white/[0.06] pt-5 text-xs text-gray-400">
              <Legend color="bg-red-400" label="High" />
              <Legend color="bg-amber-400" label="Medium" />
              <Legend color="bg-emerald-400" label="Low" />
            </div>
          </div>

          <div className="rounded-2xl border border-purple-400/15 bg-gradient-to-br from-purple-500/[0.10] to-[#0d0b18] p-5 sm:p-6">
            <div className="mb-5 flex items-center justify-between">
              <Activity className="h-5 w-5 text-purple-300" />
              <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-[10px] font-semibold uppercase text-emerald-300">
                Live data
              </span>
            </div>

            <h2 className="text-lg font-semibold">Monitoring Overview</h2>
            <p className="mt-2 text-sm leading-6 text-gray-400">
              Statistics are calculated from your account's transaction records.
            </p>

            <div className="mt-6 space-y-3">
              <OverviewRow label="Transactions reviewed" value={loading ? "—" : transactions.length} />
              <OverviewRow label="High/medium risk" value={loading ? "—" : flagged} valueClass="text-amber-300" />
              <OverviewRow label="Blocked transactions" value={loading ? "—" : blocked} valueClass="text-red-300" />
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0d0b18]">
          <div className="border-b border-white/[0.06] p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="font-semibold text-white">Transaction Risk Records</h2>
                <p className="mt-1 text-xs text-gray-500">
                  Review risk scores and statuses saved for your transactions.
                </p>
              </div>

              <button
                onClick={exportCSV}
                disabled={!filteredTransactions.length}
                className="flex items-center gap-2 rounded-xl border border-purple-400/20 bg-purple-500/10 px-4 py-2.5 text-xs text-purple-200 hover:bg-purple-500/20 disabled:opacity-40"
              >
                <TrendingUp className="h-4 w-4" />
                Export CSV
              </button>
            </div>

            <div className="mt-5 flex flex-col gap-3 lg:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search customer, transaction or payment method..."
                  className="w-full rounded-xl border border-white/[0.08] bg-black/20 py-3 pl-10 pr-4 text-sm text-white outline-none placeholder:text-gray-600 focus:border-purple-400/40"
                />
              </div>

              <div className="relative">
                <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <select
                  value={riskFilter}
                  onChange={e => setRiskFilter(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-white/[0.08] bg-[#151220] py-3 pl-10 pr-10 text-sm text-gray-300 sm:w-44"
                >
                  <option value="All">All Risk Levels</option>
                  <option value="High">High Risk</option>
                  <option value="Medium">Medium Risk</option>
                  <option value="Low">Low Risk</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              </div>

              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-white/[0.08] bg-[#151220] px-4 py-3 pr-10 text-sm text-gray-300 sm:w-40"
                >
                  <option value="All">All Status</option>
                  <option value="Pending">Pending</option>
                  <option value="Completed">Completed</option>
                  <option value="Failed">Failed</option>
                  <option value="Blocked">Blocked</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              </div>
            </div>
          </div>

          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[850px] text-left">
              <thead>
                <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                  {["Transaction", "Customer", "Amount", "Risk Score", "Risk Level", "Status", "Action"].map(heading => (
                    <th key={heading} className="px-5 py-4 text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map(t => (
                  <tr key={t.id} className="border-b border-white/[0.04] hover:bg-purple-500/[0.035]">
                    <td className="px-5 py-4 text-xs font-medium text-purple-200">{t.id}</td>
                    <td className="px-5 py-4">
                      <p className="text-sm font-medium text-white">{t.customer}</p>
                      <p className="mt-1 text-xs text-gray-500">{t.method}</p>
                    </td>
                    <td className="px-5 py-4 text-sm font-semibold">{formatAmount(t.amount)}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-14 overflow-hidden rounded-full bg-white/10">
                          <div
                            className={`h-full rounded-full ${t.score >= 80 ? "bg-red-400" : t.score >= 50 ? "bg-amber-400" : "bg-emerald-400"}`}
                            style={{ width: `${t.score}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-300">{t.score}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold ${riskStyle(t.risk)}`}>{t.risk}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-medium ${statusStyle(t.status)}`}>{t.status}</span>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => setSelected(t)}
                        className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] px-3 py-2 text-xs text-gray-300 hover:border-purple-400/30 hover:text-purple-200"
                      >
                        <Eye className="h-3.5 w-3.5" /> Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-3 p-4 md:hidden">
            {filteredTransactions.map(t => (
              <div key={t.id} className="rounded-xl border border-white/[0.07] bg-black/20 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold text-purple-200">{t.id}</p>
                    <p className="mt-2 text-sm font-semibold">{t.customer}</p>
                    <p className="mt-1 text-xs text-gray-500">{t.method}</p>
                  </div>
                  <span className={`rounded-full border px-2 py-1 text-[10px] font-semibold ${riskStyle(t.risk)}`}>{t.risk}</span>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-white/[0.06] pt-3">
                  <div>
                    <p className="text-lg font-bold">{formatAmount(t.amount)}</p>
                    <p className="mt-1 text-xs text-gray-500">Score: {t.score}/100</p>
                  </div>
                  <button onClick={() => setSelected(t)} className="rounded-lg border border-purple-400/20 bg-purple-500/10 px-3 py-2 text-xs text-purple-200">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>

          {!loading && filteredTransactions.length === 0 && (
            <div className="px-5 py-12 text-center">
              <Search className="mx-auto h-8 w-8 text-gray-600" />
              <p className="mt-3 text-sm font-medium text-gray-300">
                {transactions.length === 0 ? "No transaction records yet" : "No transactions found"}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                {transactions.length === 0
                  ? "Your account's transactions will appear here when available."
                  : "Try changing your search or filters."}
              </p>
              {transactions.length > 0 && (
                <button onClick={resetFilters} className="mt-4 text-xs text-purple-300">
                  Reset filters
                </button>
              )}
            </div>
          )}

          {loading && (
            <p className="px-5 py-10 text-center text-sm text-gray-400">
              Loading your transaction records...
            </p>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.06] px-5 py-4">
            <p className="text-xs text-gray-500">
              Showing {filteredTransactions.length} of {transactions.length} account transactions
            </p>
            <button onClick={resetFilters} className="flex items-center gap-2 text-xs text-gray-400 hover:text-purple-200">
              <RefreshCw className="h-3.5 w-3.5" /> Reset filters
            </button>
          </div>
        </div>

        {selected && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
            onClick={() => setSelected(null)}
          >
            <div
              className="w-full max-w-lg rounded-2xl border border-purple-400/20 bg-[#100d1b] p-5 shadow-2xl sm:p-6"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-purple-300">TRANSACTION DETAILS</p>
                  <h2 className="mt-2 text-xl font-bold">{selected.id}</h2>
                </div>
                <button onClick={() => setSelected(null)} className="rounded-lg border border-white/10 p-2 text-gray-400 hover:text-white">
                  <XCircle className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-6 rounded-xl border border-white/[0.06] bg-black/20 p-4">
                <p className="text-xs text-gray-500">Transaction Amount</p>
                <p className="mt-2 text-3xl font-bold">{formatAmount(selected.amount)}</p>
                <div className="mt-4 flex gap-2">
                  <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${riskStyle(selected.risk)}`}>
                    {selected.risk} Risk
                  </span>
                  <span className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-gray-300">
                    Score: {selected.score}/100
                  </span>
                </div>
              </div>

              <div className="mt-5 space-y-4">
                <DetailRow label="Customer" value={selected.customer} />
                <DetailRow label="Payment Method" value={selected.method} />
                <DetailRow label="Status" value={selected.status} />
                <DetailRow label="Risk Level" value={selected.risk} />
                <DetailRow label="Risk Score" value={`${selected.score}/100`} />
              </div>

              <p className="mt-5 rounded-xl border border-amber-400/15 bg-amber-400/[0.05] p-3 text-xs leading-5 text-gray-300">
                This view displays the risk level and score saved with this transaction. It does not generate a new fraud assessment.
              </p>

              <button onClick={() => setSelected(null)} className="mt-6 w-full rounded-xl bg-purple-500 py-3 text-sm font-semibold hover:bg-purple-400">
                Close Details
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MetricCard({ title, value, description, icon: Icon, color }: {
  title: string;
  value: number;
  description: string;
  icon: React.ElementType;
  color: "red" | "amber" | "emerald" | "purple";
}) {
  const colors = {
    red: "border-red-400/15 bg-red-400/[0.06] text-red-300",
    amber: "border-amber-400/15 bg-amber-400/[0.06] text-amber-300",
    emerald: "border-emerald-400/15 bg-emerald-400/[0.06] text-emerald-300",
    purple: "border-purple-400/15 bg-purple-400/[0.06] text-purple-300",
  };

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-[#0d0b18] p-5 hover:border-purple-400/20">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-gray-400">{title}</p>
          <p className="mt-3 text-3xl font-bold">{value}</p>
        </div>
        <div className={`rounded-xl border p-2.5 ${colors[color]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className="mt-3 text-xs text-gray-500">{description}</p>
    </div>
  );
}

function RiskBar({ label, count, total, color }: {
  label: string;
  count: number;
  total: number;
  color: string;
}) {
  const percentage = total > 0 ? (count / total) * 100 : 0;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm text-gray-300">{label}</span>
        <span className="text-xs text-gray-400">
          {count} transactions · {Math.round(percentage)}%
        </span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-white/[0.06]">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`h-2 w-2 rounded-full ${color}`} />
      {label}
    </div>
  );
}

function OverviewRow({ label, value, valueClass = "text-white" }: {
  label: string;
  value: number | string;
  valueClass?: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-black/20 px-3 py-3">
      <span className="text-xs text-gray-400">{label}</span>
      <span className={`text-sm font-semibold ${valueClass}`}>{value}</span>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-2 border-b border-white/[0.05] pb-3">
      <span className="text-xs text-gray-500">{label}</span>
      <span className="max-w-[65%] break-words text-right text-xs font-medium text-gray-200">
        {value}
      </span>
    </div>
  );
}