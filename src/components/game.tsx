"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import {
  ArrowDown,
  ArrowUp,
  Check,
  Smartphone,
  Timer as TimerIcon,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button, button } from "@/components/ui";
import { requestMotionPermission, useTilt } from "@/hooks/use-tilt";
import { cn } from "@/lib/cn";
import { sfx, unlockAudio } from "@/lib/sfx";
import { selectScore, useGame } from "@/store/game";

gsap.registerPlugin(useGSAP);

export function Game() {
  const phase = useGame((s) => s.phase);
  const goHome = useGame((s) => s.goHome);
  const [buttons, setButtons] = useState(false);
  useWakeLock();

  return (
    <div className="fixed inset-0 overflow-hidden">
      {phase === "ready" && <TapToStart onButtons={() => setButtons(true)} />}
      {phase === "countdown" && <Countdown />}
      {phase === "playing" && <Round forceButtons={buttons} />}

      {phase !== "ready" && (
        <div className="absolute inset-0 z-50 hidden flex-col items-center justify-center gap-3 bg-grape-950 portrait:flex">
          <Smartphone className="size-16 rotate-90 text-lime-neon" />
          <p className="text-2xl font-black italic">
            หมุนจอเป็นแนวนอน · Rotate to landscape
          </p>
        </div>
      )}
      <button
        type="button"
        aria-label="Quit to menu"
        onClick={goHome}
        className="glass absolute top-[max(1rem,env(safe-area-inset-top))] left-[max(1rem,env(safe-area-inset-left))] z-[60] grid size-11 place-items-center rounded-full"
      >
        <X className="size-5" />
      </button>
    </div>
  );
}

/** Looping 3D demo of the two gestures; also used on the How to play screen. */
export function TiltDemo() {
  const root = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      gsap.set(".phone", { transformPerspective: 300 });
      const tilt = (rotationX: number, color: string, label: string) =>
        gsap
          .timeline()
          .to(".phone", {
            rotationX,
            color,
            duration: 0.45,
            ease: "back.out(2)",
          })
          .to(label, { opacity: 1, scale: 1.1, duration: 0.3 }, "<")
          .to(
            ".phone",
            {
              rotationX: 0,
              color: "#fff",
              duration: 0.4,
              ease: "power2.inOut",
            },
            "+=0.5",
          )
          .to(label, { opacity: 0.35, scale: 1, duration: 0.3 }, "<");
      gsap
        .timeline({ repeat: -1, repeatDelay: 0.3 })
        .add(tilt(-55, "var(--color-lime-neon)", ".down"))
        .add(tilt(55, "var(--color-pink-neon)", ".up"), "+=0.3");
    },
    { scope: root },
  );

  return (
    <div
      ref={root}
      className="flex items-center gap-4 text-sm font-extrabold italic"
    >
      <span className="down flex flex-col items-center text-lime-neon opacity-35">
        <ArrowDown className="size-6" strokeWidth={3} />
        ก้ม · ถูก
      </span>
      <span className="phone grid size-20 place-items-center">
        <Smartphone className="size-16 rotate-90" strokeWidth={1.75} />
      </span>
      <span className="up flex flex-col items-center text-pink-neon opacity-35">
        <ArrowUp className="size-6" strokeWidth={3} />
        เงย · ข้าม
      </span>
    </div>
  );
}

/** The one user gesture that unlocks the motion sensor (iOS), fullscreen and landscape lock (Android). */
function TapToStart({ onButtons }: { onButtons: () => void }) {
  const deck = useGame((s) => s.deck);
  const seconds = useGame((s) => s.seconds);
  const beginCountdown = useGame((s) => s.beginCountdown);
  const [denied, setDenied] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  useGSAP(
    () =>
      gsap.from(".card", {
        scale: 0.6,
        rotate: -5,
        opacity: 0,
        duration: 0.8,
        ease: "elastic.out(1, 0.55)",
      }),
    {
      scope: root,
    },
  );

  const start = async () => {
    unlockAudio();
    const permission = requestMotionPermission(); // must start synchronously inside the tap
    document.documentElement
      .requestFullscreen?.()
      .then(() =>
        (screen.orientation as { lock?: (o: string) => Promise<void> }).lock?.(
          "landscape",
        ),
      )
      .catch(() => {}); // iOS has neither; fine
    if (await permission) {
      beginCountdown();
    } else if (navigator.maxTouchPoints === 0) {
      // No sensor to grant on desktop: go straight to buttons/arrow keys.
      onButtons();
      beginCountdown();
    } else {
      setDenied(true);
    }
  };

  return (
    <div ref={root} className="grid h-full place-items-center p-6">
      <div className="card glass flex max-w-xl flex-col items-center gap-4 rounded-3xl p-7 text-center short:gap-2 short:p-4">
        <p className="text-sm font-bold tracking-widest text-lime-neon uppercase">
          {deck?.subtitle} · {seconds}s
        </p>
        <h2 className="text-5xl font-black italic short:text-4xl">
          {deck?.title}
        </h2>
        <p className="text-white/80">
          Phone <b>sideways on your forehead</b>, screen facing your friends.
        </p>
        <TiltDemo />
        {denied ? (
          <>
            <p className="text-sm text-pink-neon">
              Motion access blocked. Play with on-screen buttons instead.
            </p>
            <Button
              variant="pink"
              onClick={() => (onButtons(), beginCountdown())}
            >
              Play with buttons
            </Button>
          </>
        ) : (
          <Button
            className="h-20 animate-pulse px-10 text-3xl short:h-14 short:text-2xl"
            onClick={start}
          >
            Tap to Start
          </Button>
        )}
      </div>
    </div>
  );
}

