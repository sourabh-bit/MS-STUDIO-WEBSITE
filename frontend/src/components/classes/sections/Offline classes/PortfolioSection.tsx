import portfolioImage from "@/assets/classes/portfolio.jpg";
import portfolio2 from "@/assets/classes/portfolio2.jpg";
import portfolio3 from "@/assets/classes/portfolio3.jpg";
import portfolio4 from "@/assets/classes/portfolio4.jpg";
import { Camera, Video, Sparkles, Users } from "lucide-react";

const PortfolioSection = () => {
  const portfolioImages = [portfolioImage, portfolio2, portfolio3, portfolio4];

  const features = [
    { icon: Camera, label: "4 Posts", description: "Professional photos for your portfolio" },
    { icon: Video, label: "4 Reels", description: "Video content for social media" },
    { icon: Sparkles, label: "Designer Clothing", description: "Styled in designer outfits" },
    { icon: Users, label: "Expert Guidance", description: "Directed by Meera herself" },
  ];

  return (
    <section className="py-16 md:py-24 lg:py-32 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <span className="font-sans text-xs tracking-[0.4em] text-dusty-rose uppercase mb-4 block">
            Build Your Brand
          </span>
          <h2 className="heading-section text-foreground mb-4 font-extrabold">
            Student Portfolio
          </h2>
          <p className="text-elegant text-muted-foreground max-w-2xl mx-auto">
            Each student gets to create 4 stunning looks for their professional portfolio
          </p>
        </div>

        {/* Image Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-12 md:mb-16">
          {portfolioImages.map((image, index) => (
            <div 
              key={index}
              className="relative aspect-[3/4] overflow-hidden group"
            >
              <img
                src={image}
                alt={`Student portfolio look ${index + 1}`}
                className="w-full h-full object-cover image-elegant"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <span className="font-display text-3xl text-background">
                  {String(index + 1).padStart(2, '0')}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Features */}
        <div className="max-w-4xl mx-auto">
          <div className="section-cream bg-pattern-soft border border-dusty-rose/20 p-8 md:p-10">
            <h3 className="font-serif text-2xl text-foreground text-center mb-8">
              What You'll Get
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <div key={index} className="text-center">
                  <div className="w-14 h-14 bg-background border border-border/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-6 h-6 text-dusty-rose" />
                  </div>
                  <p className="font-serif text-lg text-foreground mb-1">
                    {feature.label}
                  </p>
                  <p className="font-sans text-xs text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-8 border-t border-dusty-rose/20 text-center">
              <p className="text-elegant text-muted-foreground">
                Styling done by experts. Videos shot in designer clothes for your social media.
                <br />
                <span className="italic text-dusty-rose">In Meera's guidance.</span>
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-14 md:mt-10">
          <a 
            href="#enroll"
            className="inline-block px-10 py-4 bg-primary text-primary-foreground font-sans text-sm tracking-[0.2em] uppercase hover:bg-dusty-rose transition-all duration-300"
          >
            Enroll Now
          </a>
          <p className="mt-4 font-sans text-sm text-muted-foreground">
            Limited seats available
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-10 md:mt-24 pt-4 border-t border-border/30">
        <div className="container mx-auto px-4 text-center">
          <h4 className="font-display text-2xl tracking-[0.2em] text-foreground mb-2">
            MEERA SAKHRANI SCHOOL
          </h4>
          <p className="font-sans text-sm text-muted-foreground mb-6">
            The Future of Makeup Artistry
          </p>
          {/* <a 
            href="tel:+919818793850"
            className="font-sans text-sm text-dusty-rose hover:text-foreground transition-colors duration-300"
          >
            +91 98187 93850
          </a>
          <p className="font-sans text-xs text-muted-foreground mt-8">
            © 2025 Meera Sakhrani School. All rights reserved.
          </p> */}
        </div>
      </footer>
    </section>
  );
};

export default PortfolioSection;
