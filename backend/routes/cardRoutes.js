const express = require("express");
const router = express.Router();
const cardController = require("../controllers/cardController");
const { authenticateToken } = require("../middleware/auth");

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Get all cards with optional filtering
router.get("/", cardController.getAllCards);

// Get card statistics
router.get("/stats", cardController.getCardStats);

// Get specific card by card_id
router.get("/card/:card_id", cardController.getCardById);

// Add new card
router.post("/", cardController.addCard);

// Update card
router.put("/:id", cardController.updateCard);

// Delete card
router.delete("/:id", cardController.deleteCard);

// Toggle card status (activate/deactivate)
router.patch("/:id/toggle", cardController.toggleCardStatus);

module.exports = router;
