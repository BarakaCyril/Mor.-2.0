const cartUI = {
    //initialize ui
    init(){
        this.cacheElements();
        this.attachEventListeners();
        this.updateCartUI();
    },

    //cache DOM elements
    cacheElements(){
        this.floatBtn = document.getElementById('cartFloatBtn');
        this.sidebar = document.getElementById('cartSidebar');
        this.overlay = document.getElementById('cartOverlay');
        this.closeBtn = document.getElementById('cartCloseBtn');
        this.cartItems = document.getElementById('cartItems');
        this.cartBadge = document.getElementById('cartBadge');
        this.cartTotalPrice = document.getElementById('cartTotalPrice');
        this.clearBtn = document.getElementById('cartClearBtn');
    },

    //atach event listeners
    attachEventListeners(){
        //open cart
        this.floatBtn.addEventListener('click', ()=>this.openCart());

        //close cart
        this.closeBtn.addEventListener('click', ()=>this.closeCart());
        this.overlay.addEventListener('click', ()=>this.closeCart());

        //clear cart
        this.clearBtn.addEventListener('click', ()=>this.clearCart());
    },

    openCart(){
        this.sidebar.classList.add('active');
        this.overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    },

    closeCart() {
        this.sidebar.classList.remove('active');
        this.overlay.classList.remove('active');
        document.body.style.overflow = '';
    },

    updateCartUI() {
        this.renderCartItems();
        this.updateBadge();
        this.updateTotal();
    },

    renderCartItems(){
        const cart = cartManager.getCart();

        if (cart.length === 0){
            this.cartItems.innerHTML = '<div class="cart-empty">Your cart is empty</div>';
            return;
        }else{
            this.cartItems.innerHTML = cart.map(item => `
                <div class="cart-item">
                    <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                    <div class="cart-item-details">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">ksh${item.price.toFixed(2)}</div>
                    <div class="cart-item-controls">
                        <button class="quantity-btn" onclick="cartUI.decreaseQuantity(${item.id})">-</button>
                        <span class="cart-item-quantity">${item.quantity}</span>
                        <button class="quantity-btn" onclick="cartUI.increaseQuantity(${item.id})">+</button>
                        <button class="remove-item-btn" onclick="cartUI.removeItem(${item.id})">Remove</button>
                    </div>
                    </div>
                </div>
                `).join('');
        }
    },

    updateBadge(){
        const count = cartManager.getItemCount();
        this.cartBadge.textContent = count;
        this.cartBadge.style.display = count > 0 ? 'flex' : 'none';
    },

    //update total price
    updateTotal(){
        this.cartTotalPrice.textContent = `ksh${cartManager.getTotal()}`
    },

    increaseQuantity(productId){
        const item = cartManager.getCart().find(i => i.id == productId);
        if (item) {
            cartManager.updateQuantity(productId, item.quantity + 1);
            this.updateCartUI();
        }
    },

    decreaseQuantity(productId){
        const item = cartManager.getCart().find(i => i.id == productId);
        if (item){
            cartManager.updateQuantity(productId, item.quantity - 1);
            this.updateCartUI();
        }
    },

    removeItem(productId){
        cartManager.removeItem(productId);
        this.updateCartUI();
    },

    clearCart(){
        if (confirm('Are you sure you want to clear your cart?')){
            cartManager.clearCart();
            this.updateCartUI();
        }
    }  
};

document.addEventListener('DOMContentLoaded', ()=>{
    cartUI.init();
});