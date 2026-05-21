const Food = require("../models/Food");

exports.addFood = async (req, res) => {
  const food = await Food.create(req.body);
  res.json(food);
};

exports.getFood = async (req, res) => {
  const foods = await Food.find();
  res.json(foods);
};