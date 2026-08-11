import { useState } from "react";
import { Building2, Check, Copy, CreditCard, Landmark, Phone } from "lucide-react";

import { OFFLINE_MASTERCLASS_DETAILS } from "@/lib/masterclass";

type PaymentSectionProps = {
  onOpenCheckout: () => void;
};

const PaymentSection = ({ onOpenCheckout }: PaymentSectionProps) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const bankDetails = [
    { label: "Account Name", value: "MEERA SAKHRANI BEAUTY" },
    { label: "Account Number", value: "071405003337" },
    { label: "Account Type", value: "Current Account (C/A)" },
    { label: "IFSC Code", value: "ICIC0000714" },
    { label: "Branch", value: "Lajpat Nagar" },
  ];

  const handleCopyValue = async (label: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(label);
      window.setTimeout(() => setCopiedField(null), 1800);
    } catch {
      setCopiedField(null);
    }
  };

  return (
    <section
      id="enroll"
      className="py-16 md:py-24 lg:py-5 section-cream bg-pattern-soft"
    >
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 md:mb-16">
          <span className="font-sans text-xs tracking-[0.4em] text-dusty-rose uppercase mb-4 block">
            Investment
          </span>
          <h2 className="heading-section text-foreground mb-4 font-extrabold">
            Payment Structure
          </h2>
          <p className="text-elegant text-muted-foreground max-w-2xl mx-auto">
            Secure your seat in this transformative masterclass
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
          <div className="bg-background p-8 md:p-10 border border-border/30 text-center">
            <div className="mb-6 rounded-2xl border border-dusty-rose/20 bg-soft-pink/30 px-4 py-3 text-left">
              <p className="font-sans text-xs tracking-[0.18em] uppercase text-dusty-rose mb-1">
                Please note
              </p>
              <p className="font-sans text-sm leading-relaxed text-foreground">
                The booking amount is non-refundable under any circumstances.
              </p>
            </div>
            <div className="w-16 h-16 bg-soft-pink/50 rounded-full flex items-center justify-center mx-auto mb-6">
              <CreditCard className="w-8 h-8 text-dusty-rose" />
            </div>
            <p className="font-sans text-xs tracking-[0.3em] uppercase text-muted-foreground mb-2">
              {OFFLINE_MASTERCLASS_DETAILS.totalFeeLabel}
            </p>
            <p className="font-display text-4xl sm:text-5xl md:text-6xl text-foreground mb-2 whitespace-nowrap">
              {OFFLINE_MASTERCLASS_DETAILS.totalFeeRange}{" "}
              <span className="text-xl sm:text-2xl md:text-3xl align-middle">
                {OFFLINE_MASTERCLASS_DETAILS.totalFeeGst}
              </span>
            </p>
            <p className="font-sans text-sm text-muted-foreground">
              For the entire 7-day course
            </p>
          </div>

          <div className="bg-primary/5 p-8 md:p-10 border border-dusty-rose/30 text-center">
            <div className="w-16 h-16 bg-dusty-rose/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Landmark className="w-8 h-8 text-dusty-rose" />
            </div>
            <p className="font-sans text-xs tracking-[0.3em] uppercase text-muted-foreground mb-2">
              {OFFLINE_MASTERCLASS_DETAILS.feeLabel}
            </p>
            <p className="font-display text-4xl sm:text-5xl md:text-6xl text-dusty-rose mb-2 whitespace-nowrap">
              ₹{new Intl.NumberFormat("en-IN").format(OFFLINE_MASTERCLASS_DETAILS.fee)}
            </p>
            <p className="font-sans text-sm text-muted-foreground mb-1">
              To secure your seat
            </p>
            <p className="whitespace-nowrap font-sans text-[10px] sm:text-sm font-semibold tracking-[0.02em] text-[#8B6D5C]">
              *₹{new Intl.NumberFormat("en-IN").format(Math.round(OFFLINE_MASTERCLASS_DETAILS.fee / 1.18))} + GST = ₹{new Intl.NumberFormat("en-IN").format(OFFLINE_MASTERCLASS_DETAILS.fee)}
            </p>
            <div className="mt-8 pt-6 border-t border-dusty-rose/20">
              <button
                type="button"
                onClick={onOpenCheckout}
                data-course={OFFLINE_MASTERCLASS_DETAILS.courseName}
                data-price={String(OFFLINE_MASTERCLASS_DETAILS.fee)}
                data-payment-trigger="section"
                className="w-full sm:w-auto whitespace-nowrap rounded-full border border-primary/10 bg-primary px-8 py-4 font-sans text-sm tracking-[0.2em] uppercase text-primary-foreground transition-all duration-300 hover:bg-dusty-rose"
              >
                Pay Securely
              </button>
              <p className="mt-4 font-sans text-sm text-muted-foreground">
                Instant confirmation {"\u2022"} Limited seats available
              </p>

              <p className="mt-2 font-sans text-sm text-muted-foreground/90">
                Secure your seat with the booking amount
              </p>

              <div className="mt-6 rounded-2xl border border-dusty-rose/20 bg-soft-pink/30 px-4 py-3 text-left">
                <p className="font-sans text-xs tracking-[0.18em] uppercase text-dusty-rose mb-1">
                  Please note
                </p>
                <p className="font-sans text-sm leading-relaxed text-foreground">
                  The advance is non-refundable and can only be claimed towards your immediate next class.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="overflow-hidden rounded-[1.75rem] border-2 border-dusty-rose/40 bg-background shadow-[0_10px_30px_rgba(0,0,0,0.05)]">
            <div className="flex items-center gap-3 justify-center bg-dusty-rose/15 px-4 py-4">
              <Building2 className="w-5 h-5 text-dusty-rose" />
              <h3 className="font-serif text-xl font-semibold text-foreground">
                Payment Details
              </h3>
            </div>

            <div className="p-5 md:p-8">
              {bankDetails.map((detail, index) => {
                const isCritical =
                  detail.label === "Account Number" || detail.label === "IFSC Code";

                return (
                  <div
                    key={detail.label}
                    className={`flex flex-col gap-2 py-3.5 ${
                      index === bankDetails.length - 1
                        ? ""
                        : "border-b border-dashed border-border/30"
                    }`}
                  >
                    <span className="font-sans text-[11px] font-semibold tracking-[0.2em] text-muted-foreground/80 uppercase">
                      {detail.label}
                    </span>
                    {isCritical ? (
                      <div className="flex items-center justify-between gap-3 rounded-xl border border-dusty-rose/40 bg-white px-4 py-2.5 shadow-sm">
                        <span className="font-serif text-lg font-bold tracking-wide text-foreground">
                          {detail.value}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyValue(detail.label, detail.value)}
                          aria-label={`Copy ${detail.label}`}
                          title={copiedField === detail.label ? "Copied" : `Copy ${detail.label}`}
                          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-dusty-rose/10 text-dusty-rose transition-colors duration-300 hover:bg-dusty-rose/20"
                        >
                          {copiedField === detail.label ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    ) : (
                      <span className="font-serif text-base font-medium text-foreground/90">
                        {detail.value}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-8 p-6 bg-white border border-dusty-rose/20 text-center">
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

export default PaymentSection;
