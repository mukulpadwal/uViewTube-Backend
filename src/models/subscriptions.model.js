import { Schema, model } from "mongoose";

const subscriptionSchems = new Schema(
  {
    subscriber: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    channel: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export default Subscription = model("Subscription", subscriptionSchems);
