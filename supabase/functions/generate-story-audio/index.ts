import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/** Strip Markdown syntax so the TTS model reads clean prose. */
function stripMarkdown(text: string): string {
  return text
    .replace(/^#{1,6}\s+/gm, "")     // headings: # ## ###
    .replace(/\*\*(.*?)\*\*/g, "$1") // **bold**
    .replace(/\*(.*?)\*/g, "$1")     // *italic*
    .replace(/^---$/gm, "")          // horizontal rules
    .replace(/`{1,3}[^`]*`{1,3}/g, "") // inline/block code
    .replace(/\n{3,}/g, "\n\n")      // collapse excess blank lines
    .trim();
}

/** Compute SHA-256 hex digest of a string (Web Crypto, available in Deno). */
async function sha256(text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response(null, { headers: corsHeaders });

  try {
    const { story_text, language } = await req.json();

    if (!story_text || typeof story_text !== "string") {
      return new Response(
        JSON.stringify({ error: "story_text is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is not configured");

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Supabase environment variables are not configured");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const cleanText = stripMarkdown(story_text);
    const hash = await sha256(cleanText);
    const filename = `${hash}.mp3`;

    // Check if audio already exists in storage (cache hit → free)
    const { data: existing } = await supabase.storage
      .from("story-audio")
      .list("", { search: filename });

    if (existing && existing.length > 0) {
      const { data: { publicUrl } } = supabase.storage
        .from("story-audio")
        .getPublicUrl(filename);
      return new Response(
        JSON.stringify({ audio_url: publicUrl }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate audio via OpenAI TTS
    const ttsResponse = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "tts-1",
        voice: "fable",
        input: cleanText,
        response_format: "mp3",
      }),
    });

    if (!ttsResponse.ok) {
      if (ttsResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit reached. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errText = await ttsResponse.text();
      console.error("OpenAI TTS error:", ttsResponse.status, errText);
      return new Response(
        JSON.stringify({ error: "Audio generation failed. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const audioBytes = await ttsResponse.arrayBuffer();

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from("story-audio")
      .upload(filename, audioBytes, {
        contentType: "audio/mpeg",
        upsert: false,
      });

    if (uploadError && uploadError.message !== "The resource already exists") {
      console.error("Storage upload error:", uploadError);
      throw new Error("Failed to store audio file");
    }

    const { data: { publicUrl } } = supabase.storage
      .from("story-audio")
      .getPublicUrl(filename);

    return new Response(
      JSON.stringify({ audio_url: publicUrl }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("generate-story-audio error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
