import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";
import TransactionTable from "../components/transactionTable";
import {
  getDashboardSummary,
  getRecentTransactions,
  getSpendingByCategory,
  getMonthlyReport,
} from "../api/dashboard";
import { getProfile } from "../api/profile";
import "./dashboard.css";

const COLORS = ["#a78bfa", "#fcd34d", "#f9a8d4", "#93c5fd", "#a7ebc9", "#fdba74"];
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Format a Date as YYYY-MM-DD using local time (toISOString can shift the day)
function toYMD(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function monthsBack(count) {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - (count - 1), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return [toYMD(start), toYMD(end)];
}

const RANGES = {
  this_month: { label: "This Month", get: () => monthsBack(1) },
  last_3: { label: "Last 3 Months", get: () => monthsBack(3) },
  last_6: { label: "Last 6 Months", get: () => monthsBack(6) },
  this_year: {
    label: "This Year",
    get: () => {
      const year = new Date().getFullYear();
      return [`${year}-01-01`, `${year}-12-31`];
    },
  },
  all: { label: "All Time", get: () => [undefined, undefined] },
};

function money(value) {
  return `$${Number(value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function Dashboard() {
  const [firstName, setFirstName] = useState("");
  const [summary, setSummary] = useState(null);
  const [recent, setRecent] = useState([]);
  const [categories, setCategories] = useState([]);
  const [monthly, setMonthly] = useState([]);
  const [range, setRange] = useState("this_month");
  const [error, setError] = useState("");

  // Loads once: name, summary cards, recent transactions
  useEffect(() => {
    Promise.all([getProfile(), getDashboardSummary(), getRecentTransactions()])
      .then(([user, summaryData, recentData]) => {
        setFirstName(user.full_name.split(" ")[0]);
        setSummary(summaryData);
        setRecent(recentData);
      })
      .catch((err) => setError(err.message));
  }, []);

  // Reloads the charts when the date filter changes
  useEffect(() => {
    let cancelled = false;
    const [start, end] = RANGES[range].get();

    Promise.all([getSpendingByCategory(start, end), getMonthlyReport(start, end)])
      .then(([categoryData, monthlyData]) => {
        if (cancelled) return;
        setCategories(categoryData);
        setMonthly(monthlyData);
      })
      .catch((err) => !cancelled && setError(err.message));

    return () => {
      cancelled = true;
    };
  }, [range]);

  // The API returns amounts as strings, so convert them to numbers for the charts
  const barData = monthly.map((m) => ({
    month: MONTH_NAMES[Number(m.month.split("-")[1]) - 1],
    Income: Number(m.total_income),
    Expenses: Number(m.total_expenses),
  }));

  const pieData = categories.map((c) => ({
    name: c.category_name,
    value: Number(c.total_amount),
  }));
  const pieTotal = pieData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Welcome back{firstName ? `, ${firstName}` : ""}!</h1>
          <p className="dashboard-subtitle">Let's make your wallet happy</p>
        </div>
        <select
          className="dashboard-filter"
          value={range}
          onChange={(e) => setRange(e.target.value)}
        >
          {Object.entries(RANGES).map(([key, item]) => (
            <option key={key} value={key}>{item.label}</option>
          ))}
        </select>
      </div>

      {error && <p className="dashboard-error">{error}</p>}

      <div className="summary-cards">
        <div className="summary-card">
          <span className="summary-label">Current Balance</span>
          <span className="summary-value">{summary ? money(summary.current_balance) : "--"}</span>
        </div>
        <div className="summary-card">
          <span className="summary-label">Total Income</span>
          <span className="summary-value income">{summary ? money(summary.total_income) : "--"}</span>
        </div>
        <div className="summary-card">
          <span className="summary-label">Total Expenses</span>
          <span className="summary-value expense">{summary ? money(summary.total_expenses) : "--"}</span>
        </div>
      </div>

      <div className="chart-row">
        <div className="dashboard-card chart-wide">
          <h2>Earnings &amp; Spending</h2>
          {barData.length === 0 ? (
            <p className="empty-text">No data for this period.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={barData}>
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{ background: "#181c20", border: "1px solid #343a44" }}
                  formatter={(value) => money(value)}
                />
                <Legend />
                <Bar dataKey="Income" fill="#a7ebc9" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Expenses" fill="#a78bfa" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="dashboard-card chart-narrow">
          <h2>Spending by Category</h2>
          {pieData.length === 0 ? (
            <p className="empty-text">No expenses for this period.</p>
          ) : (
            <>
              <div className="donut-wrap">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90}>
                      {pieData.map((_, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: "#181c20", border: "1px solid #343a44" }}
                      formatter={(value) => money(value)}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="donut-center">
                  <strong>{money(pieTotal)}</strong>
                  <span>Total</span>
                </div>
              </div>
              <ul className="legend-list">
                {pieData.map((item, index) => (
                  <li key={item.name}>
                    <span className="legend-dot" style={{ background: COLORS[index % COLORS.length] }} />
                    {item.name}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>

      <div className="dashboard-card">
        <h2>Recent Transactions</h2>
        <TransactionTable transactions={recent} />
      </div>
    </div>
  );
}