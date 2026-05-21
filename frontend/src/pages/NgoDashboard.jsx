import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../App.css";

const NgoDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("donations");
  const [allDonations, setAllDonations] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  
  const loggedInUser = JSON.parse(sessionStorage.getItem("ngoUser") || "{}");

  const [profile, setProfile] = useState(() => {
    const saved = sessionStorage.getItem(`ngoProfile_${loggedInUser.email}`);
    return saved ? JSON.parse(saved) : { 
      name: loggedInUser.name || "", 
      mobile: "", 
      email: loggedInUser.email || "", 
      gender: "", 
      address: "", 
      photo: null 
    };
  });

  useEffect(() => {
    if (!loggedInUser.email) {
      navigate("/login");
    }
  }, [loggedInUser.email, navigate]);

  const syncData = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/food/all");
      const filtered = response.data.filter(item => {
        return item.status === "PENDING" || item.claimedByEmail === loggedInUser.email;
      });
      setAllDonations(filtered);
    } catch (err) {
      console.error("Fetch Error:", err);
    }
  };

  useEffect(() => {
    syncData();
    const interval = setInterval(syncData, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (loggedInUser.email) {
      sessionStorage.setItem(`ngoProfile_${loggedInUser.email}`, JSON.stringify(profile));
    }
  }, [profile, loggedInUser.email]);

  const handleLogout = () => {
    if(window.confirm("Are you sure you want to logout?")) {
      sessionStorage.removeItem("ngoUser"); 
      navigate("/login");
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

  const getNGOLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const mapUrl = `https://www.google.com/maps?q=${position.coords.latitude},${position.coords.longitude}`;
        setProfile({ ...profile, address: mapUrl });
        alert("NGO Live Location Captured! 📍");
      });
    }
  };

  const handleClaim = async (id) => {
    if(!profile.mobile || !profile.name) {
        alert("Please complete your profile (Name & Mobile) before claiming!");
        setActiveTab("profile");
        return;
    }
    
    try {
      await axios.put(`http://localhost:5000/api/food/update/${id}`, {
        status: "IN PROGRESS",
        claimedByEmail: loggedInUser.email,
        receivedBy: profile.name, 
        ngoMobile: profile.mobile, 
        ngoEmail: loggedInUser.email,
        ngoLocation: profile.address 
      });
      alert("Food Claimed! Please meet the donor and verify the OTP. ✅");
      syncData();
    } catch (err) {
      alert("Claim failed!");
    }
  };

  const handleVerifyOTP = async (id, correctOTP) => {
    const inputOTP = prompt("Enter the 4-digit OTP received from the Donor:");
    if (!inputOTP) return;

    if (inputOTP.toString() === correctOTP.toString()) {
      try {
        await axios.put(`http://localhost:5000/api/food/update/${id}`, {
          status: "DELIVERED"
        });
        alert("OTP Verified! Donation completed successfully. 🏆");
        syncData(); 
      } catch (err) {
        alert("Verification failed!");
      }
    } else {
      alert("Wrong OTP! ❌");
    }
  };

  return (
    <div className="admin-container">
      <button className="sidebar-toggle-floating" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
        {isSidebarOpen ? "✕" : "☰"}
      </button>

      <aside className={`ngo-floating-sidebar ${isSidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header-ngo">
          <div className="ngo-avatar-box">
              {profile.photo ? <img src={profile.photo} alt="p"/> : "🤝"}
          </div>
          <h3>NGO Portal</h3>
        </div>
        <nav className="ngo-nav-links">
          <button className={activeTab === "donations" ? "active" : ""} onClick={() => {setActiveTab("donations"); setIsSidebarOpen(false);}}>
            <span>🍲</span> Live Orders
          </button>
          <button className={activeTab === "profile" ? "active" : ""} onClick={() => {setActiveTab("profile"); setIsSidebarOpen(false);}}>
            <span>👤</span> My Profile
          </button>
          <button className="logout-btn-side" onClick={handleLogout}>
            <span>🚪</span> Logout
          </button>
        </nav>
      </aside>

      <nav className="admin-nav" style={{ background: '#aa0586' }}>
        <div className="nav-logo">
          <h2 onClick={() => setActiveTab("donations")} style={{cursor: 'pointer', paddingLeft: '40px'}}>NGO Portal 🤝</h2>
        </div>
      </nav>

      <div className="admin-content">
        {activeTab === "donations" ? (
          <>
            <div className="admin-header">
              <h1>Welcome, {profile.name || "Partner"}!</h1>
              <div className="admin-stats">
                <div className="admin-box color-2"><h4>Available</h4><p>{allDonations.filter(d => d.status === "PENDING").length}</p></div>
                <div className="admin-box color-1"><h4>In Progress</h4><p>{allDonations.filter(d => d.claimedByEmail === loggedInUser.email && d.status === "IN PROGRESS").length}</p></div>
                <div className="admin-box color-3"><h4>My Deliveries</h4><p>{allDonations.filter(d => d.claimedByEmail === loggedInUser.email && d.status === "DELIVERED").length}</p></div>
              </div>
            </div>

            <section className="user-management">
              <div className="section-header"><h3>Live Orders</h3></div>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Photo</th>
                    <th>Details</th>
                    <th>Donor Identity & Spot</th>
                    <th>Persons</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {allDonations.map((food) => {
                    const amIClaimer = food.claimedByEmail === loggedInUser.email;
                    return (
                    <tr key={food._id}>
                      <td>{food.photo ? <img src={food.photo} alt="food" style={{width: '50px', height: '50px', borderRadius: '5px', objectFit: 'cover'}} /> : "No Photo"}</td>
                      <td>
                        <strong>{food.title}</strong><br/>
                        <small style={{color: '#64748b'}}>{food.dt}</small>
                      </td>
                      <td>
                        <div className="donor-info-cell">
                          <p className="donor-name">👤 {food.donorName}</p>
                          <p className="donor-email">📧 {food.donorEmail}</p>
                          <p className="donor-mobile">📞 {food.donorMobile || food.mobile}</p> 
                          {food.address && food.address.startsWith("http") ? (
                            <a href={food.address} target="_blank" rel="noreferrer" className="track-btn">📍 Track Donor</a>
                          ) : (
                            <small className="address-text">🏠 {food.address}</small>
                          )}
                        </div>
                      </td>
                      <td><span className="role-badge">{food.qty}</span></td>
                      <td>
                        <span className={`status-badge ${food.status.toLowerCase().replace(" ", "-")}`}>
                          {food.status}
                        </span>
                      </td>
                      <td>
                        {food.status === "PENDING" && (
                          <button className="claim-btn-modern" onClick={() => handleClaim(food._id)}>Claim Food</button>
                        )}
                        {food.status === "IN PROGRESS" && amIClaimer && (
                          <button className="confirm-btn-main" style={{background: '#2563eb', padding: '5px 10px'}} onClick={() => handleVerifyOTP(food._id, food.otp)}>Verify OTP</button>
                        )}
                        {food.status === "DELIVERED" && amIClaimer && <span style={{color: '#059669', fontWeight: 'bold'}}>Received ✅</span>}
                        {food.status === "IN PROGRESS" && !amIClaimer && <small>Claimed by others</small>}
                      </td>
                    </tr>
                  )})}
                </tbody>
              </table>
            </section>
          </>
        ) : (
          <div className="profile-container-modern">
            <div className="profile-header-flex">
              <h2 className="section-title">NGO Profile Settings</h2>
              <button className="back-btn" onClick={() => setActiveTab("donations")}>← Back</button>
            </div>
            <div className="profile-card-main">
              <div className="profile-photo-section">
                <div className="photo-circle">
                  {profile.photo ? <img src={profile.photo} alt="User" /> : <span>👤</span>}
                </div>
                <label className="upload-photo-btn">
                  Upload Photo
                  <input type="file" hidden accept="image/*" onChange={handleProfilePhoto} />
                </label>
              </div>
              
              <div className="profile-form">
                <div className="form-group-modern">
                  <label>Full Name / NGO Name</label>
                  <input type="text" value={profile.name} onChange={(e) => setProfile({...profile, name: e.target.value})} />
                </div>
                <div className="form-group-modern">
                  <label>NGO Mobile Number 📞</label>
                  <input type="tel" placeholder="Enter Contact Number" value={profile.mobile} onChange={(e) => setProfile({...profile, mobile: e.target.value})} />
                </div>
                <div className="form-group-modern">
                  <label>Email Address</label>
                  <input type="email" value={profile.email} readOnly />
                </div>
                
<div className="form-group-modern">
  <label>Gender 🚻</label>
  <select 
    value={profile.gender} 
    onChange={(e) => setProfile({...profile, gender: e.target.value})}
    className="gender-select"
  >
    <option value="">Select Gender</option>
    <option value="Male">Male</option>
    <option value="Female">Female</option>
    <option value="Other">Other</option>
  </select>
</div>
                <div className="form-group-modern">
                  <label>Office Address / Location 📍</label>
                  <textarea rows="3" value={profile.address} onChange={(e) => setProfile({...profile, address: e.target.value})} placeholder="Enter Address" />
                  <button type="button" className="ngo-location-btn" onClick={getNGOLocation}>📍 Use Live Location</button>
                </div>
                <button className="confirm-btn-main" style={{background: '#059669'}} onClick={() => { alert("NGO Profile Saved! ✅"); setActiveTab('donations'); }}>SAVE PROFILE</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NgoDashboard;