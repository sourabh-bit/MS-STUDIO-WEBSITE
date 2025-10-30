const TermsAndConditions = () => {
  return (
    <div className="min-h-screen py-24">
      <div className="container mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="text-center mb-20 animate-fade-in">
          <h1 className="font-display text-5xl md:text-7xl text-primary mb-6">
            Terms & Conditions
          </h1>
          <div className="w-24 h-1 bg-secondary mx-auto" />
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-up font-body text-base md:text-lg text-foreground/80 leading-relaxed">
          <p>
            Welcome to Meera Sakhrani Makeup Artistry. By booking a service or engaging with this website, you agree to the following terms and conditions. All appointments are subject to availability. Deposits are non-refundable but may be transferred to another date only subject to availability. Cancellations made after 3 days of booking may result in the loss of the booking deposit. Payments must be completed through the accepted methods specified during booking, and full settlement must be made before or on the day of the appointment.
          </p>

          <p>
            For on-location services outside Delhi NCR, a travel fee is applied. Clients are responsible for providing a suitable environment for makeup application, including adequate lighting and seating arrangements. It is important that clients disclose any skin allergies, sensitivities, or health conditions that could affect the makeup process. Meera Sakhrani Makeup Artistry cannot be held liable for allergic reactions or issues arising from undisclosed information or the use of personal products supplied by the client.
          </p>

          <p>
            With your consent, photographs or videos of your makeup look may be used for portfolio, website, or social media purposes. This consent can be withdrawn at any time by notifying us in writing. All images, text, and creative content on this website belong exclusively to Meera Sakhrani Makeup Artistry and may not be copied or reproduced without permission.
          </p>

          <p>
            While we strive to deliver the highest level of professional service, Meera Sakhrani Makeup Artistry shall not be held responsible for any indirect or consequential damages arising from the use of our services or website. These Terms & Conditions are governed by the laws of India, and any disputes shall fall under the jurisdiction of courts located in New Delhi. By proceeding with a booking, you acknowledge that you have read, understood, and agreed to these terms.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;
