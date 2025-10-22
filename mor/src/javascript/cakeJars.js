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

