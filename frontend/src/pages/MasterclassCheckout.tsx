import { ArrowLeft, Building2, Check, Copy, MessageCircle, QrCode } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useState } from "react";
import { getMasterclassPaymentDetails } from "@/lib/masterclass";

const UPI_ID = "meerasakhranibeauty.ibz@icici";
const WHATSAPP_NUMBER = "919818793850";

const bankDetails = [
  { label: "Account Name", value: "MEERA SAKHRANI BEAUTY" },
  { label: "Account Number", value: "071405003337" },
  { label: "Account Type", value: "CURRENT ACCOUNT (C/A)" },
  { label: "IFSC Code", value: "ICIC0000714" },
  { label: "Branch", value: "LAJPAT NAGAR" },
];

const MasterclassCheckout = () => {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const paymentDetails = getMasterclassPaymentDetails(searchParams);

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate("/classes");
  };

  const qrPayload = `upi://pay?pa=${encodeURIComponent(UPI_ID)}&pn=${encodeURIComponent("Meera Sakhrani Beauty")}&cu=INR`;
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=420x420&margin=12&data=${encodeURIComponent(qrPayload)}`;
  const whatsappMessage = encodeURIComponent(
    `Hi Meera, I have completed the payment for ${paymentDetails.courseName}. Please find my details and payment screenshot attached.`
  );

  const handleCopyUpiId = async () => {
    try {
      await navigator.clipboard.writeText(UPI_ID);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

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
    <section className="min-h-screen bg-[#F8F3EB] py-6 sm:py-8 md:py-12 lg:py-16">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-7xl">
          <button
            type="button"
            onClick={handleBack}
            className="mb-6 inline-flex items-center gap-2 font-sans text-xs tracking-[0.2em] text-foreground/70 uppercase transition-colors duration-300 hover:text-dusty-rose"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Classes
          </button>

          <div className="overflow-hidden rounded-[2rem] border border-border/30 bg-background/70 shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
            <div className="grid gap-px bg-border/20 xl:grid-cols-[minmax(0,0.38fr)_minmax(0,0.62fr)]">
              <div className="flex h-full flex-col justify-center bg-primary/[0.05] px-5 py-7 sm:px-8 sm:py-8 md:px-10 md:py-10 lg:px-12 lg:py-12">
                <div className="mx-auto w-full max-w-[28rem] space-y-8 xl:mx-0">
                  <div className="space-y-4">
                    <p className="font-sans text-xs tracking-[0.35em] text-dusty-rose uppercase">
                      Payment Details
                    </p>
                    <h1 className="font-serif text-3xl font-light tracking-[0.08em] text-foreground uppercase sm:text-4xl xl:text-[2.9rem] xl:leading-none">
                      Complete Your Booking
                    </h1>
                    <p className="max-w-[26rem] font-sans text-sm leading-relaxed text-muted-foreground sm:text-base">
                      Scan the QR code, pay via UPI, then send your details and payment screenshot on WhatsApp.
                    </p>
                  </div>

                  <div className="rounded-[1.75rem] border border-foreground/5 bg-background/90 p-6 shadow-[0_10px_30px_rgba(0,0,0,0.04)] sm:p-7">
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <span className="inline-flex rounded-full border border-dusty-rose/25 bg-primary/[0.04] px-3 py-1.5 font-sans text-[10px] tracking-[0.22em] text-muted-foreground uppercase">
                          {paymentDetails.variant === "offline"
                            ? "Offline Access"
                            : "Masterclass Access"}
                        </span>
                        <p className="font-sans text-xs tracking-[0.25em] text-muted-foreground uppercase">
                          Course
                        </p>
                        <p className="font-serif text-2xl leading-tight text-foreground sm:text-[2rem]">
                          {paymentDetails.courseName}
                        </p>
                        <p className="max-w-[18rem] font-sans text-sm leading-relaxed text-muted-foreground">
                          {paymentDetails.summaryLabel}
                        </p>
                      </div>

                      <div className="space-y-3 border-t border-border/20 pt-5">
                        <p className="font-sans text-xs tracking-[0.25em] text-muted-foreground uppercase">
                          Payment Amount
                        </p>
                        <div className="flex flex-nowrap items-end gap-1 whitespace-nowrap">
                          <span className="font-display text-4xl font-bold leading-none text-foreground sm:text-5xl lg:text-6xl">
                            ₹
                          </span>
                          <span className="font-display text-4xl font-bold leading-none text-foreground sm:text-5xl lg:text-6xl">
                            {new Intl.NumberFormat("en-IN").format(paymentDetails.fee)}
                          </span>
                        </div>
                        <p className="font-sans text-xs tracking-[0.18em] text-muted-foreground uppercase">
                          {paymentDetails.feeLabel}
                        </p>
                        {paymentDetails.variant === "offline" && (
                          <p className="whitespace-nowrap font-sans text-[10px] font-semibold tracking-[0.02em] text-[#8B6D5C] sm:text-sm">
                            *₹{new Intl.NumberFormat("en-IN").format(Math.round(paymentDetails.fee / 1.18))} + 18% GST = ₹{new Intl.NumberFormat("en-IN").format(paymentDetails.fee)}
                          </p>
                        )}
                      </div>

                      <div className="rounded-2xl border border-dusty-rose/30 bg-soft-pink/30 px-4 py-3.5 text-left">
                        <p className="font-sans text-xs tracking-[0.18em] uppercase text-dusty-rose">
                          Please note
                        </p>
                        <p className="mt-1 font-sans text-sm leading-relaxed text-foreground">
                          The advance is non-refundable and can only be claimed towards your immediate next class.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex h-full flex-col justify-center bg-background/95 px-5 py-7 sm:px-8 sm:py-8 md:px-10 md:py-10 lg:px-12 lg:py-12">
                <div className="mx-auto w-full max-w-[46rem] space-y-6">
                  <div className="space-y-2">
                    <p className="font-sans text-xs tracking-[0.3em] text-muted-foreground uppercase">
                      Payment via UPI
                    </p>
                    <p className="max-w-xl font-sans text-sm leading-relaxed text-muted-foreground sm:text-base">
                      Use the QR code or the UPI ID below. After paying, send your details and the payment screenshot on WhatsApp.
                    </p>
                  </div>

                  <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] xl:items-stretch">
                    <div className="rounded-[1.75rem] border border-dusty-rose/20 bg-[#FBF6F0] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.04)] sm:p-6">
                      <div className="flex items-center gap-2 text-dusty-rose">
                        <QrCode className="h-5 w-5" />
                        <p className="font-sans text-xs tracking-[0.28em] uppercase">
                          UPI QR Code
                        </p>
                      </div>

                      <div className="mt-5 flex justify-center rounded-[1.5rem] bg-white p-4 sm:p-5">
                        <img
                          src={qrImageUrl}
                          alt={`QR code for UPI ID ${UPI_ID}`}
                          className="aspect-square w-full max-w-[260px] rounded-[1rem] object-contain sm:max-w-[300px]"
                        />
                      </div>

                      <div className="mt-5 rounded-2xl border border-border/30 bg-white/85 px-4 py-3.5 text-center">
                        <p className="font-sans text-[10px] tracking-[0.22em] text-muted-foreground uppercase">
                          UPI ID
                        </p>
                        <div className="mt-2 flex flex-col items-center gap-3">
                          <p className="font-serif text-base leading-snug break-words text-foreground text-center sm:text-lg">
                            {UPI_ID}
                          </p>
                          <button
                            type="button"
                            onClick={handleCopyUpiId}
                            aria-label={copied ? "UPI ID copied" : "Copy UPI ID"}
                            title={copied ? "Copied" : "Copy UPI ID"}
                            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-dusty-rose/25 bg-[#FAF4EF] text-foreground transition-colors duration-300 hover:border-dusty-rose/40 hover:bg-dusty-rose/10"
                          >
                            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-5">
                      <div className="overflow-hidden rounded-[1.75rem] border-2 border-dusty-rose/40 bg-background shadow-[0_10px_30px_rgba(0,0,0,0.05)]">
                        <div className="flex items-center gap-3 justify-center bg-dusty-rose/15 px-4 py-4">
                          <Building2 className="h-5 w-5 text-dusty-rose" />
                          <h2 className="font-sans text-xl font-bold text-foreground">
                            Bank Details
                          </h2>
                        </div>

                        <div className="p-5 md:p-6">
                          {bankDetails.map((detail, index) => {
                            const isCritical =
                              detail.label === "Account Number" ||
                              detail.label === "IFSC Code";

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
                                    <span className="font-sans text-lg font-bold tracking-wide text-foreground">
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
                                  <span className="font-sans text-base font-bold text-foreground/90">
                                    {detail.value}
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="rounded-[1.75rem] border border-amber-300/40 bg-amber-50 px-5 py-5 shadow-[0_10px_30px_rgba(0,0,0,0.03)]">
                        <p className="font-sans text-xs tracking-[0.3em] text-amber-700 uppercase">
                          Important
                        </p>
                        <p className="mt-3 font-sans text-sm leading-relaxed text-foreground sm:text-[0.96rem]">
                          After paying, please send your details and the payment screenshot to WhatsApp.
                        </p>
                        <a
                          href={`https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMessage}`}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-4 inline-flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-full bg-foreground px-5 py-3 font-sans text-xs tracking-[0.2em] text-background uppercase transition-colors duration-300 hover:bg-dusty-rose sm:w-auto"
                        >
                          <MessageCircle className="h-4 w-4" />
                          Send on WhatsApp
                        </a>
                      </div>


                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MasterclassCheckout;





