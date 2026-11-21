import { useEffect, useRef } from "react";
import "./modal.css";

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  showCloseButton = true,
  maxWidth = 480,
}) {
  const overlayRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose?.();
  };

  const headerClass = showCloseButton
    ? "modal-header"
    : "modal-header modal-header-centered";

  return (
    <div className="modal-overlay" ref={overlayRef} onClick={handleOverlayClick}>
      <div className="modal-panel" style={{ maxWidth }} role="dialog" aria-modal="true">
        {title && (
          <div className={headerClass}>
            {!showCloseButton && <span />}
            <h2 className="modal-title">{title}</h2>
            {showCloseButton ? (
              <button
                type="button"
                className="modal-close"
                onClick={onClose}
                aria-label="Close"
              >
                ✕
              </button>
            ) : (
              <span />
            )}
          </div>
        )}

        <div className="modal-body">{children}</div>

        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}
