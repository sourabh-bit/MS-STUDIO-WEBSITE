import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-image.jpg";

const Home = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Luxury makeup artistry"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/60 to-transparent" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-6 lg:px-12">
          <div className="max-w-2xl animate-fade-up">
            <h1 className="font-display text-5xl md:text-7xl lg:text-8xl text-primary mb-6 leading-tight">
              Makeup as an Artform
            </h1>
            <p className="font-body text-lg md:text-xl text-foreground/80 mb-8 leading-relaxed">
              Enhance Your Natural Elegance
            </p>
            <p className="font-body text-sm md:text-base text-muted-foreground mb-12 leading-relaxed max-w-lg">
              Luxury makeup artistry for timeless beauty. From editorial shoots to bridal perfection, 
              I create bespoke looks that celebrate your unique essence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/contact">
                <Button 
                  size="lg" 
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-body tracking-wide shadow-elegant transition-elegant group"
                >
                  Book Your Look
                  <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
                </Button>
              </Link>
              <Link to="/portfolio">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-primary text-primary hover:bg-primary hover:text-primary-foreground font-body tracking-wide transition-elegant"
                >
                  Discover My Work
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Introduction Section */}
      <section className="py-24 bg-peach/20">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="max-w-4xl mx-auto text-center animate-fade-in">
            <h2 className="font-display text-4xl md:text-5xl text-primary mb-8">
              Where Beauty Meets Artistry
            </h2>
            <p className="font-body text-base md:text-lg text-foreground/80 leading-relaxed mb-6">
              With over a decade of experience in luxury makeup artistry, I specialize in creating looks 
              that enhance your natural beauty while adding a touch of editorial sophistication.
            </p>
            <p className="font-body text-base md:text-lg text-foreground/80 leading-relaxed">
              Every face tells a story, and my goal is to help you tell yours with confidence, 
              grace, and timeless elegance.
            </p>
          </div>
        </div>
      </section>

      {/* Services Preview */}
      <section className="py-24">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="font-display text-4xl md:text-5xl text-primary mb-4">
              Bespoke Beauty Services
            </h2>
            <p className="font-body text-muted-foreground">
              Tailored experiences for every occasion
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Bridal Beauty",
                description: "Timeless elegance for your special day with trials and day-of perfection"
              },
              {
                title: "Editorial & Fashion",
                description: "Bold, creative looks for photoshoots, runway, and campaigns"
              },
              {
                title: "Special Occasions",
                description: "Glamorous makeup for galas, events, and celebrations"
              }
            ].map((service, index) => (
              <div 
                key={index}
                className="bg-card p-8 rounded-2xl shadow-soft hover:shadow-elegant transition-elegant animate-scale-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <h3 className="font-display text-2xl text-primary mb-4">
                  {service.title}
                </h3>
                <p className="font-body text-muted-foreground leading-relaxed">
                  {service.description}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/services">
              <Button 
                size="lg" 
                variant="outline"
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-elegant"
              >
                View All Services
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-accent/20 via-peach/20 to-secondary/20">
        <div className="container mx-auto px-6 lg:px-12 text-center">
          <h2 className="font-display text-4xl md:text-5xl text-primary mb-6">
            Ready to Transform?
          </h2>
          <p className="font-body text-lg text-foreground/80 mb-8 max-w-2xl mx-auto">
            Let's create something beautiful together. Book your consultation today.
          </p>
          <Link to="/contact">
            <Button 
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-elegant transition-elegant"
            >
              Get in Touch
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
