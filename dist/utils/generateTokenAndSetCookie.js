"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTokenAndSetCookie = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const generateTokenAndSetCookie = (res, userId, role) => {
    //jwt.sign for creating the token
    // the user id is the payload required for signing the token and also needed is the secure secret string
    const token = jsonwebtoken_1.default.sign({ userId, role }, process.env.JWT_SECRET, {
        expiresIn: "7d",
    });
    //adds a cookie to the http response that contains the token we created and it will be stored to the clients browser
    res.cookie("token", token, {
        httpOnly: true, //cannot be manipulated by js
        secure: process.env.NODE_ENV === "production", // secure in production
        sameSite: "strict", // prevent csrf attack
        maxAge: 7 * 24 * 60 * 60 * 1000, //7days
    });
    return token;
};
exports.generateTokenAndSetCookie = generateTokenAndSetCookie;
