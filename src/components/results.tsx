"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Check, House, RotateCcw, Trophy, X } from "lucide-react";
import { useRef } from "react";
import { Button } from "@/components/ui";
import { cn } from "@/lib/cn";
import { selectScore, useGame } from "@/store/game";

gsap.registerPlugin(useGSAP);

export function Results() {
  const score = useGame(selectScore);
  const { played, deck, startGame, goHome } = useGame();
  const root = useRef<HTMLDivElement>(null);
  const num = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const counter = { v: 0 };
      gsap
        .timeline()
        .from(".score", { scale: 0, rotate: -25, duration: 1.1, ease: "elastic.out(1, 0.35)" })
        .to(counter, {
          v: score,
          duration: 1,
          ease: "power2.out",
          onUpdate: () => void (num.current!.textContent = String(Math.round(counter.v))),
        }, "<")
        .from(".row", { x: 40, opacity: 0, stagger: 0.04, duration: 0.35, ease: "back.out(2)" }, "-=0.6");

      // One-shot confetti from the score. Plain divs, removed when done; skipped for reduced motion.
      if (!score || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const { x, y, width, height } = num.current!.getBoundingClientRect();
      const r = gsap.utils.random;
      for (let i = 0; i < 28; i++) {
        const bit = document.createElement("i");
        bit.className = "pointer-events-none fixed z-50 size-3 rounded-sm";
        bit.style.cssText = `left:${x + width / 2}px;top:${y + height / 2}px;background:${["#c6ff3d", "#ff2e88", "#3df2ff", "#ffd23d"][i % 4]}`;
        root.current!.append(bit);
        gsap.to(bit, {
          x: r(-320, 320),
          y: r(-280, 160),
          rotate: r(-540, 540),
          opacity: 0,
          duration: r(1, 1.8),
          delay: 0.4,
          ease: "power3.out",
          onComplete: () => bit.remove(),
        });
      }
    },
    { scope: root },
  );

  return (
    <div ref={root} className="safe mx-auto flex h-dvh max-w-5xl flex-col gap-4 landscape:flex-row">
      <section className="flex flex-col items-center justify-center gap-2 text-center landscape:flex-1">
        {score > 0 && <Trophy className="size-10 text-sun-neon motion-safe:animate-float" strokeWidth={2.5} />}
        <span
          ref={num}
          className="score outlined pointer-events-none text-[min(38vw,45dvh)] leading-[0.85] font-black text-lime-neon italic drop-shadow-[0_12px_0_var(--color-pink-neon)]"
        >
          0
        </span>
        <p className="text-lg font-semibold text-white/80">
          {deck?.title} · ถูก {score} · ข้าม {played.length - score}
        </p>
        <div className="mt-2 flex gap-3">
          <Button onClick={() => deck && startGame(deck)}>
            <RotateCcw strokeWidth={3} /> Play Again
          </Button>
          <Button variant="glass" onClick={goHome}>
            <House /> Menu
          </Button>
        </div>
      </section>

      <ol className="glass min-h-0 flex-1 overflow-y-auto rounded-3xl p-2 landscape:max-w-md">
        {played.length === 0 && <li className="p-6 text-center text-white/60">No words this round.</li>}
        {played.map((p, i) => {
          const ok = p.verdict === "correct";
          return (
            <li key={i} className="row flex items-center gap-3 rounded-xl px-3 py-2 transition-[background-color,translate] hover:translate-x-1 hover:bg-white/10">
              <span
                className={cn(
                  "grid size-8 shrink-0 place-items-center rounded-lg",
                  ok ? "bg-lime-neon text-grape-900" : "bg-pink-neon",
                )}
              >
                {ok ? <Check className="size-5" strokeWidth={3.5} /> : <X className="size-5" strokeWidth={3.5} />}
              </span>
              <span className={cn("text-lg font-semibold", !ok && "text-white/50 line-through")}>{p.word}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
