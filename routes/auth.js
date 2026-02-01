const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();
const User = require("../models/user");

// ✅ REGISTER (SIGN UP)
router.post("/register", async (req, res) => {
  try {
    const { username, password, role } = req.body;

    if (!username || !password || !role) {
      return res.status(400).send("All fields required");
    }

    if (!["teacher", "student"].includes(role)) {
      return res.status(400).send("Invalid role");
    }

    const existing = await User.findOne({ username });
    if (existing) {
      return res.status(400).send("User already exists");
    }

    const user = await User.create({
      username,
      password,
      role
    });

    res.status(201).json({ message: "Account created successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Signup failed" });
  }
});

// ✅ LOGIN
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username, password });
    if (!user) {
      return res.status(400).send("Invalid credentials");
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      role: user.role
    });
  } catch (err) {
    res.status(500).send("Login failed");
  }
});

module.exports = router;
