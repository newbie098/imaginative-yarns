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
    category: "About You",
    title: "How old are you?",
    prompt: "This helps us write a story that's just right for you!",
    type: "select",
    options: [
      { id: "3", label: "3 years old", emoji: "🌱" },
      { id: "4", label: "4 years old", emoji: "🌟" },
      { id: "5", label: "5 years old", emoji: "⭐" },
      { id: "6", label: "6 years old", emoji: "🎯" },
      { id: "7", label: "7 years old", emoji: "🚀" },
      { id: "8", label: "8 years old", emoji: "🦸" },
    ],
  },
  {
    id: "hero_type",
    category: "Character",
    title: "Who's the hero?",
    prompt: "Pick who goes on the adventure!",
    type: "choice",
    options: [
      { id: "kid", label: "A Kid Like Me", emoji: "🧒" },
      { id: "animal", label: "A Brave Animal", emoji: "🦊" },
      { id: "magical", label: "A Magical Being", emoji: "🧚" },
      { id: "robot", label: "A Friendly Robot", emoji: "🤖" },
      { id: "pirate", label: "A Daring Pirate", emoji: "🏴‍☠️" },
      { id: "dragon", label: "A Baby Dragon", emoji: "🐉" },
      { id: "ghost", label: "A Friendly Ghost", emoji: "👻" },
      { id: "astronaut", label: "A Young Astronaut", emoji: "👨‍🚀" },
      { id: "witch", label: "A Little Witch", emoji: "🧙‍♀️" },
      { id: "detective", label: "A Kid Detective", emoji: "🕵️" },
    ],
  },
  {
    id: "hero_name",
    category: "Character",
    title: "What's their name?",
    prompt: "Give your hero a special name!",
    type: "text",
    placeholder: "Type a name…",
  },
  {
    id: "sidekick",
    category: "Friends",
    title: "Who comes along?",
    prompt: "Every hero needs a friend… or do they?",
    type: "choice",
    options: [
      { id: "best_friend", label: "A Best Friend", emoji: "👫" },
      { id: "talking_animal", label: "A Talking Animal", emoji: "🐾" },
      { id: "fairy", label: "A Tiny Fairy", emoji: "✨" },
      { id: "solo", label: "Solo Adventure!", emoji: "🦸" },
      { id: "shadow", label: "A Living Shadow", emoji: "🌑" },
      { id: "cloud", label: "A Friendly Cloud", emoji: "☁️" },
      { id: "toy", label: "A Toy Come Alive", emoji: "🧸" },
      { id: "twin", label: "A Mirror Twin", emoji: "🪞" },
    ],
  },
  {
    id: "setting",
    category: "World",
    title: "Where does it happen?",
    prompt: "Pick the world for your story!",
    type: "choice",
    options: [
      { id: "forest", label: "Enchanted Forest", emoji: "🌳" },
      { id: "underwater", label: "Under the Sea", emoji: "🐚" },
      { id: "space", label: "Outer Space", emoji: "🚀" },
      { id: "neighborhood", label: "My Neighborhood", emoji: "🏡" },
      { id: "candy", label: "Candy Kingdom", emoji: "🍭" },
      { id: "volcano", label: "Inside a Volcano", emoji: "🌋" },
      { id: "castle", label: "A Floating Castle", emoji: "🏰" },
      { id: "pirate_ship", label: "A Pirate Ship", emoji: "⛵" },
      { id: "giant_pocket", label: "Inside a Giant's Pocket", emoji: "🧤" },
      { id: "time_train", label: "A Time-Traveling Train", emoji: "🚂" },
      { id: "cloud_city", label: "City in the Clouds", emoji: "⛅" },
      { id: "dream", label: "Inside a Dream", emoji: "💭" },
    ],
  },
  {
    id: "mood",
    category: "Feeling",
    title: "What kind of story?",
    prompt: "How should the story make you feel?",
    type: "choice",
    options: [
      { id: "hilarious", label: "Super Funny!", emoji: "😂" },
      { id: "magical", label: "Magical & Dreamy", emoji: "🌟" },
      { id: "spooky", label: "A Little Spooky", emoji: "👻" },
      { id: "mystery", label: "A Mystery!", emoji: "🔍" },
      { id: "heartwarming", label: "Warm & Cozy", emoji: "🤗" },
      { id: "action", label: "Action-Packed!", emoji: "💥" },
      { id: "silly", label: "Totally Silly", emoji: "🤪" },
      { id: "wonder", label: "Full of Wonder", emoji: "🦋" },
    ],
  },
  {
    id: "problem",
    category: "Adventure",
    title: "What's the big problem?",
    prompt: "Every great story needs a challenge!",
    type: "choice",
    options: [
      { id: "lost", label: "Something Is Lost", emoji: "🗺️" },
      { id: "help", label: "Someone Needs Help", emoji: "💝" },
      { id: "riddle", label: "A Tricky Riddle", emoji: "🧩" },
      { id: "race", label: "A Big Race!", emoji: "🏁" },
      { id: "shrunk", label: "Everyone Shrunk!", emoji: "🔬" },
      { id: "swap", label: "Bodies Got Swapped", emoji: "🔄" },
      { id: "storm", label: "A Giant Storm", emoji: "⛈️" },
      { id: "curse", label: "A Silly Curse", emoji: "🐸" },
      { id: "portal", label: "A Portal Opened", emoji: "🌀" },
    ],
  },
  {
    id: "power",
    category: "Magic",
    title: "Pick a superpower!",
    prompt: "Your hero gets one special ability!",
    type: "choice",
    options: [
      { id: "wand", label: "Magic Wand", emoji: "🪄" },
      { id: "invisible", label: "Invisibility", emoji: "👀" },
      { id: "animals", label: "Talk to Animals", emoji: "🐦" },
      { id: "speed", label: "Super Speed", emoji: "⚡" },
      { id: "flying", label: "Can Fly!", emoji: "🦅" },
      { id: "time", label: "Freeze Time", emoji: "⏰" },
      { id: "grow", label: "Grow Super Big", emoji: "🦕" },
      { id: "copy", label: "Make Copies", emoji: "👯" },
      { id: "dreams", label: "Enter Dreams", emoji: "💤" },
      { id: "music", label: "Magic Music", emoji: "🎵" },
    ],
  },
  {
    id: "object",
    category: "Treasure",
    title: "Pick a magical object!",
    prompt: "This special thing helps in the story!",
    type: "choice",
    options: [
      { id: "map", label: "Treasure Map", emoji: "🗺️" },
      { id: "stone", label: "Glowing Stone", emoji: "💎" },
      { id: "book", label: "Enchanted Book", emoji: "📖" },
      { id: "key", label: "Magic Key", emoji: "🔑" },
      { id: "compass", label: "Talking Compass", emoji: "🧭" },
      { id: "mirror", label: "Magic Mirror", emoji: "🪞" },
      { id: "feather", label: "Golden Feather", emoji: "🪶" },
      { id: "lantern", label: "Wishing Lantern", emoji: "🏮" },
      { id: "crown", label: "Ancient Crown", emoji: "👑" },
      { id: "potion", label: "Mystery Potion", emoji: "🧪" },
    ],
  },
  {
    id: "wildcard",
    category: "What If?",
    title: "Add something wild!",
    prompt: "What's one silly, weird, or surprising thing that MUST happen in your story?",
    type: "text",
    placeholder: "e.g. A dancing pineapple shows up…",
    optional: true,
  },
  {
    id: "ending",
    category: "Ending",
    title: "How does it end?",
    prompt: "Pick how the story wraps up!",
    type: "choice",
    options: [
      { id: "twist", label: "Big Surprise!", emoji: "🎉" },
      { id: "not_what_it_seems", label: "Nothing Is As It Seems", emoji: "🪞" },
      { id: "happy", label: "Happy Ever After", emoji: "🌈" },
      { id: "cliffhanger", label: "To Be Continued…", emoji: "⏳" },
      { id: "lesson", label: "A Lesson Learned", emoji: "📚" },
      { id: "loop", label: "It Starts Again!", emoji: "🔁" },
    ],
  },
  {
    id: "length",
    category: "Length",
    title: "How long should it be?",
    prompt: "Pick the perfect story size!",
    type: "choice",
    options: [
      { id: "short", label: "Quick Tale (2–3 min)", emoji: "📗" },
      { id: "medium", label: "Adventure (3–5 min)", emoji: "📘" },
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
