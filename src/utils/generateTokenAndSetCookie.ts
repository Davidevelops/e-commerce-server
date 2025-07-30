import jwt from "jsonwebtoken";
import { Response } from "express";
import { Types } from "mongoose";
export const generateTokenAndSetCookie = (
  res: Response,
  userId: Types.ObjectId,
  role: string
) => {
  //jwt.sign for creating the token
  // the user id is the payload required for signing the token and also needed is the secure secret string
  const token = jwt.sign({ userId, role }, process.env.JWT_SECRET as string, {
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
