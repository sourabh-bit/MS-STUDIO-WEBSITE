import mongoose from "mongoose";

import { env } from "../config/env.js";
import { logger } from "../lib/logger.js";

let connectionPromise: Promise<typeof mongoose> | null = null;
let listenersAttached = false;

const attachConnectionListeners = () => {
  if (listenersAttached) {
    return;
  }

  listenersAttached = true;

  mongoose.connection.on("connected", () => {
    logger.info("MongoDB connection established.");
  });

  mongoose.connection.on("error", (error) => {
    logger.error("MongoDB connection error.", {
      message: error.message,
    });
  });
};

export const connectToDatabase = async () => {
  attachConnectionListeners();

  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (!connectionPromise) {
    connectionPromise = mongoose.connect(env.mongodbUri, {
      autoIndex: true,
    });
  }

  try {
    await connectionPromise;
  } catch (error) {
    connectionPromise = null;
    throw error;
  }

  return mongoose.connection;
};
