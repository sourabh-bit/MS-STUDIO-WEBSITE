import { useNavigate } from "react-router-dom";

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
