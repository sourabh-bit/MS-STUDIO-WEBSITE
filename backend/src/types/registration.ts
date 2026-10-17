export type RegistrationVariant = "online" | "offline";

export type CreateRegistrationInput = {
  name: string;
  phone: string;
  email: string;
  city: string;
  // Free text outside India (province / region); an Indian state name inside.
  state: string;
  // Defaults to "India". PAN, state and GSTIN only apply to Indian buyers.
  country?: string;
  instagramHandle?: string;
  experienceMonths?: number;
  pan?: string;
  gstin?: string;
  // Only meaningful (and required) when gstin is present — who the GST
  // invoice should actually be billed to, and where it should be sent.
  billerName?: string;
  address?: string;
  courseName: string;
  variant: RegistrationVariant;
  amount: number;
};
