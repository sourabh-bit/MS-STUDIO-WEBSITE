import axios from "axios";
import type { NextFunction, Request, Response } from "express";

import { env } from "../config/env.js";
import { isHttpError } from "../lib/http-error.js";
import { logger } from "../lib/logger.js";
import type { AuthenticatedRequest } from "../middleware/require-auth.js";
import {
  checkPaymentStatus,
  initiatePayment,
  processPaymentAdvice,
  processPaymentReturn,
  refundPayment,
} from "../services/payment.service.js";
import type { ParsedGatewayRequest } from "../types/payment.js";

const normaliseTextPayload = (value: string) => {
  const trimmed = value.trim();

  if (!trimmed) {
    return {};
  }

  if (trimmed.startsWith("{")) {
    return JSON.parse(trimmed) as Record<string, unknown>;
  }

  return Object.fromEntries(new URLSearchParams(trimmed).entries());
};

// The bank's return post and advice webhook are parsed as raw bytes at the
// route level (see payment.routes.ts) rather than relying on the global
// body parser to guess the content type correctly — form-urlencoded and
// JSON both show up in the wild depending on payment mode.
const extractGatewayPayload = (request: ParsedGatewayRequest): Record<string, unknown> => {
  if (Buffer.isBuffer(request.body)) {
    return normaliseTextPayload(request.body.toString("utf8"));
  }

  if (typeof request.body === "string") {
    return normaliseTextPayload(request.body);
  }

  if (request.body && typeof request.body === "object") {
    return request.body as Record<string, unknown>;
  }

  return {};
};

const normalizeMobileNumber = (value: unknown) => {
  const digits = String(value ?? "").replace(/\D/g, "");

  if (digits.length === 10) {
    return digits;
  }

  if (digits.length === 11 && digits.startsWith("0")) {
    return digits.slice(1);
  }

  if (digits.length === 12 && digits.startsWith("91")) {
    return digits.slice(2);
  }

  return digits;
};

const extractAxiosErrorMessage = (data: unknown) => {
  if (typeof data === "string") {
    return data.trim();
  }

  if (data && typeof data === "object" && "message" in data) {
    return String((data as { message?: unknown }).message || "").trim();
  }

  try {
    return JSON.stringify(data);
  } catch {
    return "";
  }
};

const respondWithPaymentError = (error: unknown, response: Response): boolean => {
  if (isHttpError(error)) {
    response.status(error.statusCode).json({ message: error.message });
    return true;
  }

  if (!axios.isAxiosError(error)) {
    return false;
  }

  const message =
    extractAxiosErrorMessage(error.response?.data) ||
    error.message ||
    "Upstream payment gateway request failed.";

  response.status(502).json({ message });
  return true;
};

export const initiatePaymentHandler = async (
  request: AuthenticatedRequest,
  response: Response,
  next: NextFunction,
) => {
  try {
    const user = request.user;

    if (!user) {
      response.status(401).json({ message: "Please log in to continue." });
      return;
    }

    const { amount, courseName, variant, feeLabel, summaryLabel } = request.body as Record<
      string,
      unknown
    >;

    if (!amount || !courseName || !variant) {
      response.status(400).json({ message: "Missing required payment fields." });
      return;
    }

    const parsedAmount = Number(amount);

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      response.status(400).json({ message: "Amount must be a valid positive number." });
      return;
    }

    const normalizedMobile = normalizeMobileNumber(user.phone);

    if (normalizedMobile.length !== 10) {
      response.status(400).json({
        message: "Your account is missing a valid mobile number. Please log in again.",
      });
      return;
    }

    const result = await initiatePayment({
      userId: user.id,
      customerName: user.name || "Guest",
      email: user.email,
      mobile: normalizedMobile,
      amount: parsedAmount,
      courseName: String(courseName).trim(),
      variant: String(variant).trim().toLowerCase() === "offline" ? "offline" : "online",
      feeLabel: String(feeLabel || "").trim(),
      summaryLabel: String(summaryLabel || "").trim(),
    });

    response.status(200).json(result);
  } catch (error) {
    if (respondWithPaymentError(error, response)) {
      return;
    }

    next(error);
  }
};

export const paymentReturnHandler = async (
  request: ParsedGatewayRequest,
  response: Response,
) => {
  const payload = extractGatewayPayload(request);

  try {
    const result = await processPaymentReturn(payload);
    response.redirect(302, result.redirectUrl);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to verify payment response.";
    const redirectUrl = new URL("/failure", env.frontendBaseUrl);
    const merchantTxnNo = String(payload.merchantTxnNo || "").trim();

    if (merchantTxnNo) {
      redirectUrl.searchParams.set("merchantTxnNo", merchantTxnNo);
    }

    redirectUrl.searchParams.set("message", message);
    response.redirect(302, redirectUrl.toString());
  }
};

// Always acknowledge with 200 — the bank retries the advice on any non-200
// response, and a retry storm doesn't fix a hash mismatch or a missing
// payment record, both of which are already logged inside the service.
export const paymentAdviceHandler = async (
  request: ParsedGatewayRequest,
  response: Response,
) => {
  const payload = extractGatewayPayload(request);

  try {
    await processPaymentAdvice(payload);
  } catch (error) {
    logger.error("Failed to process ICICI payment advice.", {
      message: error instanceof Error ? error.message : "unknown error",
    });
  }

  response.status(200).json({ received: true });
};

export const paymentStatusHandler = async (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  try {
    const merchantTxnNo = String(
      request.params.merchantTxnNo || request.query.merchantTxnNo || "",
    ).trim();

    if (!merchantTxnNo) {
      response.status(400).json({ message: "merchantTxnNo is required." });
      return;
    }

    const result = await checkPaymentStatus(merchantTxnNo);
    response.status(200).json(result);
  } catch (error) {
    if (respondWithPaymentError(error, response)) {
      return;
    }

    next(error);
  }
};

export const refundPaymentHandler = async (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  try {
    const merchantTxnNo = String(request.params.merchantTxnNo || "").trim();

    if (!merchantTxnNo) {
      response.status(400).json({ message: "merchantTxnNo is required." });
      return;
    }

    const { amount, addlParam1 } = request.body as Record<string, unknown>;
    const parsedAmount = amount !== undefined ? Number(amount) : undefined;

    if (parsedAmount !== undefined && (!Number.isFinite(parsedAmount) || parsedAmount <= 0)) {
      response.status(400).json({ message: "amount must be a valid positive number." });
      return;
    }

    const result = await refundPayment(
      merchantTxnNo,
      parsedAmount,
      addlParam1 ? String(addlParam1) : undefined,
    );

    response.status(200).json(result);
  } catch (error) {
    if (respondWithPaymentError(error, response)) {
      return;
    }

    next(error);
  }
};
