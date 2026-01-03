import { Phone, Clock, Calendar, Monitor, CreditCard, Building2 } from "lucide-react";

const OnlinePaymentSection = () => {
  const classDetails = [
    { icon: Calendar, label: "Date", value: "14th December 2025" },
    { icon: Clock, label: "Time", value: "12:00 PM - 4:00 PM IST" },
    { icon: Monitor, label: "Mode", value: "Online (LIVE)" },
  ];

  const bankDetails = [
    { label: "Account Name", value: "Meera Sakhrani Beauty" },
    { label: "Account Number", value: "022505006798" },
    { label: "IFSC Code", value: "ICIC0000225" },
    { label: "Bank", value: "ICICI Bank" },
  ];

  return (
    <section id="enroll-online" className="py-16 md:py-24 lg:py-32 bg-[#F8F3EB]">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <span className="font-sans text-xs tracking-[0.4em] text-dusty-rose uppercase mb-4 block">
            Investment
          </span>
          <h2 className="heading-section text-foreground mb-4">
            Class Details & Payment
          </h2>
        </div>

        {/* Class Info Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12 md:mb-16 max-w-4xl mx-auto">
          {classDetails.map((detail, index) => (
            <div key={index} className="bg-background p-6 md:p-8 text-center border border-border/30">
              <detail.icon className="w-8 h-8 text-dusty-rose mx-auto mb-4" />
              <p className="font-sans text-xs tracking-[0.2em] uppercase text-muted-foreground mb-2">
                {detail.label}
              </p>
              <p className="font-serif text-xl text-foreground">{detail.value}</p>
            </div>
          ))}
        </div>

        {/* Pricing Card */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="bg-primary/5 p-8 md:p-12 border border-dusty-rose/30 text-center">
            <div className="w-20 h-20 bg-dusty-rose/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CreditCard className="w-10 h-10 text-dusty-rose" />
            </div>
            <p className="font-sans text-xs tracking-[0.3em] uppercase text-muted-foreground mb-2">
              Course Fee
            </p>
            <p className="font-display text-5xl md:text-6xl lg:text-7xl text-foreground mb-2">
              ₹12,000
            </p>
            <p className="font-sans text-lg text-muted-foreground mb-4">
              + GST
            </p>
            <p className="font-serif text-lg text-dusty-rose">
              4-Hour Live Online Masterclass
            </p>
            <div className="mt-6 pt-6 border-t border-dusty-rose/20">
              <p className="font-display text-sm text-muted-foreground">
                Bonus Takeaways Worth ₹1,00,000+ Included!
              </p>
            </div>
          </div>
        </div>

        {/* Bank Details */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-background border border-border/30 overflow-hidden">
            <div className="p-6 bg-secondary/50 border-b border-border/30 flex items-center gap-3 justify-center">
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
          <div className="mt-8 p-6 bg-dusty-rose/10 border border-dusty-rose/20 text-center">
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
            Limited spots available. Secure your seat today!
          </p>
        </div>
      </div>
    </section>
  );
};

export default OnlinePaymentSection;
