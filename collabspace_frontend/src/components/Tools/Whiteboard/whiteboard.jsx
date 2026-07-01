import React, { useRef, useState, useEffect } from "react";
import { Excalidraw as ExcalidrawBase, MainMenu, WelcomeScreen } from "@excalidraw/excalidraw";
import { parseMermaidToExcalidraw } from "@excalidraw/mermaid-to-excalidraw";
import api from "../../../api/api";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";
import { Brain, Loader2, Copy, Clipboard } from "lucide-react";
import ReactMarkdown from "react-markdown";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8081";
const WS_URL = API_URL.replace("http://", "ws://").replace("https://", "wss://");

const Whiteboard = ({ isCollaborative = true }) => {
  const { workspaceId, boardName } = useParams();
  const [initialElements, setInitialElements] = useState(null);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isAILoading, setIsAILoading] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const excalidrawAPIRef = useRef(null);
  const wsRef = useRef(null); // ✅ plain WebSocket ref (replaces stompClientRef)
  const isRemoteUpdate = useRef(false);

  // ── Load board FIRST, then render Excalidraw ─────────────────
  useEffect(() => {
    if (!workspaceId || !boardName) return;
    const loadBoard = async () => {
      setIsLoading(true);
      try {
        const response = await api.get(`/whiteboard/${workspaceId}/${boardName}`);
        const boardData = response.data?.board || { elements: [] };
        const loadedElements = boardData.elements || [];
        console.log("Loaded elements count:", loadedElements.length);
        setInitialElements(loadedElements);
      } catch (error) {
        console.error("Error loading board:", error);
        toast.error("Failed to load whiteboard.");
        setInitialElements([]);
      } finally {
        setIsLoading(false);
      }
    };
    loadBoard();
  }, [workspaceId, boardName]);

  // ── Plain WebSocket setup (replaces STOMP/SockJS) ────────────
  useEffect(() => {
    if (!workspaceId || !isCollaborative) return;
    console.log("🔵 WS useEffect RUNNING — workspaceId:", workspaceId, "isCollaborative:", isCollaborative);

    const token = localStorage.getItem("token");
    const ws = new WebSocket(`${WS_URL}/ws/workspace/${workspaceId}?token=${token}`);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("Whiteboard WebSocket connected:", workspaceId);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "WHITEBOARD_UPDATE" && excalidrawAPIRef.current) {
          isRemoteUpdate.current = true;
          excalidrawAPIRef.current.updateScene({ elements: data.elements });
        }
      } catch (err) {
        console.error("Failed to parse whiteboard message:", err);
      }
    };

    ws.onerror = (error) => {
      console.error("Whiteboard WebSocket error:", error);
    };

    ws.onclose = () => {
      console.log("Whiteboard WebSocket disconnected");
    };

    return () => {
      console.log("🔴 WS useEffect CLEANUP — closing connection for workspaceId:", workspaceId);
      ws.close();
      wsRef.current = null;
    };
  }, [workspaceId, isCollaborative]);

  // ── Ctrl+S to save ────────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        e.stopPropagation();
        saveBoard();
      }
    };
    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [isSaving]);

  const handleChange = (newElements) => {
    if (isRemoteUpdate.current) {
      isRemoteUpdate.current = false;
      return;
    }
    // ✅ plain WebSocket send (replaces stompClient.send)
    if (isCollaborative && wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({ type: "WHITEBOARD_UPDATE", workspaceId, elements: newElements })
      );
    }
  };

  // ── Save board ────────────────────────────────────────────────
  const saveBoard = async () => {
    if (isSaving) return;

    let currentElements = [];
    if (excalidrawAPIRef.current) {
      currentElements = excalidrawAPIRef.current.getSceneElements() || [];
    }

    if (!workspaceId || !boardName) {
      toast.error("Missing workspace or board info.");
      return;
    }

    setIsSaving(true);
    try {
      const payload = { workspaceId, boardName, elements: currentElements };
      await api.post("/whiteboard/save", payload);
      toast.success("Whiteboard saved successfully!");

      // ✅ plain WebSocket send (replaces stompClient.send)
      if (isCollaborative && wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({ type: "WHITEBOARD_UPDATE", workspaceId, elements: currentElements })
        );
      }
    } catch (error) {
      console.error("Save error:", error.response?.data || error.message);
      toast.error(`Failed to save: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // ── AI diagram ────────────────────────────────────────────────
  const renderDiagramOnCanvas = async () => {
    const mermaidMatch = aiResponse.match(/```mermaid\n([\s\S]*?)\n```/);
    if (!mermaidMatch?.[1]) {
      toast.error("No Mermaid diagram found to render.");
      return;
    }
    try {
      const { elements: diagramElements } = await parseMermaidToExcalidraw(mermaidMatch[1]);
      if (excalidrawAPIRef.current) {
        excalidrawAPIRef.current.updateScene({ elements: diagramElements });
      }
      toast.success("Diagram rendered on whiteboard!");
      setIsAIModalOpen(false);
    } catch (err) {
      console.error("Render error:", err);
      toast.error("Failed to render diagram: " + err.message);
    }
  };

  const generateAIDiagram = async () => {
    if (!aiPrompt.trim()) {
      toast.error("Please enter a prompt.");
      return;
    }
    setIsAILoading(true);
    try {
      const response = await api.post("/ai/generate-diagram", { prompt: aiPrompt });
      const content = response.data.content;
      setAiResponse(content);
      if (!content.match(/```mermaid\n([\s\S]*?)\n```/)) {
        toast.error("No Mermaid diagram found in the AI response.");
      }
    } catch (error) {
      console.error("[AI Error]:", error);
      const errMsg = error.response?.data?.content || error.message;
      setAiResponse(`Failed to generate diagram: ${errMsg}`);
      toast.error("Failed to generate diagram.");
    } finally {
      setIsAILoading(false);
    }
  };

  const copyDiagram = () => {
    const mermaidMatch = aiResponse.match(/```mermaid\n([\s\S]*?)\n```/);
    if (mermaidMatch?.[1]) {
      navigator.clipboard.writeText(mermaidMatch[1]);
      toast.success("Mermaid code copied!");
    } else {
      toast.error("No Mermaid code found to copy.");
    }
  };

  const copyAll = () => {
    navigator.clipboard.writeText(aiResponse);
    toast.success("Full response copied!");
  };

  const renderAIResponse = () => {
    if (!aiResponse) return null;
    const mermaidMatch = aiResponse.match(/```mermaid\n([\s\S]*?)\n```/);
    const explanation = mermaidMatch
      ? aiResponse.split(mermaidMatch[0])[0].trim()
      : aiResponse;
    const mermaidCode = mermaidMatch?.[1] || "";
    return (
      <>
        {explanation && (
          <div className="prose max-w-none text-gray-900">
            <ReactMarkdown>{explanation}</ReactMarkdown>
          </div>
        )}
        {mermaidCode && (
          <div className="mt-4">
            <p className="text-sm text-gray-500 mb-1">Mermaid diagram code:</p>
            <pre className="bg-black text-white p-4 rounded-lg overflow-x-auto text-sm">
              <code>{mermaidCode}</code>
            </pre>
          </div>
        )}
      </>
    );
  };

  // ── Show loading until elements fetched from DB ───────────────
  if (isLoading || initialElements === null) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={36} className="animate-spin text-blue-600" />
          <p className="text-gray-500 text-sm">Loading whiteboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-900 flex flex-col">

      {/* ── Top bar ── */}
      <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-gray-200 z-10 shadow-sm">
        <span className="font-semibold text-gray-700 text-lg">
          {boardName || "Whiteboard"}
        </span>
        <div className="flex gap-2 items-center">
          <span className="text-xs text-gray-400 mr-1 hidden sm:block">Ctrl+S to save</span>
          <button
            onClick={() => { setAiResponse(""); setIsAIModalOpen(true); }}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-1.5 rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors"
          >
            <Brain size={15} /> AI Diagram
          </button>
          <button
            onClick={saveBoard}
            disabled={isSaving}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-1.5 rounded-lg hover:bg-green-700 disabled:opacity-60 text-sm font-medium transition-colors"
          >
            {isSaving
              ? <><Loader2 size={15} className="animate-spin" /> Saving...</>
              : <>💾 Save</>
            }
          </button>
        </div>
      </div>

      {/* ── Canvas — renders ONLY after elements loaded from DB ── */}
      <div className="flex-1">
        <ExcalidrawBase
          excalidrawAPI={(api) => { excalidrawAPIRef.current = api; }}
          initialData={{
            elements: initialElements,
            appState: {
              viewBackgroundColor: "#ffffff",
              currentItemFontFamily: 2,
              currentItemStrokeWidth: 1,
              currentItemRoughness: 0,
              currentItemOpacity: 100,
              currentItemStrokeColor: "#1e1e2e",
              currentItemBackgroundColor: "#e8f4fd",
              currentItemFillStyle: "solid",
              currentItemRoundness: "round",
              gridSize: null,
            },
          }}
          onChange={handleChange}
          UIOptions={{ canvasActions: { loadScene: false } }}
        >
          <MainMenu>
            <MainMenu.Item onSelect={saveBoard}>💾 Save Whiteboard</MainMenu.Item>
            <MainMenu.Item onSelect={() => { setAiResponse(""); setIsAIModalOpen(true); }}>
              🧠 Generate AI Diagram
            </MainMenu.Item>
          </MainMenu>
          {!boardName && <WelcomeScreen />}
        </ExcalidrawBase>
      </div>

      {/* ── AI Modal ── */}
      {isAIModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white text-gray-900 p-6 rounded-lg shadow-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <Brain size={24} className="text-blue-600" /> AI Diagram Generator
              </h3>
              <button onClick={() => setIsAIModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Prompt</label>
              <input
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !isAILoading && generateAIDiagram()}
                className="w-full bg-gray-100 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Create a flowchart for user login"
                disabled={isAILoading}
              />
            </div>

            <button
              onClick={generateAIDiagram}
              disabled={isAILoading || !aiPrompt.trim()}
              className="w-full mb-4 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isAILoading ? "Generating..." : "Generate Diagram"}
            </button>

            {!isAILoading && aiResponse && (
              <div className="flex gap-2 flex-wrap mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <button
                  onClick={renderDiagramOnCanvas}
                  className="flex items-center gap-2 text-white bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700 transition-all font-medium"
                >
                  <Brain size={16} /> Render on Whiteboard
                </button>
                <button
                  onClick={copyDiagram}
                  className="flex items-center gap-2 text-gray-700 bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300 transition-all"
                >
                  <Copy size={16} /> Copy Mermaid Code
                </button>
                <button
                  onClick={copyAll}
                  className="flex items-center gap-2 text-gray-700 bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300 transition-all"
                >
                  <Clipboard size={16} /> Copy All
                </button>
              </div>
            )}

            {isAILoading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 size={32} className="animate-spin text-blue-600" />
                <span className="ml-2 text-gray-600 text-lg">Generating...</span>
              </div>
            )}

            {!isAILoading && renderAIResponse()}
          </div>
        </div>
      )}
    </div>
  );
};

export default Whiteboard;