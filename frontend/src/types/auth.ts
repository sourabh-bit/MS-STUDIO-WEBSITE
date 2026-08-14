export type AuthUser = {
  id: string;
  phone: string;
  email: string;
  name: string;
};

export type RequestOtpPayload = {
  name: string;
  mobile: string;
  email: string;
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
