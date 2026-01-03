import OnlineHeroBanner from "./sections/Online classes/OnlineHeroBanner";
import CourseOverview from "./sections/Online classes/CourseOverview";
import BonusTakeaways from "./sections/Online classes/BonusTakeaways";
import MasterclassFlow from "./sections/Online classes/MasterclassFlow";
import WhoShouldAttend from "./sections/Online classes/WhoShouldAttend";
import OnlinePaymentSection from "./sections/Online classes/OnlinePaymentSection";

const OnlineClasses = () => {
  return (
    <div className="space-y-0">
      <OnlineHeroBanner />
      <CourseOverview />
      <BonusTakeaways />
      <MasterclassFlow />
      <WhoShouldAttend />
      <OnlinePaymentSection />
    </div>
  );
};

export default OnlineClasses;

