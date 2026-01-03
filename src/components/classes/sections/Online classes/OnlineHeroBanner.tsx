import heroImage from "@/assets/classes/online-hero.png";
import Logo from "@/assets/logo.png";

const OnlineHeroBanner = () => {
  return (
    <section className="relative min-h-[90vh] md:min-h-screen flex items-center overflow-hidden bg-warm-cream">
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* ================= LEFT TEXT CONTENT ================= */}
          <div className="order-2 lg:order-1 text-center lg:text-left">
            <span
              className="inline-block font-sans text-xs md:text-sm tracking-[0.4em] text-dusty-rose uppercase mb-4 md:mb-6"
            >
              The Meera Sakhrani School
            </span>

            <h1>
              <span className="block font-display text-3xl md:text-5xl lg:text-6xl font-light italic text-foreground/80 mb-2">
                How to Become a
              </span>

              <span className="block font-display text-5xl md:text-7xl lg:text-8xl font-light tracking-tight text-primary uppercase">
                Successful
              </span>

              <span className="block font-serif text-4xl md:text-6xl lg:text-7xl text-foreground mt-2">
                Makeup Artist
              </span>
            </h1>

            <div className="my-8 md:my-12">
              <div className="divider-elegant w-32 mx-auto lg:mx-0" />
            </div>

            <h2
              className="font-serif text-xl md:text-2xl lg:text-3xl text-foreground mb-4 tracking-wide"
            >
              An Online Masterclass
            </h2>

            <p
              className="font-display text-2xl md:text-3xl lg:text-4xl text-dusty-rose italic mb-6 md:mb-8"
            >
              14<sup>th</sup> December 2025
            </p>

            <p
              className="text-elegant text-muted-foreground max-w-md mx-auto lg:mx-0 mb-8 md:mb-10"
            >
              A 4-hour intensive live masterclass by Meera Sakhrani. Transform your
              artistry and elevate your career from anywhere in the world.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <a
                href="#enroll-online"
                className="px-8 py-4 bg-primary text-primary-foreground font-sans text-sm tracking-[0.2em] uppercase hover:bg-dusty-rose transition-all duration-300"
              >
                Enroll Now
              </a>

              <a
                href="tel:+919818793850"
                className="px-8 py-4 border border-foreground/20 text-foreground font-sans text-sm tracking-[0.2em] uppercase hover:bg-foreground/5 transition-all duration-300"
              >
                +91 9818793850
              </a>
            </div>
          </div>

          {/* ================= RIGHT HERO IMAGE ================= */}
          <div
            className="order-1 lg:order-2 relative"
          >
            <div className="relative aspect-[3/4] max-w-lg mx-auto lg:max-w-none">
              {/* Decorative Frame */}
              <div className="absolute -inset-4 border border-dusty-rose/20" />
              <div className="absolute -inset-8 border border-dusty-rose/10 hidden md:block" />

              {/* Image + Overlay */}
              <div className="relative h-full overflow-hidden">
                <img
                  src={heroImage}
                  alt="Meera Sakhrani - Online Masterclass"
                  className="w-full h-full object-cover object-top" 
                />
                {/* <div className="absolute opacity-50" /> */}


                {/* -------- TEXT OVERLAY (LOGO + TITLES) -------- */}
                <div className="absolute inset-0 flex flex-col items-center justify-start pt-10 md:pt-12 pointer-events-none text-center">
                  {/* Logo (medium size) */}
                  <img
                    src={Logo}
                    alt="M Logo"
                    className="w-16 md:w-20 lg:w-24 mb-2 opacity-100 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
                  />

                  {/* THE MEERA SAKHRANI SCHOOL */}
                  <p className="font-serif text-xs md:text-sm tracking-[0.35em] text-white/90 mb-3">
                    THE MEERA SAKHRANI SCHOOL
                  </p>

                  {/* MEERA SAKHRANI */}
                  <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-semibold text-white tracking-wide mb-2 drop-shadow-lg">
                    MEERA SAKHRANI
                  </h1>

                  {/* An Online Masterclass */}
                  <p className="font-serif text-base md:text-lg text-white/90 drop-shadow-md">
                    An Online Masterclass
                  </p>
                </div>
              </div>

              {/* Floating Badge */}
              <div className="absolute -bottom-6 -left-6 md:-bottom-8 md:-left-8 bg-background px-6 py-4 shadow-elegant border border-border/30">
                <p className="font-display text-4xl md:text-5xl text-dusty-rose">4</p>
                <p className="font-sans text-xs tracking-[0.2em] uppercase text-muted-foreground">
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
