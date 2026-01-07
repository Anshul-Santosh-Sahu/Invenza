// src/components/ui/button.jsx
import React from "react";

export const Button = ({
  children,
  onClick,
  type = "button",
  className = "",
  variant = "default",
  disabled = false,
}) => {
  const baseStyle =
    "px-4 py-2 rounded-md font-medium transition focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed";
  const variants = {
    default: "bg-blue-600 text-white hover:bg-blue-700",
    outline: "border border-gray-400 text-gray-700 hover:bg-gray-100",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyle} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

// ✅ Export both ways (default + named)
export default Button;
