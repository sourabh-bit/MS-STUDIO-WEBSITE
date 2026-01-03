import venueImage from "@/assets/classes/venue.jpg";
import { MapPin, Train, Utensils, Building } from "lucide-react";

const VenueSection = () => {
  const venueDetails = [
    {
      icon: Building,
      label: "Venue",
      value: "The Maidens Oberoi"
    },
    {
      icon: MapPin,
      label: "Address",
      value: "7, Sham Nath Marg, Prema Kunj, Civil Lines, New Delhi, Delhi 110054"
    },
    {
      icon: Train,
      label: "Nearest Metro",
      value: "Civil Lines (Yellow Line)"
    },
    {
      icon: Utensils,
      label: "Dining",
      value: "Lunch & Hi-tea at The Curzon Room & The Garden Terrace"
    }
  ];

  return (
    <section className="py-16 md:py-24 lg:py-32 bg-background relative overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img
          src={venueImage}
          alt="The Maidens Oberoi venue"
          className="w-full h-full object-cover opacity-10"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <span className="font-sans text-xs tracking-[0.4em] text-dusty-rose uppercase mb-4 block">
            A Royal Setting
          </span>
          <h2 className="heading-section text-foreground mb-4">
            The Venue
          </h2>
          <p className="text-elegant text-muted-foreground max-w-2xl mx-auto">
            Experience luxury at The Maidens Oberoi, one of Delhi's most iconic heritage hotels.
          </p>
        </div>

        {/* Content */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Venue Image */}
          <div className="relative">
            <div className="aspect-[4/3] overflow-hidden border border-border/30">
              <img
                src={venueImage}
                alt="The Maidens Oberoi - Delhi"
                className="w-full h-full object-cover image-elegant"
              />
            </div>
            {/* Sessions Badge */}
            <div className="absolute -bottom-6 right-6 bg-primary text-primary-foreground px-6 py-4 shadow-elegant">
              <p className="font-sans text-xs tracking-[0.2em] uppercase mb-1">Sessions at</p>
              <p className="font-serif text-lg">The Banquet Hall</p>
            </div>
          </div>

          {/* Venue Details */}
          <div className="space-y-8">
            <div className="bg-warm-cream p-8 md:p-10 border border-border/30">
              <h3 className="font-display text-3xl md:text-4xl text-foreground mb-8 italic">
                The Maidens Oberoi
              </h3>
              
              <div className="space-y-6">
                {venueDetails.map((detail, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-background flex items-center justify-center border border-border/30">
                      <detail.icon className="w-5 h-5 text-dusty-rose" />
                    </div>
                    <div>
                      <p className="font-sans text-xs tracking-[0.2em] uppercase text-muted-foreground mb-1">
                        {detail.label}
                      </p>
                      <p className="font-serif text-foreground">
                        {detail.value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Note */}
            <p className="text-sm text-muted-foreground italic text-center lg:text-left">
              * A heritage property known for its colonial charm and impeccable hospitality
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VenueSection;
