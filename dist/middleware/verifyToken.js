"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const verifyToken = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // you get the cookies name based on what you named it, use cookie-parser to your app to be able to extract the cookie in the request body
    const token = req.cookies.token;
    if (!token)
        return res
            .status(400)
            .json({ successful: false, message: "Unauthorized - no token provided" });
    try {
        // the parameters are the token that you get and also your secret string gor verifying
        //I used type assertion since ts dont know what type of data is decoded going to be
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        if (!decoded) {
            return res
                .status(400)
                .json({ successful: false, message: "Unauthorize - invalid token" });
        }
        //since it is now typed, you can now access the userId or the payload inside
        //
        req.userId = decoded.userId;
        next();
    }
    catch (error) {
        console.log("Error in verifying the token: ", error);
        res.status(500).json({ successful: false, message: "Server error" });
    }
});
exports.verifyToken = verifyToken;
