const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function generateImage(apiKey: string, prompt: string): Promise<string | null> {
  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "dall-e-3",
      prompt,
      n: 1,
      size: "1024x1024",
    }),
  });

  if (!response.ok) {
    console.error("Image generation failed:", response.status);
    return null;
  }

  const data = await response.json();
  return data.data?.[0]?.url ?? null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response(null, { headers: corsHeaders });

  try {
    const { answers } = await req.json();
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is not configured");

    const heroName = answers.hero_name || "the hero";
    const heroType = answers.hero_type || "a kid";
    const setting = answers.setting || "a magical place";
    const mood = answers.mood || "magical";

    const moodStyle: Record<string, string> = {
      hilarious: "bright, cheerful, cartoon-like colors, playful atmosphere",
      magical: "soft glowing light, dreamy pastels, enchanted atmosphere",
      spooky: "moody twilight, cool purples and blues, slightly mysterious but not scary",
      mystery: "dramatic lighting, warm shadows, intriguing atmosphere",
    };
    const style = moodStyle[mood] || moodStyle.magical;

    const heroPrompt = `Children's book illustration of ${heroType} named ${heroName}. The character should look friendly, expressive, and full of personality. Style: ${style}. Watercolor storybook art style, warm and inviting, no text or words in the image.`;
    const settingPrompt = `Children's book illustration of ${setting} as a story setting. Wide landscape view showing the environment. Style: ${style}. Watercolor storybook art style, rich in detail, magical and immersive, no text or words in the image, no characters.`;

    // Generate both images in parallel
    const [heroImage, settingImage] = await Promise.all([
      generateImage(OPENAI_API_KEY, heroPrompt),
      generateImage(OPENAI_API_KEY, settingPrompt),
    ]);

    return new Response(
      JSON.stringify({ heroImage, settingImage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("generate-story-images error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
