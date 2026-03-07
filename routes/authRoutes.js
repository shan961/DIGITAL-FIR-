// routes/authRoutes.js
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// 🔹 REGISTER
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      console.error("Registration Error: Missing fields");
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      console.error("Registration Error: User already exists");
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "User", // default role
    });

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      "mysecret", // temporary secret
      { expiresIn: "1d" }
    );

    console.log("User registered:", user.email);

    // ✅ Send JSON response back to Postman
    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Registration Error:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// 🔹 LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      console.error("Login Error: Missing fields");
      return res.status(400).json({ success: false, message: "Email and password required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      console.error("Login Error: Invalid credentials");
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.error("Login Error: Invalid credentials");
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      "mysecret",
      { expiresIn: "1d" }
    );

    console.log("User logged in:", user.email);

    return res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login Error:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;