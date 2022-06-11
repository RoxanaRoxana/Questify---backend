const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const cardController = require("../controllers/cardController");
const { authMiddleware } = require("../middleware/jwt");

router.get("/users", userController.getAllUsers);
router.post("/users/signup", userController.registerUser);
router.post("/users/login", userController.loginUser);
router.get("/users/logout", authMiddleware, userController.logoutUser);

router.post("/card", authMiddleware, cardController.addCard);

module.exports = router;
