
const BACKEND_URL = window.location.hostname ===  'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:5000' : '/api';


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
    attachDeliveryZoneHandler() {
    const deliveryOptions = document.querySelectorAll('input[name="deliveryZone"]');
    const addressGroup = document.getElementById('addressGroup');
    const addressField = document.getElementById('address');

    deliveryOptions.forEach(option => {
        option.addEventListener('change', (e) => {
            const fee = parseFloat(e.target.getAttribute('data-fee'));
            const isPickup = e.target.value.includes('pickup');

            this.deliveryFee = fee;
            this.isPickup = isPickup;

            if (isPickup) {
                addressGroup.style.display = 'none';
                addressField.removeAttribute('required');
            } else {
                addressGroup.style.display = 'block';
                addressField.setAttribute('required', 'required');
            }

            this.updateTotals();
        });
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

        const deliveryZone = document.querySelector('input[name="deliveryZone"]:checked');
        if (!deliveryZone) {
            alert('Please select a delivery location');
            return false;
        }

        return true;
    },

    async processOrder(){
        const submitBtn = document.getElementById('submitBtn');
        submitBtn.textContent = 'Processing...';
        submitBtn.disabled = true;

        const selectedRadio = document.querySelector('input[name="deliveryZone"]:checked');
        const selectedZone = selectedRadio.nextElementSibling.querySelector('.option-name').textContent + ' - ' + 
                     selectedRadio.nextElementSibling.querySelector('.option-details').textContent;

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
        await this.initiatePesapalPayment(this.orderData);
    },

    async initiatePesapalPayment(orderData){
        try{
            //get auth token
            const tokenResponse = await fetch(`${BACKEND_URL}/pesapal/token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!tokenResponse.ok){
                throw new Error('Failed to get authentication token');
            }

            const tokenData = await tokenResponse.json();
            console.log('Token response data:', tokenData); // Log full response

            if (!tokenData.success || !tokenData.token) {
                throw new Error('Failed to get valid token from server');
            }
            
            const token = tokenData.token;
            console.log('Received token:', token);

            //register IPN URL first
            const ipnResponse = await fetch(`${BACKEND_URL}/pesapal/register-ipn`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    token: token,
                    ipn_url: `${window.location.origin}/pesapal/ipn-callback`
                })
            });
            const ipnData = await ipnResponse.json();
            if (!ipnData.success){
                throw new Error('Failed to register IPN URL');
            }

            //prepare order for pesapal
            const orderRef = orderData.orderNumber.replace(/[^a-zA-Z0-9]/g, '');
            console.log('Generated order reference:', orderRef);
            
            const pesapalOrder = {
                id: orderRef,  // Changed to 'id' as per Pesapal's API
                currency: "KES",
                amount: orderData.total,
                description: `Mor Cakes Order #${orderRef}`,
                callback_url: `${window.location.origin}/src/payment-callback.html`,
                notification_id: ipnData.ipn_id,
                billing_address: {
                    email_address: orderData.customer.email,
                    phone_number: orderData.customer.phone.replace(/\s/g, ''),//removes spaces
                    country_code: "KE",
                    first_name: orderData.customer.name.split(' ')[0],
                    middle_name: "",
                    last_name: orderData.customer.name.split(' ').slice(1).join(' ') || '-',
                    line_1: orderData.delivery.address,
                    line_2: "",
                    city: "Nairobi",
                    state: "Nairobi",
                    postal_code: "00100",
                    zip_code: "00100"
                }
            };

            //submit order to pesapal
            if (!token) {
                throw new Error('No valid token available for order submission');
            }

            const requestBody = {
                order: pesapalOrder,
                token: token
            };
            console.log('Full request body:', requestBody);

            const orderResponse = await fetch(`${BACKEND_URL}/pesapal/submit-order`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    order: pesapalOrder,
                    token: token
                })
            });

            if (!orderResponse.ok){
                const errorData = await orderResponse.text();
                console.error('Server response:', errorData);
                throw new Error(`Failed to submit order to payment gateway: ${errorData}`);
            }

            const orderResult = await orderResponse.json();
            console.log('Order submission response:', orderResult);

            if (!orderResult.success || !orderResult.redirect_url){
                throw new Error(`Invalid payment gateway response: ${JSON.stringify(orderResult)}`);
            }

            //redirect to pesapal payment page
            window.location.href = orderResult.redirect_url;

        }catch(error){
            console.error('Payment initiation failed:', error);
            alert('Payment initiation failed: ' + error.message + 'Please try again.');

            //re-enable submit button
            const submitBtn = document.getElementById('submitBtn');
            submitBtn.disabled = false;
        }


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
        // Generate UUID v4
        const uuid = crypto.randomUUID();
        // Take first 8 characters of UUID and combine with prefix
        return `MOR-${uuid.slice(0,8)}`.toUpperCase();
    }
};

document.addEventListener('DOMContentLoaded', () => {
    cartManager.init();
    checkoutManager.init();
});