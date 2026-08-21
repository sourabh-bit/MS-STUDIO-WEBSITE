import type { CookieOptions, NextFunction, Request, Response } from "express";

import { env } from "../config/env.js";
import { isHttpError } from "../lib/http-error.js";
import { SESSION_TTL_SECONDS, verifySessionToken } from "../lib/jwt.js";
import { getUserById, requestOtp, verifyOtp, verifyWidgetLogin } from "../services/auth.service.js";

const getCookieOptions = (): CookieOptions => ({
  httpOnly: true,
  secure: env.nodeEnv === "production",
  sameSite: env.nodeEnv === "production" ? "none" : "lax",
  path: "/",
});

const respondWithAuthError = (error: unknown, response: Response): boolean => {
  if (isHttpError(error)) {
    response.status(error.statusCode).json({ message: error.message });
    return true;
  }

  return false;
};

export const requestOtpHandler = async (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  try {
    const { name, mobile, email } = request.body as Record<string, unknown>;

    if (
      !name ||
      typeof name !== "string" ||
      !mobile ||
      typeof mobile !== "string" ||
      !email ||
      typeof email !== "string"
    ) {
      response
        .status(400)
        .json({ message: "Enter your name, mobile number and email." });
      return;
    }

    const result = await requestOtp({ name, mobile, email });
    response.status(200).json({
      sent: true,
      expiresInSeconds: result.expiresInSeconds,
      devCode: result.devCode,
    });
  } catch (error) {
    if (respondWithAuthError(error, response)) {
      return;
    }

    next(error);
  }
};

export const verifyOtpHandler = async (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  try {
    const { mobile, code } = request.body as Record<string, unknown>;

    if (!mobile || typeof mobile !== "string" || !code || typeof code !== "string") {
      response.status(400).json({ message: "Enter the code sent to you." });
      return;
    }

    const { token, user } = await verifyOtp(mobile, code);

    response.cookie(env.authCookieName, token, {
      ...getCookieOptions(),
      maxAge: SESSION_TTL_SECONDS * 1000,
    });
    response.status(200).json({ user });
  } catch (error) {
    if (respondWithAuthError(error, response)) {
      return;
    }

    next(error);
  }
};

export const verifyWidgetHandler = async (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  try {
    const { accessToken, name, email } = request.body as Record<string, unknown>;

    if (!accessToken || typeof accessToken !== "string") {
      response.status(400).json({ message: "Missing OTP verification token." });
      return;
    }

    if (!name || typeof name !== "string" || !email || typeof email !== "string") {
      response.status(400).json({ message: "Enter your name and email." });
      return;
    }

    const { token, user } = await verifyWidgetLogin(accessToken, name, email);

    response.cookie(env.authCookieName, token, {
      ...getCookieOptions(),
      maxAge: SESSION_TTL_SECONDS * 1000,
    });
    response.status(200).json({ user });
  } catch (error) {
    if (respondWithAuthError(error, response)) {
      return;
    }

    next(error);
  }
};

export const meHandler = async (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  try {
    const token = request.cookies?.[env.authCookieName];
    const payload = token ? verifySessionToken(token) : null;

    if (!payload) {
      response.status(200).json({ user: null });
      return;
    }

    const user = await getUserById(payload.userId);
    response.status(200).json({ user });
  } catch (error) {
    next(error);
  }
};

export const logoutHandler = (_request: Request, response: Response) => {
  response.clearCookie(env.authCookieName, getCookieOptions());
  response.status(200).json({ ok: true });
};
