import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../api/api";
import toast from "react-hot-toast";

const ContextApi = createContext();

export const ContextProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [allUsers, setAllUsers] = useState([]);

  const fetchUser = useCallback(async () => {
    if (!token) {
      setLoading(false);
      // BUG 4 FIX: read from localStorage with consistent lowercase "username" key
      const stored = JSON.parse(localStorage.getItem("user"));
      const user = stored
        ? { ...stored, username: stored.username || stored.userName }
        : { username: "Guest", email: "guest@example.com", roles: [], id: null };
      setCurrentUser(user);
      return;
    }

    try {
      const { data } = await api.get(`/users/user`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // BUG 4 FIX: normalise so currentUser.username (lowercase) always works
      const normalised = {
        ...data,
        id: data.userId || data.id,
        username: data.username || data.userName,  // ← always lowercase "username"
      };

      setCurrentUser(normalised);
      setIsAdmin(data.roles?.includes("ROLE_ADMIN") || false);

      // BUG 4 FIX: store with lowercase "username" key for consistency
      localStorage.setItem("user", JSON.stringify({
        username: normalised.username,
        email: normalised.email,
        roles: data.roles || [],
        id: normalised.id,
        profileImage: normalised.profileImage || null, // ✅ add this line
      }));

    } catch (error) {
      console.error("Error fetching user:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setToken(null);
        toast.error("Session expired. Please log in again.");
      }
      // Fallback to localStorage or Guest
      const stored = JSON.parse(localStorage.getItem("user"));
      const user = stored
        ? { ...stored, username: stored.username || stored.userName }
        : { username: "Guest", email: "guest@example.com", roles: [], id: null };
      setCurrentUser(user);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchAllUsers = useCallback(async () => {
    if (!token) return;

    try {
      const { data } = await api.get(`/users/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAllUsers(data);
    } catch (error) {
      console.error("Error fetching all users:", error);
      if (error.response?.status === 401) {
        toast.error("Session expired. Please log in again.");
      }
    }
  }, [token]);

  // Get user by email from the cached allUsers list
  const getUserByEmail = useCallback((email) => {
    return allUsers.find((user) => user.email === email);
  }, [allUsers]);

  useEffect(() => {
    fetchUser();
    fetchAllUsers();
  }, [fetchUser, fetchAllUsers]);

  return (
    <ContextApi.Provider
      value={{
        token,
        setToken,
        currentUser,
        setCurrentUser,
        setIsAdmin,
        loading,
        isAdmin,
        allUsers,
        fetchAllUsers,
        getUserByEmail,
      }}
    >
      {children}
    </ContextApi.Provider>
  );
};

export const useMyContext = () => {
  const context = useContext(ContextApi);
  if (!context) {
    throw new Error("useMyContext must be used within a ContextProvider");
  }
  return context;
};