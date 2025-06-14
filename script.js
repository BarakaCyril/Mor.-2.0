gsap.registerPlugin(ScrollTrigger);

const directions = [
  { x: 0, y: -250}, // center image
  { x: -350, y: -250 },
  { x: 350, y: -150 },
  { x: -480, y: 0 },
  { x: 480, y: 100 },
  { x: -300, y: 150 },
  { x: 250, y: 160 },
  { x: 0, y: 220 },
];

// Reset all images initially
for (let i = 1; i <= 8; i++) {
  const img = document.getElementById(`img${i}`);
  if (img) {
    const randomScale = Math.random() > 0.6 ? 0.6 : 0.55;
    gsap.set(img, {
      scale: i === 1 ? 1: randomScale,
      opacity: 0,
      x: 0,
      y: 0,
    });
    img.dataset.randomScale = randomScale;
  }
}

// Center image initial state
const centerImg = document.getElementById("img1");
if (centerImg) {
  gsap.set(centerImg, {
    scale: 0.8,
    opacity: 1,
    x: 0,
    y: 0,
  });
}

const tl = gsap.timeline({
  scrollTrigger: {
    trigger: ".hero-section",
    start: "top top",
    end: "+=3500", // space to scrool tyshi
    scrub: true,
    pin: true, // Lock the hero section during animation
    anticipatePin: 1,
  },
});

// Animate surrounding images
for (let i = 2; i <= 8; i++) {
  const img = document.getElementById(`img${i}`);
  if (!img) continue;
  const startScale = Number(img.dataset.randomScale) || 0.6;
  tl.to(
    img,
    {
      x: directions[i - 1].x,
      y: directions[i - 1].y,
      scale: startScale,
      opacity: 1,
    },
    (i - 2) * 0.1 // adjust timing between
  );
}

// Center image grows
tl.to(centerImg, { x: directions[0].x, y: directions[0].y, scale: 1 }, "+=0.2");

// Fade in center text
tl.to(
  ".center-text",
  {
    opacity: 1,
    scale: 1,
    duration: 0.5,
    ease: "power1.out",
  },
  "-=0.5"
);
