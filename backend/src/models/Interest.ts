import { Schema } from "mongoose";

import { classModel, type ClassVariant } from "../db/class-databases.js";

// People who tapped "Register Interest" while a class wasn't taking
// sign-ups, so the team can message them when the next batch opens. No
// login is needed, so nothing here is verified — it's a contact list, not
// a registration.
const interestSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    // E.164.
    whatsappNumber: { type: String, required: true, trim: true, index: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    courseName: { type: String, required: true, trim: true },
  },
  { timestamps: true },
);

// Registering interest twice just refreshes the details.
interestSchema.index({ whatsappNumber: 1, courseName: 1 }, { unique: true });

export const interestModelFor = (variant: ClassVariant) =>
  classModel(variant, "Interest", interestSchema, "interests");
