import { generateTokenAndSetCookie } from "./../utils/generateTokenAndSetCookie";
import { Request, Response } from "express";
import { User } from "../models/userModel";
import bcrypt from "bcrypt";
import {
  sendVerificationEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendResetSuccessEmail,
} from "../mailtrap/email";
import crypto from "crypto";
import { AuthRequest } from "../middleware/verifyToken";
import { Product } from "../models/productModel";

//check for authentication

//sign up logic
export const signUp = async (req: Request, res: Response) => {
  const { email, password, name, role } = req.body;

  try {
    //this checks if all input fields are inputted
    if (!email || !password || !name || !role) {
      throw new Error("Please provide all the specified fields");
    }
    //checks if the entered email matches an email in the database and therefore it is considered as already exist
    const userAlreadyExists = await User.findOne({ email });
    if (userAlreadyExists) {
      return res
        .status(400)
        .json({ successfull: false, message: "User already exists" });
    }
    //hash the password before saving it to the database
    const hashedPassword = await bcrypt.hash(password, 10);

    //generates a verification 6-digit token
    const verificationToken = Math.floor(
      100000 + Math.random() * 900000
    ).toString();
    //the user will get this verification token via email

    const user = new User({
      name,
      password: hashedPassword,
      email,
      role,
      verificationToken,
      verificationTokenExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });
    await user.save();

    //jwt
    generateTokenAndSetCookie(res, user._id, role);
    //function for sending the email verification
    await sendVerificationEmail(user.email, verificationToken);

    //response to display to the user
    const userResponse = user.toObject();
    userResponse.password = "";

    res.status(201).json({
      success: true,
      message: "user successfully created",
      user: userResponse,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

//verify-email
export const verifyEmail = async (req: Request, res: Response) => {
  const { code } = req.body;

  try {
    //checl if the code matches the token in the database
    const user = await User.findOne({
      //chech if the code matches
      verificationToken: code,
      //check if not expired
      verificationTokenExpiresAt: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ successful: false, message: "Invalid or expired token." });
    }
    //update the user's properties once verified
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiresAt = undefined;

    await user.save();
    await sendWelcomeEmail(user.email, user.name);

    const userResponse = user.toObject();
    userResponse.password = "";

    res.status(200).json({
      success: true,
      message: "Email verified successfully!",
      user: userResponse,
    });
  } catch (error) {
    console.log("Error while verifying email", error);
    res.status(500).json({ success: false, message: "Server errror" });
  }
};

//login logic
export const logIn = async (req: Request, res: Response) => {
  const { email, password, role } = req.body;
  try {
    //check if the entered email matched a record from the db
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User doesn't exists" });
    }
    //check if the passwords match
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(400)
        .json({ successful: false, message: "Invalid credentials" });
    }

    //check if the user is verified before logging in.
    if (!user.isVerified) {
      return res.status(403).json({
        message: "Please verify your email before logging in.",
      });
    }

    //update last log in date once logged in
    user.lastlogin = new Date(Date.now());
    await user.save();

    generateTokenAndSetCookie(res, user._id, role);

    const userResponse = user.toObject();
    userResponse.password = "";

    res.status(200).json({
      successful: true,
      message: "Logged in successfully",
      user: userResponse,
    });
  } catch (error) {
    console.log("An error occured: ", error);
    res
      .status(500)
      .json({ successfull: false, message: `An error occured: ${error}` });
  }
};

//logout
export const logOut = async (req: Request, res: Response) => {
  //make sure the token name here matches the token name you created.
  res.clearCookie("token");
  res.status(200).json({ success: true, message: "successfully logged out." });
};

//forgotPassword
export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(400)
        .json({ successful: false, message: "This user isn't registered." });
    }

    // create a reset token
    const resetToken = crypto.randomBytes(20).toString("hex");

    //create reset token expiration
    const resetTokenExpiration = new Date(Date.now() + 1 * 60 * 60 * 1000);

    //append the token to the users object
    user.resetPasswordToken = resetToken;

    //append the token expiration to the user object
    user.resetPasswordExpiresAt = resetTokenExpiration;

    await user?.save();
    //send the password reset email
    await sendPasswordResetEmail(
      user!.email,
      //make sure that this matches your front end link
      `${process.env.CLIENT_URL}/reset-password/${resetToken}`
    );

    res.status(200).json({
      successful: true,
      message: "Password reset link sent to your email",
    });
  } catch (error) {
    console.log("An error occured: ", error);
    res
      .status(500)
      .json({ successful: false, message: `An error occured: ${error}` });
  }
};

