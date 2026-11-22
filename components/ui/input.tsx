import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const inputVariants = cva(
  [
    // layout + type
    "flex h-10 w-full min-w-0 text-sm text-foreground",
    "placeholder:text-muted-foreground",
    // file inputs
    "file:mr-3 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
    // interaction
    "transition-colors outline-none",
    "focus-visible:ring-2 focus-visible:ring-[#C8A34D] focus-visible:ring-offset-0",
    "disabled:cursor-not-allowed disabled:opacity-50",
    // invalid state (set aria-invalid on the input)
    "aria-[invalid=true]:border-destructive aria-[invalid=true]:focus-visible:ring-destructive",
  ],
  {
    variants: {
      variant: {
        // Filled field on the app surface. A border keeps it visible on cards.
        default: "rounded-md border border-input bg-background px-3 py-2",
        // Brand-colored border, transparent background.
        outline: "rounded-md border border-[#C8A34D] bg-transparent px-3 py-2",
        // Minimal: bottom border only, focus recolors the line.
        underlined:
          "rounded-none border-0 border-b border-input bg-transparent px-0 py-2 focus-visible:border-[#C8A34D] focus-visible:ring-0",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface InputProps
  extends React.ComponentProps<"input">, VariantProps<typeof inputVariants> {}

// React 19: `ref` is a regular prop, so it's forwarded through ...props.
export function Input({ className, variant, type, ...props }: InputProps) {
  return (
    <input
      type={type}
      className={cn(inputVariants({ variant }), className)}
      {...props}
    />
  );
}
