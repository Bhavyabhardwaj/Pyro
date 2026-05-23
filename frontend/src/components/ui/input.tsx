import * as React from "react";
import { cn } from "../../lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "h-11 w-full rounded-xl border border-white/[0.04] bg-[#161615] px-4 text-[13px] text-[#e8e8e5] outline-none transition-all duration-300 placeholder:text-[#5a5a55] focus:border-[#8da2aa]/30 focus:ring-4 focus:ring-[#8da2aa]/3",
        className,
      )}
      {...props}
    />
  ),
);

Input.displayName = "Input";
