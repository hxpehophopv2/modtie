import { create } from "zustand";
import words from "@/app/data/words.json";

export const ROUND_OPTIONS = [60, 90, 120];

// Known keys get a name and colours; any new key in words.json still shows up as a deck.
const LOOK: Record<string, { title: string; subtitle: string; face: string; shadow: string }> = {
  inside: {
    title: "ในมด",
    subtitle: "Inside KMUTT",
    face: "bg-lime-neon text-grape-900",
    shadow: "var(--color-pink-neon)",
  },
  outside: {
    title: "รอบมด",
    subtitle: "Around Bangmod",
    face: "bg-pink-neon text-white",
    shadow: "var(--color-cyan-neon)",
  },
};

export const DECKS = Object.entries(words as Record<string, string[]>).map(([id, list]) => ({
  id,
  words: list,
  ...(LOOK[id] ?? {
    title: id,
    subtitle: "Deck",
    face: "bg-cyan-neon text-grape-900",
    shadow: "var(--color-sun-neon)",
  }),
}));
DECKS.push({
  id: "all",
  title: "มั่วทั้งหมด",
  subtitle: "Everything mixed",
  words: [...new Set(DECKS.flatMap((d) => d.words))],
  face: "bg-sun-neon text-grape-900",
  shadow: "var(--color-lime-neon)",
});
export type Deck = (typeof DECKS)[number];

export type Verdict = "correct" | "pass";

type State = {
  screen: "home" | "game" | "results" | "howto" | "credits";
  /** Game-screen sub-phase. */
  phase: "ready" | "countdown" | "playing";
  deck: Deck | null;
  /** Round length, picked on the home screen via useGame.setState({ seconds }). */
  seconds: number;
  queue: string[];
  index: number;
  played: { word: string; verdict: Verdict }[];
  /** Epoch ms. The timer UI derives from this, so there are no per-tick store writes. */
  endsAt: number;
  /** Stashed `beforeinstallprompt` (fires once per page load, so it must outlive the home screen). */
  installPrompt: (Event & { prompt: () => Promise<void> }) | null;
  installDismissed: boolean;

  startGame: (deck: Deck) => void;
  beginCountdown: () => void;
  beginRound: () => void;
  /** Returns false when the answer was ignored (not mid-round). */
  answer: (verdict: Verdict) => boolean;
  finish: () => void;
  goHome: () => void;
};

function shuffle<T>(a: T[]) {
  a = [...a];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const useGame = create<State>()((set, get) => ({
  screen: "home",
  phase: "ready",
  deck: null,
  seconds: 60,
  queue: [],
  index: 0,
  played: [],
  endsAt: 0,
  installPrompt: null,
  installDismissed: false,

  startGame: (deck) =>
    set({ screen: "game", phase: "ready", deck, queue: shuffle(deck.words), index: 0, played: [] }),
  beginCountdown: () => set({ phase: "countdown" }),
  beginRound: () => set({ phase: "playing", endsAt: Date.now() + get().seconds * 1000 }),

  // Every input path (tilt, keys, buttons) ends here, so this one guard covers them all.
  answer: (verdict) => {
    const { screen, phase, queue, index, played } = get();
    if (screen !== "game" || phase !== "playing" || index >= queue.length) return false;
    set({ played: [...played, { word: queue[index], verdict }], index: index + 1 });
    if (index + 1 >= queue.length) get().finish();
    return true;
  },

  finish: () => set({ screen: "results", phase: "ready" }),
  goHome: () => set({ screen: "home", phase: "ready" }),
}));

export const selectScore = (s: State) => s.played.filter((p) => p.verdict === "correct").length;
