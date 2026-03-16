import { storyQuestions } from "@/data/storyQuestions";

const FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-story`;
const IMAGES_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-story-images`;

/** Resolve option IDs to human-readable labels */
function resolveAnswers(answers: Record<string, string>): Record<string, string> {
  const resolved: Record<string, string> = {};
  for (const q of storyQuestions) {
    const raw = answers[q.id];
    if (!raw) continue;
    if (q.type === "text") {
      resolved[q.id] = raw;
    } else {
      const opt = q.options?.find((o) => o.id === raw);
      resolved[q.id] = opt?.label || raw;
    }
  }
  return resolved;
}

export async function fetchStoryImages(
  answers: Record<string, string>
): Promise<{ heroImage: string | null; settingImage: string | null }> {
  const resolved = resolveAnswers(answers);
  try {
    const resp = await fetch(IMAGES_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ answers: resolved }),
    });
    if (!resp.ok) return { heroImage: null, settingImage: null };
    return await resp.json();
  } catch {
    return { heroImage: null, settingImage: null };
  }
}

export async function streamStory({
  answers,
  onDelta,
  onDone,
  onError,
}: {
  answers: Record<string, string>;
  onDelta: (text: string) => void;
  onDone: () => void;
  onError: (msg: string) => void;
}) {
  const resolved = resolveAnswers(answers);

  const resp = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({ answers: resolved }),
  });

  if (!resp.ok) {
    const data = await resp.json().catch(() => ({}));
    onError(data.error || "Failed to generate story. Please try again.");
    return;
  }

  if (!resp.body) {
    onError("No response body received.");
    return;
  }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let streamDone = false;

  while (!streamDone) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let newlineIndex: number;
    while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
      let line = buffer.slice(0, newlineIndex);
      buffer = buffer.slice(newlineIndex + 1);

      if (line.endsWith("\r")) line = line.slice(0, -1);
      if (line.startsWith(":") || line.trim() === "") continue;
      if (!line.startsWith("data: ")) continue;

      const jsonStr = line.slice(6).trim();
      if (jsonStr === "[DONE]") {
        streamDone = true;
        break;
      }

      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content as string | undefined;
        if (content) onDelta(content);
      } catch {
        buffer = line + "\n" + buffer;
        break;
      }
    }
  }

  // Flush remaining
  if (buffer.trim()) {
    for (let raw of buffer.split("\n")) {
      if (!raw) continue;
      if (raw.endsWith("\r")) raw = raw.slice(0, -1);
      if (raw.startsWith(":") || raw.trim() === "") continue;
      if (!raw.startsWith("data: ")) continue;
      const jsonStr = raw.slice(6).trim();
      if (jsonStr === "[DONE]") continue;
      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content as string | undefined;
        if (content) onDelta(content);
      } catch { /* ignore */ }
    }
  }

  onDone();
}
