import "./select.css";

const ChevronDown = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

export default function Select({
  label,
  name,
  value,
  onChange,
  options = [],
  placeholder,
  error,
  disabled = false,
  className = "",
}) {
  const fieldClasses = [
    "select-field",
    error ? "select-field-error" : "",
    !value && placeholder ? "select-field-placeholder" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="select-group">
      {label && (
        <label className="select-label" htmlFor={name}>
          {label}
        </label>
      )}

      <div className="select-wrapper">
        <select
          id={name}
          className={fieldClasses}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => {
            const optValue = typeof opt === "object" ? opt.value : opt;
            const optLabel = typeof opt === "object" ? opt.label : opt;
            return (
              <option key={optValue} value={optValue}>
                {optLabel}
              </option>
            );
          })}
        </select>
        <span className="select-chevron">
          <ChevronDown />
        </span>
      </div>

      {error && <span className="select-error">{error}</span>}
    </div>
  );
}

