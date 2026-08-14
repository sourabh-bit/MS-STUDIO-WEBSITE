import { useEffect, useRef, useState } from "react";
import { Loader2, ShieldCheck } from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { requestOtp, verifyOtp } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

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
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

type Step = "details" | "otp";

const LoginModal = () => {
  const { isModalOpen, closeLoginModal, handleAuthenticated } = useAuth();
  const { toast } = useToast();

  const [step, setStep] = useState<Step>("details");
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [devCode, setDevCode] = useState<string | null>(null);
  const resendTimerRef = useRef<number | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (!isModalOpen) {
      setStep("details");
      setName("");
      setMobile("");
      setEmail("");
      setCode("");
      setDevCode(null);
      setResendCooldown(0);
      if (resendTimerRef.current) {
        window.clearInterval(resendTimerRef.current);
      }
    }
  }, [isModalOpen]);

  const startResendCooldown = () => {
    setResendCooldown(60);
    if (resendTimerRef.current) {
      window.clearInterval(resendTimerRef.current);
    }
    resendTimerRef.current = window.setInterval(() => {
      setResendCooldown((current) => {
        if (current <= 1) {
          if (resendTimerRef.current) {
            window.clearInterval(resendTimerRef.current);
          }
          return 0;
        }
        return current - 1;
      });
    }, 1000);
  };

  const handleSendCode = async () => {
    if (name.trim().length < 2) {
      toast({ title: "Enter your full name", variant: "destructive" });
      return;
    }

    if (mobile.replace(/\D/g, "").length < 10) {
      toast({ title: "Enter a valid mobile number", variant: "destructive" });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      toast({ title: "Enter a valid email address", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await requestOtp({
        name: name.trim(),
        mobile: mobile.trim(),
        email: email.trim(),
      });
      setDevCode(result.devCode ?? null);
      setStep("otp");
      startResendCooldown();
      toast({
        title: "Code sent via SMS",
        description: `We texted a 6-digit code to ${mobile}.`,
      });
    } catch (error) {
      toast({
        title: "Couldn't send the code",
        description: error instanceof Error ? error.message : undefined,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyCode = async () => {
    if (code.length !== 6) {
      toast({ title: "Enter the 6-digit code", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const { user } = await verifyOtp(mobile.trim(), code);
      handleAuthenticated(user);
      toast({ title: user.name ? `Welcome, ${user.name}` : "Welcome" });
    } catch (error) {
      toast({
        title: "Couldn't verify that code",
        description: error instanceof Error ? error.message : undefined,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={isModalOpen}
      onOpenChange={(open) => {
        if (!open) {
          closeLoginModal();
        }
      }}
    >
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-soft-pink/50">
            <ShieldCheck className="h-6 w-6 text-dusty-rose" />
          </div>
          <DialogTitle className="text-center font-serif text-2xl">
            {step === "details" ? "Log in to continue" : "Enter your code"}
          </DialogTitle>
          <DialogDescription className="text-center">
            {step === "details"
              ? "Share your details so we can confirm your booking and send you a login code."
              : `We sent a 6-digit code to ${mobile}.`}
          </DialogDescription>
        </DialogHeader>

        {step === "details" ? (
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="login-name">Full name</Label>
              <Input
                id="login-name"
                placeholder="Your full name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="login-mobile">Mobile number</Label>
              <Input
                id="login-mobile"
                type="tel"
                placeholder="98765 43210"
                value={mobile}
                onChange={(event) => setMobile(event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="login-email">Email address</Label>
              <Input
                id="login-email"
                type="email"
                placeholder="you@email.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    handleSendCode();
                  }
                }}
              />
            </div>

            <Button
              className="w-full"
              onClick={handleSendCode}
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Send code
            </Button>
          </div>
        ) : (
          <div className="space-y-4 pt-2">
            <div className="flex justify-center">
              <InputOTP maxLength={6} value={code} onChange={setCode}>
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>

            {devCode && (
              <p className="text-center text-xs text-muted-foreground">
                Dev mode — SMS isn't configured yet. Your code is{" "}
                <span className="font-semibold text-foreground">{devCode}</span>.
              </p>
            )}

            <Button
              className="w-full"
              onClick={handleVerifyCode}
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Verify &amp; continue
            </Button>

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <button
                type="button"
                className="underline underline-offset-2 hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
                onClick={() => setStep("details")}
              >
                Edit details
              </button>
              <button
                type="button"
                className="underline underline-offset-2 hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
                onClick={handleSendCode}
                disabled={resendCooldown > 0 || isSubmitting}
              >
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend code"}
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default LoginModal;
