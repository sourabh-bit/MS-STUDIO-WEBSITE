export type RegistrationInput = {
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
  variant: "online" | "offline";
  amount: number;
};

export type RegistrationResponse = {
  id: string;
};
