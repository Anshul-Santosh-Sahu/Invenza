import React, { createContext, useContext, useState, useEffect, useRef } from "react";

const SelectContext = createContext({
  value: undefined,
  onValueChange: () => {},
  open: false,
  setOpen: () => {},
});

/**
 * Root Select (controlled-ish)
 * Props:
 * - defaultValue (string)
 * - value (string) optional controlled
 * - onValueChange (fn)
 */
export function Select({ children, defaultValue = undefined, value: controlledValue, onValueChange = () => {} }) {
  const [value, setValue] = useState(controlledValue ?? defaultValue);
  const [open, setOpen] = useState(false);

  // If parent controls value, keep internal in sync
  useEffect(() => {
    if (controlledValue !== undefined) setValue(controlledValue);
  }, [controlledValue]);

  const handleChange = (v) => {
    if (controlledValue === undefined) setValue(v);
    onValueChange(v);
  };

  return (
    <SelectContext.Provider value={{ value, onValueChange: handleChange, open, setOpen }}>
      <div className="relative inline-block w-full">{children}</div>
    </SelectContext.Provider>
  );
}

/**
 * The button / visual trigger for the select.
 * Accepts className and children.
 */
export function SelectTrigger({ children, className = "", ...props }) {
  const { open, setOpen } = useContext(SelectContext);
  return (
    <button
      type="button"
      {...props}
      onClick={(e) => {
        e.stopPropagation();
        setOpen(!open);
      }}
      className={`flex items-center justify-between w-full cursor-pointer ${className}`}
    >
      {children}
      <span className="ml-2 text-sm text-gray-500">▾</span>
    </button>
  );
}

/**
 * SelectValue - displays the currently selected value or a placeholder (passed as children).
 * Usage: <SelectValue placeholder="Status" />
 */
export function SelectValue({ placeholder = "Select", className = "" }) {
  const { value } = useContext(SelectContext);
  return <span className={`text-left ${className}`}>{value ?? placeholder}</span>;
}

/**
 * Dropdown content container. Renders children only when open.
 */
export function SelectContent({ children, className = "" }) {
  const { open } = useContext(SelectContext);
  if (!open) return null;
  return (
    <div
      className={`absolute z-50 mt-2 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="max-h-56 overflow-auto">{children}</div>
    </div>
  );
}

/**
 * An option item. When clicked it calls context.onValueChange(value) and closes dropdown.
 */
export function SelectItem({ value, children, className = "" }) {
  const { onValueChange, setOpen } = useContext(SelectContext);
  return (
    <div
      role="option"
      onClick={() => {
        onValueChange(value);
        setOpen(false);
      }}
      className={`px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${className}`}
    >
      {children}
    </div>
  );
}

/**
 * Utility: close dropdown when clicking outside
 * If you want automatic outside-close globally, add this once (below) — optional.
 */
(function attachGlobalClickHandler() {
  if (typeof document === "undefined") return;
  // Attach single handler only once
  if (!document.__selectOutsideHandlerAttached) {
    document.addEventListener("click", () => {
      // find all select contexts and close them by dispatching click on triggers
      // We keep this simple: any open Select's setOpen is internal only,
      // so consumers should handle outside close themselves if needed.
      // (We don't try to close others here to avoid coupling.)
    });
    document.__selectOutsideHandlerAttached = true;
  }
})();
