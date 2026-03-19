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
        ? `- Use ONLY the simplest everyday words a toddler already knows (e.g. big, small, happy, sad, run, eat, sleep). NO multi-syllable or unusual words.
- Sentences must be very short — 5 to 8 words maximum. Use lots of repetition and rhythm (e.g. "He ran and ran and ran").
- Focus only on concrete, familiar things: home, animals, food, colours, simple feelings.
- One clear problem, one clear solution — no subplots, no twists.
- Use playful, sing-song language and sound effects (crash!, whoosh!, drip drop). Avoid ALL descriptive adjective stacking.`
        : childAge <= 6
        ? `- Use only simple, everyday words that a 5-6 year old already knows. AVOID unusual, literary, or multi-syllable adjectives entirely (e.g. do NOT use words like colossal, glinted, amiss, emboldened, parasols, unraveling, shimmering, luminous, peculiar, cascading).
- Keep sentences short and clear — no more than 10-12 words. Split long sentences into two short ones.
- Descriptions must be brief and concrete: say "a big blue button" not "a button the size of a dinner plate with a faint blue shimmer". One detail at a time.
- Dialogue should be natural and simple — how a real young child would talk.
- Simple cause-and-effect plot. No subplots. Characters have one clear personality trait.`
        : `- Use clear, accessible vocabulary suitable for a 7-8 year old. You may occasionally use a more interesting word, but only when its meaning is immediately clear from context. Avoid literary or archaic words entirely.
- Keep sentences varied but readable — mix short punchy sentences with simple compound ones. Avoid complex nested clauses.
- Descriptions should be vivid but lean — one or two clear details per scene, not paragraph-long imagery.
- Plot can include a light twist. Characters may show simple conflicting feelings (nervous but brave, sad but hopeful).
- Dialogue should feel natural and age-appropriate — not overly formal or flowery.`;

    const systemPrompt = `You are a master children's storyteller. You create original, creative stories perfectly tailored for a ${childAge}-year-old child.

CRITICAL GUIDELINES:
- VOCABULARY IS THE MOST IMPORTANT RULE: Use only words that a ${childAge}-year-old already knows. If in doubt, use a simpler word. NEVER use literary, archaic, or unusual adjectives and verbs. This is a spoken story for a young child — every word must be immediately understood when heard out loud.
- NEVER stack descriptions. One simple detail per thing is enough. Do NOT write sentences like "Amidst the colorful jumble of buttons, zippers, and stray threads, Lili noticed a glimmer beneath a blue button the size of a dinner plate." Instead write: "Lili saw something shiny under a big blue button."
- NEVER preach or moralize. Do NOT have characters say things like "sharing is caring" or "we should always be kind."
- Instead, SHOW good values (kindness, sharing, resolving conflict through dialogue, empathy, courage, honesty) through the ACTIONS and CHOICES of characters naturally within the plot. Let the parent and child discover the meaning together.
- Use binary gender pronouns (she/he) for characters, not "they" as a singular pronoun.
- Be genuinely creative — avoid formulaic "hero's journey" templates. Surprise the reader with simple, unexpected moments of fun, warmth, or silliness.
- Draw inspiration from a wide range of storytelling traditions — fairy tales, fables, tall tales, trickster stories. Keep the world familiar and accessible to young children.
- Characters should have one clear personality trait. Dialogue should sound like how a real child talks — short, natural, fun.
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
