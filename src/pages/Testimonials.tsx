import { Star } from "lucide-react";

const Testimonials = () => {
  const testimonials = [
    {
      name: "Sarah Mitchell",
      role: "Bride",
      image: "1",
      text: "Elena made me feel like a princess on my wedding day. Her attention to detail and ability to enhance my natural features was absolutely stunning. I've never felt more beautiful, and the makeup lasted all day and night!",
      rating: 5
    },
    {
      name: "Victoria Chen",
      role: "Fashion Model",
      image: "2",
      text: "Working with Elena on editorial shoots is always a dream. She understands lighting, camera angles, and how to create looks that photograph beautifully. Her creativity and professionalism are unmatched.",
      rating: 5
    },
    {
      name: "Jennifer Lawson",
      role: "Magazine Editor",
      image: "3",
      text: "We've collaborated with Elena on multiple fashion editorials, and she consistently delivers breathtaking results. Her artistic vision and technical expertise make her one of the best in the industry.",
      rating: 5
    },
    {
      name: "Amanda Rodriguez",
      role: "Mother of the Bride",
      image: "4",
      text: "Elena did makeup for my daughter's wedding party, and we all looked incredible! She took the time to understand each person's style and comfort level. Professional, talented, and an absolute joy to work with.",
      rating: 5
    },
    {
      name: "Olivia Thompson",
      role: "Corporate Executive",
      image: "5",
      text: "For a major company event, Elena created a sophisticated and polished look that gave me so much confidence. She's my go-to artist for all important occasions.",
      rating: 5
    },
    {
      name: "Rachel Green",
      role: "Bride",
      image: "6",
      text: "From the trial to the wedding day, Elena was patient, professional, and incredibly talented. She listened to my vision and exceeded all my expectations. My bridal makeup was absolutely flawless!",
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
            className="inline-block px-10 py-4 bg-primary text-primary-foreground rounded-full font-body tracking-wide shadow-elegant hover:shadow-soft transition-elegant"
          >
            Book Your Session
          </a>
        </div>
      </div>
    </div>
  );
};

export default Testimonials;
