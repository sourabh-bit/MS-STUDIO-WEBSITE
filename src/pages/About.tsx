const About = () => {
  return (
    <div className="min-h-screen py-24">
      <div className="container mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="text-center mb-20 animate-fade-in">
          <h1 className="font-display text-5xl md:text-7xl text-primary mb-6">
            About Meera
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
                For Meera, beauty is not just seen—it’s felt. Her journey into the world of makeup artistry began over a decade ago, driven by a deep appreciation for elegance, detail, and the power of transformation. What started as a creative curiosity has evolved into a signature style defined by sophistication, precision, and grace.
              </p>
              <p>
                Every face tells a story, and Meera believes makeup should enhance that story—not overshadow it. From radiant bridal looks to refined editorial creations, her approach blends artistry with intuition to reveal each client’s most confident, authentic self.
              </p>
              <p>
                Based in Delhi, Meera has had the privilege of working with brides, models, and creative professionals who trust her to craft looks that are both timeless and unforgettable. Each brushstroke reflects her belief that true beauty lies in individuality—and that elegance never goes out of style.
              </p>
            </div>
          </div>

          {/* Philosophy */}
          <div className="bg-gradient-to-br from-accent/10 to-peach/10 p-12 rounded-3xl shadow-soft animate-scale-in">
            <h2 className="font-display text-3xl md:text-4xl text-primary mb-6 text-center">
              My Philosophy
            </h2>
            <p className="font-body text-base md:text-lg text-foreground/80 leading-relaxed text-center">
             “Beauty begins with authenticity. My artistry is about revealing, not concealing—enhancing your natural features so you shine with effortless confidence and timeless grace.”
            </p>
            <div className="mt-8 text-center">
              <p className="font-display text-2xl text-primary italic">
                — Meera Sakhrani
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
          {/* <div className="text-center animate-fade-in">
            <h3 className="font-display text-2xl text-primary mb-8">
              As Featured In
            </h3>
            <div className="flex flex-wrap justify-center gap-8 items-center opacity-60">
              <span className="font-display text-xl">Vogue</span>
              <span className="font-display text-xl">Harper's Bazaar</span>
              <span className="font-display text-xl">Elle</span>
              <span className="font-display text-xl">Brides Magazine</span>
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default About;