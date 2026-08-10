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
      <div className="border-y border-dusty-rose/30 bg-dusty-rose/10 py-3.5 px-4">
        <div className="container mx-auto flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-center">
          <span className="inline-flex items-center gap-2 font-sans text-sm font-bold tracking-wide text-foreground">
            <Calendar className="h-4 w-4 text-dusty-rose" />
            18 – 24 Sept 2026
          </span>
          <span className="hidden text-dusty-rose sm:inline">•</span>
          <span className="inline-flex items-center gap-2 font-sans text-sm font-bold tracking-wide text-foreground">
            <MapPin className="h-4 w-4 text-dusty-rose" />
            The Maidens Oberoi, New Delhi
          </span>
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
