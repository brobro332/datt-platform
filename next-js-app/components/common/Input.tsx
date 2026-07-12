import { InputHTMLAttributes } from "react";
import { Label } from "@/components/common/Label";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  errorMessage?: string;
};

export function Input({
  label,
  errorMessage,
  className = "",
  id,
  ...props
}: InputProps) {
  return (
    <div className="space-y-2">
      {label && <Label htmlFor={id}>{label}</Label>}

      <input
        id={id}
        className={[
          "h-12 w-full rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-sm px-4 text-sm outline-none transition-all duration-200",
          "placeholder:text-slate-400 text-slate-800",
          "focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:bg-white",
          errorMessage
            ? "border-rose-300 focus:border-rose-500 focus:ring-rose-500/10"
            : "",
          className,
        ].join(" ")}
        {...props}
      />

      {errorMessage && (
        <p className="text-sm text-red-500">
          {errorMessage}
        </p>
      )}
    </div>
  );
}