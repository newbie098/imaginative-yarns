const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PLANNER_MODEL = "gpt-5";
const WRITER_MODEL = "gpt-4.1";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response(null, { headers: corsHeaders });

  try {
    const { answers, language } = await req.json();
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is not configured");

    const isPtBR = language === "pt-BR";
    const isDeCH = language === "de-CH";

    const lengthMap: Record<string, string> = {
      short: "approximately 300-500 words (2-3 minute read-aloud)",
      medium: "approximately 500-800 words (3-5 minute read-aloud)",
      long: "approximately 800-1200 words (5-8 minute read-aloud)",
    };
    const storyLength = lengthMap[answers.length] || lengthMap.medium;

    // Child age — default to 6 if not provided
    const childAge = answers.child_age ? parseInt(answers.child_age, 10) : 6;

    // Age-specific writing guidelines — English
    const ageGuidelinesEn =
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

    // Age-specific writing guidelines — Brazilian Portuguese
    const ageGuidelinesPtBR =
      childAge <= 4
        ? `- Use APENAS as palavras mais simples que uma criança pequena já conhece (ex: grande, pequeno, feliz, triste, correr, comer, dormir). SEM palavras incomuns ou com muitas sílabas.
- As frases devem ser muito curtas — no máximo 5 a 8 palavras. Use muita repetição e ritmo (ex: "Ele correu e correu e correu").
- Foque apenas em coisas concretas e familiares: casa, animais, comida, cores, sentimentos simples.
- Um problema claro, uma solução clara — sem subtramas, sem reviravoltas.
- Use linguagem lúdica e sons (bum!, vrum!, plic plac). Evite acumular adjetivos descritivos.`
        : childAge <= 6
        ? `- Use apenas palavras simples do dia a dia que uma criança de 5-6 anos já conhece. EVITE adjetivos incomuns ou literários (ex: NÃO use palavras como colossal, reluzente, peculiar, esplêndido, onipotente, translúcido).
- Mantenha as frases curtas e claras — no máximo 10-12 palavras. Divida frases longas em duas frases curtas.
- As descrições devem ser breves e concretas: diga "um botão azul grande" e não "um botão do tamanho de um prato com um leve brilho azulado". Um detalhe de cada vez.
- O diálogo deve ser natural e simples — como uma criança pequena de verdade falaria.
- Enredo simples de causa e efeito. Sem subtramas. Os personagens têm uma característica de personalidade clara.`
        : `- Use vocabulário claro e acessível para uma criança de 7-8 anos. Você pode usar ocasionalmente uma palavra mais interessante, mas apenas quando seu significado for imediatamente claro pelo contexto. Evite completamente palavras literárias ou arcaicas.
- Mantenha as frases variadas mas legíveis — misture frases curtas e diretas com frases compostas simples. Evite orações subordinadas complexas.
- As descrições devem ser vívidas mas enxutas — um ou dois detalhes claros por cena, não imagens longas.
- O enredo pode ter uma reviravolta leve. Os personagens podem mostrar sentimentos simples conflitantes (nervoso mas corajoso, triste mas esperançoso).
- O diálogo deve soar natural e adequado à idade — não muito formal ou floreado.`;

    // Age-specific writing guidelines — Swiss German (Standard German / Hochdeutsch)
    const ageGuidelinesDeCH =
      childAge <= 4
        ? `- Verwende NUR die einfachsten Wörter, die ein Kleinkind bereits kennt (z.B. groß, klein, laufen, essen, schlafen, lustig, traurig). KEINE mehrsílbigen oder ungewöhnlichen Wörter.
- Sätze müssen sehr kurz sein — maximal 5 bis 8 Wörter. Verwende viel Wiederholung und Rhythmus (z.B. "Er lief und lief und lief").
- Konzentriere dich nur auf konkrete, vertraute Dinge: Zuhause, Tiere, Essen, Farben, einfache Gefühle.
- Ein klares Problem, eine klare Lösung — keine Nebenhandlungen, keine Überraschungen.
- Verwende spielerische, singsongartige Sprache und Geräusche (Bumm!, Wusch!, Klirr). Vermeide ALLE beschreibenden Adjektivanhäufungen.`
        : childAge <= 6
        ? `- Verwende nur einfache, alltägliche Wörter, die ein 5-6-Jähriges Kind bereits kennt. VERMEIDE ungewöhnliche, literarische oder mehrsílbige Adjektive vollständig (z.B. NICHT verwenden: kolossal, schimmernd, leuchtend, merkwürdig, prächtig, gewaltig, unheimlich im literarischen Sinne).
- Halte Sätze kurz und klar — nicht mehr als 10-12 Wörter. Teile lange Sätze in zwei kurze auf.
- Beschreibungen müssen knapp und konkret sein: sag "ein großer blauer Knopf" und nicht "ein Knopf in der Größe eines Tellers mit einem leichten blauen Schimmer". Ein Detail auf einmal.
- Dialoge sollen natürlich und einfach klingen — so wie ein kleines Kind wirklich sprechen würde.
- Einfacher Ursache-Wirkungs-Plot. Keine Nebenhandlungen. Figuren haben eine klare Charaktereigenschaft.`
        : `- Verwende klares, zugängliches Vokabular für ein 7-8-jähriges Kind. Du darfst gelegentlich ein interessanteres Wort verwenden, aber nur wenn seine Bedeutung sofort aus dem Kontext klar ist. Vermeide literarische oder veraltete Wörter vollständig.
- Halte Sätze abwechslungsreich aber lesbar — mische kurze, prägnante Sätze mit einfachen zusammengesetzten Sätzen. Vermeide komplexe Schachtelsätze.
- Beschreibungen sollten lebendig aber knapp sein — ein oder zwei klare Details pro Szene, keine langen Bilder.
- Die Handlung kann eine leichte Wendung enthalten. Figuren können einfache widersprüchliche Gefühle zeigen (nervös aber mutig, traurig aber hoffnungsvoll).
- Dialoge sollen natürlich und altersgerecht klingen — nicht zu förmlich oder blumig.`;

    // Select guidelines and language instruction based on locale
    const ageGuidelines = isPtBR
      ? ageGuidelinesPtBR
      : isDeCH
      ? ageGuidelinesDeCH
      : ageGuidelinesEn;

    const languageInstruction = isPtBR
      ? `\nLANGUAGE: Write the entire story in Brazilian Portuguese (português do Brasil). Use natural, warm, child-friendly Brazilian Portuguese throughout — including dialogue, narration, and the title.\n`
      : isDeCH
      ? `\nLANGUAGE: Write the entire story in Standard German (Hochdeutsch). Use neutral, child-friendly Standard German appropriate for Swiss children — avoid regional expressions specific to Austria or Germany. The title and all dialogue must be in German.\n`
      : "";

    // Compact list of the child's chosen ingredients for the planner.
    const ingredientsList = [
      `- Hero type: ${answers.hero_type}`,
      `- Hero's name: ${answers.hero_name}`,
      `- Sidekick: ${answers.sidekick}`,
      `- Setting: ${answers.setting}`,
      `- Story mood: ${answers.mood}`,
      `- The big problem: ${answers.problem}`,
      answers.power ? `- Special power: ${answers.power}` : null,
      answers.object ? `- Magical object: ${answers.object}` : null,
      answers.wildcard ? `- Wildcard (MUST include if present): ${answers.wildcard}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    // -------------------------- PASS 1: PLANNER --------------------------
    const plannerSystemPrompt = `You are a story architect for a children's storytelling app. You do NOT write prose. Your job is to plan a memorable story for a ${childAge}-year-old child, then return a JSON scaffold that another model will use to write the actual prose.

Your goals, in order:
1. PICK FOCUS. The child has chosen many ingredients. Most stories feel forgettable because they cram everything in. Choose the 3–4 ingredients that fit together best and form a coherent emotional spine. Skip the rest. The wildcard, if provided, MUST be one of the chosen ingredients.
2. PLANT A CALLBACK. Invent ONE small, specific, sensory detail (an object, a phrase, a sound, a smell, a habit) that will appear early as a throwaway and return at the climax with new meaning. The callback should NOT be one of the big ingredients (hero, setting, magical object). It should be small and surprising — a button, a hum, a crooked smile, a particular word the hero says. The transformation at the climax is what makes the story memorable.
3. OPEN WITH AN IMAGE, NOT EXPOSITION. The first sentence must be a concrete sensory moment, not "Once upon a time" and not setting description. Plan exactly what the listener sees, hears, or smells in the very first beat.
4. STRUCTURE IN 3 BEATS. Setup → escalation with one real twist → resolution that lands the callback. Resolution must come from cleverness, dialogue, or empathy — never violence. Do NOT default to "happy ever after"; let the ending grow naturally from the twist and the callback.
5. KEEP THE WORLD SMALL. One location, or two at most. Crowded worlds confuse young listeners.

Return ONLY valid JSON in this exact shape (no markdown, no prose, no commentary):

{
  "chosen_elements": ["..."],
  "skipped_elements": ["..."],
  "opening_image": "...",
  "callback": {
    "seed": "...",
    "setup": "...",
    "payoff": "...",
    "why_it_lands": "..."
  },
  "beats": [
    { "act": 1, "what_happens": "..." },
    { "act": 2, "what_happens": "...", "twist": "..." },
    { "act": 3, "what_happens": "..." }
  ],
  "tone_note": "...",
  "one_real_detail": "..."
}`;

    const plannerUserPrompt = `Plan a ${storyLength} story for a ${childAge}-year-old. The child chose:

${ingredientsList}

Pick the strongest 3–4. Plant a callback. Plan the opening image. Return JSON only.`;

    const plannerResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: PLANNER_MODEL,
        messages: [
          { role: "system", content: plannerSystemPrompt },
          { role: "user", content: plannerUserPrompt },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!plannerResponse.ok) {
      if (plannerResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit reached. Please wait a moment and try again." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await plannerResponse.text();
      console.error("Planner error:", plannerResponse.status, t);
      return new Response(
        JSON.stringify({ error: "Story planning failed. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const plannerJson = await plannerResponse.json();
    const scaffold = plannerJson?.choices?.[0]?.message?.content ?? "";
    if (!scaffold) {
      console.error("Planner returned empty content", plannerJson);
      return new Response(
        JSON.stringify({ error: "Story planning failed. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // -------------------------- PASS 2: WRITER --------------------------
    const writerSystemPrompt = `You are a master children's storyteller writing original, memorable stories for a ${childAge}-year-old child.
${languageInstruction}
You will be given a SCAFFOLD (JSON) prepared by a story planner. Follow it exactly:
- Use ONLY the chosen_elements. Do NOT mention skipped_elements.
- Begin the story with the planned opening_image. Your first sentence must be a concrete sensory moment — something seen, heard, smelled, or touched. NEVER begin with "Once upon a time", "In a faraway land", or any setting/exposition sentence.
- Plant the callback.seed in beat 1 as a small throwaway detail (do not draw attention to it). Bring it back transformed at the climax exactly as described in callback.payoff. Do not announce the callback; let it land quietly.
- Hit each of the 3 beats. Honor the twist in act 2.
- Weave in the one_real_detail somewhere — a mundane, true-to-life touch that grounds the fantasy.
- Match the tone_note.

CRITICAL WRITING RULES:

VOCABULARY (the most important rule):
- Use only words a ${childAge}-year-old already knows. When in doubt, use the simpler word.
- NEVER use literary, archaic, or unusual adjectives and verbs ("amidst", "glimmer", "nestled", "ventured", "majestic"). This is a story to be heard out loud — every word must be immediately understood by ear.

ONE DETAIL PER THING:
- One simple detail per object, person, or place. Never stack descriptions.
- BAD: "Amidst the colorful jumble of buttons, zippers, and stray threads, Lili noticed a glimmer beneath a blue button the size of a dinner plate."
- GOOD: "Lili saw something shiny under a big blue button."

CALLBACKS, NOT MORALS:
- NEVER preach, moralize, or have characters say things like "sharing is caring" or "we should always be kind."
- SHOW values (kindness, empathy, courage, honesty) through ACTIONS and CHOICES inside the plot. Let parent and child discover the meaning together.

CHARACTERS AND DIALOGUE:
- One clear personality trait per character. No more.
- Dialogue should sound like how a real child talks — short, natural, fun. Read it out loud in your head; if it sounds like a grown-up wrote it, rewrite.
- Use binary pronouns (she/he), not singular "they".
- Conflict resolves through conversation, cleverness, empathy, or cooperation. Never through violence.

FRESHNESS:
- Avoid formulaic hero's-journey templates and stock phrases ("his eyes sparkled", "her heart raced", "little did she know").
- Surprise the reader with small, unexpected moments of warmth, silliness, or specificity.

AGE-SPECIFIC STYLE (child is ${childAge} years old):
${ageGuidelines}

OUTPUT FORMAT:
- Markdown.
- Start with a title as # heading.
- Use --- for scene breaks (one per beat transition).
- Use **bold** for the magical object, character names on first mention, and the callback payoff moment.
- End with "**The End** ✨"
- Stop cleanly after "The End". Do not add commentary or explanation.`;

    const writerUserPrompt = `Write the story now, following the scaffold below exactly. The child is ${childAge} years old. Length: ${storyLength}.

SCAFFOLD:
${scaffold}

Remember: open with the planned sensory image (NOT "Once upon a time"), plant the callback seed quietly in beat 1, land it transformed at the climax. Show values through action. Make every word easy to hear out loud.`;

    const writerResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: WRITER_MODEL,
        messages: [
          { role: "system", content: writerSystemPrompt },
          { role: "user", content: writerUserPrompt },
        ],
        temperature: 1.0,
        frequency_penalty: 0.2,
        presence_penalty: 0.4,
        stream: true,
      }),
    });

    if (!writerResponse.ok) {
      if (writerResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit reached. Please wait a moment and try again." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await writerResponse.text();
      console.error("Writer error:", writerResponse.status, t);
      return new Response(
        JSON.stringify({ error: "Story generation failed. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(writerResponse.body, {
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
