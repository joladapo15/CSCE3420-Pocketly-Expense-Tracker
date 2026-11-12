import { useState } from "react";
import "./passwordInput.css";

const EyeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
    <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

export default function PasswordInput({
  label,
  name,
  value,
  onChange,
  placeholder,
  error,
  helperText,
  required = false,
  disabled = false,
}) {
  const [visible, setVisible] = useState(false);

  const wrapperClasses = [
    "password-wrapper",
    error ? "password-wrapper-error" : "",
    disabled ? "password-wrapper-disabled" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="password-group">
      {label && (
        <label className="password-label" htmlFor={name}>
          {label}
          {required && <span className="password-required">*</span>}
        </label>
      )}

      <div className={wrapperClasses}>
        <input
          id={name}
          className="password-field"
          type={visible ? "text" : "password"}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
        />
        <button
          type="button"
          className="password-toggle"
          onClick={() => setVisible((v) => !v)}
          tabIndex={-1}
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>

      <div className="password-footer">
        {error ? (
          <span className="password-error">{error}</span>
        ) : helperText ? (
          <span className="password-helper">{helperText}</span>
        ) : null}
      </div>
    </div>
  );
}
