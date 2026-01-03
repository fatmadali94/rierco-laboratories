import React from "react";

const DateRangeCard = ({
  title,
  onSubmit,
  loading = false,
  disabled = false,
}) => {
  const isInactive = loading || disabled;

  return (
    <button
      onClick={onSubmit}
      disabled={isInactive}
      className={`
        rounded-lg
        p-4
        border border-[#5271ff]
        flex flex-col justify-between
        w-full
        text-center
        transition-transform
        duration-200
        ${
          isInactive
            ? "bg-neutral-700/50 text-neutral-400 cursor-not-allowed brightness-75"
            : "bg-neutral-800/50 hover:scale-105 hover:bg-neutral-700/50 active:scale-95 text-white"
        }
      `}
    >
      <h4
        className={`font-medium mb-3 ${isInactive ? "text-neutral-400" : "text-white"}`}
      >
        {title}
      </h4>
      {loading && (
        <span className="text-xs text-neutral-400">در حال بارگذاری...</span>
      )}
      {disabled && !loading && (
        <span className="text-xs text-neutral-500">(در اختیار انباردار)</span>
      )}
    </button>
  );
};

export default DateRangeCard;
