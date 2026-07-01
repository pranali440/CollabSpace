import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Brain, ThumbsUp, Trash2, PlusCircle, Loader2 } from "lucide-react";
import api from "../../../api/api";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { useMyContext } from "../../../store/ContextApi";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, MenuItem, Select, FormControl, InputLabel
} from "@mui/material";

const YourIdeas = () => {
  const { currentUser } = useMyContext();
  const [ideas, setIdeas] = useState([]);
  const [workspaces, setWorkspaces] = useState([]); // all workspaces user is part of
  const [loading, setLoading] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const [newIdea, setNewIdea] = useState({ title: "", description: "", workspaceId: "" });

  // ── 1. Fetch all workspaces the user belongs to ──────────────────
  useEffect(() => {
    if (!currentUser?.id) return;

    const fetchAll = async () => {
      setLoading(true);
      try {
        // Get all workspaces owned or participated by user
        const [ownedRes, joinedRes] = await Promise.all([
          api.get(`/workspace/user/${currentUser.id}`),
          api.get(`/workspace/user/${currentUser.id}/all`),
        ]);

        // Merge and deduplicate
        const merged = [
          ...(ownedRes.data || []),
          ...(joinedRes.data || []),
        ];
        const unique = Array.from(
          new Map(merged.map((w) => [w.workspaceId, w])).values()
        );
        // Only team/group workspaces have ideas
        const collaborative = unique.filter(
          (w) => w.type === "team" || w.type === "group"
        );
        setWorkspaces(collaborative);

        // ── 2. Fetch ideas from every workspace in parallel ──────────
        const ideaResults = await Promise.allSettled(
          collaborative.map((w) =>
            api.get(`/api/workspace/${w.workspaceId}/ideas`)
          )
        );

        const allIdeas = [];
        ideaResults.forEach((result, index) => {
          if (result.status === "fulfilled") {
            const ws = collaborative[index];
            result.value.data.forEach((idea) => {
              allIdeas.push({ ...idea, workspaceName: ws.workspaceName });
            });
          }
        });

        // Show only ideas created by the current user
        const myIdeas = allIdeas.filter(
          (idea) => idea.createdBy === currentUser.username
        );
        setIdeas(myIdeas);
      } catch (err) {
        console.error("Error loading ideas:", err);
        toast.error("Failed to load your ideas.");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [currentUser?.id]);

  // ── Create idea ───────────────────────────────────────────────────
  const handleCreate = async () => {
    if (!newIdea.title.trim() || !newIdea.description.trim()) {
      toast.error("Title and description are required.");
      return;
    }
    if (!newIdea.workspaceId) {
      toast.error("Please select a workspace.");
      return;
    }
    try {
      const payload = {
        ...newIdea,
        createdBy: currentUser.username,
        createdAt: new Date().toISOString(),
        votes: 0,
        voters: [],
      };
      const response = await api.post(
        `/api/workspace/${newIdea.workspaceId}/ideas`,
        payload
      );
      const ws = workspaces.find((w) => w.workspaceId === newIdea.workspaceId);
      setIdeas((prev) => [
        ...prev,
        { ...response.data, workspaceName: ws?.workspaceName || "" },
      ]);
      setNewIdea({ title: "", description: "", workspaceId: "" });
      setShowPopup(false);
      toast.success("Idea created!");
    } catch (err) {
      console.error("Error creating idea:", err);
      toast.error("Failed to create idea.");
    }
  };

  // ── Vote idea ─────────────────────────────────────────────────────
  const handleVote = async (idea) => {
    try {
      const response = await api.patch(
        `/api/workspace/${idea.workspaceId}/ideas/${idea.id}/vote`,
        JSON.stringify(currentUser.id),
        { headers: { "Content-Type": "application/json" } }
      );
      setIdeas((prev) =>
        prev.map((i) =>
          i.id === idea.id
            ? { ...response.data, workspaceName: i.workspaceName }
            : i
        )
      );
    } catch (err) {
      console.error("Error voting:", err);
      toast.error("Failed to vote.");
    }
  };

  // ── Delete idea ───────────────────────────────────────────────────
  const handleDelete = async (idea) => {
    try {
      await api.delete(`/api/workspace/${idea.workspaceId}/ideas/${idea.id}`);
      setIdeas((prev) => prev.filter((i) => i.id !== idea.id));
      toast.success("Idea deleted!");
    } catch (err) {
      console.error("Error deleting idea:", err);
      toast.error("Failed to delete idea.");
    }
  };

  // ── Render ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-indigo-600" size={36} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          Your Ideas
        </h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowPopup(true)}
          disabled={workspaces.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
        >
          <PlusCircle size={16} /> New Idea
        </motion.button>
      </div>

      {workspaces.length === 0 && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          You need to be part of a team or group workspace to post ideas.
        </p>
      )}

      {/* Ideas Grid */}
      {ideas.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl shadow">
          <Brain className="mx-auto h-12 w-12 text-gray-300" />
          <h3 className="mt-3 text-gray-500 dark:text-gray-400 font-medium">
           {"You haven't posted any ideas yet"}
          </h3>
          <p className="text-sm text-gray-400 mt-1">
          {"Click 'New Idea' to share your first idea with a workspace."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ideas.map((idea) => (
            <motion.div
              key={idea.id}
              whileHover={{ scale: 1.02 }}
              className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-md border border-gray-100 dark:border-gray-700"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <h4 className="text-base font-semibold text-indigo-600 dark:text-indigo-400 truncate">
                    {idea.title}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-3">
                    {idea.description}
                  </p>
                  <span className="inline-block mt-2 text-xs bg-indigo-50 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 px-2 py-0.5 rounded-full">
                    {idea.workspaceName}
                  </span>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                    {idea.createdAt
                      ? format(new Date(idea.createdAt), "dd/MM/yyyy hh:mm a")
                      : ""}
                  </p>
                  <button
                    onClick={() => handleVote(idea)}
                    className={`mt-3 flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      idea.voters?.includes(currentUser.id)
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-indigo-100"
                    }`}
                  >
                    <ThumbsUp size={13} />
                    {idea.votes} {idea.votes === 1 ? "Vote" : "Votes"}
                  </button>
                </div>
                <button
                  onClick={() => handleDelete(idea)}
                  className="ml-3 text-red-400 hover:text-red-600 transition-colors flex-shrink-0"
                  title="Delete idea"
                >
                  <Trash2 size={17} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Idea Dialog */}
      <Dialog
        open={showPopup}
        onClose={() => setShowPopup(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>New Idea</DialogTitle>
        <DialogContent>
          <div className="space-y-4 mt-2">
            <FormControl fullWidth>
              <InputLabel>Workspace</InputLabel>
              <Select
                value={newIdea.workspaceId}
                label="Workspace"
                onChange={(e) =>
                  setNewIdea({ ...newIdea, workspaceId: e.target.value })
                }
              >
                {workspaces.map((ws) => (
                  <MenuItem key={ws.workspaceId} value={ws.workspaceId}>
                    {ws.workspaceName} ({ws.type})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Title"
              value={newIdea.title}
              onChange={(e) =>
                setNewIdea({ ...newIdea, title: e.target.value })
              }
              fullWidth
              variant="outlined"
              required
            />
            <TextField
              label="Description"
              value={newIdea.description}
              onChange={(e) =>
                setNewIdea({ ...newIdea, description: e.target.value })
              }
              fullWidth
              variant="outlined"
              multiline
              rows={4}
              required
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPopup(false)}>Cancel</Button>
          <Button
            onClick={handleCreate}
            variant="contained"
            disabled={!newIdea.title || !newIdea.description || !newIdea.workspaceId}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default YourIdeas;