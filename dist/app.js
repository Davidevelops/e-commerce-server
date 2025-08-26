"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
dotenv_1.default.config();
app.use(express_1.default.json()); // to parse incoming request from req.body
app.use((0, cookie_parser_1.default)());
app.use((0, cors_1.default)({
    origin: [
        "http://localhost:3000",
        "https://e-commerce-client-h1rotfkha-davids-projects-235cae0e.vercel.app",
        "https://e-commerce-admin-ku035aa69-davids-projects-235cae0e.vercel.app",
    ],
    credentials: true,
}));
app.use("/", authRoutes_1.default);
exports.default = app;
