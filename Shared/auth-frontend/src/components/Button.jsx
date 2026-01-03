import { HashLoader } from "react-spinners";

const Button = ({
  children,
  type = "button",
  onClick,
  loading = false,
  disabled = false,
  variant = "primary", // primary, secondary, outline, ghost
  size = "md", // sm, md, lg
  fullWidth = false,
  icon: Icon,
  className = "",
}) => {
  const baseStyles = `
    inline-flex items-center justify-center gap-2
    font-bold rounded-xl
    transition-all duration-600
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900
    disabled:opacity-50 disabled:cursor-not-allowed
  `;

  const variants = {
    primary: `
      bg-gradient-to-r from-primary-500 to-primary-600
      hover:from-primary-600 hover:to-primary-700
      text-white shadow-lg shadow-primary-500/25
      hover:shadow-xl hover:shadow-primary-500/30
      focus:ring-primary-500
    `,
    secondary: `
      bg-white/10 hover:bg-white/20
      text-white border border-white/20
      focus:ring-white/50
    `,
    outline: `
      bg-transparent border-2 border-primary-500
      text-primary-400 hover:bg-primary-500/10
      focus:ring-primary-500
    `,
    ghost: `
      bg-transparent hover:bg-white/10
      text-gray-300 hover:text-white
      focus:ring-white/50
    `,
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? "w-full" : ""}
        ${className}
      `}
    >
      {loading ? (
        <>
          <HashLoader color="currentColor" size={20} />
          <span>لطفاً صبر کنید...</span>
        </>
      ) : (
        <>
          {Icon && <Icon size={20} />}
          {children}
        </>
      )}
    </button>
  );
};

export default Button;
