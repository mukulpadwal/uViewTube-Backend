import { v2 as cloudinary } from "cloudinary";
import conf from "../conf/conf.js";
import fs from "fs";

cloudinary.config({
  cloud_name: conf.cloudinaryCloudName,
  api_key: conf.cloudinaryApiKey,
  api_secret: conf.cloudinaryApiSecret,
});

// Uploading the file
const uploadOnCloudinary = async (username, file) => {
  try {
    const { fieldname, filename, path } = file[0];

    const response = await cloudinary.uploader.upload(String(path), {
      resource_type: "auto",
      public_id: `${username}/${fieldname}/${filename}`,
    });

    fs.unlinkSync(file[0].path);

    return response;
  } catch (error) {
    console.log(`Error while uploading file : ERROR : ${error.message}`);
    fs.unlinkSync(file[0].path);
    process.exit(1);
  }
};

// Deleting the file
const deleteImageOnCloudinary = async (publicId) => {
  try {
    const response = await cloudinary.api.delete_resources([publicId], {
      type: "upload",
      resource_type: "image",
    });
    return response;
  } catch (error) {
    console.log(`Error while deleting file : ERROR : ${error.message}`);
  }
};

export { uploadOnCloudinary, deleteImageOnCloudinary };
