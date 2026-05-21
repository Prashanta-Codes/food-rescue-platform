import React from "react";

const FoodCard = ({ food }) => {
  return (
    <div style={styles.card}>
      <img src={food.image} alt="food" style={styles.image} />

      <h3>{food.title}</h3>

      <p>📍 {food.location}</p>

      <button style={styles.button}>
        Request Food
      </button>
    </div>
  );
};

const styles = {
  card: {
    border: "1px solid #ccc",
    padding: "10px",
    margin: "10px",
    borderRadius: "10px",
    width: "200px"
  },
  image: {
    width: "100%",
    height: "120px",
    objectFit: "cover",
    borderRadius: "8px"
  },
  button: {
    marginTop: "10px",
    padding: "5px 10px",
    cursor: "pointer"
  }
};

export default FoodCard;