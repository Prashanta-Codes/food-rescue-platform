const express = require("express");
const router = express.Router();
const Food = require("../models/Food");

router.post("/add", async (req, res) => {
  try {
    const newFood = await Food.create(req.body);
    res.status(201).json(newFood);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.get("/all", async (req, res) => {
  try {
    const allFoods = await Food.find().sort({ _id: -1 }); 
    res.json(allFoods);
  } catch (err) {
    res.status(500).json({ message: "Database error!" });
  }
});

router.put("/update/:id", async (req, res) => {
  try {
    const updated = await Food.findByIdAndUpdate(
      req.params.id, 
      { $set: req.body }, 
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.get("/my-donations/:email", async (req, res) => {
  try {
    const myFoods = await Food.find({ 
      donorEmail: { $regex: new RegExp("^" + req.params.email + "$", "i") } 
    }).sort({ _id: -1 });
    res.json(myFoods);
  } catch (err) {
    res.status(500).json({ message: "Data fetch fail!" });
  }
});

router.delete("/delete/:id", async (req, res) => {
  try {
    await Food.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Delete failed" });
  }
});

module.exports = router;