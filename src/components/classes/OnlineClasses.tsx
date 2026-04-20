import { useNavigate } from "react-router-dom";
import OnlineHeroBanner from "./sections/Online classes/OnlineHeroBanner";
import CourseOverview from "./sections/Online classes/CourseOverview";
import BonusTakeaways from "./sections/Online classes/BonusTakeaways";
import MasterclassFlow from "./sections/Online classes/MasterclassFlow";
import WhoShouldAttend from "./sections/Online classes/WhoShouldAttend";
import OnlinePaymentSection from "./sections/Online classes/OnlinePaymentSection";
import StickyPaymentBar from "./sections/Online classes/StickyPaymentBar";

const OnlineClasses = () => {
  const navigate = useNavigate();

  const openCheckout = () => {
    navigate("/classes/checkout");
  };

  return (
    <>
      <div className="space-y-0 pb-28 md:pb-32 lg:pb-0">
        <OnlineHeroBanner onOpenCheckout={openCheckout} />
        <CourseOverview />
        <BonusTakeaways />
        <MasterclassFlow />
        <WhoShouldAttend />
        <OnlinePaymentSection onOpenCheckout={openCheckout} />
      </div>
      <StickyPaymentBar onOpenCheckout={openCheckout} />
    </>
  );
};

export default OnlineClasses;

