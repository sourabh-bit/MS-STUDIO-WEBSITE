import { CalendarDays, Check, Clock, Loader2, Lock, Monitor, Phone } from "lucide-react";

import { MASTERCLASS_DETAILS, formatInrSymbol } from "@/lib/masterclass";

import type { OnlineCtaProps } from "./types";

const INCLUDED = [
  "4-hour live masterclass with Meera Sakhrani",
  "Lake Como destination bridal look, start to finish",
  "7 bonus takeaways on business, branding & content",
  "GST invoice emailed instantly after payment",
];

const STEPS = ["Verify mobile", "Your details", "Secure payment"];

const OnlinePaymentSection = ({ onOpenCheckout, isEnrolled, isBusy }: OnlineCtaProps) => {
  const classDetails = [
    { icon: CalendarDays, label: "Date", value: MASTERCLASS_DETAILS.dateLabel },
    { icon: Clock, label: "Time", value: MASTERCLASS_DETAILS.timeLabel },
    { icon: Monitor, label: "Mode", value: MASTERCLASS_DETAILS.modeLabel },
  ];

  return (
    <section id="enroll-online" className="scroll-mt-24 bg-[#F8F3EB] py-16 md:py-24 lg:py-32">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center md:mb-16">
          <span className="mb-4 block font-sans text-xs tracking-[0.4em] text-dusty-rose uppercase">
            Investment
          </span>
          <h2 className="heading-section mb-4 text-foreground">Class Details &amp; Enrolment</h2>
          <p className="text-elegant mx-auto max-w-2xl text-muted-foreground">
            Join live from anywhere in the world
          </p>
        </div>

        <div className="mx-auto mb-12 grid max-w-4xl gap-4 sm:grid-cols-3 md:mb-16 md:gap-6">
          {classDetails.map((detail) => (
            <div
              key={detail.label}
              className="border border-border/30 bg-background p-6 text-center md:p-8"
            >
              <detail.icon className="mx-auto mb-4 h-7 w-7 text-dusty-rose" />
              <p className="mb-2 font-sans text-xs tracking-[0.2em] text-muted-foreground uppercase">
                {detail.label}
              </p>
              <p className="font-serif text-lg text-foreground md:text-xl">{detail.value}</p>
            </div>
          ))}
        </div>

        <div className="mx-auto mb-12 max-w-4xl">
          <div className="grid overflow-hidden border border-dusty-rose/30 bg-background shadow-elegant md:grid-cols-[1.1fr_1fr]">
            {/* What's included */}
            <div className="border-b border-dusty-rose/20 p-6 sm:p-8 md:border-b-0 md:border-r md:p-10">
              <p className="mb-6 font-sans text-xs tracking-[0.3em] text-dusty-rose uppercase">
                What's Included
              </p>
              <ul className="space-y-4">
                {INCLUDED.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#F3D7DE]">
                      <Check className="h-3.5 w-3.5 text-dusty-rose" />
                    </span>
                    <span className="font-serif text-base leading-relaxed text-foreground/85 md:text-lg">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Price + enrol */}
            <div className="flex flex-col justify-center bg-primary/5 p-6 text-center sm:p-8 md:p-10">
              <p className="mb-2 font-sans text-xs tracking-[0.3em] text-muted-foreground uppercase">
                {MASTERCLASS_DETAILS.feeLabel}
              </p>
              <p className="mb-2 whitespace-nowrap font-display text-4xl text-foreground min-[400px]:text-5xl md:text-6xl">
                {formatInrSymbol(MASTERCLASS_DETAILS.baseFee)}{" "}
                <span className="align-middle text-xl min-[400px]:text-2xl md:text-3xl">+ GST</span>
              </p>
              <p className="whitespace-nowrap font-sans text-xs font-semibold tracking-[0.02em] text-[#8B6D5C] sm:text-sm">
                *{formatInrSymbol(MASTERCLASS_DETAILS.baseFee)} + 18% GST ={" "}
                {formatInrSymbol(MASTERCLASS_DETAILS.fee)}
              </p>

              <div className="mt-8 border-t border-dusty-rose/20 pt-6">
                <button
                  type="button"
                  onClick={onOpenCheckout}
                  disabled={isBusy}
                  data-course={MASTERCLASS_DETAILS.courseName}
                  data-price={String(MASTERCLASS_DETAILS.fee)}
                  data-payment-trigger="section"
                  className="inline-flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-full border border-primary/10 bg-primary px-8 py-4 font-sans text-sm tracking-[0.2em] text-primary-foreground uppercase transition-all duration-300 hover:bg-dusty-rose disabled:cursor-wait disabled:opacity-80"
                >
                  {isBusy && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isEnrolled ? "You're Enrolled" : "Enrol Securely"}
                </button>

                {isEnrolled ? (
                  <p className="mt-4 font-sans text-sm text-muted-foreground">
                    Your seat is confirmed. Class details will reach you by email.
                  </p>
                ) : (
                  <ol className="mt-5 flex flex-wrap items-center justify-center gap-x-2 gap-y-2 font-sans text-[10px] tracking-[0.12em] text-muted-foreground uppercase sm:text-[11px]">
                    {STEPS.map((step, index) => (
                      <li key={step} className="flex items-center gap-2">
                        <span className="flex h-4 w-4 items-center justify-center rounded-full border border-dusty-rose/40 text-[9px] text-dusty-rose">
                          {index + 1}
                        </span>
                        <span className="whitespace-nowrap">{step}</span>
                        {index < STEPS.length - 1 && <span className="h-px w-3 bg-dusty-rose/30" />}
                      </li>
                    ))}
                  </ol>
                )}

                <p className="mt-4 flex items-center justify-center gap-1.5 font-sans text-[11px] text-muted-foreground">
                  <Lock className="h-3 w-3" />
                  {MASTERCLASS_DETAILS.trustLine}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-2xl">
          <div className="border border-dusty-rose/20 bg-dusty-rose/10 p-6 text-center">
            <p className="mb-3 font-sans text-sm text-muted-foreground">
              For queries and booking assistance
            </p>
            <a
              href="https://wa.me/919818793850"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 font-serif text-xl text-foreground transition-colors duration-300 hover:text-dusty-rose"
            >
              <Phone className="h-5 w-5" />
              +91 98187 93850
            </a>
          </div>

          <p className="mt-6 text-center text-sm italic text-muted-foreground">
            Limited seats available. Secure your spot today.
          </p>
        </div>
      </div>
    </section>
  );
};

export default OnlinePaymentSection;
