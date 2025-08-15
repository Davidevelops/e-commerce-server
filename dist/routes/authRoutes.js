"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controller/authController");
const authController_2 = require("../controller/authController");
const verifyToken_1 = require("../middleware/verifyToken");
const router = (0, express_1.Router)();
//auth router
//check for authentication
router.get("/check-auth", verifyToken_1.verifyToken, authController_1.checkAuth);
router.post("/logIn", authController_1.logIn);
router.post("/signUp", authController_1.signUp);
router.post("/logOut", authController_1.logOut);
//email verification
router.post("/verify-email", authController_1.verifyEmail);
//forgot password
router.post("/forgot-password", authController_1.forgotPassword);
//reset password
router.post("/reset-password/:token", authController_1.resetPassword);
//product routes
//add product
router.post("/add-product", authController_2.createProduct);
//get all products
router.get("/get-all-products", authController_1.getAllProduct);
//get single product
router.get("/get-product/:productID", authController_1.getProduct);
//new products
router.get("/get-new-products", authController_1.getNewProduct);
//update product
router.patch("/update-product/:productId", authController_1.updateProduct);
//delete product
router.delete("/delete-product/:productID", authController_1.deleteProduct);
exports.default = router;
