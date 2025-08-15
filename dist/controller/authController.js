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
exports.deleteProduct = exports.updateProduct = exports.getPopularProducts = exports.getNewProduct = exports.getProduct = exports.getAllProduct = exports.createProduct = exports.checkAuth = exports.resetPassword = exports.forgotPassword = exports.logOut = exports.logIn = exports.verifyEmail = exports.signUp = void 0;
const generateTokenAndSetCookie_1 = require("./../utils/generateTokenAndSetCookie");
const userModel_1 = require("../models/userModel");
const bcrypt_1 = __importDefault(require("bcrypt"));
const email_1 = require("../mailtrap/email");
const crypto_1 = __importDefault(require("crypto"));
const productModel_1 = require("../models/productModel");
//check for authentication
//sign up logic
const signUp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password, name, role } = req.body;
    try {
        //this checks if all input fields are inputted
        if (!email || !password || !name || !role) {
            throw new Error("Please provide all the specified fields");
        }
        //checks if the entered email matches an email in the database and therefore it is considered as already exist
        const userAlreadyExists = yield userModel_1.User.findOne({ email });
        if (userAlreadyExists) {
            return res
                .status(400)
                .json({ successfull: false, message: "User already exists" });
        }
        //hash the password before saving it to the database
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        //generates a verification 6-digit token
        const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
        //the user will get this verification token via email
        const user = new userModel_1.User({
            name,
            password: hashedPassword,
            email,
            role,
            verificationToken,
            verificationTokenExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        });
        yield user.save();
        //jwt
        (0, generateTokenAndSetCookie_1.generateTokenAndSetCookie)(res, user._id, role);
        //function for sending the email verification
        yield (0, email_1.sendVerificationEmail)(user.email, verificationToken);
        //response to display to the user
        const userResponse = user.toObject();
        userResponse.password = "";
        res.status(201).json({
            success: true,
            message: "user successfully created",
            user: userResponse,
        });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});
