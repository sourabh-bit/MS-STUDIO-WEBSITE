import { Check } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";

import MasterclassPaymentStatusCard from "@/components/classes/MasterclassPaymentStatusCard";
import { Button } from "@/components/ui/button";
import { getMasterclassPaymentDetails } from "@/lib/masterclass";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const paymentDetails = getMasterclassPaymentDetails(searchParams);

  return (
    <MasterclassPaymentStatusCard
      badge="Booking Confirmed"
      title="Payment Successful"
      description="Your seat has been successfully booked."
      infoText="A confirmation message will be sent to your email shortly."
      amountLabel="Amount Paid"
      courseName={paymentDetails.courseName}
      amount={paymentDetails.fee}
      userName={paymentDetails.userName}
      transactionId={paymentDetails.transactionId}
      icon={<Check className="h-7 w-7 sm:h-8 sm:w-8" />}
      iconToneClassName="border-dusty-rose/20 bg-primary/[0.06] text-dusty-rose"
      actions={
        <Button
          asChild
          className="h-12 w-full rounded-full bg-primary px-6 font-sans text-sm tracking-[0.2em] text-primary-foreground uppercase shadow-[0_8px_20px_rgba(150,100,120,0.16)] transition-all duration-300 hover:bg-dusty-rose"
        >
          <Link to="/">Back to Home</Link>
        </Button>
      }
    />
  );
};

export default PaymentSuccess;
