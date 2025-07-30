import app from "./app";
import { connectToDb } from "./config/db";

connectToDb()
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log("Server running on port:", process.env.PORT);
    });
  })
  .catch((err) => {
    console.log("An error occured: ", err);
  });
