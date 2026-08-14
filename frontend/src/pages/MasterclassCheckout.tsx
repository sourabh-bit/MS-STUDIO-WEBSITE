import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, ExternalLink, Lock } from "lucide-react";

import heroMasterclass from "@/assets/classes/hero-masterclass.jpg";
import RegistrationDialog from "@/components/classes/RegistrationDialog";
import { getMasterclassPaymentDetails } from "@/lib/masterclass";

const ICICI_PAYMENT_LINK =
  "https://pgpay.icici.bank.in/pg/portal/pay/initiatePayOrder?merchantID=100000000455550";

const MasterclassCheckout = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const paymentDetails = getMasterclassPaymentDetails(searchParams);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate("/classes");
  };

  const isOffline = paymentDetails.variant === "offline";

  const { lineTotal, baseTotal, gstTotal } = useMemo(() => {
    const total = paymentDetails.fee;
    const base = isOffline ? Math.round(total / 1.18) : total;
    return {
      lineTotal: total,
      baseTotal: base,
      gstTotal: total - base,
    };
  }, [paymentDetails.fee, isOffline]);

  const formatInr = (value: number) => `₹${new Intl.NumberFormat("en-IN").format(value)}`;

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

          <div className="mb-6 sm:mb-8">
            <p className="font-sans text-xs tracking-[0.35em] text-dusty-rose uppercase">
              Your Cart
            </p>
            <h1 className="mt-2 font-serif text-2xl font-light tracking-[0.06em] text-foreground uppercase sm:text-4xl">
              Review &amp; Pay
            </h1>
          </div>

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
                    {formatInr(lineTotal)}
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
                    <span>{formatInr(baseTotal)}</span>
                  </div>

                  {isOffline && (
                    <div className="flex items-center justify-between font-sans text-sm text-foreground/90">
                      <span>GST (18%)</span>
                      <span>{formatInr(gstTotal)}</span>
                    </div>
                  )}

                  <div className="border-t border-dashed border-border/40 pt-3">
                    <div className="flex items-center justify-between">
                      <span className="font-sans text-sm font-semibold uppercase tracking-[0.08em] text-foreground">
                        Advance to pay
                      </span>
                      <span className="font-serif text-2xl text-foreground">
                        {formatInr(lineTotal)}
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
                    You'll be taken to ICICI Bank's secure payment page. Enter{" "}
                    <span className="font-semibold text-foreground">
                      {formatInr(lineTotal)}
                    </span>{" "}
                    as the amount there to complete your booking.
                  </p>

                  <button
                    type="button"
                    onClick={() => setIsFormOpen(true)}
                    className="inline-flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-full bg-primary px-8 py-4 font-sans text-sm tracking-[0.2em] uppercase text-primary-foreground shadow-elegant transition-all duration-300 hover:bg-dusty-rose"
                  >
                    Pay Now
                    <ExternalLink className="h-4 w-4" />
                  </button>

                  <p className="flex items-center justify-center gap-1.5 font-sans text-[11px] text-muted-foreground">
                    <Lock className="h-3 w-3" />
                    100% secure checkout {"•"} Limited seats available
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <RegistrationDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        courseName={paymentDetails.courseName}
        variant={isOffline ? "offline" : "online"}
        amount={paymentDetails.fee}
        onSuccess={() => {
          window.location.href = ICICI_PAYMENT_LINK;
        }}
      />
    </section>
  );
};

export default MasterclassCheckout;
