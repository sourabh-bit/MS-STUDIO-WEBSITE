import nodemailer from "nodemailer";

import { env } from "../config/env.js";

let transporter: nodemailer.Transporter | null = null;

export const isEmailConfigured = () =>
  Boolean(env.smtpHost && env.smtpUser && env.smtpPass);

const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.smtpHost,
      port: env.smtpPort,
      secure: env.smtpPort === 465,
      auth: {
        user: env.smtpUser,
        pass: env.smtpPass,
      },
    });
  }

  return transporter;
};

export const sendOtpEmail = async (to: string, code: string) => {
  await getTransporter().sendMail({
    from: env.smtpFrom,
    to,
    subject: `${code} is your Meera Sakhrani login code`,
    text: `Your login code is ${code}. It expires in 5 minutes. Do not share this code with anyone.`,
    html: `<p>Your login code is <strong style="font-size:1.2em;letter-spacing:0.15em;">${code}</strong>.</p><p>It expires in 5 minutes. Do not share this code with anyone.</p>`,
  });
};
