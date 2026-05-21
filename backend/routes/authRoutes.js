const express = require("express");
const User = require("../models/User");
const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { email, mobile, address } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered! ❌" });
    }

    const user = await User.create(req.body);
    res.status(201).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error during registration" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(400).json({ message: "No user found with this email! ❌" });
    }

    if (user.password !== password) {
      return res.status(400).json({ message: "Invalid Password! ❌" });
    }

    res.json({
      name: user.name,
      email: user.email,
      role: user.role,
      mobile: user.mobile,
      address: user.address
    });
  } catch (err) {
    res.status(500).json({ message: "Server Error during login" });
  }
});

router.get("/users", async (req, res) => {
  try {
    const users = await User.find().select("-password"); 
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Users ki list nahi mil payi!" });
  }
});

module.exports = router;