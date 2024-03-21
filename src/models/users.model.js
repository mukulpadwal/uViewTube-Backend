import { Schema, model } from "mongoose";
import validateEmail from "../util/validateEmail.js";
import bcrypt from "bcrypt";

const userSchema = new Schema(
  {
    watchHistory: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    username: {
      type: String,
      unique: true,
      required: true,
      index: true,
      lowercase: true,
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
      trim: true,
      validate: (value) => validateEmail(value),
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    avatar: {
      type: String,
      required: true,
    },
    coverImage: {
      type: String,
    },
    password: {
      type: String,
      required: [true, "Password is required..."],
      min: 8,
    },
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true }
);

// Hashing the password before saving to DB
userSchema.pre("save", async function (next) {
  // Logic to hash-password
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

export const User = model("User", userSchema);
