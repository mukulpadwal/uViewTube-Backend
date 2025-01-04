import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import {
  addVideoToPlaylist,
  createPlaylist,
  deletePlaylist,
  getPlaylistById,
  getUserPlaylists,
  removeVideoFromPlaylist,
  updatePlaylist,
} from "../controllers/playlists.controllers.js";

const router = Router();

router.route("/user/:userId").get(getUserPlaylists);
router.route("/id/:playlistId").get(getPlaylistById);

// Protected routes
router.route("/create").post(verifyJWT, createPlaylist);
router
  .route("/add-video/:playlistId/:videoId")
  .post(verifyJWT, addVideoToPlaylist);
router
  .route("/remove-video/:playlistId/:videoId")
  .post(verifyJWT, removeVideoFromPlaylist);
router.route("/delete/:playlistId").delete(verifyJWT, deletePlaylist);
router.route("/update/:playlistId").patch(verifyJWT, updatePlaylist);

export default router;
