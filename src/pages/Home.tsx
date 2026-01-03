import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-image.jpg";

const Home = () => {
  return (
    <div className="min-h-screen pt-[20px]">
      {/* Hero Section with Image Grid */}
      <section className="relative min-h-screen flex items-end pb-20 overflow-hidden">
        {/* Background Image Grid */}
        <div className="absolute inset-0  gap-0">
          
          <div className="relative overflow-hidden">
            <img
              src={heroImage}
              alt="Bridal makeup artistry"
              className="w-[300vh] h-[100vh] object-cover"
            />
            {/* <div className="absolute inset-0 bg-gradient-to-t from-background via-background/5 to-transparent" /> */}
            {/* <div className="absolute inset-0 bg-gradient-to-b from-background/40 to-transparent" /> */}
          </div>
          {/* <div className="relative overflow-hidden">
            <img
              src={heroImage}
              alt="Wedding day makeup"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-background/40 to-transparent" />
          </div>
          <div className="relative overflow-hidden">
            <img
              src={heroImage}
              alt="Professional makeup"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-background/40 to-transparent" />
          </div> */}
        </div>

        {/* Overlay gradient */}
        {/* <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" /> */}

        {/* Hero Content */}
        {/* <div className="relative z-10 container mx-auto px-6 lg:px-12 text-center">
          <div className="max-w-4xl mx-auto animate-fade-up bg-background/95 backdrop-blur-sm py-12 px-8 rounded-lg shadow-elegant">
            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl text-primary mb-4 leading-tight tracking-wider">
              LUXURY MAKEUP ARTIST
            </h1>
            <p className="font-body text-sm md:text-base text-muted-foreground mb-6 uppercase tracking-widest">
              Creating Soft Glam Looks
            </p>
            <p className="font-script text-4xl md:text-6xl text-primary/80 mb-8">
              for the modern bride
            </p>
            <Link to="/services">
              <Button 
                size="lg" 
                variant="outline"
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground font-body tracking-widest uppercase text-xs transition-elegant"
              >
                Explore the Services
                <ArrowRight className="ml-2" size={16} />
              </Button>
            </Link>
          </div>
        </div> */}
      </section>

      {/* Introduction Section */}
      <section className="py-12 bg-peach/10">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid md:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
            <div className="space-y animate-fade-in">
              {/* <p className="font-body text-xs uppercase tracking-widest text-muted-foreground">
                Where beauty meets artistry
              </p> */}
              <div className="font-script text-4xl text-primary/70">
                Where beauty meets artistry
              </div>
              <h2 className="font-display text-5xl md:text-6xl text-primary leading-tight">
                and every detail <br />tells your story
              </h2>
              <div className="font-script text-4xl text-primary/60">
                ~MS
              </div>
            </div>
            <div className="space-y-6 animate-fade-in">
              <p className="font-body text-sm md:text-base text-foreground/70 leading-relaxed">
                Elevating beauty into an experience — each brushstroke thoughtfully designed to enhance your natural glow.

                From intimate weddings to high-end events, I specialize in creating refined, luminous looks that photograph flawlessly and last all day.
              </p>
              <p className="font-body text-sm md:text-base text-foreground/70 leading-relaxed">
                My artistry is built on precision, calm energy, and a passion for helping every woman feel effortlessly radiant.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Portfolio Preview Section */}
      <section className="py-6">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid md:grid-cols-3 gap-4 mb-16">
            <div className="aspect-[3/4] overflow-hidden rounded-lg">
              <img
                src="https://res.cloudinary.com/dqdx30pbj/image/upload/v1763013328/port9_rlg7oa.jpg"
                alt="Makeup application"
                className="w-full h-full object-cover hover:scale-105 transition-elegant"
              />
            </div>
            <div className="aspect-[3/4] overflow-hidden rounded-lg">
              <img
                src="https://res.cloudinary.com/dqdx30pbj/image/upload/v1763013327/port4_cdcolz.jpg"
                alt="Bridal beauty"
                className="w-full h-full object-cover hover:scale-105 transition-elegant"
              />
            </div>
            <div className="aspect-[3/4] overflow-hidden rounded-lg">
              <img
                src="https://res.cloudinary.com/dqdx30pbj/image/upload/v1763013398/port1_gmr9jg.jpg"
                alt="Bridesmaids"
                className="w-full h-full object-cover hover:scale-105 transition-elegant"
              />
            </div>
          </div>

          <div className="text-center space-y-6 max-w-3xl mx-auto">
            <p className="font-body text-xs uppercase tracking-widest text-muted-foreground">
              From weddings, dances, to professional photoshoots, I've got you covered as a
            </p>
            <h2 className="font-display text-4xl md:text-6xl text-primary tracking-wider">
              TRUSTED MAKEUP ARTIST
            </h2>
            {/* <Link to="/contact">
              <Button 
                size="lg" 
                variant="outline"
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-elegant uppercase tracking-widest text-xs mt-8"
              >
                Book Your Occasion
                <ArrowRight className="ml-2" size={16} />
              </Button>
            </Link> */}
            <div className="hidden lg:flex justify-center items-center mt-8">
            <Link to="/contact">
              <Button variant="outline" size="sm" className="gap-2">
                <span className="text-xs uppercase tracking-wider">Book Your Ocassion</span>
              </Button>
            </Link>
          </div>
          </div>
        </div>
      </section>

<section className="relative py-24 overflow-hidden 
  bg-gradient-to-br from-accent/20 via-peach/20 to-secondary/20">

  {/* TEXT */}
  <div className="relative z-20 container mx-auto px-6 lg:px-12 text-center">
    <h2 className="font-display text-4xl md:text-5xl text-primary mb-6">
      Ready to Transform?
    </h2>

    <p className="font-body text-lg text-foreground/80 max-w-2xl mx-auto">
      Let's create something beautiful together. Book your consultation today.
    </p>

    {/* CTA — moved down so it doesn’t block the face */}
    <div className="hidden lg:flex justify-center items-center mt-16">
      <Link to="/contact">
        <Button variant="outline" size="sm" className="gap-2">
          <span className="text-xs uppercase tracking-wider">Get in Touch</span>
        </Button>
      </Link>
    </div>
  </div>

  {/* BACKGROUND IMAGE */}
  <div className="absolute inset-0">
    <img
      src="https://res.cloudinary.com/dqdx30pbj/image/upload/v1763103629/meera_2_m5ld89.png"
      alt="Background"
      className="w-full h-full object-cover opacity-95"
      style={{ objectPosition: "20% 40%" }} // RIGHT + DOWN
    />

    {/* SOFT PINK FADE MATCHING THE WEBSITE */}
    <div className="absolute inset-0 pointer-events-none bg-gradient-to-r 
      from-[#fdf1ef] via-[#f7e3e1aa] to-transparent"></div>
  </div>

</section>


    </div>
  );
};

export default Home;
