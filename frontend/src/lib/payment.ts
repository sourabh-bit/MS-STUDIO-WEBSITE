import axios from "axios";

import type {
  InitiatePaymentRequest,
  InitiatePaymentResponse,
  PaymentStatusResponse,
} from "@/types/payment";

const apiBaseUrl =
  import.meta.env.VITE_PAYMENT_API_BASE_URL?.trim() || "http://localhost:4000/api";

const paymentApi = axios.create({
  baseURL: apiBaseUrl,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

const getErrorMessage = (error: unknown) => {
  if (!axios.isAxiosError(error)) {
    return error instanceof Error
      ? error.message
      : "Unable to initiate payment right now. Please try again.";
  }

  const responseMessage =
    typeof error.response?.data === "object" &&
    error.response?.data !== null &&
    "message" in error.response.data
      ? String(error.response.data.message)
      : "";

  return (
    responseMessage ||
    error.message ||
    "Unable to initiate payment right now. Please try again."
  );
};

export const initiatePayment = async (payload: InitiatePaymentRequest) => {
  try {
    const response = await paymentApi.post<InitiatePaymentResponse>(
      "/payments/initiate",
      payload,
    );

    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const getPaymentStatus = async (merchantTxnNo: string) => {
  const response = await paymentApi.get<PaymentStatusResponse>(
    `/payments/status/${encodeURIComponent(merchantTxnNo)}`,
  );

  return response.data;
};

