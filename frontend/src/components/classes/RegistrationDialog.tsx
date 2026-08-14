import { useEffect, useState } from "react";
import { Loader2, ShieldCheck } from "lucide-react";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { submitRegistration } from "@/lib/registration";
import type { ExperienceLevel } from "@/types/registration";

const GSTIN_PATTERN = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;

const EXPERIENCE_OPTIONS: { value: ExperienceLevel; label: string }[] = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "professional", label: "Professional" },
];

type RegistrationDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseName: string;
  variant: "online" | "offline";
  amount: number;
  onSuccess: () => void;
};

const RegistrationDialog = ({
  open,
  onOpenChange,
  courseName,
  variant,
  amount,
  onSuccess,
}: RegistrationDialogProps) => {
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel | "">("");
  const [hasGstin, setHasGstin] = useState(false);
  const [gstin, setGstin] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      setName("");
      setPhone("");
      setEmail("");
      setExperienceLevel("");
      setHasGstin(false);
      setGstin("");
      setIsSubmitting(false);
    }
  }, [open]);

  const handleSubmit = async () => {
    if (name.trim().length < 2) {
      toast({ title: "Enter your full name", variant: "destructive" });
      return;
    }

    if (phone.replace(/\D/g, "").length < 10) {
      toast({ title: "Enter a valid mobile number", variant: "destructive" });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      toast({ title: "Enter a valid email address", variant: "destructive" });
      return;
    }

    if (!experienceLevel) {
      toast({ title: "Select your experience level", variant: "destructive" });
      return;
    }

    const trimmedGstin = gstin.trim().toUpperCase();

    if (hasGstin && !GSTIN_PATTERN.test(trimmedGstin)) {
      toast({ title: "Enter a valid 15-character GSTIN", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);

    try {
      await submitRegistration({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        experienceLevel,
        gstin: hasGstin ? trimmedGstin : undefined,
        courseName,
        variant,
        amount,
      });

      onSuccess();
    } catch (error) {
      toast({
        title: "Couldn't save your details",
        description: error instanceof Error ? error.message : undefined,
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-soft-pink/50">
            <ShieldCheck className="h-6 w-6 text-dusty-rose" />
          </div>
          <DialogTitle className="text-center font-serif text-2xl">
            Tell Us About Yourself
          </DialogTitle>
          <DialogDescription className="text-center">
            A few quick details before you're taken to the secure payment page.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="reg-name">Full name</Label>
            <Input
              id="reg-name"
              placeholder="Your full name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reg-phone">Mobile number</Label>
            <Input
              id="reg-phone"
              type="tel"
              placeholder="98765 43210"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reg-email">Email address</Label>
            <Input
              id="reg-email"
              type="email"
              placeholder="you@email.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reg-experience">Experience</Label>
            <Select
              value={experienceLevel}
              onValueChange={(value) => setExperienceLevel(value as ExperienceLevel)}
            >
              <SelectTrigger id="reg-experience">
                <SelectValue placeholder="Select your experience level" />
              </SelectTrigger>
              <SelectContent>
                {EXPERIENCE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border/50 px-4 py-3">
            <div className="space-y-0.5">
              <Label htmlFor="reg-gstin-toggle">I have a GSTIN</Label>
              <p className="text-xs text-muted-foreground">
                Turn on to receive a GST invoice.
              </p>
            </div>
            <Switch id="reg-gstin-toggle" checked={hasGstin} onCheckedChange={setHasGstin} />
          </div>

          {hasGstin && (
            <div className="space-y-2">
              <Label htmlFor="reg-gstin">GSTIN</Label>
              <Input
                id="reg-gstin"
                placeholder="22AAAAA0000A1Z5"
                value={gstin}
                maxLength={15}
                onChange={(event) => setGstin(event.target.value.toUpperCase())}
                className="uppercase"
              />
            </div>
          )}

          <Button className="w-full" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Continue to Payment
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RegistrationDialog;
