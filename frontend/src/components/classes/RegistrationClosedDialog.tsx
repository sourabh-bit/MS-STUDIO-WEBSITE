import { useEffect, useState, type FormEvent } from "react";
import { CalendarClock, CheckCircle2, Loader2 } from "lucide-react";
import { getCountryCallingCode, isValidPhoneNumber, type CountryCode } from "libphonenumber-js";

import CountryCodeSelect from "@/components/auth/CountryCodeSelect";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import WhatsAppIcon from "@/components/icons/WhatsAppIcon";
import { useToast } from "@/hooks/use-toast";
import { WHATSAPP_NUMBERS, whatsappUrl } from "@/lib/contact";
import { DEFAULT_COUNTRY } from "@/lib/countries";
import { submitInterest } from "@/lib/interest";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const INTEREST_UPDATES_LINE = "To get updates directly on your WhatsApp and Email";

type Step = "closed" | "form" | "done";

type RegistrationClosedDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseName: string;
  variant: "online" | "offline";
  courseLabel?: string;
  whatsappNumber?: string;
  // "interest" skips the "registrations closed" message and opens straight
  // on the form — for buttons that already say "Register Interest".
  startOn?: "closed" | "interest";
};

const RequiredMark = () => <span className="text-dusty-rose">*</span>;

const RegistrationClosedDialog = ({
  open,
  onOpenChange,
  courseName,
  variant,
  courseLabel = "Offline Masterclass",
  whatsappNumber = WHATSAPP_NUMBERS.school,
  startOn = "closed",
}: RegistrationClosedDialogProps) => {
  const { toast } = useToast();
  const [step, setStep] = useState<Step>("closed");
  const [name, setName] = useState("");
  const [country, setCountry] = useState<CountryCode>(DEFAULT_COUNTRY);
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setStep(startOn === "interest" ? "form" : "closed");
    }
  }, [open, startOn]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (name.trim().length < 2) {
      toast({ title: "Enter your full name", variant: "destructive" });
      return;
    }

    if (!isValidPhoneNumber(phone, country)) {
      toast({ title: "Enter a valid WhatsApp number", variant: "destructive" });
      return;
    }

    if (!EMAIL_PATTERN.test(email.trim())) {
      toast({ title: "Enter a valid email address", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);

    try {
      await submitInterest({
        name: name.trim(),
        whatsappNumber: `+${getCountryCallingCode(country)}${phone.replace(/\D/g, "")}`,
        email: email.trim(),
        courseName,
        variant,
      });
      setStep("done");
    } catch (error) {
      toast({
        title: "Couldn't save your details",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const eyebrow = (
    <p className="text-center font-sans text-xs tracking-[0.32em] text-dusty-rose uppercase">
      {courseLabel}
    </p>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {step === "closed" && (
          <>
            <DialogHeader>
              <div className="mx-auto mb-3 flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-full border border-dusty-rose/20 bg-primary/[0.05]">
                <CalendarClock className="h-7 w-7 text-dusty-rose" />
              </div>
              {eyebrow}
              <DialogTitle className="mt-1 text-center font-serif text-2xl font-light tracking-[0.02em] text-foreground">
                Registrations Are Currently Closed
              </DialogTitle>
              <DialogDescription className="mx-auto max-w-sm text-center text-[15px] leading-relaxed">
                We're not taking new sign-ups right now, but our next batch is on its way — details
                will be updated right here soon.
              </DialogDescription>
            </DialogHeader>

            <div className="my-1 h-px bg-border/20" />

            <div className="rounded-2xl border border-dusty-rose/20 bg-primary/[0.04] px-5 py-4 text-center">
              <p className="font-sans text-[11px] tracking-[0.2em] text-muted-foreground uppercase">
                Want to be the first to know?
              </p>
              <a
                href={whatsappUrl(whatsappNumber)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center justify-center gap-2 font-serif text-lg text-foreground transition-colors duration-300 hover:text-dusty-rose"
              >
                <WhatsAppIcon className="h-4 w-4 text-[#25D366]" />
                Chat on WhatsApp
              </a>
            </div>

            <div className="mt-1 space-y-2">
              <Button className="w-full" onClick={() => setStep("form")}>
                Register Interest
              </Button>
              <p className="text-center font-sans text-xs text-muted-foreground">{INTEREST_UPDATES_LINE}</p>
            </div>
          </>
        )}

        {step === "form" && (
          <>
            <DialogHeader>
              {eyebrow}
              <DialogTitle className="mt-1 text-center font-serif text-2xl font-light tracking-[0.02em] text-foreground">
                Register Your Interest
              </DialogTitle>
              <DialogDescription className="mx-auto max-w-sm text-center text-[15px] leading-relaxed">
                {INTEREST_UPDATES_LINE} as soon as the next batch opens.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="interest-name" className="text-xs">
                  Full name <RequiredMark />
                </Label>
                <Input
                  id="interest-name"
                  className="h-9"
                  autoComplete="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="interest-whatsapp" className="text-xs">
                  WhatsApp number <RequiredMark />
                </Label>
                <div className="flex gap-2">
                  <CountryCodeSelect value={country} onChange={setCountry} />
                  <Input
                    id="interest-whatsapp"
                    className="h-9 flex-1"
                    type="tel"
                    autoComplete="tel-national"
                    placeholder="98765 43210"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="interest-email" className="text-xs">
                  Email <RequiredMark />
                </Label>
                <Input
                  id="interest-email"
                  className="h-9"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </div>

              <Button type="submit" className="mt-2 w-full" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Register Interest
              </Button>
            </form>
          </>
        )}

        {step === "done" && (
          <>
            <DialogHeader>
              <div className="mx-auto mb-3 flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-full border border-dusty-rose/20 bg-primary/[0.05]">
                <CheckCircle2 className="h-7 w-7 text-dusty-rose" />
              </div>
              {eyebrow}
              <DialogTitle className="mt-1 text-center font-serif text-2xl font-light tracking-[0.02em] text-foreground">
                You're on the List
              </DialogTitle>
              <DialogDescription className="mx-auto max-w-sm text-center text-[15px] leading-relaxed">
                Thank you! We'll send updates about the next batch to your WhatsApp and email.
              </DialogDescription>
            </DialogHeader>

            <Button className="mt-1 w-full" onClick={() => onOpenChange(false)}>
              Done
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default RegistrationClosedDialog;
