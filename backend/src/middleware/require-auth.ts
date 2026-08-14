import type { NextFunction, Request, Response } from "express";

import { env } from "../config/env.js";
import { verifySessionToken } from "../lib/jwt.js";
import { getUserById } from "../services/auth.service.js";

export type AuthenticatedUser = {
  id: string;
  phone: string;
  email: string;
  name: string;
};

export type AuthenticatedRequest = Request & {
  user?: AuthenticatedUser;
};

export const requireAuth = async (
  request: AuthenticatedRequest,
  response: Response,
  next: NextFunction,
) => {
  try {
    const token = request.cookies?.[env.authCookieName];
    const payload = token ? verifySessionToken(token) : null;

    if (!payload) {
      response.status(401).json({ message: "Please log in to continue." });
      return;
    }

    const user = await getUserById(payload.userId);

    if (!user) {
      response.status(401).json({ message: "Please log in to continue." });
      return;
    }

    request.user = user;
    next();
  } catch (error) {
    next(error);
  }
};
