import React, { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    user: null,
    token: null,
    isLoading: true,
  });

  useEffect(() => {
    const loadAuthData = () => {
      try {
        const storedToken = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");

        if (storedToken && storedUser) {
          setAuthState({
            token: storedToken,
            user: JSON.parse(storedUser),
            isLoading: false,
          });
        } else {
          setAuthState((prevState) => ({
            ...prevState,
            isLoading: false,
          }));
        }
      } catch (error) {
        console.error("Failed to parse user from localStorage:", error);
        localStorage.clear();
        setAuthState((prevState) => ({
          ...prevState,
          isLoading: false,
        }));
      }
    };
    loadAuthData();
  }, []);

  const login = (userData, jwt) => {
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", jwt);

    setAuthState({ user: userData, token: jwt, isLoading: false });
  };

  const logout = () => {
    localStorage.clear();

    setAuthState({ user: null, token: null, isLoading: false });
  };

  return (
    <AuthContext.Provider value={{ authState, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
