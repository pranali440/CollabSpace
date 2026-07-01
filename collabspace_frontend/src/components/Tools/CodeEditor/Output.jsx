import React, { useState } from "react";
import { Play, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

const Output = ({ executeCode }) => {
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const runCode = async () => {
    setLoading(true);
    setError("");
    setOutput("");
    try {
      const result = await executeCode();
      
      if (!result) {
        setError("No output received.");
        return;
      }

      const cleanResult = result
        .replace(/```[a-zA-Z]*\n?/g, "")
        .replace(/```/g, "")
        .trim();

      setError("");
      setOutput(cleanResult);
      toast.success("Code executed successfully!");
    } catch (err) {
      console.error("Run code error:", err);
      setError("Error executing code.");
      toast.error("Failed to execute code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col bg-gray-900" style={{ height: "250px", borderTop: "2px solid #3b82f6" }}>
      
      {/* ✅ VS Code style top bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Output</span>
          {output && (
            <span className="text-xs bg-green-700 text-white px-2 py-0.5 rounded-full">
              Done
            </span>
          )}
          {error && (
            <span className="text-xs bg-red-700 text-white px-2 py-0.5 rounded-full">
              Error
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* ✅ Clear button */}
          {(output || error) && (
            <button
              onClick={() => { setOutput(""); setError(""); }}
              className="text-xs text-gray-400 hover:text-white px-2 py-1 rounded hover:bg-gray-700"
            >
              Clear
            </button>
          )}
          {/* ✅ Run button */}
          <button
            onClick={runCode}
            disabled={loading}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded text-sm transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
            {loading ? "Running..." : "Run Code"}
          </button>
        </div>
      </div>

      {/* ✅ VS Code style output area */}
      <div className="flex-1 overflow-y-auto font-mono text-sm bg-gray-900 p-4"
        style={{ scrollbarWidth: "thin", scrollbarColor: "#4b5563 #1f2937" }}
      >
        {loading ? (
          <div className="flex items-center gap-2 text-gray-400">
            <Loader2 size={16} className="animate-spin" />
            <span>Executing code...</span>
          </div>
        ) : error ? (
          <div>
            <span className="text-red-400 font-bold">Error: </span>
            <pre className="text-red-300 whitespace-pre-wrap mt-1">{error}</pre>
          </div>
        ) : output ? (
          <div>
            <span className="text-gray-500 text-xs">// Output</span>
            <pre className="text-green-400 whitespace-pre-wrap mt-1">{output}</pre>
          </div>
        ) : (
          <div className="text-gray-500 text-sm">
            <span>▶ Click </span>
            <span className="text-green-400 font-semibold">Run Code</span>
            <span> to execute and see output here.</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Output;