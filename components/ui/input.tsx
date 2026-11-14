"use client";

import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: "default" | "outline" | "underlined";
}

export function Input({
  className,
  variant = "default",
  ...props
}: InputProps) {
  const variants = {
    default: "bg-white text-black rounded-md px-3 py-2 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C8A34D] disabled:opacity-50",
    outline: "border border-[#C8A34D] rounded-md px-3 py-2 bg-transparent text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C8A34D] disabled:opacity-50",
    underlined: "border-b border-gray-300 rounded-none px-0 py-2 placeholder-gray-400 focus:outline-none focus:border-[#C8A34D] focus:ring-0 disabled:opacity-50",
  };

  return (
    <input
      className={cn(
        "transition-colors",
        variants[variant],
        " disabled:cursor-not-allowed",
        className,
      )}
      {...props}
    />
  );
}