import { useEffect, useState } from "react";
import { Info, Loader2 } from "lucide-react";

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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { INDIAN_STATES } from "@/lib/indian-states";
import { submitRegistration } from "@/lib/registration";

const GSTIN_PATTERN = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;
const PAN_PATTERN = /^[A-Z]{5}[0-9]{4}[A-Z]$/;

// Marks a mandatory field's label — kept as one small shared element so
// every required field gets the same visual treatment.
const RequiredMark = () => <span className="text-dusty-rose">*</span>;

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
  const [billerName, setBillerName] = useState("");
  const [address, setAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showBillerInfo, setShowBillerInfo] = useState(false);

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
      setBillerName("");
      setAddress("");
      setShowBillerInfo(false);
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

    if (!city.trim()) {
      toast({ title: "City is mandatory", variant: "destructive" });
      return;
    }

    if (!state) {
      toast({ title: "State is mandatory", variant: "destructive" });
      return;
    }

    const trimmedPan = pan.trim().toUpperCase();

    if (!PAN_PATTERN.test(trimmedPan)) {
      toast({ title: "Enter a valid 10-character PAN", variant: "destructive" });
      return;
    }

    const trimmedGstin = gstin.trim().toUpperCase();
    const trimmedBillerName = billerName.trim();
    const trimmedAddress = address.trim();

    if (hasGstin) {
      if (!GSTIN_PATTERN.test(trimmedGstin)) {
        toast({ title: "Enter a valid 15-character GSTIN", variant: "destructive" });
        return;
      }

      if (!trimmedBillerName) {
        toast({ title: "Enter the biller name for your GST invoice", variant: "destructive" });
        return;
      }

      if (!trimmedAddress) {
        toast({ title: "Enter the billing address for your GST invoice", variant: "destructive" });
        return;
      }
    }

    setIsSubmitting(true);

    try {
      await submitRegistration({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        city: city.trim(),
        state,
        instagramHandle: instagramHandle.trim() || undefined,
        experienceMonths: experienceMonths.trim() ? Number(experienceMonths) : undefined,
        pan: trimmedPan,
        gstin: hasGstin ? trimmedGstin : undefined,
        billerName: hasGstin ? trimmedBillerName : undefined,
        address: hasGstin ? trimmedAddress : undefined,
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
              Full name <RequiredMark />
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
              Mobile number <RequiredMark />
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
              Email address <RequiredMark />
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
                City <RequiredMark />
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
                State <RequiredMark />
              </Label>
              <Select value={state} onValueChange={setState}>
                <SelectTrigger id="reg-state" className="h-9">
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  {INDIAN_STATES.map((option) => (
                    <SelectItem key={option.code} value={option.name}>
                      {option.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="reg-instagram" className="text-xs">
              Instagram handle
            </Label>
            <Input
              id="reg-instagram"
              className="h-9"
              placeholder="@yourhandle (optional)"
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
              PAN card number <RequiredMark />
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
            <div className="space-y-2.5 rounded-lg border border-border/50 p-3">
              <div className="space-y-1">
                <Label htmlFor="reg-gstin" className="text-xs">
                  GSTIN <RequiredMark />
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

              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <Label htmlFor="reg-biller-name" className="text-xs">
                    Biller name <RequiredMark />
                  </Label>
                  <Popover open={showBillerInfo} onOpenChange={setShowBillerInfo}>
                    <PopoverTrigger
                      type="button"
                      className="text-muted-foreground"
                      onMouseEnter={() => setShowBillerInfo(true)}
                      onMouseLeave={() => setShowBillerInfo(false)}
                      onClick={() => setShowBillerInfo(true)}
                    >
                      <Info className="h-3.5 w-3.5" />
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-3 text-xs leading-relaxed">
                      The name your GST invoice should be issued to — this can be a company
                      name or a different person's name, not necessarily your own.
                    </PopoverContent>
                  </Popover>
                </div>
                <Input
                  id="reg-biller-name"
                  className="h-9"
                  placeholder="Name the invoice should be billed to"
                  value={billerName}
                  onChange={(event) => setBillerName(event.target.value)}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="reg-address" className="text-xs">
                  Billing address <RequiredMark />
                </Label>
                <Textarea
                  id="reg-address"
                  className="min-h-[64px] text-sm"
                  placeholder="Address for the GST invoice"
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                />
              </div>
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
