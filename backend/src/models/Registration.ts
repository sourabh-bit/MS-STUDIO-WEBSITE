import mongoose, { Schema } from "mongoose";

import type { RegistrationVariant } from "../types/registration.js";

const registrationSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    city: {
      type: String,
      default: "",
      trim: true,
    },
    state: {
      type: String,
      default: "",
      trim: true,
    },
    instagramHandle: {
      type: String,
      required: true,
      trim: true,
    },
    experienceMonths: {
      type: Number,
      default: null,
    },
    pan: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    hasGstin: {
      type: Boolean,
      default: false,
    },
    gstin: {
      type: String,
      default: "",
      trim: true,
      uppercase: true,
    },
    courseName: {
      type: String,
      required: true,
      trim: true,
    },
    variant: {
      type: String,
      enum: ["online", "offline"] satisfies RegistrationVariant[],
      default: "offline",
    },
    amount: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export type RegistrationDocument = mongoose.HydratedDocument<
  mongoose.InferSchemaType<typeof registrationSchema>
>;

export const Registration =
  mongoose.models.Registration ||
  mongoose.model("Registration", registrationSchema, "registrations");
