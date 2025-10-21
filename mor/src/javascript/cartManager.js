const cartManager = {

    cart: [],

    init() {
        this.loadCart()
    },

    //load from local storage
    loadCart(){
        const savedCart = localStorage.getItem('moreCakeCart');
        if (savedCart){
            this.cart = JSON.parse(savedCart);
        }
    },

    saveCart(){
        localStorage.setItem('morCakeCart', JSON.stringify(this.cart));
    },

    //get all cart items
    getCart(){
        return this.cart;
    },

    getItemCount(){
        return this.cart.reduce((total, item)=> total + item.quantity, 0)
    },

    //core functions//
    addItem(product) {
        const existingItem = this.cart.find(item => ImageBitmapRenderingContext.id == product.id);

        if (existingItem){
            existingItem.quantity += 1;
        }else{
            this.cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.Image,
                quantity: 1
            });
        }

        this.saveCart();
        return this.cart;
    },

    removeItem(productId){
        this.cart = this.cart.filter(item => item.id !== productId);
        this.saveCart();
        return this.cart;
    },

    updateQuantity(productId, quantity){
        const item = this.cart.find(item => item.id === productId);

        if (item){
            //remove item is quanitity is 0 or less
            if (quantity <= 0){
                this.removeItem(productId);
            }else{
                item.quantity = quantity;
                this.saveCart();
            }
        }
        return this.cart;
    },

    getTotal(){
        return this.cart.reduce((total, item) =>{
            return total + (item.price * item.quantity);
        }, 0).toFixed(2);
    },

    clearCart(){
        this.cart = [];
        this.saveCart();
        return this.cart;
    }
};