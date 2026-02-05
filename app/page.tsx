// app/page.tsx
"use client";

import { useMemo, useState } from "react";

export default function Page() {
  const [text, setText] = useState("");
  const [model, setModel] = useState("deepseek-chat");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>("");

  const canSubmit = useMemo(() => text.trim().length > 0 && !loading, [text, loading]);

  async function onSubmit() {
    setLoading(true);
    setResult("");

    try {
      const res = await fetch("/api/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, model }),
      });

      const data = await res.json();

      if (!res.ok) {
        setResult(JSON.stringify(data, null, 2));
        return;
      }

      // content is the model's message.content (string). raw is the full DeepSeek response.
      setResult(
        typeof data.content === "string"
          ? data.content
          : JSON.stringify(data, null, 2)
      );
    } catch (e: any) {
      setResult(`Client error: ${e?.message ?? String(e)}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 900, margin: "40px auto", padding: 16 }}>
      <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 12 }}>
        DeepSeek Control Call (Template)
      </h1>

      <label style={{ display: "block", marginBottom: 8, fontSize: 14 }}>
        Model
      </label>
      <input
        value={model}
        onChange={(e) => setModel(e.target.value)}
        placeholder="deepseek-chat"
        style={{
          width: "100%",
          padding: 10,
          border: "1px solid #ccc",
          borderRadius: 8,
          marginBottom: 16,
        }}
      />

      <label style={{ display: "block", marginBottom: 8, fontSize: 14 }}>
        Text to score
      </label>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={10}
        placeholder="Paste text here..."
        style={{
          width: "100%",
          padding: 12,
          border: "1px solid #ccc",
          borderRadius: 8,
          marginBottom: 12,
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
        }}
      />

      <button
        onClick={onSubmit}
        disabled={!canSubmit}
        style={{
          padding: "10px 14px",
          borderRadius: 10,
          border: "1px solid #333",
          cursor: canSubmit ? "pointer" : "not-allowed",
          fontWeight: 600,
        }}
      >
        {loading ? "Calling DeepSeek..." : "Run"}
      </button>

      <h2 style={{ fontSize: 16, marginTop: 20, marginBottom: 8 }}>Result</h2>
      <pre
        style={{
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          padding: 12,
          border: "1px solid #ddd",
          borderRadius: 10,
          minHeight: 120,
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
        }}
      >
        {result}
      </pre>
    </main>
  );
}
