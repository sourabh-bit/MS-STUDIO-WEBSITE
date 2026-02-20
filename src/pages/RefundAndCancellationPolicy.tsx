const RefundAndCancellationPolicy = () => {
  return (
    <div className="min-h-screen py-24">
      <div className="container mx-auto px-6 lg:px-12">

        {/* Header */}
        <div className="text-center mb-20 animate-fade-in">
          <h1 className="font-display text-5xl md:text-7xl text-primary mb-6">
            Refund & Cancellation Policy
          </h1>
          <div className="w-24 h-1 bg-secondary mx-auto" />
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto space-y-16 animate-fade-up font-body text-base md:text-lg text-foreground/80 leading-relaxed">

          {/* Makeup Classes */}
          <section className="bg-muted/40 rounded-2xl p-8 shadow-sm">
            <h2 className="font-display text-2xl md:text-3xl text-primary mb-6">
              Makeup Classes — Cancellation & Refund
            </h2>

            <ul className="space-y-3 list-disc pl-6">
              <li>
                If you wish to cancel your enrollment, please notify us within{" "}
                <strong className="text-primary">48 hours of booking</strong>.
              </li>
              <li>
                Cancellations within 48 hours are eligible for a{" "}
                <strong className="text-primary">50% refund</strong>.
              </li>
              <li>
                Alternatively, you may opt for a{" "}
                <strong className="text-primary">50% credit</strong> that can be applied toward the next available class.
              </li>
              <li>
                The credit is valid for <strong>one class only</strong> and can be used once.
              </li>
              <li>
                Transfers are subject to <strong>seat availability</strong>.
              </li>
              <li>
                Any cancellation request received after 48 hours will result in{" "}
                <strong className="text-primary">forfeiture of the full amount</strong>.
              </li>
            </ul>
          </section>

          {/* Makeup Services */}
          <section className="bg-muted/40 rounded-2xl p-8 shadow-sm">
            <h2 className="font-display text-2xl md:text-3xl text-primary mb-6">
              Makeup Services — Cancellation Policy
            </h2>

            <ul className="space-y-3 list-disc pl-6">
              <li>
                Advance payments confirm your booking and are{" "}
                <strong className="text-primary">non-refundable</strong>.
              </li>
              <li>
                The advance may be <strong>adjusted to a new date</strong> only if cancellation is made within{" "}
                <strong className="text-primary">one week of payment</strong>.
              </li>
              <li>
                The revised booking must be scheduled within{" "}
                <strong className="text-primary">6 months</strong> of the original date, after which the amount will be forfeited.
              </li>
              <li>
                Rescheduled dates are subject to <strong>availability</strong>.
              </li>
              <li>
                Delays beyond <strong>30 minutes</strong> may impact the service timeline and are subject to feasibility.
              </li>
            </ul>
          </section>

          {/* Contact */}
          <section className="bg-muted/40 rounded-2xl p-8 shadow-sm">
            <h2 className="font-display text-2xl md:text-3xl text-primary mb-4">
              Contact
            </h2>

            <p className="mb-4">
              For cancellation, rescheduling, or refund requests, please contact us:
            </p>

            <div className="space-y-2">
              <p>📧 hello@meeramakeupstudio.com</p>
              <p>📞 +91 84482 29694 (Booking)</p>
            </div>
          </section>

          {/* Legal */}
          <p className="text-sm text-foreground/60 text-center">
            Meera Sakhrani Studio reserves the right to modify this policy at any time without prior notice.
          </p>

        </div>
      </div>
    </div>
  );
};

export default RefundAndCancellationPolicy;
