import { useState, useEffect } from "react";
import Modal from "./modal";
import Input from "./input";
import Select from "./select";
import Button from "./button";
import "./transactionModal.css";

const CATEGORIES = [
  "Food",
  "Shopping",
  "Transportation",
  "Education",
  "Housing",
  "Entertainment",
  "Bills",
];

const getTodayString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function TransactionModal({
  isOpen,
  onClose,
  onSave,
  initialData = null,
}) {
  const [type, setType] = useState("Expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");
  const [date, setDate] = useState(getTodayString());
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setType(initialData.type || "Expense");
      setAmount(initialData.amount ? String(Math.abs(Number(initialData.amount))) : "");
      setCategory(initialData.category || "Food");
      setDate(initialData.date ? initialData.date.slice(0, 10) : getTodayString());
      setDescription(initialData.description || "");
    } else {
      setType("Expense");
      setAmount("");
      setCategory("Food");
      setDate(getTodayString());
      setDescription("");
    }
    setErrors({});
  }, [initialData, isOpen]);

  const handleTypeChange = (newType) => {
    setType(newType);
    if (newType === "Income") {
      setCategory("Income");
    } else if (category === "Income") {
      setCategory("Food");
    }
  };

  const validate = () => {
    const errs = {};
    const parsedAmount = parseFloat(amount);
    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      errs.amount = "Please enter a valid amount greater than 0.";
    }
    if (type === "Expense" && !category) {
      errs.category = "Please select a category.";
    }
    if (!date) {
      errs.date = "Date is required.";
    }
    if (!description.trim()) {
      errs.description = "Description is required.";
    }
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    const numericAmount = parseFloat(amount);
    const finalAmount = type === "Income" ? Math.abs(numericAmount) : -Math.abs(numericAmount);

    onSave({
      id: initialData?.id,
      type,
      amount: finalAmount,
      category: type === "Income" ? "Income" : category,
      date,
      description: description.trim(),
    });
    onClose();
  };

  const isEditing = Boolean(initialData);
  const modalTitle = isEditing ? "Edit Transaction" : "Add New Transaction";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={modalTitle}
      maxWidth={520}
      footer={
        <div className="tx-modal-footer">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            Save Transaction
          </Button>
        </div>
      }
    >
      <form className="tx-form" onSubmit={handleSubmit}>
        <div className="tx-field-group">
          <label className="tx-label">Type</label>
          <div className="tx-type-toggle">
            <button
              type="button"
              className={`tx-type-btn tx-type-income ${type === "Income" ? "active" : ""}`}
              onClick={() => handleTypeChange("Income")}
            >
              <span>↗</span> Income
            </button>
            <button
              type="button"
              className={`tx-type-btn tx-type-expense ${type === "Expense" ? "active" : ""}`}
              onClick={() => handleTypeChange("Expense")}
            >
              <span>↘</span> Expenses
            </button>
          </div>
        </div>

        <Input
          label="Amount"
          name="amount"
          type="number"
          step="0.01"
          value={amount}
          onChange={(e) => {
            setAmount(e.target.value);
            if (errors.amount) setErrors({ ...errors, amount: "" });
          }}
          placeholder="0.00"
          prefix="$"
          error={errors.amount}
          required
        />

        <Select
          label="Category"
          name="category"
          value={type === "Income" ? "" : category}
          onChange={(e) => {
            setCategory(e.target.value);
            if (errors.category) setErrors({ ...errors, category: "" });
          }}
          options={CATEGORIES}
          placeholder={type === "Income" ? "Not required for income" : "Select category"}
          disabled={type === "Income"}
          error={errors.category}
        />

        <Input
          label="Date"
          name="date"
          type="date"
          value={date}
          onChange={(e) => {
            setDate(e.target.value);
            if (errors.date) setErrors({ ...errors, date: "" });
          }}
          error={errors.date}
          required
        />

        <div className="tx-field-group">
          <label className="tx-label">Description</label>
          <div className={`tx-desc-wrapper ${errors.description ? "error" : ""}`}>
            <textarea
              className="tx-textarea"
              name="description"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (errors.description) setErrors({ ...errors, description: "" });
              }}
              placeholder="e.g. Grocery shopping at Trader Joe's"
              maxLength={100}
              rows={3}
            />
          </div>
          <div className="tx-desc-footer">
            {errors.description && (
              <span className="tx-field-error">{errors.description}</span>
            )}
            <span className="tx-char-count">
              {description.length}/100
            </span>
          </div>
        </div>
      </form>
    </Modal>
  );
}

