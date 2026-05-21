import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios"; 
import "../App.css";

const DonorDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("donate");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  
  const loggedInUser = JSON.parse(sessionStorage.getItem("donorUser") || "{}");

  const [profile, setProfile] = useState(() => {
    const saved = sessionStorage.getItem(`donorProfile_${loggedInUser.email}`);
    return saved ? JSON.parse(saved) : { 
      name: loggedInUser.name || "", 
      email: loggedInUser.email || "", 
      gender: "", 
      address: loggedInUser.address || "", 
      photo: null 
    };
  });

  const [foodData, setFoodData] = useState({ title: "", quantity: "", address: profile.address || "", pincode: "", mobile: "", image: null });
  const [history, setHistory] = useState([]);

  const syncData = useCallback(async () => {
    if (!loggedInUser.email) return;
    try {
      const response = await axios.get(`http://localhost:5000/api/food/my-donations/${loggedInUser.email.toLowerCase()}`);
      setHistory(response.data);
    } catch (error) {
      console.error("Fetch error:", error);
    }
  }, [loggedInUser.email]);

  useEffect(() => {
    if (!loggedInUser.email) {
      navigate("/login");
      return;
    }
    syncData();
    const interval = setInterval(syncData, 5000); 
    return () => clearInterval(interval);
  }, [loggedInUser.email, syncData, navigate]);

  useEffect(() => {
    if(loggedInUser.email) {
      sessionStorage.setItem(`donorProfile_${loggedInUser.email}`, JSON.stringify(profile));
    }
  }, [profile, loggedInUser.email]);

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      sessionStorage.removeItem("donorUser");
      sessionStorage.removeItem("loggedInUser");
      navigate("/login");
    }
  };

  const handleCapture = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 600;
          const scaleSize = MAX_WIDTH / img.width;
          canvas.width = MAX_WIDTH;
          canvas.height = img.height * scaleSize;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          setFoodData({ ...foodData, image: canvas.toDataURL("image/jpeg", 0.6) });
        };
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfilePhoto = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProfile({ ...profile, photo: reader.result });
      reader.readAsDataURL(file);
    }
  };

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      if (window.confirm("HungerFree wants to access your live location? 📍")) {
        navigator.geolocation.getCurrentPosition((pos) => {
          const mapUrl = `https://www.google.com/maps?q=${pos.coords.latitude},${pos.coords.longitude}`;
          setFoodData({ ...foodData, address: mapUrl });
          alert("Live Location Linked! ✅");
        }, (err) => {
          alert("Location access denied.");
        });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!foodData.image) { alert("Photo is mandatory! 📸"); return; }
    
    const now = new Date();
    const formattedDT = `${now.toLocaleDateString('en-GB')} | ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}`;

    const entryForNGO = {
      title: foodData.title,
      dt: formattedDT,
      status: "PENDING",
      address: foodData.address,
      pincode: foodData.pincode,
      donorMobile: foodData.mobile, 
      donorName: profile.name,
      donorEmail: profile.email.toLowerCase(),
      qty: foodData.quantity,
      otp: Math.floor(1000 + Math.random() * 9000).toString(),
      photo: foodData.image
    };

    try {
      const response = await axios.post("http://localhost:5000/api/food/add", entryForNGO);
      if (response.status === 201 || response.status === 200) {
        alert(`Success! Donation posted. OTP: ${entryForNGO.otp} ✅`);
        setFoodData({ title: "", quantity: "", mobile: "", pincode: "", address: profile.address || "", image: null });
        setTimeout(() => syncData(), 500); 
      }
    } catch (error) {
      alert("Error: Backend connection failed! ❌");
    }
  };

  const handleDeleteItem = async (id) => {
    if (window.confirm("Delete this record?")) {
      try {
        await axios.delete(`http://localhost:5000/api/food/delete/${id}`);
        syncData();
      } catch (error) {
        alert("Delete failed! ❌");
      }
    }
  };

  const handleNumberInput = (e, field, limit) => {
    const val = e.target.value.replace(/\D/g, "");
    if (val.length <= limit) setFoodData({ ...foodData, [field]: val });
  };

  return (
    <div className={`dashboard-layout ${isSidebarOpen ? "sidebar-expanded" : "sidebar-collapsed"}`}>
      <nav className="sidebar-modern">
        <div className="sidebar-brand" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
          <span className="hamburger">☰</span>
          {isSidebarOpen && <span className="brand-name">HungerFree</span>}
        </div>
        <ul className="sidebar-menu">
          <li className={`menu-item ${activeTab === 'donate' ? 'active' : ''}`} onClick={() => setActiveTab('donate')}>
            <span className="menu-icon">🍲</span>
            {isSidebarOpen && <span className="menu-text">Donate Food</span>}
          </li>
          <li className={`menu-item ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
            <span className="menu-icon">👤</span>
            {isSidebarOpen && <span className="menu-text">My Profile</span>}
          </li>
          <li className="menu-item logout-item" onClick={handleLogout}>
            <span className="menu-icon">🚪</span>
            {isSidebarOpen && <span className="menu-text">Logout</span>}
          </li>
        </ul>
      </nav>
      <main className="main-content-modern">
        <header className="portal-top-nav">
          <div className="nav-left"><h2>DONOR PORTAL</h2></div>
          <div className="nav-right">
            <span className="live-badge">● {profile.name.toUpperCase()}</span>
            <div className="nav-profile-link" onClick={() => setActiveTab('profile')}>
              {profile.photo ? <img src={profile.photo} className="nav-avatar" alt="p"/> : "👤"}
            </div>
          </div>
        </header>
        <div className="dashboard-scroll-area">
          {activeTab === 'donate' ? (
            <div className="content-padding">
              <div className="welcome-hero">
                <h1>Welcome, {profile.name}! 👋</h1>
                <p>"Your surplus is not waste; it is a second chance for someone who has nothing." ✨</p>
              </div>
              <div className="donor-grid-system">
                <section className="donation-card">
                  <h2 className="section-title">New Food Entry</h2>
                  <form onSubmit={handleSubmit} className="donation-form">
                    <div className="form-group-modern">
                      <label>Food Description</label>
                      <input type="text" placeholder="e.g. Rice and Curry" value={foodData.title} onChange={(e) => setFoodData({...foodData, title: e.target.value})} required />
                    </div>
                    <div className="form-row-half">
                      <div className="form-group-modern">
                        <label>Persons</label>
                        <input type="number" value={foodData.quantity} onChange={(e) => setFoodData({...foodData, quantity: e.target.value})} required />
                      </div>
                      <div className="form-group-modern">
                        <label>Mobile</label>
                        <input type="tel" value={foodData.mobile} onChange={(e) => handleNumberInput(e, "mobile", 10)} required />
                      </div>
                    </div>
                    <div className="form-group-modern">
                      <label>Pincode</label>
                      <input type="text" value={foodData.pincode} onChange={(e) => handleNumberInput(e, "pincode", 6)} required />
                    </div>
                    <div className="form-group-modern">
                      <label>Location / Address</label>
                      <textarea 
                        rows="2" 
                        placeholder="Enter address..." 
                        value={foodData.address} 
                        onChange={(e) => setFoodData({...foodData, address: e.target.value})} 
                        required 
                      />
                      <button type="button" className="location-link-btn" onClick={handleGetLocation} style={{background: '#059669', color: 'white', marginTop: '5px', padding: '8px', border: 'none', borderRadius: '4px', cursor: 'pointer'}}>
                        📍 Share My Live Location
                      </button>
                    </div>
                    <div className="form-group-modern">
                      <label>Food Photo</label>
                      <input type="file" accept="image/*" onChange={handleCapture} />
                      {foodData.image && <img src={foodData.image} alt="Preview" className="mini-preview" style={{width: '60px', marginTop: '10px', borderRadius: '4px'}} />}
                    </div>
                    <button type="submit" className="confirm-btn-main">CONFIRM DONATION</button>
                  </form>
                </section>
                <section className="history-section">
                  <div className="history-header"><h2 className="section-title">My Activity</h2></div>
                  <div className="history-list-container">
                    {history.length === 0 ? (
                      <p className="no-data-text">No donations found. Start sharing! 😊</p>
                    ) : (
                      history.map((item) => (
                        <div className="history-box-card" key={item._id}>
                          <div className="box-top">
                            <span className="box-dt">{item.dt}</span>
                            <div className="box-actions">
                              <span className={`status-badge ${(item.status || "PENDING").toLowerCase()}`}>{item.status}</span>
                              <button onClick={() => handleDeleteItem(item._id)} className="delete-small-btn">×</button>
                            </div>
                          </div>
                          <div className="box-body-compact">
                            <h4>{item.title}</h4>
                            <p>Qty: <strong>{item.qty}</strong></p>
                            
                            <div style={{marginTop: '10px', padding: '8px', background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '6px', textAlign: 'center'}}>
                               <span style={{fontSize: '11px', color: '#64748b', display: 'block'}}>SECURE OTP</span>
                               <strong style={{color: '#0f172a', fontSize: '18px', letterSpacing: '2px'}}>{item.otp || "----"}</strong>
                            </div>

                            {item.receivedBy ? (
                              <div style={{marginTop: '12px', padding: '10px', background: '#ecfdf5', borderLeft: '4px solid #10b981', borderRadius: '4px'}}>
                                <p style={{margin: '0', fontSize: '12px', fontWeight: 'bold', color: '#065f46', textDecoration: 'underline'}}>NGO DETAILS 🤝</p>
                                <p style={{margin: '5px 0 0', fontSize: '13px', color: '#047857'}}><strong>NGO:</strong> {item.receivedBy}</p>
                                <p style={{margin: '2px 0 0', fontSize: '13px', color: '#047857'}}><strong>Contact:</strong> {item.ngoMobile || 'N/A'}</p>
                                <p style={{margin: '2px 0 0', fontSize: '11px', color: '#059669'}}><i>{item.ngoEmail}</i></p>
                              </div>
                            ) : (
                              <p style={{marginTop: '10px', fontSize: '11px', color: '#94a3b8', textAlign: 'center'}}><i>⏳ Waiting for NGO pickup...</i></p>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </section>
              </div>
            </div>
          ) : (
            <div className="content-padding">
              <div className="donor-profile-container-modern">
                <div className="donor-profile-card-main">
                  <div className="profile-photo-section">

                    <div className="photo-circle">{profile.photo ? <img src={profile.photo} alt="User" /> : <span>👤</span>}</div>
                    <label className="upload-photo-btn">Change Photo<input type="file" hidden accept="image/*" onChange={handleProfilePhoto} /></label>
                  </div>
                  <div className="profile-form">
                    <div className="form-group-modern"><label>Full Name</label><input type="text" value={profile.name} onChange={(e) => setProfile({...profile, name: e.target.value})} /></div>
                    <div className="form-group-modern"><label>Email</label><input type="email" value={profile.email} readOnly /></div>
                    <div className="form-group-modern">
                      <label>Gender</label>
                      <div className="gender-toggle-group">
                        <button className={`gender-btn ${profile.gender === 'Male' ? 'active' : ''}`} onClick={() => setProfile({...profile, gender: 'Male'})}>Male</button>
                        <button className={`gender-btn ${profile.gender === 'Female' ? 'active' : ''}`} onClick={() => setProfile({...profile, gender: 'Female'})}>Female</button>
                      </div>
                    </div>
                    <div className="form-group-modern"><label>Default Address</label><textarea rows="3" value={profile.address} onChange={(e) => setProfile({...profile, address: e.target.value})} /></div>
                    <button className="confirm-btn-main" onClick={() => { alert("Profile Updated! ✅"); setActiveTab('donate'); }}>SAVE PROFILE</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default DonorDashboard;