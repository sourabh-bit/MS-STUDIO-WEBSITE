import axios from "axios";

import { env } from "../config/env.js";
import { logger } from "./logger.js";

const MSG91_VERIFY_ACCESS_TOKEN_URL = "https://control.msg91.com/api/v5/widget/verifyAccessToken";

export type Msg91WidgetVerification = {
  verified: boolean;
  mobile: string;
};

// MSG91 OTP Widget: the widget itself runs client-side and hands back an
// access token after the user enters a correct code. That token must be
// verified here, server-side, with the account's secret Authkey — trusting
// the widget's client-side "success" callback alone would let anyone forge
// a login by just calling our success handler directly with a fake token.
export const verifyMsg91WidgetToken = async (
  accessToken: string,
): Promise<Msg91WidgetVerification> => {
  if (!env.msg91AuthKey) {
    throw new Error("MSG91 is not configured.");
  }

  try {
    const response = await axios.post(
      MSG91_VERIFY_ACCESS_TOKEN_URL,
      {
        authkey: env.msg91AuthKey,
        "access-token": accessToken,
      },
      { timeout: 15000 },
    );

    const data = response.data as { type?: string; message?: string };

    if (data.type !== "success" || !data.message) {
      return { verified: false, mobile: "" };
    }

    return { verified: true, mobile: data.message };
  } catch (error) {
    logger.error("MSG91 widget token verification failed.", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    throw new Error("Unable to verify the OTP right now. Please try again.");
  }
};
