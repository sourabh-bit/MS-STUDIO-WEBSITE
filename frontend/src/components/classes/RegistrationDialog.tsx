import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

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
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { submitRegistration } from "@/lib/registration";
import type { ExperienceLevel } from "@/types/registration";

const GSTIN_PATTERN = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;

const EXPERIENCE_OPTIONS: { value: ExperienceLevel; label: string }[] = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
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
  const { user } = useAuth();
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel | "">("");
  const [hasGstin, setHasGstin] = useState(false);
  const [gstin, setGstin] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setName(user?.name ?? "");
      setPhone(user?.phone ?? "");
      setEmail(user?.email ?? "");
      setExperienceLevel("");
      setHasGstin(false);
      setGstin("");
      setIsSubmitting(false);
    }
  }, [open, user]);

  const handleSubmit = async () => {
    if (name.trim().length < 2) {
      toast({ title: "Name is mandatory", variant: "destructive" });
      return;
    }

    if (phone.replace(/\D/g, "").length < 10) {
      toast({ title: "Mobile number is mandatory", variant: "destructive" });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      toast({ title: "Enter a valid email address", variant: "destructive" });
      return;
    }

    if (!experienceLevel) {
      toast({ title: "Experience level is mandatory", variant: "destructive" });
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="space-y-1">
          <DialogTitle className="font-serif text-xl">Tell Us About Yourself</DialogTitle>
          <DialogDescription className="text-xs">
            A few quick details before you're taken to the secure payment page.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2.5">
          <div className="space-y-1">
            <Label htmlFor="reg-name" className="text-xs">
              Full name
            </Label>
            <Input
              id="reg-name"
              className="h-9"
              placeholder="Your full name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              autoFocus
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="reg-phone" className="text-xs">
              Mobile number
            </Label>
            <Input
              id="reg-phone"
              className="h-9"
              type="tel"
              placeholder="98765 43210"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="reg-email" className="text-xs">
              Email address
            </Label>
            <Input
              id="reg-email"
              className="h-9"
              type="email"
              placeholder="you@email.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="reg-experience" className="text-xs">
              Experience
            </Label>
            <Select
              value={experienceLevel}
              onValueChange={(value) => setExperienceLevel(value as ExperienceLevel)}
            >
              <SelectTrigger id="reg-experience" className="h-9">
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

          <div className="flex items-center justify-between rounded-lg border border-border/50 px-3 py-2">
            <div className="space-y-0">
              <Label htmlFor="reg-gstin-toggle" className="text-xs">
                I have a GSTIN
              </Label>
              <p className="text-[11px] text-muted-foreground">Turn on for a GST invoice.</p>
            </div>
            <Switch id="reg-gstin-toggle" checked={hasGstin} onCheckedChange={setHasGstin} />
          </div>

          {hasGstin && (
            <div className="space-y-1">
              <Label htmlFor="reg-gstin" className="text-xs">
                GSTIN
              </Label>
              <Input
                id="reg-gstin"
                className="h-9 uppercase"
                placeholder="22AAAAA0000A1Z5"
                value={gstin}
                maxLength={15}
                onChange={(event) => setGstin(event.target.value.toUpperCase())}
              />
            </div>
          )}

          <Button className="h-10 w-full" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Continue to Payment
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RegistrationDialog;
