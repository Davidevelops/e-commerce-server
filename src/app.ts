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
      "https://e-commerce-server-rnas.onrender.com",
    ],
    credentials: true,
  })
);
app.use("/", router);

export default app;
