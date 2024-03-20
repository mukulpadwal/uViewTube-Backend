import { Schema, model } from "mongoose";

const tweetSchema = new Schema(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    content: {
      type: String,
      trim: true,
      required: true,
      max: 120,
    },
  },
  { timestamps: true }
);

export default Tweet = model("Tweet", tweetSchema);
