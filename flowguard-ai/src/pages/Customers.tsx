
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { LucideIcon } from "lucide-react";

import {
  Search,
  Users,
  UserRound,
  ShieldCheck,
  ShieldAlert,
  ArrowUpRight,
  ArrowLeft,
  Eye,
  X,
  Mail,
  CreditCard,
  Activity,
  ChevronRight,
  Filter,
  Phone,
  Calendar,
  MapPin,
} from "lucide-react";

type RiskLevel = "Low" | "Medium" | "High";
type CustomerStatus = "Active" | "Inactive";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  joined: string;
  transactions: number;
  totalSpent: number;
  risk: RiskLevel;
  status: CustomerStatus;
  lastTransaction: string;
}

const customers: Customer[] = [
  {
    id: "CUS-1001",
    name: "Aarav Sharma",
    email: "aarav.sharma@example.com",
    phone: "+91 98765 43210",
    location: "Kolkata, India",
    joined: "Jan 12, 2026",
    transactions: 124,
    totalSpent: 84500,
    risk: "Low",
    status: "Active",
    lastTransaction: "Today, 10:42 AM",
  },
  {
    id: "CUS-1002",
    name: "Priya Patel",
    email: "priya.patel@example.com",
    phone: "+91 98765 12345",
    location: "Mumbai, India",
    joined: "Feb 08, 2026",
    transactions: 89,
    totalSpent: 52600,
    risk: "Medium",
    status: "Active",
    lastTransaction: "Today, 09:18 AM",
  },
  {
    id: "CUS-1003",
    name: "Rahul Verma",
    email: "rahul.verma@example.com",
    phone: "+91 98765 67890",
    location: "Delhi, India",
    joined: "Mar 21, 2026",
    transactions: 67,
    totalSpent: 128900,
    risk: "High",
    status: "Active",
    lastTransaction: "Yesterday, 08:35 PM",
  },
  {
    id: "CUS-1004",
    name: "Ananya Das",
    email: "ananya.das@example.com",
    phone: "+91 98765 24680",
    location: "Kolkata, India",
    joined: "Apr 15, 2026",
    transactions: 156,
    totalSpent: 96700,
    risk: "Low",
    status: "Active",
    lastTransaction: "Today, 11:05 AM",
  },
  {
    id: "CUS-1005",
    name: "Vikram Singh",
    email: "vikram.singh@example.com",
    phone: "+91 98765 13579",
    location: "Bengaluru, India",
    joined: "May 02, 2026",
    transactions: 42,
    totalSpent: 31400,
    risk: "High",
    status: "Inactive",
    lastTransaction: "Oct 28, 2026",
  },
  {
    id: "CUS-1006",
    name: "Meera Kapoor",
    email: "meera.kapoor@example.com",
    phone: "+91 98765 86420",
    location: "Chennai, India",
    joined: "Jun 17, 2026",
    transactions: 98,
    totalSpent: 67200,
    risk: "Medium",
    status: "Active",
    lastTransaction: "Yesterday, 04:22 PM",
  },
];

const money = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

