import { Clock } from "lucide-react";

const MasterclassFlow = () => {
  const schedule = [
    {
      time: "12:00 PM – 2:00 PM",
      title: "Live Makeup Demonstration",
      description: "Learn skincare prep and watch Meera's live makeup demonstration for a flawless, radiant look."
    },
    {
      time: "2:00 PM – 3:00 PM",
      title: "Industry Growth & Branding",
      description: "Discover how to grow in the industry — from social media and brand building to mindset mastery."
    },
    {
      time: "3:00 PM – 4:00 PM",
      title: "Photography & Editing",
      description: "Learn photography and editing tips to capture, enhance, and showcase your work like a pro."
    },
  ];

  return (
    <section className="py-16 md:py-24 lg:py-32" style={{ backgroundColor: "#F7EFE7" }}>
      <div className="container mx-auto px-4">

        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <span
            className="font-sans text-xs tracking-[0.4em] uppercase mb-4 block"
            style={{ color: "#D9A7B0" }}
          >
            Your Journey
          </span>

          <h2 className="heading-section text-foreground mb-4">
            Masterclass Flow
          </h2>

          <p className="text-elegant text-muted-foreground max-w-2xl mx-auto">
            A carefully curated 4-hour experience designed to transform your artistry and business
          </p>
        </div>

        {/* Timeline */}
        <div className="max-w-3xl mx-auto">
          <div className="relative">

            {/* Vertical Line */}
            <div
              className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px -translate-x-1/2"
              style={{ backgroundColor: "#C9A4AB" }}
            />

            {schedule.map((item, index) => (
              <div
                key={index}
                className={`relative flex flex-col md:flex-row gap-6 md:gap-12 mb-12 last:mb-0 ${
                  index % 2 === 1 ? "md:flex-row-reverse" : ""
                }`}
              >

                {/* Time Badge */}
                <div className="flex items-center gap-4 md:w-1/2 md:justify-end">
                  <div className={`flex items-center gap-3 ${index % 2 === 1 ? "md:flex-row-reverse" : ""}`}>

                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center z-10 border-4 border-white"
                      style={{ backgroundColor: "#F3D7DE" }}
                    >
                      <Clock className="w-6 h-6" style={{ color: "#D9A7B0" }} />
                    </div>

                    <div className={`text-left ${index % 2 === 1 ? "md:text-right" : ""}`}>
                      <p
                        className="font-display text-lg md:text-xl font-medium"
                        style={{ color: "#D9A7B0" }}
                      >
                        {item.time}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Content Card */}
                <div className="md:w-1/2 ml-12 md:ml-0">
                  <div
                    className="p-6 md:p-8 border shadow-soft bg-white"
                    style={{ borderColor: "#E5D0D6" }}
                  >
                    <h3 className="font-serif text-xl md:text-2xl text-foreground mb-3">
                      {item.title}
                    </h3>

                    <p className="text-muted-foreground leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quote */}
        <div className="max-w-3xl mx-auto mt-16 md:mt-20">
          <div
            className="p-8 md:p-12 border text-center"
            style={{
              backgroundColor: "#FBEFF1",   // Correct softened pink
              borderColor: "#D7B98E"        // Correct softer rose border
            }}
          >
            <blockquote
              className="font-display italic mx-auto max-w-4xl text-[24px] md:text-[18px] "
              style={{
                color: "#6A5B58",           // Softer warm grey-brown (Lovable match)
                lineHeight: "2",
                fontWeight: 10            // Ensures elegant thin italic
              }}
            >
              "This isn't just a class about makeup — it's me sharing the mindset and the moves that make you unstoppable. By the end, you won't just have a new look in your kit — you will have a new vision for your career."
            </blockquote>

            <cite
              className="font-serif italic text-lg block mt-6"
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
