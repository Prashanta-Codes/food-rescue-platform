const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const foodRoutes = require("./routes/foodRoutes");

const app = express();

app.use(cors());
app.use(express.json()); 

app.use("/api/auth", authRoutes); 
app.use("/api/food", foodRoutes); 

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/food_donation";

mongoose.connect(MONGO_URI) 
  .then(() => console.log("MongoDB Connected..."))
  .catch((err) => console.log(err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));