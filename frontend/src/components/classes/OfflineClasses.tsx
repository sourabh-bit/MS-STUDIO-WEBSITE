import { useNavigate } from "react-router-dom";
import { Calendar, MapPin } from "lucide-react";

import HeroBanner from "./sections/Offline classes/HeroBanner.tsx";
import DayStructure from "./sections/Offline classes/DayStructure.tsx";
import AddedBenefits from "./sections/Offline classes/AddedBenefits.tsx";
import VenueSection from "./sections/Offline classes/VenueSection.tsx";
import TimingSection from "./sections/Offline classes/TimingSection.tsx";
import PaymentSection from "./sections/Offline classes/PaymentSection.tsx";
import PortfolioSection from "./sections/Offline classes/PortfolioSection.tsx";
import StickyPaymentBar from "./sections/Offline classes/StickyPaymentBar.tsx";

import { OFFLINE_MASTERCLASS_DETAILS } from "@/lib/masterclass";


const OfflineClasses = () => {
  const navigate = useNavigate();

  const openCheckout = () => {
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
        <HeroBanner onOpenCheckout={openCheckout} />
        <DayStructure />
        <AddedBenefits />
        <VenueSection />
        <TimingSection />
        <PaymentSection onOpenCheckout={openCheckout} />
        <PortfolioSection />
      </div>
      <StickyPaymentBar onOpenCheckout={openCheckout} />
    </>
  );
};

export default OfflineClasses;
