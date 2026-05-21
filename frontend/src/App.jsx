import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Home from "./pages/Home.jsx";
import Dashboard from "./pages/DonorDashboard.jsx"; 
import DonateFood from "./pages/DonateFood.jsx";
import NgoDashboard from "./pages/NgoDashboard.jsx"; 
import AdminDashboard from "./pages/AdminDashboard.jsx"; 
import ForgotPassword from "./pages/ForgotPassword.jsx";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/register" />} />
      
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      <Route path="/donor-dashboard" element={<Dashboard />} />
      <Route path="/ngo-dashboard" element={<NgoDashboard />} />  
      <Route path="/admin-dashboard" element={<AdminDashboard />} /> 

      <Route path="/home" element={<Home />} />
      <Route path="/donate" element={<DonateFood />} />
      <Route path="/request" element={<NgoDashboard />} /> 
    </Routes>
  );
};

export default App;