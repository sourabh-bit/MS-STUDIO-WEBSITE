import { Check } from "lucide-react";

const WhoShouldAttend = () => {
  const attendees = [
    "Aspiring & professional makeup artists",
    "Artists who've already completed courses but want to elevate their identity",
    "Creatives who wish to understand the business and brand side of makeup",
    "Anyone serious about turning passion into a powerful, profitable profession"
  ];

  return (
    <section className="py-16 md:py-24 lg:py-32 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Section Header */}
          <div className="mb-12 md:mb-16">
            <h2 className="font-serif font-semibold text-3xl md:text-4xl lg:text-5xl text-foreground mb-2">
              Who Should{" "}
              <span className="font-display italic text-dusty-rose">attend</span>
            </h2>
          </div>

          {/* Attendee List */}
          <div className="space-y-6 mb-12 font-semibold">
            {attendees.map((item, index) => (
              <div 
                key={index}
                className="flex items-center gap-4 text-left p-6 bg-[#FDF7F7] border border-[#F0D9DB]"
              >
                {/* Icon Circle */}
                <span className="flex-shrink-0 w-10 h-10 bg-[#F7EAEA] rounded-full flex items-center justify-center">
                  <Check className="w-5 h-5 text-dusty-rose" />
                </span>

                {/* Text */}
                <p className="font-serif text-[18px] md:text-[20px] text-[#6A5B58] leading-relaxed">
                  {item}
                </p>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
};

export default WhoShouldAttend;
