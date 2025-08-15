import { Router } from "express";
import {
  logIn,
  logOut,
  signUp,
  verifyEmail,
  forgotPassword,
  resetPassword,
  checkAuth,
  getAllProduct,
  getProduct,
  updateProduct,
  deleteProduct,
  getNewProduct,
  getPopularProducts,
} from "../controller/authController";
import { createProduct } from "../controller/authController";
import { verifyToken } from "../middleware/verifyToken";
const router = Router();
//auth router
//check for authentication
router.get("/check-auth", verifyToken, checkAuth);
router.post("/logIn", logIn);
router.post("/signUp", signUp);
router.post("/logOut", logOut);
//email verification
router.post("/verify-email", verifyEmail);
//forgot password
router.post("/forgot-password", forgotPassword);
//reset password
router.post("/reset-password/:token", resetPassword);

//product routes

//add product
router.post("/add-product", createProduct);
//get all products
router.get("/get-all-products", getAllProduct);
//get single product
router.get("/get-product/:productID", getProduct);
//new products
router.get("/get-new-products", getNewProduct);
//get popular products
router.get("/get-popular-products", getPopularProducts);
//update product
router.patch("/update-product/:productId", updateProduct);
//delete product
router.delete("/delete-product/:productID", deleteProduct);

export default router;
