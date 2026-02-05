// app/api/score/route.ts
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type ScoreRequest = {
  text: string;
  model?: string;
};

export async function POST(req: Request) {
  try {
    const { text, model }: ScoreRequest = await req.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid 'text' in request body." },
        { status: 400 }
      );
    }

    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Server missing DEEPSEEK_API_KEY env var." },
        { status: 500 }
      );
    }

    // Template: editable system prompt. INCLUDED as a message, but NOT appended to user text.
    // Keep it empty for now if you want, but do NOT concatenate it into `text`.
    const SYSTEM_PROMPT = ""; // <-- edit later

    const messages: Array<{ role: "system" | "user"; content: string }> = [];

    // Include the system prompt only if non-empty.
    // (This avoids sending an empty system prompt but preserves the template structure.)
    if (SYSTEM_PROMPT.trim().length > 0) {
      messages.push({ role: "system", content: SYSTEM_PROMPT });
    }

    messages.push({ role: "user", content: text });

    const deepseekRes = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: model ?? "deepseek-chat",
        messages,
        // For strict JSON purposes, uncomment the following and make an input:
        // response_format: { type: "json_object" },
        temperature: 0,
        top_p: 1,
        max_tokens: 600,
      }),
    });

    const raw = await deepseekRes.text();

    if (!deepseekRes.ok) {
      // Return error if system we're calling throws up an error.
      return NextResponse.json(
        { error: "DeepSeek API error", status: deepseekRes.status, body: raw },
        { status: deepseekRes.status }
      );
    }

    // DeepSeek returns JSON; parse safely
    const data = JSON.parse(raw);
    const content = data?.choices?.[0]?.message?.content;

    // Return model content directly (string) and full payload for debugging 
    return NextResponse.json({ content, raw: data });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Server error", detail: err?.message ?? String(err) },
      { status: 500 }
    );
  }
}
