import { Star } from "lucide-react";

const Testimonials = () => {
  const testimonials = [
    {
      name: "Shafali goutam",
      role: "Bride",
      image: "1",
      text: "Meera Sakhrani did my sangeet makeup and was really good. Meera is great for glam evening looks",
      rating: 5
    },
    {
      name: "Heena Sharma",
      role: "Bride",
      image: "2",
      text: "She did my sister in law's makeup for her wedding. The makeup was absolutely gorgeous and flawless. Meera is the best in this business and it really is true.The makeup was fantastic and there is no doub't about it. Recommended",
      rating: 5
    },
    {
      name: "Rupal",
      role: "Wedding & Event",
      image: "3",
      text: "Meera sakhrani, created stunning looks for me on both wedding day and the farmers market event,Her flawless work was a radiant touch to each occasion, making me feel truly special",
      rating: 5
    },
    {
      name: "Sunita Mehta",
      role: "Bride",
      image: "4",
      text: "No words to describe her. Meera sakhrani and her entire team truly are magicians. Not a single moment where i felt like there was toomuch happening. She is a queen",
      rating: 5
    },
    {
      name: "Riya",
      role: "Bride",
      image: "5",
      text: "Her unparalleled talent who exceeded all expectations With a skilled an understanding of my vision, she turned canvas of my face into a masterpiece",
      rating: 5
    },
    {
      name: "Rania",
      role: "Bride",
      image: "6",
      text: "Meera sakhrani for all the 3 main events . Super happy with her work, I looked like myself and she put the entire look together so well on each day. Blush lounge Sneha for the haldi and her owork was amazing too. plus one of the kindest and easiest to work  with",
      rating: 5
    },
    {
      name: "Adya",
      role: "Bride",
      image: "7",
      text: "Meera sakhrani and her team (Hair by Dablu) were with me, My mom and my sister for all of our events and working with them was like working with family, We had so much fun gossiping and getting ready. It was the perfect way to start every day",
      rating: 5
    },
    {
      name: "Aishwarya",
      role: "Bride",
      image: "8",
      text: "The makeup was done for my wedding functions and I'm very happy with how the makeup turned out to be. The makeup was very subtle and antural ,just how i wanted to be. Loved the wayy my makeup complimentard my outfits. Very happy with the end results. Highly recommended",
      rating: 5
    },
    {
      name: "Sargun",
      role: "Bride",
      image: "8",
      text: "Meera Sakhrani. She's out of the world. She created every look so different from the the other and made me look my best. She's patient and huble and knows what she's doing. Loved her work!",
      rating: 5
    },
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
            { number: "5000+", label: "Happy Clients" },
            { number: "15+", label: "Years Experience" },
            { number: "2000+", label: "Bridal Looks" },
            { number: "4.8", label: "Average Rating" }
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
