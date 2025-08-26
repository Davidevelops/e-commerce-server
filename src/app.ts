import express from "express";
import dotenv from "dotenv";
import router from "./routes/authRoutes";
import cookieParser from "cookie-parser";
import cors from "cors";
const app = express();

dotenv.config();
app.use(express.json()); // to parse incoming request from req.body
app.use(cookieParser());
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://e-commerce-client-h1rotfkha-davids-projects-235cae0e.vercel.app",
      "https://e-commerce-admin-ku035aa69-davids-projects-235cae0e.vercel.app",
      "https://e-commerce-client-blush-phi.vercel.app",
      "https://e-commerce-admin-five-xi.vercel.app",
    ],
    credentials: true,
  })
);
app.use("/", router);

export default app;
