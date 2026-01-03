import { Gem } from "lucide-react";

const BonusTakeaways = () => {
  const bonuses = [
    {
      title: "The Artist's Mindset",
      description: "Learn what it truly takes to be a successful makeup artist — from creativity and discipline to client psychology and confidence."
    },
    {
      title: "AI for Makeup Artists",
      description: "Discover how to use AI tools to plan, create, and elevate your makeup content, streamline ideas, and stay ahead in the digital era."
    },
    {
      title: "Brand Building Blueprint",
      description: "Step-by-step insights on how Meera built her name — from positioning to personal storytelling that makes your brand memorable."
    },
    {
      title: "Behind-the-Scenes Strategy",
      description: "Go inside Meera's team process — how they plan shoots, create content, and manage brand visibility across platforms."
    },
    {
      title: "Content Creation Mastery",
      description: "Learn how to portray yourself online, edit smartly, and create a personal brand that attracts your dream clients."
    },
    {
      title: "Stand Out, Stay Unforgettable",
      description: "If you've already done a course — this is your edge. Learn how to make your artistry stand out and become a client's first choice."
    },
    {
      title: "Industry Insider Advantage",
      description: "Get exclusive wedding season trend forecasts and learn how to stay ahead of evolving client expectations."
    },
  ];

  return (
    <section className="py-16 md:py-24 lg:py-32 bg-[#4A2C2A] text-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Gem className="w-8 h-8 text-[#c9a96e]" />
            <span className="font-display text-2xl md:text-3xl text-[#c9a96e]">
              Bonus Takeaways
            </span>
          </div>
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-white mb-4">
            Worth ₹1,00,000+
          </h2>
          <p className="font-display text-sm md:text-base italic text-white/70">
            (Included in your ₹12,000 Masterclass)
          </p>
        </div>

        {/* Bonuses Grid */}
        <div className="max-w-4xl mx-auto space-y-6">
          {bonuses.map((bonus, index) => (
            <div 
              key={index}
              className="group p-6 md:p-8 bg-white/5 border border-white/10 hover:border-[#c9a96e]/50 transition-all duration-300"
            >
              <div className="flex gap-4 md:gap-6">
                <span className="flex-shrink-0 font-display text-3xl md:text-4xl text-[#c9a96e]/50 group-hover:text-[#c9a96e] transition-colors duration-300">
                  {index + 1}.
                </span>
                <div>
                  <h3 className="font-serif text-xl md:text-2xl text-white mb-2">
                    {bonus.title}
                  </h3>
                  <p className="text-white/70 leading-relaxed">
                    {bonus.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BonusTakeaways;
