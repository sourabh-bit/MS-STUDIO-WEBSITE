import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "@/context/AuthContext";
import { checkRegistration } from "@/lib/registration";
import { WHATSAPP_NUMBERS } from "@/lib/contact";
import { getPaymentSummary } from "@/lib/payment";
import { IS_ONLINE_REGISTRATION_OPEN, MASTERCLASS_DETAILS } from "@/lib/masterclass";

import OnlineHeroBanner from "./sections/Online classes/OnlineHeroBanner";
import CourseOverview from "./sections/Online classes/CourseOverview";
import BonusTakeaways from "./sections/Online classes/BonusTakeaways";
import MasterclassFlow from "./sections/Online classes/MasterclassFlow";
import OnlineGallery from "./sections/Online classes/OnlineGallery";
import WhoShouldAttend from "./sections/Online classes/WhoShouldAttend";
import OnlinePaymentSection from "./sections/Online classes/OnlinePaymentSection";
import StickyPaymentBar from "./sections/Online classes/StickyPaymentBar";
import RegistrationDialog from "./RegistrationDialog";
import RegistrationClosedDialog from "./RegistrationClosedDialog";

const OnlineClasses = () => {
  const navigate = useNavigate();
  const { user, requireAuth } = useAuth();
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
  const [isRegistrationClosedOpen, setIsRegistrationClosedOpen] = useState(false);
  const [closedDialogStart, setClosedDialogStart] = useState<"closed" | "interest">("closed");
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  // Guards against a double tap firing two checks (and two dialogs) before
  // the first one has even set isChecking.
  const checkInFlightRef = useRef(false);

  // A returning student who has already paid sees "You're Enrolled" right
  // away instead of a pay button. Backend state only — nothing cached.
  useEffect(() => {
    if (!user) {
      setIsEnrolled(false);
      return;
    }

    let cancelled = false;

    getPaymentSummary(MASTERCLASS_DETAILS.courseName, "online")
      .then((summary) => {
        if (!cancelled) {
          setIsEnrolled(summary.advance.status === "PAID");
        }
      })
      .catch(() => {
        // Non-critical — the click-time check below is the real gate.
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  const showRegistrationClosed = () => {
    setClosedDialogStart("closed");
    setIsRegistrationClosedOpen(true);
  };

  // The pricing section's "Register Your Interest" goes straight to the form.
  const showInterestForm = () => {
    setClosedDialogStart("interest");
    setIsRegistrationClosedOpen(true);
  };

  const goToCheckout = () => {
    const params = new URLSearchParams({
      variant: "online",
      course: MASTERCLASS_DETAILS.courseName,
      amount: String(MASTERCLASS_DETAILS.fee),
      feeLabel: MASTERCLASS_DETAILS.feeLabel,
      summaryLabel: MASTERCLASS_DETAILS.summaryLabel,
      trustLine: MASTERCLASS_DETAILS.trustLine,
    });

    navigate(`/classes/checkout?${params.toString()}`);
  };

  // Same journey as the offline masterclass: OTP login → registration form
  // (skipped if already on file) → review page → ICICI payment. Someone who
  // has already paid lands on the checkout page's "You're enrolled" view
  // rather than being able to pay a second time.
  const openCheckout = () => {
    // Checked before requireAuth, deliberately — no reason to make someone
    // log in first just to be told registrations are closed.
    if (!IS_ONLINE_REGISTRATION_OPEN && !isEnrolled) {
      showRegistrationClosed();
      return;
    }

    requireAuth(async () => {
      if (checkInFlightRef.current) {
        return;
      }

      checkInFlightRef.current = true;
      setIsChecking(true);

      try {
        const alreadyRegistered = await checkRegistration(MASTERCLASS_DETAILS.courseName, "online");

        if (!alreadyRegistered) {
          if (!IS_ONLINE_REGISTRATION_OPEN) {
            showRegistrationClosed();
            return;
          }

          setIsRegistrationOpen(true);
          return;
        }

        // Registered but never paid: once registrations close they can't
        // pay either. Only students who already paid still get through, to
        // the checkout page's "You're enrolled" view.
        if (!IS_ONLINE_REGISTRATION_OPEN) {
          const summary = await getPaymentSummary(MASTERCLASS_DETAILS.courseName, "online").catch(() => null);

          if (summary?.advance.status !== "PAID") {
            showRegistrationClosed();
            return;
          }
        }

        goToCheckout();
      } finally {
        checkInFlightRef.current = false;
        setIsChecking(false);
      }
    }, "online");
  };

  // Runs after the registration form is saved. This only takes the
  // customer to the review page — the actual ICICI payment only starts
  // when they click Pay Now there.
  const handleRegistrationSuccess = () => {
    setIsRegistrationOpen(false);
    goToCheckout();
  };

  const ctaProps = { onOpenCheckout: openCheckout, isEnrolled, isBusy: isChecking };

  return (
    <>
      {/* -mx-4 cancels the page container's padding on phones, so each
          section's own padding is the only gutter and backgrounds run
          edge to edge. */}
      <div className="-mx-4 space-y-0 pb-6 sm:mx-0 md:pb-12 lg:pb-0">
        <OnlineHeroBanner {...ctaProps} />
        <CourseOverview />
        <BonusTakeaways />
        <MasterclassFlow />
        <OnlineGallery />
        <WhoShouldAttend />
        <OnlinePaymentSection {...ctaProps} onRegisterInterest={showInterestForm} />
      </div>
      <StickyPaymentBar {...ctaProps} />

      <RegistrationDialog
        open={isRegistrationOpen}
        onOpenChange={setIsRegistrationOpen}
        courseName={MASTERCLASS_DETAILS.courseName}
        variant="online"
        amount={MASTERCLASS_DETAILS.fee}
        onSuccess={handleRegistrationSuccess}
      />

      <RegistrationClosedDialog
        open={isRegistrationClosedOpen}
        onOpenChange={setIsRegistrationClosedOpen}
        courseLabel="Online Masterclass"
        whatsappNumber={WHATSAPP_NUMBERS.onlineClass}
        courseName={MASTERCLASS_DETAILS.courseName}
        variant="online"
        startOn={closedDialogStart}
      />
    </>
  );
};

export default OnlineClasses;
