import bridalImage from "@/assets/classes/online-bridal.webp";

const CourseOverview = () => {
  const highlights = [
    { label: "Effortless", description: "Learn techniques that look natural and refined" },
    { label: "Luxe Evolution", description: "Elevate your artistry to luxury standards" },
    { label: "Fashion Forward", description: "Stay ahead with 2025-2026 trends" },
  ];

  return (
    <section id="online-class-details" className="scroll-mt-20 py-10 md:scroll-mt-24 md:py-24 lg:py-32 bg-background">
      <div className="container mx-auto px-5 sm:px-4">
        {/* Section Header */}
        <div className="text-center mb-8 md:mb-16">
          <span className="font-sans text-[11px] tracking-[0.3em] sm:text-xs sm:tracking-[0.4em] text-dusty-rose uppercase mb-3 md:mb-4 block">
            What You Will Learn
          </span>
          <h2 className="heading-section-compact text-foreground">
            The Signature Look
          </h2>
        </div>

        {/* Highlight Tags */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-4 md:gap-8 mb-8 md:mb-16">
          {highlights.map((item, index) => (
            <div 
              key={index}
              className="px-4 py-2 sm:px-6 sm:py-3 border border-dusty-rose/30 bg-soft-pink/20"
            >
              <p className="font-serif text-base sm:text-lg md:text-xl text-foreground tracking-wide">
                {item.label}
              </p>
            </div>
          ))}
        </div>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Image */}
          <div className="relative">
            <div className="aspect-[4/5] overflow-hidden">
              <img
                src={bridalImage}
                alt="Lake Como destination bridal look"
                className="w-full h-full object-cover object-top image-elegant"
              />
            </div>
            {/* Decorative Element */}
            <div className="absolute -bottom-3 -right-3 md:-bottom-4 md:-right-4 w-2/3 h-2/3 border border-dusty-rose/20 -z-10" />
          </div>

          {/* Text Content */}
          <div className="space-y-5 md:space-y-8">
            <h3 className="font-serif text-2xl md:text-3xl lg:text-4xl text-foreground leading-snug md:leading-relaxed">
              Lake Como Destination Bridal Look
            </h3>
            
            <div className="divider-elegant w-16" />
            
            <p className="text-elegant text-muted-foreground leading-relaxed text-base md:text-lg">
              You will learn Meera's signature <span className="font-display italic text-dusty-rose">Lake Como destination bridal look</span> — a modern, luminous makeup style that defines the 2025-2026 bridal trend, perfected from flawless skin to the final veil.
            </p>

            <div className="space-y-4 pt-1 md:pt-4">
              {highlights.map((item, index) => (
                <div key={index} className="flex items-start gap-4">
                  {/* Pink Dot + Ring */}
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#F3D7DE] flex items-center justify-center">
                    <span className="w-2 h-2 rounded-full bg-[#D9A7B0]"></span>
                  </span>
                  <div>
                    <p className="font-serif text-foreground">{item.label}</p>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CourseOverview;
