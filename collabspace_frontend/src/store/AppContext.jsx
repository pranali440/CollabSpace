import React, { createContext, useEffect, useState } from "react";
import api from "../api/api";
import { useMyContext } from "./ContextApi";
import toast from "react-hot-toast";

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const { token, currentUser, loading } = useMyContext();
  const [workspaces, setWorkspaces] = useState([]);
  const [activeWorkspace, setActiveWorkspace] = useState(null);
  const [sessions, setSessions] = useState([]);

  // Fetch all workspaces for the current user
  useEffect(() => {
    const fetchWorkspaces = async () => {
      if (loading || !currentUser?.id) {
        return;
      }
      try {
        // BUG 6 FIX: use /workspace/user/ (no /api/ prefix) — consistent with
        // WorkspaceController's actual mapping and with UserProfile.jsx
        const response = await api.get(`/workspace/user/${currentUser.id}`);
        setWorkspaces(response.data);
      } catch (error) {
        console.error("Error fetching workspaces:", error);
        toast.error("Failed to load workspaces.");
      }
    };
    fetchWorkspaces();
  }, [loading, currentUser]);

  // Fetch sessions for the active workspace
  useEffect(() => {
    const fetchSessions = async () => {
      const id =
        activeWorkspace?.workspaceId ||
        activeWorkspace?.id ||
        activeWorkspace?._id;

      if (!id) return;

      try {
        const response = await api.get(`/session/${id}`);
        setSessions(response.data);
      } catch (error) {
        console.error("Error fetching sessions:", error);
      }
    };
    fetchSessions();
  }, [activeWorkspace]);

  return (
    <AppContext.Provider
      value={{
        workspaces,
        activeWorkspace,
        setActiveWorkspace,
        sessions,
        setSessions,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};