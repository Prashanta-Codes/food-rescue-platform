import { useState } from "react";
import API from "../services/api";

export default function DonateFood() {
  const [title, setTitle] = useState("");
  const [image, setImage] = useState("");
  const [location, setLocation] = useState("");

  const donate = async (e) => {
    e.preventDefault();

    await API.post("/food/add", {
      title,
      image,
      location
    });

    alert("Food Added");
  };

  return (
    <form onSubmit={donate}>
      <input placeholder="title" onChange={(e) => setTitle(e.target.value)} />
      <input placeholder="image" onChange={(e) => setImage(e.target.value)} />
      <input placeholder="location" onChange={(e) => setLocation(e.target.value)} />
      <button>Donate</button>
    </form>
  );
}