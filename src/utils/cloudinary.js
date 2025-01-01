import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function uploadToCloudinary(localFilePath) {
  try {
    if (!localFilePath) {
      return null;
    }
    
    const uploadResult = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    fs.unlinkSync(localFilePath);

    return uploadResult;
  } catch (error) {
    console.error(
      "Error while uploading your file to cloudinary :: ERROR :: ",
      error
    );
    fs.unlinkSync(localFilePath);
    return null;
  }
}

async function deleteFromCloudinary(publicID) {
  try {
    const destroyedResult = await cloudinary.uploader.destroy(publicID);

    return destroyedResult;
  } catch (error) {
    console.error(
      "Error while deleting your file to cloudinary :: ERROR :: ",
      error
    );
    return null;
  }
}

export { uploadToCloudinary, deleteFromCloudinary };
