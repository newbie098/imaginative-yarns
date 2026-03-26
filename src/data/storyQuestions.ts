export interface StoryOption {
  id: string;
  label: string;
  emoji: string;
  description?: string;
}

export interface StoryQuestion {
  id: string;
  category: string;
  title: string;
  prompt: string;
  type: "choice" | "text" | "select";
  options?: StoryOption[];
  placeholder?: string;
  optional?: boolean;
}

export const storyQuestions: StoryQuestion[] = [
  {
    id: "child_age",
    category: "child_age.category",
    title: "child_age.title",
    prompt: "child_age.prompt",
    type: "select",
    options: [
      { id: "3", label: "child_age.options.3", emoji: "🌱" },
      { id: "4", label: "child_age.options.4", emoji: "🌟" },
      { id: "5", label: "child_age.options.5", emoji: "⭐" },
      { id: "6", label: "child_age.options.6", emoji: "🎯" },
      { id: "7", label: "child_age.options.7", emoji: "🚀" },
      { id: "8", label: "child_age.options.8", emoji: "🦸" },
    ],
  },
  {
    id: "hero_type",
    category: "hero_type.category",
    title: "hero_type.title",
    prompt: "hero_type.prompt",
    type: "choice",
    options: [
      { id: "kid", label: "hero_type.options.kid", emoji: "🧒" },
      { id: "animal", label: "hero_type.options.animal", emoji: "🦊" },
      { id: "magical", label: "hero_type.options.magical", emoji: "🧚" },
      { id: "robot", label: "hero_type.options.robot", emoji: "🤖" },
      { id: "pirate", label: "hero_type.options.pirate", emoji: "🏴‍☠️" },
      { id: "dragon", label: "hero_type.options.dragon", emoji: "🐉" },
      { id: "ghost", label: "hero_type.options.ghost", emoji: "👻" },
      { id: "astronaut", label: "hero_type.options.astronaut", emoji: "👨‍🚀" },
      { id: "witch", label: "hero_type.options.witch", emoji: "🧙‍♀️" },
      { id: "detective", label: "hero_type.options.detective", emoji: "🕵️" },
    ],
  },
  {
    id: "sidekick",
    category: "sidekick.category",
    title: "sidekick.title",
    prompt: "sidekick.prompt",
    type: "choice",
    options: [
      { id: "best_friend", label: "sidekick.options.best_friend", emoji: "👫" },
      { id: "talking_animal", label: "sidekick.options.talking_animal", emoji: "🐾" },
      { id: "fairy", label: "sidekick.options.fairy", emoji: "✨" },
      { id: "solo", label: "sidekick.options.solo", emoji: "🦸" },
      { id: "toy", label: "sidekick.options.toy", emoji: "🧸" },
    ],
  },
  {
    id: "setting",
    category: "setting.category",
    title: "setting.title",
    prompt: "setting.prompt",
    type: "choice",
    options: [
      { id: "forest", label: "setting.options.forest", emoji: "🌳" },
      { id: "underwater", label: "setting.options.underwater", emoji: "🐚" },
      { id: "space", label: "setting.options.space", emoji: "🚀" },
      { id: "neighborhood", label: "setting.options.neighborhood", emoji: "🏡" },
      { id: "candy", label: "setting.options.candy", emoji: "🍭" },
      { id: "volcano", label: "setting.options.volcano", emoji: "🌋" },
      { id: "castle", label: "setting.options.castle", emoji: "🏰" },
      { id: "cloud_city", label: "setting.options.cloud_city", emoji: "⛅" },
    ],
  },
  {
    id: "mood",
    category: "mood.category",
    title: "mood.title",
    prompt: "mood.prompt",
    type: "choice",
    options: [
      { id: "hilarious", label: "mood.options.hilarious", emoji: "😂" },
      { id: "magical", label: "mood.options.magical", emoji: "🌟" },
      { id: "spooky", label: "mood.options.spooky", emoji: "👻" },
      { id: "mystery", label: "mood.options.mystery", emoji: "🔍" },
      { id: "action", label: "mood.options.action", emoji: "💥" },
      { id: "silly", label: "mood.options.silly", emoji: "🤪" },
    ],
  },
  {
    id: "problem",
    category: "problem.category",
    title: "problem.title",
    prompt: "problem.prompt",
    type: "choice",
    options: [
      { id: "lost", label: "problem.options.lost", emoji: "🗺️" },
      { id: "help", label: "problem.options.help", emoji: "💝" },
      { id: "riddle", label: "problem.options.riddle", emoji: "🧩" },
      { id: "race", label: "problem.options.race", emoji: "🏁" },
      { id: "shrunk", label: "problem.options.shrunk", emoji: "🔬" },
      { id: "curse", label: "problem.options.curse", emoji: "🐸" },
    ],
  },
  {
    id: "power",
    category: "power.category",
    title: "power.title",
    prompt: "power.prompt",
    type: "choice",
    options: [
      { id: "wand", label: "power.options.wand", emoji: "🪄" },
      { id: "invisible", label: "power.options.invisible", emoji: "👀" },
      { id: "animals", label: "power.options.animals", emoji: "🐦" },
      { id: "speed", label: "power.options.speed", emoji: "⚡" },
      { id: "flying", label: "power.options.flying", emoji: "🦅" },
      { id: "freeze", label: "power.options.freeze", emoji: "🧊" },
      { id: "grow", label: "power.options.grow", emoji: "🦕" },
      { id: "music", label: "power.options.music", emoji: "🎵" },
    ],
  },
  {
    id: "object",
    category: "object.category",
    title: "object.title",
    prompt: "object.prompt",
    type: "choice",
    options: [
      { id: "map", label: "object.options.map", emoji: "🗺️" },
      { id: "stone", label: "object.options.stone", emoji: "💎" },
      { id: "book", label: "object.options.book", emoji: "📖" },
      { id: "key", label: "object.options.key", emoji: "🔑" },
      { id: "mirror", label: "object.options.mirror", emoji: "🪞" },
      { id: "feather", label: "object.options.feather", emoji: "🪶" },
      { id: "potion", label: "object.options.potion", emoji: "🧪" },
    ],
  },
  {
    id: "wildcard",
    category: "wildcard.category",
    title: "wildcard.title",
    prompt: "wildcard.prompt",
    type: "text",
    placeholder: "wildcard.placeholder",
    optional: true,
  },
  {
    id: "ending",
    category: "ending.category",
    title: "ending.title",
    prompt: "ending.prompt",
    type: "choice",
    options: [
      { id: "twist", label: "ending.options.twist", emoji: "🎉" },
      { id: "happy", label: "ending.options.happy", emoji: "🌈" },
      { id: "lesson", label: "ending.options.lesson", emoji: "📚" },
    ],
  },
  {
    id: "length",
    category: "length.category",
    title: "length.title",
    prompt: "length.prompt",
    type: "choice",
    options: [
      { id: "short", label: "length.options.short", emoji: "📗" },
      { id: "medium", label: "length.options.medium", emoji: "📘" },
    ],
  },
];

/**
 * Select `count` random options from a pool, biasing toward options
 * the user hasn't picked before.
 */
export function selectRandomOptions(
  options: StoryOption[],
  count: number,
  previousPicks: string[] = []
): StoryOption[] {
  if (options.length <= count) return options;

  const unseen = options.filter((o) => !previousPicks.includes(o.id));
  const seen = options.filter((o) => previousPicks.includes(o.id));

  // Shuffle helper
  const shuffle = <T,>(arr: T[]): T[] => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  const shuffledUnseen = shuffle(unseen);
  const shuffledSeen = shuffle(seen);

  // Pick unseen first, fill remainder with seen
  const selected = [
    ...shuffledUnseen.slice(0, count),
    ...shuffledSeen.slice(0, Math.max(0, count - shuffledUnseen.length)),
  ].slice(0, count);

  // Shuffle final selection so seen ones aren't always at the end
  return shuffle(selected);
}
