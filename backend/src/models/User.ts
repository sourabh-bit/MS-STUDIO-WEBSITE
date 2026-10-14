import mongoose, { Schema } from "mongoose";

import { classModel, type ClassVariant } from "../db/class-databases.js";

const userSchema = new Schema(
  {
    phone: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },
    email: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
      index: true,
    },
    name: {
      type: String,
      default: "",
      trim: true,
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

export type UserDocument = mongoose.HydratedDocument<
  mongoose.InferSchemaType<typeof userSchema>
>;

export const User =
  mongoose.models.User || mongoose.model("User", userSchema, "users");

// The users of one class's database — see db/class-databases.ts.
export const userModelFor = (variant: ClassVariant) => classModel(variant, "User", userSchema, "users");
