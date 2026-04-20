import { useEffect, useState } from "react";

import { OFFLINE_MASTERCLASS_DETAILS, formatInr } from "@/lib/masterclass";
import { cn } from "@/lib/utils";

type StickyPaymentBarProps = {
  onOpenCheckout: () => void;
};

const StickyPaymentBar = ({ onOpenCheckout }: StickyPaymentBarProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 220);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 lg:hidden transition-all duration-500 ease-out",
        isVisible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-full opacity-0",
      )}
    >
      <div className="border-t border-border/60 bg-background/95 px-4 py-3 backdrop-blur-md">
        <div className="mx-auto flex max-w-md items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="font-display text-2xl text-foreground">
              {formatInr(OFFLINE_MASTERCLASS_DETAILS.fee)}
            </p>
            <p className="font-sans text-[10px] tracking-[0.18em] uppercase text-muted-foreground">
              {OFFLINE_MASTERCLASS_DETAILS.feeLabel}
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenCheckout}
            data-course={OFFLINE_MASTERCLASS_DETAILS.courseName}
            data-price={String(OFFLINE_MASTERCLASS_DETAILS.fee)}
            data-payment-trigger="sticky-bar"
            className="shrink-0 rounded-full bg-primary px-6 py-3 font-sans text-xs tracking-[0.2em] text-primary-foreground uppercase transition-all duration-300 hover:bg-dusty-rose"
          >
            Pay Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default StickyPaymentBar;
