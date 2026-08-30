import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, MapPin } from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { checkRegistration } from "@/lib/registration";
import { getPaymentSummary } from "@/lib/payment";

import HeroBanner from "./sections/Offline classes/HeroBanner.tsx";
import DayStructure from "./sections/Offline classes/DayStructure.tsx";
import AddedBenefits from "./sections/Offline classes/AddedBenefits.tsx";
import VenueSection from "./sections/Offline classes/VenueSection.tsx";
import TimingSection from "./sections/Offline classes/TimingSection.tsx";
import PaymentSection from "./sections/Offline classes/PaymentSection.tsx";
import SecondInstallmentSection from "./sections/Offline classes/SecondInstallmentSection.tsx";
import PortfolioSection from "./sections/Offline classes/PortfolioSection.tsx";
import StickyPaymentBar from "./sections/Offline classes/StickyPaymentBar.tsx";
import RegistrationDialog from "./RegistrationDialog";

import { OFFLINE_MASTERCLASS_DETAILS } from "@/lib/masterclass";


const OfflineClasses = () => {
  const navigate = useNavigate();
  const { requireAuth } = useAuth();
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);

  const goToCheckout = () => {
    const params = new URLSearchParams({
      variant: "offline",
      course: OFFLINE_MASTERCLASS_DETAILS.courseName,
      amount: String(OFFLINE_MASTERCLASS_DETAILS.fee),
      feeLabel: OFFLINE_MASTERCLASS_DETAILS.feeLabel,
      summaryLabel: OFFLINE_MASTERCLASS_DETAILS.summaryLabel,
      trustLine: OFFLINE_MASTERCLASS_DETAILS.trustLine,
    });

    navigate(`/classes/checkout?${params.toString()}`);
  };

  const goToSecondInstallmentConfirmation = () => {
    const params = new URLSearchParams({
      variant: "offline",
      course: OFFLINE_MASTERCLASS_DETAILS.courseName,
      installment: "second",
      showAdvanceConfirmation: "1",
    });

    navigate(`/classes/checkout?${params.toString()}`);
  };

  // Skip the registration form entirely if this person has already
  // registered for this course — no need to fill it out again just
  // because they navigated back and came in through "Book" again. And if
  // they've already paid the advance, never send them back into the
  // ₹1,00,000 checkout a second time — the backend is the source of truth
  // here, not just this in-memory check.
  const openCheckout = () => {
    requireAuth(async () => {
      const alreadyRegistered = await checkRegistration(
        OFFLINE_MASTERCLASS_DETAILS.courseName,
        "offline",
      );

      if (!alreadyRegistered) {
        setIsRegistrationOpen(true);
        return;
      }

      const summary = await getPaymentSummary(OFFLINE_MASTERCLASS_DETAILS.courseName, "offline").catch(
        () => null,
      );

      if (summary?.advance.status === "PAID") {
        goToSecondInstallmentConfirmation();
        return;
      }

      goToCheckout();
    });
  };

  // Runs after the registration form is saved. This only takes the
  // customer to the cart/review page — the actual ICICI payment is only
  // started later, when they click Pay Now there.
  const handleRegistrationSuccess = () => {
    setIsRegistrationOpen(false);
    goToCheckout();
  };

  return (
    <>
      <div className="section-cream px-4 py-6 md:py-8">
        <div className="container mx-auto max-w-md">
          <div className="rounded-2xl border border-dusty-rose/30 bg-background px-6 py-6 text-center shadow-elegant md:px-8">
            <span className="mb-3 inline-block font-sans text-[11px] tracking-[0.35em] text-dusty-rose uppercase">
              Offline Masterclass
            </span>
            <div className="flex items-center justify-center gap-2.5">
              <Calendar className="h-5 w-5 shrink-0 text-dusty-rose" />
              <span className="font-serif text-lg font-semibold text-foreground md:text-xl">
                18 – 24 Sept 2026
              </span>
            </div>
            <div className="mx-auto my-3 h-px w-16 bg-dusty-rose/30" />
            <div className="flex items-center justify-center gap-2.5">
              <MapPin className="h-5 w-5 shrink-0 text-dusty-rose" />
              <span className="font-sans text-sm font-medium text-foreground/90 md:text-base">
                The Maidens Oberoi, New Delhi
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-0 pb-28 md:pb-32 lg:pb-0">
        <HeroBanner />
        <DayStructure />
        <AddedBenefits />
        <VenueSection />
        <TimingSection />
        <PaymentSection onOpenCheckout={openCheckout} />
        <SecondInstallmentSection onNeedsRegistration={() => setIsRegistrationOpen(true)} />
        <PortfolioSection />
      </div>
      <StickyPaymentBar onOpenCheckout={openCheckout} />

      <RegistrationDialog
        open={isRegistrationOpen}
        onOpenChange={setIsRegistrationOpen}
        courseName={OFFLINE_MASTERCLASS_DETAILS.courseName}
        variant="offline"
        amount={OFFLINE_MASTERCLASS_DETAILS.fee}
        onSuccess={handleRegistrationSuccess}
      />
    </>
  );
};

export default OfflineClasses;