function Countdown() {
  const beginRound = useGame((s) => s.beginRound);
  const root = useRef<HTMLDivElement>(null);
  const num = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const tl = gsap.timeline({
        onComplete: () => (sfx.count(true), beginRound()),
      });
      for (const n of ["3", "2", "1"]) {
        tl.call(() => {
          num.current!.textContent = n;
          sfx.count();
        })
          .fromTo(
            num.current,
            { scale: 3, opacity: 0 },
            {
              scale: 1,
              opacity: 1,
              duration: 0.5,
              ease: "elastic.out(1.1, 0.45)",
            },
          )
          .to(
            num.current,
            { scale: 0.4, opacity: 0, duration: 0.25, ease: "power2.in" },
            "+=0.2",
          );
      }
    },
    { scope: root },
  );

  return (
    <div
      ref={root}
      className="flex h-full flex-col items-center justify-center"
    >
      <p className="text-xl font-bold text-white/80">
        วางบนหน้าผาก! · On your forehead!
      </p>
      <span
        ref={num}
        className="outlined text-[min(40vw,60dvh)] leading-none font-black text-lime-neon italic"
      />
    </div>
  );
}

function Round({ forceButtons }: { forceButtons: boolean }) {
  const answer = useGame((s) => s.answer);
  const correct = () => answer("correct") && sfx.correct();
  const pass = () => answer("pass") && sfx.pass();
  const hasSensor = useTilt(true, correct, pass);

  return (
    <div className="safe flex h-full flex-col">
      <header className="flex items-center gap-4 pl-14">
        <Timer />
        <Score />
      </header>
      <main className="grid flex-1 place-items-center">
        <Word />
      </main>
      {(forceButtons || hasSensor === false) && (
        // Each hitbox is a whole bottom-half quadrant; the pill is just the visual.
        <div className="absolute inset-x-0 bottom-0 grid h-1/2 grid-cols-2">
          <AnswerButton side="left" variant="pink" onClick={pass} keys="← ↑">
            <X strokeWidth={3} /> Pass
          </AnswerButton>
          <AnswerButton
            side="right"
            variant="lime"
            onClick={correct}
            keys="→ ↓"
          >
            <Check strokeWidth={3} /> Correct
          </AnswerButton>
        </div>
      )}
      <Flash />
    </div>
  );
}

function AnswerButton({
  side,
  variant,
  keys,
  onClick,
  children,
}: {
  side: "left" | "right";
  variant: "pink" | "lime";
  keys: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group flex items-end p-[max(1rem,env(safe-area-inset-bottom))] transition-colors",
        side === "left"
          ? "justify-start hover:bg-linear-to-t hover:from-pink-neon/20 hover:to-transparent"
          : "justify-end hover:bg-linear-to-t hover:from-lime-neon/20 hover:to-transparent",
      )}
    >
      <span
        className={cn(
          button({ variant }),
          "group-hover:-translate-y-1 group-hover:brightness-110 group-active:scale-95",
        )}
      >
        {children}
        {/* Key hint for mouse/keyboard players only. */}
        <kbd className="rounded-md bg-black/15 px-1.5 font-sans text-sm not-italic pointer-coarse:hidden">
          {keys}
        </kbd>
      </span>
    </button>
  );
}

/** Oversized, and capped by viewport height because landscape phones are short. */
function fitClass(word: string) {
  const n = [...word].length;
  if (n <= 6) return "text-[min(22vw,38dvh)]";
  if (n <= 12) return "text-[min(14vw,28dvh)]";
  if (n <= 20) return "text-[min(10vw,22dvh)]";
  return "text-[min(7vw,16dvh)]";
}

