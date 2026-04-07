const AUDIO_FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-story-audio`;

/**
 * Request audio generation for a story via the edge function.
 * The edge function caches audio in Supabase Storage by content hash,
 * so repeat calls for the same story text are free.
 *
 * @returns Public URL of the MP3 audio file
 * @throws Error with a user-readable message on failure
 */
export async function generateStoryAudio(
  storyText: string,
  language: string
): Promise<string> {
  const resp = await fetch(AUDIO_FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({ story_text: storyText, language }),
  });

  if (!resp.ok) {
    const data = await resp.json().catch(() => ({}));
    throw new Error(data.error || "Failed to generate audio. Please try again.");
  }

  const { audio_url } = await resp.json();
  if (!audio_url) throw new Error("No audio URL returned from server.");
  return audio_url as string;
}
