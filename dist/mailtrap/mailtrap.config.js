"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sender = exports.mailtrap_client = void 0;
const mailtrap_1 = require("mailtrap");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const TOKEN = process.env.MAILTRAP_TOKEN;
exports.mailtrap_client = new mailtrap_1.MailtrapClient({
    token: TOKEN,
});
exports.sender = {
    email: "hello@demomailtrap.co",
    name: "David Dela Cruz",
};
