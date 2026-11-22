import { apiFetch } from "./client";

function buildQuery(params) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) query.set(key, value);
  });
  const text = query.toString();
  return text ? `?${text}` : "";
}

export function getDashboardSummary() {
  return apiFetch("/api/dashboard/summary");
}

export async function getRecentTransactions() {
  const data = await apiFetch("/api/dashboard/recent");
  return data.transactions;
}

export async function getSpendingByCategory(startDate, endDate) {
  const data = await apiFetch(
    `/api/dashboard/categories${buildQuery({ start_date: startDate, end_date: endDate })}`
  );
  return data.categories;
}

export async function getMonthlyReport(startDate, endDate) {
  const data = await apiFetch(
    `/api/dashboard/monthly${buildQuery({ start_date: startDate, end_date: endDate })}`
  );
  return data.monthly;
}