import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../App.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleReset = (e) => {
    e.preventDefault();
    
    
    const storedUsers = localStorage.getItem("allUsers");
    const users = storedUsers ? JSON.parse(storedUsers) : [];

    const cleanEmail = email.trim().toLowerCase();
    
  
    const savedUser = users.find(u => u.email === cleanEmail);

    if (savedUser) {
      
      setMessage({ type: "success", text: `User Found! Aapka password hai: ${savedUser.password} 🔑` });
    } else {
      setMessage({ type: "error", text: "Ye email registered nahi hai! ❌" });
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card-wrapper" style={{maxWidth: '400px', padding: '40px'}}>
        <div className="auth-form-side" style={{width: '100%'}}>
          <h2>Reset Password</h2>
          <p>Apna registered email niche likhein.</p>
          
          <form className="form-body" onSubmit={handleReset}>
            {message.text && (
              <div className={`alert-box ${message.type === "error" ? "error-bg" : "success-bg"}`} style={{marginBottom: '15px', padding: '10px', borderRadius: '5px'}}>
                {message.text}
              </div>
            )}
            <div className="input-field">
              <input 
                type="email" 
                placeholder="Email Address" 
                required 
                style={{width: '100%', padding: '10px', marginBottom: '15px'}}
                onChange={(e) => setEmail(e.target.value)} 
              />
            </div>
            <button type="submit" className="auth-btn-blue" style={{width: '100%'}}>RECOVER PASSWORD</button>
          </form>
          <p className="auth-switch-text" style={{marginTop: '20px'}}>
            Wait, yaad aa gaya? <Link to="/login">Login karein</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;