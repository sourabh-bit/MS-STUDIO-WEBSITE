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

{/* STORY SECTION — BIG PHOTO + SPLIT TEXT + FULL WIDTH TEXT BELOW */}
<div className="max-w-6xl mx-auto mb-32">

  {/* TOP GRID — PHOTO LEFT + SHORT TEXT RIGHT */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">

    {/* LEFT — BIG PHOTO */}
    <div className="flex justify-center md:justify-start">
      <div
        className="p-4 md:p-6 rounded-3xl shadow-soft"
        style={{
          background: "#fbf3ef",
          boxShadow: "0 10px 40px rgba(0,0,0,0.06)",
        }}
      >
        <img
          src="https://res.cloudinary.com/dqdx30pbj/image/upload/v1763040181/IMG_8861_hui550.jpg"
          alt="Meera"
          className="
            w-80 md:w-[520px]
            rounded-2xl
            opacity-100
            filter brightness-[1.10] contrast-[0.85] saturate-[0.90]
          "
          style={{ mixBlendMode: "multiply" }}
        />
      </div>
    </div>

    {/* RIGHT — PREMIUM TEXT */}
    <div>
      <h2 className="font-display text-3xl md:text-4xl text-primary mb-8 text-left">
        A Passion for Beauty
      </h2>

      <div className="space-y-5 font-body text-base md:text-lg text-foreground/80 leading-relaxed">
        <p>
          For Meera, beauty is not just seen—it’s felt. Her journey into the world
          of makeup artistry began over a decade ago, guided by an eye for elegance,
          detail, and the quiet power of transformation.
        </p>

        <p>
          What started as a creative curiosity evolved into a refined artistry rooted
          in soft glam, precision, and an intuitive understanding of facial harmony.
        </p>

        <p>
          Her signature style blends sophistication with intention—enhancing natural
          beauty without overpowering it, and allowing each client’s personality to
          shine through effortlessly.
        </p>
      </div>
    </div>

  </div>

  {/* FULL-WIDTH LUXURY TEXT BELOW */}
  <div className="mt-12 space-y-6 font-body text-base md:text-lg text-foreground/80 leading-relaxed px-1">
    <p>
      Every face carries a story, and Meera’s artistry is rooted in honoring that narrative. She approaches each client with the belief that makeup should reveal rather than conceal—highlighting the softness, structure, and individuality that make every person beautiful in their own way.
    </p>

    <p>
      Her portfolio ranges from timeless bridal looks to modern editorial work, each crafted with a balance of creativity and technical mastery. Whether she is preparing a bride for her most meaningful day or collaborating on a stylized photoshoot, Meera ensures her looks are both camera-ready and incredibly comfortable to wear.
    </p>

    <p>
      Based in Delhi, she has earned the trust of brides, models, and creative professionals who appreciate her calm presence, meticulous attention to detail, and the soft-glam aesthetic that has become her signature. Her gentle yet refined approach creates an experience that feels personal, luxurious, and deeply considered.
    </p>

    <p>
      At the heart of Meera’s philosophy lies a simple truth: beauty is timeless when it feels true to you. Her work is defined by subtle enhancement, graceful balance, and an unwavering dedication to making every client feel radiant, elegant, and authentically themselves.
    </p>
  </div>

</div>




        {/* PHILOSOPHY SECTION */}
        <div className="bg-gradient-to-br from-accent/10 to-peach/10 p-12 rounded-3xl shadow-soft animate-scale-in max-w-5xl mx-auto mb-24">
          <h2 className="font-display text-3xl md:text-4xl text-primary mb-6 text-center">
            My Philosophy
          </h2>
          <p className="font-body text-base md:text-lg text-foreground/80 leading-relaxed text-center">
            “Beauty begins with authenticity. My artistry is about revealing, 
            not concealing—enhancing your natural features so you shine with 
            effortless confidence and timeless grace.”
          </p>
          <div className="mt-8 text-center">
            <p className="font-display text-2xl text-primary italic">
              — Meera Sakhrani
            </p>
          </div>
        </div>


        {/* EXPERTISE SECTION */}
        <div className="animate-fade-up max-w-5xl mx-auto">
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

      </div>
    </div>
  );
};

export default About;
