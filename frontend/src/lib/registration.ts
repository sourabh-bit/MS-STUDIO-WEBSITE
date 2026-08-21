import axios from "axios";

import type { RegistrationInput, RegistrationResponse } from "@/types/registration";

const apiBaseUrl =
  import.meta.env.VITE_PAYMENT_API_BASE_URL?.trim() || "http://localhost:4000/api";

const registrationApi = axios.create({
  baseURL: apiBaseUrl,
  timeout: 20000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

const getErrorMessage = (error: unknown) => {
  if (!axios.isAxiosError(error)) {
    return error instanceof Error ? error.message : "Something went wrong. Please try again.";
  }

  const responseMessage =
    typeof error.response?.data === "object" &&
    error.response?.data !== null &&
    "message" in error.response.data
      ? String(error.response.data.message)
      : "";

  return responseMessage || error.message || "Something went wrong. Please try again.";
};

export const submitRegistration = async (payload: RegistrationInput) => {
  try {
    const response = await registrationApi.post<RegistrationResponse>("/registrations", payload);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const checkRegistration = async (courseName: string, variant: "online" | "offline") => {
  try {
    const response = await registrationApi.get<{ registered: boolean }>("/registrations/check", {
      params: { courseName, variant },
    });
    return response.data.registered;
  } catch {
    // If the check itself fails (network blip, not logged in yet), fail
    // open to showing the form rather than silently blocking checkout.
    return false;
  }
};
