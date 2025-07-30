import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

//typing for the req, just extend the Request
//this is used because by default the request body doesnt have a userId property
//the solutions is to extend or inherit properties from the request and create our own request type that do have a userId
export interface AuthRequest extends Request {
  userId?: string;
}

export const verifyToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // you get the cookies name based on what you named it, use cookie-parser to your app to be able to extract the cookie in the request body
  const token = req.cookies.token;
  if (!token)
    return res
      .status(400)
      .json({ successful: false, message: "Unauthorized - no token provided" });
  try {
    // the parameters are the token that you get and also your secret string gor verifying
    //I used type assertion since ts dont know what type of data is decoded going to be
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      userId: string;
    };

    if (!decoded) {
      return res
        .status(400)
        .json({ successful: false, message: "Unauthorize - invalid token" });
    }

    //since it is now typed, you can now access the userId or the payload inside
    //
    (req as AuthRequest).userId = decoded.userId;

    next();
  } catch (error) {
    console.log("Error in verifying the token: ", error);
    res.status(500).json({ successful: false, message: "Server error" });
  }
};
