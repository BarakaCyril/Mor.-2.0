gsap.registerPlugin(ScrollTrigger);

let heroScrollTrigger = null;

function getResponsiveDirections() {
  const width = window.innerWidth;
  
  if (width <= 480) {
    // Mobile - mostly vertical layout
    return [
      { x: 0, y: -300}, // center image
      { x: -120, y: -350 },
      { x: 120, y: -250 },
      { x: -150, y: -150 },
      { x: 150, y: -50 },
      { x: -100, y: 50 },
      { x: 100, y: 150 },
      { x: 0, y: 250 },
    ];
  } else if (width <= 768) {
    // Tablet - balanced vertical and horizontal
    return [
      { x: 0, y: -280}, // center image
      { x: -220, y: -300 },
      { x: 220, y: -200 },
      { x: -280, y: -100 },
      { x: 280, y: 0 },
      { x: -200, y: 100 },
      { x: 180, y: 180 },
      { x: 0, y: 280 },
    ];
  } else if (width <= 1024) {
    // Small desktop - moderate spread
    return [
      { x: 0, y: -260}, // center image
      { x: -300, y: -280 },
      { x: 300, y: -180 },
      { x: -380, y: -50 },
      { x: 380, y: 50 },
      { x: -250, y: 150 },
      { x: 220, y: 170 },
      { x: 0, y: 240 },
    ];
  } else {
    //This was my original implementation
    // Large desktop - original layout
    return [
      { x: 0, y: -250}, // center image
      { x: -350, y: -250 },
      { x: 350, y: -150 },
      { x: -480, y: 0 },
      { x: 480, y: 100 },
      { x: -300, y: 150 },
      { x: 250, y: 160 },
      { x: 0, y: 220 },
    ];
  }
}


function initHeroAnimation() {

  if (heroScrollTrigger) {
    heroScrollTrigger.kill();
    heroScrollTrigger = null;
  }

  const directions = getResponsiveDirections();

  // Reset all images initially
  for (let i = 1; i <= 8; i++) {
    const img = document.getElementById(`img${i}`);
    if (img) {
      const randomScale = Math.random() > 0.7 ? 0.7 : 0.6;
      gsap.set(img, {
        scale: i === 1 ? 1: randomScale,
        opacity: 0.7,
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

  const tl = gsap.timeline();

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

  heroScrollTrigger = ScrollTrigger.create({
    trigger: ".hero-section",
    start: "top top",
    end: "+=3500",
    scrub: true,
    pin: true,
    anticipatePin: 1,
    animation: tl
  });
}

initHeroAnimation();

let resizeTimeout;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    initAnimation();
  }, 250);
});

// Optional: Refresh ScrollTrigger when page is fully loaded
window.addEventListener('load', () => {
  ScrollTrigger.refresh();
});


//? - ?//
//swiper carousel effect/////
new Swiper(".mySwiper" , {
  effect: "coverflow",
  grabCursor: true,
  centeredSlides: true,
  slidesPerView: "auto",
  loop: true,
  coverflowEffect: {
    rotate: 30,
    stretch: 0,
    depth: 50,
    modifier: 0.5,
    slideShadows: true,
  },
  navigation: {
    nextEl: ".swiper-button-next",
    prevEl: ".swiper-button-prev",
  }
})