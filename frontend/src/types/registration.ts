export type RegistrationInput = {
  name: string;
  phone: string;
  // Same as `phone` unless the student entered a different WhatsApp number.
  whatsappNumber?: string;
  email: string;
  city: string;
  state: string;
  country: string;
  instagramHandle?: string;
  experienceMonths?: number;
  // India only — omitted for international registrations.
  pan?: string;
  gstin?: string;
  // Only sent (and required) when a GST invoice was requested.
  billerName?: string;
  // GST billing address in India; residential address (required) abroad.
  address?: string;
  // International registrations only.
  postalCode?: string;
  courseName: string;
  variant: "online" | "offline";
  amount: number;
};

export type RegistrationResponse = {
  id: string;
};
