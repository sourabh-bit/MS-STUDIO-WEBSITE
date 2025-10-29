import { Sparkles, Camera, Heart, Star } from "lucide-react";

const Services = () => {
  const services = [
    {
      icon: Heart,
      title: "Bridal Makeup",
      price: "Starting at $350",
      description: "Your wedding day deserves perfection. Includes consultation, makeup trial, and day-of application with touch-up kit.",
      features: [
        "Pre-wedding consultation",
        "Makeup trial session",
        "Day-of application",
        "Complimentary touch-up kit",
        "Airbrush or traditional technique",
        "False lashes included"
      ]
    },
    {
      icon: Camera,
      title: "Editorial & Fashion",
      price: "Starting at $250",
      description: "Bold, creative looks for photoshoots, runway shows, and fashion campaigns. Perfect for models and publications.",
      features: [
        "Creative concept development",
        "High-definition makeup",
        "Photography-ready finish",
        "Multiple looks per session",
        "On-set touch-ups included",
        "Portfolio-building collaboration"
      ]
    },
    {
      icon: Star,
      title: "Special Events",
      price: "Starting at $150",
      description: "Glamorous makeup for galas, proms, photoshoots, or any occasion where you want to look and feel extraordinary.",
      features: [
        "Event-appropriate styling",
        "Long-lasting formulas",
        "Contouring and highlighting",
        "False lashes available",
        "Photography-friendly makeup",
        "Touch-up recommendations"
      ]
    },
    {
      icon: Sparkles,
      title: "Makeup Lessons",
      price: "Starting at $200",
      description: "Learn professional techniques tailored to your features. Private or group sessions available.",
      features: [
        "Personalized instruction",
        "Technique demonstrations",
        "Product recommendations",
        "Skin prep guidance",
        "Take-home notes",
        "Follow-up support"
      ]
    }
  ];

  return (
    <div className="min-h-screen py-24">
      <div className="container mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="text-center mb-20 animate-fade-in">
          <h1 className="font-display text-5xl md:text-7xl text-primary mb-6">
            Services & Pricing
          </h1>
          <p className="font-body text-lg text-muted-foreground max-w-2xl mx-auto">
            Bespoke beauty services tailored to your unique needs and vision
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-20">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <div
                key={index}
                className="bg-card p-10 rounded-3xl shadow-soft hover:shadow-elegant transition-elegant animate-scale-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-start space-x-6 mb-6">
                  <div className="flex-shrink-0 w-16 h-16 bg-accent/20 rounded-2xl flex items-center justify-center">
                    <Icon size={28} className="text-primary" />
                  </div>
                  <div className="flex-grow">
                    <h2 className="font-display text-3xl text-primary mb-2">
                      {service.title}
                    </h2>
                    <p className="font-body text-lg text-secondary font-semibold">
                      {service.price}
                    </p>
                  </div>
                </div>

                <p className="font-body text-base text-foreground/80 mb-6 leading-relaxed">
                  {service.description}
                </p>

                <div className="space-y-3">
                  {service.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center space-x-3">
                      <div className="w-1.5 h-1.5 bg-secondary rounded-full flex-shrink-0" />
                      <span className="font-body text-sm text-foreground/70">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Additional Info */}
        <div className="max-w-4xl mx-auto space-y-12 animate-fade-in">
          <div className="bg-gradient-to-br from-peach/20 to-accent/20 p-10 rounded-3xl text-center">
            <h3 className="font-display text-3xl text-primary mb-4">
              Custom Packages Available
            </h3>
            <p className="font-body text-base text-foreground/80 leading-relaxed">
              Every client is unique, and so are their needs. I offer customized packages for 
              bridal parties, multi-day events, and ongoing collaborations. Let's discuss your 
              vision and create a bespoke experience just for you.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-card p-8 rounded-2xl shadow-soft">
              <h4 className="font-display text-xl text-primary mb-4">
                Travel Services
              </h4>
              <p className="font-body text-sm text-foreground/70 leading-relaxed">
                Available for destination weddings, on-location shoots, and events. 
                Travel fees apply based on distance and duration.
              </p>
            </div>

            <div className="bg-card p-8 rounded-2xl shadow-soft">
              <h4 className="font-display text-xl text-primary mb-4">
                Group Bookings
              </h4>
              <p className="font-body text-sm text-foreground/70 leading-relaxed">
                Special rates available for bridal parties, photoshoot teams, and group 
                makeup lessons. Inquire for details.
              </p>
            </div>
          </div>

          <div className="text-center">
            <a
              href="/contact"
              className="inline-block px-10 py-4 bg-primary text-primary-foreground rounded-full font-body tracking-wide shadow-elegant hover:shadow-soft transition-elegant"
            >
              Book Your Appointment
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Services;
