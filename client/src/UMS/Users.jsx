import React, { useEffect, useState } from "react";
import Header from "./Components/Header";
import UserStatsCard from "./Components/UserStatsCard";

function Users({ onBack, goToProfile, goToCreateUser, onLogout, goToMyProfile }) {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [designationFilter, setDesignationFilter] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          console.error("No authentication token found.");
          alert("Session expired. Please log in again.");
          onLogout(); // ✅ log out user if no token
          return;
        }

        const res = await fetch("http://localhost:5002/api/users", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.status === 401) {
          console.warn("Unauthorized: Token expired or invalid");
          alert("Session expired. Please log in again.");
          onLogout();
          return;
        }

        if (!res.ok) {
          let errorText = await res.text();
          console.error("Error fetching users:", errorText);
          return;
        }

        let data;
        try {
          data = await res.json();
        } catch (parseError) {
          console.error("Failed to parse response as JSON:", parseError);
          return;
        }

        console.log("Fetched users:", data);

        if (Array.isArray(data)) {
          const sorted = data.sort((a, b) => {
            const numA = parseInt(a.employeeNumber?.replace("HS", "")) || 0;
            const numB = parseInt(b.employeeNumber?.replace("HS", "")) || 0;
            return numA - numB;
          });
          setUsers(sorted);
        } else {
          console.error("Unexpected data format:", data);
        }
      } catch (err) {
        console.error("Failed to fetch users:", err);
      }
    };

    fetchUsers();
  }, [onLogout]);

  const designations = [...new Set(users.map((u) => u.designation).filter(Boolean))];
  const activeUsers = users.filter(user => user.status?.toLowerCase() === "active").length;
  const inactiveUsers = users.filter(user => user.status?.toLowerCase() === "inactive").length;

  return (
    <>
      <Header goToMyProfile={goToMyProfile} onLogout={onLogout} onBack={onBack} />

      <main className="min-h-screen bg-blue-50 p-10 font-sans flex flex-col items-center">
        <UserStatsCard totalUsers={users.length} activeUsers={activeUsers} inactiveUsers={inactiveUsers} />

        <div className="flex justify-between items-center w-full max-w-5xl mb-10 gap-4">
          <button
            type="button"
            className="bg-gradient-to-r from-gray-800 to-black text-white font-extrabold text-3xl py-4 px-10 rounded-xl border-0 shadow-xl hover:shadow-2xl transition-shadow duration-300 ease-in-out select-none"
          >
            Users
          </button>

          <input
            type="text"
            placeholder="Search users by username..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 p-3 rounded-full border border-gray-300 text-lg shadow-sm focus:outline-none focus:ring-4 focus:ring-gray-600 focus:border-gray-600 transition duration-300 ease-in-out"
          />

          <select
            value={designationFilter}
            onChange={(e) => setDesignationFilter(e.target.value)}
            className="p-3 rounded-full border border-gray-300 text-lg shadow-sm focus:outline-none focus:ring-4 focus:ring-gray-600 transition duration-300 ease-in-out"
          >
            <option value="">All</option>
            {designations.map((des) => (
              <option key={des} value={des}>
                {des}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={goToCreateUser}
            className="bg-gradient-to-r from-green-600 to-green-800 text-white font-extrabold text-lg py-3 px-8 rounded-xl border-0 shadow-lg cursor-pointer hover:scale-105 active:scale-95 transition transform duration-300 ease-in-out select-none"
          >
            Add a user
          </button>
        </div>

        <div className="bg-white rounded-2xl p-6 w-full max-w-7xl shadow-xl overflow-x-auto">
          <table className="w-full border-collapse text-left rounded-2xl overflow-hidden">
            <thead>
              <tr className="bg-gradient-to-r from-gray-900 to-gray-800 text-white select-none">
                <th className="p-4 border-b border-purple-300 font-semibold tracking-wide">S/N</th>
                <th className="p-4 border-b border-purple-300 font-semibold tracking-wide">Employee Number</th>
                <th className="p-4 border-b border-purple-300 font-semibold tracking-wide">User Name</th>
                <th className="p-4 border-b border-purple-300 font-semibold tracking-wide">Email Address</th>
                <th className="p-4 border-b border-purple-300 font-semibold tracking-wide">Account Status</th>
                <th className="p-4 border-b border-gray-300 font-semibold tracking-wide">Designation</th>
              </tr>
            </thead>
            <tbody>
              {users
                .filter(user =>
                  user.username.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .filter(user =>
                  designationFilter ? user.designation === designationFilter : true
                )
                .map((user, idx) => {
                  const status = user.status?.toLowerCase();
                  const statusColor =
                    status === "active"
                      ? "bg-green-500 text-white"
                      : status === "inactive"
                      ? "bg-gray-400 text-white"
                      : status === "suspend" || status === "suspended"
                      ? "bg-yellow-400 text-gray-900"
                      : "bg-gray-300 text-gray-900";

                  const profileImg =
                    user.profileImageUrl ||
                    "https://ui-avatars.com/api/?name=" + encodeURIComponent(user.username || "User");

                  return (
                    <tr
                      key={user._id}
                      className={`cursor-pointer transition-colors duration-300 ease-in-out ${
                        idx % 2 === 0 ? "bg-gray-50 hover:bg-gray-100" : "bg-white hover:bg-gray-200"
                      } text-gray-900`}
                      onClick={() => goToProfile(user._id)}
                    >
                      <td className="p-4 border-b border-gray-200 font-semibold">{idx + 1}</td>
                      <td className="p-4 border-b border-gray-200">{user.employeeNumber || "-"}</td>
                      <td className="p-4 border-b border-gray-200 flex items-center gap-3">
                        <img
                          src={profileImg}
                          alt="profile"
                          className="w-9 h-9 rounded-full object-cover border-2 border-gray-300 bg-gray-200"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://ui-avatars.com/api/?name=User";
                          }}
                        />
                        <span className="font-medium">{user.username}</span>
                      </td>
                      <td className="p-4 border-b border-gray-200">{user.email || "-"}</td>
                      <td className="p-4 border-b border-gray-200">
                        <span
                          className={`inline-block px-4 py-1 rounded-full font-semibold text-sm ${statusColor} shadow`}
                          style={{ letterSpacing: "0.05em", minWidth: "90px", textAlign: "center" }}
                        >
                          {user.status
                            ? user.status.charAt(0).toUpperCase() + user.status.slice(1)
                            : "Unknown"}
                        </span>
                      </td>
                      <td className="p-4 border-b border-gray-200">{user.designation || "-"}</td>
                    </tr>
                  );
                })}
              {users.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center p-6 text-gray-500 font-semibold text-lg">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}

export default Users;