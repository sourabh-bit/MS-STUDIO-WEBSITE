export type ExperienceLevel = "beginner" | "intermediate" | "professional";

export type RegistrationInput = {
  name: string;
  phone: string;
  email: string;
  experienceLevel: ExperienceLevel;
  gstin?: string;
  courseName: string;
  variant: "online" | "offline";
  amount: number;
};

export type RegistrationResponse = {
  id: string;
};
