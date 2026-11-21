import "./input.css";

export default function Input({
  label,
  type = "text",
  name,
  value,
  onChange,
  placeholder,
  error,
  helperText,
  required = false,
  disabled = false,
  prefix,
  maxLength,
  showCount = false,
  icon,
}) {
  const wrapperClasses = [
    "input-wrapper",
    error ? "input-wrapper-error" : "",
    disabled ? "input-wrapper-disabled" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="input-group">
      {label && (
        <label className="input-label" htmlFor={name}>
          {label}
          {required && <span className="input-required">*</span>}
        </label>
      )}

      <div className={wrapperClasses}>
        {icon && <span className="input-icon">{icon}</span>}
        {prefix && <span className="input-prefix">{prefix}</span>}
        <input
          id={name}
          className="input-field"
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={maxLength}
          required={required}
        />
      </div>

      <div className="input-footer">
        {error ? (
          <span className="input-error">{error}</span>
        ) : helperText ? (
          <span className="input-helper">{helperText}</span>
        ) : (
          <span />
        )}
        {showCount && maxLength && (
          <span className="input-count">
            {(value || "").length}/{maxLength}
          </span>
        )}
      </div>
    </div>
  );
}

