import React from "react";
import { useNavigate } from "react-router-dom";

const ActionButton = ({ label, path, icon, accessKey, allowed, className }) => {
  const navigate = useNavigate();

  const base =
    "h-16 rounded-3xl shadow-lg text-white font-extrabold text-2xl border border-white flex overflow-hidden backdrop-blur-md";
  const glow =
    "hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] transition duration-300";
  const disabledStyle = "opacity-30 cursor-not-allowed";

  return (
    <button
      disabled={!allowed}
      onClick={() =>
        allowed && navigate(`/${path || label.replace(/\s+/g, "")}`)
      }
      className={`${base} ${allowed ? glow : disabledStyle} ${className || ""}`}
    >
      <span className="w-1/4 flex items-center justify-center text-4xl">
        {icon}
      </span>
      <span className="w-3/4 flex items-center justify-center">{label}</span>
    </button>
  );
};

export default ActionButton;
