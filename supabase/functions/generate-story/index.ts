const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

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

    const systemPrompt = `You are a master children's storyteller. You create original, creative stories perfectly tailored for a ${childAge}-year-old child.
${languageInstruction}
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
