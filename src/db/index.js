import mongoose from "mongoose";
import conf from "../conf/conf.js";
import constants from "../constants.js";
// Function to connect to the database

async function connectToDataBase() {
  try {
    const connectionInstance = await mongoose.connect(
      `${conf.mongoAtlasURI}/${constants.DB_NAME}`
    );

    console.log(
      `Successfully connected to database : HOST : ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.log(
      `Error while connecting to the database... : ERROR : ${error.message}`
    );
  }
}

export default connectToDataBase;
