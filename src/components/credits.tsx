"use client";

import { Code, Heart, Library, Users } from "lucide-react";
import pkg from "../../package.json";
import { Screen } from "@/components/ui";

const TEAM = [{ name: 'Hope "Wáng"', role: "Pretty much everything" }];

const MADE_FOR = "Groups of KMUTT students who are bored";

const WORDS_BY = "Words are collected by Hope and his friends";

const BUILT_WITH = [
  "Next.js",
  "React",
  "Tailwind CSS",
  "GSAP",
  "Zustand",
  "Serwist",
  "Lucide icons",
  "Kanit font (SIL OFL)",
];

export function Credits() {
  return (
    <Screen title="เครดิต · Credits">
      <section className="pop glass rounded-2xl p-5 text-center">
        <p className="text-5xl font-black italic">
          Mod<span className="text-lime-neon">Tie</span>
        </p>
        <p className="mt-1 text-sm text-white/60">
          v{pkg.version} · made for {MADE_FOR}
        </p>
      </section>

      <Card icon={Users} title="Made by">
        <ul className="grid gap-2 sm:grid-cols-2">
          {TEAM.map((p, i) => (
            <li
              key={i}
              className="rounded-xl bg-white/5 px-3 py-2 transition-colors hover:bg-white/10"
            >
              <b className="block">{p.name}</b>
              <span className="text-sm text-white/60">{p.role}</span>
            </li>
          ))}
        </ul>
      </Card>

      <Card icon={Library} title="Word decks">
        <p>{WORDS_BY}</p>
      </Card>

      <Card icon={Code} title="Built with">
        <ul className="flex flex-wrap gap-2">
          {BUILT_WITH.map((t) => (
            <li
              key={t}
              className="rounded-full bg-white/10 px-3 py-1 text-sm font-semibold transition-[translate,background-color] hover:-translate-y-0.5 hover:bg-lime-neon hover:text-grape-900"
            >
              {t}
            </li>
          ))}
        </ul>
      </Card>

      <p className="pop mt-auto flex items-center justify-center gap-1.5 pb-2 text-sm text-white/50">
        Made with{" "}
        <Heart className="size-4 fill-pink-neon text-pink-neon motion-safe:animate-pulse" />{" "}
        at KMUTT
      </p>
    </Screen>
  );
}

function Card({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Users;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="pop glass group rounded-2xl p-5">
      <h2 className="mb-3 flex items-center gap-2 font-extrabold tracking-widest text-pink-neon uppercase">
        <Icon className="size-5 transition-transform duration-300 group-hover:scale-125 group-hover:-rotate-12" />{" "}
        {title}
      </h2>
      {children}
    </section>
  );
}
