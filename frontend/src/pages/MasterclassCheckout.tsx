import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Loader2, Lock } from "lucide-react";

import heroMasterclass from "@/assets/classes/hero-masterclass.jpg";
import PinnedEditorialTag from "@/components/classes/PinnedEditorialTag";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { getPaymentSummary, initiatePayment } from "@/lib/payment";
import { formatInr, getMasterclassPaymentDetails } from "@/lib/masterclass";
import type { PaymentSummaryResponse } from "@/types/payment";

const MasterclassCheckout = () => {
  const navigate = useNavigate();
  const { requireAuth } = useAuth();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const paymentDetails = getMasterclassPaymentDetails(searchParams);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isOffline = paymentDetails.variant === "offline";
  const wantsInstallmentView = searchParams.get("installment") === "second";
  const wantsAdvanceConfirmation = searchParams.get("showAdvanceConfirmation") === "1";
  const wantsAdvanceNotice = searchParams.get("notice") === "advance-required";

  // The backend is the only source of truth for whether the advance is
  // already paid and what's left on the second installment — never trust
  // query params or local state for that. `null` = "haven't checked yet /
  // couldn't check", which quietly falls back to today's advance UI, same
  // as before this feature existed.
  const [summary, setSummary] = useState<PaymentSummaryResponse | null>(null);
  const [isSummaryLoading, setIsSummaryLoading] = useState(true);
  const [hasDismissedConfirmation, setHasDismissedConfirmation] = useState(false);
  const [installmentAmount, setInstallmentAmount] = useState("");
  const [installmentError, setInstallmentError] = useState("");

  useEffect(() => {
    let cancelled = false;

    getPaymentSummary(paymentDetails.courseName, paymentDetails.variant)
      .then((result) => {
        if (!cancelled) {
          setSummary(result);
        }
      })
      .catch(() => {
        // Not logged in yet, or a network blip — fall back to the default
        // advance view, which still gates the actual payment at click time.
      })
      .finally(() => {
        if (!cancelled) {
          setIsSummaryLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentDetails.courseName, paymentDetails.variant]);

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate("/classes");
  };

  const { lineTotal, baseTotal, gstTotal } = useMemo(() => {
    const total = paymentDetails.fee;
    const base = isOffline ? Math.round(total / 1.18) : total;
    return {
      lineTotal: total,
      baseTotal: base,
      gstTotal: total - base,
    };
  }, [paymentDetails.fee, isOffline]);

  const formatInrSymbol = (value: number) => `₹${new Intl.NumberFormat("en-IN").format(value)}`;

  const handlePayNow = async () => {
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await initiatePayment({
        amount: paymentDetails.fee,
        courseName: paymentDetails.courseName,
        variant: isOffline ? "offline" : "online",
        feeLabel: paymentDetails.feeLabel,
        summaryLabel: paymentDetails.summaryLabel,
        paymentType: "ADVANCE",
      });

      window.location.href = result.redirectUrl;
    } catch (error) {
      toast({
        title: "Couldn't start your payment",
        description: error instanceof Error ? error.message : undefined,
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  const handlePayClick = () => requireAuth(handlePayNow);

  const remainingAmount = summary?.secondInstallment.remainingAmount ?? 0;
  const minAmount = summary?.secondInstallment.minAmount ?? 0;
  const parsedInstallmentAmount = Number(installmentAmount);

  const validateInstallmentAmount = () => {
    if (!installmentAmount.trim()) {
      return "Enter an amount to continue.";
    }

    if (!Number.isFinite(parsedInstallmentAmount) || parsedInstallmentAmount <= 0) {
      return "Amount must be greater than zero.";
    }

    if (parsedInstallmentAmount < minAmount) {
      return `Minimum payment is ${formatInrSymbol(minAmount)}.`;
    }

    if (parsedInstallmentAmount > remainingAmount) {
      return `Amount cannot exceed the remaining balance of ${formatInrSymbol(remainingAmount)}.`;
    }

    return "";
  };

  const handlePayInstallment = async () => {
    if (isSubmitting) {
      return;
    }

    const validationMessage = validateInstallmentAmount();

    if (validationMessage) {
      setInstallmentError(validationMessage);
      return;
    }

    setInstallmentError("");
    setIsSubmitting(true);

    try {
      const result = await initiatePayment({
        amount: parsedInstallmentAmount,
        courseName: paymentDetails.courseName,
        variant: isOffline ? "offline" : "online",
        feeLabel: "Second Installment",
        summaryLabel: "Course fee installment",
        paymentType: "SECOND_INSTALLMENT",
      });

      window.location.href = result.redirectUrl;
    } catch (error) {
      toast({
        title: "Couldn't start your payment",
        description: error instanceof Error ? error.message : undefined,
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  const handlePayInstallmentClick = () => requireAuth(handlePayInstallment);

  const advancePaid = summary?.advance.status === "PAID";
  const installmentFullyPaid = summary?.secondInstallment.status === "PAID";
  const showInstallmentForm =
    advancePaid && !installmentFullyPaid && (hasDismissedConfirmation || (wantsInstallmentView && !wantsAdvanceConfirmation));
  const showAdvanceConfirmation = advancePaid && !installmentFullyPaid && !showInstallmentForm;

  if (isSummaryLoading) {
    return (
      <section className="flex min-h-screen items-center justify-center bg-[#F8F3EB]">
        <Loader2 className="h-6 w-6 animate-spin text-dusty-rose" />
      </section>
    );
  }

  return (
    <section className="animate-fade-in min-h-screen bg-[#F8F3EB] py-6 sm:py-8 md:py-12 lg:py-16">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-6xl">
          <button
            type="button"
            onClick={handleBack}
            className="mb-6 inline-flex items-center gap-2 font-sans text-xs tracking-[0.2em] text-foreground/70 uppercase transition-colors duration-300 hover:text-dusty-rose"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Classes
          </button>

          {advancePaid && installmentFullyPaid && (
            <div className="mx-auto max-w-md py-8 text-center sm:py-12">
              <p className="mb-6 font-display text-3xl tracking-wide text-dusty-rose uppercase sm:text-4xl md:text-5xl">
                Congratulations
              </p>
              <PinnedEditorialTag label="Second Installment Paid">
                <p className="font-display text-3xl text-foreground sm:text-4xl">
                  {formatInr(summary.secondInstallment.totalAmount)} Paid
                </p>
              </PinnedEditorialTag>
            </div>
          )}

          {showAdvanceConfirmation && summary && (
            <div className="mx-auto max-w-md py-8 text-center sm:py-12">
              <p className="mb-6 font-display text-3xl tracking-wide text-dusty-rose uppercase sm:text-4xl md:text-5xl">
                Congratulations
              </p>
              <PinnedEditorialTag label="Advance Fee Paid">
                <p className="font-sans text-sm leading-relaxed text-muted-foreground">
                  You have already paid your advance fee.
                </p>

                <button
                  type="button"
                  onClick={() => setHasDismissedConfirmation(true)}
                  className="mt-6 inline-flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-full bg-primary px-8 py-4 font-sans text-sm tracking-[0.2em] uppercase text-primary-foreground transition-all duration-300 hover:bg-dusty-rose"
                >
                  Pay Your Second Installment
                </button>
              </PinnedEditorialTag>
            </div>
          )}

          {showInstallmentForm && summary && (
            <div className="mb-6 sm:mb-8">
              <p className="font-sans text-xs tracking-[0.35em] text-dusty-rose uppercase">
                Second Installment
              </p>
              <h1 className="mt-2 font-serif text-2xl font-light tracking-[0.06em] text-foreground uppercase sm:text-4xl">
                Pay Your Second Installment
              </h1>
            </div>
          )}

          {showInstallmentForm && summary && (
            <div className="grid gap-4 sm:gap-6 lg:grid-cols-[1.6fr_1fr] lg:items-start">
              <div className="overflow-hidden rounded-[1.75rem] border border-border/30 bg-background/90 shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
                <div className="flex flex-row gap-4 p-4 sm:gap-5 sm:p-6">
                  <img
                    src={heroMasterclass}
                    alt={paymentDetails.courseName}
                    className="h-20 w-20 shrink-0 rounded-xl object-cover sm:h-28 sm:w-28 sm:rounded-2xl"
                  />

                  <div className="flex flex-1 flex-col gap-1">
                    <span className="inline-flex w-fit rounded-full border border-dusty-rose/25 bg-primary/[0.04] px-3 py-1 font-sans text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
                      Offline Access
                    </span>
                    <p className="mt-2 font-serif text-lg leading-tight text-foreground sm:text-2xl">
                      {paymentDetails.courseName}
                    </p>
                    <p className="mt-1 max-w-sm font-sans text-sm leading-relaxed text-muted-foreground">
                      Total course fee ₹3,00,000 + GST
                    </p>
                  </div>
                </div>
              </div>

              <div className="lg:sticky lg:top-24">
                <div className="overflow-hidden rounded-[1.75rem] border border-border/30 bg-background/95 shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
                  <div className="border-b border-border/20 px-5 py-4 sm:px-6">
                    <p className="font-sans text-xs tracking-[0.3em] text-muted-foreground uppercase">
                      Second Installment
                    </p>
                  </div>

                  <div className="space-y-3 px-5 py-5 sm:px-6">
                    <div className="flex items-center justify-between font-sans text-sm text-foreground/90">
                      <span>Second Installment Total</span>
                      <span>{formatInrSymbol(summary.secondInstallment.totalAmount)}</span>
                    </div>

                    <div className="flex items-center justify-between font-sans text-sm text-foreground/90">
                      <span>Already Paid</span>
                      <span>{formatInrSymbol(summary.secondInstallment.amountPaid)}</span>
                    </div>

                    <div className="border-t border-dashed border-border/40 pt-3">
                      <div className="flex items-center justify-between">
                        <span className="font-sans text-sm font-semibold uppercase tracking-[0.08em] text-foreground">
                          Remaining Due
                        </span>
                        <span className="font-serif text-2xl text-foreground">
                          {formatInrSymbol(summary.secondInstallment.remainingAmount)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 border-t border-border/20 bg-primary/[0.03] px-5 py-5 sm:px-6 sm:py-6">
                    <div className="space-y-2">
                      <label
                        htmlFor="installment-amount"
                        className="font-sans text-xs tracking-[0.22em] text-muted-foreground uppercase"
                      >
                        Enter Amount to Pay
                      </label>
                      <div className="flex items-center gap-2 rounded-full border border-border/40 bg-background px-5 py-3">
                        <span className="font-serif text-lg text-foreground">₹</span>
                        <input
                          id="installment-amount"
                          type="number"
                          inputMode="numeric"
                          min={1}
                          value={installmentAmount}
                          onChange={(event) => {
                            setInstallmentAmount(event.target.value);
                            setInstallmentError("");
                          }}
                          placeholder={String(minAmount)}
                          className="w-full bg-transparent font-sans text-base text-foreground outline-none"
                        />
                      </div>
                    </div>

                    {installmentError && (
                      <p className="font-sans text-xs leading-relaxed text-dusty-rose">{installmentError}</p>
                    )}

                    <button
                      type="button"
                      onClick={handlePayInstallmentClick}
                      disabled={isSubmitting}
                      className="inline-flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-full bg-primary px-8 py-4 font-sans text-sm tracking-[0.2em] uppercase text-primary-foreground shadow-elegant transition-all duration-300 hover:bg-dusty-rose disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                      {isSubmitting
                        ? "Redirecting…"
                        : parsedInstallmentAmount > 0
                          ? `Pay ${formatInrSymbol(parsedInstallmentAmount)} Securely`
                          : "Pay Securely"}
                    </button>

                    <p className="flex items-center justify-center gap-1.5 font-sans text-[11px] text-muted-foreground">
                      <Lock className="h-3 w-3" />
                      100% secure checkout
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!advancePaid && (
            <>
              <div className="mb-6 sm:mb-8">
                <p className="font-sans text-xs tracking-[0.35em] text-dusty-rose uppercase">
                  Your Cart
                </p>
                <h1 className="mt-2 font-serif text-2xl font-light tracking-[0.06em] text-foreground uppercase sm:text-4xl">
                  Review &amp; Pay
                </h1>
              </div>

              {wantsAdvanceNotice && (
                <div className="mb-6 rounded-2xl border-2 border-dusty-rose/40 bg-dusty-rose/15 px-4 py-3 text-center font-sans text-sm font-bold leading-relaxed text-dusty-rose">
                  Please complete your advance payment first to unlock second-installment payments.
                </div>
              )}

              <div className="grid gap-4 sm:gap-6 lg:grid-cols-[1.6fr_1fr] lg:items-start">
                {/* Cart item */}
                <div className="overflow-hidden rounded-[1.75rem] border border-border/30 bg-background/90 shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
                  <div className="flex flex-row gap-4 p-4 sm:gap-5 sm:p-6">
                    <img
                      src={heroMasterclass}
                      alt={paymentDetails.courseName}
                      className="h-20 w-20 shrink-0 rounded-xl object-cover sm:h-28 sm:w-28 sm:rounded-2xl"
                    />

                    <div className="flex flex-1 flex-col gap-1">
                      <span className="inline-flex w-fit rounded-full border border-dusty-rose/25 bg-primary/[0.04] px-3 py-1 font-sans text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
                        {isOffline ? "Offline Access" : "Masterclass Access"}
                      </span>
                      <p className="mt-2 font-serif text-lg leading-tight text-foreground sm:text-2xl">
                        {paymentDetails.courseName}
                      </p>
                      <p className="mt-1 hidden max-w-sm font-sans text-sm leading-relaxed text-muted-foreground sm:block">
                        {paymentDetails.summaryLabel}
                      </p>
                      <p className="mt-2 font-serif text-lg text-foreground sm:text-xl">
                        {formatInrSymbol(lineTotal)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Price details / pay */}
                <div className="lg:sticky lg:top-24">
                  <div className="overflow-hidden rounded-[1.75rem] border border-border/30 bg-background/95 shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
                    <div className="border-b border-border/20 px-5 py-4 sm:px-6">
                      <p className="font-sans text-xs tracking-[0.3em] text-muted-foreground uppercase">
                        Price Details
                      </p>
                    </div>

                    <div className="space-y-3 px-5 py-5 sm:px-6">
                      <div className="flex items-center justify-between font-sans text-sm text-foreground/90">
                        <span>Price</span>
                        <span>{formatInrSymbol(baseTotal)}</span>
                      </div>

                      {isOffline && (
                        <div className="flex items-center justify-between font-sans text-sm text-foreground/90">
                          <span>GST (18%)</span>
                          <span>{formatInrSymbol(gstTotal)}</span>
                        </div>
                      )}

                      <div className="border-t border-dashed border-border/40 pt-3">
                        <div className="flex items-center justify-between">
                          <span className="font-sans text-sm font-semibold uppercase tracking-[0.08em] text-foreground">
                            Advance to pay
                          </span>
                          <span className="font-serif text-2xl text-foreground">
                            {formatInrSymbol(lineTotal)}
                          </span>
                        </div>
                      </div>

                      {isOffline && (
                        <p className="font-sans text-xs leading-relaxed text-muted-foreground">
                          Non-refundable, secures your seat. Full course fee is
                          ₹3L + GST.
                        </p>
                      )}
                    </div>

                    <div className="space-y-4 border-t border-border/20 bg-primary/[0.03] px-5 py-5 sm:px-6 sm:py-6">
                      <p className="font-sans text-xs leading-relaxed text-muted-foreground">
                        You'll be taken to ICICI Bank's secure payment page to pay{" "}
                        <span className="font-semibold text-foreground">
                          {formatInrSymbol(lineTotal)}
                        </span>
                        .
                      </p>

                      <button
                        type="button"
                        onClick={handlePayClick}
                        disabled={isSubmitting}
                        className="inline-flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-full bg-primary px-8 py-4 font-sans text-sm tracking-[0.2em] uppercase text-primary-foreground shadow-elegant transition-all duration-300 hover:bg-dusty-rose disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                        {isSubmitting ? "Redirecting…" : "Pay Now"}
                      </button>

                      <p className="flex items-center justify-center gap-1.5 font-sans text-[11px] text-muted-foreground">
                        <Lock className="h-3 w-3" />
                        100% secure checkout {"•"} Limited seats available
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default MasterclassCheckout;
