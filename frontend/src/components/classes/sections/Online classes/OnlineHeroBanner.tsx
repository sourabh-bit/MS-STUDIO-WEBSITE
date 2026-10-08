import { CalendarDays, Loader2, MonitorPlay } from "lucide-react";

import heroImage from "@/assets/classes/online-hero.png";
import Logo from "@/assets/logo.png";
import { MASTERCLASS_DETAILS, formatInrSymbol } from "@/lib/masterclass";

import type { OnlineCtaProps } from "./types";

const OnlineHeroBanner = ({ onOpenCheckout, isEnrolled, isBusy }: OnlineCtaProps) => {
  return (
    <section className="relative flex min-h-[90vh] items-center overflow-hidden bg-warm-cream md:min-h-screen">
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid items-center gap-8 md:gap-12 lg:grid-cols-2">
          <div className="order-2 text-center lg:order-1 lg:text-left">
            <span className="mb-4 inline-block font-sans text-xs tracking-[0.4em] text-dusty-rose uppercase md:mb-6 md:text-sm">
              The Meera Sakhrani School
            </span>

            <h1>
              <span className="mb-2 block font-display text-3xl font-light italic text-foreground/80 md:text-5xl lg:text-6xl">
                How to Become a
              </span>

              <span className="block font-display text-5xl font-light tracking-tight text-primary uppercase md:text-7xl lg:text-8xl">
                Successful
              </span>

              <span className="mt-2 block font-serif text-4xl text-foreground md:text-6xl lg:text-7xl">
                Makeup Artist
              </span>
            </h1>

            <div className="my-8 md:my-12">
              <div className="divider-elegant mx-auto w-32 lg:mx-0" />
            </div>

            <h2 className="mb-4 font-serif text-xl tracking-wide text-foreground md:text-2xl lg:text-3xl">
              An Online Masterclass
            </h2>

            <div className="mb-6 flex flex-wrap items-center justify-center gap-2 md:mb-8 lg:justify-start">
              <span className="inline-flex items-center gap-2 rounded-full border border-dusty-rose/40 bg-soft-pink/30 px-4 py-2 font-sans text-[11px] tracking-[0.15em] text-dusty-rose uppercase">
                <MonitorPlay className="h-3.5 w-3.5" />
                {MASTERCLASS_DETAILS.modeLabel}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-dusty-rose/40 bg-soft-pink/30 px-4 py-2 font-sans text-[11px] tracking-[0.15em] text-dusty-rose uppercase">
                <CalendarDays className="h-3.5 w-3.5" />
                {MASTERCLASS_DETAILS.dateLabel}
              </span>
            </div>

            <p className="text-elegant mx-auto mb-8 max-w-md text-muted-foreground lg:mx-0 md:mb-10">
              A 4-hour intensive live masterclass by Meera Sakhrani. Transform
              your artistry and elevate your career from anywhere in the world.
            </p>

            <div className="flex flex-col justify-center gap-4 sm:flex-row lg:justify-start">
              <button
                type="button"
                onClick={onOpenCheckout}
                disabled={isBusy}
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full border border-primary/10 bg-primary px-8 py-4 text-center font-sans text-sm tracking-[0.2em] text-primary-foreground uppercase shadow-elegant transition-all duration-300 hover:bg-dusty-rose disabled:cursor-wait disabled:opacity-80"
              >
                {isBusy && <Loader2 className="h-4 w-4 animate-spin" />}
                {isEnrolled ? (
                  "You're Enrolled"
                ) : (
                  <>
                    Enrol Now
                    {/* Price hidden on the narrowest phones so the button
                        never forces the hero wider than the screen — the
                        sticky bar shows it there instead. */}
                    <span className="hidden min-[400px]:inline">
                      {" "}· {formatInrSymbol(MASTERCLASS_DETAILS.baseFee)} + GST
                    </span>
                  </>
                )}
              </button>

              <a
                href="#enroll-online"
                className="rounded-full border border-foreground/20 px-8 py-4 text-center font-sans text-sm tracking-[0.2em] text-foreground uppercase transition-all duration-300 hover:bg-foreground/5"
              >
                View Details
              </a>
            </div>

            <div className="mt-5 space-y-2 text-center lg:text-left">
              
              
              <a
                href="https://wa.me/919818793850"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block font-sans text-xs tracking-[0.12em] text-foreground/70 uppercase transition-colors duration-300 hover:text-dusty-rose"
              >
                Need assistance? +91 98187 93850
              </a>
            </div>
          </div>

          <div className="order-1 relative lg:order-2">
            <div className="relative mx-auto aspect-[3/4] max-w-lg lg:max-w-none">
              <div className="absolute -inset-4 border border-dusty-rose/20" />
              <div className="absolute -inset-8 hidden border border-dusty-rose/10 md:block" />

              <div className="relative h-full overflow-hidden">
                <img
                  src={heroImage}
                  alt="Meera Sakhrani - Online Masterclass"
                  className="h-full w-full object-cover object-top"
                />

                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-start pt-10 text-center md:pt-12">
                  <img
                    src={Logo}
                    alt="M Logo"
                    className="mb-2 w-16 opacity-100 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] md:w-20 lg:w-24"
                  />

                  <p className="mb-3 font-serif text-xs tracking-[0.35em] text-white/90 md:text-sm">
                    THE MEERA SAKHRANI SCHOOL
                  </p>

                  <h1 className="mb-2 font-display text-3xl font-semibold tracking-wide text-white drop-shadow-lg md:text-4xl lg:text-5xl">
                    MEERA SAKHRANI
                  </h1>

                  <p className="font-serif text-base text-white/90 drop-shadow-md md:text-lg">
                    An Online Masterclass
                  </p>
                </div>
              </div>

              <div className="absolute -bottom-6 -left-6 border border-border/30 bg-background px-6 py-4 shadow-elegant md:-bottom-8 md:-left-8">
                <p className="font-display text-4xl text-dusty-rose md:text-5xl">4</p>
                <p className="font-sans text-xs tracking-[0.2em] text-muted-foreground uppercase">
                  Hours
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OnlineHeroBanner;
