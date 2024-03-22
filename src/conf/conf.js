const conf = {
  PORT: process.env.BACKEND_SERVER_PORT,
  mongoAtlasURI: String(process.env.MONGO_ATLAS_URI),
  cloudinaryCloudName: String(process.env.CLOUDINARY_CLOUD_NAME),
  cloudinaryApiKey: String(process.env.CLOUDINARY_API_KEY),
  cloudinaryApiSecret: String(process.env.CLOUDINARY_API_SECRET),
  accessTokenSecret: String(process.env.JWT_ACCESS_TOKEN_SECRET),
  accessTokenExpiry: String(process.env.JWT_ACCESS_TOKEN_EXPIRY),
  refreshTokenSecret: String(process.env.JWT_REFRESH_TOKEN_SECRET),
  refreshTokenExpiry: String(process.env.JWT_REFRESH_TOKEN_EXPIRY),
};

export default conf;
