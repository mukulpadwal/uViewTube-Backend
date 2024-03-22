import multer from "multer";

const imageStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp/");
  },

  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

export const uploadImage = multer({ storage: imageStorage });
