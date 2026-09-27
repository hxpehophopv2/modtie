"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import {
  ArrowDown,
  ArrowUp,
  CircleHelp,
  Download,
  Info,
  Layers,
  MapPinned,
  Play,
  School,
  Shuffle,
  Timer,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui";
import { cn } from "@/lib/cn";
import { DECKS, ROUND_OPTIONS, useGame } from "@/store/game";

gsap.registerPlugin(useGSAP);

const DECK_ICON: Record<string, typeof Layers> = {
  inside: School,
  outside: MapPinned,
  all: Shuffle,
};

/** Hover-only letter hop (mouse devices); touch never fires mouseenter without a tap. */
const hop = (e: React.MouseEvent<HTMLElement>) =>
  gsap.fromTo(
    e.currentTarget,
    { y: -24, rotate: gsap.utils.random(-15, 15) },
    {
      y: 0,
      rotate: 0,
      duration: 0.7,
      ease: "elastic.out(1.2, 0.4)",
      overwrite: true,
    },
  );

export function Home() {
  const root = useRef<HTMLDivElement>(null);
  const startGame = useGame((s) => s.startGame);
  const seconds = useGame((s) => s.seconds);

  // Pop the newly picked duration pill.
  useGSAP(
    () =>
      gsap.fromTo(
        ".pill[aria-pressed=true]",
        { scale: 1.25 },
        { scale: 1, duration: 0.5, ease: "elastic.out(1, 0.4)" },
      ),
    {
      dependencies: [seconds],
      scope: root,
    },
  );

  useGSAP(
    () => {
      gsap
        .timeline()
        .from(".letter", {
          yPercent: 120,
          scale: 0.2,
          rotate: () => gsap.utils.random(-40, 40),
          opacity: 0,
          duration: 0.9,
          ease: "elastic.out(1, 0.5)",
          stagger: 0.06,
        })
        .from(
          ".pop",
          {
            y: 20,
            scale: 0.6,
            opacity: 0,
            duration: 0.5,
            ease: "back.out(2.5)",
            stagger: 0.06,
          },
          "-=0.6",
        )
        .from(
          ".deck",
          {
            y: 80,
            scale: 0.7,
            opacity: 0,
            duration: 0.8,
            ease: "elastic.out(1, 0.6)",
            stagger: 0.1,
          },
          "-=0.5",
        );
    },
    { scope: root },
  );

  return (
    <div
      ref={root}
      className="safe relative mx-auto flex min-h-dvh max-w-4xl flex-col items-center gap-4 short:gap-2"
    >
      <h1
        aria-label="ModTie"
        className="flex text-[clamp(3rem,min(14vw,20dvh),7rem)] leading-none font-black italic"
      >
        {[..."MODTIE"].map((ch, i) => (
          <span
            key={i}
            aria-hidden
            onMouseEnter={hop}
            className={cn(
              "letter inline-block cursor-default drop-shadow-[0_6px_0_var(--color-grape-950)]",
              i < 3 ? "text-white" : "text-lime-neon",
            )}
          >
            {ch}
          </span>
        ))}
      </h1>

      <div className="flex flex-wrap justify-center gap-3">
        <div className="pop glass flex items-center rounded-full p-1 text-sm font-extrabold">
          <Timer className="mx-2 size-5 text-lime-neon" />
          {ROUND_OPTIONS.map((s) => (
            <button
              key={s}
              type="button"
              aria-pressed={s === seconds}
              onClick={() => useGame.setState({ seconds: s })}
              className={cn(
                "pill h-9 rounded-full px-4 transition-colors",
                s === seconds
                  ? "bg-lime-neon text-grape-900"
                  : "text-white/70 hover:bg-white/10 hover:text-white",
              )}
            >
              {s}s
            </button>
          ))}
        </div>

        <p className="pop glass flex items-center gap-4 rounded-full px-5 py-2 text-sm font-bold">
          <span className="flex items-center gap-1 text-lime-neon">
            <ArrowDown
              className="size-4 motion-safe:animate-bounce"
              strokeWidth={3}
            />{" "}
            ก้ม = ถูก
          </span>
          <span className="flex items-center gap-1 text-pink-neon">
            <ArrowUp
              className="size-4 motion-safe:animate-bounce"
              strokeWidth={3}
            />{" "}
            เงย = ข้าม
          </span>
        </p>
      </div>

      <ul className="-mx-4 flex max-w-[100vw] snap-x snap-mandatory gap-6 overflow-x-auto px-8 py-6 [scrollbar-width:none] short:py-4">
        {DECKS.map((deck, i) => {
          const Icon = DECK_ICON[deck.id] ?? Layers;
          return (
            // Float lives on the <li> so it doesn't fight the button's hover transform.
            <li
              key={deck.id}
              className="snap-center motion-safe:animate-float"
              style={{ animationDelay: `${i * -0.8}s` }}
            >
              <button
                type="button"
                onClick={() => startGame(deck)}
                style={
                  {
                    "--tilt": `${i % 2 ? 3 : -3}deg`,
                    boxShadow: `10px 12px 0 ${deck.shadow}`,
                  } as React.CSSProperties
                }
                className={cn(
                  "deck group relative flex h-[min(18rem,55dvh)] short:h-[46dvh] w-52 flex-col justify-end gap-1 overflow-hidden rounded-[2rem] border-4 border-grape-950 p-5 text-left",
                  "rotate-(--tilt) transition-[rotate,scale,translate] duration-300 ease-[cubic-bezier(.34,1.56,.64,1)] hover:-translate-y-2 hover:scale-105 hover:rotate-0 active:scale-95",
                  deck.face,
                )}
              >
                <Icon
                  aria-hidden
                  strokeWidth={1.5}
                  className="absolute -top-6 -right-8 size-40 opacity-15 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12"
                />
                <span className="grid size-11 place-items-center rounded-xl bg-grape-950 text-white short:hidden group-hover:motion-safe:animate-wiggle">
                  <Icon className="size-6" />
                </span>
                <span className="mt-auto text-xs font-bold tracking-widest uppercase opacity-80">
                  {deck.subtitle} · {deck.words.length} คำ
                </span>
                <span className="text-5xl leading-none font-black italic short:text-4xl">
                  {deck.title}
                </span>
                <span className="mt-3 inline-flex w-fit items-center gap-1.5 rounded-full bg-grape-950 px-4 py-2 text-sm font-extrabold text-lime-neon italic transition-[padding] group-hover:px-6">
                  <Play className="size-4 fill-current" /> PLAY
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {/* Top-right so it never costs vertical space; labels only where there's room. */}
      <nav className="pop absolute top-[max(1rem,env(safe-area-inset-top))] right-[max(1rem,env(safe-area-inset-right))] flex gap-2">
        <Button
          variant="glass"
          size="md"
          aria-label="How to play"
          className="max-lg:w-11 max-lg:px-0 short:w-11 short:px-0"
          onClick={() => useGame.setState({ screen: "howto" })}
        >
          <CircleHelp />
          <span className="max-lg:hidden short:hidden">
            วิธีเล่น · How to play
          </span>
        </Button>
        <Button
          variant="glass"
          size="md"
          aria-label="Credits"
          className="max-lg:w-11 max-lg:px-0 short:w-11 short:px-0"
          onClick={() => useGame.setState({ screen: "credits" })}
        >
          <Info />
          <span className="max-lg:hidden short:hidden">เครดิต · Credits</span>
        </Button>
        <InstallBanner compact />
      </nav>

      <InstallBanner />
    </div>
  );
}

// Listen at module load, not in the banner: Chrome fires this once per page load, and the
// banner unmounts every time a game starts.
if (typeof window !== "undefined")
  addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    useGame.setState({ installPrompt: e as State["installPrompt"] });
  });
type State = ReturnType<typeof useGame.getState>;

/** Chromium: replays the stashed `beforeinstallprompt`. iOS has no install API, so show the Share-sheet hint. */
/**
 * Rendered twice: a full banner at the bottom, and (`compact`) an icon in the top-right nav
 * that replaces it on short landscape phones, where the banner would make the page scroll.
 */
function InstallBanner({ compact = false }: { compact?: boolean }) {
  const prompt = useGame((s) => s.installPrompt);
  const hidden = useGame((s) => s.installDismissed);
  const [iosHint, setIosHint] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const install = () =>
    prompt?.prompt().then(() => useGame.setState({ installPrompt: null }));

  useEffect(() => {
    const standalone =
      matchMedia("(display-mode: standalone), (display-mode: fullscreen)")
        .matches || (navigator as { standalone?: boolean }).standalone;
    // Deferred so the check runs after hydration; iPadOS reports as Mac, hence maxTouchPoints.
    const t = setTimeout(() =>
      setIosHint(
        !standalone &&
          /iPhone|iPad|iPod|Mac/.test(navigator.userAgent) &&
          navigator.maxTouchPoints > 1,
      ),
    );
    return () => clearTimeout(t);
  }, []);

  if (hidden || (!prompt && !iosHint)) return null;

  if (compact)
    return (
      <div className="relative hidden short:block">
        <Button
          size="md"
          aria-label="Install app"
          className="w-11 px-0"
          onClick={() => (prompt ? install() : setShowHint(!showHint))}
        >
          <Download strokeWidth={3} />
        </Button>
        {showHint && (
          <p className="glass absolute top-13 right-0 w-48 rounded-xl p-2 text-sm">
            Tap Share → Add to Home Screen
          </p>
        )}
      </div>
    );

  return (
    <div className="glass mt-auto flex w-full max-w-lg items-center gap-3 rounded-2xl p-3 short:hidden">
      <Download
        className="size-8 shrink-0 rounded-lg bg-lime-neon p-1.5 text-grape-900"
        strokeWidth={3}
      />
      <p className="flex-1 text-sm leading-tight">
        <b>Install for party mode</b>
        <br />
        <span className="text-white/70">
          {prompt
            ? "Full-screen, works offline."
            : "Tap Share → Add to Home Screen"}
        </span>
      </p>
      {prompt && (
        <Button size="md" onClick={install}>
          Install
        </Button>
      )}
      <button
        type="button"
        aria-label="Dismiss"
        onClick={() => useGame.setState({ installDismissed: true })}
        className="p-2 text-white/60"
      >
        <X className="size-5" />
      </button>
    </div>
  );
}
