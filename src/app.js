import express from "express";
import logger from "../logger.js";
import morgan from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();
const morganFormat = ":method :url :status :response-time ms";

app.use(
  morgan(morganFormat, {
    stream: {
      write: (message) => {
        /**
         * An object representing the log details of an HTTP request.
         *
         * @property {string} method - The HTTP method used for the request.
         * @property {string} url - The URL of the request.
         * @property {string} status - The HTTP status code of the response.
         * @property {string} responseTime - The time taken to respond to the request.
         */
        const logObject = {
          method: message.split(" ")[0],
          url: message.split(" ")[1],
          status: message.split(" ")[2],
          responseTime: message.split(" ")[3],
        };
        logger.info(JSON.stringify(logObject));
      },
    },
  })
);

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(
  express.json({
    limit: "16kb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "16kb",
  })
);

app.use(cookieParser());

app.use(express.static("public"));

// Routes
import healthcheckRouter from "./routes/healthcheck.routes.js";
import usersRouter from "./routes/users.routes.js";
import commentsRouter from "./routes/comments.routes.js";
import likesRouter from "./routes/likes.routes.js";
import videosRouter from "./routes/videos.routes.js";
import subscriptionsRouter from "./routes/subscriptions.routes.js";
import tweetsRouter from "./routes/tweets.routes.js";
import playlistsRouter from "./routes/playlists.routes.js";

app.use("/api/v1/healthcheck", healthcheckRouter);
app.use("/api/v1/users", usersRouter);
app.use("/api/v1/comments", commentsRouter);
app.use("/api/v1/likes", likesRouter);
app.use("/api/v1/videos", videosRouter);
app.use("/api/v1/subscriptions", subscriptionsRouter);
app.use("/api/v1/tweets", tweetsRouter);
app.use("/api/v1/playlists", playlistsRouter);

export { app };
