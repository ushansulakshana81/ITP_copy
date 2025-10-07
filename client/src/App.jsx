import {Switch, Route} from "wouter";
import {QueryClientProvider} from "@tanstack/react-query";
import {Toaster} from "./components/ui/toaster.jsx";
import {TooltipProvider} from "./components/ui/tooltip.jsx";
import {queryClient} from "./lib/queryClient.js";
import dashboard from "./pages/dashboard.jsx";
import Inventory from "./pages/inventory.jsx";
import Reports from "./pages/reports.jsx";
import Suppliers from "./pages/suppliers.jsx";
import Movements from "./pages/movements.jsx";
import NotFound from "./pages/not-found.jsx";
import Sidebar from "./components/layout/sidebar.jsx";
import Categories from "./pages/categories.jsx";import { useState } from "react";
import { ThemeProvider } from "./UMS/Components/ThemeContext.jsx";
import Login from "./UMS/Login.jsx";
import Users from "./UMS/Users.jsx";
import CreateUser from "./UMS/CreateUser.jsx";
import ProfileOverview from "./UMS/ProfileOverview.jsx";
import MyProfile from "./UMS/MyProfile.jsx";
import { useLocation } from "wouter";
import './App.css'

function Router() {
    console.log("Rendering Router..."); // ✅ Debug trace
  
    return (
      <div className="flex h-screen bg-slate-50">
        {/* ✅ Sidebar always visible */}
        <Sidebar />
  
        {/* ✅ Main content area */}
        <main className="flex-1 overflow-auto p-4">
          <Switch>
            {/* ✅ Dashboard route */}
            <Route path="/dashboard" component={dashboard} />
            <Route path="/inventory" component={Inventory} />
            <Route path="/categories" component={Categories} />
            <Route path="/reports" component={Reports} />
            <Route path="/suppliers" component={Suppliers} />
            <Route path="/movements" component={Movements} />
  
            {/* ✅ Catch-all for unknown routes */}
            <Route component={NotFound} />
          </Switch>
        </main>
      </div>
    );
  }

function App() {
    const [currentPage, setCurrentPage] = useState("login");
    const [selectedUserId, setSelectedUserId] = useState(null);

    const handleLoginSuccess = () => setCurrentPage("dashboard");
    const handleLogout = () => {
      localStorage.clear();
      setCurrentPage("login");
    };
    const [location, setLocation] = useLocation();
    const goToUsers = () => setCurrentPage("users");
    const goToCreateUser = () => setCurrentPage("createUser");
    const goToProfile = (userId) => {
      setSelectedUserId(userId);
      setCurrentPage("profileOverview");
    };
    const goToMyProfile = async () => {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");

      if (!token || !userId) {
        console.warn("No authentication token found. Redirecting to login...");
        alert("Session expired. Please log in again.");
        setCurrentPage("login");
        return;
      }

      try {
        const response = await fetch(`http://localhost:5002/api/users/${userId}`, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });

        if (response.status === 401) {
          alert("Session expired. Please log in again.");
          localStorage.clear();
          setCurrentPage("login");
          return;
        }

        if (!response.ok) throw new Error("Failed to fetch user data");

        const userData = await response.json();
        console.log("Fetched user data:", userData);

        setSelectedUserId(userId);
        setCurrentPage("myProfile");
      } catch (err) {
        console.error("Error fetching profile:", err);
        alert("Unable to load profile. Please log in again.");
        setCurrentPage("login");
      }
    };

    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster/>
          <ThemeProvider>
            {currentPage === "login" && (
              <Login onLoginSuccess={handleLoginSuccess} />
            )}
            {currentPage === "dashboard" && <Router />}
            {currentPage === "users" && (
              <Users
                onBack={handleLogout}
                goToProfile={goToProfile}
                goToCreateUser={goToCreateUser}
                goToMyProfile={goToMyProfile}
                onLogout={handleLogout}
              />
            )}
            {currentPage === "createUser" && (
              <CreateUser
                onLogout={handleLogout}
                goToUsers={goToUsers}
                goToProfile={goToProfile}
                goToMyProfile={goToMyProfile}
              />
            )}
            {currentPage === "profileOverview" && selectedUserId && (
              <ProfileOverview
                userId={selectedUserId}
                onBack={goToUsers}
                onLogout={handleLogout}
                goToMyProfile={goToMyProfile}
              />
            )}
            {currentPage === "myProfile" && (
              <MyProfile
                userId={localStorage.getItem("userId")}
                onBack={goToUsers}
                onLogout={handleLogout}
              />
            )}
          </ThemeProvider>
        </TooltipProvider>
      </QueryClientProvider>
    );
}

export default App;
