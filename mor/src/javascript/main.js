gsap.registerPlugin(ScrollTrigger);

let heroScrollTrigger = null;
ScrollTrigger.normalizeScroll(true);

const mobileMenu = document.querySelector('.mobile-menu');

const logo = document.querySelector('.logo');

document.addEventListener("DOMContentLoaded", function(){



  const animElements = document.querySelectorAll(".animate");
  const observor = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        entry.target.classList.add('visible');
        obs.unobserve(entry.target); //Animate only once??
      }
    });
  },{
    threshold: 0.15
  });
  animElements.forEach(el => observor.observe(el));




  //Animate the stat numbers
  const statNumbers = document.querySelectorAll('.stat-number');
  const speed = 600;

  function animateCount(el) {
    const target = +el.getAttribute('data-target');
    let count = 0;
    const increment = Math.ceil(target / speed);

    function update() {
      count += increment;
      if (count < target) {
        el.childNodes[0].nodeValue = count;
        requestAnimationFrame(update);
      } else {
        el.childNodes[0].nodeValue = target;
      }
    }
    update();
  }

  //trigger when stats-section is in view
  let started = false;
  function onScroll() {
    const statsSection = document.querySelector('.stats-section');
    const rect = statsSection.getBoundingClientRect();
    if (!started && rect.top < window.innerHeight - 200) {
      statNumbers.forEach(animateCount);
      started = true;
      window.removeEventListener('scroll', onScroll);
    }
  }
  window.addEventListener('scroll', onScroll);
  onScroll();

});



function getResponsiveDirections() {
  const width = window.innerWidth;
  
  if (width <= 480) {
    
    // Mobile - mostly vertical layout
    return [
      { x: 0, y: -230}, // center image
      { x: -130, y: -150 },
      { x: 190, y: -10},
      { x: -170, y: -10 },
      { x: 150, y: -130 },
      { x: -150, y: 130 },
      { x: 120, y: 130 },
      { x: 0, y: 200 },
    ];
  } else if (width <= 768) {
    // Tablet - balanced vertical and horizontal
    return [
      { x: 0, y: -230}, // center image
      { x: -200, y: -250 },
      { x: 220, y: -210 },
      { x: -230, y: -100 },
      { x: 230, y: -30},
      { x: -200, y: 100 },
      { x: 180, y: 160 },
      { x: 0, y: 230 },
    ];
  } else if (width <= 1024) {
    // Small desktop - moderate spread
    return [
      { x: 20, y: -360}, // center image
      { x: -300, y: -280 },
      { x: 300, y: -180 },
      { x: -390, y: -50 },
      { x: 380, y: 50 },
      { x: -250, y: 150 },
      { x: 220, y: 170 },
      { x: 0, y: 340 },
    ];
  } else {
    // This was my original implementation
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

function getResponsiveScales() {
  const width = window.innerWidth;
  
  if (width <= 480) {
    // Mobile - much smaller scales
    return {
      centerInitial: 0.5,
      centerFinal: 0.5,
      centerTextFinal: 0.7,
      randomMin: 0.4,
      randomMax: 0.5
    };
  } else if (width <= 764) {
    // Tablet - smaller scales
    return {
      centerInitial: 0.7,
      centerFinal: 0.8,
      centerTextFinal: 0.8,
      randomMin: 0.5,
      randomMax: 0.6
    };
  } else if (width <= 1024) {
    // Small desktop - moderate scales
    return {
      centerInitial: 0.7,
      centerFinal: 1,
      centerTextFinal: 0.8,
      randomMin: 0.5,
      randomMax: 0.6
    };
  } else {
    // Large desktop - original scales
    return {
      centerInitial: 1.8,
      centerTextFinal: 1,
      centerFinal: 1,
      randomMin: 0.6,
      randomMax: 0.7
    };
  }
}

function initHeroAnimation() {

  if (heroScrollTrigger) {
    heroScrollTrigger.kill();
    heroScrollTrigger = null;
  }

  const directions = getResponsiveDirections();
  const scales = getResponsiveScales();


  // Reset all images initially
  for (let i = 1; i <= 8; i++) {
    const img = document.getElementById(`img${i}`);
    if (img) {
      const randomScale = Math.random() > 0.7 ? scales.randomMax : scales.randomMin;
      gsap.set(img, {
        scale: randomScale,
        opacity: 0.9,
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
      scale: scales.centerInitial,
      opacity: 1,
      x: 0,
      y: 0,
    });
  }

  gsap.set(".center-text", {
    opacity: 0,
    scale: 0.3
  });

  const tl = gsap.timeline();

  //first phase: All images bursting outwards at the same time

  const burstDuration = 0.9;
  const burstEase = "power2.out";

  // Animate surrounding images bursting outwards
  for (let i = 2; i <= 8; i++) {
    const img = document.getElementById(`img${i}`);
    if (!img) continue;
    const startScale = Number(img.dataset.randomScale) || scales.randomMin;
    tl.to(
      img,
      {
        x: directions[i - 1].x,
        y: directions[i - 1].y,
        scale: startScale,
        opacity: 1,
        duration: burstDuration,
        ease: burstEase
      },
      0 // All start at the same time
    );
  }

  // Center image grows
  tl.to(
    centerImg,{
      x: directions[0].x,
      y: directions[0].y,
      scale: scales.centerFinal,
      duration: burstDuration,
      ease: burstEase
    },0 //Starts at the same time as all the other images
  );

  // Fade in center text
  tl.to(
    ".center-text",
    {
      opacity: 1,
      scale: scales.centerTextFinal,
      duration: 0.6,
      ease: "power2.out",
    },
    burstDuration * 0.15
  );

  tl.set({}, {}, "+=0.2"); //Apparently a buffer that should help for smooth transition

  heroScrollTrigger = ScrollTrigger.create({
    trigger: ".hero-section",
    start: "top top",
    end: "+=1400",
    scrub: 1,
    pin: true,
    anticipatePin: 1,
    pinSpacing: true,
    animation: tl,

  });
}

initHeroAnimation();

let resizeTimeout;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    initHeroAnimation();
  }, 250);
});

// Optional: Refresh ScrollTrigger when page is fully loaded
window.addEventListener('load', () => {
  ScrollTrigger.refresh();
});

document.querySelectorAll('.faq-question').forEach((question) => {
    question.addEventListener('click', () => {
      const item = question.parentElement;
      item.classList.toggle('active');
    });
  });

// Animate in with GSAP
gsap.to(".faq-item", {
  opacity: 1,
  y: 0,
  duration: 0.6,
  stagger: 0.3,
  ease: "power2.out"
});

gsap.to(".update-card", {
  opacity: 1,
  y: 0,
  duration: 0.6,
  stagger: 0.3,
  ease: "power2.out"
});


gsap.to(".testimonial", {
  scrollTrigger: {
    trigger: ".testimonials-section",
    start: "top 60%"
  },
  opacity: 1,
  y: 0,
  x: 0,
  duration: 1,
  stagger: 0.4,
  ease: "power2.out"
});

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
    nextEl: ".custom-next",
    prevEl: ".custom-prev",
  }
})
