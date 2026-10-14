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

const BRAND_COLOR = "#a8768a";

// Session details for the online masterclass, shown as their own block in
// its confirmation email. Offline emails don't pass this and are unchanged.
export type InvoiceEmailClassDetails = {
  dateLabel: string;
  timeLabel: string;
  modeLabel: string;
  joiningNote: string;
  supportWhatsApp: string;
};

export type InvoiceEmailParams = {
    invoiceNo: string;
    customerName: string;
    courseName: string;
    amount: number;
    pdfBuffer: Buffer;
    // Present only when the course isn't fully paid off yet — nudges the
    // customer straight to their next (second-installment) payment.
    remainingAmount?: number;
    payRemainingUrl?: string;
    // True only for the specific payment that brings the balance to zero
    // (always a second-installment payment — the advance alone never
    // covers the full course fee). Shows a congratulatory note instead of
    // the due-balance block.
    isFullyPaid?: boolean;
    // The real total across every payment (advance + all installments) —
    // shown alongside isFullyPaid so "Congratulations, fully paid" doesn't
    // sit next to just this one transaction's (possibly much smaller)
    // amount, which reads as contradictory on its own.
    totalCoursePaid?: number;
    classDetails?: InvoiceEmailClassDetails;
};

const SANS = "Arial,Helvetica,sans-serif";

// The online masterclass is a single payment that enrols the student, so
// its email leads with the enrolment (and the class itself) rather than
// reading like a bare payment receipt.
const buildOnlineEnrolmentEmail = (params: InvoiceEmailParams, details: InvoiceEmailClassDetails) => {
  const firstName = params.customerName.trim().split(/\s+/)[0] || params.customerName;
  const course = escapeHtml(params.courseName);
  const invoiceNo = escapeHtml(params.invoiceNo);

  const card = (title: string, body: string) =>
    `<tr>
       <td style="padding:0 32px 22px;">
         <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#faf6f1;border:1px solid #ecdfe3;border-radius:10px;">
           <tr>
             <td style="padding:20px 24px;font-family:${SANS};">
               <p style="margin:0 0 12px;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:${BRAND_COLOR};font-weight:600;">${title}</p>
               ${body}
             </td>
           </tr>
         </table>
       </td>
     </tr>`;

  const row = (label: string, value: string, emphasise = false) =>
    `<tr>
       <td style="padding:6px 0;font-size:13px;color:#8a7a83;vertical-align:top;">${label}</td>
       <td style="padding:6px 0;font-size:${emphasise ? "16px" : "14px"};color:#3a3235;text-align:right;${emphasise ? "font-weight:700;" : ""}">${value}</td>
     </tr>`;

  const classCard = card(
    "Your Class Details",
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
       ${row("Date", escapeHtml(details.dateLabel))}
       ${row("Time", escapeHtml(details.timeLabel))}
       ${row("Mode", escapeHtml(details.modeLabel))}
     </table>`,
  );

  const step = (number: number, text: string) =>
    `<tr>
       <td style="padding:6px 12px 6px 0;vertical-align:top;width:26px;">
         <div style="width:24px;height:24px;line-height:24px;border-radius:50%;background:${BRAND_COLOR};color:#ffffff;font-size:12px;font-weight:700;text-align:center;">${number}</div>
       </td>
       <td style="padding:8px 0 6px;font-size:14px;line-height:1.55;color:#3a3235;">${text}</td>
     </tr>`;

  const nextStepsCard = card(
    "What Happens Next",
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
       ${step(1, `Your GST invoice (No. <strong>${invoiceNo}</strong>) is attached to this email — please keep it for your records.`)}
       ${step(2, escapeHtml(details.joiningNote))}
       ${step(3, "Mark the date in your calendar and join a few minutes early on a stable internet connection.")}
     </table>`,
  );

  const html = `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4efe9;padding:32px 0;font-family:Georgia,'Times New Roman',serif;">
  <tr>
    <td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 4px 18px rgba(60,40,50,0.06);">
        <tr>
          <td style="height:6px;background:${BRAND_COLOR};font-size:0;line-height:0;">&nbsp;</td>
        </tr>
        <tr>
          <td style="padding:30px 32px 6px;text-align:center;">
            <p style="margin:0;font-size:11px;letter-spacing:0.28em;text-transform:uppercase;color:${BRAND_COLOR};font-family:${SANS};">Meera Sakhrani Beauty</p>
          </td>
        </tr>
        <tr>
          <td style="padding:10px 32px 4px;text-align:center;">
            <p style="margin:0 0 6px;font-size:30px;line-height:1;">&#127881;</p>
            <h1 style="margin:0;font-size:26px;font-weight:400;color:#3a3235;">Congratulations, ${escapeHtml(firstName)}!</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:8px 40px 26px;text-align:center;border-bottom:1px solid #f0e6ea;">
            <p style="margin:0;font-family:${SANS};font-size:15px;line-height:1.6;color:#6b5d63;">You're officially enrolled in the <strong style="color:#3a3235;">${course}</strong>.</p>
          </td>
        </tr>
        <tr>
          <td style="padding:26px 32px 22px;font-family:${SANS};font-size:14.5px;line-height:1.7;color:#3a3235;">
            <p style="margin:0 0 14px;">Dear ${escapeHtml(params.customerName)},</p>
            <p style="margin:0 0 14px;">Welcome to the class! We're delighted to have you with us. Your seat for the live online masterclass is confirmed, and Meera can't wait to share her techniques, tips and on-the-job secrets with you.</p>
            <p style="margin:0;">We've received your payment of <strong>&#8377;${formatInr(params.amount)}</strong> — here's everything you need to know.</p>
          </td>
        </tr>
        ${classCard}
        ${nextStepsCard}
        <tr>
          <td style="padding:0 32px 28px;font-family:${SANS};font-size:14.5px;line-height:1.65;color:#3a3235;">
            <p style="margin:0;">See you in class!<br>Warm regards,<br><strong>Team Meera Sakhrani Beauty</strong></p>
          </td>
        </tr>
        <tr>
          <td style="padding:18px 32px 24px;border-top:1px solid #f0e6ea;">
            <p style="margin:0;font-family:${SANS};font-size:11px;color:#a99aa1;text-align:center;">This email confirms your enrolment and payment. Please retain it, along with the attached invoice, for your records.</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`;

  const text = `Congratulations, ${firstName}!

You're officially enrolled in the ${params.courseName}.

Dear ${params.customerName},

Welcome to the class! We're delighted to have you with us. Your seat for the live online masterclass is confirmed, and Meera can't wait to share her techniques, tips and on-the-job secrets with you.

YOUR CLASS DETAILS
Date: ${details.dateLabel}
Time: ${details.timeLabel}
Mode: ${details.modeLabel}

WHAT HAPPENS NEXT
1. Your GST invoice (No. ${params.invoiceNo}) is attached to this email — please keep it for your records.
2. ${details.joiningNote}
3. Mark the date in your calendar and join a few minutes early on a stable internet connection.

See you in class!
Warm regards,
Team Meera Sakhrani Beauty`;

  return {
    subject: `You're enrolled! ${params.courseName} — Invoice ${params.invoiceNo}`,
    text,
    html,
  };
};

