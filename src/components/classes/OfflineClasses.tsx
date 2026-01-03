import HeroBanner from "./sections/Offline classes/HeroBanner.tsx";
import DayStructure from "./sections/Offline classes/DayStructure.tsx";
import AddedBenefits from "./sections/Offline classes/AddedBenefits.tsx";
import VenueSection from "./sections/Offline classes/VenueSection.tsx";
import TimingSection from "./sections/Offline classes/TimingSection.tsx";
import PaymentSection from "./sections/Offline classes/PaymentSection.tsx";
import PortfolioSection from "./sections/Offline classes/PortfolioSection.tsx";


const OfflineClasses = () => {
  return (
    <div className="space-y-0">
      <HeroBanner />
      <DayStructure />
      <AddedBenefits />
      <VenueSection />
      <TimingSection />
      <PaymentSection />
      <PortfolioSection />
    </div>
  );
};

export default OfflineClasses;
