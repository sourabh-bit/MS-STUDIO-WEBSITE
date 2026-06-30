import benefitsImage from "@/assets/classes/benefits.jpg";
const AddedBenefits = () => {
  const benefits = [
    {
      title: "Beginner Foundation Session",
      description:
        "Start with confidence through a dedicated beginner class conducted by our senior artists, covering essential makeup techniques, tools, hygiene, and product knowledge."
    },
    {
      title: "Live Demo by Meera Sakhrani",
      description:
        "Watch Meera perform complete bridal and party makeup demonstrations while explaining every technique, product choice, and professional workflow."
    },
    {
      title: "Hands-on Practice with Live Models",
      description:
        "Practice every look on real models under expert supervision, helping you build confidence and master professional application techniques."
    },
    {
      title: "Professional Portfolio Shoot",
      description:
        "Create high-quality portfolio images every day with guided photoshoots, giving you Instagram-ready content to showcase your work."
    },
    {
      title: "Social Media Growth Masterclass",
      description:
        "Learn Instagram strategies, content creation, Reels, personal branding, and client attraction to grow your beauty business organically."
    },
    {
      title: "Meta Ads Masterclass",
      description:
        "Understand Facebook and Instagram advertising to generate bridal bookings, increase inquiries, and scale your makeup business."
    },
    {
      title: "Editing Masterclass",
      description:
        "Learn professional photo editing techniques using industry-standard tools to enhance your makeup portfolio while maintaining natural results."
    },
    {
      title: "Bridal Styling Masterclass",
      description:
        "Master complete bridal styling including jewellery placement, draping coordination, hair styling concepts, and overall bridal presentation."
    }
  ];

  return (
    <section className="py-16 md:py-24 lg:py-32 bg-[hsl(var(--soft-pink))]/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <span className="font-sans text-xs tracking-[0.4em] text-dusty-rose uppercase mb-4 block">
            Beyond the Basics
          </span>
          <h2 className="heading-section text-foreground mb-4">
            Added Benefits
          </h2>
          <p className="text-elegant text-muted-foreground max-w-2xl mx-auto">
            Meera teaches not just makeup, but a complete lifestyle transformation 
            for aspiring makeup artists.
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Image */}
          <div className="relative">
            <div className="aspect-[4/5] overflow-hidden">
              <img
                src={benefitsImage}
                alt="Added benefits of the masterclass"
                className="w-full h-full object-cover image-elegant object-top"
              />
            </div>
            {/* Decorative Element */}
            <div className="absolute -bottom-4 -right-4 w-2/3 h-2/3 border border-dusty-rose/20 -z-10" />
          </div>

          {/* Benefits List */}
          <div className="space-y-6">
            <h3 className="font-serif text-2xl md:text-3xl text-foreground mb-8">
              Bonus Sessions
            </h3>
            
            {benefits.map((benefit, index) => (
              <div 
                key={index} 
                className="group p-6 bg-background/60 backdrop-blur-sm border border-border/30 hover:border-dusty-rose/30 transition-all duration-300"
              >
                <div className="flex gap-4">
                  <span className="font-display text-3xl text-dusty-rose/40 group-hover:text-dusty-rose transition-colors duration-300">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <h4 className="font-serif text-lg text-foreground mb-2">
                      {benefit.title}
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AddedBenefits;


