import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "@/context/AuthContext";
import { checkRegistration } from "@/lib/registration";
import { getPaymentSummary } from "@/lib/payment";
import { IS_ONLINE_REGISTRATION_OPEN, MASTERCLASS_DETAILS } from "@/lib/masterclass";

import OnlineHeroBanner from "./sections/Online classes/OnlineHeroBanner";
import CourseOverview from "./sections/Online classes/CourseOverview";
import BonusTakeaways from "./sections/Online classes/BonusTakeaways";
import MasterclassFlow from "./sections/Online classes/MasterclassFlow";
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
      setIsRegistrationClosedOpen(true);
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
            setIsRegistrationClosedOpen(true);
            return;
          }

          setIsRegistrationOpen(true);
          return;
        }

        goToCheckout();
      } finally {
        checkInFlightRef.current = false;
        setIsChecking(false);
      }
    });
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
      <div className="space-y-0 pb-28 md:pb-32 lg:pb-0">
        <OnlineHeroBanner {...ctaProps} />
        <CourseOverview />
        <BonusTakeaways />
        <MasterclassFlow />
        <WhoShouldAttend />
        <OnlinePaymentSection {...ctaProps} />
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
      />
    </>
  );
};

export default OnlineClasses;
