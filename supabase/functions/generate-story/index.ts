const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response(null, { headers: corsHeaders });

  try {
    const { answers } = await req.json();
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is not configured");

    const lengthMap: Record<string, string> = {
      short: "approximately 300-500 words (2-3 minute read-aloud)",
      medium: "approximately 500-800 words (3-5 minute read-aloud)",
      long: "approximately 800-1200 words (5-8 minute read-aloud)",
    };
    const storyLength = lengthMap[answers.length] || lengthMap.medium;

    // Child age — default to 6 if not provided
    const childAge = answers.child_age ? parseInt(answers.child_age, 10) : 6;

    // Age-specific writing guidelines
    const ageGuidelines =
      childAge <= 4
        ? `- Use VERY simple vocabulary — mostly 1-2 syllable words. Keep sentences short (5-8 words). Use lots of repetition and rhythm (e.g. "He walked and walked and walked").
- Focus on concrete, familiar concepts: home, animals, food, colours, simple feelings.
- Plot should be very simple: one clear problem, one clear solution, no subplots.
- Use playful, sing-song language. Lots of sound effects (crash!, whoosh!, drip drop).`
        : childAge <= 6
        ? `- Use simple, clear vocabulary. Mix short and medium sentences. Occasional new words are fine if explained through context.
- Familiar settings with imaginative twists. Simple cause-and-effect plot.
- Characters can have 1-2 personality traits. Dialogue should be short and charming.`
        : `- Use rich, varied vocabulary — early readers enjoy learning new words in context.
- Sentences can vary in length and complexity. Use descriptive language generously.
- Plot can include a small subplot or a twist. Characters may have nuanced motivations.
- Can handle mild tension and more complex emotions (jealousy, bravery, loneliness resolved).`;

    const systemPrompt = `You are a master children's storyteller. You create original, creative stories perfectly tailored for a ${childAge}-year-old child.

CRITICAL GUIDELINES:
- NEVER preach or moralize. Do NOT have characters say things like "sharing is caring" or "we should always be kind."
- Instead, SHOW good values (kindness, sharing, resolving conflict through dialogue, empathy, courage, honesty) through the ACTIONS and CHOICES of characters naturally within the plot. Let the parent and child discover the meaning together.
- Use binary gender pronouns (she/he) for characters, not "they" as a singular pronoun.
- Be genuinely creative — avoid formulaic "hero's journey" templates. Surprise the reader. Use unusual narrative structures, unexpected twists, playful humor, or poetic moments.
- Draw inspiration from a wide range of storytelling traditions — fairy tales, fables, tall tales, trickster stories, nature myths. Feel free to invent your own folklore. Keep the world familiar and accessible to young children.
- The story should feel alive, warm, and full of sensory detail — smells, textures, sounds, colors.
- Characters should have distinct personalities and quirks. Dialogue should sound natural and charming.
- Conflict resolution should come through conversation, cleverness, empathy, or cooperation — never through violence.
- The tone should match the mood the child selected (funny, magical, spooky, mystery).

AGE-SPECIFIC WRITING STYLE (child is ${childAge} years old):
${ageGuidelines}

OUTPUT FORMAT:
- Write in Markdown.
- Start with a title as # heading.
- Use --- for scene breaks.
- Use **bold** for emphasis on magical objects, character names on first mention, and key moments.
- End with "**The End** ✨"
- End cleanly after "The End" marker.`;

    const userPrompt = `Create a ${storyLength} children's story for a ${childAge}-year-old with these elements chosen by the child:

- Hero type: ${answers.hero_type}
- Hero's name: ${answers.hero_name}
- Sidekick: ${answers.sidekick}
- Setting: ${answers.setting}
- Story mood: ${answers.mood}
- The big problem: ${answers.problem}
- Special power: ${answers.power}
- Magical object: ${answers.object}
- Ending style: ${answers.ending}
${answers.wildcard ? `- Wild card (MUST include this): ${answers.wildcard}` : ""}

Remember: Be creative, show values through action not words, calibrate vocabulary and sentence complexity for a ${childAge}-year-old, and make it enchanting for a young listener.`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit reached. Please wait a moment and try again." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("OpenAI error:", response.status, t);
      return new Response(
        JSON.stringify({ error: "Story generation failed. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("generate-story error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
