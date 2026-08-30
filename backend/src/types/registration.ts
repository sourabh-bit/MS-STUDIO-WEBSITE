export type RegistrationVariant = "online" | "offline";

export type CreateRegistrationInput = {
  name: string;
  phone: string;
  email: string;
  city?: string;
  state?: string;
  instagramHandle: string;
  experienceMonths?: number;
  pan: string;
  gstin?: string;
  courseName: string;
  variant: RegistrationVariant;
  amount: number;
};
