import { Phone, CreditCard, Building2, Landmark } from "lucide-react";

const PaymentSection = () => {
  const bankDetails = [
    { label: "Account Name", value: "Sakhrani Styling School" },
    { label: "Account Number", value: "922020067559807" },
    { label: "Account Type", value: "Current Account (C/A)" },
    { label: "IFSC Code", value: "UTIB0000131" },
    { label: "Branch", value: "DLF Gurgaon" },
  ];

  return (
    <section id="enroll" className="py-16 md:py-24 lg:py-5 section-cream bg-pattern-soft">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <span className="font-sans text-xs tracking-[0.4em] text-dusty-rose uppercase mb-4 block">
            Investment
          </span>
          <h2 className="heading-section text-foreground mb-4 font-extrabold">
            Payment Structure
          </h2>
          <p className="text-elegant text-muted-foreground max-w-2xl mx-auto">
            Secure your seat in this transformative masterclass
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
          {/* Course Fee */}
          <div className="bg-background p-8 md:p-10 border border-border/30 text-center">
            <div className="w-16 h-16 bg-soft-pink/50 rounded-full flex items-center justify-center mx-auto mb-6">
              <CreditCard className="w-8 h-8 text-dusty-rose" />
            </div>
            <p className="font-sans text-xs tracking-[0.3em] uppercase text-muted-foreground mb-2">
              Total Course Fee
            </p>
            <p className="font-display text-5xl md:text-6xl text-foreground mb-2">
              ₹2 to ₹3<span className="text-2xl">L</span>
            </p>
            <p className="font-sans text-sm text-muted-foreground">
              For the entire 7-day course
            </p>
          </div>

          {/* Booking Amount */}
          <div className="bg-primary/5 p-8 md:p-10 border border-dusty-rose/30 text-center">
            <div className="w-16 h-16 bg-dusty-rose/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Landmark className="w-8 h-8 text-dusty-rose" />
            </div>
            <p className="font-sans text-xs tracking-[0.3em] uppercase text-muted-foreground mb-2">
              Booking Amount
            </p>
            <p className="font-display text-5xl md:text-6xl text-dusty-rose mb-2">
              ₹1<span className="text-2xl">L</span>
            </p>
            <p className="font-sans text-sm text-muted-foreground">
              To secure your seat
            </p>
          </div>
        </div>

        {/* Bank Details */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-background border border-border/30 overflow-hidden">
            <div className="p-6 bg-secondary/30 border-b border-border/30 flex items-center gap-3 justify-center">
              <Building2 className="w-5 h-5 text-dusty-rose" />
              <h3 className="font-serif text-xl text-foreground">
                Payment Details
              </h3>
            </div>
            
            <div className="p-6 md:p-8 space-y-4">
              {bankDetails.map((detail, index) => (
                <div 
                  key={index}
                  className="flex justify-between items-center py-3 border-b border-border/20 last:border-b-0"
                >
                  <span className="font-sans text-sm text-muted-foreground">
                    {detail.label}
                  </span>
                  <span className="font-serif text-foreground">
                    {detail.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div className="mt-8 p-6 bg-white border border-dusty-rose/20 text-center">
            <p className="font-sans text-sm text-muted-foreground mb-3">
              For queries and booking confirmation
            </p>
            <a 
              href="tel:+919818793850"
              className="inline-flex items-center gap-3 font-serif text-xl text-foreground hover:text-dusty-rose transition-colors duration-300"
            >
              <Phone className="w-5 h-5" />
              +91 98187 93850
            </a>
          </div>

          {/* Note */}
          <p className="text-center text-sm text-muted-foreground mt-6 italic">
            Seats are limited and blocked on a first-come, first-serve basis.
          </p>
        </div>
      </div>
    </section>
  );
};

export default PaymentSection;
