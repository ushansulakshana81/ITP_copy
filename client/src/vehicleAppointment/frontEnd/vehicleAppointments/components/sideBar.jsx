import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { useLocation } from "wouter";

import NewForm from "../components/newAppForm.jsx";
import TableView from "../components/appointmentTable.jsx";
import Notifications from "../components/Notifications.jsx";
import { useNavigate } from "react-router-dom";

export default function SideBar() {
  const [activeTab, setActiveTab] = useState("Appointment list");
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);
  // const [, navigate] = useLocation();
  const navigate = useNavigate();

  const tabs = [
    { label: "Appointment list", icon: "fa-list" },
    { label: "Add new", icon: "fa-file-alt" },
    { label: "Notifications", icon: "fa-bell" },
    { label: "Log out", icon: "fa-power-off" },
  ];

  const handleTabClick = (tab) => {
    if (tab === "Log out") {
      setShowLogoutPopup(true);
    } else {
      setActiveTab(tab);
    }
  };

  const handleLogout = () => {
    try {
      localStorage.clear();
      alert("You have been successfully logged out.");
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      alert("An error occurred while logging out.");
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "Add new":
        return <NewForm />;
      case "Appointment list":
        return <TableView />;
      case "Notifications":
        return <Notifications />;
      default:
        return <TableView />;
    }
  };

  // 🔹 Inline Logout Popup Component
  const LogoutPopup = ({ isOpen, onConfirm, onCancel }) => {
    if (!isOpen) return null;

    return (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 9999,
        }}
      >
        <div
          style={{
            background: "#fff",
            padding: "2rem",
            borderRadius: "10px",
            width: "350px",
            textAlign: "center",
            boxShadow: "0 0 10px rgba(0,0,0,0.2)",
          }}
        >
          <h5 className="mb-3">Confirm Logout</h5>
          <p>Are you sure you want to log out?</p>
          <div className="d-flex justify-content-center mt-4">
            <button
              onClick={onCancel}
              className="btn btn-secondary me-3 px-4"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="btn btn-danger px-4"
            >
              Log out
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="d-flex" style={{ height: "100vh" }}>
      {/* Sidebar */}
      <div
        className="bg-dark text-white p-3"
        style={{
          width: "220px",
          minHeight: "100vh",
          position: "fixed",
          left: 0,
          top: 0,
          zIndex: 1040,
        }}
      >
        <h4 className="mb-4">My Modules</h4>
        <ul className="list-unstyled">
          {tabs.map((tab, idx) => (
            <li
              key={idx}
              className={`mb-3 d-flex align-items-center ${activeTab === tab.label ? "fw-bold text-warning" : ""
                }`}
              style={{ cursor: "pointer" }}
              onClick={() => handleTabClick(tab.label)}
            >
              <i className={`fas ${tab.icon} me-2`}></i>
              {tab.label}
            </li>
          ))}
        </ul>
      </div>

      {/* Main Content */}
      <div
        className="flex-grow-1 p-4"
        style={{
          marginLeft: "220px",
          width: "100%",
        }}
      >
        {renderContent()}
      </div>

      {/* Logout Popup (inline defined) */}
      {showLogoutPopup && (
        <LogoutPopup
          isOpen={showLogoutPopup}
          onConfirm={handleLogout}
          onCancel={() => setShowLogoutPopup(false)}
        />
      )}
    </div>
  );
}
