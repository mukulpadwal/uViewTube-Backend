import "dotenv/config";
import app from "./app.js";
import conf from "./conf/conf.js";

app.on("error", (error) => {
  console.log(`Oops Something went wrong ${error.message}`);
});

app.listen(conf.PORT, () => {
  console.log(`Server up and running on port : ${conf.PORT}`);
});
