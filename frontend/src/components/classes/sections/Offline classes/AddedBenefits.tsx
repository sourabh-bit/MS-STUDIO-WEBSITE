import benefitsImage from "@/assets/classes/benefits.jpg";

const AddedBenefits = () => {
  const benefits = [
    {
      title: "Beginner Session",
      description: "A dedicated class for beginners by an MS Senior Artist to ensure everyone starts on the same page."
    },
    {
      title: "Skin Care Deep Dive",
      description: "In-depth sessions on skin care ingredients & actives, various types of skin treatments and enhancements, plus recommendations on the best products and tools."
    },
    {
      title: "Photography Skills",
      description: "Learn how to photograph your work well - because great makeup deserves to be captured beautifully."
    },
    {
      title: "Marketing Excellence",
      description: "Master the art of marketing your work and building your brand in the competitive beauty industry."
    },
    {
      title: "Social Media Credibility",
      description: "Strategies to maintain and grow your social media presence with authenticity and impact."
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