exports.signUp = signUp;
//verify-email
const verifyEmail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { code } = req.body;
    try {
        //checl if the code matches the token in the database
        const user = yield userModel_1.User.findOne({
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
        yield user.save();
        yield (0, email_1.sendWelcomeEmail)(user.email, user.name);
        const userResponse = user.toObject();
        userResponse.password = "";
        res.status(200).json({
            success: true,
            message: "Email verified successfully!",
            user: userResponse,
        });
    }
    catch (error) {
        console.log("Error while verifying email", error);
        res.status(500).json({ success: false, message: "Server errror" });
    }
});
exports.verifyEmail = verifyEmail;
//login logic
const logIn = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password, role } = req.body;
    try {
        //check if the entered email matched a record from the db
        const user = yield userModel_1.User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "User doesn't exists" });
        }
        //check if the passwords match
        const isPasswordValid = yield bcrypt_1.default.compare(password, user.password);
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
        yield user.save();
        (0, generateTokenAndSetCookie_1.generateTokenAndSetCookie)(res, user._id, role);
        const userResponse = user.toObject();
        userResponse.password = "";
        res.status(200).json({
            successful: true,
            message: "Logged in successfully",
            user: userResponse,
        });
    }
    catch (error) {
        console.log("An error occured: ", error);
        res
            .status(500)
            .json({ successfull: false, message: `An error occured: ${error}` });
    }
});
exports.logIn = logIn;
//logout
const logOut = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //make sure the token name here matches the token name you created.
    res.clearCookie("token");
    res.status(200).json({ success: true, message: "successfully logged out." });
});
exports.logOut = logOut;
//forgotPassword
const forgotPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    try {
        const user = yield userModel_1.User.findOne({ email });
        if (!user) {
            return res
                .status(400)
                .json({ successful: false, message: "This user isn't registered." });
        }
        // create a reset token
        const resetToken = crypto_1.default.randomBytes(20).toString("hex");
        //create reset token expiration
        const resetTokenExpiration = new Date(Date.now() + 1 * 60 * 60 * 1000);
        //append the token to the users object
        user.resetPasswordToken = resetToken;
        //append the token expiration to the user object
        user.resetPasswordExpiresAt = resetTokenExpiration;
        yield (user === null || user === void 0 ? void 0 : user.save());
        //send the password reset email
        yield (0, email_1.sendPasswordResetEmail)(user.email, 
        //make sure that this matches your front end link
        `${process.env.CLIENT_URL}/reset-password/${resetToken}`);
        res.status(200).json({
            successful: true,
            message: "Password reset link sent to your email",
        });
    }
    catch (error) {
        console.log("An error occured: ", error);
        res
            .status(500)
            .json({ successful: false, message: `An error occured: ${error}` });
    }
});
exports.forgotPassword = forgotPassword;
//reset password
const resetPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token } = req.params;
        const { password } = req.body;
        //find the exisisting user that has the matching resetToken
        const user = yield userModel_1.User.findOne({
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
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        //this if blocked checks if the user actually exists before updating it
        //update the password once hashed
        user.password = hashedPassword;
        user.resetPasswordToken = "";
        user.resetPasswordExpiresAt = undefined;
        yield (user === null || user === void 0 ? void 0 : user.save());
        yield (0, email_1.sendResetSuccessEmail)(user.email);
        res
            .status(200)
            .json({ successful: true, message: "Password successfully updated" });
    }
    catch (error) {
        console.log("An error occured while trying to reset the password: ", error);
        res
            .status(500)
            .json(`An error occured while trying to reset the password: ${error}`);
    }
});
exports.resetPassword = resetPassword;
const checkAuth = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        //we'll reuse the interface AuthRequest from the verifyToken middleware so that it has the userId property.
        //since the userId is in the payload, we can access in in the request body
        const user = yield userModel_1.User.findById(req.userId).select("-password");
        if (!user) {
            return res
                .status(400)
                .json({ successful: false, message: "User not found" });
        }
        const userResponse = user.toObject();
        res.status(200).json({ successful: true, user: userResponse });
    }
    catch (error) {
        console.log("An error occured while checking the authentication: ", error);
        res.status(500).json({
            successful: false,
            message: `An error occured while checking the authentication: ${error}`,
        });
    }
});
exports.checkAuth = checkAuth;
// producs controller
//create product
const createProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, description, properties, category, price, imageUrl, isPopular, } = req.body;
    try {
        const product = new productModel_1.Product({
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
        yield product.save();
        console.log("Product created successfully");
        res
            .status(201)
            .json({ success: true, message: "Product created succesfully" });
    }
    catch (error) {
        console.log("An error occured while creating the product: ", error);
        res.status(500).json({
            success: false,
            message: `An error occured while trying to create the product: ${error}`,
        });
    }
});
exports.createProduct = createProduct;
//get all product
const getAllProduct = (_, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const Products = yield productModel_1.Product.find();
        res.status(200).json({ success: true, Products });
    }
    catch (error) {
        console.log("An error occured getting all the products: ", error);
        res.status(500).json({
            success: false,
            message: `An error occured getting al the products: ${error}`,
        });
    }
});
exports.getAllProduct = getAllProduct;
//get specific product
const getProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { productID } = req.params;
    try {
        const product = yield productModel_1.Product.findById(productID);
        res.status(200).json({ success: true, product });
    }
    catch (error) {
        console.log("An error occured while trying to get the product: ", error);
        res.status(500).json({
            success: false,
            message: `An error occured while trying to get the product: ${error}`,
        });
    }
});
exports.getProduct = getProduct;
//get newProducts
const getNewProduct = (_, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const Products = yield productModel_1.Product.find().sort({ createdAt: -1 }).limit(8);
        res.status(200).json({ success: true, Products });
    }
    catch (error) {
        console.log("An error occured getting all the products: ", error);
        res.status(500).json({
            success: false,
            message: `An error occured getting al the products: ${error}`,
        });
    }
});
exports.getNewProduct = getNewProduct;
//getPopularProducts
const getPopularProducts = (_, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const Products = yield productModel_1.Product.find().sort({ isPopular: -1 });
        res.status(200).json({ success: true, Products });
    }
    catch (error) {
        console.log("An error occured getting all the products: ", error);
        res.status(500).json({
            success: false,
            message: `An error occured getting al the products: ${error}`,
        });
    }
});
exports.getPopularProducts = getPopularProducts;
//edit product
const updateProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { productId } = req.params;
    const { name, description, properties, category, price, imageUrl, isPopular, } = req.body;
    try {
        const updatedProduct = yield productModel_1.Product.findByIdAndUpdate(productId, {
            name,
            description,
            properties,
            category,
            price,
            imageUrl,
            isPopular,
        }, { new: true, runValidators: true });
        res.status(200).json({
            success: true,
            message: "Product updated successfully",
            updatedProduct,
        });
    }
    catch (error) {
        console.log("An error occurred while trying to update the product:", error);
        res.status(500).json({
            success: false,
            message: `An error occurred while trying to update the product: ${error}`,
        });
    }
});
exports.updateProduct = updateProduct;
//delete product
const deleteProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { productID } = req.params;
    try {
        const deletedProduct = yield productModel_1.Product.findByIdAndDelete(productID);
        res.status(200).json({
            success: true,
            message: "Product successfully deleted.",
            deletedProduct,
        });
    }
    catch (error) {
        console.log("An error occured while trying to delete the product: ", error);
        res.status(500).json({
            success: false,
            message: `An error occured while trying to delete the product: ${error}`,
        });
    }
});
exports.deleteProduct = deleteProduct;
