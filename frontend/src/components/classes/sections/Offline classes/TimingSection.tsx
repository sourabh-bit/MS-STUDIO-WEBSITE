import { Clock, Calendar, Coffee } from "lucide-react";

const TimingSection = () => {
  const schedule = [
    { time: "10:00 AM – 10:30 AM", activity: "Theory", description: "Foundation concepts and techniques" },
    { time: "10:30 AM – 1:30 PM", activity: "Demo", description: "Live demonstration by Meera" },
    { time: "1:30 PM – 2:00 PM", activity: "Doubts Session", description: "Clear your questions" },
    { time: "2:00 PM – 2:30 PM", activity: "Lunch", description: "Complimentary lunch on us" },
    { time: "2:30 PM – 5:00 PM", activity: "Practice/Portfolio", description: "Hands-on practice session" },
    { time: "5:00 PM – 6:00 PM", activity: "Shoot", description: "Professional portfolio shoot" },
    { time: "6:00 PM", activity: "Dispersal", description: "End of day" },
  ];

  const highlights = [
    "All your doubts will be cleared during the class",
    "100% hands-on practice and personal attention",
    "Lunch will be on us!"
  ];

  return (
    <section className="py-16 md:py-24 lg:py-32 section-cream bg-pattern-soft ">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <span className="font-sans text-xs tracking-[0.4em] text-dusty-rose uppercase mb-4 block">
            Your Day
          </span>
          <h2 className="heading-section text-foreground mb-4">
            Class Details & Timings
          </h2>
        </div>

        {/* Class Info Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12 md:mb-16">
          <div className="bg-background p-6 md:p-8 text-center border border-border/30">
            <Calendar className="w-8 h-8 text-dusty-rose mx-auto mb-4" />
            <p className="font-sans text-xs tracking-[0.2em] uppercase text-muted-foreground mb-2">Date</p>
            <p className="font-serif text-xl text-foreground">12 – 18 May 2025</p>
          </div>
          <div className="bg-background p-6 md:p-8 text-center border border-border/30">
            <Clock className="w-8 h-8 text-dusty-rose mx-auto mb-4" />
            <p className="font-sans text-xs tracking-[0.2em] uppercase text-muted-foreground mb-2">Timings</p>
            <p className="font-serif text-xl text-foreground">10:00 AM – 6:00 PM IST</p>
          </div>
          <div className="bg-background p-6 md:p-8 text-center border border-border/30">
            <Coffee className="w-8 h-8 text-dusty-rose mx-auto mb-4" />
            <p className="font-sans text-xs tracking-[0.2em] uppercase text-muted-foreground mb-2">Beginner Session</p>
            <p className="font-serif text-xl text-foreground">8:00 AM – 10:00 AM*</p>
            <p className="font-sans text-xs text-muted-foreground mt-2">*From Day 2 onwards</p>
          </div>
        </div>

        {/* Time Structure */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-background border border-border/30 overflow-hidden">
            <div className="p-6 md:p-8 bg-[hsl(var(--soft-pink))]/30 border-b border-border/30 ">
              <h3 className="font-serif text-2xl text-foreground text-center">
                Daily Time Structure
              </h3>
            </div>
            
            <div className="divide-y divide-border/30">
              {schedule.map((item, index) => (
                <div 
                  key={index}
                  className="grid md:grid-cols-3 gap-4 p-6 hover:bg-soft-pink/20 transition-colors duration-300"
                >
                  <div className="font-display text-lg text-dusty-rose">
                    {item.time}
                  </div>
                  <div className="font-serif text-foreground">
                    {item.activity}
                  </div>
                  <div className="font-sans text-sm text-muted-foreground">
                    {item.description}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Highlights */}
          <div className="mt-8 md:mt-12 p-6 md:p-8 bg-background border border-dustyRose-300">
  <h4 className="font-serif text-xl text-foreground mb-6 text-center">
    What to Expect
  </h4>

  <div className="grid md:grid-cols-3 gap-4">
    {highlights.map((highlight, index) => (
      <div key={index} className="flex items-center gap-3">

        {/* Pink Dot + Ring */}
        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#F3D7DE] flex items-center justify-center">
          <span className="w-2 h-2 rounded-full bg-[#D9A7B0]"></span>
        </span>

        <p className="font-sans text-sm text-foreground">{highlight}</p>
      </div>
    ))}
  </div>
</div>


          {/* Note */}
          <p className="text-center text-sm text-muted-foreground mt-6 italic">
            Note: The duration of each class depends on the kind of look we are doing during the session.
          </p>
        </div>
      </div>
    </section>
  );
};

export default TimingSection;
