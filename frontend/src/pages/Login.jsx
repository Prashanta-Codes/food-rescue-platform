import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios"; 
import "../App.css";

const Login = () => {
  const loginImg = "https://images.unsplash.com/photo-1547082688-9077fe60b8f9?q=80&w=1000&auto=format&fit=crop";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (cleanEmail === "admin@gmail.com" && cleanPassword === "admin123") {
      const adminData = { name: "Admin", email: cleanEmail, role: "admin" };
      
      sessionStorage.setItem("adminUser", JSON.stringify(adminData));
      sessionStorage.setItem("loggedInUser", JSON.stringify(adminData)); 
      navigate("/admin-dashboard");
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/api/auth/login", {
        email: cleanEmail,
        password: cleanPassword
      });

      if (response.data) {
        const savedUser = response.data;
        
      
        if (savedUser.role === "ngo") {
          sessionStorage.setItem("ngoUser", JSON.stringify(savedUser));
        } else {
          sessionStorage.setItem("donorUser", JSON.stringify(savedUser));
        }
        
        sessionStorage.setItem("loggedInUser", JSON.stringify(savedUser));
        
        setMessage({ type: "success", text: `Welcome back, ${savedUser.name}! 🚀` });
        
        setTimeout(() => {
          if (savedUser.role === "ngo") navigate("/ngo-dashboard");
          else navigate("/donor-dashboard");
        }, 1500);
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Invalid credentials! ❌";
      setMessage({ type: "error", text: errorMsg });
    }
  };

  const handleForgotPassword = () => {
    alert("Please contact admin to reset your password or check backend database.");
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card-wrapper">
        <div className="auth-image-side">
          <img src={loginImg} alt="Together" />
          <div className="image-overlay-text">
            <h2>Together We Can</h2>
            <p>"Because no one should have to fight hunger alone. 🤝"</p>
          </div>
        </div>
        <div className="auth-form-side">
          <div className="form-header"><h2>Login</h2><p>Enter your details to continue.</p></div>
          <form className="form-body" onSubmit={handleLogin}>
            {message.text && <div className={`alert-box ${message.type === "error" ? "error-bg" : "success-bg"}`}>{message.text}</div>}
            <div className="input-field"><input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
            <div className="input-field"><input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
            <div className="forgot-link-container"><button type="button" onClick={handleForgotPassword} className="forgot-text">Forgot Password?</button></div>
            <button type="submit" className="auth-btn-blue">LOGIN</button>
          </form>
          <p className="auth-switch-text">Don't have an account? <Link to="/register">Sign Up</Link></p>
        </div>
      </div>
    </div>
  );
};
export default Login;