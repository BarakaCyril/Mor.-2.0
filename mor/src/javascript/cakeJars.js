gsap.registerPlugin(ScrollTrigger);
const cards = document.querySelectorAll('.philosophy-card');

document.addEventListener('DOMContentLoaded', () => {
  const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');

  localStorage.setItem('test', 'hello');
  console.log(localStorage.getItem('test'))

  addToCartButtons.forEach(button=>{
    button.addEventListener('click', (e)=>{
      //get the parent jar info div
      const jarInfo = e.target.closest('.jar-info');
      //product data from the data attributes

      const product = {
        id: parseInt(jarInfo.dataset.productId),
        name: jarInfo.dataset.productName,
        price: parseFloat(jarInfo.dataset.productPrice),
        image: jarInfo.dataset.productImage
      };

      //add to cart
      cartManager.addItem(product);
      cartUI.updateCartUI();
      //show feedback
      showFeedback(button);
    });
  });
});

function showFeedback(button){
  const originalText = button.textContent;
  button.textContent = '✓ ADDED!';
  button.style.background = '#4CAF50';

  setTimeout(() => {
    button.textContent = originalText;
    button.style.background = '';
  }, 1500);
}


cards.forEach((card) => {
    const isLayoutRight = card.classList.contains('layout-right');
    
    const image = card.querySelector('.image-box');
    const textBox = card.querySelector('.text-box');
    const textContent = card.querySelectorAll('.text-box h3, .text-box p');

    // Create a Timeline for right cars
    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: card,
            start: "top 75%", // Animation starts when top of card hits 75% down viewport
            toggleActions: "play none none reverse" // Reverses when scrolling back up
        }
    });


    // We want the text content hidden initially
    gsap.set(textContent, { autoAlpha: 0, y: 20 });
    gsap.set(textBox, { autoAlpha: 0, scale: 0.45 });


    tl
    // Step A: Image slides into place & Background appears
    .fromTo(image, 
        { 
            // If layout is right, start from LEFT (-15% x). 
            // If layout is left, start from RIGHT (15% x).
            xPercent: isLayoutRight ? -50 : 50, 
            opacity: 0 
        },
        { 
            xPercent: 0, 
            opacity: 1, 
            duration: 1, 
            ease: "power3.out" 
        }
    )
    .to(textBox, { 
        autoAlpha: 1, 
        scale: 1, 
        duration: 0.8,
        ease: "power2.out"
    }, "<0.2") // Start 0.2s after image starts moving

    //text appears last
    .to(textContent, {
        autoAlpha: 1,
        y: 0,
        duration: 0.5,
        stagger: 0.1
    }, "-=0.3"); // Overlap slightly with the end of background animation
});
