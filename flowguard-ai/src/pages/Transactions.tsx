
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Activity,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeft,
  LayoutDashboard,
  Search,
  ShieldCheck,
  ShieldAlert,
  Clock,
  CheckCircle2,
  XCircle,
  Download,
  ChevronDown,
  Eye,
  X,
  Calendar,
  Filter,
  RotateCcw,
} from "lucide-react";

type TransactionStatus = "Completed" | "Pending" | "Failed" | "Blocked";
type RiskLevel = "Low" | "Medium" | "High";
type TransactionType = "income" | "expense";

interface Transaction {
  id: string;
  name: string;
  category: string;
  method: string;
  date: string;
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
  risk: RiskLevel;
}

const API_BASE_URL = "https://flowguard-api-9j55.onrender.com";

type BackendTransaction = {
  id: number;
  transaction_id: string;
  customer_name: string;
  amount: number;
  payment_method: string;
  status: string;
  risk_score: number;
  risk_level: string;
  created_at?: string | null;
  timestamp?: string | null;
};

function mapBackendTransaction(item: BackendTransaction): Transaction {
  const normalizedStatus = item.status?.toLowerCase();
  const status: TransactionStatus =
    normalizedStatus === "completed"
      ? "Completed"
      : normalizedStatus === "failed"
      ? "Failed"
      : normalizedStatus === "blocked"
      ? "Blocked"
      : "Pending";

  const normalizedRisk = item.risk_level?.toLowerCase();
  const risk: RiskLevel =
    normalizedRisk === "high"
      ? "High"
      : normalizedRisk === "medium"
      ? "Medium"
      : "Low";

  return {
    id: item.transaction_id || String(item.id),
    name: item.customer_name || "Customer",
    category: "Payment",
    method: item.payment_method || "Unknown",
    date: item.created_at || item.timestamp || "",
    amount: Number(item.amount) || 0,
    // The backend currently stores payment transactions, not income/expense direction.
    type: "expense",
    status,
    risk,
  };
}


const currency = (amount: number) =>
  amount.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  });

const dateFormat = (date: string) =>
  date
    ? new Date(date).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Date unavailable";

const monthFormat = (date: string) =>
  new Date(date).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });

const monthValue = (date: string) => date ? date.slice(0, 7) : "";

const statusStyle: Record<TransactionStatus, string> = {
  Completed:
    "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
  Pending:
    "border-amber-500/20 bg-amber-500/10 text-amber-400",
  Failed:
    "border-red-500/20 bg-red-500/10 text-red-400",
  Blocked:
    "border-red-500/20 bg-red-500/10 text-red-300",
};

const riskStyle: Record<RiskLevel, string> = {
  Low:
    "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
  Medium:
    "border-amber-500/20 bg-amber-500/10 text-amber-400",
  High:
    "border-red-500/20 bg-red-500/10 text-red-400",
};

