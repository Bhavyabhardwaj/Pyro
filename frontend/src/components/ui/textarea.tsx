import * as React from "react";
import { cn } from "../../lib/utils";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "min-h-12 w-full resize-none rounded-2xl border border-white/10 bg-zinc-950/70 px-4 py-3 text-sm text-zinc-100 outline-none transition-all placeholder:text-zinc-600 focus:border-cyan-300/50 focus:ring-4 focus:ring-cyan-300/10",
        className,
      )}
      {...props}
    />
  ),
);

Textarea.displayName = "Textarea";
