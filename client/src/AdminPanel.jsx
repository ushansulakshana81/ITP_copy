// AdminPanel.jsx
import { Suspense, lazy } from "react";
import { Routes, Route, NavLink, Navigate } from "react-router-dom";

// Lazy load pages
const Dashboard = lazy(() => import("./pages/dashboard.jsx"));
const Inventory = lazy(() => import("./pages/inventory.jsx"));
const Categories = lazy(() => import("./pages/categories.jsx"));
const Reports = lazy(() => import("./pages/reports.jsx"));
const Suppliers = lazy(() => import("./pages/suppliers.jsx"));
const Movements = lazy(() => import("./pages/movements.jsx"));
const MyProfile = lazy(() => import("./UMS/MyProfile.jsx"));

function AdminPanel({ userId, onLogout }) {
  const tabs = [
    { path: "dashboard", label: "Dashboard" },
    { path: "inventory", label: "Inventory" },
    { path: "categories", label: "Categories" },
    { path: "reports", label: "Reports" },
    { path: "suppliers", label: "Suppliers" },
    { path: "movements", label: "Movements" },
    { path: "myProfile", label: "My Profile" },
  ];

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md flex flex-col">
        <div className="p-6 font-bold text-xl border-b border-gray-200">
          Admin Panel
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {tabs.map((tab) => (
            <NavLink
              key={tab.path}
              to={`/adminPanel/${tab.path}`}
              className={({ isActive }) =>
                `w-full block px-4 py-2 rounded-lg font-medium transition ${
                  isActive ? "bg-orange-500 text-white" : "hover:bg-gray-100"
                }`
              }
              aria-current={({ isActive }) => (isActive ? "page" : undefined)}
            >
              {tab.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t">
          <button
            className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
            onClick={onLogout}
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-6">
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
            <Route
              path="/dashboard"
              element={<Dashboard />}
            />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/suppliers" element={<Suppliers />} />
            <Route path="/movements" element={<Movements />} />
            <Route path="/myProfile" element={<MyProfile userId={userId} />} />
            {/* Default redirect to dashboard */}
            <Route path="/" element={<Navigate to="dashboard" replace />} />
            {/* Catch-all */}
            <Route path="*" element={<div>Page Not Found</div>} />
          </Routes>
        </Suspense>
      </main>
    </div>
  );
}

export default AdminPanel;
