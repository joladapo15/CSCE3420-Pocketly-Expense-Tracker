import { useState, useEffect } from "react";
import Modal from "./modal";
import Input from "./input";
import Select from "./select";
import Button from "./button";
import "./transactionModal.css";

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
  categories = [],
}) {
  const [type, setType] = useState("Expense");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [date, setDate] = useState(getTodayString());
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setType(initialData.type === "income" ? "Income" : "Expense");
      setAmount(
        initialData.amount
          ? String(Math.abs(Number(initialData.amount)))
          : ""
      );
      setCategoryId(
        initialData.category_id != null
          ? String(initialData.category_id)
          : ""
      );
      setDate(
        initialData.transaction_date
          ? initialData.transaction_date.slice(0, 10)
          : getTodayString()
      );
      setDescription(initialData.description || "");
    } else {
      setType("Expense");
      setAmount("");
      setCategoryId("");
      setDate(getTodayString());
      setDescription("");
    }

    setErrors({});
  }, [initialData, isOpen]);

  const handleTypeChange = (newType) => {
    setType(newType);
    setCategoryId("");
    setErrors((prev) => ({ ...prev, category: "" }));
  };

  const filteredCategories = categories.filter(
    (cat) => cat.type === type.toLowerCase()
  );

  const validate = () => {
    const errs = {};
    const parsedAmount = Number(amount);

    if (!amount || !Number.isFinite(parsedAmount) ||
        parsedAmount <= 0 || parsedAmount > 9999999999.99 ||
        !Number.isInteger(Math.round(parsedAmount * 100)) ||
        Math.abs(parsedAmount * 100 - Math.round(parsedAmount * 100)) > 0.000001) {
      errs.amount = "Please enter a valid amount with up to 2 decimal places.";
    }

    if (!categoryId) {
      errs.categoryId = "Please select a category.";
    }

    if (!date) {
      errs.date = "Date is required.";
    }

    return errs;
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    const transactionData = {
      category_id: Number(categoryId),
      type: type.toLowerCase(),
      amount: Number(amount),
      transaction_date: date,
      description: description.trim(),
    };

    try {
      await onSave(transactionData, initialData?.transaction_id);
      onClose();
    } catch (err) {
      setErrors({ form: err.message || "Failed to save transaction." });
    }
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
          name="categoryId"
          value={categoryId}
          onChange={(e) => {
            setCategoryId(e.target.value);
            if (errors.categoryId) {
              setErrors({ ...errors, categoryId: "" });
            }
          }}
          options={filteredCategories.map((cat) => ({
            value: String(cat.category_id),
            label: cat.name,
          }))}
          placeholder="Select category"
          error={errors.categoryId}
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

