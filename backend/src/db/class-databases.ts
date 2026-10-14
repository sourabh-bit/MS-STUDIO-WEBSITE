import mongoose, { type Schema } from "mongoose";

import { env } from "../config/env.js";

// Each class keeps everything that belongs to it — users, OTP challenges,
// payments and registrations — in its own database (a separate "folder" in
// MongoDB Atlas): the offline class in MONGODB_DB_NAME (the connection's
// default database), the online class in MONGODB_ONLINE_DB_NAME. Both live
// on the same cluster connection, so there's no second login or pool.
export type ClassVariant = "online" | "offline";

export const CLASS_VARIANTS: ClassVariant[] = ["offline", "online"];

export const toClassVariant = (value: unknown): ClassVariant =>
  String(value ?? "").trim().toLowerCase() === "online" ? "online" : "offline";

const databaseFor = (variant: ClassVariant) =>
  variant === "online"
    ? mongoose.connection.useDb(env.mongodbOnlineDbName, { useCache: true })
    : mongoose.connection;

// Returns the model for `name` registered on the given class's database,
// creating it on first use. Typed loosely on purpose, matching how every
// model in this codebase is already declared (`mongoose.models.X || ...`).
export const classModel = (
  variant: ClassVariant,
  name: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  schema: Schema<any>,
  collection: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): mongoose.Model<any> => {
  const db = databaseFor(variant);
  return db.models[name] || db.model(name, schema, collection);
};
