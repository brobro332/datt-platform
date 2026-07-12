import { HTMLAttributes, ReactNode } from "react";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

export function Card({
  children,
  className = "",
  ...props
}: CardProps) {
  return (
    <div
      className={[
        "rounded-3xl border border-white/60 bg-white/85 shadow-[0_8px_30px_rgba(0,0,0,0.015)] backdrop-blur-md p-6 transition-all duration-500 hover:shadow-[0_20px_50px_rgba(99,102,241,0.06)] hover:border-indigo-100/40 hover:-translate-y-1",
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </div>
  );
}