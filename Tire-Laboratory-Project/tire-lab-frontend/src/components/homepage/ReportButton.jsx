import React from "react";

const ReportButton = ({
  title,
  onClick,
  variant = "primary",
  loading = false,
  className = "",
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case "primary":
        return "bg-gradient-to-r from-[#5271ff] to-[#4461ee] hover:from-[#4461ee] hover:to-[#3451dd]";
      case "success":
        return "bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400";
      case "secondary":
        return "bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400";
      default:
        return "bg-gradient-to-r from-[#5271ff] to-[#4461ee] hover:from-[#4461ee] hover:to-[#3451dd]";
    }
  };

  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`
        ${getVariantClasses()}
        disabled:bg-neutral-600 disabled:cursor-not-allowed
        text-white py-3 px-4 rounded-lg transition-all transform hover:scale-105 
        text-sm font-medium
        ${className}
      `}
    >
      {loading ? "در حال بارگذاری..." : title}
    </button>
  );
};

export default ReportButton;
