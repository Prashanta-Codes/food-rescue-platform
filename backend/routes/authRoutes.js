const express = require("express");
const User = require("../models/User");
const router = express.Router();

const NGO_SECRET_KEY = "12345";

// REGISTER
router.post("/register", async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      mobile,
      address,
      ngoKey
    } = req.body;

    const cleanEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({ email: cleanEmail });

    if (existingUser) {
      return res.status(400).json({
        message: "Email already registered! ❌"
      });
    }

    // NGO KEY CHECK
    if (role === "ngo") {
      if (ngoKey !== NGO_SECRET_KEY) {
        return res.status(401).json({
          message: "Invalid NGO Secret Key! 🚫"
        });
      }
    }

    const user = await User.create({
      name,
      email: cleanEmail,
      password,
      role,
      mobile,
      address
    });

    res.status(201).json(user);

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server Error during registration"
    });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({
      email: email.trim().toLowerCase()
    });

    if (!user) {
      return res.status(400).json({
        message: "No user found with this email! ❌"
      });
    }

    if (user.password !== password) {
      return res.status(400).json({
        message: "Invalid Password! ❌"
      });
    }

    res.json({
      name: user.name,
      email: user.email,
      role: user.role,
      mobile: user.mobile,
      address: user.address
    });

  } catch (err) {
    res.status(500).json({
      message: "Server Error during login"
    });
  }
});

// USERS
router.get("/users", async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({
      message: "Users ki list nahi mil payi!"
    });
  }
});

module.exports = router;