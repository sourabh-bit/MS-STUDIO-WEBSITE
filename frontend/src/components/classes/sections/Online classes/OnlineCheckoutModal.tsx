import { FormEvent, useEffect, useState } from "react";
import { LoaderCircle } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MASTERCLASS_DETAILS, formatInr } from "@/lib/masterclass";
import { initiatePayment } from "@/lib/payment";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type OnlineCheckoutModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const initialFormState = {
  fullName: "",
  email: "",
  phone: "",
};

const normalizeMobileNumber = (value: string) => {
  const digits = value.replace(/\D/g, "");

  if (digits.length === 10) {
    return digits;
  }

  if (digits.length === 11 && digits.startsWith("0")) {
    return digits.slice(1);
  }

  if (digits.length === 12 && digits.startsWith("91")) {
    return digits.slice(2);
  }

  return digits;
};

const OnlineCheckoutModal = ({ open, onOpenChange }: OnlineCheckoutModalProps) => {
  const [form, setForm] = useState(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    if (!open) {
      setForm(initialFormState);
      setIsSubmitting(false);
      setSubmitError("");
    }
  }, [open]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const response = await initiatePayment({
        customerName: form.fullName.trim(),
        email: form.email.trim(),
        mobile: normalizeMobileNumber(form.phone.trim()),
        amount: MASTERCLASS_DETAILS.fee,
        courseName: MASTERCLASS_DETAILS.courseName,
        variant: "online",
        feeLabel: MASTERCLASS_DETAILS.feeLabel,
        summaryLabel: MASTERCLASS_DETAILS.summaryLabel,
      });

      const redirectUrl = response.redirectUrl?.trim();

      if (!redirectUrl) {
        throw new Error("Payment gateway redirect URL was not returned.");
      }

      window.location.href = redirectUrl;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to initiate payment right now. Please try again.";

      setSubmitError(message);
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[36rem] border-border/40 bg-[#FCF8F4] p-0 sm:rounded-[1.75rem]">
        <div className="border-b border-border/30 bg-primary/5 px-6 py-6 sm:px-8">
          <DialogHeader className="space-y-3 text-left">
            <p className="font-sans text-xs tracking-[0.35em] text-dusty-rose uppercase">
              Secure Checkout
            </p>
            <DialogTitle className="font-serif text-3xl font-light tracking-[0.08em] uppercase text-foreground">
              Complete Your Booking
            </DialogTitle>
            <DialogDescription className="max-w-md font-sans leading-relaxed text-muted-foreground">
              Secure your spot today for the {MASTERCLASS_DETAILS.courseName}. Payment
              will be completed via ICICI Bank.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="space-y-6 px-6 py-6 sm:px-8 sm:py-8">
          <div className="rounded-[1.5rem] border border-dusty-rose/20 bg-background/85 p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-sans text-xs tracking-[0.25em] text-muted-foreground uppercase">
                  Course
                </p>
                <p className="mt-2 font-serif text-xl text-foreground">
                  {MASTERCLASS_DETAILS.courseName}
                </p>
                <p className="mt-2 font-sans text-sm text-muted-foreground">
                  {MASTERCLASS_DETAILS.summaryLabel}
                </p>
              </div>

              <div className="text-right">
                <p className="font-sans text-xs tracking-[0.25em] text-muted-foreground uppercase">
                  Price
                </p>
                <p className="mt-2 font-display text-4xl text-foreground">
                  {formatInr(MASTERCLASS_DETAILS.fee)}
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="masterclass-full-name" className="font-sans text-xs tracking-[0.18em] text-muted-foreground uppercase">
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
                  setForm((current) => ({ ...current, fullName: event.target.value }))
                }
                className="h-12 rounded-full border-border/60 bg-background/90 px-5 font-sans"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="masterclass-email" className="font-sans text-xs tracking-[0.18em] text-muted-foreground uppercase">
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
                  setForm((current) => ({ ...current, email: event.target.value }))
                }
                className="h-12 rounded-full border-border/60 bg-background/90 px-5 font-sans"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="masterclass-phone" className="font-sans text-xs tracking-[0.18em] text-muted-foreground uppercase">
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
                  setForm((current) => ({ ...current, phone: event.target.value }))
                }
                className="h-12 rounded-full border-border/60 bg-background/90 px-5 font-sans"
              />
            </div>

            <div className="rounded-[1.25rem] border border-border/40 bg-primary/5 px-4 py-3 text-center">
              <p className="font-sans text-xs tracking-[0.18em] text-muted-foreground uppercase">
                {MASTERCLASS_DETAILS.trustLine}
              </p>
            </div>

            {submitError && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {submitError}
              </div>
            )}

            <button
              id="icici-final-pay-btn"
              type="submit"
              disabled={isSubmitting}
              data-course={MASTERCLASS_DETAILS.courseName}
              data-price={String(MASTERCLASS_DETAILS.fee)}
              data-full-name={form.fullName}
              data-email={form.email}
              data-phone={form.phone}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-4 font-sans text-sm tracking-[0.2em] text-primary-foreground uppercase transition-all duration-300 hover:bg-dusty-rose disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
              {isSubmitting ? "Redirecting..." : "Proceed to Payment"}
            </button>

            <p className="text-center font-sans text-sm text-muted-foreground">
              Instant confirmation {"\u2022"} Only limited seats available
            </p>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OnlineCheckoutModal;
