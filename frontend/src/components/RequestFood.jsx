import React, { useEffect, useState } from "react";
import API from "../services/api";
import FoodCard from "./FoodCard";

const RequestFood = () => {
  const [foods, setFoods] = useState([]);

  useEffect(() => {
    const fetchFoods = async () => {
      const res = await API.get("/food");
      setFoods(res.data);
    };

    fetchFoods();
  }, []);

  return (
    <div>
      <h2>Available Food</h2>

      <div style={{ display: "flex", flexWrap: "wrap" }}>
        {foods.map((food) => (
          <FoodCard key={food._id} food={food} />
        ))}
      </div>
    </div>
  );
};

export default RequestFood;