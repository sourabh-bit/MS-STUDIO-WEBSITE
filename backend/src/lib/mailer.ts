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
    replyTo: env.resendReplyTo,
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

const BRAND_COLOR = "#a8768a";

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
  const invoiceNo = escapeHtml(params.invoiceNo);

  const hasDue = params.remainingAmount !== undefined && params.payRemainingUrl;
  const dueLabel = hasDue ? formatInr(params.remainingAmount as number) : "";

  const dueTextBlock = hasDue
    ? `\n\nBalance remaining for ${params.courseName}: Rs. ${dueLabel}\nYou can pay it here: ${params.payRemainingUrl}`
    : "";

  const dueHtmlBlock = hasDue
    ? `<tr>
         <td style="padding:0 32px 28px;">
           <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#faf6f1;border:1px solid #ecdfe3;border-radius:10px;">
             <tr>
               <td style="padding:20px 24px;">
                 <p style="margin:0 0 4px;font-size:12px;letter-spacing:0.06em;text-transform:uppercase;color:#8a7a83;">Balance Remaining</p>
                 <p style="margin:0 0 16px;font-size:15px;color:#3a3235;">for <strong>${course}</strong></p>
                 <p style="margin:0 0 18px;font-size:26px;font-weight:700;color:#3a3235;">&#8377;${dueLabel}</p>
                 <a href="${params.payRemainingUrl}" style="display:inline-block;padding:12px 28px;background:${BRAND_COLOR};color:#ffffff;text-decoration:none;border-radius:999px;font-size:13px;letter-spacing:0.04em;font-weight:600;">Pay Remaining Balance</a>
               </td>
             </tr>
           </table>
         </td>
       </tr>`
    : "";

  const html = `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4efe9;padding:32px 0;font-family:Georgia,'Times New Roman',serif;">
  <tr>
    <td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 4px 18px rgba(60,40,50,0.06);">
        <tr>
          <td style="padding:32px 32px 8px;text-align:center;">
            <p style="margin:0;font-size:11px;letter-spacing:0.28em;text-transform:uppercase;color:${BRAND_COLOR};font-family:Arial,Helvetica,sans-serif;">Meera Sakhrani Beauty</p>
          </td>
        </tr>
        <tr>
          <td style="padding:8px 32px 24px;text-align:center;border-bottom:1px solid #f0e6ea;">
            <h1 style="margin:0;font-size:22px;font-weight:400;color:#3a3235;">Payment Confirmed</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:28px 32px 8px;font-family:Arial,Helvetica,sans-serif;font-size:14.5px;line-height:1.65;color:#3a3235;">
            <p style="margin:0 0 16px;">Dear ${name},</p>
            <p style="margin:0 0 16px;">Thank you for choosing Meera Sakhrani Beauty. We're pleased to confirm that we've received your payment of <strong>&#8377;${amountLabel}</strong> towards <strong>${course}</strong>.</p>
            <p style="margin:0 0 8px;">Your GST invoice (No. <strong>${invoiceNo}</strong>) is attached to this email as a PDF for your records.</p>
          </td>
        </tr>
        ${dueHtmlBlock}
        <tr>
          <td style="padding:4px 32px 8px;font-family:Arial,Helvetica,sans-serif;font-size:14.5px;line-height:1.65;color:#3a3235;">
            <p style="margin:0 0 16px;">If you have any questions about this invoice or your enrollment, simply reply to this email — we're happy to help.</p>
            <p style="margin:24px 0 0;">Warm regards,<br><strong>Team Meera Sakhrani Beauty</strong></p>
          </td>
        </tr>
        <tr>
          <td style="padding:24px 32px 28px;border-top:1px solid #f0e6ea;margin-top:16px;">
            <p style="margin:16px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#a99aa1;text-align:center;">This is a payment confirmation for your records. Please retain it for your files.</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`;

  const text = `Dear ${params.customerName},

Thank you for choosing Meera Sakhrani Beauty. We're pleased to confirm that we've received your payment of Rs. ${amountLabel} towards ${params.courseName}.

Your GST invoice (No. ${params.invoiceNo}) is attached to this email as a PDF for your records.${dueTextBlock}

If you have any questions about this invoice or your enrollment, simply reply to this email — we're happy to help.

Warm regards,
Team Meera Sakhrani Beauty`;

  const { error } = await getResendClient().emails.send({
    from: env.resendFrom,
    replyTo: env.resendReplyTo,
    to,
    subject: `Your Invoice ${params.invoiceNo} — Meera Sakhrani Beauty`,
    text,
    html,
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
