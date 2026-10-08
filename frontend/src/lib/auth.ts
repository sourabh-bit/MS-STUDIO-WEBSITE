import axios from "axios";

import type {
  MeResponse,
  RequestOtpPayload,
  RequestOtpResponse,
  VerifyOtpResponse,
} from "@/types/auth";

const apiBaseUrl =
  import.meta.env.VITE_PAYMENT_API_BASE_URL?.trim() || "http://localhost:4000/api";

const authApi = axios.create({
  baseURL: apiBaseUrl,
  timeout: 20000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

const getErrorMessage = (error: unknown) => {
  if (!axios.isAxiosError(error)) {
    return error instanceof Error
      ? error.message
      : "Something went wrong. Please try again.";
  }

  const responseMessage =
    typeof error.response?.data === "object" &&
    error.response?.data !== null &&
    "message" in error.response.data
      ? String(error.response.data.message)
      : "";

  return responseMessage || error.message || "Something went wrong. Please try again.";
};

export const requestOtp = async (payload: RequestOtpPayload) => {
  try {
    const response = await authApi.post<RequestOtpResponse>(
      "/auth/otp/request",
      payload,
    );
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const verifyOtp = async (mobile: string, code: string) => {
  try {
    const response = await authApi.post<VerifyOtpResponse>("/auth/otp/verify", {
      mobile,
      code,
    });
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const verifyWidgetLogin = async (payload: {
  accessToken: string;
  name: string;
  email: string;
}) => {
  try {
    const response = await authApi.post<VerifyOtpResponse>("/auth/widget/verify", payload);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

// Fetched at runtime rather than baked into the build (see msg91Widget.ts)
// so the widget's tokenAuth never sits in a static JS bundle file.
export const fetchWidgetConfig = async () => {
  const response = await authApi.get<{ tokenAuth: string }>("/auth/widget/config");
  return response.data.tokenAuth;
};

export const fetchCurrentUser = async () => {
  const response = await authApi.get<MeResponse>("/auth/me");
  return response.data.user;
};

export const logout = async () => {
  await authApi.post("/auth/logout");
};

let devModePromise: Promise<boolean> | null = null;

// Whether the backend has the developer OTP bypass switched on (see
// OTP_DEV_MODE in backend/src/config/env.ts). Asked once per page load; any
// failure counts as "off", so the real MSG91 login is always the fallback.
export const fetchOtpDevMode = () => {
  devModePromise ??= authApi
    .get<{ otpDevMode: boolean }>("/auth/dev-mode")
    .then((response) => response.data.otpDevMode === true)
    .catch(() => {
      // Don't remember a failed check (e.g. backend still starting) for the
      // rest of the page's life — ask again next time.
      devModePromise = null;
      return false;
    });

  return devModePromise;
};
