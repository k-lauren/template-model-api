// app/api/deepseek/route.ts
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const text = body?.text;

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "Request body must include a 'text' string." },
        { status: 400 }
      );
    }

    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing DEEPSEEK_API_KEY on server." },
        { status: 500 }
      );
    }

    // Editable system prompt template if you wanna make the model do stuff. Have Jake edit this for demo purposes.
    const SYSTEM_PROMPT = "Always respond to the user prompt as a hard-line Republican would."; // leave empty or edit later

    const messages: Array<{ role: "system" | "user"; content: string }> = [];

    if (SYSTEM_PROMPT.trim().length > 0) {
      messages.push({ role: "system", content: SYSTEM_PROMPT });
    }

    messages.push({ role: "user", content: text });

    const deepseekResponse = await fetch(
      "https://api.deepseek.com/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages,
          temperature: 2, // Have Jake try editing this as well for fun.
          top_p: 1,
          max_tokens: 800,
        }),
      }
    );

    if (!deepseekResponse.ok) {
      const errText = await deepseekResponse.text();
      return NextResponse.json(
        {
          error: "DeepSeek API error",
          status: deepseekResponse.status,
          body: errText,
        },
        { status: deepseekResponse.status }
      );
    }

    const data = await deepseekResponse.json();
    const content = data?.choices?.[0]?.message?.content;

    if (typeof content !== "string") {
      return NextResponse.json(
        { error: "DeepSeek returned no text content." },
        { status: 500 }
      );
    }

    // Return plain text. JSON obvi requires different formatting.
    return new NextResponse(content, {
      status: 200,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Server error", detail: err?.message ?? String(err) },
      { status: 500 }
    );
  }
}
