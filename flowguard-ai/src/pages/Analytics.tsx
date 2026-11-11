import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  Activity,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  ShieldAlert,
  Wallet,
  Download,
  ChevronDown,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

type Period = "7 days" | "30 days" | "90 days";

const monthlyData = [
  { month: "May", income: 42000, expenses: 28000 },
  { month: "Jun", income: 51000, expenses: 32000 },
  { month: "Jul", income: 47000, expenses: 36000 },
  { month: "Aug", income: 63000, expenses: 39000 },
  { month: "Sep", income: 55000, expenses: 31000 },
  { month: "Oct", income: 72000, expenses: 44000 },
  { month: "Nov", income: 68000, expenses: 38000 },
];

const transactions = [
  {
    id: "FG-1001",
    name: "Amazon India",
    category: "Shopping",
    amount: 2499,
    date: "Nov 08",
    risk: "Low",
    status: "Completed",
  },
  {
    id: "FG-1002",
    name: "Swiggy",
    category: "Food",
    amount: 850,
    date: "Nov 08",
    risk: "Low",
    status: "Completed",
  },
  {
    id: "FG-1003",
    name: "Unknown Merchant",
    category: "Transfer",
    amount: 12500,
    date: "Nov 07",
    risk: "High",
    status: "Pending",
  },
  {
    id: "FG-1004",
    name: "Netflix",
    category: "Entertainment",
    amount: 649,
    date: "Nov 06",
    risk: "Low",
    status: "Completed",
  },
];

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

