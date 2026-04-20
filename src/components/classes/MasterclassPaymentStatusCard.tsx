import { type ReactNode, useEffect, useState } from "react";

import { formatInr } from "@/lib/masterclass";
import { cn } from "@/lib/utils";

type MasterclassPaymentStatusCardProps = {
  badge: string;
  title: string;
  description: string;
  infoText: string;
  amountLabel: string;
  courseName: string;
  amount: number;
  icon: ReactNode;
  iconToneClassName: string;
  actions: ReactNode;
  transactionId?: string;
  userName?: string;
};

const MasterclassPaymentStatusCard = ({
  badge,
  title,
  description,
  infoText,
  amountLabel,
  courseName,
  amount,
  icon,
  iconToneClassName,
  actions,
  transactionId,
  userName,
}: MasterclassPaymentStatusCardProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setIsVisible(true);
    }, 40);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  return (
    <section className="bg-[#F8F3EB] py-10 sm:py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="mx-auto flex min-h-[68vh] max-w-5xl items-center justify-center">
          <div
            className={cn(
              "w-full max-w-[32rem] rounded-[2rem] border border-border/30 bg-background/85 p-6 shadow-[0_10px_30px_rgba(0,0,0,0.04)] backdrop-blur-sm transition-all duration-700 sm:p-8 md:p-10",
              isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
            )}
          >
            <div className="text-center">
              <div
                className={cn(
                  "mx-auto flex h-16 w-16 items-center justify-center rounded-full border sm:h-[4.5rem] sm:w-[4.5rem]",
                  iconToneClassName,
                )}
              >
                {icon}
              </div>

              <p className="mt-6 font-sans text-xs tracking-[0.32em] text-dusty-rose uppercase">
                {badge}
              </p>

              <h1 className="mt-4 font-serif text-3xl font-light tracking-[0.06em] text-foreground uppercase sm:text-4xl">
                {title}
              </h1>

              <p className="mx-auto mt-4 max-w-md font-sans text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
                {description}
              </p>
            </div>

            <div className="my-7 h-px bg-border/20 sm:my-8" />

            <div className="rounded-[1.75rem] border border-border/25 bg-primary/[0.04] p-5 sm:p-6">
              <div className="space-y-5">
                <div className="space-y-2 text-center">
                  <p className="font-sans text-xs tracking-[0.22em] text-muted-foreground uppercase">
                    Course
                  </p>
                  <p className="font-serif text-2xl leading-tight text-foreground">
                    {courseName}
                  </p>
                </div>

                <div className="h-px bg-border/20" />

                <div className="space-y-2 text-center">
                  <p className="font-sans text-xs tracking-[0.22em] text-muted-foreground uppercase">
                    {amountLabel}
                  </p>
                  <p className="font-display text-5xl leading-none text-foreground sm:text-6xl">
                    {formatInr(amount)}
                  </p>
                </div>

                {(userName || transactionId) && (
                  <>
                    <div className="h-px bg-border/20" />

                    <div className="grid gap-4 sm:grid-cols-2">
                      {userName && (
                        <div className="space-y-1 text-center sm:text-left">
                          <p className="font-sans text-[11px] tracking-[0.2em] text-muted-foreground uppercase">
                            Name
                          </p>
                          <p className="font-serif text-lg text-foreground">
                            {userName}
                          </p>
                        </div>
                      )}

                      {transactionId && (
                        <div className="space-y-1 text-center sm:text-left">
                          <p className="font-sans text-[11px] tracking-[0.2em] text-muted-foreground uppercase">
                            Reference ID
                          </p>
                          <p className="font-sans text-sm tracking-[0.08em] text-foreground/80 break-all">
                            {transactionId}
                          </p>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>

            <p className="mx-auto mt-6 max-w-md text-center font-sans text-sm leading-relaxed text-foreground/70">
              {infoText}
            </p>

            <div className="mt-8 flex flex-col gap-3">{actions}</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MasterclassPaymentStatusCard;
