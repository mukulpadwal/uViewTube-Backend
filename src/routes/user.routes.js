import { Router } from "express";
import { healthCheck, registerUser } from "../controllers/user.controllers.js";
import { uploadImage } from "../middlewares/multer.middleware.js";

const router = Router();

// Route 1 : helath-check Route
// DESC : checks the working of route
router.route("/health-check").get(healthCheck);

// Route 2 : register-user Route
router.route("/register-user").post(
  uploadImage.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  registerUser
);

export default router;
