import portfolioImage from "@/assets/classes/portfolio.jpg";
import benefitsImage from "@/assets/classes/benefits.jpg";
import portfolio2Image from "@/assets/classes/portfolio2.jpg";
import day5Image from "@/assets/classes/day5.jpg";
import { MASTERCLASS_DETAILS, formatInr } from "@/lib/masterclass";

const BONUS_VALUE = 100000;

const BONUSES = [
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
    description: "Insights on how Meera built her name — from positioning to personal storytelling that makes your brand memorable."
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

// Staggered collage beside the list, as in the notebook sketch: the second
// column sits lower than the first.
const PHOTOS = [
  { src: portfolioImage, alt: "Bridal makeup by Meera Sakhrani" },
  { src: portfolio2Image, alt: "South Indian bridal look by Meera Sakhrani" },
  { src: benefitsImage, alt: "Editorial evening makeup by Meera Sakhrani" },
  { src: day5Image, alt: "Soft glam bridal makeup by Meera Sakhrani" },
];

const Photo = ({ src, alt }: { src: string; alt: string }) => (
  <div className="relative">
    <div className="absolute -inset-2 border border-[#c9a96e]/25" />
    <div className="relative aspect-[3/4] overflow-hidden">
      <img src={src} alt={alt} loading="lazy" className="h-full w-full object-cover object-top" />
    </div>
  </div>
);

const BonusTakeaways = () => {
  return (
    <section className="relative overflow-hidden bg-[#4A2430] py-10 text-[#F8F3EB] md:py-24 lg:py-28">
      {/* Soft tonal lift so the burgundy isn't one flat block */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.06),transparent_60%)]" />

      <div className="container relative mx-auto px-5 sm:px-4">
        {/* Section Header */}
        <div className="mb-8 text-center md:mb-16">
          <span className="mb-3 block font-sans text-[11px] tracking-[0.3em] sm:text-xs sm:tracking-[0.4em] md:mb-4 text-[#c9a96e] uppercase">
            Exclusive Masterclass Benefits
          </span>
          <h2 className="font-display text-[32px] font-light leading-tight tracking-tight text-[#F8F3EB] sm:text-4xl md:text-6xl">
            What You'll Take Away
          </h2>
          <div className="mx-auto my-4 flex items-center justify-center gap-3 md:my-8">
            <span className="h-px w-12 bg-[#c9a96e]/60 md:w-20" />
            <span className="h-1.5 w-1.5 rotate-45 bg-[#c9a96e]" />
            <span className="h-px w-12 bg-[#c9a96e]/60 md:w-20" />
          </div>
          <p className="font-serif text-[22px] text-[#c9a96e] md:text-3xl">
            Worth {formatInr(BONUS_VALUE)}+
          </p>
          <p className="mt-1.5 font-sans text-[11px] tracking-[0.12em] text-[#F8F3EB]/70 uppercase sm:text-xs sm:tracking-[0.15em] md:mt-2 md:text-sm">
            Included in your {formatInr(MASTERCLASS_DETAILS.baseFee)} Masterclass
          </p>
        </div>

        <div className="grid gap-10 lg:grid-cols-[7fr_5fr] lg:gap-16 xl:gap-24">
          {/* Numbered list */}
          <ol className="border-t border-[#c9a96e]/20">
            {BONUSES.map((bonus, index) => (
              <li
                key={bonus.title}
                className="group flex gap-4 border-b border-[#c9a96e]/20 py-4 transition-colors duration-300 hover:bg-white/[0.03] sm:py-5 md:gap-8 md:py-7"
              >
                <span className="w-7 flex-shrink-0 pt-0.5 font-display text-base text-[#c9a96e]/80 transition-colors duration-300 group-hover:text-[#c9a96e] md:w-10 md:pt-1 md:text-xl">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="mb-1 font-serif text-lg leading-snug text-[#F8F3EB] sm:text-xl md:mb-2 md:text-2xl">
                    {bonus.title}
                  </h3>
                  <p className="font-sans text-sm leading-relaxed text-[#F8F3EB]/75 md:text-base">
                    {bonus.description}
                  </p>
                </div>
              </li>
            ))}
          </ol>

          {/* Photo collage */}
          <div className="mx-auto grid w-full max-w-xs grid-cols-2 gap-4 self-center px-2 sm:max-w-none md:grid-cols-4 md:gap-6 lg:grid-cols-2 lg:gap-8">
            <div className="space-y-4 md:contents md:space-y-0 lg:block lg:space-y-8">
              <Photo {...PHOTOS[0]} />
              <Photo {...PHOTOS[2]} />
            </div>
            <div className="mt-8 space-y-4 md:contents md:space-y-0 lg:mt-16 lg:block lg:space-y-8">
              <Photo {...PHOTOS[1]} />
              <Photo {...PHOTOS[3]} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BonusTakeaways;
