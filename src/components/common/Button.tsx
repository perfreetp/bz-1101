import React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
}

export default function Button({ children, variant = "primary", size = "md", className, ...props }: ButtonProps) {
  const baseClass = "inline-flex items-center justify-center font-medium rounded-full transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";

  const variantClass = {
    primary: "bg-primary-400 hover:bg-primary-500 text-white hover:shadow-soft",
    secondary: "bg-primary-50 dark:bg-night-800 hover:bg-primary-100 dark:hover:bg-night-200/10 text-primary-600 dark:text-primary-300 border border-primary-100 dark:border-night-200/20",
    ghost: "hover:bg-primary-50 dark:hover:bg-night-200/10 text-primary-600 dark:text-primary-300",
  }[variant];

  const sizeClass = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-5 py-2.5 text-sm",
    lg: "px-6 py-3 text-base",
  }[size];

  return (
    <button className={cn(baseClass, variantClass, sizeClass, className)} {...props}>
      {children}
    </button>
  );
}
