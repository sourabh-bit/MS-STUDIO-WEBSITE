import { useEffect, useRef, useState, type PointerEvent } from "react";

import day1 from "@/assets/classes/day1.jpg";
import day2 from "@/assets/classes/day2.jpg";
import day3 from "@/assets/classes/day3.jpg";
import day6 from "@/assets/classes/day6.jpg";
import day7 from "@/assets/classes/day7.jpg";
import portfolio3 from "@/assets/classes/portfolio3.jpg";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";

// Looks from Meera's masterclasses, shown as a slider as in the notebook sketch.
const PHOTOS = [
  { src: day1, alt: "Soft glam with statement jewellery by Meera Sakhrani" },
  { src: day3, alt: "Bold winged-liner glam by Meera Sakhrani" },
  { src: portfolio3, alt: "Ivory bridal look by Meera Sakhrani" },
  { src: day2, alt: "Classic evening glam by Meera Sakhrani" },
  { src: day6, alt: "Destination bridal look by Meera Sakhrani" },
  { src: day7, alt: "Cocktail glam looks by Meera Sakhrani" },
];

// Shown twice so there are always enough slides for the loop when five
// photos are on screen at once.
const SLIDES = [...PHOTOS, ...PHOTOS];

const AUTO_SCROLL_MS = 2500;
// After a finger lifts there is no "pointer left" moment, so touch resumes
// on a short delay instead.
const TOUCH_RESUME_MS = 2500;

const ARROW_CLASS =
  "z-10 h-10 w-10 border-primary bg-primary text-primary-foreground shadow-soft hover:bg-dusty-rose hover:text-primary-foreground";

const OnlineGallery = () => {
  const [api, setApi] = useState<CarouselApi>();
  // Held in refs so pausing never restarts the timer mid-cycle.
  const isPausedRef = useRef(false);
  const resumeTimerRef = useRef<number>();

  useEffect(() => {
    if (!api) {
      return;
    }

    const timer = window.setInterval(() => {
      if (!isPausedRef.current) {
        api.scrollNext();
      }
    }, AUTO_SCROLL_MS);

    return () => window.clearInterval(timer);
  }, [api]);

  useEffect(() => () => window.clearTimeout(resumeTimerRef.current), []);

  // Click / touch anywhere on the gallery (photos or arrows) pauses it.
  const pause = () => {
    window.clearTimeout(resumeTimerRef.current);
    isPausedRef.current = true;
  };

  const resume = () => {
    window.clearTimeout(resumeTimerRef.current);
    isPausedRef.current = false;
  };

  // Mouse: resume as soon as the pointer leaves the gallery.
  const handlePointerLeave = (event: PointerEvent) => {
    if (event.pointerType === "mouse") {
      resume();
    }
  };

  // Touch / pen: resume a moment after the finger lifts.
  const handlePointerRelease = (event: PointerEvent) => {
    if (event.pointerType === "mouse") {
      return;
    }

    window.clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = window.setTimeout(resume, TOUCH_RESUME_MS);
  };

  return (
    <section className="bg-warm-cream py-10 md:py-24 lg:py-28">
      <div className="container mx-auto px-5 sm:px-4">
        <div className="mb-8 text-center md:mb-14">
          <span className="mb-3 block font-sans text-[11px] tracking-[0.3em] sm:text-xs sm:tracking-[0.4em] md:mb-4 text-dusty-rose uppercase">
            From the Masterclass
          </span>
          <h2 className="heading-section-compact mb-3 text-foreground md:mb-4">Gallery</h2>
          <p className="text-elegant mx-auto max-w-2xl text-[15px] text-muted-foreground md:text-lg">
            A glimpse of the looks created in Meera's classes
          </p>
        </div>

        <div
          onPointerDown={pause}
          onPointerLeave={handlePointerLeave}
          onPointerUp={handlePointerRelease}
          onPointerCancel={handlePointerRelease}
        >
          <Carousel
            setApi={setApi}
            opts={{ align: "start", loop: true }}
            className="mx-auto max-w-6xl md:px-14"
          >
            <CarouselContent className="-ml-2 sm:-ml-3 md:-ml-5">
              {SLIDES.map((photo, index) => (
                <CarouselItem
                  key={`${photo.alt}-${index}`}
                  className="basis-1/3 pl-2 sm:basis-1/4 sm:pl-3 md:pl-5 lg:basis-1/5"
                >
                  <div className="group relative aspect-[3/4] overflow-hidden border border-dusty-rose/20">
                    <img
                      src={photo.src}
                      alt={photo.alt}
                      loading="lazy"
                      draggable={false}
                      className="h-full w-full select-none object-cover object-top transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>

            <CarouselPrevious className={`hidden left-0 md:flex ${ARROW_CLASS}`} />
            <CarouselNext className={`hidden right-0 md:flex ${ARROW_CLASS}`} />
          </Carousel>
        </div>
      </div>
    </section>
  );
};

export default OnlineGallery;
