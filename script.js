// Firebase Configuration
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getDatabase, ref, push, set, onValue, remove, get, child } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyBJ9mLHHQxnJKtixZrOYy_Vtf-TuwED2dE",
  authDomain: "trustsell-78c18.firebaseapp.com",
  databaseURL: "https://trustsell-78c18-default-rtdb.firebaseio.com",
  projectId: "trustsell-78c18",
  storageBucket: "trustsell-78c18.firebasestorage.app",
  messagingSenderId: "909095926042",
  appId: "1:909095926042:web:3c6eee4f055d21fda794a3",
  measurementId: "G-4V0DBSRYKW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const productsRef = ref(db, 'products');
const ordersRef = ref(db, 'orders');

// Cart Management
class Cart {
    constructor() {
        this.items = JSON.parse(localStorage.getItem('soloWearCart')) || [];
        this.updateCartCount();
    }

    addItem(product, size = 'M', quantity = 1) {
        const existingItem = this.items.find(item => 
            item.id === product.id && item.size === size
        );

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.items.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                size: size,
                quantity: quantity
            });
        }

        this.saveCart();
        this.updateCartCount();
        this.showNotification('Product added to cart!');
    }

    removeItem(index) {
        this.items.splice(index, 1);
        this.saveCart();
        this.updateCartCount();
    }

    updateQuantity(index, quantity) {
        if (quantity < 1) {
            this.removeItem(index);
            return;
        }
        this.items[index].quantity = quantity;
        this.saveCart();
        this.updateCartCount();
    }

    clearCart() {
        this.items = [];
        this.saveCart();
        this.updateCartCount();
    }

    getTotal() {
        return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    getItemCount() {
        return this.items.reduce((count, item) => count + item.quantity, 0);
    }

    saveCart() {
        localStorage.setItem('soloWearCart', JSON.stringify(this.items));
    }

    updateCartCount() {
        const countElements = document.querySelectorAll('.cart-count');
        const totalItems = this.getItemCount();
        countElements.forEach(el => {
            el.textContent = totalItems;
            el.style.display = totalItems > 0 ? 'flex' : 'none';
        });
    }

    showNotification(message) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
        `;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 30px;
            background: var(--gold);
            color: var(--black);
            padding: 15px 25px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            gap: 10px;
            z-index: 9999;
            box-shadow: 0 4px 20px rgba(0,0,0,0.2);
            animation: slideIn 0.3s ease, fadeOut 0.3s ease 2.7s;
        `;
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Initialize cart
const cart = new Cart();

// Product Management
class ProductManager {
    constructor() {
        this.products = [];
    }

    async fetchProducts() {
        return new Promise((resolve) => {
            onValue(productsRef, (snapshot) => {
                const data = snapshot.val();
                this.products = data ? Object.entries(data).map(([id, product]) => ({ id, ...product })) : [];
                resolve(this.products);
            });
        });
    }

    async addProduct(productData) {
        const newProductRef = push(productsRef);
        await set(newProductRef, productData);
        return newProductRef.key;
    }

    async deleteProduct(productId) {
        const productRef = ref(db, `products/${productId}`);
        await remove(productRef);
    }

    getProductById(id) {
        return this.products.find(product => product.id === id);
    }

    renderProducts(containerId, limit = null) {
        const container = document.getElementById(containerId);
        if (!container) return;

        let productsToShow = this.products;
        if (limit) {
            productsToShow = this.products.slice(0, limit);
        }

        if (productsToShow.length === 0) {
            container.innerHTML = '<div class="empty-state">No products available</div>';
            return;
        }

        container.innerHTML = productsToShow.map(product => `
            <div class="product-card">
                <div class="product-image">
                    <img src="${product.image}" 
                         alt="${product.name} - Solo Wear Premium T-Shirt" 
                         class="product-img">
                </div>
                <div class="product-info">
                    <h3 class="product-title">${product.name}</h3>
                    <div class="product-price">
                        <span class="price">PKR ${product.price.toLocaleString()}</span>
                        ${product.originalPrice ? 
                            `<span class="original-price">PKR ${product.originalPrice.toLocaleString()}</span>
                             <span class="discount">-${Math.round((1 - product.price/product.originalPrice) * 100)}%</span>` 
                            : ''}
                    </div>
                    <p class="product-description">${product.description.substring(0, 80)}...</p>
                    <div class="product-actions">
                        <a href="product.html?id=${product.id}" class="btn btn-outline">View Details</a>
                        <button class="btn btn-gold add-to-cart-btn" data-id="${product.id}">
                            <i class="fas fa-shopping-bag"></i> Add to Cart
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

        // Add event listeners to add-to-cart buttons
        container.querySelectorAll('.add-to-cart-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const productId = e.target.closest('.add-to-cart-btn').dataset.id;
                const product = this.getProductById(productId);
                if (product) {
                    cart.addItem(product);
                }
            });
        });
    }

    renderAdminProducts() {
        const tbody = document.getElementById('products-table-body');
        if (!tbody) return;

        tbody.innerHTML = this.products.map(product => `
            <tr>
                <td><img src="${product.image}" alt="${product.name}" class="admin-product-image"></td>
                <td>${product.name}</td>
                <td>PKR ${product.price.toLocaleString()}</td>
                <td>${product.category || 'Premium'}</td>
                <td>
                    <button class="delete-btn" data-id="${product.id}">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </td>
            </tr>
        `).join('');

        // Add event listeners to delete buttons
        tbody.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', async (e) => {
                const productId = e.target.closest('.delete-btn').dataset.id;
                if (confirm('Are you sure you want to delete this product?')) {
                    await this.deleteProduct(productId);
                    this.renderAdminProducts();
                }
            });
        });

        // Update stats
        document.getElementById('total-products').textContent = this.products.length;
    }
}

// Order Management
class OrderManager {
    async placeOrder(orderData) {
        const newOrderRef = push(ordersRef);
        await set(newOrderRef, {
            ...orderData,
            orderDate: new Date().toISOString(),
            status: 'pending'
        });
        return newOrderRef.key;
    }

    async fetchOrders() {
        return new Promise((resolve) => {
            onValue(ordersRef, (snapshot) => {
                const data = snapshot.val();
                const orders = data ? Object.entries(data).map(([id, order]) => ({ id, ...order })) : [];
                resolve(orders);
            });
        });
    }

    renderAdminOrders(orders) {
        const tbody = document.getElementById('orders-table-body');
        if (!tbody) return;

        tbody.innerHTML = orders.map(order => `
            <tr>
                <td>${order.id.substring(0, 8)}</td>
                <td>${order.customerName}</td>
                <td>PKR ${order.totalAmount.toLocaleString()}</td>
                <td><span class="status-badge ${order.status}">${order.status}</span></td>
                <td>${new Date(order.orderDate).toLocaleDateString()}</td>
                <td>
                    <button class="btn btn-outline view-order-btn" data-id="${order.id}">
                        View
                    </button>
                </td>
            </tr>
        `).join('');

        // Update stats
        document.getElementById('total-orders').textContent = orders.length;
        document.getElementById('today-orders').textContent = orders.filter(order => 
            new Date(order.orderDate).toDateString() === new Date().toDateString()
        ).length;
        
        // Calculate analytics
        const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
        const avgOrder = orders.length > 0 ? Math.round(totalRevenue / orders.length) : 0;
        
        document.getElementById('total-revenue').textContent = totalRevenue.toLocaleString();
        document.getElementById('avg-order').textContent = avgOrder.toLocaleString();
    }
}

// Initialize managers
const productManager = new ProductManager();
const orderManager = new OrderManager();

// Page-Specific Initialization
document.addEventListener('DOMContentLoaded', async () => {
    // Load products
    await productManager.fetchProducts();

    // Update cart count on all pages
    cart.updateCartCount();

    // Initialize based on current page
    const path = window.location.pathname;
    const page = path.split('/').pop();

    switch(page) {
        case 'index.html':
        case '':
            initializeHomePage();
            break;
        case 'shop.html':
            initializeShopPage();
            break;
        case 'product.html':
            initializeProductPage();
            break;
        case 'cart.html':
            initializeCartPage();
            break;
        case 'checkout.html':
            initializeCheckoutPage();
            break;
        case 'admin.html':
            initializeAdminPage();
            break;
        case 'about.html':
            // About page doesn't need special initialization
            break;
    }

    // Common initializations
    initializeCommonFeatures();
});

function initializeHomePage() {
    // Load new arrivals
    productManager.renderProducts('new-arrivals-grid', 4);

    // Mobile menu toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }
}

function initializeShopPage() {
    productManager.renderProducts('products-grid');

    // Filter functionality
    const filterBtns = document.querySelectorAll('.filter-btn');
    const sortSelect = document.getElementById('sort');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            // Filter logic would go here
        });
    });

    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            // Sort logic would go here
            console.log('Sort by:', e.target.value);
        });
    }
}

function initializeProductPage() {
    // Get product ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    
    if (productId) {
        const product = productManager.getProductById(productId);
        if (product) {
            // Update product details
            document.getElementById('product-title').textContent = product.name;
            document.getElementById('product-price').textContent = `PKR ${product.price.toLocaleString()}`;
            document.getElementById('product-description').textContent = product.description;
            document.getElementById('product-image').src = product.image;
            document.getElementById('product-image').alt = `${product.name} - Solo Wear Premium T-Shirt`;

            // Size selector
            const sizeOptions = document.querySelectorAll('.size-option');
            sizeOptions.forEach(option => {
                option.addEventListener('click', () => {
                    sizeOptions.forEach(opt => opt.classList.remove('active'));
                    option.classList.add('active');
                });
            });

            // Quantity selector
            const minusBtn = document.querySelector('.qty-btn.minus');
            const plusBtn = document.querySelector('.qty-btn.plus');
            const quantityInput = document.getElementById('quantity');

            minusBtn?.addEventListener('click', () => {
                const currentValue = parseInt(quantityInput.value);
                if (currentValue > 1) {
                    quantityInput.value = currentValue - 1;
                }
            });

            plusBtn?.addEventListener('click', () => {
                const currentValue = parseInt(quantityInput.value);
                if (currentValue < 10) {
                    quantityInput.value = currentValue + 1;
                }
            });

            // Add to cart button
            const addToCartBtn = document.getElementById('add-to-cart');
            addToCartBtn?.addEventListener('click', () => {
                const size = document.querySelector('.size-option.active')?.dataset.size || 'M';
                const quantity = parseInt(quantityInput.value);
                cart.addItem(product, size, quantity);
            });

            // Tab functionality
            const tabBtns = document.querySelectorAll('.tab-btn');
            const tabContents = document.querySelectorAll('.tab-content');

            tabBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    const tabId = btn.dataset.tab;
                    
                    // Update active tab button
                    tabBtns.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    
                    // Show active tab content
                    tabContents.forEach(content => {
                        content.classList.remove('active');
                        if (content.id === tabId) {
                            content.classList.add('active');
                        }
                    });
                });
            });
        } else {
            // Product not found
            document.querySelector('.product-detail').innerHTML = `
                <div class="empty-state">
                    <h2>Product Not Found</h2>
                    <p>The requested product is not available.</p>
                    <a href="shop.html" class="btn btn-gold">Browse Collection</a>
                </div>
            `;
        }
    }
}

function initializeCartPage() {
    function renderCartItems() {
        const cartList = document.getElementById('cart-list');
        const emptyCart = document.getElementById('empty-cart');
        const itemCount = document.getElementById('item-count');
        const subtotal = document.getElementById('subtotal');
        const total = document.getElementById('total');
        const checkoutBtn = document.getElementById('checkout-btn');

        if (cart.items.length === 0) {
            cartList.innerHTML = '';
            emptyCart.style.display = 'block';
            checkoutBtn.disabled = true;
            checkoutBtn.style.opacity = '0.5';
            return;
        }

        emptyCart.style.display = 'none';
        checkoutBtn.disabled = false;
        checkoutBtn.style.opacity = '1';

        cartList.innerHTML = cart.items.map((item, index) => `
            <div class="cart-item" data-index="${index}">
                <div class="cart-item-image">
                    <img src="${item.image}" alt="${item.name} - Size ${item.size}" class="cart-item-img">
                </div>
                <div class="cart-item-details">
                    <h3>${item.name}</h3>
                    <p class="cart-item-price">PKR ${item.price.toLocaleString()}</p>
                    <p class="cart-item-size">Size: ${item.size}</p>
                </div>
                <div class="cart-item-controls">
                    <div class="quantity-control">
                        <button class="qty-btn minus" data-index="${index}">
                            <i class="fas fa-minus"></i>
                        </button>
                        <input type="number" class="qty-input" value="${item.quantity}" min="1" max="10" data-index="${index}">
                        <button class="qty-btn plus" data-index="${index}">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                    <button class="remove-item" data-index="${index}">
                        <i class="fas fa-trash"></i> Remove
                    </button>
                </div>
            </div>
        `).join('');

        // Update totals
        const cartTotal = cart.getTotal();
        const shipping = cartTotal > 5000 ? 0 : 200;
        const finalTotal = cartTotal + shipping;

        itemCount.textContent = cart.getItemCount();
        subtotal.textContent = `PKR ${cartTotal.toLocaleString()}`;
        document.getElementById('shipping').textContent = shipping === 0 ? 'FREE' : `PKR ${shipping}`;
        total.textContent = `PKR ${finalTotal.toLocaleString()}`;

        // Add event listeners
        cartList.querySelectorAll('.qty-btn.minus').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.closest('.qty-btn').dataset.index);
                const currentQty = cart.items[index].quantity;
                cart.updateQuantity(index, currentQty - 1);
                renderCartItems();
            });
        });

        cartList.querySelectorAll('.qty-btn.plus').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.closest('.qty-btn').dataset.index);
                const currentQty = cart.items[index].quantity;
                cart.updateQuantity(index, currentQty + 1);
                renderCartItems();
            });
        });

        cartList.querySelectorAll('.qty-input').forEach(input => {
            input.addEventListener('change', (e) => {
                const index = parseInt(e.target.dataset.index);
                const newQty = parseInt(e.target.value);
                if (newQty >= 1 && newQty <= 10) {
                    cart.updateQuantity(index, newQty);
                    renderCartItems();
                }
            });
        });

        cartList.querySelectorAll('.remove-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.closest('.remove-item').dataset.index);
                cart.removeItem(index);
                renderCartItems();
            });
        });
    }

    // Clear cart button
    document.getElementById('clear-cart')?.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear your cart?')) {
            cart.clearCart();
            renderCartItems();
        }
    });

    // Coupon functionality
    document.getElementById('apply-coupon')?.addEventListener('click', () => {
        const couponCode = document.getElementById('coupon-code').value;
        // Coupon validation logic would go here
        alert('Coupon functionality will be implemented');
    });

    // Initial render
    renderCartItems();
}

function initializeCheckoutPage() {
    function renderCheckoutItems() {
        const checkoutItems = document.getElementById('checkout-items');
        const subtotal = document.getElementById('checkout-subtotal');
        const shipping = document.getElementById('checkout-shipping');
        const total = document.getElementById('checkout-total');
        const paymentAmount = document.getElementById('payment-amount');

        if (cart.items.length === 0) {
            window.location.href = 'cart.html';
            return;
        }

        checkoutItems.innerHTML = cart.items.map(item => `
            <div class="summary-item">
                <span>${item.name} (${item.size}) x ${item.quantity}</span>
                <span>PKR ${(item.price * item.quantity).toLocaleString()}</span>
            </div>
        `).join('');

        const cartTotal = cart.getTotal();
        const shippingCost = cartTotal > 5000 ? 0 : 200;
        const finalTotal = cartTotal + shippingCost;

        subtotal.textContent = `PKR ${cartTotal.toLocaleString()}`;
        shipping.textContent = shippingCost === 0 ? 'FREE' : `PKR ${shippingCost}`;
        total.textContent = `PKR ${finalTotal.toLocaleString()}`;
        paymentAmount.textContent = `PKR ${finalTotal.toLocaleString()}`;
    }

    // Payment method switching
    const paymentOptions = document.querySelectorAll('input[name="payment"]');
    const easypaisaDetails = document.getElementById('easypaisa-details');

    paymentOptions.forEach(option => {
        option.addEventListener('change', (e) => {
            if (e.target.value === 'easypaisa') {
                easypaisaDetails.style.display = 'block';
            } else {
                easypaisaDetails.style.display = 'none';
            }
        });
    });

    // Form submission
    document.getElementById('order-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (cart.items.length === 0) {
            alert('Your cart is empty!');
            return;
        }

        const orderData = {
            customerName: document.getElementById('full-name').value,
            phone: document.getElementById('phone').value,
            email: document.getElementById('email').value || '',
            city: document.getElementById('city').value,
            address: document.getElementById('address').value,
            deliveryNotes: document.getElementById('delivery-notes').value || '',
            paymentMethod: document.querySelector('input[name="payment"]:checked').value,
            transactionId: document.getElementById('transaction-id')?.value || '',
            items: cart.items,
            subtotal: cart.getTotal(),
            shipping: cart.getTotal() > 5000 ? 0 : 200,
            totalAmount: cart.getTotal() + (cart.getTotal() > 5000 ? 0 : 200),
            orderDate: new Date().toISOString(),
            status: 'pending'
        };

        try {
            const orderId = await orderManager.placeOrder(orderData);
            
            // Clear cart after successful order
            cart.clearCart();
            
            // Show success message
            alert(`Order placed successfully! Your Order ID is: ${orderId}\nWe will contact you shortly for confirmation.`);
            
            // Redirect to home page
            window.location.href = 'index.html';
        } catch (error) {
            console.error('Error placing order:', error);
            alert('There was an error placing your order. Please try again.');
        }
    });

    // Initial render
    renderCheckoutItems();
}

function initializeAdminPage() {
    // Login functionality
    const loginScreen = document.getElementById('login-screen');
    const adminPanel = document.getElementById('admin-panel');
    const loginBtn = document.getElementById('login-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const pinInput = document.getElementById('pin');

    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            const pin = pinInput.value;
            if (pin === '4047') {
                loginScreen.style.display = 'none';
                adminPanel.style.display = 'block';
                loadAdminData();
            } else {
                alert('Incorrect PIN! Hint: The PIN is 4047');
                pinInput.value = '';
                pinInput.focus();
            }
        });

        // Allow pressing Enter to login
        pinInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                loginBtn.click();
            }
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            adminPanel.style.display = 'none';
            loginScreen.style.display = 'block';
            pinInput.value = '';
        });
    }

    // Product form functionality
    const addProductBtn = document.getElementById('add-product-btn');
    const productForm = document.getElementById('product-form');
    const cancelFormBtn = document.getElementById('cancel-form');
    const newProductForm = document.getElementById('new-product-form');

    if (addProductBtn) {
        addProductBtn.addEventListener('click', () => {
            productForm.style.display = 'block';
        });
    }

    if (cancelFormBtn) {
        cancelFormBtn.addEventListener('click', () => {
            productForm.style.display = 'none';
            newProductForm.reset();
        });
    }

    if (newProductForm) {
        newProductForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const productData = {
                name: document.getElementById('product-name').value,
                price: parseInt(document.getElementById('product-price').value),
                image: document.getElementById('product-image').value,
                category: document.getElementById('product-category').value,
                description: document.getElementById('product-description').value,
                createdAt: new Date().toISOString()
            };

            try {
                await productManager.addProduct(productData);
                alert('Product added successfully!');
                productForm.style.display = 'none';
                newProductForm.reset();
                await productManager.fetchProducts();
                productManager.renderAdminProducts();
            } catch (error) {
                console.error('Error adding product:', error);
                alert('Error adding product. Please try again.');
            }
        });
    }

    async function loadAdminData() {
        // Load products
        productManager.renderAdminProducts();

        // Load orders
        const orders = await orderManager.fetchOrders();
        orderManager.renderAdminOrders(orders);
    }
}

function initializeCommonFeatures() {
    // Mobile menu toggle (redundant but safe)
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.nav-menu') && !e.target.closest('.menu-toggle')) {
                navMenu.classList.remove('active');
            }
        });
    }

    // Close menu when clicking on a link
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
        });
    });

    // Add styles for notifications
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes fadeOut {
                from { opacity: 1; }
                to { opacity: 0; }
            }
            .status-badge {
                padding: 5px 10px;
                border-radius: 20px;
                font-size: 0.8rem;
                font-weight: 600;
            }
            .status-badge.pending { background: #ff9800; color: #000; }
            .status-badge.processing { background: #2196F3; color: #fff; }
            .status-badge.completed { background: #4CAF50; color: #fff; }
            .status-badge.cancelled { background: #f44336; color: #fff; }
        `;
        document.head.appendChild(style);
    }
}

// Export for use in HTML files
window.cart = cart;
window.productManager = productManager;
window.orderManager = orderManager;
