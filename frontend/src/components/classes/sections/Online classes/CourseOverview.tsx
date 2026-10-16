import bridalImage from "@/assets/classes/online-bridal.webp";

const CourseOverview = () => {
  const highlights = [{ label: "Effortless" }, { label: "Luxe Evolution" }, { label: "Fashion Forward" }];

  // The two things the masterclass teaches, in the order they're taught.
  const lessons = [
    {
      title: "Meera's Signature Bridal Look for 2027",
      description:
        "Watch Meera create her signature bridal look for 2027 live — a modern, luminous style set to define next season's brides. Every step is explained, from skin prep and a flawless base to the eyes, lips and the final veil, so you can recreate the full look on your own brides.",
    },
    {
      title: "Flawless Skin Work on Dusky & Discoloured Skin",
      description:
        "Dusky skin with uneven tone and discolouration needs its own approach. Meera shows how she preps it, corrects the uneven areas and matches the right shade and undertone, so the base looks even, glowing and natural, never grey, ashy or flat.",
    },
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
            Two Skills, One Masterclass
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
                alt="Destination bridal look"
                className="w-full h-full object-cover object-top image-elegant"
              />
            </div>
            {/* Decorative Element */}
            <div className="absolute -bottom-3 -right-3 md:-bottom-4 md:-right-4 w-2/3 h-2/3 border border-dusty-rose/20 -z-10" />
          </div>

          {/* Text Content */}
          <div className="space-y-8 md:space-y-10">
            {lessons.map((lesson, index) => (
              <div
                key={lesson.title}
                className={`space-y-3 md:space-y-5 ${index > 0 ? "border-t border-dusty-rose/20 pt-8 md:pt-10" : ""}`}
              >
                <span className="block font-sans text-[11px] tracking-[0.3em] text-dusty-rose uppercase sm:text-xs">
                  Part {index + 1}
                </span>

                <h3 className="font-serif text-2xl md:text-3xl lg:text-4xl text-foreground leading-snug">
                  {lesson.title}
                </h3>

                <div className="divider-elegant w-16" />

                <p className="text-elegant text-muted-foreground leading-relaxed text-base md:text-lg">
                  {lesson.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CourseOverview;
