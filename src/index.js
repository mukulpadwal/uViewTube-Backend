import "dotenv/config";
import { app } from "./app.js";
import connectToDB from "./db/index.js";

const PORT = process.env.PORT || 7000;

connectToDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server up and running on port: ${PORT}`);
    });
  })
  .catch((err) => console.error("MongoDB connection error :: ", err));
