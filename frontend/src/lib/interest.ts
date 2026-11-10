import axios from "axios";

const apiBaseUrl =
  import.meta.env.VITE_PAYMENT_API_BASE_URL?.trim() || "http://localhost:4000/api";

export type InterestInput = {
  name: string;
  // Full international number, e.g. "+919876543210".
  whatsappNumber: string;
  email: string;
  courseName: string;
  variant: "online" | "offline";
};

// "Register Interest" while a class isn't taking sign-ups. No login needed.
export const submitInterest = async (payload: InterestInput) => {
  try {
    await axios.post(`${apiBaseUrl}/interests`, payload, { timeout: 20000 });
  } catch (error) {
    const message =
      axios.isAxiosError(error) &&
      typeof error.response?.data === "object" &&
      error.response?.data !== null &&
      "message" in error.response.data
        ? String(error.response.data.message)
        : "";

    throw new Error(message || "Something went wrong. Please try again.");
  }
};
