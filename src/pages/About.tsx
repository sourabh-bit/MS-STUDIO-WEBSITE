const About = () => {
  return (
    <div className="min-h-screen py-24">
      <div className="container mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="text-center mb-20 animate-fade-in">
          <h1 className="font-display text-5xl md:text-7xl text-primary mb-6">
            About Elena
          </h1>
          <div className="w-24 h-1 bg-secondary mx-auto" />
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto space-y-16">
          {/* Story */}
          <div className="animate-fade-up">
            <h2 className="font-display text-3xl md:text-4xl text-primary mb-8">
              A Passion for Beauty
            </h2>
            <div className="space-y-6 font-body text-base md:text-lg text-foreground/80 leading-relaxed">
              <p>
                My journey into the world of makeup artistry began over fifteen years ago, 
                inspired by the transformative power of beauty and the art of self-expression. 
                What started as a fascination with color theory and human features evolved into 
                a lifelong dedication to mastering the craft.
              </p>
              <p>
                I believe that makeup is more than just cosmetics—it's an art form that celebrates 
                individuality, enhances natural beauty, and empowers confidence. Whether working 
                on a intimate bridal session or a high-fashion editorial shoot, my approach remains 
                the same: to create looks that are timeless, elegant, and authentically you.
              </p>
              <p>
                Based in [City], I've had the privilege of working with incredible clients ranging 
                from brides on their special day to models gracing magazine covers. Each collaboration 
                is a unique opportunity to blend technique with artistry, creating moments of beauty 
                that last forever.
              </p>
            </div>
          </div>

          {/* Philosophy */}
          <div className="bg-gradient-to-br from-accent/10 to-peach/10 p-12 rounded-3xl shadow-soft animate-scale-in">
            <h2 className="font-display text-3xl md:text-4xl text-primary mb-6 text-center">
              My Philosophy
            </h2>
            <p className="font-body text-base md:text-lg text-foreground/80 leading-relaxed text-center">
              "True beauty lies in authenticity. My goal is not to mask, but to magnify—
              to enhance what makes you uniquely beautiful and help you feel like the most 
              radiant version of yourself."
            </p>
            <div className="mt-8 text-center">
              <p className="font-display text-2xl text-primary italic">
                — Elena Rose
              </p>
            </div>
          </div>

          {/* Expertise */}
          <div className="animate-fade-up">
            <h2 className="font-display text-3xl md:text-4xl text-primary mb-8">
              Training & Expertise
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                "Certified Professional Makeup Artist",
                "Advanced Bridal Makeup Specialist",
                "Editorial & Fashion Makeup",
                "Airbrush Techniques",
                "Color Theory & Skin Analysis",
                "High-Definition Photography Makeup",
                "Special Effects & Character Design",
                "Makeup for All Skin Tones & Types"
              ].map((skill, index) => (
                <div 
                  key={index}
                  className="flex items-center space-x-3 font-body text-foreground/80"
                >
                  <div className="w-2 h-2 bg-secondary rounded-full" />
                  <span>{skill}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Featured In */}
          <div className="text-center animate-fade-in">
            <h3 className="font-display text-2xl text-primary mb-8">
              As Featured In
            </h3>
            <div className="flex flex-wrap justify-center gap-8 items-center opacity-60">
              <span className="font-display text-xl">Vogue</span>
              <span className="font-display text-xl">Harper's Bazaar</span>
              <span className="font-display text-xl">Elle</span>
              <span className="font-display text-xl">Brides Magazine</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
