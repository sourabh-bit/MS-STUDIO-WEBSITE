import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import MasterclassPaymentStatusCard from "@/components/classes/MasterclassPaymentStatusCard";
import { Button } from "@/components/ui/button";
import { getMasterclassPaymentDetails } from "@/lib/masterclass";
import { getPaymentStatus } from "@/lib/payment";

// Quick phase: matches the common case, where the bank confirms within
// seconds of the browser landing back on this page.
const FAST_POLL_INTERVAL_MS = 4000;
const FAST_POLL_ATTEMPTS = 15; // ~60s of quick polling

// Slow phase: still auto-checking, but spaced out so a payment that's
// taking unusually long doesn't hammer the bank's status API for ten
// minutes straight (each check here is a live call to ICICI, not a local
// cache read).
const SLOW_POLL_INTERVAL_MS = 20000;

// Hard cutoff — mirrors PENDING_EXPIRY_MS on the backend's reconcile sweep,
// so the customer is never left watching a spinner indefinitely. Past this,
// they're handed the normal Payment Failed screen (with its own Try Again),
// instead of this page staying open forever.
const DEADLINE_MS = 10 * 60 * 1000;

const PaymentPending = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const paymentDetails = getMasterclassPaymentDetails(searchParams);
  const [attempts, setAttempts] = useState(0);
  const [isChecking, setIsChecking] = useState(false);
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef(Date.now());

  const buildResultUrl = useCallback(
    (pathname: "/success" | "/failure", extraParams?: Record<string, string>) => {
      const params = new URLSearchParams(searchParams);
      for (const [key, value] of Object.entries(extraParams ?? {})) {
        params.set(key, value);
      }
      return `${pathname}?${params.toString()}`;
    },
    [searchParams],
  );

  // Same retry-link construction PaymentFailure.tsx uses, so "Pay Again"
  // from here lands back on the right checkout flow (including preserving
  // a second-installment attempt rather than dropping back to advance).
  const retryLink = (() => {
    const retryParams = new URLSearchParams();
    const copyParam = (key: string) => {
      const value = searchParams.get(key)?.trim();
      if (value) {
        retryParams.set(key, value);
      }
    };

    ["variant", "course", "amount", "feeLabel", "summaryLabel", "trustLine", "name", "fullName", "email", "phone", "mobile"].forEach(
      copyParam,
    );

    if (paymentDetails.paymentType === "SECOND_INSTALLMENT") {
      retryParams.set("installment", "second");
    }

    return retryParams.toString() ? `/classes/checkout?${retryParams.toString()}` : "/classes/checkout";
  })();

  const checkStatus = useCallback(async () => {
    if (!paymentDetails.merchantTxnNo) {
      return;
    }

    setIsChecking(true);

    try {
      const result = await getPaymentStatus(paymentDetails.merchantTxnNo);

      if (result.paymentStatus === "SUCCESS") {
        navigate(buildResultUrl("/success"), { replace: true });
        return;
      }

      if (
        ["FAILED", "CANCELLED", "EXPIRED", "ERROR", "HASH_MISMATCH"].includes(
          result.paymentStatus,
        )
      ) {
        navigate(buildResultUrl("/failure"), { replace: true });
        return;
      }
    } catch {
      // Keep polling — a transient network/API error here isn't a payment failure.
    } finally {
      setIsChecking(false);
      setAttempts((current) => current + 1);
    }
  }, [buildResultUrl, navigate, paymentDetails.merchantTxnNo]);

  useEffect(() => {
    if (!paymentDetails.merchantTxnNo) {
      return;
    }

    if (Date.now() - startTimeRef.current >= DEADLINE_MS) {
      navigate(
        buildResultUrl("/failure", {
          message:
            "We couldn't confirm your payment within 10 minutes. Please try again — if any amount was debited, it will be refunded automatically.",
        }),
        { replace: true },
      );
      return;
    }

    const interval = attempts < FAST_POLL_ATTEMPTS ? FAST_POLL_INTERVAL_MS : SLOW_POLL_INTERVAL_MS;
    timerRef.current = window.setTimeout(checkStatus, interval);

    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, [attempts, buildResultUrl, checkStatus, navigate, paymentDetails.merchantTxnNo]);

  const stillWaiting = attempts >= FAST_POLL_ATTEMPTS;

  return (
    <MasterclassPaymentStatusCard
      badge="Payment Update"
      title={stillWaiting ? "Still Confirming" : "Confirming Payment"}
      description={
        stillWaiting
          ? "This is taking longer than usual. We'll keep checking automatically for a few more minutes — you can also pay again if you'd rather not wait."
          : "We're confirming your payment with the bank. This usually takes a few seconds."
      }
      infoText="You don't need to pay again or refresh this page — we'll take you to the right place automatically."
      statusMessage={paymentDetails.message}
      amountLabel="Amount"
      courseName={paymentDetails.courseName}
      amount={paymentDetails.fee}
      userName={paymentDetails.userName}
      transactionId={paymentDetails.transactionId}
      icon={<Loader2 className="h-7 w-7 animate-spin sm:h-8 sm:w-8" />}
      iconToneClassName="border-dusty-rose/20 bg-primary/[0.05] text-dusty-rose"
      actions={
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            type="button"
            onClick={checkStatus}
            disabled={isChecking || !paymentDetails.merchantTxnNo}
            className="h-12 w-full rounded-full bg-primary px-6 font-sans text-sm tracking-[0.2em] text-primary-foreground uppercase shadow-[0_8px_20px_rgba(150,100,120,0.16)] transition-all duration-300 hover:bg-dusty-rose sm:flex-1"
          >
            {isChecking ? "Checking…" : "Check Now"}
          </Button>

          {stillWaiting ? (
            <Button
              asChild
              variant="outline"
              className="h-12 w-full rounded-full border-border/50 bg-background/80 font-sans text-sm tracking-[0.2em] text-foreground uppercase transition-all duration-300 hover:bg-primary/[0.04] hover:text-foreground sm:flex-1"
            >
              <Link to={retryLink}>Pay Again</Link>
            </Button>
          ) : (
            <Button
              asChild
              variant="outline"
              className="h-12 w-full rounded-full border-border/50 bg-background/80 font-sans text-sm tracking-[0.2em] text-foreground uppercase transition-all duration-300 hover:bg-primary/[0.04] hover:text-foreground sm:flex-1"
            >
              <Link to="/">Back to Home</Link>
            </Button>
          )}
        </div>
      }
    />
  );
};

export default PaymentPending;
