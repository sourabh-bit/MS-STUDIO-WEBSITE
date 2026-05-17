import { Building2, Calendar, Clock, CreditCard, Monitor, Phone } from "lucide-react";
import { MASTERCLASS_DETAILS, formatInr } from "@/lib/masterclass";

type OnlinePaymentSectionProps = {
  onOpenCheckout: () => void;
};

const OnlinePaymentSection = ({ onOpenCheckout }: OnlinePaymentSectionProps) => {
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
        <div className="text-center mb-12 md:mb-16">
          <span className="font-sans text-xs tracking-[0.4em] text-dusty-rose uppercase mb-4 block">
            Investment
          </span>
          <h2 className="heading-section text-foreground mb-4">
            Class Details & Payment
          </h2>
        </div>

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

        <div className="max-w-2xl mx-auto mb-12">
          <div className="bg-primary/5 p-8 md:p-12 border border-dusty-rose/30 text-center">
            <div className="w-20 h-20 bg-dusty-rose/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CreditCard className="w-10 h-10 text-dusty-rose" />
            </div>
            <p className="font-sans text-xs tracking-[0.3em] uppercase text-muted-foreground mb-2">
              {MASTERCLASS_DETAILS.feeLabel}
            </p>
            <p className="font-display text-5xl md:text-6xl lg:text-7xl text-foreground mb-2">
              {formatInr(MASTERCLASS_DETAILS.fee)}
            </p>
            <p className="font-serif text-lg text-dusty-rose mb-3">
              {MASTERCLASS_DETAILS.summaryLabel}
            </p>
            <p className="font-sans text-sm tracking-[0.16em] uppercase text-muted-foreground">
              {MASTERCLASS_DETAILS.trustLine}
            </p>
            <div className="mt-8 pt-6 border-t border-dusty-rose/20">
              <button
                type="button"
                onClick={onOpenCheckout}
                data-course={MASTERCLASS_DETAILS.courseName}
                data-price={String(MASTERCLASS_DETAILS.fee)}
                data-payment-trigger="section"
                className="w-full sm:w-auto rounded-full border border-primary/10 bg-primary px-8 py-4 font-sans text-sm tracking-[0.2em] uppercase text-primary-foreground transition-all duration-300 hover:bg-dusty-rose"
              >
                Pay Securely
              </button>
              <p className="mt-4 font-sans text-sm text-muted-foreground">
                Instant confirmation {"\u2022"} Limited seats available
              </p>
              <p className="mt-2 font-sans text-sm text-muted-foreground/90">
                Secure your spot today
              </p>
            </div>
          </div>
        </div>

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

          <p className="text-center text-sm text-muted-foreground mt-6 italic">
            Limited spots available. Secure your seat today!
          </p>
        </div>
      </div>
    </section>
  );
};

export default OnlinePaymentSection;
