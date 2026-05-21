import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../App.css";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [allDonations, setAllDonations] = useState([]);
  const [allUsers, setAllUsers] = useState([]);

  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem("adminProfile");
    return saved ? JSON.parse(saved) : {
      name: "Admin",
      email: "admin@hungerfree.com",
      mobile: "",
      gender: "Male",
      address: "",
      photo: null
    };
  });

  const fetchAdminData = async () => {
    try {
      const foodRes = await axios.get("http://localhost:5000/api/food/all");
      setAllDonations(foodRes.data);

      const userRes = await axios.get("http://localhost:5000/api/auth/users");
      setAllUsers(userRes.data.reverse());
    } catch (error) {
      console.error("Admin data fetch error:", error);
    }
  };

  useEffect(() => {
    fetchAdminData();
    const interval = setInterval(fetchAdminData, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    localStorage.setItem("adminProfile", JSON.stringify(profile));
  }, [profile]);

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to Logout?")) {
      localStorage.removeItem("loggedInUser");
      navigate("/login");
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProfile({ ...profile, photo: reader.result });
      reader.readAsDataURL(file);
    }
  };

  const ngos = allUsers.filter(u => u.role === "ngo");
  const donors = allUsers.filter(u => u.role === "donor");

  return (
    <div className="admin-portal">
      <aside className={`admin-sidebar ${isSidebarOpen ? "open" : ""}`}>
        <div className="sidebar-brand">
          <div className="brand-header">
            <button className="back-arrow-btn" onClick={() => setIsSidebarOpen(false)}>←</button>
            <div className="admin-logo-circle">
              {profile.photo ? <img src={profile.photo} alt="P" /> : "👑"}
            </div>
          </div>
        </div>

        <nav className="sidebar-links">
          <button className={activeTab === "dashboard" ? "active" : ""} onClick={() => setActiveTab("dashboard")}>
            📊 Dashboard
          </button>
          <button className={activeTab === "ngoList" ? "active" : ""} onClick={() => setActiveTab("ngoList")}>
            🤝 NGO List ({ngos.length})
          </button>
          <button className={activeTab === "donorList" ? "active" : ""} onClick={() => setActiveTab("donorList")}>
            🎁 Donor List ({donors.length})
          </button>
          <button className={activeTab === "profile" ? "active" : ""} onClick={() => setActiveTab("profile")}>
            👤 My Profile
          </button>
        </nav>

        <div className="sidebar-bottom">
          <button className="logout-sidebar-btn" onClick={handleLogout}>Logout 🚪</button>
        </div>
      </aside>

      <header className="admin-top-nav">
        <div className="nav-left">
          <button className="hamburger" onClick={() => setIsSidebarOpen(true)}>☰</button>
          <h2>MASTER ADMIN👑</h2>
        </div>
        <div className="nav-right" onClick={() => setActiveTab("profile")}>
          <img src={profile.photo || "https://via.placeholder.com/35"} alt="profile" style={{ borderRadius: '50%', width: '35px', height: '35px' }} />
          <span>{profile.name}</span>
        </div>
      </header>

      <main className="admin-main-content">
        {activeTab === "dashboard" ? (
          <div className="dashboard-view animate-fade">
            <div className="page-header">
              <h1>Master Dashboard</h1>
              <p>"Every successful record is a victory for someone who was waiting for a miracle tonight." 🕯️🍲</p>
            </div>

            <div className="stats-grid">
              <div className="stat-box gradient-blue">
                <div className="stat-icon-bg">👥</div>
                <h4>Total Donations</h4>
                <p className="stat-number">{allDonations.length}</p>
              </div>
              <div className="stat-box gradient-green">
                <div className="stat-icon-bg">🍱</div>
                <h4>Delivered</h4>
                <p className="stat-number">{allDonations.filter(d => d.status === "DELIVERED").length}</p>
              </div>
              <div className="stat-box gradient-orange">
                <div className="stat-icon-bg">🏢</div>
                <h4>Pending</h4>
                <p className="stat-number">{allDonations.filter(d => d.status === "PENDING").length}</p>
              </div>
            </div>

            <div className="activity-card">
              <div className="card-header-flex">
                <h3>All Food Donations</h3>
                <span className="live-pill">● Live</span>
              </div>

              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Photo</th>
                    <th>Food</th>
                    <th>Donor</th>
                    <th>NGO</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {allDonations.map(item => (
                    <tr key={item._id}>
                      <td>{item.photo ? <img src={item.photo} alt="food" style={{ width: '50px', borderRadius: '8px' }} /> : "No Image"}</td>
                      <td><strong>{item.title}</strong><br /><small>{item.dt}</small><br />Qty: {item.qty}</td>
                      <td>
                        👤 {item.donorName || "Unknown"} <br />
                        📧 {item.donorEmail || "No Email"} <br />
                        📞 {item.donorMobile || "N/A"} <br /> 
                        {item.address?.startsWith("http") ? (
                          <a href={item.address} target="_blank" rel="noreferrer">📍 Track Donor</a>
                        ) : (
                          <>📍 {item.address}</>
                        )}
                      </td>
                      <td>
                        {item.receivedBy ? (
                          <>
                            🤝 {item.receivedBy} <br />
                            📧 {item.ngoEmail} <br />
                            📞 {item.ngoMobile} <br />
                            {item.ngoLocation?.startsWith("http") && (
                              <a href={item.ngoLocation} target="_blank" rel="noreferrer">📍 Track NGO</a>
                            )}
                          </>
                        ) : <span style={{color: '#94a3b8'}}>Not Assigned</span>}
                      </td>
                      <td><span className={`status-badge ${(item.status || "PENDING").toLowerCase().replace(" ", "-")}`}>{item.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : activeTab === "ngoList" ? (
          <div className="view-container animate-fade">
              <div className="page-header">
                <h1>Registered NGOs</h1>
                <p>Managing {ngos.length} partner organizations.</p>
              </div>
              <div className="activity-card">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>NGO Name</th>
                      <th>Email Address</th>
                      <th>Role</th>
                      <th>Mobile Number</th>
                      <th>Address</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ngos.map((ngo, index) => (
                     <tr key={ngo._id || index}>
                       <td><strong>{ngo.name}</strong></td>
                       <td>{ngo.email}</td>
                       <td><span className="status-badge ngo">NGO</span></td>
                       <td>{ngo.mobile || "N/A"}</td>
                       <td>{ngo.address || "N/A"}</td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
          </div>
        ) : activeTab === "donorList" ? (
          <div className="view-container animate-fade">
            <div className="page-header">
              <h1>Registered Donors</h1>
              <p>Total {donors.length} individual/corporate donors.</p>
            </div>
            <div className="activity-card">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Donor Name</th>
                    <th>Email Address</th>
                    <th>Role</th>
                    <th>Mobile Number</th>
                    <th>Address</th>
                  </tr>
                </thead>
                <tbody>
                  {donors.map((donor, index) => (
                    <tr key={donor._id || index}>
                      <td><strong>{donor.name}</strong></td>
                      <td>{donor.email}</td>
                      <td><span className="status-badge donor">DONOR</span></td>
                      <td>{donor.mobile || "N/A"}</td>
                      <td>{donor.address || "N/A"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="profile-view animate-fade">
            <div className="profile-card">
              <div className="profile-header-flex">
                <h2>Admin Profile Settings</h2>
                <button className="back-btn-simple" onClick={() => setActiveTab("dashboard")}>← Back</button>
              </div>

              <div className="profile-content-grid">
                <div className="profile-photo-side">
                  <div className="big-avatar-circle">
                    {profile.photo ? <img src={profile.photo} alt="Admin" /> : "👑"}
                  </div>
                  <label className="upload-label">
                    Update Photo
                    <input type="file" onChange={handlePhotoUpload} hidden />
                  </label>
                </div>

                <div className="profile-form-side">
                  <div className="form-row">
                    <div className="input-group">
                      <label>Full Name</label>
                      <input type="text" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
                    </div>
                    <div className="input-group">
                      <label>Gender</label>
                      <select value={profile.gender} onChange={(e) => setProfile({ ...profile, gender: e.target.value })}>
                        <option>Male</option>
                        <option>Female</option>
                        <option>Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="input-group">
                      <label>Mobile Number 📞</label>
                      <input type="text" value={profile.mobile} onChange={(e) => setProfile({ ...profile, mobile: e.target.value })} />
                    </div>
                    <div className="input-group">
                      <label>Email Address</label>
                      <input type="email" value={profile.email} disabled />
                    </div>
                  </div>

                  <div className="input-group">
                    <label>Office Address 📍</label>
                    <textarea value={profile.address} onChange={(e) => setProfile({ ...profile, address: e.target.value })} />
                  </div>

                  <button className="save-profile-btn" onClick={() => alert("Profile Saved Successfully!")}>
                    SAVE PROFILE
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;