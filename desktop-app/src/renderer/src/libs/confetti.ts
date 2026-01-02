import confetti from "canvas-confetti";
import { JSX } from "solid-js";

export const confettiStars = (e: { target: Element }) => {
  if (!e.target) return;

  const { left, top, width, height } = e.target.getBoundingClientRect();

  console.log({ innerWidth: window.innerWidth, innerHeight: window.innerHeight });

  const defaults = {
    spread: 360,
    ticks: 50,
    gravity: 0,
    decay: 0.94,
    startVelocity: 4,
    colors: ["FFE400", "FFBD00", "E89400", "FFCA6C", "FDFFB8"],
    origin: {
      x: (left + width / 2) / window.innerWidth,
      y: (top + height / 2) / window.innerHeight,
    },
  };

  confetti({
    ...defaults,
    particleCount: 40,
    scalar: 1.2,
    shapes: ["star"],
  });

  confetti({
    ...defaults,
    particleCount: 10,
    scalar: 0.75,
    shapes: ["circle"],
  });
};
