import "./button.css";

export default function Button({
    children, 
    variant = "primary",
    type = "button",
    onClick,
    disabled = false,
    fullWidth = false,
    className = "",
}) {

const classes = [
    "btn",
    `btn-${variant}`,
    fullWidth ? "btn-full" : "",
    className,
]
   .filter(Boolean)
   .join(" ");

return (
    <button type={type} className={classes} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

