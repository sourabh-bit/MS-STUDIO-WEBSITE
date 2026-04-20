import { FormEvent, useState } from "react";
import { ArrowLeft, Check, Lock, Phone } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatInr, getMasterclassPaymentDetails } from "@/lib/masterclass";

const initialFormState = {
  fullName: "",
  email: "",
  phone: "",
};

const onlineIncludedItems = [
  "Premium hands-on training",
  "Live demonstration",
  "Certificate included",
];

const offlineIncludedItems = [
  "7-day immersive bridal artistry training",
  "Hands-on guidance with Meera Sakhrani",
  "Certificate included",
];

const MasterclassCheckout = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState(initialFormState);
  const paymentDetails = getMasterclassPaymentDetails(searchParams);
  const includedItems =
    paymentDetails.variant === "offline"
      ? offlineIncludedItems
      : onlineIncludedItems;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate("/classes");
  };

  return (
    <section className="min-h-screen bg-[#F8F3EB] py-6 sm:py-8 md:py-12 lg:py-16">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-6xl">
          <button
            type="button"
            onClick={handleBack}
            className="mb-6 inline-flex items-center gap-2 font-sans text-xs tracking-[0.2em] text-foreground/70 uppercase transition-colors duration-300 hover:text-dusty-rose"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Classes
          </button>

          <div className="overflow-hidden rounded-[2rem] border border-border/30 bg-background/70 shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
            <div className="grid gap-px bg-border/20 lg:grid-cols-[minmax(0,0.4fr)_minmax(0,0.6fr)] lg:items-stretch">
              <div className="flex h-full flex-col justify-center bg-primary/[0.05] px-5 py-7 sm:px-8 sm:py-8 md:px-10 md:py-10 lg:px-12 lg:py-12">
                <div className="mx-auto w-full max-w-[26rem] space-y-8 lg:mx-0">
                  <div className="space-y-4">
                    <p className="font-sans text-xs tracking-[0.35em] text-dusty-rose uppercase">
                      Secure Checkout
                    </p>

                    <h1 className="font-serif text-3xl font-light tracking-[0.08em] text-foreground uppercase sm:text-4xl">
                      Complete Your Booking
                    </h1>

                    <p className="max-w-[25rem] font-sans leading-relaxed text-muted-foreground">
                      Reserve your place with a clean, secure payment flow
                      designed to feel effortless on both desktop and mobile.
                    </p>
                  </div>

                  <div className="rounded-[1.75rem] border border-foreground/5 bg-background/90 p-6 shadow-[0_10px_30px_rgba(0,0,0,0.04)] transition-all duration-300 lg:hover:-translate-y-0.5 lg:hover:shadow-elegant">
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <span className="inline-flex rounded-full border border-dusty-rose/25 bg-primary/[0.04] px-3 py-1.5 font-sans text-[10px] tracking-[0.22em] text-muted-foreground uppercase">
                          {paymentDetails.variant === "offline"
                            ? "Offline Access"
                            : "Masterclass Access"}
                        </span>

                        <p className="font-sans text-xs tracking-[0.25em] text-muted-foreground uppercase">
                          Course
                        </p>
                        <p className="font-serif text-2xl leading-tight text-foreground sm:text-[2rem]">
                          {paymentDetails.courseName}
                        </p>
                        <p className="max-w-[18rem] font-sans text-sm leading-relaxed text-muted-foreground">
                          {paymentDetails.summaryLabel}
                        </p>
                      </div>

                      <div className="space-y-3 border-t border-border/20 pt-5">
                        <p className="font-sans text-xs tracking-[0.25em] text-muted-foreground uppercase">
                          What You Get
                        </p>

                        <div className="space-y-3">
                          {includedItems.map((item) => (
                            <div key={item} className="flex items-center gap-3">
                              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/[0.08] text-dusty-rose">
                                <Check className="h-3.5 w-3.5" />
                              </span>
                              <span className="font-sans text-sm text-foreground/80">
                                {item}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-3 border-t border-border/20 pt-5">
                        <p className="font-sans text-xs tracking-[0.25em] text-muted-foreground uppercase">
                          Price
                        </p>
                        <p className="font-display text-5xl leading-none text-foreground sm:text-6xl">
                          {formatInr(paymentDetails.fee)}
                        </p>
                        <p className="font-sans text-xs tracking-[0.18em] text-muted-foreground uppercase">
                          {paymentDetails.feeLabel}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex h-full flex-col justify-center bg-background/95 px-5 py-7 sm:px-8 sm:py-8 md:px-10 md:py-10 lg:px-12 lg:py-12">
                <div className="mx-auto w-full max-w-[33rem]">
                  <div className="mb-6 space-y-2">
                    <p className="font-sans text-xs tracking-[0.3em] text-muted-foreground uppercase">
                      Your Details
                    </p>
                    <p className="max-w-md font-sans text-sm leading-relaxed text-muted-foreground">
                      Fill in your details below to continue to secure payment.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="masterclass-full-name"
                        className="font-sans text-xs tracking-[0.18em] text-muted-foreground uppercase"
                      >
                        Full Name
                      </Label>
                      <Input
                        id="masterclass-full-name"
                        name="fullName"
                        type="text"
                        autoComplete="name"
                        required
                        value={form.fullName}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            fullName: event.target.value,
                          }))
                        }
                        className="h-11 rounded-full border border-border/70 bg-primary/[0.03] px-5 font-sans text-sm transition-all duration-300 focus-visible:border-dusty-rose/40 focus-visible:ring-4 focus-visible:ring-secondary/20"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label
                        htmlFor="masterclass-email"
                        className="font-sans text-xs tracking-[0.18em] text-muted-foreground uppercase"
                      >
                        Email
                      </Label>
                      <Input
                        id="masterclass-email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={form.email}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            email: event.target.value,
                          }))
                        }
                        className="h-11 rounded-full border border-border/70 bg-primary/[0.03] px-5 font-sans text-sm transition-all duration-300 focus-visible:border-dusty-rose/40 focus-visible:ring-4 focus-visible:ring-secondary/20"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label
                        htmlFor="masterclass-phone"
                        className="font-sans text-xs tracking-[0.18em] text-muted-foreground uppercase"
                      >
                        Phone Number
                      </Label>
                      <Input
                        id="masterclass-phone"
                        name="phone"
                        type="tel"
                        autoComplete="tel"
                        required
                        value={form.phone}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            phone: event.target.value,
                          }))
                        }
                        className="h-11 rounded-full border border-border/70 bg-primary/[0.03] px-5 font-sans text-sm transition-all duration-300 focus-visible:border-dusty-rose/40 focus-visible:ring-4 focus-visible:ring-secondary/20"
                      />
                    </div>

                    <div className="border-t border-border/20 pt-4">
                      <div className="rounded-full border border-dusty-rose/20 bg-primary/[0.05] px-4 py-3 text-center">
                        <p className="flex items-center justify-center gap-2 font-sans text-xs tracking-[0.18em] text-foreground/80 uppercase">
                          <Lock className="h-3.5 w-3.5" />
                          {paymentDetails.trustLine}
                        </p>
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        id="icici-final-pay-btn"
                        type="submit"
                        data-course={paymentDetails.courseName}
                        data-price={String(paymentDetails.fee)}
                        data-full-name={form.fullName}
                        data-email={form.email}
                        data-phone={form.phone}
                        className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary to-dusty-rose px-6 py-4 font-sans text-sm tracking-[0.2em] text-primary-foreground uppercase shadow-[0_8px_20px_rgba(150,100,120,0.2)] transition-all duration-300 hover:brightness-[0.98] hover:shadow-elegant"
                      >
                        <Lock className="h-4 w-4" />
                        Proceed to Payment
                      </button>

                      <p className="mt-4 text-center font-sans text-sm text-foreground/70">
                        Instant confirmation {"\u2022"} Only limited seats available
                      </p>

                      <a
                        href="tel:+919818793850"
                        className="mt-5 inline-flex w-full items-center justify-center gap-3 font-sans text-sm tracking-[0.05em] text-foreground/80 transition-colors duration-300 hover:text-dusty-rose sm:w-auto"
                      >
                        <Phone className="h-4 w-4" />
                        Need assistance? +91 98187 93850
                      </a>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MasterclassCheckout;
