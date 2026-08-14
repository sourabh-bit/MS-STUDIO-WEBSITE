import mongoose, { Schema } from "mongoose";

const otpChallengeSchema = new Schema(
  {
    contact: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    channel: {
      type: String,
      enum: ["phone", "email"],
      required: true,
    },
    name: {
      type: String,
      default: "",
      trim: true,
    },
    email: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },
    codeHash: {
      type: String,
      required: true,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    consumedAt: {
      type: Date,
      default: null,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

// TTL cleanup: Mongo removes the document ~1hr after it expires so stale challenges don't pile up.
otpChallengeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 3600 });

export type OtpChallengeDocument = mongoose.HydratedDocument<
  mongoose.InferSchemaType<typeof otpChallengeSchema>
>;

export const OtpChallenge =
  mongoose.models.OtpChallenge ||
  mongoose.model("OtpChallenge", otpChallengeSchema, "otp_challenges");
