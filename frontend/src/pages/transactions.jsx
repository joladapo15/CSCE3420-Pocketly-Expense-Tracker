import { useState, useEffect, useMemo } from "react";
import Button from "../components/button";
import TransactionModal from "../components/transactionModal";
import DeleteModal from "../components/deleteModal";
import "./transactions.css";

const INITIAL_TRANSACTIONS = [
  { id: "1", date: "2026-10-16", description: "Grocery shopping", category: "Food", type: "Expense", amount: -45.2 },
  { id: "2", date: "2026-10-15", description: "Part-time job", category: "Income", type: "Income", amount: 650.0 },
  { id: "3", date: "2026-10-13", description: "Bus pass", category: "Transportation", type: "Expense", amount: -18.5 },
  { id: "4", date: "2026-10-12", description: "Textbook", category: "Education", type: "Expense", amount: -72.0 },
  { id: "5", date: "2026-10-10", description: "Rent", category: "Housing", type: "Expense", amount: -500.0 },
  { id: "6", date: "2026-10-08", description: "Movie", category: "Entertainment", type: "Expense", amount: -16.0 },
  { id: "7", date: "2026-10-05", description: "Restaurant", category: "Food", type: "Expense", amount: -32.8 },
  { id: "8", date: "2026-10-01", description: "Allowance", category: "Income", type: "Income", amount: 200.0 },
  { id: "9", date: "2026-09-28", description: "Internet bill", category: "Bills", type: "Expense", amount: -60.0 },
  { id: "10", date: "2026-09-25", description: "Clothing", category: "Shopping", type: "Expense", amount: -85.0 },
  { id: "11", date: "2026-09-20", description: "Freelance project", category: "Income", type: "Income", amount: 450.0 },
  { id: "12", date: "2026-09-18", description: "Concert ticket", category: "Entertainment", type: "Expense", amount: -95.0 },
  { id: "13", date: "2026-09-15", description: "Coffee & bakery", category: "Food", type: "Expense", amount: -12.4 },
  { id: "14", date: "2026-09-12", description: "Electricity bill", category: "Bills", type: "Expense", amount: -110.0 },
  { id: "15", date: "2026-09-10", description: "Sneakers", category: "Shopping", type: "Expense", amount: -120.0 },
  { id: "16", date: "2026-09-05", description: "Campus parking", category: "Transportation", type: "Expense", amount: -45.0 },
  { id: "17", date: "2026-09-01", description: "Monthly stipend", category: "Income", type: "Income", amount: 500.0 },
  { id: "18", date: "2026-08-28", description: "Course material", category: "Education", type: "Expense", amount: -64.0 },
  { id: "19", date: "2026-08-24", description: "Dinner with friends", category: "Food", type: "Expense", amount: -48.5 },
  { id: "20", date: "2026-08-20", description: "Phone bill", category: "Bills", type: "Expense", amount: -55.0 },
  { id: "21", date: "2026-08-15", description: "Tutoring gig", category: "Income", type: "Income", amount: 180.0 },
  { id: "22", date: "2026-08-10", description: "Desk lamp", category: "Housing", type: "Expense", amount: -35.0 },
  { id: "23", date: "2026-08-05", description: "Streaming service", category: "Entertainment", type: "Expense", amount: -14.99 },
  { id: "24", date: "2026-08-01", description: "Gas station", category: "Transportation", type: "Expense", amount: -42.0 },
];

const CATEGORY_ICONS = {
  Food: "🍴",
  Income: "💰",
  Transportation: "🚌",
  Education: "📚",
  Housing: "🏠",
  Entertainment: "🎬",
  Bills: "⚡",
  Shopping: "🛒",
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
  const [transactions, setTransactions] = useState(INITIAL_TRANSACTIONS);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All Types");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [dateFilter, setDateFilter] = useState("All Time");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState(null);

  useEffect(() => {
    fetch("/api/transactions")
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setTransactions(data);
        }
      })
      .catch(() => {});
  }, []);

  const handleResetFilters = () => {
    setSearch("");
    setTypeFilter("All Types");
    setCategoryFilter("All Categories");
    setDateFilter("All Time");
    setCurrentPage(1);
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

      if (dateFilter === "This Month") {
        if (!tx.date.startsWith("2026-10")) return false;
      } else if (dateFilter === "Last Month") {
        if (!tx.date.startsWith("2026-09")) return false;
      }

      return true;
    });
  }, [transactions, search, typeFilter, categoryFilter, dateFilter]);

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

  const handleSaveTransaction = async (formData) => {
    if (formData.id) {
      try {
        await fetch(`/api/transactions/${formData.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
      } catch {}
      setTransactions((prev) =>
        prev.map((item) => (item.id === formData.id ? { ...item, ...formData } : item))
      );
    } else {
      const newTx = { ...formData, id: String(Date.now()) };
      try {
        await fetch("/api/transactions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newTx),
        });
      } catch {}
      setTransactions((prev) => [newTx, ...prev]);
    }
  };

  const handleConfirmDelete = async () => {
    if (!transactionToDelete) return;
    try {
      await fetch(`/api/transactions/${transactionToDelete.id}`, {
        method: "DELETE",
      });
    } catch {}
    setTransactions((prev) => prev.filter((item) => item.id !== transactionToDelete.id));
    setDeleteModalOpen(false);
    setTransactionToDelete(null);
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
            <option value="Food">Food</option>
            <option value="Shopping">Shopping</option>
            <option value="Transportation">Transportation</option>
            <option value="Education">Education</option>
            <option value="Housing">Housing</option>
            <option value="Entertainment">Entertainment</option>
            <option value="Bills">Bills</option>
            <option value="Income">Income</option>
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
            <option value="This Month">This Month</option>
            <option value="Last Month">Last Month</option>
          </select>

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
                  const catClass = `cat-${tx.category.toLowerCase()}`;
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

