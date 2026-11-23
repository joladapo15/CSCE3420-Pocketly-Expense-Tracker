import { useState, useEffect, useMemo } from "react";
import { apiFetch } from "../api/client";
import Button from "../components/button";
import TransactionModal from "../components/transactionModal";
import DeleteModal from "../components/deleteModal";
import "./transactions.css";

const CATEGORY_ICONS = {
  "Food & Drinks": "🍴",
  Shopping: "🛒",
  Transportation: "🚌",
  Education: "📚",
  Housing: "🏠",
  "Bills & Utilities": "🧾",
  Entertainment: "🎬",
  Healthcare: "🏥",
  Salary: "💵",
  Allowance: "🎁",
  Freelance: "💻",
  "Other Income": "💰",
};

const CATEGORY_CLASSES = {
  "Food & Drinks": "cat-food",
  Shopping: "cat-shopping",
  Transportation: "cat-transportation",
  Education: "cat-education",
  Housing: "cat-housing",
  "Bills & Utilities": "cat-bills",
  Entertainment: "cat-entertainment",
  Healthcare: "cat-healthcare",
  Salary: "cat-salary",
  Allowance: "cat-allowance",
  Freelance: "cat-freelance",
  "Other Income": "cat-other-income",
};

const formatDisplayDate = (dateStr) => {
  if (!dateStr) return "";
  const parts = dateStr.slice(0, 10).split("-");
  if (parts.length === 3) {
    const year = parts[0];
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const d = new Date(year, month, day);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }
  return dateStr;
};

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All Types");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [dateFilter, setDateFilter] = useState("All Time");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState(null);

  useEffect(() => {
    apiFetch("/api/categories")
      .then((data) => setCategories(data.categories))
      .catch((err) => console.error("Failed to load categories:", err));
  }, []);

  useEffect(() => {
    apiFetch("/api/transactions")
      .then((data) => {
        const formattedTransactions = data.transactions.map((txn) => ({
          id: String(txn.transaction_id),
          transaction_id: txn.transaction_id,
          category_id: txn.category_id,
          date: txn.transaction_date,
          transaction_date: txn.transaction_date,
          description: txn.description || "",
          category: txn.category_name,
          type: txn.type === "income" ? "Income" : "Expense",
          amount: txn.type === "income"
            ? Number(txn.amount)
            : -Number(txn.amount),
        }));

        setTransactions(formattedTransactions);
      })
      .catch((err) => console.error("Failed to load transactions:", err));
  }, []);

  const handleResetFilters = () => {
    setSearch("");
    setTypeFilter("All Types");
    setCategoryFilter("All Categories");
    setDateFilter("All Time");
    setCurrentPage(1);
    setStartDate("");
    setEndDate("");
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      if (search.trim()) {
        const q = search.toLowerCase();
        const descMatch = tx.description.toLowerCase().includes(q);
        const catMatch = tx.category.toLowerCase().includes(q);
        if (!descMatch && !catMatch) return false;
      }

      if (typeFilter !== "All Types") {
        if (tx.type.toLowerCase() !== typeFilter.toLowerCase()) return false;
      }

      if (categoryFilter !== "All Categories") {
        if (tx.category.toLowerCase() !== categoryFilter.toLowerCase()) return false;
      }

      if (dateFilter !== "All Time") {
        const today = new Date();
        const todayString = [
          today.getFullYear(),
          String(today.getMonth() + 1).padStart(2, "0"),
          String(today.getDate()).padStart(2, "0"),
        ].join("-");

        const transactionDate = tx.date.slice(0, 10);

        if (dateFilter === "Today") {
          if (transactionDate !== todayString) return false;
        }

        if (dateFilter === "This Week") {
          const monday = new Date(today);
          const daysSinceMonday = (today.getDay() + 6) % 7;
          monday.setDate(today.getDate() - daysSinceMonday);

          const weekStart = [
            monday.getFullYear(),
            String(monday.getMonth() + 1).padStart(2, "0"),
            String(monday.getDate()).padStart(2, "0"),
          ].join("-");

          if (transactionDate < weekStart || transactionDate > todayString) {
            return false;
          }
        }

        if (dateFilter === "This Month" || dateFilter === "Last Month") {
          const target = new Date(
            today.getFullYear(),
            today.getMonth() - (dateFilter === "Last Month" ? 1 : 0),
            1
          );

          const month = `${target.getFullYear()}-${String(
            target.getMonth() + 1
          ).padStart(2, "0")}`;

          if (!transactionDate.startsWith(month)) return false;
        }

        if (dateFilter === "Custom Range") {
          if (startDate && transactionDate < startDate) return false;
          if (endDate && transactionDate > endDate) return false;
        }
      }

      return true;
    });
  }, [transactions, search, typeFilter, categoryFilter, dateFilter, startDate, endDate]);

  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / pageSize));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredTransactions.slice(startIndex, startIndex + pageSize);
  }, [filteredTransactions, currentPage, pageSize]);

  const handleOpenAdd = () => {
    setEditingTransaction(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (tx) => {
    setEditingTransaction(tx);
    setModalOpen(true);
  };

  const handleOpenDelete = (tx) => {
    setTransactionToDelete(tx);
    setDeleteModalOpen(true);
  };

  const handleSaveTransaction = async (transactionData, transactionId) => {
    const isEditing = Boolean(transactionId);

    const path = isEditing
      ? `/api/transactions/${transactionId}`
      : "/api/transactions";

    const data = await apiFetch(path, {
      method: isEditing ? "PUT" : "POST",
      body: JSON.stringify(transactionData),
    });

    const savedTransaction = data.transaction;

    const formattedTransaction = {
      id: String(savedTransaction.transaction_id),
      transaction_id: savedTransaction.transaction_id,
      category_id: savedTransaction.category_id,
      date: savedTransaction.transaction_date,
      transaction_date: savedTransaction.transaction_date,
      description: savedTransaction.description || "",
      category: categories.find(
        (cat) => cat.category_id === savedTransaction.category_id
      )?.name || "",
      type: savedTransaction.type === "income" ? "Income" : "Expense",
      amount: savedTransaction.type === "income"
        ? Number(savedTransaction.amount)
        : -Number(savedTransaction.amount),
    };

    setTransactions((prev) =>
      isEditing
        ? prev.map((txn) =>
            txn.transaction_id === transactionId ? formattedTransaction : txn
          )
        : [formattedTransaction, ...prev]
    );
  };

  const handleConfirmDelete = async () => {
    if (!transactionToDelete) return;

    try {
      await apiFetch(`/api/transactions/${transactionToDelete.transaction_id}`, {
        method: "DELETE",
      });

      setTransactions((prev) =>
        prev.filter(
          (txn) => txn.transaction_id !== transactionToDelete.transaction_id
        )
      );

      setDeleteModalOpen(false);
      setTransactionToDelete(null);
    } catch (err) {
      console.error("Failed to delete transaction:", err);
      alert(err.message || "Failed to delete transaction.");
    }
  };

  const startIndex = filteredTransactions.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, filteredTransactions.length);

  return (
    <div className="tx-page-container">
      <div className="tx-header-row">
        <div>
          <h1 className="tx-page-title">Transactions</h1>
          <p className="tx-page-subtitle">Keep track of every dollar you spend 💵</p>
        </div>

        <div className="tx-top-actions">
          <div className="tx-search-box">
            <span className="tx-search-icon">🔍</span>
            <input
              type="text"
              className="tx-search-input"
              placeholder="Search transaction..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>
      </div>

      <div className="tx-card">
        <div className="tx-card-header">
          <h2 className="tx-card-title">Transaction List</h2>
          <Button variant="primary" onClick={handleOpenAdd}>
            + Add Transaction
          </Button>
        </div>

        <div className="tx-filters-bar">
          <select
            className="tx-filter-select"
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="All Types">All Types</option>
            <option value="Income">Income</option>
            <option value="Expense">Expense</option>
          </select>

          <select
            className="tx-filter-select"
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="All Categories">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.category_id} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>

          <select
            className="tx-filter-select"
            value={dateFilter}
            onChange={(e) => {
              setDateFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="All Time">All Time</option>
            <option value="Today">Today</option>
            <option value="This Week">This Week</option>
            <option value="This Month">This Month</option>
            <option value="Last Month">Last Month</option>
            <option value="Custom Range">Custom Range</option>
          </select>

          {dateFilter === "Custom Range" && (
            <div className="tx-custom-range">
              <input
                type="date"
                value={startDate}
                max={endDate || undefined}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setCurrentPage(1);
                }}
              />
              <span>to</span>
              <input
                type="date"
                value={endDate}
                min={startDate || undefined}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          )}

          <button type="button" className="tx-reset-btn" onClick={handleResetFilters}>
            <span>🔄</span> Reset
          </button>
        </div>

        <div className="tx-table-container">
          <table className="tx-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Category</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedTransactions.length === 0 ? (
                <tr>
                  <td colSpan="6" className="tx-empty-state">
                    No transactions found.
                  </td>
                </tr>
              ) : (
                paginatedTransactions.map((tx) => {
                  const catClass = CATEGORY_CLASSES[tx.category] || "cat-default";
                  const isIncome = tx.type === "Income";
                  const formattedAmt = isIncome
                    ? `+$${Math.abs(tx.amount).toFixed(2)}`
                    : `-$${Math.abs(tx.amount).toFixed(2)}`;

                  return (
                    <tr key={tx.id}>
                      <td>{formatDisplayDate(tx.date)}</td>
                      <td>{tx.description}</td>
                      <td>
                        <span className={`tx-category-badge ${catClass}`}>
                          <span>{CATEGORY_ICONS[tx.category] || "🏷️"}</span>
                          <span>{tx.category}</span>
                        </span>
                      </td>
                      <td>
                        <span className={`tx-type-text ${isIncome ? "income" : "expense"}`}>
                          {tx.type}
                        </span>
                      </td>
                      <td>
                        <span className={`tx-amount ${isIncome ? "income" : "expense"}`}>
                          {formattedAmt}
                        </span>
                      </td>
                      <td>
                        <div className="tx-actions">
                          <button
                            type="button"
                            className="tx-action-btn"
                            onClick={() => handleOpenEdit(tx)}
                            aria-label="Edit"
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            className="tx-action-btn delete"
                            onClick={() => handleOpenDelete(tx)}
                            aria-label="Delete"
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="tx-pagination-bar">
          <span className="tx-pagination-info">
            Showing {startIndex}–{endIndex} of {filteredTransactions.length} transactions
          </span>

          <div className="tx-pagination-controls">
            <button
              type="button"
              className="tx-page-btn"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              aria-label="Previous page"
            >
              ‹
            </button>
            {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((pageNum) => (
              <button
                key={pageNum}
                type="button"
                className={`tx-page-btn ${pageNum === currentPage ? "active" : ""}`}
                onClick={() => setCurrentPage(pageNum)}
              >
                {pageNum}
              </button>
            ))}
            <button
              type="button"
              className="tx-page-btn"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              aria-label="Next page"
            >
              ›
            </button>
          </div>
        </div>
      </div>

      <TransactionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveTransaction}
        initialData={editingTransaction}
        categories={categories}
      />

      <DeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        transaction={transactionToDelete}
      />
    </div>
  );
}

