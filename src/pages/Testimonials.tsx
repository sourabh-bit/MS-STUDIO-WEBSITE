import { Star } from "lucide-react";

const Testimonials = () => {
  const testimonials = [
    {
      name: "Aanya Sharma",
      role: "Bride",
      image: "1",
      text: "Meera was an absolute dream to work with! She made me feel like the best version of myself on my wedding day. The makeup was flawless, natural, and stayed perfect through all the ceremonies. Every time I look at the photos, I’m reminded of how confident and beautiful I felt.",
      rating: 5
    },
    {
      name: "Diya Kapoor",
      role: "Fashion Model",
      image: "2",
      text: "I’ve worked with Meera on several editorial shoots, and her creativity is simply unmatched. She understands how makeup translates on camera and always brings a fresh, modern perspective to every look.",
      rating: 5
    },
    {
      name: "Neha Malhotra",
      role: "Style & Essence Magazine",
      image: "3",
      text: "Our magazine has collaborated with Meera for multiple cover stories, and she never fails to impress. Her attention to lighting, tones, and textures is remarkable. She’s a true artist who blends professionalism with passion",
      rating: 5
    },
    {
      name: "Sunita Mehta",
      role: "Bride",
      image: "4",
      text: "Meera did the makeup for my daughter’s wedding, and we couldn’t have asked for a better experience. She made everyone—from the bride to the bridesmaids—look radiant yet natural. Her calm energy made the entire morning stress-free.",
      rating: 5
    },
    {
      name: "Riya",
      role: "Corporate Executive",
      image: "5",
      text: "“For a major brand launch event, Meera created a polished and elegant look that perfectly matched our theme. Her sense of style, professionalism, and warmth make her my go-to artist for every important occasion.",
      rating: 5
    },
    {
      name: "Kritika Joshi",
      role: "Bride",
      image: "6",
      text: "From my first trial to the final wedding look, Meera was so patient and detail-oriented. She understood exactly what I wanted and made me feel truly special. I’ve recommended her to all my friends since",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen py-24">
      <div className="container mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="text-center mb-20 animate-fade-in">
          <h1 className="font-display text-5xl md:text-7xl text-primary mb-6">
            Client Love
          </h1>
          <p className="font-body text-lg text-muted-foreground max-w-2xl mx-auto">
            What my clients say about their experience
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-peach/10 to-accent/10 p-8 rounded-3xl shadow-soft hover:shadow-elegant transition-elegant animate-scale-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Rating */}
              <div className="flex space-x-1 mb-6">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} size={18} className="fill-secondary text-secondary" />
                ))}
              </div>

              {/* Testimonial Text */}
              <blockquote className="font-body text-base text-foreground/80 leading-relaxed mb-6 italic">
                "{testimonial.text}"
              </blockquote>

              {/* Client Info */}
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-secondary to-accent rounded-full flex items-center justify-center">
                  <span className="font-display text-lg text-white">
                    {testimonial.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="font-display text-lg text-primary">
                    {testimonial.name}
                  </p>
                  <p className="font-body text-sm text-muted-foreground">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-5xl mx-auto animate-fade-in">
          {[
            { number: "500+", label: "Happy Clients" },
            { number: "15+", label: "Years Experience" },
            { number: "200+", label: "Bridal Looks" },
            { number: "5.0", label: "Average Rating" }
          ].map((stat, index) => (
            <div key={index} className="text-center p-6 bg-card rounded-2xl shadow-soft">
              <p className="font-display text-4xl text-primary mb-2">
                {stat.number}
              </p>
              <p className="font-body text-sm text-muted-foreground">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-20 animate-fade-in">
          <h3 className="font-display text-3xl text-primary mb-4">
            Ready to Experience the Difference?
          </h3>
          <p className="font-body text-base text-foreground/80 mb-8">
            Join hundreds of satisfied clients who've trusted me with their beauty transformations
          </p>
          <a
            href="/contact"
            className="inline-block px-10 py-4 bg-primary text-primary-foreground rounded-full font-body tracking-wide shadow-elegant border border-primary transition-colors duration-300 hover:bg-transparent hover:text-primary"
            >
              Book Your Session
          </a>

        </div>
      </div>
    </div>
  );
};

export default Testimonials;
