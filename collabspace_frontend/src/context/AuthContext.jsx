import React, { useState, useEffect } from "react";

const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    user: null,
    token: null,
    role: null,
  });

  // ✅ LOAD TOKEN FROM LOCALSTORAGE ON START
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      setAuth((prev) => ({
        ...prev,
        token: token,
      }));
    }
  }, []);

  const login = (userData) => {
    // ✅ store token in localStorage
    localStorage.setItem("token", userData.token);

    setAuth(userData);
  };

  const logout = () => {
    localStorage.removeItem("token");

    setAuth({
      user: null,
      token: null,
      role: null,
    });
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};