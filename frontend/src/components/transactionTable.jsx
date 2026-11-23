import "./transactionTable.css";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function formatDate(value) {
  if (!value) return "";
  const [year, month, day] = String(value).split("T")[0].split("-");
  return `${MONTHS[Number(month) - 1]} ${Number(day)}, ${year}`;
}

function formatAmount(amount, type) {
  const number = Number(amount).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return type === "income" ? `+$${number}` : `-$${number}`;
}

export default function TransactionTable({
  transactions = [],
  showActions = false,
  onEdit,
  onDelete,
}) {
  if (transactions.length === 0) {
    return <p className="tx-empty">No transactions found.</p>;
  }

  return (
    <table className="tx-table">
      <thead>
        <tr>
          <th>Date</th>
          <th>Description</th>
          <th>Category</th>
          <th>Type</th>
          <th>Amount</th>
          {showActions && <th>Actions</th>}
        </tr>
      </thead>
      <tbody>
        {transactions.map((tx) => (
          <tr key={tx.transaction_id}>
            <td>{formatDate(tx.transaction_date)}</td>
            <td>{tx.description || "-"}</td>
            <td>{tx.category_name}</td>
            <td className={tx.type === "income" ? "tx-income" : "tx-expense"}>
              {tx.type === "income" ? "Income" : "Expense"}
            </td>
            <td className={tx.type === "income" ? "tx-income" : "tx-expense"}>
              {formatAmount(tx.amount, tx.type)}
            </td>
            {showActions && (
              <td className="tx-actions">
                <button type="button" onClick={() => onEdit?.(tx)}>Edit</button>
                <button type="button" onClick={() => onDelete?.(tx)}>Delete</button>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}