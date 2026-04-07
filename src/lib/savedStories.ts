import { supabase } from "@/integrations/supabase/client";

export interface SavedStory {
  id: string;
  title: string;
  story_text: string;
  audio_url?: string | null;
  created_at: string;
}

/** Extract the # title from markdown story text */
export function extractStoryTitle(storyText: string): string {
  const match = storyText.match(/^# (.+)/m);
  return match ? match[1].trim() : "My Story";
}

export async function saveStory(
  storyText: string,
  audioUrl?: string | null
): Promise<{ ok: boolean; error?: string }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in" };
  const title = extractStoryTitle(storyText);
  const { error } = await supabase
    .from("saved_stories")
    .insert({ user_id: user.id, title, story_text: storyText, audio_url: audioUrl ?? null });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function getSavedStories(): Promise<SavedStory[]> {
  const { data, error } = await supabase
    .from("saved_stories")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("getSavedStories error:", error.message);
    return [];
  }
  return (data as SavedStory[]) || [];
}

export async function deleteSavedStory(id: string): Promise<boolean> {
  const { error } = await supabase.from("saved_stories").delete().eq("id", id);
  return !error;
}
