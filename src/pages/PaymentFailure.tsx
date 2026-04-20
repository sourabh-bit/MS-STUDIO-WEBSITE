import { AlertCircle } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import MasterclassPaymentStatusCard from "@/components/classes/MasterclassPaymentStatusCard";
import { Button } from "@/components/ui/button";
import { getMasterclassPaymentDetails } from "@/lib/masterclass";

const PaymentFailure = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const paymentDetails = getMasterclassPaymentDetails(searchParams);
  const retryLink = searchParams.toString()
    ? `/classes/checkout?${searchParams.toString()}`
    : "/classes/checkout";

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate("/classes");
  };

  const infoText = paymentDetails.transactionId
    ? "Please try again or use a different payment method. If any amount was debited, keep the reference below for support."
    : "Please try again or use a different payment method.";

  return (
    <MasterclassPaymentStatusCard
      badge="Payment Update"
      title="Payment Failed"
      description="Something went wrong or the payment was cancelled."
      infoText={infoText}
      amountLabel="Amount"
      courseName={paymentDetails.courseName}
      amount={paymentDetails.fee}
      userName={paymentDetails.userName}
      transactionId={paymentDetails.transactionId}
      icon={<AlertCircle className="h-7 w-7 sm:h-8 sm:w-8" />}
      iconToneClassName="border-dusty-rose/20 bg-primary/[0.05] text-dusty-rose"
      actions={
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            asChild
            className="h-12 w-full rounded-full bg-primary px-6 font-sans text-sm tracking-[0.2em] text-primary-foreground uppercase shadow-[0_8px_20px_rgba(150,100,120,0.16)] transition-all duration-300 hover:bg-dusty-rose sm:flex-1"
          >
            <Link to={retryLink}>Try Again</Link>
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={handleGoBack}
            className="h-12 w-full rounded-full border-border/50 bg-background/80 font-sans text-sm tracking-[0.2em] text-foreground uppercase transition-all duration-300 hover:bg-primary/[0.04] hover:text-foreground sm:flex-1"
          >
            Go Back
          </Button>
        </div>
      }
    />
  );
};

export default PaymentFailure;