//reset password
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    //find the exisisting user that has the matching resetToken
    const user = await User.findOne({
      //check if the tokens matched
      resetPasswordToken: token,
      //check if not expired
      resetPasswordExpiresAt: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        successfull: false,
        message: "Invalid or expired reset token.",
      });
    }

    //update the password
    const hashedPassword = await bcrypt.hash(password, 10);

    //this if blocked checks if the user actually exists before updating it

    //update the password once hashed
    user.password = hashedPassword;
    user.resetPasswordToken = "";
    user.resetPasswordExpiresAt = undefined;

    await user?.save();
    await sendResetSuccessEmail(user!.email);

    res
      .status(200)
      .json({ successful: true, message: "Password successfully updated" });
  } catch (error) {
    console.log("An error occured while trying to reset the password: ", error);
    res
      .status(500)
      .json(`An error occured while trying to reset the password: ${error}`);
  }
};

export const checkAuth = async (req: Request, res: Response) => {
  try {
    //we'll reuse the interface AuthRequest from the verifyToken middleware so that it has the userId property.
    //since the userId is in the payload, we can access in in the request body
    const user = await User.findById((req as AuthRequest).userId).select(
      "-password"
    );
    if (!user) {
      return res
        .status(400)
        .json({ successful: false, message: "User not found" });
    }

    const userResponse = user.toObject();

    res.status(200).json({ successful: true, user: userResponse });
  } catch (error) {
    console.log("An error occured while checking the authentication: ", error);
    res.status(500).json({
      successful: false,
      message: `An error occured while checking the authentication: ${error}`,
    });
  }
};

// producs controller

//create product
export const createProduct = async (req: Request, res: Response) => {
  const {
    name,
    description,
    properties,
    category,
    price,
    imageUrl,
    isPopular,
  } = req.body;

  try {
    const product = new Product({
      name,
      description,
      properties,
      category,
      price,
      imageUrl,
      isPopular,
    });

    if (!name || !description || !properties || !price || !imageUrl) {
      return res
        .status(400)
        .json({ success: false, message: "Please provide all the inputs." });
    }

    await product.save();

    console.log("Product created successfully");
    res
      .status(201)
      .json({ success: true, message: "Product created succesfully" });
  } catch (error) {
    console.log("An error occured while creating the product: ", error);
    res.status(500).json({
      success: false,
      message: `An error occured while trying to create the product: ${error}`,
    });
  }
};
//get all product
export const getAllProduct = async (_: Request, res: Response) => {
  try {
    const Products = await Product.find();
    res.status(200).json({ success: true, Products });
  } catch (error) {
    console.log("An error occured getting all the products: ", error);
    res.status(500).json({
      success: false,
      message: `An error occured getting al the products: ${error}`,
    });
  }
};
//get specific product
export const getProduct = async (req: Request, res: Response) => {
  const { productID } = req.params;
  try {
    const product = await Product.findById(productID);
    res.status(200).json({ success: true, product });
  } catch (error) {
    console.log("An error occured while trying to get the product: ", error);
    res.status(500).json({
      success: false,
      message: `An error occured while trying to get the product: ${error}`,
    });
  }
};

//get newProducts
export const getNewProduct = async (_: Request, res: Response) => {
  try {
    const Products = await Product.find().sort({ createdAt: -1 }).limit(8);
    res.status(200).json({ success: true, Products });
  } catch (error) {
    console.log("An error occured getting all the products: ", error);
    res.status(500).json({
      success: false,
      message: `An error occured getting al the products: ${error}`,
    });
  }
};

//edit product
export const updateProduct = async (req: Request, res: Response) => {
  const { productId } = req.params;
  const { name, description, properties, category, price, imageUrl } = req.body;

  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      {
        name,
        description,
        properties,
        category,
        price,
        imageUrl,
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      updatedProduct,
    });
  } catch (error) {
    console.log("An error occurred while trying to update the product:", error);
    res.status(500).json({
      success: false,
      message: `An error occurred while trying to update the product: ${error}`,
    });
  }
};

//delete product
export const deleteProduct = async (req: Request, res: Response) => {
  const { productID } = req.params;
  try {
    const deletedProduct = await Product.findByIdAndDelete(productID);
    res.status(200).json({
      success: true,
      message: "Product successfully deleted.",
      deletedProduct,
    });
  } catch (error) {
    console.log("An error occured while trying to delete the product: ", error);
    res.status(500).json({
      success: false,
      message: `An error occured while trying to delete the product: ${error}`,
    });
  }
};
