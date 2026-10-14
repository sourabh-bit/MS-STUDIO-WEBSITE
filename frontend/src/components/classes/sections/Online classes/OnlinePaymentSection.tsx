import { CalendarDays, Clock, Loader2, Lock, Monitor } from "lucide-react";

import WhatsAppIcon from "@/components/icons/WhatsAppIcon";
import { ONLINE_CLASS_WHATSAPP_GREETING, WHATSAPP_NUMBERS, whatsappUrl } from "@/lib/contact";

import { MASTERCLASS_DETAILS, formatInrSymbol } from "@/lib/masterclass";

import type { OnlineCtaProps } from "./types";

const STEPS = ["Verify mobile", "Your details", "Secure payment"];

const OnlinePaymentSection = ({ onOpenCheckout, isEnrolled, isBusy }: OnlineCtaProps) => {
  const classDetails = [
    { icon: CalendarDays, label: "Date", value: MASTERCLASS_DETAILS.dateLabel },
    { icon: Clock, label: "Time", value: MASTERCLASS_DETAILS.timeLabel },
    { icon: Monitor, label: "Mode", value: MASTERCLASS_DETAILS.modeLabel },
  ];

  return (
    <section id="enroll-online" className="scroll-mt-20 bg-[#F8F3EB] py-10 md:scroll-mt-24 md:py-24 lg:py-32">
      <div className="container mx-auto px-5 sm:px-4">
        <div className="mb-8 text-center md:mb-16">
          <span className="mb-3 block font-sans text-[11px] tracking-[0.3em] sm:text-xs sm:tracking-[0.4em] md:mb-4 text-dusty-rose uppercase">
            Investment
          </span>
          <h2 className="heading-section-compact mb-3 text-foreground md:mb-4">Class Details &amp; Enrolment</h2>
          <p className="text-elegant mx-auto max-w-2xl text-[15px] text-muted-foreground md:text-lg">
            Join live from anywhere in the world
          </p>
        </div>

        <div className="mx-auto mb-6 grid max-w-md gap-2 sm:mb-12 sm:max-w-4xl sm:grid-cols-3 sm:gap-4 md:mb-16 md:gap-6">
          {classDetails.map((detail) => (
            <div
              key={detail.label}
              className="flex items-center gap-4 border border-border/30 bg-background px-4 py-3 text-left sm:block sm:p-6 sm:text-center md:p-8"
            >
              <detail.icon className="h-5 w-5 shrink-0 text-dusty-rose sm:mx-auto sm:mb-4 sm:h-7 sm:w-7" />
              <p className="mb-0.5 font-sans text-[10px] tracking-[0.2em] text-muted-foreground uppercase sm:mb-2 sm:text-xs">
                {detail.label}
              </p>
              <p className="font-serif text-base text-foreground sm:text-lg md:text-xl">{detail.value}</p>
            </div>
          ))}
        </div>

        <div className="mx-auto mb-6 max-w-md md:mb-12">
          <div className="overflow-hidden border border-dusty-rose/30 bg-background shadow-elegant">
            {/* Price + enrol */}
            <div className="flex flex-col justify-center bg-primary/5 px-5 py-6 text-center sm:p-8 md:p-10">
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

              <div className="mt-6 border-t border-dusty-rose/20 pt-5 md:mt-8 md:pt-6">
                <button
                  type="button"
                  onClick={onOpenCheckout}
                  disabled={isBusy}
                  data-course={MASTERCLASS_DETAILS.courseName}
                  data-price={String(MASTERCLASS_DETAILS.fee)}
                  data-payment-trigger="section"
                  className="inline-flex w-full items-center justify-center gap-2 whitespace-nowrap min-h-[48px] rounded-full border border-primary/10 bg-primary px-6 py-3.5 font-sans text-[13px] tracking-[0.2em] text-primary-foreground uppercase shadow-[-4px_6px_14px_-3px_rgba(0,0,0,0.22),-1px_2px_4px_rgba(0,0,0,0.1)] transition-all duration-300 hover:bg-dusty-rose active:brightness-95 md:py-4 md:text-sm disabled:cursor-wait disabled:opacity-80"
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

        <div className="mx-auto max-w-md md:max-w-2xl">
          <div className="border border-dusty-rose/20 bg-dusty-rose/10 px-5 py-5 text-center md:p-6">
            <p className="mb-3 font-sans text-sm text-muted-foreground">
              For queries and booking assistance
            </p>
            <a
              href={whatsappUrl(WHATSAPP_NUMBERS.school, ONLINE_CLASS_WHATSAPP_GREETING)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[44px] items-center gap-2.5 rounded-full border border-[#25D366]/40 bg-background px-5 py-2.5 font-sans text-xs tracking-[0.15em] text-foreground uppercase shadow-[-3px_5px_12px_-3px_rgba(0,0,0,0.12)] transition-all duration-300 hover:border-[#25D366]/70 hover:text-primary"
            >
              <WhatsAppIcon className="h-4 w-4 shrink-0 text-[#25D366]" />
              Chat on WhatsApp
            </a>
          </div>

          <p className="mt-5 text-center text-sm italic text-muted-foreground md:mt-6">
            Limited seats available. Secure your spot today.
          </p>
        </div>
      </div>
    </section>
  );
};

export default OnlinePaymentSection;
