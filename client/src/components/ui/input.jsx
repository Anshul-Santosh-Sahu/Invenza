import * as React from "react";

export function Input({ className = "", ...props }) {
  return (
    <input
      className={`flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm 
                  placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 
                  focus:border-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    />
  );
}
