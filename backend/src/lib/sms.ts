import axios from "axios";

import { env } from "../config/env.js";
import { logger } from "./logger.js";

export const isSmsConfigured = () =>
  Boolean(env.msg91AuthKey && env.msg91OtpTemplateId);

// MSG91 OTP API — https://docs.msg91.com/reference/send-otp
export const sendOtpSms = async (phone: string, code: string) => {
  try {
    await axios.post(
      "https://control.msg91.com/api/v5/otp",
      {},
      {
        params: {
          template_id: env.msg91OtpTemplateId,
          mobile: `91${phone}`,
          authkey: env.msg91AuthKey,
          otp: code,
          sender: env.msg91Sender,
        },
        timeout: 15000,
      },
    );
  } catch (error) {
    logger.error("MSG91 OTP send failed.", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    throw new Error("Unable to send the SMS code right now. Please try again.");
  }
};
