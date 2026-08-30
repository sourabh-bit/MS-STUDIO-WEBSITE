import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type PinnedEditorialTagProps = {
  number?: string;
  label?: string;
  className?: string;
  children?: ReactNode;
};

// A single reusable "pinned note" motif — a slightly rotated paper tag,
// pinned with a red tack, with a folded corner and a second sheet peeking
// out from behind it — used everywhere the site needs an editorial
// numbered callout (advance-paid confirmation, second-installment
// section/confirmation), so the look stays identical across all of them
// instead of being redrawn ad hoc each time.
const PinnedEditorialTag = ({ number, label, className, children }: PinnedEditorialTagProps) => (
  <div className={cn("relative mx-auto w-[92%] max-w-md sm:w-full", className)}>
    <div className="absolute left-1/2 -top-3 z-20 h-5 w-5 -translate-x-1/2 rounded-full bg-gradient-to-br from-[#ea5a63] via-[#c53341] to-[#8f1c28] shadow-[0_3px_6px_rgba(0,0,0,0.35),inset_0_1px_1px_rgba(255,255,255,0.5)]" />
    <div className="absolute left-1/2 top-1.5 z-10 h-2 w-4 -translate-x-1/2 rounded-full bg-black/15 blur-[3px]" />

    <div
      className="relative -rotate-1 overflow-hidden border border-dusty-rose/25 bg-gradient-to-b from-[#FFFDF9] to-[#F6EFE3] px-5 py-6 sm:px-8 sm:py-8"
      style={{
        boxShadow:
          "5px 6px 0 0 #EDE3D6, 5px 6px 0 1px rgba(0,0,0,0.05), 0 16px 32px rgba(0,0,0,0.10), 0 4px 10px rgba(0,0,0,0.06)",
      }}
    >
      <div className="pointer-events-none absolute right-0 top-0 h-6 w-6 overflow-hidden sm:h-7 sm:w-7">
        <div className="absolute right-0 top-0 h-9 w-9 origin-top-right rotate-45 bg-gradient-to-br from-[#F6EFE3] to-[#E2D5C1] shadow-[-2px_2px_4px_rgba(0,0,0,0.2)] sm:h-10 sm:w-10" />
      </div>

      {(number || label) && (
        <div className={cn("flex items-baseline gap-3", !number && "justify-center")}>
          {number && <span className="font-serif text-3xl text-dusty-rose sm:text-4xl">{number}</span>}
          {label && (
            <span className="font-sans text-xs tracking-[0.3em] text-foreground uppercase sm:text-sm">
              {label}
            </span>
          )}
        </div>
      )}

      {children && <div className={cn(number || label ? "mt-4" : undefined, "text-center")}>{children}</div>}
    </div>
  </div>
);

export default PinnedEditorialTag;
