import Modal from "./modal";
import Button from "./button";
import "./deleteModal.css";

export default function DeleteModal({
  isOpen,
  onClose,
  onConfirm,
  transaction = null,
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      showCloseButton={false}
      maxWidth={420}
      footer={
        <div className="del-modal-footer">
          <Button variant="secondary" onClick={onClose} fullWidth>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm} fullWidth>
            Delete
          </Button>
        </div>
      }
    >
      <div className="del-modal-body">
        <div className="del-badge">
          <span className="del-badge-icon">!</span>
        </div>
        <h3 className="del-title">Delete Transaction</h3>
        <p className="del-subtitle">
          Are you sure you want to delete this transaction? This action cannot be undone.
        </p>
      </div>
    </Modal>
  );
}

