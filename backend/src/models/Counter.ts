import mongoose, { Schema } from "mongoose";

// Generic named sequence counter. Used for invoice numbering today; the
// _id is the sequence's name (e.g. "invoice") so more sequences can share
// this collection later without a schema change.
const counterSchema = new Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});

export type CounterDocument = mongoose.HydratedDocument<
  mongoose.InferSchemaType<typeof counterSchema>
>;

export const Counter =
  mongoose.models.Counter || mongoose.model("Counter", counterSchema, "counters");
