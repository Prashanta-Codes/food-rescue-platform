const User = require("../models/User");

const NGO_SECRET_KEY = "12345";

exports.register = async (req, res) => {
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
        msg: "Email pehle se registered hai! ❌"
      });
    }

    // NGO Secret Key Validation
    if (role === "ngo") {
      if (!ngoKey) {
        return res.status(400).json({
          msg: "NGO Secret Key required hai! 🔑"
        });
      }

      if (ngoKey.trim() !== NGO_SECRET_KEY) {
        return res.status(401).json({
          msg: "Galt NGO Key! Aap NGO register nahi kar sakte. 🚫"
        });
      }
    }

    const user = await User.create({
      name,
      email: cleanEmail,
      password: password.trim(),
      role,
      mobile,
      address
    });

    res.status(201).json(user);

  } catch (err) {
    console.error("Register Error:", err.message);

    res.status(500).json({
      msg: "Server Error: Registration failed!",
      error: err.message
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const cleanEmail = email.trim().toLowerCase();

    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return res.status(404).json({
        msg: "User nahi mila! ❌"
      });
    }

    if (user.password !== password) {
      return res.status(400).json({
        msg: "Galt Password! 🔑"
      });
    }

    res.json({
      token: "jwt-demo-token",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (err) {
    res.status(500).json({
      msg: "Server Error during login"
    });
  }
};