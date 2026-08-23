import confetti from "canvas-confetti";

/** Bursts stars from the centre of `target`, or from the middle of the viewport without one. */
export const confettiStars = (target?: Element | null) => {
  const origin = { x: 0.5, y: 0.5 };

  if (target) {
    const { left, top, width, height } = target.getBoundingClientRect();
    origin.x = (left + width / 2) / window.innerWidth;
    origin.y = (top + height / 2) / window.innerHeight;
  }

  const defaults = {
    spread: 360,
    ticks: 50,
    gravity: 0,
    decay: 0.94,
    startVelocity: 4,
    colors: ["FFE400", "FFBD00", "E89400", "FFCA6C", "FDFFB8"],
    origin,
  };

  confetti({ ...defaults, particleCount: 40, scalar: 1.2, shapes: ["star"] });
  confetti({ ...defaults, particleCount: 10, scalar: 0.75, shapes: ["circle"] });
};
