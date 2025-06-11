import React, { useState } from "react";
import { registerUser } from "../api/auth";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "../styles/RegisterPage.css";
import Header from "../components/Header/Header";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (!emailRegex.test(email)) {
      const validationMessage = "Please enter a valid email address.";
      setError(validationMessage);
      toast.error(validationMessage, {
        position: "top-right",
        autoClose: 5000,
      });
      return;
    }

    setIsLoading(true);

    try {
      await registerUser(email, password);

      toast.success("Registration successful! Please log in.", {
        position: "top-right",
        autoClose: 3000,
      });

      setTimeout(() => {
        navigate("/login");
      }, 3500);
    } catch (err) {
      const errMsg = err.response?.data?.message || "Registration failed";
      setError(errMsg);
      toast.error(errMsg, {
        position: "top-right",
        autoClose: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="register-container">
        <form className="register-form" onSubmit={handleRegister}>
          <h2>Create Account</h2>
          <input
            type="email"
            placeholder="Email"
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            required
            onChange={(e) => setPassword(e.target.value)}
          />

          {isLoading ? (
            <div className="spinner"></div>
          ) : (
            <button type="submit">Register</button>
          )}

          <div style={{ margin: "0.5rem auto" }}>
            Did you already have an account? <a href="/login">Login</a>
          </div>

          {error && <p className="error">{error}</p>}
        </form>
      </div>
    </>
  );
}
