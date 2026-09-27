"use client";

import { useGSAP } from "@gsap/react";
import { cva, type VariantProps } from "class-variance-authority";
import gsap from "gsap";
import { ArrowLeft } from "lucide-react";
import { useRef, type ComponentProps, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { useGame } from "@/store/game";

gsap.registerPlugin(useGSAP);

export const button = cva(
  "inline-flex items-center justify-center gap-2 rounded-2xl font-extrabold italic uppercase transition-[translate,scale,filter,box-shadow] hover:-translate-y-1 hover:brightness-110 active:translate-y-0 active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/60 [&_svg]:transition-transform [&_svg]:duration-300 hover:[&_svg]:-rotate-12 hover:[&_svg]:scale-125",
  {
    variants: {
      variant: {
        lime: "bg-lime-neon text-grape-900 shadow-[0_6px_0_var(--color-pink-neon)] hover:shadow-[0_10px_0_var(--color-pink-neon)]",
        pink: "bg-pink-neon text-white shadow-[0_6px_0_var(--color-cyan-neon)] hover:shadow-[0_10px_0_var(--color-cyan-neon)]",
        glass: "glass text-white hover:bg-white/15",
      },
      size: { md: "h-11 px-4 text-sm", lg: "h-16 px-8 text-xl" },
    },
    defaultVariants: { variant: "lime", size: "lg" },
  },
);

export function Button({
  className,
  variant,
  size,
  ...props
}: ComponentProps<"button"> & VariantProps<typeof button>) {
  return <button type="button" className={cn(button({ variant, size }), className)} {...props} />;
}

/** Shell for the info screens: back button, big title, children pop in one by one (add class "pop"). */
export function Screen({ title, children }: { title: string; children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const goHome = useGame((s) => s.goHome);
  useGSAP(
    () => {
      gsap.from(".pop", { y: 40, scale: 0.9, opacity: 0, duration: 0.6, ease: "back.out(2)", stagger: 0.07 });
    },
    { scope: root },
  );

  return (
    <div ref={root} className="safe mx-auto flex min-h-dvh max-w-3xl flex-col gap-4">
      <header className="pop flex items-center gap-3">
        <Button variant="glass" size="md" aria-label="Back to menu" onClick={goHome} className="px-3">
          <ArrowLeft />
        </Button>
        <h1 className="outlined text-4xl font-black text-lime-neon italic sm:text-5xl">{title}</h1>
      </header>
      {children}
    </div>
  );
}