export default function Customers() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedCustomer, setSelectedCustomer] =
    useState<Customer | null>(null);

  const filteredCustomers = useMemo(() => {
    return customers.filter((customer) => {
      const query = search.toLowerCase();

      const matchesSearch =
        customer.name.toLowerCase().includes(query) ||
        customer.email.toLowerCase().includes(query) ||
        customer.id.toLowerCase().includes(query);

      const matchesRisk =
        riskFilter === "All" || customer.risk === riskFilter;

      const matchesStatus =
        statusFilter === "All" || customer.status === statusFilter;

      return matchesSearch && matchesRisk && matchesStatus;
    });
  }, [search, riskFilter, statusFilter]);

  const totalCustomers = customers.length;

  const activeCustomers = customers.filter(
    (customer) => customer.status === "Active"
  ).length;

  const highRiskCustomers = customers.filter(
    (customer) => customer.risk === "High"
  ).length;

  const totalTransactions = customers.reduce(
    (total, customer) => total + customer.transactions,
    0
  );

  const totalRevenue = customers.reduce(
    (total, customer) => total + customer.totalSpent,
    0
  );

  return (
    <div className="min-h-screen bg-[#080610] text-white">
      <main className="mx-auto max-w-[1600px] space-y-8 p-4 sm:p-6 lg:p-8">

        {/* HEADER */}
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-purple-400">
              <Users size={14} />
              Customer Management
            </div>

            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Customers
            </h1>

            <p className="mt-2 max-w-xl text-sm text-gray-400">
              Monitor customer activity, transaction behavior and fraud risk.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">

            {/* BACK TO DASHBOARD */}
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center justify-center gap-2 rounded-xl border border-purple-500/25 bg-purple-500/10 px-4 py-3 text-sm font-medium text-purple-300 transition hover:border-purple-400/50 hover:bg-purple-500/20"
            >
              <ArrowLeft size={16} />
              Back to Dashboard
            </button>

            {/* CUSTOMER RECORDS */}
            <div className="flex items-center gap-3 rounded-xl border border-purple-500/20 bg-[#110c20] px-4 py-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/15 text-purple-400">
                <Activity size={20} />
              </div>

              <div>
                <p className="text-xs text-gray-400">Customer records</p>
                <p className="text-sm font-semibold">
                  {totalCustomers} customers
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* METRICS */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            title="Total Customers"
            value={totalCustomers.toString()}
            subtitle="Registered customers"
            icon={Users}
            color="purple"
          />

          <MetricCard
            title="Active Customers"
            value={activeCustomers.toString()}
            subtitle={`${Math.round(
              (activeCustomers / totalCustomers) * 100
            )}% of customers`}
            icon={UserRound}
            color="blue"
          />

          <MetricCard
            title="High Risk Customers"
            value={highRiskCustomers.toString()}
            subtitle="Require additional monitoring"
            icon={ShieldAlert}
            color="red"
          />

          <MetricCard
            title="Total Transactions"
            value={totalTransactions.toLocaleString("en-IN")}
            subtitle="Across all customers"
            icon={CreditCard}
            color="green"
          />
        </div>

        {/* REVENUE OVERVIEW */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">

          <div className="rounded-2xl border border-purple-500/20 bg-gradient-to-br from-[#171027] to-[#0e0a18] p-5 sm:p-6 lg:col-span-2">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-gray-400">
                  Total Customer Transaction Value
                </p>

                <h2 className="mt-3 text-2xl font-bold sm:text-3xl">
                  {money(totalRevenue)}
                </h2>

                <p className="mt-2 text-xs text-gray-500">
                  Combined transaction value from customer records
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/15 text-purple-400">
                <CreditCard size={22} />
              </div>
            </div>

            <div className="mt-6 flex items-center gap-2 text-xs text-purple-300">
              <Activity size={14} />
              Customer transaction overview
            </div>
          </div>

          <div className="rounded-2xl border border-purple-500/20 bg-[#110c20] p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">
                  Customer Risk Distribution
                </p>
                <h2 className="mt-2 text-xl font-bold">
                  {highRiskCustomers} high-risk
                </h2>
              </div>

              <ShieldAlert className="text-red-400" size={22} />
            </div>

            <div className="mt-6 space-y-4">
              {(["Low", "Medium", "High"] as RiskLevel[]).map((risk) => {
                const count = customers.filter(
                  (customer) => customer.risk === risk
                ).length;

                const percentage =
                  totalCustomers === 0
                    ? 0
                    : (count / totalCustomers) * 100;

                const color =
                  risk === "Low"
                    ? "bg-emerald-400"
                    : risk === "Medium"
                    ? "bg-amber-400"
                    : "bg-red-400";

                return (
                  <div key={risk}>
                    <div className="mb-2 flex items-center justify-between text-xs">
                      <span className="text-gray-300">{risk} Risk</span>
                      <span className="text-gray-400">
                        {count} customers
                      </span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-white/5">
                      <div
                        className={`h-full rounded-full ${color}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* CUSTOMER TABLE SECTION */}
        <section className="overflow-hidden rounded-2xl border border-purple-500/20 bg-[#100b1b]">

          {/* SECTION HEADER */}
          <div className="flex flex-col gap-4 border-b border-white/5 p-5 sm:p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold">
                  Customer Directory
                </h2>

                <p className="mt-1 text-xs text-gray-400">
                  View and manage customer risk profiles.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Users size={15} />
                {filteredCustomers.length} results
              </div>
            </div>

            {/* SEARCH AND FILTERS */}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_180px_180px]">

              {/* SEARCH */}
              <div className="relative">
                <Search
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                />

                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search name, email or customer ID..."
                  className="w-full rounded-xl border border-white/10 bg-[#090611] py-3 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-purple-500/50"
                />
              </div>

              {/* RISK FILTER */}
              <div className="relative">
                <Filter
                  size={15}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                />

                <select
                  value={riskFilter}
                  onChange={(event) => setRiskFilter(event.target.value)}
                  className="w-full appearance-none rounded-xl border border-white/10 bg-[#090611] py-3 pl-9 pr-4 text-sm text-gray-300 outline-none focus:border-purple-500/50"
                >
                  <option value="All">All Risk Levels</option>
                  <option value="Low">Low Risk</option>
                  <option value="Medium">Medium Risk</option>
                  <option value="High">High Risk</option>
                </select>
              </div>

              {/* STATUS FILTER */}
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  className="w-full appearance-none rounded-xl border border-white/10 bg-[#090611] px-4 py-3 text-sm text-gray-300 outline-none focus:border-purple-500/50"
                >
                  <option value="All">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          {/* DESKTOP TABLE */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[900px] text-left">
              <thead className="bg-white/[0.02]">
                <tr className="border-b border-white/5 text-xs uppercase tracking-wider text-gray-500">
                  <th className="px-6 py-4 font-medium">Customer</th>
                  <th className="px-6 py-4 font-medium">Customer ID</th>
                  <th className="px-6 py-4 font-medium">Transactions</th>
                  <th className="px-6 py-4 font-medium">Total Value</th>
                  <th className="px-6 py-4 font-medium">Risk Level</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 text-right font-medium">Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredCustomers.map((customer) => (
                  <tr
                    key={customer.id}
                    className="border-b border-white/[0.04] transition hover:bg-purple-500/[0.04]"
                  >
                    {/* CUSTOMER */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={customer.name} />

                        <div>
                          <p className="text-sm font-medium text-gray-200">
                            {customer.name}
                          </p>

                          <p className="mt-1 text-xs text-gray-500">
                            {customer.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* ID */}
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs text-gray-400">
                        {customer.id}
                      </span>
                    </td>

                    {/* TRANSACTIONS */}
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-300">
                        {customer.transactions}
                      </span>
                    </td>

                    {/* TOTAL VALUE */}
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-gray-200">
                        {money(customer.totalSpent)}
                      </span>
                    </td>

                    {/* RISK */}
                    <td className="px-6 py-4">
                      <RiskBadge risk={customer.risk} />
                    </td>

                    {/* STATUS */}
                    <td className="px-6 py-4">
                      <StatusBadge status={customer.status} />
                    </td>

                    {/* ACTION */}
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedCustomer(customer)}
                        className="inline-flex items-center gap-2 rounded-lg border border-purple-500/20 bg-purple-500/10 px-3 py-2 text-xs font-medium text-purple-300 transition hover:border-purple-400/40 hover:bg-purple-500/20"
                      >
                        <Eye size={14} />
                        View
                        <ChevronRight size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* DESKTOP EMPTY STATE */}
            {filteredCustomers.length === 0 && (
              <EmptyState onReset={() => {
                setSearch("");
                setRiskFilter("All");
                setStatusFilter("All");
              }} />
            )}
          </div>

          {/* MOBILE CUSTOMER CARDS */}
          <div className="space-y-3 p-4 md:hidden">
            {filteredCustomers.map((customer) => (
              <div
                key={customer.id}
                className="rounded-xl border border-white/10 bg-[#0b0713] p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar name={customer.name} />

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">
                        {customer.name}
                      </p>

                      <p className="mt-1 truncate text-xs text-gray-500">
                        {customer.id}
                      </p>
                    </div>
                  </div>

                  <RiskBadge risk={customer.risk} />
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-500">Transactions</p>
                    <p className="mt-1 text-sm font-medium">
                      {customer.transactions}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Total Value</p>
                    <p className="mt-1 text-sm font-medium">
                      {money(customer.totalSpent)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Status</p>
                    <div className="mt-2">
                      <StatusBadge status={customer.status} />
                    </div>
                  </div>

                  <div className="flex items-end justify-end">
                    <button
                      onClick={() => setSelectedCustomer(customer)}
                      className="flex items-center gap-2 rounded-lg border border-purple-500/20 bg-purple-500/10 px-3 py-2 text-xs font-medium text-purple-300 transition hover:bg-purple-500/20"
                    >
                      <Eye size={14} />
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {filteredCustomers.length === 0 && (
              <EmptyState onReset={() => {
                setSearch("");
                setRiskFilter("All");
                setStatusFilter("All");
              }} />
            )}
          </div>

          {/* FOOTER */}
          <div className="flex flex-col gap-2 border-t border-white/5 px-5 py-4 text-xs text-gray-500 sm:flex-row sm:items-center sm:justify-between">
            <p>
              Showing {filteredCustomers.length} of {totalCustomers} customers
            </p>

            <p className="flex items-center gap-1">
              <ShieldCheck size={13} className="text-purple-400" />
              Customer risk monitoring
            </p>
          </div>
        </section>

        {/* CUSTOMER DETAILS MODAL */}
        {selectedCustomer && (
          <CustomerModal
            customer={selectedCustomer}
            onClose={() => setSelectedCustomer(null)}
          />
        )}
      </main>
    </div>
  );
}

/* =========================================================
   METRIC CARD
========================================================= */

function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: LucideIcon;
  color: "purple" | "blue" | "red" | "green";
}) {
  const colorClasses = {
    purple: {
      icon: "bg-purple-500/15 text-purple-400",
      border: "border-purple-500/20",
    },
    blue: {
      icon: "bg-blue-500/15 text-blue-400",
      border: "border-blue-500/20",
    },
    red: {
      icon: "bg-red-500/15 text-red-400",
      border: "border-red-500/20",
    },
    green: {
      icon: "bg-emerald-500/15 text-emerald-400",
      border: "border-emerald-500/20",
    },
  };

  return (
    <div
      className={`rounded-2xl border ${colorClasses[color].border} bg-[#110c20] p-5 transition hover:-translate-y-0.5 hover:bg-[#151024]`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-400">{title}</p>

          <h3 className="mt-3 text-2xl font-bold tracking-tight">
            {value}
          </h3>

          <p className="mt-2 text-xs text-gray-500">{subtitle}</p>
        </div>

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${colorClasses[color].icon}`}
        >
          <Icon size={21} />
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   AVATAR
========================================================= */

function Avatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-purple-500/20 bg-gradient-to-br from-purple-500/20 to-fuchsia-500/10 text-xs font-bold text-purple-300">
      {initials}
    </div>
  );
}

/* =========================================================
   RISK BADGE
========================================================= */

function RiskBadge({ risk }: { risk: RiskLevel }) {
  const styles = {
    Low: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
    Medium: "border-amber-500/20 bg-amber-500/10 text-amber-400",
    High: "border-red-500/20 bg-red-500/10 text-red-400",
  };

  const Icon = risk === "Low" ? ShieldCheck : ShieldAlert;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${styles[risk]}`}
    >
      <Icon size={12} />
      {risk}
    </span>
  );
}

/* =========================================================
   STATUS BADGE
========================================================= */

function StatusBadge({ status }: { status: CustomerStatus }) {
  const styles =
    status === "Active"
      ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
      : "border-gray-500/20 bg-gray-500/10 text-gray-400";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${styles}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          status === "Active" ? "bg-emerald-400" : "bg-gray-500"
        }`}
      />
      {status}
    </span>
  );
}

/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center px-5 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-purple-500/20 bg-purple-500/10 text-purple-400">
        <Search size={24} />
      </div>

      <h3 className="mt-4 text-sm font-semibold text-gray-200">
        No customers found
      </h3>

      <p className="mt-2 max-w-xs text-xs leading-5 text-gray-500">
        Try changing your search or filters to find customer records.
      </p>

      <button
        onClick={onReset}
        className="mt-5 rounded-lg border border-purple-500/20 bg-purple-500/10 px-4 py-2 text-xs font-medium text-purple-300 transition hover:bg-purple-500/20"
      >
        Reset filters
      </button>
    </div>
  );
}

/* =========================================================
   DETAIL ROW
========================================================= */

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400">
        <Icon size={15} />
      </div>

      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-wider text-gray-500">
          {label}
        </p>
        <p className="mt-1 break-words text-sm text-gray-200">{value}</p>
      </div>
    </div>
  );
}

/* =========================================================
   CUSTOMER DETAILS MODAL
========================================================= */

function CustomerModal({
  customer,
  onClose,
}: {
  customer: Customer;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-purple-500/20 bg-[#100b1b] shadow-2xl shadow-purple-950/30"
        onClick={(event) => event.stopPropagation()}
      >
        {/* MODAL HEADER */}
        <div className="flex items-start justify-between border-b border-white/5 p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <Avatar name={customer.name} />

            <div>
              <h2 className="text-lg font-semibold">{customer.name}</h2>

              <p className="mt-1 font-mono text-xs text-gray-500">
                {customer.id}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close customer details"
            className="rounded-lg p-2 text-gray-400 transition hover:bg-white/5 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="space-y-6 p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <RiskBadge risk={customer.risk} />
            <StatusBadge status={customer.status} />
          </div>

          {/* CONTACT DETAILS */}
          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
              Contact Information
            </h3>

            <div className="space-y-3 rounded-xl border border-white/5 bg-[#090611] p-4">
              <DetailRow
                icon={Mail}
                label="Email"
                value={customer.email}
              />

              <DetailRow
                icon={Phone}
                label="Phone"
                value={customer.phone}
              />

              <DetailRow
                icon={MapPin}
                label="Location"
                value={customer.location}
              />

              <DetailRow
                icon={Calendar}
                label="Joined"
                value={customer.joined}
              />
            </div>
          </div>

          {/* TRANSACTION DETAILS */}
          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
              Transaction Overview
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-purple-500/15 bg-purple-500/[0.06] p-4">
                <div className="flex items-center gap-2 text-purple-400">
                  <CreditCard size={16} />
                  <span className="text-xs">Transactions</span>
                </div>

                <p className="mt-3 text-xl font-bold">
                  {customer.transactions}
                </p>
              </div>

              <div className="rounded-xl border border-purple-500/15 bg-purple-500/[0.06] p-4">
                <div className="flex items-center gap-2 text-purple-400">
                  <ArrowUpRight size={16} />
                  <span className="text-xs">Total Value</span>
                </div>

                <p className="mt-3 text-xl font-bold">
                  {money(customer.totalSpent)}
                </p>
              </div>
            </div>
          </div>

          {/* LAST TRANSACTION */}
          <div className="rounded-xl border border-white/5 bg-[#090611] p-4">
            <p className="text-xs text-gray-500">Last Transaction</p>

            <p className="mt-2 text-sm font-medium text-gray-200">
              {customer.lastTransaction}
            </p>
          </div>

          {/* RISK INFORMATION */}
          <div className="rounded-xl border border-purple-500/15 bg-purple-500/[0.04] p-4">
            <div className="flex items-center gap-2">
              {customer.risk === "Low" ? (
                <ShieldCheck size={17} className="text-emerald-400" />
              ) : (
                <ShieldAlert
                  size={17}
                  className={
                    customer.risk === "High"
                      ? "text-red-400"
                      : "text-amber-400"
                  }
                />
              )}

              <p className="text-sm font-semibold">Risk Assessment</p>
            </div>

            <p className="mt-2 text-xs leading-5 text-gray-400">
              {customer.risk === "Low"
                ? "This customer currently has a low-risk profile in the displayed records."
                : customer.risk === "Medium"
                ? "This customer has a medium-risk profile and may require additional transaction monitoring."
                : "This customer has a high-risk profile and may require immediate review."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
        