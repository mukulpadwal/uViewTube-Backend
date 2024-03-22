import { Router } from "express";
import { healthCheck, registerUser, loginUser } from "../controllers/user.controllers.js";
import { uploadImage } from "../middlewares/multer.middleware.js";

const router = Router();

// Route 1 : health-check Route
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

// Route 3 : login user Route
router.route("/login").post(loginUser);

export default router;
