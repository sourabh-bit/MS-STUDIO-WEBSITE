import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import { MASTERCLASS_DETAILS } from "@/lib/masterclass";
import { cn } from "@/lib/utils";

import type { OnlineCtaProps } from "./types";

const StickyPaymentBar = ({ onOpenCheckout, isEnrolled, isBusy }: OnlineCtaProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Hidden near the very bottom so it never sits on top of the footer.
    const handleScroll = () => {
      const distanceFromBottom =
        document.documentElement.scrollHeight - (window.scrollY + window.innerHeight);
      setIsVisible(window.scrollY > 220 && distanceFromBottom > 240);
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
        isVisible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-full opacity-0",
      )}
    >
      <div className="border-t border-border/60 bg-background/95 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md">
        <div className="mx-auto flex max-w-md items-center justify-between gap-3">
          <p className="whitespace-nowrap font-display text-base leading-tight text-foreground">
            Live Online Class
          </p>

          <button
            type="button"
            onClick={onOpenCheckout}
            disabled={isBusy}
            data-course={MASTERCLASS_DETAILS.courseName}
            data-price={String(MASTERCLASS_DETAILS.fee)}
            data-payment-trigger="sticky-bar"
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-primary px-6 py-3 font-sans text-xs tracking-[0.2em] text-primary-foreground uppercase transition-all duration-300 hover:bg-dusty-rose disabled:cursor-wait disabled:opacity-80"
          >
            {isBusy && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {isEnrolled ? "Enrolled" : "Enrol Now"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StickyPaymentBar;
