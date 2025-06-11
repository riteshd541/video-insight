import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

import "./Header.css";

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const navigate = useNavigate();

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Error parsing user data from localStorage:", error);
        localStorage.clear();
        setUser(null);
      }
    }

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    navigate("/");
  };

  const toggleDropdown = () => {
    setShowDropdown((prev) => !prev);
  };

  return (
    <div>
      <header className="dashboard-header">
        <div className="header-left">
          <h1>AI Summary Generator</h1>
        </div>
        <div className="header-right" ref={dropdownRef}>
          {user ? (
            <div className="user-profile">
              <div className="user-info-button-container">
                {user.role === "admin" && (
                  <button
                    className="admin-button"
                    onClick={() => navigate("/admin")}
                  >
                    {" "}
                    All Users
                  </button>
                )}
                <button onClick={toggleDropdown} className="avatar-button">
                  <i className="fas fa-user-circle avatar-icon"></i>{" "}
                </button>
              </div>
              {showDropdown && (
                <div className="dropdown-menu">
                  <p>
                    <strong>Email:</strong> {user.email}
                  </p>
                  <p>
                    <strong>Role:</strong> {user.role}
                  </p>
                  <button onClick={handleLogout} className="logout-button">
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : // <p>Not logged in</p>
          null}
        </div>
      </header>
    </div>
  );
}
