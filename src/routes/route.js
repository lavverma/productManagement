const express = require("express");
const {
  createUser,
  loginUser,
  getUser,
  updateUser,
} = require("../controller/userController");
const {
  createProduct,
  getProduct,
  getProductById,
  deleteProduct,
  updateProduct,
} = require("../controller/productController");
const {
  addToCart,
  updateCart,
  getCart,
  deleteCart,
} = require("../controller/cartController");
const { authentication, authorization } = require("../middleware/auth");
const router = express.Router();

//USER API
router.post("/register", createUser);
router.post("/login", loginUser);
router.get("/user/:userId/profile", authentication, authorization, getUser);
router.put("/user/:userId/profile", authentication, authorization, updateUser);

//PRODUCT API
router.post("/products", createProduct);
router.get("/products", getProduct);
router.get("/products/:productId", getProductById);
router.put("/products/:productId", updateProduct);
router.delete("/products/:productId", deleteProduct);

//CART API
router.post("/users/:userId/cart", authentication, authorization, addToCart);
router.put("/users/:userId/cart", authentication, authorization, updateCart);
router.get("/users/:userId/cart", authentication, authorization, getCart);
router.delete("/users/:userId/cart", authentication, authorization, deleteCart);

//Validating the endpoint
router.all("/*", function (req, res) {
  return res.status(404).send({ status: false, message: "Page Not Found" });
});

module.exports = router;
