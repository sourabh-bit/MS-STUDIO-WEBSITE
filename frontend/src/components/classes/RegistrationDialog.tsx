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
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { submitRegistration } from "@/lib/registration";

const GSTIN_PATTERN = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;
const PAN_PATTERN = /^[A-Z]{5}[0-9]{4}[A-Z]$/;

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
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [instagramHandle, setInstagramHandle] = useState("");
  const [experienceMonths, setExperienceMonths] = useState("");
  const [pan, setPan] = useState("");
  const [hasGstin, setHasGstin] = useState(false);
  const [gstin, setGstin] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setName(user?.name ?? "");
      setPhone(user?.phone ?? "");
      setEmail(user?.email ?? "");
      setCity("");
      setState("");
      setInstagramHandle("");
      setExperienceMonths("");
      setPan("");
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

    if (!instagramHandle.trim()) {
      toast({ title: "Instagram handle is mandatory", variant: "destructive" });
      return;
    }

    const trimmedPan = pan.trim().toUpperCase();

    if (!PAN_PATTERN.test(trimmedPan)) {
      toast({ title: "Enter a valid 10-character PAN", variant: "destructive" });
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
        city: city.trim() || undefined,
        state: state.trim() || undefined,
        instagramHandle: instagramHandle.trim(),
        experienceMonths: experienceMonths.trim() ? Number(experienceMonths) : undefined,
        pan: trimmedPan,
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

        <div className="max-h-[70vh] space-y-2.5 overflow-y-auto pr-1">
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

          <div className="grid grid-cols-2 gap-2.5">
            <div className="space-y-1">
              <Label htmlFor="reg-city" className="text-xs">
                City
              </Label>
              <Input
                id="reg-city"
                className="h-9"
                placeholder="Mumbai"
                value={city}
                onChange={(event) => setCity(event.target.value)}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="reg-state" className="text-xs">
                State
              </Label>
              <Input
                id="reg-state"
                className="h-9"
                placeholder="Maharashtra"
                value={state}
                onChange={(event) => setState(event.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="reg-instagram" className="text-xs">
              Instagram handle
            </Label>
            <Input
              id="reg-instagram"
              className="h-9"
              placeholder="@yourhandle"
              value={instagramHandle}
              onChange={(event) => setInstagramHandle(event.target.value)}
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="reg-experience" className="text-xs">
              Experience (in months)
            </Label>
            <Input
              id="reg-experience"
              className="h-9"
              type="number"
              min={0}
              placeholder="e.g. 6"
              value={experienceMonths}
              onChange={(event) => setExperienceMonths(event.target.value)}
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="reg-pan" className="text-xs">
              PAN card number
            </Label>
            <Input
              id="reg-pan"
              className="h-9 uppercase"
              placeholder="ABCDE1234F"
              maxLength={10}
              value={pan}
              onChange={(event) => setPan(event.target.value.toUpperCase())}
            />
            <p className="text-[11px] text-muted-foreground">
              If you're a minor, enter your guardian's PAN instead.
            </p>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border/50 px-3 py-2">
            <div className="space-y-0">
              <Label htmlFor="reg-gstin-toggle" className="text-xs">
                Do you want a GST invoice?
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
