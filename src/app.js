import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(cookieParser());

// Routing
import { healthCheck } from "./controllers/healthcheck.controller.js";
import userRouter from "./routes/user.routes.js";
import videoRouter from "./routes/video.routes.js";

app.get("/api/v1/health-check", healthCheck);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/videos", videoRouter);

export default app;
