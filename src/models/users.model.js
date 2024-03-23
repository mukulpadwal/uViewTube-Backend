import { Schema, model } from "mongoose";
import validateEmail from "../utils/validateEmail.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import conf from "../conf/conf.js";

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
      required: [true, "Email is required..."],
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
    avatarPublicId: {
      type: String,
      required: true,
    },
    coverImage: {
      type: String,
    },
    coverImagePublicId: {
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

// isPasswordCorrect(password) : Checks if the password entered by user is correct or not
// returns : true/false
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// generateAccessToken() : generates jwt token and returns it
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      username: this.username,
      email: this.email,
      fullName: this.fullName,
    },
    conf.accessTokenSecret,
    { expiresIn: conf.accessTokenExpiry }
  );
};

// generateRefreshToken() : generates jwt token and returns it
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    conf.refreshTokenSecret,
    {
      expiresIn: conf.refreshTokenExpiry,
    }
  );
};

export const User = model("User", userSchema);
