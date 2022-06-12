const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const cardController = require("../controllers/cardController");
const { authMiddleware } = require("../middleware/jwt");

router.get("/users", userController.getAllUsers);
router.post("/users/register", userController.registerUser);
router.post("/users/login", userController.loginUser);
router.post("/users/logout", authMiddleware, userController.logoutUser);
router.post("/users/refresh", authMiddleware, userController.refreshTokens);

router.post("/card", authMiddleware, cardController.createCard);
router.patch("/card/:cardId", authMiddleware, cardController.editCard);
router.delete("/card/:cardId", authMiddleware, cardController.deleteCard);
router.get("/card", authMiddleware, cardController.getAllUsersCards);
router.patch(
  "/card/:cardId",
  authMiddleware,
  cardController.updateCardCompletion
);

module.exports = router;