"use client";

import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "outline" | "ghost" | "link";
}

export function Button({
  className,
  variant = "default",
  ...props
}: ButtonProps) {
  const variants = {
    default: "bg-[#C8A34D] text-white hover:bg-[#B8943D]",
    secondary: "bg-white text-[#171717] hover:bg-gray-100",
    outline: "border border-[#C8A34D] text-[#C8A34D] hover:bg-[#C8A34D] hover:text-white",
    ghost: "hover:bg-[#C8A34D] hover:text-white",
    link: "underline underline-offset-4 text-[#C8A34D] hover/primary:text-white",
  };

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
        variants[variant],
        " focus-visible:ring-[#C8A34D]",
        className,
      )}
      {...props}
    />
  );
}