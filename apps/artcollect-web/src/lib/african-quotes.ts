/**
 * African quotes & proverbs — the caption voice of ArtCollect.
 *
 * Every artwork on the platform opens with one of these: real, widely
 * attested proverbs and quotes, attributed at culture level (or to a named
 * historical figure only where the wording is well documented). No invented
 * attributions — the same "don't assume without verification" rule the
 * profile-writing brief enforces.
 *
 * `quoteForWork(seed)` maps an artwork's slug/id to a quote deterministically
 * so a piece always opens on the same words, and different pieces roam the
 * whole collection.
 */

export interface AfricanQuote {
  text: string;
  source: string;
}

export const AFRICAN_QUOTES: AfricanQuote[] = [
  {
    text: "Until the lion learns to write, every story will glorify the hunter.",
    source: "Ewe proverb · Ghana — made famous by Chinua Achebe",
  },
  {
    text: "If you want to go fast, go alone. If you want to go far, go together.",
    source: "African proverb",
  },
  {
    text: "However long the night, the dawn will break.",
    source: "Hausa proverb · Nigeria",
  },
  {
    text: "Wisdom is like a baobab tree; no one can embrace it alone.",
    source: "Ewe proverb · Ghana & Togo",
  },
  {
    text: "Smooth seas do not make skillful sailors.",
    source: "African proverb",
  },
  {
    text: "A river that forgets its source will dry up.",
    source: "African proverb",
  },
  {
    text: "Rain does not fall on one roof alone.",
    source: "Cameroonian proverb",
  },
  {
    text: "When the music changes, so does the dance.",
    source: "Akan proverb · Ghana",
  },
  {
    text: "Little by little, the bird builds its nest.",
    source: "Swahili proverb · East Africa — haba na haba, hujaza kibaba",
  },
  {
    text: "The child who is not embraced by the village will burn it down to feel its warmth.",
    source: "African proverb",
  },
  {
    text: "Do not look where you fell, but where you slipped.",
    source: "African proverb",
  },
  {
    text: "The moon moves slowly, but it crosses the town.",
    source: "African proverb",
  },
  {
    text: "Where you will sit when you are old shows where you stood in your youth.",
    source: "Yoruba proverb · Nigeria",
  },
  {
    text: "A canoe does not know who is leader — when it turns over, everyone gets wet.",
    source: "Bemba proverb · Zambia",
  },
  {
    text: "The earth is a beehive; we all enter by the same door.",
    source: "African proverb",
  },
  {
    text: "What you help a child to love can be more important than what you help a child to learn.",
    source: "African proverb",
  },
  {
    text: "An army of sheep led by a lion can defeat an army of lions led by a sheep.",
    source: "Ethiopian proverb",
  },
  {
    text: "The best time to plant a tree was twenty years ago. The second-best time is now.",
    source: "African proverb",
  },
  {
    text: "It is the calm and silent water that drowns a person.",
    source: "Akan proverb · Ghana",
  },
  {
    text: "One who asks questions does not lose their way.",
    source: "African proverb",
  },
  {
    text: "Hurry, hurry has no blessings.",
    source: "Swahili proverb · East Africa — haraka haraka haina baraka",
  },
  {
    text: "Slowly, slowly is the way.",
    source: "Swahili proverb · East Africa — pole pole ndiyo mwendo",
  },
  {
    text: "A person is a person through other people.",
    source: "Zulu proverb · South Africa — umuntu ngumuntu ngabantu (ubuntu)",
  },
  {
    text: "Coffee and love taste best when hot.",
    source: "Ethiopian proverb",
  },
  {
    text: "He who learns, teaches.",
    source: "African proverb",
  },
  {
    text: "In a moment of crisis, the wise build bridges and the foolish build dams.",
    source: "Nigerian proverb",
  },
  {
    text: "If you carry the basket of eggs, do not dance.",
    source: "African proverb",
  },
  {
    text: "Knowledge without wisdom is like water in the sand.",
    source: "Guinean proverb",
  },
  {
    text: "The wind does not break a tree that bends.",
    source: "African proverb",
  },
  {
    text: "Where there is love, there is no darkness.",
    source: "Burundian proverb",
  },
  {
    text: "It always seems impossible until it is done.",
    source: "Attributed to Nelson Mandela",
  },
  {
    text: "Education is the most powerful weapon which you can use to change the world.",
    source: "Nelson Mandela",
  },
  {
    text: "It is the little things citizens do that will make the difference. My little thing is planting trees.",
    source: "Wangari Maathai · Kenya",
  },
  {
    text: "We face neither East nor West; we face forward.",
    source: "Kwame Nkrumah",
  },
  {
    text: "My humanity is bound up in yours, for we can only be human together.",
    source: "Desmond Tutu",
  },
];

/** Fallback for an empty library — never expected, never rendered blank. */
const FALLBACK_QUOTE: AfricanQuote = AFRICAN_QUOTES[0] ?? {
  text: "A person is a person through other people.",
  source: "Zulu proverb · South Africa (ubuntu)",
};

/**
 * Deterministic quote pick: same artwork → same words, every visit.
 * A simple 32-bit rolling hash spreads the whole library across the wall.
 */
export function quoteForWork(seed: string): AfricanQuote {
  if (AFRICAN_QUOTES.length === 0) return FALLBACK_QUOTE;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  const index = Math.abs(hash) % AFRICAN_QUOTES.length;
  return AFRICAN_QUOTES[index] ?? FALLBACK_QUOTE;
}
