import { useEffect, useRef, useState } from "react";
import { Loader2, ShieldCheck, Wrench } from "lucide-react";
import { getCountryCallingCode, isValidPhoneNumber, parsePhoneNumberFromString, type CountryCode } from "libphonenumber-js";

import { useAuth } from "@/context/AuthContext";
import { fetchOtpDevMode, requestOtp, verifyOtp, verifyWidgetLogin } from "@/lib/auth";
import { initMsg91Widget, retryWidgetOtp, sendWidgetOtp, verifyWidgetOtp } from "@/lib/msg91Widget";
import { useToast } from "@/hooks/use-toast";
import { DEFAULT_COUNTRY } from "@/lib/countries";

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
import CountryCodeSelect from "@/components/auth/CountryCodeSelect";

type Step = "details" | "otp";

const LoginModal = () => {
  const { isModalOpen, loginVariant, closeLoginModal, handleAuthenticated } = useAuth();
  const { toast } = useToast();

  const [step, setStep] = useState<Step>("details");
  const [name, setName] = useState("");
  const [country, setCountry] = useState<CountryCode>(DEFAULT_COUNTRY);
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [sentMobileDisplay, setSentMobileDisplay] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const resendTimerRef = useRef<number | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  // Developer OTP bypass — only ever true when the backend says so (see
  // OTP_DEV_MODE). Codes then come from our own backend instead of MSG91,
  // no SMS goes out, and the code is shown right here in the popup.
  const [isDevMode, setIsDevMode] = useState(false);
  const [devCode, setDevCode] = useState("");
  const [sentMobileE164, setSentMobileE164] = useState("");

  useEffect(() => {
    fetchOtpDevMode().then(setIsDevMode);
  }, []);

  useEffect(() => {
    if (isModalOpen) {
      if (isDevMode) {
        return;
      }
      // Pre-warm the widget script so the first "Send code" click isn't
      // waiting on it to load. Errors here just surface again naturally
      // when the user actually tries to send/verify.
      initMsg91Widget().catch(() => undefined);
    } else {
      setStep("details");
      setName("");
      setCountry(DEFAULT_COUNTRY);
      setMobile("");
      setEmail("");
      setCode("");
      setSentMobileDisplay("");
      setSentMobileE164("");
      setDevCode("");
      setResendCooldown(0);
      if (resendTimerRef.current) {
        window.clearInterval(resendTimerRef.current);
      }
    }
  }, [isModalOpen, isDevMode]);

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

    if (!isValidPhoneNumber(mobile, country)) {
      toast({ title: "Enter a valid mobile number", variant: "destructive" });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      toast({ title: "Enter a valid email address", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const fullMobile = `${getCountryCallingCode(country)}${mobile.replace(/\D/g, "")}`;
      const formattedMobile = parsePhoneNumberFromString(`+${fullMobile}`)?.formatInternational() ?? `+${fullMobile}`;
      if (isDevMode) {
        const result = await requestOtp({
          name: name.trim(),
          mobile: `+${fullMobile}`,
          email: email.trim(),
          variant: loginVariant,
        });
        setDevCode(result.devCode ?? "");
        setSentMobileE164(`+${fullMobile}`);
      } else {
        await sendWidgetOtp(fullMobile);
      }
      setStep("otp");
      setSentMobileDisplay(formattedMobile);
      startResendCooldown();
      toast({
        title: isDevMode ? "Dev code generated" : "Code sent via SMS",
        description: isDevMode
          ? "No SMS was sent — the code is shown in the popup."
          : `We texted a 6-digit code to ${formattedMobile}.`,
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
      const { user } = isDevMode
        ? await verifyOtp(sentMobileE164, code, loginVariant)
        : await verifyWidgetLogin({
            accessToken: await verifyWidgetOtp(code),
            name: name.trim(),
            email: email.trim(),
            variant: loginVariant,
          });
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

  const handleResendCode = async () => {
    setIsSubmitting(true);
    try {
      if (isDevMode) {
        const result = await requestOtp({
          name: name.trim(),
          mobile: sentMobileE164,
          email: email.trim(),
          variant: loginVariant,
        });
        setDevCode(result.devCode ?? "");
        setCode("");
      } else {
        await retryWidgetOtp();
      }
      startResendCooldown();
      toast({ title: "Code resent" });
    } catch (error) {
      toast({
        title: "Couldn't resend the code",
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
      <DialogContent className="sm:max-w-md">
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
              : `We sent a 6-digit code to ${sentMobileDisplay}.`}
          </DialogDescription>
        </DialogHeader>

        {step === "details" ? (
          <div className="space-y-4 pt-2">
            {isDevMode && (
              <p className="flex items-center gap-2 rounded-lg border border-dashed border-amber-400 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                <Wrench className="h-3.5 w-3.5 shrink-0" />
                Dev mode — no SMS will be sent; the code appears on the next step.
              </p>
            )}
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
              <div className="flex gap-2">
                <CountryCodeSelect value={country} onChange={setCountry} />
                <Input
                  id="login-mobile"
                  type="tel"
                  placeholder="98765 43210"
                  value={mobile}
                  onChange={(event) => setMobile(event.target.value)}
                  className="flex-1"
                />
              </div>
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
            {isDevMode && (
              <div className="flex items-center justify-between gap-3 rounded-lg border border-dashed border-amber-400 bg-amber-50 px-3 py-2.5 text-amber-900">
                <div className="flex items-center gap-2">
                  <Wrench className="h-4 w-4 shrink-0" />
                  <div>
                    <p className="text-[10px] font-semibold tracking-[0.15em] uppercase">Dev mode code</p>
                    <p className="font-mono text-lg tracking-[0.3em]">{devCode || "——————"}</p>
                  </div>
                </div>
                <button
                  type="button"
                  className="rounded-md bg-amber-900 px-3 py-1.5 text-xs font-medium text-amber-50 hover:bg-amber-800 disabled:opacity-50"
                  onClick={() => setCode(devCode)}
                  disabled={!devCode}
                >
                  Autofill
                </button>
              </div>
            )}

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
                onClick={handleResendCode}
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
