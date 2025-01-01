import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

export default async function connectToDB() {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DB_NAME}`
    );

    console.log(
      `MongoDB connected! DB host : ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.error(`MongoDB connection Error :: ${error}`);
    process.exit(1);
  }
}
