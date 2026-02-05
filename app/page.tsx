"use client";

import { useState } from "react";

export default function Page() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  async function run() {
    setLoading(true);
    setOutput("");

    try {
      const res = await fetch("/api/deepseek", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: input }),
      });

      if (!res.ok) {
        const errText = await res.text();
        setOutput(`Error:\n${errText}`);
        return;
      }

      const text = await res.text();
      setOutput(text);
    } catch (e: any) {
      setOutput(`Client error: ${e?.message ?? String(e)}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 800, margin: "40px auto", padding: 16 }}>
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Enter text…"
        rows={10}
        style={{
          width: "100%",
          padding: 12,
          border: "1px solid #ccc",
          borderRadius: 8,
          fontFamily:
            "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
        }}
      />

      <button
        onClick={run}
        disabled={loading || !input.trim()}
        style={{
          marginTop: 12,
          padding: "8px 14px",
          borderRadius: 8,
          border: "1px solid #333",
          cursor: loading ? "not-allowed" : "pointer",
          fontWeight: 600,
        }}
      >
        {loading ? "Running…" : "Run"}
      </button>

      <pre
        style={{
          marginTop: 20,
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          padding: 12,
          border: "1px solid #ddd",
          borderRadius: 8,
          minHeight: 120,
          fontFamily:
            "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
        }}
      >
        {output}
      </pre>
    </main>
  );
}
