import { Resend } from "resend";

import { env } from "../config/env.js";

let resendClient: Resend | null = null;

export const isEmailConfigured = () => Boolean(env.resendApiKey);

const getResendClient = () => {
  if (!resendClient) {
    resendClient = new Resend(env.resendApiKey);
  }

  return resendClient;
};

export const sendOtpEmail = async (to: string, code: string) => {
  const { error } = await getResendClient().emails.send({
    from: env.resendFrom,
    to,
    subject: `${code} is your Meera Sakhrani login code`,
    text: `Your login code is ${code}. It expires in 5 minutes. Do not share this code with anyone.`,
    html: `<p>Your login code is <strong style="font-size:1.2em;letter-spacing:0.15em;">${code}</strong>.</p><p>It expires in 5 minutes. Do not share this code with anyone.</p>`,
  });

  if (error) {
    throw new Error(`Resend failed to send OTP email: ${error.message}`);
  }
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const formatInr = (amount: number) =>
  amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const sendInvoiceEmail = async (
  to: string,
  params: {
    invoiceNo: string;
    customerName: string;
    courseName: string;
    amount: number;
    pdfBuffer: Buffer;
    // Present only when the course isn't fully paid off yet — nudges the
    // customer straight to their next (second-installment) payment.
    remainingAmount?: number;
    payRemainingUrl?: string;
  },
) => {
  const amountLabel = formatInr(params.amount);
  const name = escapeHtml(params.customerName);
  const course = escapeHtml(params.courseName);

  const hasDue = params.remainingAmount !== undefined && params.payRemainingUrl;
  const dueLabel = hasDue ? formatInr(params.remainingAmount as number) : "";

  const dueTextBlock = hasDue
    ? `\n\nRemaining balance for ${params.courseName}: Rs. ${dueLabel}.\nPay it here: ${params.payRemainingUrl}`
    : "";

  const dueHtmlBlock = hasDue
    ? `<div style="margin-top:16px;padding:16px;border:1px solid #e5d9cf;border-radius:8px;background:#faf6f1;">
         <p style="margin:0 0 8px;">Remaining balance for <strong>${course}</strong>:</p>
         <p style="margin:0 0 12px;font-size:1.3em;font-weight:bold;">&#8377;${dueLabel}</p>
         <a href="${params.payRemainingUrl}" style="display:inline-block;padding:10px 20px;background:#a8768a;color:#fff;text-decoration:none;border-radius:999px;font-size:0.9em;">Pay Remaining Balance</a>
       </div>`
    : "";

  const { error } = await getResendClient().emails.send({
    from: env.resendFrom,
    to,
    subject: `Your invoice ${params.invoiceNo} — Meera Sakhrani Beauty`,
    text: `Dear ${params.customerName},\n\nThank you for your payment of Rs. ${amountLabel} towards ${params.courseName}. Please find your invoice attached.${dueTextBlock}\n\nRegards,\nMeera Sakhrani Beauty`,
    html: `<p>Dear ${name},</p><p>Thank you for your payment of <strong>&#8377;${amountLabel}</strong> towards <strong>${course}</strong>. Please find your invoice attached.</p>${dueHtmlBlock}<p style="margin-top:16px;">Regards,<br>Meera Sakhrani Beauty</p>`,
    attachments: [
      {
        filename: `${params.invoiceNo.replace(/\//g, "-")}.pdf`,
        content: params.pdfBuffer,
      },
    ],
  });

  if (error) {
    throw new Error(`Resend failed to send invoice email: ${error.message}`);
  }
};
