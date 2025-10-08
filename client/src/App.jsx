// React & Hooks
import { useState } from "react";

// React Router
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// React Query
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient.js";

// UI Components
import { Toaster } from "./components/ui/toaster.jsx";
import { TooltipProvider } from "./components/ui/tooltip.jsx";
import { ThemeProvider } from "./UMS/Components/ThemeContext.jsx";
import { FiUser } from "react-icons/fi"; 

// Pages / Views
import Login from "./UMS/Login.jsx";
import AdminPanel from "./AdminPanel.jsx";
import MyProfile from "./UMS/MyProfile.jsx";
import NotFound from "./pages/not-found.jsx";
import VehicleAppointment from "../src/vehicleAppointment/frontEnd/vehicleAppointments/components/sideBar.jsx"
import Purchasing from "../src/purchasing/frontend/src/modules/supplier/pages/Dashboard.jsx"
// Styles
import './App.css';
import { navigate } from "wouter/use-browser-location";

function App() {
  const [userRole, setUserRole] = useState(localStorage.getItem("role") || null);

  const handleLoginSuccess = (role) => {
    setUserRole(role);
    localStorage.setItem("role", role);
  };

  const handleLogout = () => {
    localStorage.clear();
    setUserRole(null);
    alert("You have been successfully logged out.");
    navigate("/login");
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <ThemeProvider>
          <Routes>
            {/* Login route */}
            <Route
              path="/login"
              element={<Login onLoginSuccess={handleLoginSuccess} />}
            />

            {/* Admin panel route */}
            <Route
              path="/adminPanel/*"
              element={
                userRole === "admin" ? (
                  <AdminPanel userId={localStorage.getItem("userId")} onLogout={handleLogout} />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            {/* vhicle appointment route */}
            <Route
              path="/vehicleAppointment"
              element={
                userRole ? (
                  <VehicleAppointment userId={localStorage.getItem("userId")} onLogout={handleLogout} />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            {/* purchasing */}
            <Route
              path="/purchasing"
              element={
                userRole ? (
                  <Purchasing userId={localStorage.getItem("userId")} onLogout={handleLogout} />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            {/* My profile route */}
            <Route
              path="/myProfile"
              element={
                userRole ? (
                  <MyProfile userId={localStorage.getItem("userId")} onLogout={handleLogout} />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />

            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