function Word() {
  const word = useGame((s) => s.queue[s.index]) ?? "";
  const el = useRef<HTMLHeadingElement>(null);

  useGSAP(
    () => {
      gsap.fromTo(
        el.current,
        { scale: 0.25, rotate: gsap.utils.random(-14, 14), y: 60, opacity: 0 },
        {
          scale: 1,
          rotate: 0,
          y: 0,
          opacity: 1,
          duration: 0.85,
          delay: 0.15,
          ease: "elastic.out(1.15, 0.42)",
        },
      );
    },
    { dependencies: [word] },
  );

  return (
    <h1
      ref={el}
      className={cn(
        "outlined pointer-events-none max-w-[92vw] text-center leading-[1.05] font-black text-balance break-words italic drop-shadow-[0_10px_0_var(--color-grape-950)]",
        fitClass(word),
      )}
    >
      {word}
    </h1>
  );
}

function Score() {
  const score = useGame(selectScore);
  const el = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      if (score)
        gsap.fromTo(
          el.current,
          { scale: 1.6, rotate: -10 },
          { scale: 1, rotate: 0, duration: 0.6, ease: "elastic.out(1, 0.4)" },
        );
    },
    { dependencies: [score] },
  );
  return (
    <div
      ref={el}
      className="grid h-14 min-w-14 place-items-center rounded-2xl bg-lime-neon px-3 text-3xl font-black text-grape-900 italic shadow-[4px_4px_0_var(--color-pink-neon)]"
    >
      {score}
    </div>
  );
}

/** Writes the DOM straight from requestAnimationFrame; no React renders or store writes per tick. */
function Timer() {
  const bar = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const { endsAt, seconds, finish } = useGame.getState();
    let raf = 0;
    const frame = () => {
      const left = Math.max(0, endsAt - Date.now());
      const secs = Math.ceil(left / 1000);
      label.current!.textContent = String(secs);
      bar.current!.style.transform = `scaleX(${left / (seconds * 1000)})`;
      bar.current!.dataset.low = label.current!.dataset.low = String(
        secs <= 10,
      );
      if (left <= 0) return (sfx.end(), finish());
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="flex flex-1 items-center gap-2">
      <TimerIcon className="size-7 shrink-0 text-lime-neon" strokeWidth={2.5} />
      <span
        ref={label}
        className="w-14 text-center text-4xl font-black tabular-nums italic data-[low=true]:text-pink-neon motion-safe:data-[low=true]:animate-shake"
      >
        {useGame.getState().seconds}
      </span>
      <div className="glass h-5 flex-1 overflow-hidden rounded-full p-1">
        <div
          ref={bar}
          className="h-full origin-left rounded-full bg-lime-neon data-[low=true]:bg-pink-neon"
        />
      </div>
    </div>
  );
}

/** Full-screen neon flash on every answer; keyed off played.length so it fires once per answer. */
function Flash() {
  const count = useGame((s) => s.played.length);
  const last = useGame((s) => s.played.at(-1));
  const el = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!count) return;
      gsap.fromTo(
        el.current,
        { opacity: 1 },
        { opacity: 0, duration: 0.5, delay: 0.15, ease: "power2.in" },
      );
      gsap.fromTo(
        ".flash-icon",
        { scale: 0.3, rotate: -25 },
        { scale: 1, rotate: 0, duration: 0.4, ease: "back.out(3)" },
      );
    },
    { dependencies: [count], scope: el },
  );

  const ok = last?.verdict === "correct";
  return (
    <div
      ref={el}
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 grid place-items-center text-[min(14vw,24dvh)] font-black italic opacity-0",
        ok ? "bg-lime-neon text-grape-900" : "bg-pink-neon text-white",
      )}
    >
      <div className="flex flex-col items-center">
        {ok ? (
          <Check
            className="flash-icon size-[min(18vw,30dvh)]"
            strokeWidth={4}
          />
        ) : (
          <X className="flash-icon size-[min(18vw,30dvh)]" strokeWidth={4} />
        )}
        {ok ? "ถูก! +1" : "ข้าม"}
      </div>
    </div>
  );
}

/** Nobody touches the phone for 60s, so without this many phones dim or lock mid-round. */
function useWakeLock() {
  useEffect(() => {
    let lock: WakeLockSentinel | undefined;
    const acquire = () =>
      navigator.wakeLock
        ?.request("screen")
        .then((l) => (lock = l))
        .catch(() => {});
    const onVisible = () => document.visibilityState === "visible" && acquire();
    acquire();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      lock?.release();
    };
  }, []);
}
