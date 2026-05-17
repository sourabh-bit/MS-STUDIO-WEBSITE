import day1 from "@/assets/classes/day1.jpg";
import day2 from "@/assets/classes/day2.jpg";
import day3 from "@/assets/classes/day3.jpg";
import day4 from "@/assets/classes/day4.jpg";
import day5 from "@/assets/classes/day5.jpg";
import day6 from "@/assets/classes/day6.jpg";
import day7 from "@/assets/classes/day7.jpg";

interface DayCardProps {
  day: string;
  title: string;
  description: string;
  image: string;
  isReversed?: boolean;
}

const DayCard = ({ day, title, description, image, isReversed = false }: DayCardProps) => {
  return (
    <div className={`grid md:grid-cols-2 gap-6 md:gap-12 items-center ${isReversed ? 'md:[direction:rtl]' : ''}`}>
      {/* Image */}
      <div className="relative group md:[direction:ltr]">
        <div className="aspect-[4/5] overflow-hidden max-w-[90%] mx-auto">
          <img
            src={image}
            alt={`Day ${day} - ${title}`}
            className="w-full h-full object-cover object-top image-elegant"
          />
        </div>
        {/* Day Number Overlay */}
        <div className="absolute bottom-4 left-4 md:bottom-6 md:left-6">
          <div className="bg-background/90 backdrop-blur-sm px-4 py-3 border border-border/30">
            <p className="font-display text-xs tracking-[0.3em] uppercase text-muted-foreground">Day</p>
            <p className="font-display text-4xl md:text-5xl text-primary">{day}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="md:[direction:ltr] space-y-4 md:space-y-6">
        <div>
          <span className="font-sans text-xs tracking-[0.3em] text-dusty-rose uppercase">
            Day {day}
          </span>
          <h3 className="font-serif font-extrabold text-2xl md:text-3xl lg:text-4xl text-foreground mt-2 leading-tight">
            {title}
          </h3>
        </div>
        
        <div className="divider-elegant w-16" />
        
        <p className="text-elegant text-muted-foreground leading-relaxed">
          {description}
        </p>

        <p className="font-display text-sm tracking-[0.2em] text-dusty-rose/70 italic">
          MS Artist
        </p>
      </div>
    </div>
  );
};

const DayStructure = () => {
  const days = [
    {
      day: "01",
      title: "Learning the Core of Eye Makeup",
      description: "Understanding gradations along with learning the art of doing minimal dewy skin. Understanding how to build hues of brown to create a strong base for any kind of eye makeup.",
      image: day1,
    },
    {
      day: "02",
      title: "Skin Prep & Glamorous Transformations",
      description: "Learning how to prep skin by gaining in-depth knowledge of skin care. Tips and tricks on approaching skin with different texture, discolouration to turn dewy without excessive products. Core knowledge on how to turn a normal eye look into glamorous.",
      image: day2,
    },
    {
      day: "03",
      title: "Trend-Based & Color-Blast Eyes",
      description: "Using different products to create makeup looks based on current trends that help you deliver statement looks to your clients that are super glam yet super natural. Advance knowledge on concealing and correcting the skin. Learn how to create color-blast eyes along with all tricks on playing with colors.",
      image: day3,
    },
    {
      day: "04",
      title: "Signature Bridal Look",
      description: "Meera will teach the future of bridal makeup in this look! Her signature bridal look with beautiful eyes and skin work that is perfect for the wedding day. Learn how to play with earthy colors and tricks on how to achieve a glam avatar. Tips and tricks on sculpting the face to enhance the features.",
      image: day4,
    },
    {
      day: "05",
      title: "Fashion World & Editorial Makeup",
      description: "Kickstarting your growth in the fashion world by teaching intricate techniques flexible for shoots, and camera-friendly makeup which might just make you best friends with the model and photographers! Teaching different aspects of model-friendly makeup that is apt for shoots.",
      image: day5,
    },
    {
      day: "06",
      title: "Cocktail Glam & Signature Outer Corner",
      description: "How to create a super glam cocktail evening makeup look - Meera style! Achieve radiant and glistening glowy skin that looks like second skin with glam eyes. Learn the art of blending, adding different colors to the crease, and Meera's signature outer corner look to accentuate the eyes.",
      image: day6,
    },
    {
      day: "07",
      title: "Business, Branding & Q&A",
      description: "The most important skills to grow yourself as an artist. Meera will teach on how to create a demand for your artwork in this growing competitive industry. We mean Business - nothing less, nothing more! Learn client retention and thriving in the FUTURE OF MAKEUP. A thorough Q&A about all your makeup & business-related doubts.",
      image: day7,
    },
  ];

  return (
    <section className="py-16 md:py-24 lg:py-32 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-20">
          <span className="font-sans text-xs tracking-[0.4em] text-dusty-rose uppercase mb-4 block">
            The Journey
          </span>
          <h2 className="heading-section text-foreground mb-4 font-semibold">
            Seven Days. Seven Looks.
          </h2>
          <p className="text-elegant text-muted-foreground max-w-2xl mx-auto font-light">
            A transformative week-long experience designed to elevate your artistry 
            from fundamentals to mastery.
          </p>
        </div>

        {/* Day Cards */}
        <div className="space-y-16 md:space-y-24 lg:space-y-32">
          {days.map((day, index) => (
            <DayCard
              key={day.day}
              {...day}
              isReversed={index % 2 === 1}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default DayStructure;
