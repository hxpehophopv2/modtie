"use client";

import { Credits } from "@/components/credits";
import { Game } from "@/components/game";
import { Home } from "@/components/home";
import { HowTo } from "@/components/howto";
import { Results } from "@/components/results";
import { useGame } from "@/store/game";

// One route, state-driven screens: nothing navigates mid-round, and "/" is all the SW must precache.
export default function Page() {
  const screen = useGame((s) => s.screen);
  if (screen === "game") return <Game />;
  if (screen === "results") return <Results />;
  if (screen === "howto") return <HowTo />;
  if (screen === "credits") return <Credits />;
  return <Home />;
}
