export type ExperienceLevel = "beginner" | "intermediate" | "advanced";

export type RegistrationVariant = "online" | "offline";

export type CreateRegistrationInput = {
  name: string;
  phone: string;
  email: string;
  experienceLevel: ExperienceLevel;
  gstin?: string;
  courseName: string;
  variant: RegistrationVariant;
  amount: number;
};
