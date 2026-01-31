const jwt = require("jsonwebtoken");


const express = require("express");
const router = express.Router();
const User = require("../models/user");


router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username, password });
    if (!user) {
      return res.status(400).send("Invalid credentials");
    }

    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful",
      token,
      role: user.role
    });
  } catch (err) {
    res.status(500).send("Login failed");
  }
});


module.exports = router;