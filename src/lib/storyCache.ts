import { supabase } from "@/integrations/supabase/client";

/** Create a deterministic hash from sorted answer key-value pairs */
function hashAnswers(answers: Record<string, string>): string {
  const sorted = Object.entries(answers)
    .filter(([, v]) => v)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join("|");
  // Simple string hash — good enough for cache keys
  let hash = 0;
  for (let i = 0; i < sorted.length; i++) {
    const chr = sorted.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0;
  }
  return hash.toString(36);
}

export async function getCachedStory(answers: Record<string, string>): Promise<string | null> {
  const hash = hashAnswers(answers);
  const { data } = await supabase
    .from("cached_stories")
    .select("story_text")
    .eq("answer_hash", hash)
    .maybeSingle();
  return data?.story_text ?? null;
}

export async function saveCachedStory(answers: Record<string, string>, storyText: string): Promise<void> {
  const hash = hashAnswers(answers);
  await supabase
    .from("cached_stories")
    .upsert({ answer_hash: hash, answers, story_text: storyText }, { onConflict: "answer_hash" });
}
