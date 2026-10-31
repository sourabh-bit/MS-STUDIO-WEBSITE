export type AuthUser = {
  id: string;
  phone: string;
  email: string;
  name: string;
};

// Which class someone is logging in for — the backend keeps each class's
// users and OTP codes in that class's own database.
export type ClassVariant = "online" | "offline";

export type RequestOtpPayload = {
  name: string;
  mobile: string;
  email: string;
  variant: ClassVariant;
  // "email" sends the code to the email address instead of by SMS — the
  // backend only allows it for non-Indian numbers.
  channel?: "phone" | "email";
};

export type RequestOtpResponse = {
  sent: boolean;
  expiresInSeconds: number;
  devCode?: string;
};

export type VerifyOtpResponse = {
  user: AuthUser;
};

export type MeResponse = {
  user: AuthUser | null;
};
