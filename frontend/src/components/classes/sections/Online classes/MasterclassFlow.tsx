import { Clock } from "lucide-react";

const MasterclassFlow = () => {
  const schedule = [
    {
      time: "12:00 PM – 12:30 PM",
      title: "Introduction",
      description: "Meet Meera and get an overview of the masterclass and how the session will flow."
    },
    {
      time: "12:30 PM – 1:15 PM",
      title: "Skin Prep & Business Understanding",
      description: "Meera's skin prep routine for a flawless base, plus the business basics every artist needs."
    },
    {
      time: "1:15 PM – 4:15 PM",
      title: "Full Bridal Makeup",
      description: "Watch Meera create a complete bridal look live, with each step explained."
    },
    {
      time: "4:15 PM – 5:00 PM",
      title: "AI Editing Tools & Content Creation",
      description: "The AI tools and editing tips Meera uses to showcase your work and attract clients."
    },
    {
      time: "5:00 PM – 6:00 PM",
      title: "QnA Session",
      description: "Ask Meera your questions on technique, products, branding, and growing your career."
    },
  ];

  return (
    <section className="py-10 md:py-24 lg:py-32" style={{ backgroundColor: "#F7EFE7" }}>
      <div className="container mx-auto px-5 sm:px-4">

        {/* Section Header */}
        <div className="text-center mb-8 md:mb-16">
          <span
            className="font-sans text-[11px] tracking-[0.3em] sm:text-xs sm:tracking-[0.4em] uppercase mb-3 md:mb-4 block"
            style={{ color: "#D9A7B0" }}
          >
            Your Journey
          </span>

          <h2 className="heading-section-compact text-foreground mb-3 md:mb-4">
            Masterclass Flow
          </h2>

          <p className="text-elegant text-muted-foreground max-w-2xl mx-auto text-[15px] md:text-lg">
            A carefully curated experience designed to transform your artistry and business
          </p>
        </div>

        {/* Timeline */}
        <div className="max-w-3xl mx-auto">
          <div className="relative">

            {/* Vertical Line */}
            <div
              className="absolute left-5 md:left-1/2 top-0 bottom-0 w-px -translate-x-1/2"
              style={{ backgroundColor: "#C9A4AB" }}
            />

            {schedule.map((item, index) => (
              <div
                key={index}
                className={`relative flex flex-col md:flex-row gap-2 md:gap-12 mb-6 md:mb-12 last:mb-0 ${
                  index % 2 === 1 ? "md:flex-row-reverse" : ""
                }`}
              >

                {/* Time Badge */}
                <div className="flex items-center gap-4 md:w-1/2 md:justify-end">
                  <div className={`flex items-center gap-3 ${index % 2 === 1 ? "md:flex-row-reverse" : ""}`}>

                    <div
                      className="w-10 h-10 md:w-16 md:h-16 shrink-0 rounded-full flex items-center justify-center z-10 border-[3px] md:border-4 border-white"
                      style={{ backgroundColor: "#F3D7DE" }}
                    >
                      <Clock className="w-4 h-4 md:w-6 md:h-6" style={{ color: "#D9A7B0" }} />
                    </div>

                    <div className={`text-left ${index % 2 === 1 ? "md:text-right" : ""}`}>
                      <p
                        className="font-display text-[15px] sm:text-lg md:text-xl font-medium"
                        style={{ color: "#D9A7B0" }}
                      >
                        {item.time}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Content Card */}
                <div className="md:w-1/2 ml-[52px] md:ml-0">
                  <div
                    className="p-4 sm:p-6 md:p-8 border shadow-soft bg-white"
                    style={{ borderColor: "#E5D0D6" }}
                  >
                    <h3 className="font-serif text-lg leading-snug md:text-2xl text-foreground mb-1.5 md:mb-3">
                      {item.title}
                    </h3>

                    <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quote */}
        <div className="max-w-3xl mx-auto mt-10 md:mt-20">
          <div
            className="px-5 py-8 sm:px-8 md:p-12 border text-center"
            style={{
              backgroundColor: "#FBEFF1",   // Correct softened pink
              borderColor: "#D7B98E"        // Correct softer rose border
            }}
          >
            <blockquote
              className="font-display italic mx-auto max-w-4xl text-[17px] leading-[1.7] sm:text-lg md:text-[18px] md:leading-[2]"
              style={{
                color: "#6A5B58",           // Softer warm grey-brown (Lovable match)
                fontWeight: 10            // Ensures elegant thin italic
              }}
            >
              "This isn't just a class about makeup — it's me sharing the mindset and the moves that make you unstoppable. By the end, you won't just have a new look in your kit — you will have a new vision for your career."
            </blockquote>

            <cite
              className="font-serif italic text-base md:text-lg block mt-5 md:mt-6"
              style={{
                color: "#C4A1A3",           // Soft dusty rose signature
                fontWeight: 400
              }}
            >
              — Meera Sakhrani
            </cite>
          </div>
        </div>


      </div>
    </section>
  );
};

export default MasterclassFlow;
