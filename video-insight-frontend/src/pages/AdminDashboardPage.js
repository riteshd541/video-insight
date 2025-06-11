import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { getAllUsers } from "../api/admin";
import { toast } from "react-toastify";
import Header from "../components/Header/Header";
import "../styles/AdminDashboardPage.css";

export default function AdminDashboardPage() {
  const { authState } = useContext(AuthContext);
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (authState.isLoading) {
      return;
    }

    if (!authState.token || !authState.user) {
      toast.error("Please log in to access this page.");
      navigate("/login");
      return;
    }

    if (authState.user.role !== "admin") {
      toast.error("Access denied. You must be an admin to view this page.");
      navigate("/dashboard");
      return;
    }

    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        const usersData = await getAllUsers(authState.token);
        setUsers(usersData);
      } catch (err) {
        const errorMessage =
          err.response?.data?.message || "Failed to fetch users.";
        setError(errorMessage);

        if (
          err.response &&
          (err.response.status === 401 || err.response.status === 403)
        ) {
          console.warn(
            "API call failed due to authentication/authorization, already handled by redirection."
          );
        } else {
          toast.error(errorMessage);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [authState.isLoading, authState.token, authState.user, navigate]);

  if (authState.isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          fontSize: "24px",
        }}
      >
        Loading authentication status...
      </div>
    );
  }
  return (
    <>
      <Header />
      <div className="admin-dashboard-container">
        <h2>Admin Dashboard - All Users</h2>
        {loading && <p className="loading-message">Loading users...</p>}
        {error && <p className="error-message">{error}</p>}

        {!loading && !error && users.length === 0 && (
          <p className="no-users-message">No users found.</p>
        )}

        {!loading && !error && users.length > 0 && (
          <div className="users-table-wrapper">
            <table className="users-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Created At</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id}>
                    <td>{user._id}</td>
                    <td>{user.email}</td>
                    <td>{user.role}</td>
                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
