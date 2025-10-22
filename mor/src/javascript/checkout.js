
const checkoutManager = {
    deliveryFee: 0,
    isPickup: false,
    corderData: {},

    init(){
        this.loadOrderSummary();
        this.attachformHandler();
        this.attachDeliveryZoneHandler();
    },

    //load cart items into order summary
    loadOrderSummary(){
        const cart = cartManager.getCart();
        const orderItemsContainer = document.getElementById('orderItems');

        if (cart.length === 0){
            window.location.href = 'menu.html';
            return;
        }else{
            orderItemsContainer.innerHTML = cart.map(item => `
                <div class="order-item">
                    <img src="${item.image}" alt="${item.name}" class="order-item-image">
                    <div class="order-item-details">
                        <div class="order-item-name">${item.name}</div>
                        <div class="order-item-quantity">Quantity: ${item.quantity}</div>
                    </div>
                    <div class="order-item-price">KES ${(item.price * item.quantity).toFixed(2)}</div>
                </div> 
                `).join('');
            this.updateTotals();
        }
    },

    //handle delivery zone selection
    attachDeliveryZoneHandler(){
        const deliveryZoneSelect = document.getElementById('deliveryZone');
        const addressGroup = document.getElementById('addressGroup');
        const addressField = document.getElementById('address');

        deliveryZoneSelect.addEventListener('change', (e)=>{
            const selectedOption = e.target.options[e.target.selectedIndex];
            const fee = parseFloat(selectedOption.getAttribute('data-fee'));
            const isPickup = selectedOption.value.includes('pickup');

            this.deliveryFee = fee;
            this.isPickup = isPickup;

            if (isPickup){
                addressGroup.style.display = 'none';
                addressField.removeAttribute('required');
            }else{
                addressGroup.style.display = 'block';
                addressField.setAttribute('required', 'required');         
            }

            this.updateTotals();
        });

    },

    updateTotals(){
        const subtotal = parseFloat(cartManager.getTotal());
        const total  = subtotal + this.deliveryFee;

        document.getElementById('subtotal').textContent = `KES ${subtotal.toFixed(2)}`;

        //updating delivery fee label
        const deliveryFeeLabel = this.isPickup? 'FREE' : `KES ${this.deliveryFee.toFixed(2)}`;
        document.getElementById('deliveryFee').textContent = deliveryFeeLabel;

        document.getElementById('total').textContent = `KES ${total.toFixed(2)}`;

    },

    //handle form submission
    attachformHandler(){
        const form = document.getElementById('checkoutForm');

        form.addEventListener('submit', (e)=>{
            e.preventDefault();

            if (this.validateForm()){
                this.processOrder();
            }
        });
    },

    //validate form
    validateForm(){
        const phone = document.getElementById('phone').value;
        const phoneRegex = /^(07|01|)\d{8}$/;

        if (!phoneRegex.test(phone)){
            alert('Please enter a valid Kenyan phone number (07XX XXX XXX or 01XX XXX XXX)');
            return false;
        }

        const deliveryZone = document.getElementById('deliveryZone').value;
        if (!deliveryZone) {
            alert('Please select a delivery location');
            return false;
        }

        return true;
    },

    processOrder(){
        const submitBtn = document.getElementById('submitBtn');
        submitBtn.textContent = 'Processing...';
        submitBtn.disabled = true;

        const deliveryZoneSelect = document.getElementById('deliveryZone');
        const selectedZone = deliveryZoneSelect.options[deliveryZoneSelect.selectedIndex].text;

        //collect form data
        this.orderData = {
            orderNumber: this.generateOrderNumber(),
            customer: {
                name: document.getElementById('fullName').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
            },

            delivery: {
                zone: selectedZone,
                address: this.isPickup ? 'Pickup' : document.getElementById('address').value,
                isPickup: this.isPickup

            },
            notes: document.getElementById('notes').value,
            items: cartManager.getCart(),
            subtotal: parseFloat(cartManager.getTotal()),
            deliveryFee: this.deliveryFee,
            total: parseFloat(cartManager.getTotal()) + this.deliveryFee,
            timestamp: new Date().toISOString()
        };

        //store order data temporaroly
        localStorage.setItem('pendingOrder', JSON.stringify(this.orderData));

        //simulate payment processing (this is where pesapal will go)
        setTimeout(()=>{
            this.handlePaymentSuccess(this.orderData);
        }, 2000);

    },

    //handle successful payment
    handlePaymentSuccess(orderData){
        cartManager.clearCart();

        //show modal
        this.showConfirmationModal(orderData);
    },

    showConfirmationModal(orderData){
        document.getElementById('orderNumber').textContent = orderData.orderNumber;
        document.getElementById('customerEmail').textContent = orderData.customer.email;
        document.getElementById('customerPhone').textContent = orderData.customer.phone;

        const deliveryText = orderData.delivery.isPickup 
            ? 'We will call you shortly to confirm your pickup time.'
            : 'We will call you shortly to confirm your delivery date and time.';

        document.getElementById('deliveryDateDisplay').textContent = deliveryText;

        document.getElementById('confirmationModal').classList.add('active');
        document.getElementById('modalOverlay').classList.add('active');
    },

    //Generate order number
    generateOrderNumber(){
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1000);
        return `MOR${timestamp}${random}`.slice(0, 15);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    cartManager.init();
    checkoutManager.init();
});