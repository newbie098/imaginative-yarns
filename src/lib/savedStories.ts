import { supabase } from "@/integrations/supabase/client";

export interface SavedStory {
  id: string;
  title: string;
  story_text: string;
  created_at: string;
}

/** Extract the # title from markdown story text */
export function extractStoryTitle(storyText: string): string {
  const match = storyText.match(/^# (.+)/m);
  return match ? match[1].trim() : "My Story";
}

export async function saveStory(storyText: string): Promise<{ ok: boolean; error?: string }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in" };
  const title = extractStoryTitle(storyText);
  const { error } = await supabase
    .from("saved_stories")
    .insert({ user_id: user.id, title, story_text: storyText });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function getSavedStories(): Promise<SavedStory[]> {
  const { data, error } = await supabase
    .from("saved_stories")
    .select("id, title, story_text, created_at")
    .order("created_at", { ascending: false });
  if (error) return [];
  return (data as SavedStory[]) || [];
}

export async function deleteSavedStory(id: string): Promise<boolean> {
  const { error } = await supabase.from("saved_stories").delete().eq("id", id);
  return !error;
}
