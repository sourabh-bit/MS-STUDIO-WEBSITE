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

export const initiatePayment = async (payload: InitiatePaymentRequest) => {
  const response = await paymentApi.post<InitiatePaymentResponse>(
    "/payments/initiate",
    payload,
  );

  return response.data;
};

export const getPaymentStatus = async (merchantTxnNo: string) => {
  const response = await paymentApi.get<PaymentStatusResponse>(
    `/payments/status/${encodeURIComponent(merchantTxnNo)}`,
  );

  return response.data;
};
