import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "../App.css";

const Register = () => {
  const registerImg = "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=1000&auto=format&fit=crop";

  const [formData, setFormData] = useState({ 
    name: "", 
    email: "", 
    password: "", 
    role: "", 
    mobile: "", 
    address: "",
    ngoKey: "" 
  });

  const [message, setMessage] = useState({ type: "", text: "" });
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    
    if (!formData.name || !formData.email || !formData.password || !formData.role || !formData.mobile || !formData.address) {
      setMessage({ type: "error", text: "Sabhi details bharna zaroori hai! ⚠️" });
      return;
    }

    
    if (formData.role === "ngo" && !formData.ngoKey) {
      setMessage({ type: "error", text: "NGO Secret Key chahiye registration ke liye! 🔑" });
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/api/auth/register", {
        name: formData.name,
        email: formData.email.trim().toLowerCase(),
        password: formData.password.trim(),
        role: formData.role,
        mobile: formData.mobile,
        address: formData.address,
        ngoKey: formData.ngoKey 
      });

      if (response.status === 201 || response.status === 200) {
        setMessage({ type: "success", text: "Registration Successful! Ab login karein. 🎉" });
        setTimeout(() => navigate("/login"), 2000);
      }
    } catch (error) {
      
      const errorMsg = error.response?.data?.msg || "Registration Failed! ❌";
      setMessage({ type: "error", text: errorMsg });
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card-wrapper">
        <div className="auth-image-side">
          <img src={registerImg} alt="Don't Waste Food" />
          <div className="image-overlay-text">
            <h2>Don't Waste Food</h2>
            <p>"A little kindness on your plate can change a life. ❤️"</p>
          </div>
        </div>

        <div className="auth-form-side">
          <div className="form-header">
            <h2>Sign Up</h2>
            <p>Join our mission and start saving lives today.</p>
          </div>

          <form className="form-body" onSubmit={handleRegister}>
            {message.text && (
              <div className={`alert-box ${message.type === "error" ? "error-bg" : "success-bg"}`}>
                {message.text}
              </div>
            )}

            <div className="input-field">
              <input type="text" placeholder="Full Name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
            </div>

            <div className="input-field">
              <input type="email" placeholder="Email Address" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
            </div>

            <div className="input-field">
              <input type="text" placeholder="Mobile Number" value={formData.mobile} onChange={(e) => setFormData({...formData, mobile: e.target.value})} />
            </div>

            <div className="input-field">
              <input type="text" placeholder="Address / Location" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} />
            </div>

            <div className="input-field">
              <input type="password" placeholder="Create Password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
            </div>

            <div className="input-field">
              <select className="role-select" value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})}>
                <option value="" disabled>Register as...</option>
                <option value="donor">I am a Donor (Donate Food)</option>
                <option value="ngo">I am an NGO (Food Provider)</option>
              </select>
            </div>

            
            {formData.role === "ngo" && (
              <div className="input-field animate-fade-in" style={{marginTop: "10px"}}>
                <label style={{fontSize: "12px", color: "#3498db", fontWeight: "bold"}}>NGO Verification Required:</label>
                <input 
                  type="text" 
                  placeholder="Enter NGO Secret Key 🔑" 
                  style={{border: "2px solid #3498db", backgroundColor: "#f0f7ff"}}
                  value={formData.ngoKey} 
                  onChange={(e) => setFormData({...formData, ngoKey: e.target.value})} 
                />
              </div>
            )}

            <button type="submit" className="auth-btn-blue">REGISTER NOW</button>
          </form>

          <p className="auth-switch-text">Already have an account? <Link to="/login">Login</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Register;