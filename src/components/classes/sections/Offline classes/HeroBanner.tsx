import heroImage from "@/assets/classes/hero-masterclass.jpg";

const HeroBanner = () => {
  return (
    <section
      className="
        relative w-full 
        min-h-[100vh] 
        flex items-center 
        section-cream bg-pattern-soft
        pt-13  
        overflow-visible
      "
      
    >

      {/* Main container */}
      <div className="relative z-10 container mx-auto px-6 lg:px-8 py-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">

          {/* ---------------- LEFT: TEXT BLOCK ---------------- */}
          <div className="order-2 lg:order-1 space-y-6">

            <span
              className="
                inline-block 
                font-sans 
                text-xs md:text-sm 
                tracking-[0.4em] 
                text-dusty-rose 
                uppercase 
                animate-fade-up 
                font-light
                text-primary
              "
              style={{ animationDelay: "150ms" }}
            >
              Meera Sakhrani School
            </span>

            <h1 className="space-y-2 animate-fade-up" style={{ animationDelay: "250ms" }}>
              <span className="block font-display text-3xl md:text-5xl lg:text-6xl italic text-foreground/80">
                The Future of
              </span>

              <span className="block font-display text-[13vw] md:text-8xl lg:text-9xl text-primary uppercase leading-none tracking-tight">
                MAKEUP
              </span>
            </h1>

            {/* Divider line */}
            <div
              className="
                w-24 h-[1px] 
                bg-dusty-rose/40 
                mx-auto lg:mx-0 
                animate-fade-up
              "
              style={{ animationDelay: "350ms" }}
            />

            <h2
              className="font-serif text-2xl md:text-3xl text-foreground tracking-wide animate-fade-up"
              style={{ animationDelay: "450ms" }}
            >
              Offline Masterclass 
            </h2>

            {/* <p
              className="font-display text-2xl md:text-3xl lg:text-4xl text-dusty-rose italic animate-fade-up"
              style={{ animationDelay: "550ms" }}
            >
              12<sup>th</sup> – 18<sup>th</sup> May
            </p> */}

            <p
              className="
                text-muted-foreground 
                leading-relaxed 
                max-w-md 
                mx-auto lg:mx-0 
                animate-fade-up
              "
              style={{ animationDelay: "650ms" }}
            >
              An annual 7-day intensive masterclass by Meera Sakhrani.
              Transform your artistry and elevate your career in the world of bridal makeup.
            </p>

            {/* CTA BUTTONS */}
            <div
              className="
                flex flex-col sm:flex-row 
                gap-4 
                justify-center lg:justify-start 
                pt-4 
                animate-fade-up
              "
              style={{ animationDelay: "750ms" }}
            >
              <a
                href="#enroll"
                className="
                  px-8 py-4 
                  bg-primary text-primary-foreground
                  font-sans text-sm tracking-[0.2em] uppercase
                  hover:bg-dusty-rose 
                  transition-all duration-300
                "
              >
                Enroll Now
              </a>

              <a
                href="tel:+919818793850"
                className="
                  px-8 py-4 
                  border border-foreground/20 
                  text-foreground font-sans 
                  text-sm tracking-[0.2em] uppercase
                  hover:bg-foreground/5 
                  transition-all duration-300
                "
              >
                Contact Us
              </a>
            </div>
          </div>

          {/* ---------------- RIGHT: IMAGE BLOCK ---------------- */}
<div className="order-1 lg:order-2 relative animate-fade-up" style={{ animationDelay: "300ms" }}>
  <div
    className="
      relative 
      aspect-[3/4] 
      max-w-sm md:max-w-md lg:max-w-lg 
      mx-auto
    "
  >

              {/* Decorative Borders */}
              <div className="absolute -inset-4 border border-dusty-rose/30 animate-fade-up" style={{ animationDelay: "400ms" }} />
              <div className="absolute -inset-8 border border-dusty-rose/10 hidden md:block animate-fade-up" style={{ animationDelay: "550ms" }} />

              {/* Actual Image */}
              <div className="relative h-full overflow-visible rounded-sm">
                <img
                  src={heroImage}
                  alt="Meera Sakhrani - Masterclass"
                  className="
                    w-full h-full 
                    object-cover object-top 
                    transition-transform duration-[1500ms]
                    scale-[1.03] hover:scale-[1.08]
                    ease-[cubic-bezier(0.22,1,0.36,1)]
                    animate-soft-fade
                  "
                  style={{ animationDelay: "450ms" }}
                />

                {/* soft gradient fade */}
                <div className="absolute inset-0 bg-gradient-to-t from-warm-cream/50 via-transparent" />
              </div>

              {/* Floating Badge */}
              <div
                className="
                  absolute 
                  -bottom-6 -left-6 
                  md:-bottom-8 md:-left-8 
                  bg-background 
                  px-6 py-4 
                  shadow-elegant 
                  border border-border/40 
                  text-center 
                  animate-fade-up
                "
                style={{ animationDelay: "850ms" }}
              >
                <p className="font-display text-5xl text-dusty-rose leading-none">7</p>
                <p className="font-sans text-xs tracking-[0.2em] uppercase text-muted-foreground">
                  Days
                </p>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default HeroBanner;
