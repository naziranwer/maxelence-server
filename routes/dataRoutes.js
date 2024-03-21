const express = require("express");
const router = express.Router();
const dataController = require("../controllers/dataController");

// Route to fetch all users
router.get("/users", dataController.getAllUsers);
router.delete("/users/:id", dataController.deleteUserById);
router.put("/users/:id", dataController.updateUserById);

module.exports = router;
