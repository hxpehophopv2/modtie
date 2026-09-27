// Synthesized with Web Audio: no files to cache, zero latency, works offline.
let ctx: AudioContext | undefined;

/** iOS only lets audio start from a user gesture: call this inside the Tap to Start handler. */
export function unlockAudio() {
  ctx ??= new AudioContext();
  void ctx.resume();
}

function tone(freq: number, at: number, len: number, type: OscillatorType = "triangle", slideTo?: number) {
  if (!ctx) return;
  const t = ctx.currentTime + at;
  const osc = ctx.createOscillator();
  const amp = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t + len);
  amp.gain.setValueAtTime(0.25, t);
  amp.gain.exponentialRampToValueAtTime(0.001, t + len);
  osc.connect(amp).connect(ctx.destination);
  osc.start(t);
  osc.stop(t + len);
}

const buzz = (ms: number | number[]) => navigator.vibrate?.(ms);

export const sfx = {
  correct: () => (tone(988, 0, 0.12), tone(1480, 0.09, 0.3), buzz(40)),
  pass: () => (tone(160, 0, 0.35, "sawtooth", 90), buzz([60, 40, 60])),
  count: (go = false) => tone(go ? 1320 : 660, 0, go ? 0.35 : 0.14, "square"),
  end: () => (tone(523, 0, 0.18, "sawtooth"), tone(392, 0.16, 0.18, "sawtooth"), tone(262, 0.32, 0.6, "sawtooth"), buzz(400)),
};