export default function Analytics() {
  const navigate = useNavigate();

  const [period, setPeriod] = useState<Period>("30 days");
  const [selectedChart, setSelectedChart] = useState<
    "transactions" | "volume"
  >("transactions");

  const analytics = useMemo(() => {
    if (period === "7 days") {
      return {
        income: 18450,
        expenses: 12380,
        transactions: 128,
        previousIncome: 16200,
        previousExpenses: 13900,
        previousTransactions: 112,
      };
    }

    if (period === "90 days") {
      return {
        income: 186500,
        expenses: 118400,
        transactions: 842,
        previousIncome: 172300,
        previousExpenses: 125600,
        previousTransactions: 790,
      };
    }

    return {
      income: 68400,
      expenses: 38250,
      transactions: 324,
      previousIncome: 61200,
      previousExpenses: 41500,
      previousTransactions: 298,
    };
  }, [period]);

  const incomeChange =
    ((analytics.income - analytics.previousIncome) /
      analytics.previousIncome) *
    100;

  const expenseChange =
    ((analytics.expenses - analytics.previousExpenses) /
      analytics.previousExpenses) *
    100;

  const transactionChange =
    ((analytics.transactions - analytics.previousTransactions) /
      analytics.previousTransactions) *
    100;

  const riskData = [
    { label: "Low Risk", value: 76, color: "#a78bfa" },
    { label: "Medium Risk", value: 18, color: "#fbbf24" },
    { label: "High Risk", value: 6, color: "#fb7185" },
  ];

  const chartData = period === "7 days"
    ? monthlyData.slice(-3)
    : period === "90 days"
      ? monthlyData
      : monthlyData.slice(-5);

  const handleExport = () => {
    const rows = [
      ["Metric", "Value"],
      ["Period", period],
      ["Income", analytics.income],
      ["Expenses", analytics.expenses],
      ["Transactions", analytics.transactions],
      ["Net Balance", analytics.income - analytics.expenses],
    ];

    const csv = rows.map((row) => row.join(",")).join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "flowguard-analytics.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="analytics-page">
      <style>{`
        .analytics-page {
          min-height: 100vh;
          background: #080610;
          color: #f5f3ff;
          padding: 28px;
          font-family: Inter, system-ui, sans-serif;
        }

        .analytics-page * {
          box-sizing: border-box;
        }

        .analytics-container {
          max-width: 1500px;
          margin: 0 auto;
        }

        .analytics-backbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 15px 18px;
          margin-bottom: 30px;
          border: 1px solid rgba(167, 139, 250, 0.18);
          border-radius: 16px;
          background: rgba(20, 15, 35, 0.92);
        }

        .analytics-back-left {
          display: flex;
          align-items: center;
          gap: 14px;
          min-width: 0;
        }

        .analytics-back-button {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          border: 1px solid rgba(167, 139, 250, 0.28);
          border-radius: 10px;
          padding: 10px 14px;
          color: #e9ddff;
          background: rgba(139, 92, 246, 0.10);
          cursor: pointer;
          font-size: 13px;
          font-weight: 600;
          white-space: nowrap;
          transition: 0.2s ease;
        }

        .analytics-back-button:hover {
          background: rgba(139, 92, 246, 0.24);
          border-color: #a78bfa;
          transform: translateY(-1px);
        }

        .analytics-back-divider {
          height: 30px;
          width: 1px;
          background: rgba(167, 139, 250, 0.2);
        }

        .analytics-brand {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .analytics-brand-icon {
          display: grid;
          place-items: center;
          width: 36px;
          height: 36px;
          border-radius: 11px;
          color: #c4b5fd;
          background: linear-gradient(
            135deg,
            rgba(139, 92, 246, 0.3),
            rgba(79, 70, 229, 0.18)
          );
          border: 1px solid rgba(167, 139, 250, 0.25);
        }

        .analytics-brand-name {
          font-weight: 800;
          font-size: 15px;
          letter-spacing: 0.4px;
        }

        .analytics-brand-sub {
          color: #8f88a6;
          font-size: 11px;
          margin-top: 2px;
        }

        .analytics-live {
          display: flex;
          align-items: center;
          gap: 7px;
          color: #a7f3d0;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1px;
        }

        .analytics-live-dot {
          width: 7px;
          height: 7px;
          background: #34d399;
          border-radius: 50%;
          box-shadow: 0 0 10px rgba(52, 211, 153, 0.5);
        }

        .analytics-heading {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 20px;
          margin-bottom: 28px;
        }

        .analytics-eyebrow {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #a78bfa;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1.6px;
          text-transform: uppercase;
          margin-bottom: 10px;
        }

        .analytics-title {
          margin: 0;
          font-size: clamp(26px, 3vw, 36px);
          font-weight: 800;
          letter-spacing: -1px;
          color: #f5f3ff;
        }

        .analytics-description {
          margin: 9px 0 0;
          color: #9992ae;
          font-size: 13px;
          line-height: 1.6;
        }

        .analytics-heading-actions {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .analytics-select-wrap {
          position: relative;
        }

        .analytics-select {
          appearance: none;
          padding: 11px 38px 11px 14px;
          border-radius: 11px;
          border: 1px solid rgba(167, 139, 250, 0.2);
          color: #e9ddff;
          background: #151023;
          outline: none;
          cursor: pointer;
          font-size: 12px;
        }

        .analytics-select-wrap svg {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          pointer-events: none;
          color: #a78bfa;
        }

        .analytics-export {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 11px 15px;
          border: 1px solid rgba(167, 139, 250, 0.25);
          border-radius: 11px;
          background: rgba(139, 92, 246, 0.12);
          color: #e9ddff;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: 0.2s;
        }

        .analytics-export:hover {
          background: rgba(139, 92, 246, 0.25);
        }

        .analytics-metrics {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 16px;
          margin-bottom: 22px;
        }

        .analytics-card {
          min-width: 0;
          border: 1px solid rgba(167, 139, 250, 0.14);
          border-radius: 17px;
          background: linear-gradient(
            145deg,
            rgba(24, 18, 42, 0.96),
            rgba(14, 11, 26, 0.96)
          );
          padding: 21px;
          transition: border-color 0.2s, transform 0.2s;
        }

        .analytics-card:hover {
          border-color: rgba(167, 139, 250, 0.35);
          transform: translateY(-2px);
        }

        .analytics-metric-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 19px;
        }

        .analytics-metric-icon {
          width: 40px;
          height: 40px;
          display: grid;
          place-items: center;
          border-radius: 12px;
          color: #c4b5fd;
          background: rgba(139, 92, 246, 0.13);
        }

        .analytics-metric-label {
          color: #aaa3bd;
          font-size: 12px;
          font-weight: 500;
        }

        .analytics-metric-value {
          color: #f5f3ff;
          font-size: clamp(21px, 2.2vw, 29px);
          font-weight: 800;
          letter-spacing: -0.7px;
          margin-bottom: 11px;
          overflow-wrap: anywhere;
        }

        .analytics-metric-bottom {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 8px;
          color: #8e87a4;
          font-size: 11px;
        }

        .analytics-change {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          font-weight: 700;
        }

        .analytics-change.positive {
          color: #6ee7b7;
        }

        .analytics-change.negative {
          color: #fb7185;
        }

        .analytics-content-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.65fr) minmax(280px, 1fr);
          gap: 20px;
          margin-bottom: 22px;
        }

        .analytics-panel {
          min-width: 0;
          padding: 23px;
          border-radius: 18px;
          border: 1px solid rgba(167, 139, 250, 0.14);
          background: rgba(18, 14, 31, 0.96);
        }

        .analytics-panel-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 15px;
          margin-bottom: 24px;
        }

        .analytics-panel-title {
          margin: 0;
          color: #f5f3ff;
          font-size: 15px;
          font-weight: 700;
        }

        .analytics-panel-subtitle {
          margin: 7px 0 0;
          color: #8e87a4;
          font-size: 11px;
        }

        .analytics-chart-tabs {
          display: flex;
          gap: 4px;
          padding: 4px;
          border-radius: 9px;
          background: #0d0a18;
        }

        .analytics-chart-tab {
          border: none;
          padding: 7px 10px;
          border-radius: 6px;
          background: transparent;
          color: #8e87a4;
          font-size: 10px;
          cursor: pointer;
        }

        .analytics-chart-tab.active {
          background: rgba(139, 92, 246, 0.2);
          color: #d8c9ff;
        }

        .analytics-legend {
          display: flex;
          flex-wrap: wrap;
          gap: 18px;
          margin-bottom: 20px;
        }

        .analytics-legend-item {
          display: flex;
          align-items: center;
          gap: 7px;
          color: #aaa3bd;
          font-size: 11px;
        }

        .analytics-legend-dot {
          width: 8px;
          height: 8px;
          border-radius: 3px;
        }

        .analytics-bar-chart {
          height: 230px;
          display: flex;
          align-items: stretch;
          gap: 12px;
          padding-top: 10px;
        }

        .analytics-bar-column {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-end;
          gap: 10px;
        }

        .analytics-bars {
          width: 100%;
          height: 190px;
          display: flex;
          justify-content: center;
          align-items: flex-end;
          gap: 5px;
          border-bottom: 1px solid rgba(167, 139, 250, 0.14);
          background: repeating-linear-gradient(
            to top,
            transparent 0,
            transparent 46px,
            rgba(167, 139, 250, 0.07) 47px,
            transparent 48px
          );
        }

        .analytics-bar {
          width: min(34px, 45%);
          min-height: 4px;
          border-radius: 6px 6px 0 0;
          transition: height 0.4s ease;
        }

        .analytics-bar.income {
          background: linear-gradient(180deg, #c4b5fd, #8b5cf6);
          box-shadow: 0 0 14px rgba(139, 92, 246, 0.15);
        }

        .analytics-bar.expense {
          background: linear-gradient(180deg, #fb7185, #be185d);
        }

        .analytics-month {
          color: #8e87a4;
          font-size: 10px;
        }

        .analytics-risk-content {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .analytics-donut {
          width: 190px;
          height: 190px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          position: relative;
          margin: 7px 0 24px;
          background: conic-gradient(
            #a78bfa 0% 76%,
            #fbbf24 76% 94%,
            #fb7185 94% 100%
          );
        }

        .analytics-donut::before {
          content: "";
          position: absolute;
          inset: 18px;
          border-radius: 50%;
          background: #151020;
        }

        .analytics-donut-center {
          z-index: 1;
          text-align: center;
        }

        .analytics-donut-value {
          color: #f5f3ff;
          font-size: 30px;
          font-weight: 800;
        }

        .analytics-donut-label {
          color: #8e87a4;
          font-size: 10px;
          margin-top: 4px;
        }

        .analytics-risk-list {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .analytics-risk-row {
          display: flex;
          align-items: center;
          gap: 9px;
          width: 100%;
        }

        .analytics-risk-color {
          width: 8px;
          height: 8px;
          border-radius: 3px;
          flex-shrink: 0;
        }

        .analytics-risk-name {
          color: #aaa3bd;
          font-size: 11px;
          flex: 1;
        }

        .analytics-risk-value {
          color: #f5f3ff;
          font-size: 12px;
          font-weight: 700;
        }

        .analytics-risk-track {
          width: 100%;
          height: 5px;
          margin-top: 7px;
          border-radius: 8px;
          background: #292238;
          overflow: hidden;
        }

        .analytics-risk-fill {
          height: 100%;
          border-radius: inherit;
        }

        .analytics-bottom-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.65fr) minmax(280px, 1fr);
          gap: 20px;
        }

        .analytics-table-wrap {
          width: 100%;
          overflow-x: auto;
        }

        .analytics-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 540px;
        }

        .analytics-table th {
          padding: 12px 10px;
          text-align: left;
          color: #77708e;
          font-size: 10px;
          font-weight: 600;
          border-bottom: 1px solid rgba(167, 139, 250, 0.12);
        }

        .analytics-table td {
          padding: 15px 10px;
          color: #d8d2e8;
          font-size: 11px;
          border-bottom: 1px solid rgba(167, 139, 250, 0.08);
        }

        .analytics-table tbody tr:last-child td {
          border-bottom: none;
        }

        .analytics-merchant {
          color: #f5f3ff;
          font-weight: 600;
        }

        .analytics-merchant-id {
          margin-top: 4px;
          color: #77708e;
          font-size: 9px;
        }

        .analytics-risk-badge {
          display: inline-flex;
          padding: 5px 8px;
          border-radius: 6px;
          font-size: 9px;
          font-weight: 700;
        }

        .analytics-risk-badge.low {
          color: #6ee7b7;
          background: rgba(52, 211, 153, 0.1);
        }

        .analytics-risk-badge.medium {
          color: #fcd34d;
          background: rgba(251, 191, 36, 0.1);
        }

        .analytics-risk-badge.high {
          color: #fb7185;
          background: rgba(251, 113, 133, 0.1);
        }

        .analytics-activity-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .analytics-activity-item {
          display: flex;
          gap: 12px;
          align-items: flex-start;
        }

        .analytics-activity-icon {
          width: 34px;
          height: 34px;
          border-radius: 10px;
          display: grid;
          place-items: center;
          flex-shrink: 0;
        }

        .analytics-activity-icon.purple {
          color: #c4b5fd;
          background: rgba(139, 92, 246, 0.14);
        }

        .analytics-activity-icon.red {
          color: #fb7185;
          background: rgba(251, 113, 133, 0.12);
        }

        .analytics-activity-icon.green {
          color: #6ee7b7;
          background: rgba(52, 211, 153, 0.12);
        }

        .analytics-activity-title {
          color: #e9e4f5;
          font-size: 11px;
          font-weight: 600;
        }

        .analytics-activity-description {
          color: #8e87a4;
          font-size: 10px;
          line-height: 1.5;
          margin-top: 5px;
        }

        .analytics-activity-time {
          color: #69627f;
          font-size: 9px;
          margin-top: 6px;
        }

        .analytics-footer {
          margin-top: 24px;
          text-align: center;
          color: #625b77;
          font-size: 10px;
        }

        @media (max-width: 1100px) {
          .analytics-metrics {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .analytics-content-grid,
          .analytics-bottom-grid {
            grid-template-columns: 1fr;
          }

          .analytics-risk-content {
            max-width: 400px;
            margin: 0 auto;
          }
        }

        @media (max-width: 650px) {
          .analytics-page {
            padding: 13px;
          }

          .analytics-backbar {
            padding: 12px;
            margin-bottom: 24px;
          }

          .analytics-back-button {
            padding: 9px 10px;
            font-size: 11px;
          }

          .analytics-back-divider,
          .analytics-brand-sub,
          .analytics-live {
            display: none;
          }

          .analytics-brand-name {
            font-size: 12px;
          }

          .analytics-heading {
            align-items: flex-start;
            flex-direction: column;
            margin-bottom: 22px;
          }

          .analytics-heading-actions {
            width: 100%;
          }

          .analytics-select-wrap {
            flex: 1;
          }

          .analytics-select {
            width: 100%;
          }

          .analytics-export {
            justify-content: center;
            flex: 1;
          }

          .analytics-metrics {
            gap: 10px;
          }

          .analytics-card {
            padding: 15px;
            border-radius: 14px;
          }

          .analytics-metric-value {
            font-size: 21px;
          }

          .analytics-metric-label {
            font-size: 10px;
          }

          .analytics-metric-icon {
            width: 34px;
            height: 34px;
          }

          .analytics-panel {
            padding: 16px;
          }

          .analytics-panel-header {
            flex-direction: column;
            margin-bottom: 20px;
          }

          .analytics-bar-chart {
            gap: 6px;
            height: 205px;
          }

          .analytics-bars {
            height: 165px;
            gap: 3px;
          }

          .analytics-bar {
            width: 42%;
          }

          .analytics-month {
            font-size: 9px;
          }

          .analytics-chart-tabs {
            width: 100%;
          }

          .analytics-chart-tab {
            flex: 1;
          }
        }

        @media (max-width: 380px) {
          .analytics-metrics {
            grid-template-columns: 1fr;
          }

          .analytics-metric-value {
            font-size: 25px;
          }

          .analytics-back-button {
            gap: 5px;
          }
        }
      `}</style>

      <div className="analytics-container">
        {/* BACK TO DASHBOARD BAR */}
        <div className="analytics-backbar">
          <div className="analytics-back-left">
            <button
              className="analytics-back-button"
              onClick={() => navigate("/dashboard")}
            >
              <ArrowLeft size={15} />
              Back to Dashboard
            </button>

            <div className="analytics-back-divider" />

            <div className="analytics-brand">
              <div className="analytics-brand-icon">
                <ShieldCheck size={19} />
              </div>

              <div>
                <div className="analytics-brand-name">
                  FlowGuard AI
                </div>

                <div className="analytics-brand-sub">
                  Financial Intelligence
                </div>
              </div>
            </div>
          </div>

          <div className="analytics-live">
            <span className="analytics-live-dot" />
            ANALYTICS
          </div>
        </div>

        {/* PAGE HEADER */}
        <div className="analytics-heading">
          <div>
            <div className="analytics-eyebrow">
              <Activity size={14} />
              Financial Overview
            </div>

            <h1 className="analytics-title">
              Analytics
            </h1>

            <p className="analytics-description">
              Understand your transaction activity, spending patterns,
              and financial risk.
            </p>
          </div>

          <div className="analytics-heading-actions">
            <div className="analytics-select-wrap">
              <select
                className="analytics-select"
                value={period}
                onChange={(e) =>
                  setPeriod(e.target.value as Period)
                }
              >
                <option value="7 days">Last 7 days</option>
                <option value="30 days">Last 30 days</option>
                <option value="90 days">Last 90 days</option>
              </select>

              <ChevronDown size={14} />
            </div>

            <button
              className="analytics-export"
              onClick={handleExport}
            >
              <Download size={14} />
              Export
            </button>
          </div>
        </div>

        {/* SUMMARY CARDS */}
        <div className="analytics-metrics">
          <MetricCard
            icon={<ArrowDownRight size={19} />}
            label="Total Income"
            value={formatCurrency(analytics.income)}
            change={incomeChange}
            description="vs. previous period"
            positive={incomeChange >= 0}
          />

          <MetricCard
            icon={<ArrowUpRight size={19} />}
            label="Total Expenses"
            value={formatCurrency(analytics.expenses)}
            change={expenseChange}
            description="vs. previous period"
            positive={expenseChange <= 0}
          />

          <MetricCard
            icon={<Wallet size={19} />}
            label="Net Balance"
            value={formatCurrency(
              analytics.income - analytics.expenses
            )}
            description="Income minus expenses"
          />

          <MetricCard
            icon={<Activity size={19} />}
            label="Transactions"
            value={analytics.transactions.toLocaleString("en-IN")}
            change={transactionChange}
            description="vs. previous period"
            positive={transactionChange >= 0}
          />
        </div>

        {/* CHARTS */}
        <div className="analytics-content-grid">
          <section className="analytics-panel">
            <div className="analytics-panel-header">
              <div>
                <h2 className="analytics-panel-title">
                  Transaction Overview
                </h2>

                <p className="analytics-panel-subtitle">
                  Income and expenses during {period.toLowerCase()}
                </p>
              </div>

              <div className="analytics-chart-tabs">
                <button
                  className={`analytics-chart-tab ${
                    selectedChart === "transactions" ? "active" : ""
                  }`}
                  onClick={() => setSelectedChart("transactions")}
                >
                  Activity
                </button>

                <button
                  className={`analytics-chart-tab ${
                    selectedChart === "volume" ? "active" : ""
                  }`}
                  onClick={() => setSelectedChart("volume")}
                >
                  Volume
                </button>
              </div>
            </div>

            <div className="analytics-legend">
              <div className="analytics-legend-item">
                <span
                  className="analytics-legend-dot"
                  style={{ background: "#a78bfa" }}
                />
                Income
              </div>

              <div className="analytics-legend-item">
                <span
                  className="analytics-legend-dot"
                  style={{ background: "#fb7185" }}
                />
                Expenses
              </div>
            </div>

            <div className="analytics-bar-chart">
              {chartData.map((item) => {
                const maxValue = Math.max(
                  ...chartData.map((d) =>
                    Math.max(d.income, d.expenses)
                  )
                );

                const incomeHeight =
                  selectedChart === "transactions"
                    ? (item.income / maxValue) * 100
                    : (item.income / maxValue) * 100;

                const expenseHeight =
                  selectedChart === "transactions"
                    ? (item.expenses / maxValue) * 100
                    : (item.expenses / maxValue) * 100;

                return (
                  <div
                    className="analytics-bar-column"
                    key={item.month}
                  >
                    <div className="analytics-bars">
                      <div
                        className="analytics-bar income"
                        style={{ height: `${incomeHeight}%` }}
                        title={`Income: ${formatCurrency(item.income)}`}
                      />

                      <div
                        className="analytics-bar expense"
                        style={{ height: `${expenseHeight}%` }}
                        title={`Expenses: ${formatCurrency(item.expenses)}`}
                      />
                    </div>

                    <span className="analytics-month">
                      {item.month}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>

          {/* RISK DISTRIBUTION */}
          <section className="analytics-panel">
            <div className="analytics-panel-header">
              <div>
                <h2 className="analytics-panel-title">
                  Risk Distribution
                </h2>

                <p className="analytics-panel-subtitle">
                  Transaction risk classification
                </p>
              </div>

              <ShieldAlert size={17} color="#a78bfa" />
            </div>

            <div className="analytics-risk-content">
              <div className="analytics-donut">
                <div className="analytics-donut-center">
                  <div className="analytics-donut-value">
                    94%
                  </div>

                  <div className="analytics-donut-label">
                    LOW + MEDIUM
                  </div>
                </div>
              </div>

              <div className="analytics-risk-list">
                {riskData.map((risk) => (
                  <div key={risk.label}>
                    <div className="analytics-risk-row">
                      <span
                        className="analytics-risk-color"
                        style={{ background: risk.color }}
                      />

                      <span className="analytics-risk-name">
                        {risk.label}
                      </span>

                      <span className="analytics-risk-value">
                        {risk.value}%
                      </span>
                    </div>

                    <div className="analytics-risk-track">
                      <div
                        className="analytics-risk-fill"
                        style={{
                          width: `${risk.value}%`,
                          background: risk.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* LOWER SECTION */}
        <div className="analytics-bottom-grid">
          <section className="analytics-panel">
            <div className="analytics-panel-header">
              <div>
                <h2 className="analytics-panel-title">
                  Recent Transactions
                </h2>

                <p className="analytics-panel-subtitle">
                  Latest transaction activity
                </p>
              </div>

              <button
                className="analytics-chart-tab"
                onClick={() => navigate("/transactions")}
              >
                View all
              </button>
            </div>

            <div className="analytics-table-wrap">
              <table className="analytics-table">
                <thead>
                  <tr>
                    <th>MERCHANT</th>
                    <th>DATE</th>
                    <th>AMOUNT</th>
                    <th>RISK</th>
                  </tr>
                </thead>

                <tbody>
                  {transactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td>
                        <div className="analytics-merchant">
                          {transaction.name}
                        </div>

                        <div className="analytics-merchant-id">
                          {transaction.id}
                        </div>
                      </td>

                      <td>{transaction.date}</td>

                      <td>
                        {formatCurrency(transaction.amount)}
                      </td>

                      <td>
                        <span
                          className={`analytics-risk-badge ${
                            transaction.risk.toLowerCase()
                          }`}
                        >
                          {transaction.risk}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* ACTIVITY */}
          <section className="analytics-panel">
            <div className="analytics-panel-header">
              <div>
                <h2 className="analytics-panel-title">
                  Risk Activity
                </h2>

                <p className="analytics-panel-subtitle">
                  Recent security events
                </p>
              </div>

              <ShieldCheck size={17} color="#a78bfa" />
            </div>

            <div className="analytics-activity-list">
              <ActivityItem
                icon={<ShieldAlert size={15} />}
                color="red"
                title="High-risk transaction detected"
                description="An unusual transaction was flagged for review."
                time="Today · 10:42 AM"
              />

              <ActivityItem
                icon={<ShieldCheck size={15} />}
                color="green"
                title="Security check completed"
                description="Transaction verification completed successfully."
                time="Today · 09:18 AM"
              />

              <ActivityItem
                icon={<TrendingUp size={15} />}
                color="purple"
                title="Spending activity updated"
                description="Your analytics period has been refreshed."
                time="Yesterday · 06:30 PM"
              />
            </div>
          </section>
        </div>

        <div className="analytics-footer">
          FlowGuard AI · Financial Intelligence Dashboard
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
  change,
  description,
  positive,
}: {
  icon: import("react").ReactNode;
  label: string;
  value: string;
  change?: number;
  description: string;
  positive?: boolean;
}) {
  return (
    <div className="analytics-card">
      <div className="analytics-metric-top">
        <div className="analytics-metric-label">
          {label}
        </div>

        <div className="analytics-metric-icon">
          {icon}
        </div>
      </div>

      <div className="analytics-metric-value">
        {value}
      </div>

      <div className="analytics-metric-bottom">
        {change !== undefined && (
          <span
            className={`analytics-change ${
              positive ? "positive" : "negative"
            }`}
          >
            {positive ? (
              <TrendingUp size={12} />
            ) : (
              <TrendingDown size={12} />
            )}

            {Math.abs(change).toFixed(1)}%
          </span>
        )}

        <span>{description}</span>
      </div>
    </div>
  );
}

function ActivityItem({
  icon,
  color,
  title,
  description,
  time,
}: {
  icon: React.ReactNode;
  color: "purple" | "red" | "green";
  title: string;
  description: string;
  time: string;
}) {
  return (
    <div className="analytics-activity-item">
      <div className={`analytics-activity-icon ${color}`}>
        {icon}
      </div>

      <div>
        <div className="analytics-activity-title">
          {title}
        </div>

        <div className="analytics-activity-description">
          {description}
        </div>

        <div className="analytics-activity-time">
          {time}
        </div>
      </div>
    </div>
  );
}
