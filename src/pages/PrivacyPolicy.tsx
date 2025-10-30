const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen py-24">
      <div className="container mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="text-center mb-20 animate-fade-in">
          <h1 className="font-display text-5xl md:text-7xl text-primary mb-6">
            Privacy Policy
          </h1>
          <div className="w-24 h-1 bg-secondary mx-auto" />
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto space-y-10 animate-fade-up font-body text-base md:text-lg text-foreground/80 leading-relaxed">
          <p>
            At Meera Sakhrani Makeup Artistry, your privacy is of the utmost importance to us.
            This Privacy Policy outlines how we collect, use, and protect your personal information.
          </p>

          <p>
            When you fill out a form, make a booking, or contact us, we may collect details such as
            your name, phone number, email address, and event information to provide our services efficiently.
          </p>

          <p>
            The information we collect is used solely to manage bookings, confirm appointments,
            respond to inquiries, and improve your overall experience with our brand. We do not sell
            or rent your data to any third parties.
          </p>

          <p>
            Your personal details are stored securely and shared only with trusted service providers
            when necessary—for example, for processing payments or managing scheduling systems.
          </p>

          <p>
            We take reasonable technical and administrative measures to safeguard your information from unauthorized access or misuse.
            Our website may use cookies to enhance your browsing experience, but you can disable them anytime.
          </p>

          <p>
            Occasionally, our website may include links to third-party platforms such as Instagram.
            We are not responsible for their content or privacy practices.
          </p>

          <p>
            You have the right to access, modify, or delete your personal information at any time.
            Please email us at <strong>hello@meeramakeupstudio.com</strong>.
          </p>

          <p className="italic text-center text-foreground/70">
            Last updated: October 2025
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
