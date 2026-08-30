import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Phone } from "lucide-react";

import PinnedEditorialTag from "@/components/classes/PinnedEditorialTag";
import { useAuth } from "@/context/AuthContext";
import { OFFLINE_MASTERCLASS_DETAILS, formatInr } from "@/lib/masterclass";
import { getPaymentSummary } from "@/lib/payment";
import { checkRegistration } from "@/lib/registration";
import type { PaymentSummaryResponse } from "@/types/payment";

type SecondInstallmentSectionProps = {
  onNeedsRegistration: () => void;
};

const SecondInstallmentSection = ({ onNeedsRegistration }: SecondInstallmentSectionProps) => {
  const navigate = useNavigate();
  const { user, requireAuth } = useAuth();
  const [summary, setSummary] = useState<PaymentSummaryResponse | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [inlineMessage, setInlineMessage] = useState("");

  // If the visitor is already logged in when this section mounts, reflect
  // their real backend state immediately (e.g. fully paid) instead of only
  // discovering it after a click.
  useEffect(() => {
    if (!user) {
      return;
    }

    getPaymentSummary(OFFLINE_MASTERCLASS_DETAILS.courseName, "offline")
      .then(setSummary)
      .catch(() => {
        // Fail quiet — the section just falls back to the generic CTA state.
      });
  }, [user]);

  const goToSecondInstallment = () => {
    const params = new URLSearchParams({
      variant: "offline",
      course: OFFLINE_MASTERCLASS_DETAILS.courseName,
      installment: "second",
    });

    navigate(`/classes/checkout?${params.toString()}`);
  };

  // Advance isn't paid yet — send them into the normal advance checkout
  // (same params goToCheckout in OfflineClasses uses) rather than just
  // showing a dead-end message here, with a notice banner explaining why
  // they landed there.
  const goToAdvanceCheckoutWithNotice = () => {
    const params = new URLSearchParams({
      variant: "offline",
      course: OFFLINE_MASTERCLASS_DETAILS.courseName,
      amount: String(OFFLINE_MASTERCLASS_DETAILS.fee),
      feeLabel: OFFLINE_MASTERCLASS_DETAILS.feeLabel,
      summaryLabel: OFFLINE_MASTERCLASS_DETAILS.summaryLabel,
      trustLine: OFFLINE_MASTERCLASS_DETAILS.trustLine,
      notice: "advance-required",
    });

    navigate(`/classes/checkout?${params.toString()}`);
  };

  const handleClick = () => {
    setInlineMessage("");

    requireAuth(async () => {
      setIsChecking(true);

      try {
        const alreadyRegistered = await checkRegistration(OFFLINE_MASTERCLASS_DETAILS.courseName, "offline");

        if (!alreadyRegistered) {
          onNeedsRegistration();
          return;
        }

        const latestSummary = await getPaymentSummary(OFFLINE_MASTERCLASS_DETAILS.courseName, "offline");
        setSummary(latestSummary);

        if (latestSummary.advance.status !== "PAID") {
          goToAdvanceCheckoutWithNotice();
          return;
        }

        goToSecondInstallment();
      } catch {
        setInlineMessage("Couldn't check your payment status right now. Please try again.");
      } finally {
        setIsChecking(false);
      }
    });
  };

  const isFullyPaid = summary?.secondInstallment.status === "PAID";

  return (
    <section className="scroll-mt-24 pt-4 pb-16 md:pt-6 md:pb-20 section-cream">
      <div className="container mx-auto px-4">
        {isFullyPaid ? (
          <div className="mx-auto max-w-md text-center">
            <p className="mb-6 font-display text-3xl tracking-wide text-dusty-rose uppercase sm:text-4xl md:text-5xl">
              Congratulations
            </p>
            <PinnedEditorialTag label="Second Installment Paid">
              <p className="font-display text-3xl text-foreground sm:text-4xl">
                {formatInr(summary.secondInstallment.totalAmount)} Paid
              </p>
            </PinnedEditorialTag>
          </div>
        ) : (
          <div className="mx-auto max-w-md text-center">
            <PinnedEditorialTag number="02">
              <span className="inline-block rounded-full bg-dusty-rose/15 px-5 py-2 font-sans text-sm font-bold tracking-[0.15em] text-dusty-rose uppercase sm:text-base">
                Already Registered!!
              </span>

              <p className="mt-4 font-display text-2xl text-foreground sm:text-3xl">
                Pay Your Second Installment
              </p>
              <p className="mt-3 font-sans text-sm leading-relaxed text-muted-foreground">
                Already paid your advance? Complete your course fee in flexible payments.
              </p>

              {summary?.advance.status === "PAID" && summary.secondInstallment.status === "PARTIAL" && (
                <p className="mt-3 font-sans text-xs tracking-[0.1em] text-dusty-rose uppercase">
                  Remaining Due {formatInr(summary.secondInstallment.remainingAmount)}
                </p>
              )}

              <button
                type="button"
                onClick={handleClick}
                disabled={isChecking}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-full bg-primary px-8 py-4 font-sans text-sm tracking-[0.2em] uppercase text-primary-foreground transition-all duration-300 hover:bg-dusty-rose disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
              >
                {isChecking && <Loader2 className="h-4 w-4 animate-spin" />}
                Pay Second Installment
              </button>

              {inlineMessage && (
                <p className="mt-4 font-sans text-xs leading-relaxed text-dusty-rose">{inlineMessage}</p>
              )}
            </PinnedEditorialTag>
          </div>
        )}

        <div className="mx-auto mt-16 max-w-2xl">
          <div className="p-6 bg-white border border-dusty-rose/20 text-center">
            <p className="font-sans text-sm text-muted-foreground mb-3">
              For queries and booking confirmation
            </p>
            <a
              href="tel:+919818793850"
              className="inline-flex items-center gap-3 font-serif text-xl text-foreground hover:text-dusty-rose transition-colors duration-300"
            >
              <Phone className="w-5 h-5" />
              +91 98187 93850
            </a>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-6 italic">
            Seats are limited and blocked on a first-come, first-serve basis.
          </p>
        </div>
      </div>
    </section>
  );
};

export default SecondInstallmentSection;
