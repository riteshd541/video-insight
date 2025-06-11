const express = require("express");
const User = require("../models/User");
const {
  authenticateToken,
  authorizeRole,
} = require("../middlewares/authMiddleware");

const router = express.Router();

router.get(
  "/users",
  authenticateToken,
  authorizeRole(["admin"]),
  async (req, res) => {
    try {
      const users = await User.find().select("-passwordHash");
      res.json(users);
    } catch (err) {
      console.error("Error fetching users for admin:", err.message);
      res.status(500).json({ message: "Server error" });
    }
  }
);

module.exports = router;
