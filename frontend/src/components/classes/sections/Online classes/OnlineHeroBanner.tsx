import { useRef, useState } from "react";
import { CalendarDays, Loader2, MonitorPlay, Play, Volume2, VolumeX } from "lucide-react";

import WhatsAppIcon from "@/components/icons/WhatsAppIcon";
import { ONLINE_CLASS_WHATSAPP_GREETING, WHATSAPP_NUMBERS, whatsappUrl } from "@/lib/contact";

import heroBackground from "@/assets/classes/online-hero-bg.png";
import { MASTERCLASS_DETAILS, MASTERCLASS_PREVIEW_VIDEO, formatInrSymbol } from "@/lib/masterclass";

import type { OnlineCtaProps } from "./types";

const OnlineHeroBanner = ({ onOpenCheckout, isEnrolled, isBusy }: OnlineCtaProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  // Flips to false if the clip fails to load (e.g. not uploaded yet), so the
  // hero shows a placeholder instead of a broken player.
  const [hasVideo, setHasVideo] = useState(Boolean(MASTERCLASS_PREVIEW_VIDEO.src));
  // The clip loops on its own, muted — browsers only autoplay silent video.
  // Visitors can switch the sound on with the button in the corner.
  const [isMuted, setIsMuted] = useState(true);

  const toggleSound = () => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    video.muted = !video.muted;
    setIsMuted(video.muted);

    if (!video.muted) {
      video.play().catch(() => undefined);
    }
  };

  return (
    <section className="relative">
      {/* Full-bleed backdrop: the page wraps this hero in a centred container,
          so the background breaks out to the full screen width on its own. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-1/2 w-screen -translate-x-1/2 bg-warm-cream">
        {/* Floral texture at 50% over the cream, so it stays soft behind the text. */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-50"
          style={{ backgroundImage: `url(${heroBackground})` }}
        />
      </div>

      <div className="container relative mx-auto px-5 sm:px-4 pt-6 pb-10 md:pt-10 md:pb-20 lg:pb-24">
        <div className="mb-8 text-center md:mb-14">
          <span className="mb-3 inline-block font-sans text-[11px] tracking-[0.3em] text-dusty-rose uppercase sm:text-xs sm:tracking-[0.4em] md:mb-4 md:text-sm">
            The Meera Sakhrani School
          </span>

          <h1 className="font-display text-[34px] font-light leading-tight tracking-tight text-primary sm:text-4xl md:text-6xl lg:text-7xl">
            Online Masterclass
          </h1>

          <div className="mx-auto mt-4 w-24 md:mt-8 md:w-32">
            <div className="divider-elegant" />
          </div>

          <p className="mt-4 font-serif text-[17px] italic text-foreground/80 md:mt-8 md:text-2xl">
            How to Become a Successful Makeup Artist
          </p>
        </div>

        <div className="grid items-center gap-8 md:grid-cols-[3fr_2fr] md:gap-8 lg:gap-16">
          {/* Video preview */}
          <div className="relative mx-auto w-full max-w-3xl">
            <div className="absolute -inset-2 border border-primary/20 sm:-inset-3 md:-inset-4" />

            <div className="relative aspect-video overflow-hidden border border-primary/25 bg-foreground/5 shadow-[0_20px_50px_-20px_hsl(332_14%_40%/0.35)]">
              {hasVideo ? (
                <>
                  <video
                    ref={videoRef}
                    src={MASTERCLASS_PREVIEW_VIDEO.src}
                    poster={MASTERCLASS_PREVIEW_VIDEO.poster || undefined}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="auto"
                    onError={() => setHasVideo(false)}
                    className="h-full w-full object-cover"
                  >
                    Your browser does not support the video tag.
                  </video>

                  <button
                    type="button"
                    onClick={toggleSound}
                    aria-label={isMuted ? "Turn sound on" : "Turn sound off"}
                    aria-pressed={!isMuted}
                    className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full border border-background/60 bg-background/85 text-primary shadow-elegant transition-transform duration-300 hover:scale-105 md:bottom-4 md:right-4 md:h-11 md:w-11"
                  >
                    {isMuted ? <VolumeX className="h-4 w-4 md:h-5 md:w-5" /> : <Volume2 className="h-4 w-4 md:h-5 md:w-5" />}
                  </button>
                </>
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-soft-pink/70 via-background/80 to-soft-pink/50 text-center">
                  <span className="flex h-16 w-16 items-center justify-center rounded-full border border-primary/25 bg-background text-primary shadow-[0_8px_24px_-8px_hsl(332_14%_40%/0.4)] max-md:h-12 max-md:w-12 md:h-20 md:w-20">
                    <Play className="ml-1 h-6 w-6 md:h-7 md:w-7" />
                  </span>
                  <p className="font-sans text-xs tracking-[0.2em] text-foreground uppercase">
                    Class preview coming soon
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Actions — order is fixed: View Details → Registration & Fees → Register Now */}
          <div className="mx-auto w-full max-w-sm md:max-w-none lg:max-w-sm">
            <div className="rounded-2xl border border-white/80 bg-warm-cream/70 px-4 py-5 text-center sm:p-5 shadow-[0_18px_48px_-28px_hsl(332_14%_40%/0.3)] backdrop-blur-[2px] md:p-6 lg:p-7">
              {/* Informational badges */}
              <div className="mb-5 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 md:mb-7">
                <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-dusty-rose/40 bg-soft-pink/40 px-2.5 py-1.5 font-sans text-[10px] leading-none tracking-[0.08em] text-primary uppercase min-[400px]:px-3 min-[400px]:tracking-[0.1em] md:py-2 shadow-[-3px_5px_12px_-3px_rgba(0,0,0,0.14),-1px_2px_3px_rgba(0,0,0,0.07),inset_-1px_1px_0_rgba(255,255,255,0.9)]">
                  <MonitorPlay className="h-3 w-3 shrink-0 md:h-3.5 md:w-3.5" />
                  {MASTERCLASS_DETAILS.modeLabel}
                </span>
                <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-dusty-rose/40 bg-soft-pink/40 px-2.5 py-1.5 font-sans text-[10px] leading-none tracking-[0.08em] text-primary uppercase min-[400px]:px-3 min-[400px]:tracking-[0.1em] md:py-2 shadow-[-3px_5px_12px_-3px_rgba(0,0,0,0.14),-1px_2px_3px_rgba(0,0,0,0.07),inset_-1px_1px_0_rgba(255,255,255,0.9)]">
                  <CalendarDays className="h-3 w-3 shrink-0 md:h-3.5 md:w-3.5" />
                  {MASTERCLASS_DETAILS.dateLabel}
                </span>
              </div>

              <div className="flex flex-col gap-3">
                {/* Secondary actions */}
                <a
                  href="#online-class-details"
                  className="block rounded-full px-5 py-3 font-sans text-xs leading-5 tracking-[0.18em] uppercase transition-all duration-300 hover:-translate-y-0.5 hover:bg-background motion-reduce:hover:translate-y-0 md:px-3 md:py-3.5 md:tracking-[0.12em] lg:px-5 lg:text-[13px] lg:tracking-[0.18em] shadow-[-3px_5px_12px_-3px_rgba(0,0,0,0.14),-1px_2px_3px_rgba(0,0,0,0.07),inset_-1px_1px_0_rgba(255,255,255,0.9)] hover:shadow-[-5px_8px_18px_-4px_rgba(0,0,0,0.18),-1px_3px_4px_rgba(0,0,0,0.09),inset_-1px_1px_0_rgba(255,255,255,0.9)] border border-primary/35 bg-background/80 text-primary"
                >
                  View Details
                </a>

                <a
                  href="#enroll-online"
                  className="block rounded-full px-5 py-3 font-sans text-xs leading-5 tracking-[0.18em] uppercase transition-all duration-300 hover:-translate-y-0.5 hover:bg-background motion-reduce:hover:translate-y-0 md:px-3 md:py-3.5 md:tracking-[0.12em] lg:px-5 lg:text-[13px] lg:tracking-[0.18em] shadow-[-3px_5px_12px_-3px_rgba(0,0,0,0.14),-1px_2px_3px_rgba(0,0,0,0.07),inset_-1px_1px_0_rgba(255,255,255,0.9)] hover:shadow-[-5px_8px_18px_-4px_rgba(0,0,0,0.18),-1px_3px_4px_rgba(0,0,0,0.09),inset_-1px_1px_0_rgba(255,255,255,0.9)] border border-foreground/20 bg-background/80 text-foreground"
                >
                  Registration &amp; Fees
                </a>

                {/* Price, tied to the registration options above it */}
                <div className="flex items-center justify-center gap-3 py-1">
                  <span className="h-px w-6 bg-gradient-to-r from-transparent to-dusty-rose/60" />
                  <p className="font-serif text-xl text-foreground md:text-2xl">
                    {formatInrSymbol(MASTERCLASS_DETAILS.baseFee)}
                    <span className="ml-1.5 font-sans text-[11px] tracking-[0.15em] text-muted-foreground uppercase">
                      + GST
                    </span>
                  </p>
                  <span className="h-px w-6 bg-gradient-to-l from-transparent to-dusty-rose/60" />
                </div>

                {/* Primary action */}
                <button
                  type="button"
                  onClick={onOpenCheckout}
                  disabled={isBusy}
                  className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary to-[hsl(332_16%_50%)] px-6 py-3.5 font-sans text-[13px] leading-5 tracking-[0.2em] text-primary-foreground uppercase shadow-[-4px_6px_14px_-3px_rgba(0,0,0,0.26),-1px_2px_4px_rgba(0,0,0,0.12),inset_-1px_1px_0_rgba(255,255,255,0.3)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[-6px_9px_20px_-4px_rgba(0,0,0,0.3),-1px_3px_5px_rgba(0,0,0,0.14),inset_-1px_1px_0_rgba(255,255,255,0.3)] hover:brightness-105 active:translate-y-0 active:brightness-95 disabled:cursor-wait disabled:opacity-80 motion-reduce:hover:translate-y-0 md:py-4 md:text-sm"
                >
                  {isBusy && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isEnrolled ? "You're Enrolled" : "Register Now"}
                </button>
              </div>

              <a
                href={whatsappUrl(WHATSAPP_NUMBERS.school, ONLINE_CLASS_WHATSAPP_GREETING)}
                target="_blank"
                rel="noopener noreferrer"
                className="group mt-5 inline-flex items-center justify-center gap-1.5 whitespace-nowrap font-sans text-[11px] text-foreground/80 min-[360px]:gap-2 min-[360px]:text-xs transition-colors duration-300 hover:text-primary"
              >
                <WhatsAppIcon className="h-4 w-4 shrink-0 text-[#25D366]" />
                <span>
                  Need assistance?{" "}
                  <span className="font-medium text-primary underline decoration-dusty-rose/50 underline-offset-4 group-hover:decoration-primary">
                    Chat on WhatsApp
                  </span>
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OnlineHeroBanner;
