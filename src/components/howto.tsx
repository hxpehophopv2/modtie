"use client";

import { Hand, Keyboard, Layers, MessagesSquare, Smartphone, Trophy, Volume2 } from "lucide-react";
import { TiltDemo } from "@/components/game";
import { Screen } from "@/components/ui";

const STEPS = [
  { icon: Layers, th: "เลือกชุดคำและเวลา", en: "Pick a deck and a round length (60, 90 or 120s)." },
  { icon: Hand, th: "กด Tap to Start แล้วอนุญาตเซ็นเซอร์", en: "Tap to Start and allow motion access when asked." },
  { icon: Smartphone, th: "แปะมือถือแนวนอนไว้บนหน้าผาก", en: "Hold the phone sideways on your forehead, screen facing your friends." },
  { icon: MessagesSquare, th: "เพื่อนใบ้คำ ห้ามพูดคำนั้นตรง ๆ", en: "Friends describe or act out the word, without saying it." },
];

export function HowTo() {
  return (
    <Screen title="วิธีเล่น · How to play">
      <ol className="flex flex-col gap-3">
        {STEPS.map(({ icon: Icon, th, en }, i) => (
          <li key={th} className="pop glass group flex items-center gap-4 rounded-2xl p-4 transition-[translate] hover:-translate-y-1">
            <span className="text-3xl font-black text-white/30 italic tabular-nums">{i + 1}</span>
            <Icon className="size-8 shrink-0 text-lime-neon transition-transform duration-300 group-hover:scale-125 group-hover:-rotate-12" />
            <p>
              <b className="block">{th}</b>
              <span className="text-sm text-white/70">{en}</span>
            </p>
          </li>
        ))}

        <li className="pop glass flex flex-col items-center gap-2 rounded-2xl p-4 text-center">
          <span className="self-start text-3xl font-black text-white/30 italic">5</span>
          <TiltDemo />
          <p className="text-sm text-white/70">Tilt down (screen to the floor) = correct. Tilt up (screen to the ceiling) = pass.</p>
        </li>

        <li className="pop glass group flex items-center gap-4 rounded-2xl p-4 transition-[translate] hover:-translate-y-1">
          <span className="text-3xl font-black text-white/30 italic">6</span>
          <Trophy className="size-8 shrink-0 text-sun-neon transition-transform duration-300 group-hover:scale-125 group-hover:-rotate-12" />
          <p>
            <b className="block">หมดเวลา ดูคะแนนแล้วส่งต่อให้คนถัดไป</b>
            <span className="text-sm text-white/70">When time runs out, check the score and word list, then pass the phone on.</span>
          </p>
        </li>
      </ol>

      <section className="pop glass rounded-2xl p-4 text-sm">
        <h2 className="mb-2 font-extrabold tracking-widest text-pink-neon uppercase">Tips</h2>
        <p className="flex items-center gap-2">
          <Keyboard className="size-5 shrink-0 text-white/70" /> On a laptop: → or ↓ = correct, ← or ↑ = pass, or click anywhere on the lower left/right half.
        </p>
        <p className="mt-2 flex items-center gap-2">
          <Volume2 className="size-5 shrink-0 text-white/70" /> Turn the volume up so the room hears every bing and buzz.
        </p>
      </section>
    </Screen>
  );
}
