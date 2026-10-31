import axios from "axios";

import { env } from "../config/env.js";
import { logger } from "./logger.js";

export const isMsg91EmailConfigured = () =>
  Boolean(env.msg91AuthKey && env.msg91EmailTemplateId && env.msg91EmailDomain);

// MSG91 Email API — https://docs.msg91.com/reference/send-email
// The template (built in the MSG91 dashboard) must use the variables
// {{name}} and {{otp}}; MSG91 fills them in from `variables` below.
export const sendOtpEmailViaMsg91 = async (to: string, name: string, code: string) => {
  try {
    await axios.post(
      "https://control.msg91.com/api/v5/email/send",
      {
        recipients: [
          {
            to: [{ email: to, name: name || to }],
            variables: { name: name || "there", otp: code },
          },
        ],
        from: { email: env.msg91EmailFrom || `no-reply@${env.msg91EmailDomain}` },
        domain: env.msg91EmailDomain,
        template_id: env.msg91EmailTemplateId,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          authkey: env.msg91AuthKey,
        },
        timeout: 15000,
      },
    );
  } catch (error) {
    logger.error("MSG91 OTP email send failed.", {
      message: error instanceof Error ? error.message : "Unknown error",
      response: axios.isAxiosError(error) ? error.response?.data : undefined,
    });
    throw new Error("Unable to email the code right now. Please try again.");
  }
};
