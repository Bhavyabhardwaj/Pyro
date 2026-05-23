import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8da2aa]/30 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-[#e8e8e5] text-[#111110] shadow-[0_8px_20px_rgba(232,232,229,0.04)] hover:bg-white hover:scale-[1.01] active:scale-[0.995]",
        secondary:
          "border border-white/[0.04] bg-white/[0.015] text-[#c4c4c0] hover:border-white/10 hover:bg-white/[0.035] hover:text-white hover:scale-[1.01] active:scale-[0.995]",
        ghost: "text-[#8a8a84] hover:bg-white/[0.03] hover:text-[#e8e8e5]",
        danger:
          "border border-rose-500/15 bg-rose-500/5 text-rose-300 hover:bg-rose-500/10",
      },
      size: {
        default: "h-11 px-5",
        sm: "h-9 px-3 text-xs",
        lg: "h-12 px-6 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";
