import type { Options } from "canvas-confetti";
import confetti from "canvas-confetti";
import { randomInRange } from "./random-in-range";

export type FireworksProps = {
  duration: number;
  interval: number;
  origins?: Array<{
    x: { min: number; max: number };
    y: { min: number; max: number };
  }>;
  dependencies?: {
    fire?: typeof confetti;
    now?: () => number;
    random?: () => number;
  };
  options?: Options;
};

export function fireworks(props: FireworksProps): void {
  const {
    duration,
    interval,
    origins = [
      {
        x: { min: 0.1, max: 0.3 },
        y: { min: 0, max: 0.8 },
      },
      {
        x: { min: 0.7, max: 0.9 },
        y: { min: 0, max: 0.8 },
      },
    ],
    dependencies = {},
    options = {},
  } = props;

  const {
    fire = confetti,
    now = Date.now,
    random = Math.random,
  } = dependencies;

  const { particleCount = 50 } = options;

  const endTime = now() + duration;

  const intervalId = setInterval(() => {
    const timeLeft = endTime - now();

    if (timeLeft <= 0) {
      clearInterval(intervalId);
      return;
    }

    const progress = timeLeft / duration;

    for (const origin of origins) {
      void fire({
        startVelocity: 30,
        spread: 360,
        ticks: 60,
        zIndex: 0,
        ...options,
        particleCount: Math.max(0, Math.floor(particleCount * progress)),
        origin: {
          x: randomInRange(origin.x.min, origin.x.max, random),
          y: randomInRange(origin.y.min, origin.y.max, random),
        },
      });
    }
  }, interval);
}
