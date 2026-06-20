import axios from "axios";
import type { NextFunction, Request, Response } from "express";

import { env } from "../config/env.js";
import type { ParsedCallbackRequest } from "../types/payment.js";
import {
  checkPaymentStatus,
  initiatePayment,
  processPaymentCallback,
} from "../services/payment.service.js";

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

const respondWithGatewayError = (
  error: unknown,
  response: Response,
): boolean => {
  if (!axios.isAxiosError(error)) {
    return false;
  }

  const statusCode =
    error.response?.status && error.response.status >= 400
      ? error.response.status
      : 502;

  const message =
    extractAxiosErrorMessage(error.response?.data) ||
    error.message ||
    "Upstream payment gateway request failed.";

  response.status(statusCode).json({
    message,
  });

  return true;
};

const extractCallbackPayload = (request: ParsedCallbackRequest) => {
  if (typeof request.body === "string") {
    return normaliseTextPayload(request.body);
  }

  if (Buffer.isBuffer(request.body)) {
    return normaliseTextPayload(request.body.toString("utf8"));
  }

  if (typeof request.rawBody === "string" && request.rawBody.trim()) {
    return normaliseTextPayload(request.rawBody);
  }

  if (request.body && typeof request.body === "object") {
    return request.body as Record<string, unknown>;
  }

  return {};
};

const buildFailureRedirectUrl = (
  payload: Record<string, unknown>,
  fallbackMessage: string,
) => {
  const redirectUrl = new URL("/failure", env.frontendBaseUrl);
  const merchantTxnNo = String(payload.merchantTxnNo || "").trim();
  const txnId = String(payload.txnID || payload.transactionId || "").trim();
  const courseName = String(payload.course || payload.courseName || "").trim();
  const customerName = String(payload.name || payload.customerName || "").trim();
  const amount = String(payload.amount || "").trim();
  const variant = String(payload.variant || "").trim();
  const feeLabel = String(payload.feeLabel || "").trim();
  const summaryLabel = String(payload.summaryLabel || "").trim();
  const message =
    String(
      payload.txnRespDescription ||
        payload.respDescription ||
        payload.message ||
        fallbackMessage,
    ).trim() || fallbackMessage;

  if (merchantTxnNo) {
    redirectUrl.searchParams.set("merchantTxnNo", merchantTxnNo);
  }

  if (txnId) {
    redirectUrl.searchParams.set("txn", txnId);
  }

  if (courseName) {
    redirectUrl.searchParams.set("course", courseName);
  }

  if (customerName) {
    redirectUrl.searchParams.set("name", customerName);
  }

  if (amount) {
    redirectUrl.searchParams.set("amount", amount);
  }

  if (variant) {
    redirectUrl.searchParams.set("variant", variant);
  }

  if (feeLabel) {
    redirectUrl.searchParams.set("feeLabel", feeLabel);
  }

  if (summaryLabel) {
    redirectUrl.searchParams.set("summaryLabel", summaryLabel);
  }

  redirectUrl.searchParams.set("message", message);

  return redirectUrl.toString();
};

export const initiatePaymentHandler = async (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  try {
    const {
      customerName,
      email,
      mobile,
      amount,
      courseName,
      variant,
      feeLabel,
      summaryLabel,
    } = request.body as Record<string, unknown>;

    if (
      !customerName ||
      !email ||
      !mobile ||
      !amount ||
      !courseName ||
      !variant
    ) {
      response.status(400).json({
        message: "Missing required payment fields.",
      });
      return;
    }

    const normalizedMobile = normalizeMobileNumber(mobile);

    if (normalizedMobile.length !== 10) {
      response.status(400).json({
        message: "Phone number must be 10 digits after removing country code or leading zero.",
      });
      return;
    }

    const result = await initiatePayment({
      customerName: String(customerName).trim(),
      email: String(email).trim(),
      mobile: normalizedMobile,
      amount: Number(amount),
      courseName: String(courseName).trim(),
      variant:
        String(variant).trim().toLowerCase() === "offline"
          ? "offline"
          : "online",
      feeLabel: String(feeLabel || "").trim(),
      summaryLabel: String(summaryLabel || "").trim(),
    });

    response.status(200).json(result);
  } catch (error) {
    if (respondWithGatewayError(error, response)) {
      return;
    }

    next(error);
  }
};

export const paymentCallbackHandler = async (
  request: ParsedCallbackRequest,
  response: Response,
  next: NextFunction,
) => {
  const payload = extractCallbackPayload(request);

  try {
    const result = await processPaymentCallback(payload);

    response.redirect(302, result.redirectUrl);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to verify payment response.";

    response.redirect(302, buildFailureRedirectUrl(payload, message));
  }
};

export const paymentStatusHandler = async (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  try {
    const merchantTxnNo =
      String(request.params.merchantTxnNo || request.query.merchantTxnNo || "").trim();

    if (!merchantTxnNo) {
      response.status(400).json({
        message: "merchantTxnNo is required.",
      });
      return;
    }

    const result = await checkPaymentStatus(merchantTxnNo);
    response.status(200).json(result);
  } catch (error) {
    if (respondWithGatewayError(error, response)) {
      return;
    }

    next(error);
  }
};





