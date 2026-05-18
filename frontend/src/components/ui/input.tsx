import * as React from "react";
import { cn } from "../../lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "h-11 w-full rounded-xl border border-white/10 bg-zinc-950/70 px-4 text-sm text-zinc-100 outline-none transition-all placeholder:text-zinc-600 focus:border-cyan-300/50 focus:ring-4 focus:ring-cyan-300/10",
        className,
      )}
      {...props}
    />
  ),
);

Input.displayName = "Input";
