import { ButtonHTMLAttributes, ReactNode } from "react";
import { LoadingSpinner } from "./LoadingSpinner";

type ButtonVariant = "primary" | "secondary" | "ghost";

type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
};

const variantClassNames: Record<ButtonVariant, string> = {
  primary: "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-[0_4px_20px_rgba(99,102,241,0.2)] hover:shadow-[0_8px_30px_rgba(99,102,241,0.3)] hover:scale-[1.02] active:scale-[0.98]",
  secondary: "border border-slate-200/80 bg-white/90 text-slate-800 backdrop-blur-sm shadow-[0_4px_15px_rgba(0,0,0,0.02)] hover:bg-slate-50 hover:scale-[1.02] hover:shadow-[0_8px_25px_rgba(0,0,0,0.04)] active:scale-[0.98]",
  ghost: "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 active:scale-[0.98]",
};

const sizeClassNames: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-xs font-semibold",
  md: "h-11 px-5 text-sm font-semibold",
  lg: "h-13 px-7 text-base font-bold tracking-tight",
};

export function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  isLoading = false,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={[
        "inline-flex items-center justify-center gap-2 rounded-2xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-50 select-none",
        variantClassNames[variant],
        sizeClassNames[size],
        className,
      ].join(" ")}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <LoadingSpinner size="sm" />}
      {children}
    </button>
  );
}