// Builds the confirmation email without sending it, so a preview script can
// render exactly what customers receive.
export const buildInvoiceEmail = (params: InvoiceEmailParams) => {
  if (params.classDetails) {
    return buildOnlineEnrolmentEmail(params, params.classDetails);
  }

  const amountLabel = formatInr(params.amount);
  const name = escapeHtml(params.customerName);
  const course = escapeHtml(params.courseName);
  const invoiceNo = escapeHtml(params.invoiceNo);
  const totalPaidLabel =
    params.totalCoursePaid !== undefined ? formatInr(params.totalCoursePaid) : "";

  const hasDue = params.remainingAmount !== undefined && params.payRemainingUrl;
  const dueLabel = hasDue ? formatInr(params.remainingAmount as number) : "";

  const dueTextBlock = hasDue
    ? `\n\nBalance remaining for ${params.courseName}: Rs. ${dueLabel}\nYou can pay it here: ${params.payRemainingUrl}`
    : params.isFullyPaid
      ? `\n\nCongratulations — with this payment, you've now paid the full course fee for ${params.courseName} in full: Rs. ${totalPaidLabel} total. We look forward to welcoming you!`
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
    : params.isFullyPaid
      ? `<tr>
           <td style="padding:0 32px 28px;">
             <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#faf6f1;border:1px solid #ecdfe3;border-radius:10px;">
               <tr>
                 <td style="padding:20px 24px;text-align:center;">
                   <p style="margin:0 0 6px;font-size:12px;letter-spacing:0.06em;text-transform:uppercase;color:${BRAND_COLOR};">Congratulations</p>
                   <p style="margin:0 0 12px;font-size:15px;line-height:1.6;color:#3a3235;">Your course fee for <strong>${course}</strong> is now fully paid. We look forward to welcoming you!</p>
                   <p style="margin:0;font-size:12px;letter-spacing:0.04em;text-transform:uppercase;color:#8a7a83;">Total Paid</p>
                   <p style="margin:2px 0 0;font-size:22px;font-weight:700;color:#3a3235;">&#8377;${totalPaidLabel}</p>
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
            <p style="margin:0;">Warm regards,<br><strong>Team Meera Sakhrani Beauty</strong></p>
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

Warm regards,
Team Meera Sakhrani Beauty`;

  return { subject: `Your Invoice ${params.invoiceNo} — Meera Sakhrani Beauty`, text, html };
};

export const sendInvoiceEmail = async (to: string, params: InvoiceEmailParams) => {
  const { subject, text, html } = buildInvoiceEmail(params);

  const { error } = await getResendClient().emails.send({
    from: env.resendFrom,
    to,
    subject,
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
