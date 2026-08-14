import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import MasterclassPaymentStatusCard from "@/components/classes/MasterclassPaymentStatusCard";
import { Button } from "@/components/ui/button";
import { getMasterclassPaymentDetails } from "@/lib/masterclass";
import { getPaymentStatus } from "@/lib/payment";

const POLL_INTERVAL_MS = 4000;
const MAX_POLL_ATTEMPTS = 15;

const PaymentPending = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const paymentDetails = getMasterclassPaymentDetails(searchParams);
  const [attempts, setAttempts] = useState(0);
  const [isChecking, setIsChecking] = useState(false);
  const timerRef = useRef<number | null>(null);

  const buildResultUrl = useCallback(
    (pathname: "/success" | "/failure") => {
      const params = new URLSearchParams(searchParams);
      return `${pathname}?${params.toString()}`;
    },
    [searchParams],
  );

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
    if (!paymentDetails.merchantTxnNo || attempts >= MAX_POLL_ATTEMPTS) {
      return;
    }

    timerRef.current = window.setTimeout(checkStatus, POLL_INTERVAL_MS);

    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, [attempts, checkStatus, paymentDetails.merchantTxnNo]);

  const stillWaiting = attempts >= MAX_POLL_ATTEMPTS;

  return (
    <MasterclassPaymentStatusCard
      badge="Payment Update"
      title={stillWaiting ? "Still Confirming" : "Confirming Payment"}
      description={
        stillWaiting
          ? "This is taking longer than usual. Your payment may still complete — check back shortly."
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

          <Button
            asChild
            variant="outline"
            className="h-12 w-full rounded-full border-border/50 bg-background/80 font-sans text-sm tracking-[0.2em] text-foreground uppercase transition-all duration-300 hover:bg-primary/[0.04] hover:text-foreground sm:flex-1"
          >
            <Link to="/">Back to Home</Link>
          </Button>
        </div>
      }
    />
  );
};

export default PaymentPending;
