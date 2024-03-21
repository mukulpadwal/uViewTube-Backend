const conf = {
  PORT: process.env.BACKEND_SERVER_PORT,
  mongoAtlasURI: String(process.env.MONGO_ATLAS_URI),
  cloudinaryCloudName: String(process.env.CLOUDINARY_CLOUD_NAME),
  cloudinaryApiKey: String(process.env.CLOUDINARY_API_KEY),
  cloudinaryApiSecret: String(process.env.CLOUDINARY_API_SECRET),
};

export default conf;
