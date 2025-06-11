import React, { useState, useContext, useEffect } from "react";
import { loginUser } from "../api/auth";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "../styles/LoginPage.css";
import Header from "../components/Header/Header";

export default function LoginPage() {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Login | Video Insight";
    if (localStorage.getItem("token") && localStorage.getItem("user")) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await loginUser(email, password);
      login(res.data.user, res.data.token);

      toast.success("Login successful! Redirected to dashboard...", {
        position: "top-right",
        autoClose: 2000,
      });

      setTimeout(() => {
        navigate("/dashboard");
      }, 500);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        "Login failed. Please check your credentials.";
      setError(errorMessage);
      toast.error(errorMessage, {
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
      <div className="login-container">
        <form className="login-form" onSubmit={handleLogin}>
          <h2>Login</h2>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
          />

          {isLoading ? (
            <div className="spinner"></div>
          ) : (
            <button type="submit">Login</button>
          )}

          <div style={{ margin: "0.5rem auto" }}>
            Don't have an account?{" "}
            <a href="/register" className="register-link">
              Register
            </a>
          </div>
          {error && <p className="error">{error}</p>}
        </form>
      </div>
    </>
  );
}
