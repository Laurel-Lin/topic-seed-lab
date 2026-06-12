import { SYSTEM_PROMPT } from "@/lib/prompts";

interface DeepSeekMessage {
  role: "system" | "user";
  content: string;
}

export async function callDeepSeekJson<T>(userPrompt: string): Promise<T> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    throw new Error("DEEPSEEK_API_KEY is not configured");
  }

  const baseUrl = process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com";
  const model = process.env.DEEPSEEK_MODEL || "deepseek-chat";
  const messages: DeepSeekMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: userPrompt }
  ];

  const response = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.2,
      response_format: { type: "json_object" }
    })
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`DeepSeek request failed: ${response.status} ${body}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== "string") {
    throw new Error("DeepSeek returned an empty response");
  }

  try {
    return JSON.parse(content) as T;
  } catch {
    throw new Error("DeepSeek returned non-JSON content");
  }
}