export default function Transactions() {
  const navigate = useNavigate();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    const loadTransactions = async () => {
      const token = localStorage.getItem("access_token");

      if (!token) {
        setLoadError("Your session has expired. Please log in again.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setLoadError("");

        const response = await fetch(`${API_BASE_URL}/api/transactions`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.status === 401) {
          localStorage.removeItem("access_token");
          localStorage.removeItem("user");
          throw new Error("Your session has expired. Please log in again.");
        }

        if (!response.ok) {
          throw new Error(`Unable to load transactions (HTTP ${response.status}).`);
        }

        const data: BackendTransaction[] = await response.json();
        setTransactions(Array.isArray(data) ? data.map(mapBackendTransaction) : []);
      } catch (error) {
        setLoadError(
          error instanceof Error ? error.message : "Something went wrong while loading transactions."
        );
      } finally {
        setLoading(false);
      }
    };

    loadTransactions();
  }, []);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [risk, setRisk] = useState("All");
  const [type, setType] = useState("All");
  const [month, setMonth] = useState("All");

  const [selected, setSelected] =
    useState<Transaction | null>(null);

  const months = useMemo(() => {
    return Array.from(
      new Set(
        transactions.map((transaction) =>
          monthValue(transaction.date)
        )
      )
    ).sort((a, b) => b.localeCompare(a));
  }, [transactions]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return transactions.filter((transaction) => {
      const matchesSearch =
        !query ||
        transaction.name.toLowerCase().includes(query) ||
        transaction.id.toLowerCase().includes(query) ||
        transaction.category.toLowerCase().includes(query) ||
        transaction.method.toLowerCase().includes(query);

      const matchesStatus =
        status === "All" ||
        transaction.status === status;

      const matchesRisk =
        risk === "All" ||
        transaction.risk === risk;

      const matchesType =
        type === "All" ||
        transaction.type === type;

      const matchesMonth =
        month === "All" ||
        monthValue(transaction.date) === month;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesRisk &&
        matchesType &&
        matchesMonth
      );
    });
  }, [
    transactions,
    search,
    status,
    risk,
    type,
    month,
  ]);

  const completed = filtered.filter(
    (transaction) =>
      transaction.status === "Completed"
  );

  const income = completed
    .filter(
      (transaction) =>
        transaction.type === "income"
    )
    .reduce(
      (sum, transaction) =>
        sum + transaction.amount,
      0
    );

  const expenses = completed
    .filter(
      (transaction) =>
        transaction.type === "expense"
    )
    .reduce(
      (sum, transaction) =>
        sum + transaction.amount,
      0
    );

  const highRisk = filtered.filter(
    (transaction) =>
      transaction.risk === "High"
  ).length;

  const resetFilters = () => {
    setSearch("");
    setStatus("All");
    setRisk("All");
    setType("All");
    setMonth("All");
  };

  const exportCSV = () => {
    const headers = [
      "Transaction ID",
      "Name",
      "Category",
      "Method",
      "Date",
      "Amount",
      "Type",
      "Status",
      "Risk",
    ];

    const rows = filtered.map((transaction) => [
      transaction.id,
      transaction.name,
      transaction.category,
      transaction.method,
      dateFormat(transaction.date),
      transaction.amount,
      transaction.type,
      transaction.status,
      transaction.risk,
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map(
            (value) =>
              `"${String(value).replace(/"/g, '""')}"`
          )
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "flowguard-transactions.csv";

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  };

  const goToDashboard = () => {
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-[#07050d] p-4 text-white sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1500px] space-y-7">

        {/* HEADER */}

        <header className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

          <div className="flex min-w-0 items-start gap-3">

            {/* BACK ARROW */}

            <button
              onClick={goToDashboard}
              type="button"
              title="Back to Dashboard"
              aria-label="Back to Dashboard"
              className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-purple-500/20 bg-[#100b1c] text-purple-300 transition hover:border-purple-400/50 hover:bg-purple-500/10 hover:text-white"
            >
              <ArrowLeft size={19} />
            </button>

            <div className="min-w-0">

              <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-purple-400">
                <Activity size={15} />
                Financial monitoring
              </div>

              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Transactions
              </h1>

              <p className="mt-2 text-sm leading-6 text-gray-400">
                Monitor payments, review suspicious activity,
                and manage transactions.
              </p>

            </div>

          </div>

          {/* HEADER ACTIONS */}

          <div className="flex flex-col gap-3 sm:flex-row">

            <button
              onClick={goToDashboard}
              type="button"
              className="flex items-center justify-center gap-2 rounded-xl border border-purple-500/25 bg-[#100b1c] px-4 py-3 text-sm font-semibold text-purple-300 transition hover:border-purple-400/50 hover:bg-purple-500/10 hover:text-white"
            >
              <LayoutDashboard size={17} />
              Back to Dashboard
            </button>

            <button
              onClick={exportCSV}
              type="button"
              className="flex items-center justify-center gap-2 rounded-xl border border-purple-500/30 bg-purple-600 px-5 py-3 text-sm font-semibold transition hover:bg-purple-500"
            >
              <Download size={17} />
              Export CSV
            </button>

          </div>

        </header>

        {/* LIVE DATA STATUS */}

        <div className="rounded-2xl border border-purple-500/15 bg-[#100b1c] px-4 py-3 text-xs leading-5 text-gray-400">
          {loading ? (
            <span className="text-purple-300">Loading your transactions...</span>
          ) : loadError ? (
            <span className="text-red-300">{loadError}</span>
          ) : (
            <>
              <span className="font-semibold text-emerald-300">Live account data:</span>{" "}
              Showing transactions saved to your FlowGuard account.
            </>
          )}
        </div>

        {/* SUMMARY CARDS */}

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

          <SummaryCard
            title="Total transactions"
            value={filtered.length.toString()}
            description="Matching your filters"
            icon={<Activity />}
            color="purple"
          />

          <SummaryCard
            title="Completed income"
            value={currency(income)}
            description="Successful incoming payments"
            icon={<ArrowDownLeft />}
            color="green"
          />

          <SummaryCard
            title="Completed expenses"
            value={currency(expenses)}
            description="Successful outgoing payments"
            icon={<ArrowUpRight />}
            color="blue"
          />

          <SummaryCard
            title="High-risk transactions"
            value={highRisk.toString()}
            description="Flagged for review"
            icon={<ShieldAlert />}
            color="red"
          />

        </section>

        {/* FILTERS */}

        <section className="rounded-2xl border border-white/[0.08] bg-[#100d19] p-4 sm:p-5">

          <div className="mb-5 flex items-center justify-between">

            <div className="flex items-center gap-2">
              <Filter
                size={17}
                className="text-purple-400"
              />

              <h2 className="font-semibold">
                Filters
              </h2>
            </div>

            <button
              onClick={resetFilters}
              type="button"
              className="flex items-center gap-1.5 text-xs text-gray-400 transition hover:text-white"
            >
              <RotateCcw size={13} />
              Reset
            </button>

          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">

            {/* SEARCH */}

            <div className="relative sm:col-span-2 xl:col-span-1">

              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
              />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search transactions..."
                aria-label="Search transactions"
                className="w-full rounded-xl border border-white/10 bg-[#090711] py-3 pl-9 pr-3 text-sm outline-none transition placeholder:text-gray-600 focus:border-purple-500/60"
              />

            </div>

            {/* MONTH */}

            <FilterSelect
              label="Month"
              value={month}
              onChange={setMonth}
              options={[
                {
                  value: "All",
                  label: "All months",
                },
                ...months.filter(Boolean).map((value) => ({
                  value,
                  label: monthFormat(`${value}-01`),
                })),
              ]}
            />

            {/* STATUS */}

            <FilterSelect
              label="Status"
              value={status}
              onChange={setStatus}
              options={[
                { value: "All", label: "All statuses" },
                { value: "Completed", label: "Completed" },
                { value: "Pending", label: "Pending" },
                { value: "Failed", label: "Failed" },
              ]}
            />

            {/* RISK */}

            <FilterSelect
              label="Risk"
              value={risk}
              onChange={setRisk}
              options={[
                { value: "All", label: "All risk levels" },
                { value: "Low", label: "Low risk" },
                { value: "Medium", label: "Medium risk" },
                { value: "High", label: "High risk" },
              ]}
            />

            {/* TYPE */}

            <FilterSelect
              label="Type"
              value={type}
              onChange={setType}
              options={[
                { value: "All", label: "All types" },
                { value: "income", label: "Income" },
                { value: "expense", label: "Expense" },
              ]}
            />

          </div>

        </section>

        {/* TRANSACTION TABLE */}

        <section className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#100d19]">

          {/* TABLE HEADER */}

          <div className="flex flex-col gap-3 border-b border-white/[0.07] p-5 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <h2 className="font-semibold">
                All transactions
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                Showing {filtered.length} of {transactions.length} transactions
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Calendar size={14} />

              {month === "All"
                ? "All available months"
                : monthFormat(`${month}-01`)}
            </div>

          </div>

          {/* EMPTY STATE */}

          {loading ? (
            <div className="px-5 py-16 text-center text-sm text-purple-300">
              Loading your account transactions...
            </div>
          ) : loadError ? (
            <div className="px-5 py-16 text-center text-sm text-red-300">
              {loadError}
            </div>
          ) : filtered.length === 0 ? (

            <div className="flex flex-col items-center justify-center px-5 py-16 text-center">

              <Search
                size={28}
                className="mb-4 text-gray-600"
              />

              <h3 className="font-semibold">
                No transactions found
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                Try changing your search or filters.
              </p>

              <button
                onClick={resetFilters}
                type="button"
                className="mt-5 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium transition hover:bg-purple-500"
              >
                Clear filters
              </button>

            </div>

          ) : (

            <>

              {/* DESKTOP TABLE */}

              <div className="hidden overflow-x-auto lg:block">

                <table className="w-full text-left">

                  <thead className="bg-white/[0.025] text-[11px] uppercase tracking-wider text-gray-500">

                    <tr>
                      <th className="px-5 py-4">Transaction</th>
                      <th className="px-5 py-4">Method</th>
                      <th className="px-5 py-4">Date</th>
                      <th className="px-5 py-4">Amount</th>
                      <th className="px-5 py-4">Status</th>
                      <th className="px-5 py-4">Risk</th>
                      <th className="px-5 py-4">Details</th>
                    </tr>

                  </thead>

                  <tbody className="divide-y divide-white/[0.05]">

                    {filtered.map((transaction) => (

                      <tr
                        key={transaction.id}
                        className="transition hover:bg-white/[0.025]"
                      >

                        {/* TRANSACTION */}

                        <td className="px-5 py-4">

                          <div className="flex items-center gap-3">

                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-300">

                              {transaction.type === "income" ? (
                                <ArrowDownLeft size={17} />
                              ) : (
                                <ArrowUpRight size={17} />
                              )}

                            </div>

                            <div>

                              <p className="text-sm font-medium">
                                {transaction.name}
                              </p>

                              <p className="mt-1 text-xs text-gray-500">
                                {transaction.id}
                              </p>

                            </div>

                          </div>

                        </td>

                        {/* METHOD */}

                        <td className="px-5 py-4 text-sm text-gray-400">
                          {transaction.method}
                        </td>

                        {/* DATE */}

                        <td className="whitespace-nowrap px-5 py-4 text-xs text-gray-400">
                          {dateFormat(transaction.date)}
                        </td>

                        {/* AMOUNT */}

                        <td
                          className={`whitespace-nowrap px-5 py-4 text-sm font-semibold ${
                            transaction.type === "income"
                              ? "text-emerald-400"
                              : "text-white"
                          }`}
                        >
                          {transaction.type === "income" ? "+" : "-"}
                          {currency(transaction.amount)}
                        </td>

                        {/* STATUS */}

                        <td className="px-5 py-4">
                          <StatusBadge status={transaction.status} />
                        </td>

                        {/* RISK */}

                        <td className="px-5 py-4">
                          <RiskBadge risk={transaction.risk} />
                        </td>

                        {/* DETAILS */}

                        <td className="px-5 py-4">

                          <button
                            onClick={() =>
                              setSelected(transaction)
                            }
                            type="button"
                            className="rounded-lg border border-white/10 p-2 text-gray-400 transition hover:border-purple-500/40 hover:text-purple-300"
                            aria-label="View transaction details"
                          >
                            <Eye size={15} />
                          </button>

                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

              {/* MOBILE CARDS */}

              <div className="space-y-3 p-3 lg:hidden">

                {filtered.map((transaction) => (

                  <article
                    key={transaction.id}
                    className="rounded-xl border border-white/[0.07] bg-[#090711] p-4"
                  >

                    <div className="flex items-start justify-between gap-3">

                      <div className="flex min-w-0 items-center gap-3">

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-300">

                          {transaction.type === "income" ? (
                            <ArrowDownLeft size={17} />
                          ) : (
                            <ArrowUpRight size={17} />
                          )}

                        </div>

                        <div className="min-w-0">

                          <p className="truncate text-sm font-semibold">
                            {transaction.name}
                          </p>

                          <p className="mt-1 text-xs text-gray-500">
                            {transaction.id}
                          </p>

                        </div>

                      </div>

                      <p
                        className={`whitespace-nowrap text-sm font-semibold ${
                          transaction.type === "income"
                            ? "text-emerald-400"
                            : "text-white"
                        }`}
                      >
                        {transaction.type === "income" ? "+" : "-"}
                        {currency(transaction.amount)}
                      </p>

                    </div>

                    {/* BADGES */}

                    <div className="mt-4 flex flex-wrap items-center gap-2">

                      <StatusBadge status={transaction.status} />

                      <RiskBadge risk={transaction.risk} />

                      <span className="text-xs text-gray-500">
                        {transaction.method}
                      </span>

                    </div>

                    {/* DATE AND DETAILS */}

                    <div className="mt-3 flex items-center justify-between border-t border-white/[0.06] pt-3">

                      <span className="text-xs text-gray-500">
                        {dateFormat(transaction.date)}
                      </span>

                      <button
                        onClick={() =>
                          setSelected(transaction)
                        }
                        type="button"
                        className="flex items-center gap-1.5 text-xs font-medium text-purple-300 transition hover:text-purple-200"
                      >
                        <Eye size={14} />
                        Details
                      </button>

                    </div>

                  </article>

                ))}

              </div>

            </>

          )}

          {/* TABLE FOOTER */}

          <div className="border-t border-white/[0.06] px-5 py-4 text-xs text-gray-500">
            Transaction records shown here are retrieved from your authenticated FlowGuard account.
          </div>

        </section>

        {/* SECURITY NOTICE */}

        <div className="flex items-start gap-3 rounded-xl border border-emerald-500/10 bg-emerald-500/[0.04] p-4">

          <ShieldCheck
            size={18}
            className="mt-0.5 shrink-0 text-emerald-400"
          />

          <div>

            <p className="text-sm font-medium text-gray-200">
              Transaction monitoring
            </p>

            <p className="mt-1 text-xs leading-5 text-gray-500">
              Risk labels and scores are read from the transaction records stored by FlowGuard.
            </p>

          </div>

        </div>

      </div>

      {/* TRANSACTION DETAILS MODAL */}

      {selected && (

        <TransactionModal
          transaction={selected}
          onClose={() => setSelected(null)}
        />

      )}

    </div>
  );
}

/* SUMMARY CARD */

function SummaryCard({
  title,
  value,
  description,
  icon,
  color,
}: {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  color: "purple" | "green" | "blue" | "red";
}) {

  const colors = {
    purple: "bg-purple-500/10 text-purple-400",
    green: "bg-emerald-500/10 text-emerald-400",
    blue: "bg-blue-500/10 text-blue-400",
    red: "bg-red-500/10 text-red-400",
  };

  return (

    <article className="rounded-2xl border border-white/[0.08] bg-[#100d19] p-5">

      <div className="flex items-center justify-between">

        <span className="text-sm text-gray-400">
          {title}
        </span>

        <div className={`rounded-xl p-2.5 ${colors[color]}`}>
          {icon}
        </div>

      </div>

      <p className="mt-5 break-words text-2xl font-bold tracking-tight">
        {value}
      </p>

      <p className="mt-2 text-xs text-gray-500">
        {description}
      </p>

    </article>

  );
}

/* FILTER SELECT */

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {

  return (

    <label className="relative block">

      <span className="mb-1.5 block text-[11px] font-medium text-gray-500">
        {label}
      </span>

      <select
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="w-full appearance-none rounded-xl border border-white/10 bg-[#090711] px-3 py-3 pr-9 text-sm text-gray-200 outline-none transition focus:border-purple-500/60"
      >

        {options.map((option) => (

          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>

        ))}

      </select>

      <ChevronDown
        size={15}
        className="pointer-events-none absolute bottom-3.5 right-3 text-gray-500"
      />

    </label>

  );
}

/* STATUS BADGE */

function StatusBadge({
  status,
}: {
  status: TransactionStatus;
}) {

  const icons = {
    Completed: <CheckCircle2 size={12} />,
    Pending: <Clock size={12} />,
    Failed: <XCircle size={12} />,
    Blocked: <XCircle size={12} />,
  };

  return (

    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-[10px] font-semibold ${statusStyle[status]}`}
    >

      {icons[status]}

      {status}

    </span>

  );
}

/* RISK BADGE */

function RiskBadge({
  risk,
}: {
  risk: RiskLevel;
}) {

  return (

    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-[10px] font-semibold ${riskStyle[risk]}`}
    >

      {risk === "High" ? (
        <ShieldAlert size={12} />
      ) : (
        <ShieldCheck size={12} />
      )}

      {risk}

    </span>

  );
}

/* TRANSACTION MODAL */

function TransactionModal({
  transaction,
  onClose,
}: {
  transaction: Transaction;
  onClose: () => void;
}) {

  return (

    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
      onClick={onClose}
    >

      <div
        className="w-full max-w-lg rounded-2xl border border-purple-500/20 bg-[#100d19] p-5 shadow-2xl sm:p-6"
        onClick={(event) => event.stopPropagation()}
      >

        {/* MODAL HEADER */}

        <div className="flex items-center justify-between">

          <div>

            <p className="text-xs font-medium uppercase tracking-wider text-purple-400">
              Transaction details
            </p>

            <h2 className="mt-1 text-xl font-bold">
              {transaction.name}
            </h2>

          </div>

          <button
            onClick={onClose}
            type="button"
            className="rounded-lg border border-white/10 p-2 text-gray-400 transition hover:text-white"
            aria-label="Close transaction details"
          >
            <X size={17} />
          </button>

        </div>

        {/* AMOUNT */}

        <div className="my-6 rounded-xl border border-white/[0.07] bg-[#090711] p-5 text-center">

          <p className="text-xs text-gray-500">
            Transaction amount
          </p>

          <p
            className={`mt-2 text-3xl font-bold ${
              transaction.type === "income"
                ? "text-emerald-400"
                : "text-white"
            }`}
          >
            {transaction.type === "income" ? "+" : "-"}
            {currency(transaction.amount)}
          </p>

          <div className="mt-3 flex justify-center gap-2">

            <StatusBadge status={transaction.status} />

            <RiskBadge risk={transaction.risk} />

          </div>

        </div>

        {/* DETAILS */}

        <div className="space-y-0">

          <DetailRow
            label="Transaction ID"
            value={transaction.id}
          />

          <DetailRow
            label="Category"
            value={transaction.category}
          />

          <DetailRow
            label="Payment method"
            value={transaction.method}
          />

          <DetailRow
            label="Transaction type"
            value={transaction.type}
          />

          <DetailRow
            label="Date and time"
            value={dateFormat(transaction.date)}
          />

        </div>

        {/* RISK NOTICE */}

        <div className="mt-5 flex items-start gap-2 rounded-xl border border-amber-500/10 bg-amber-500/[0.04] p-3">

          <ShieldAlert
            size={15}
            className="mt-0.5 shrink-0 text-amber-400"
          />

          <p className="text-xs leading-5 text-gray-400">
            Risk information is illustrative and does not represent
            a verified financial institution decision.
          </p>

        </div>

        {/* CLOSE */}

        <button
          onClick={onClose}
          type="button"
          className="mt-5 w-full rounded-xl bg-purple-600 py-3 text-sm font-semibold transition hover:bg-purple-500"
        >
          Close
        </button>

      </div>

    </div>

  );
}

/* DETAIL ROW */

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {

  return (

    <div className="flex items-start justify-between gap-4 border-b border-white/[0.06] py-3">

      <span className="text-xs text-gray-500">
        {label}
      </span>

      <span className="break-all text-right text-xs font-medium text-gray-200">
        {value}
      </span>

    </div>

  );
}
