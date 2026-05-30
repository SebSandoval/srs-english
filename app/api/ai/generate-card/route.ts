import { NextRequest, NextResponse } from "next/server";

const OPENROUTER_MODEL = "nvidia/nemotron-3-super-120b-a12b:free";

export async function POST(req: NextRequest) {
  const { word } = await req.json();
  if (!word?.trim())
    return NextResponse.json({ error: "No word provided" }, { status: 400 });

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey)
    return NextResponse.json(
      { error: "OPENROUTER_API_KEY not configured" },
      { status: 500 },
    );

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: OPENROUTER_MODEL,
      messages: [
        {
          role: "system",
          content:
            'You are an English language assistant for a flashcard app. Given a word, idiom, or phrasal verb, respond ONLY with a JSON object (no markdown, no extra text) containing:\n- "definition": a clear, concise definition in English\n- "example": one natural example sentence using the word/phrase\n- "category": exactly one of "word", "idiom", "phrasal_verb", or "other"',
        },
        {
          role: "user",
          content: `"${word.trim()}"`,
        },
      ],
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error("OpenRouter error:", res.status, body);
    return NextResponse.json({ error: "AI request failed" }, { status: 502 });
  }

  const data = await res.json();
  const content: string = data.choices?.[0]?.message?.content ?? "";

  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : content);

    const VALID_CATEGORIES = ["word", "idiom", "phrasal_verb", "other"];
    return NextResponse.json({
      definition: String(parsed.definition ?? "").trim(),
      example: String(parsed.example ?? "").trim(),
      category: VALID_CATEGORIES.includes(parsed.category)
        ? parsed.category
        : "word",
    });
  } catch {
    console.error("Failed to parse AI response:", content);
    return NextResponse.json(
      { error: "Could not parse AI response" },
      { status: 500 },
    );
  }
}
