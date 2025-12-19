// Firebase Configuration
import { initializeApp } from "firebase/app";
import { getDatabase, ref, push, set, onValue, remove, child, get, update } from "firebase/database";

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

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Export db and functions
export { db, ref, push, set, onValue, remove, child, get, update };

// Cart Management
let cart = JSON.parse(localStorage.getItem('soloWearCart')) || [];

// DOM Elements
const cartCountElements = document.querySelectorAll('.cart-count');
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

// Mobile Navigation
if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Close menu when clicking on a link
    document.querySelectorAll('.nav-link').forEach(n => n.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    }));
}

// Update Cart Count
function updateCartCount() {
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    cartCountElements.forEach(element => {
        element.textContent = count;
    });
}

// Initialize cart count
updateCartCount();

// Product Loading Functions
function loadProducts(containerId, limit = null) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const productsRef = ref(db, 'products');
    
    onValue(productsRef, (snapshot) => {
        const data = snapshot.val();
        container.innerHTML = '';
        
        if (!data) {
            container.innerHTML = '<div class="empty-state"><p>No products available</p></div>';
            return;
        }
        
        let products = Object.entries(data).map(([id, product]) => ({
            id,
            ...product
        }));
        
        // Apply limit if specified
        if (limit) {
            products = products.slice(0, limit);
        }
        
        products.forEach(product => {
            const productCard = createProductCard(product);
            container.appendChild(productCard);
        });
    });
}

function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
        <div class="product-image">
            <div style="width: 100%; height: 100%; background: linear-gradient(135deg, #4338ca, #c026d3); display: flex; align-items: center; justify-content: center; color: white; font-size: 3rem;">
                <i class="fas fa-tshirt"></i>
            </div>
        </div>
        <div class="product-info">
            <h3 class="product-title">${product.name}</h3>
            <div class="product-price">PKR ${product.price}</div>
            <p>${product.description || 'Premium quality t-shirt'}</p>
            <div class="product-actions">
                <button class="btn btn-primary view-product" data-id="${product.id}">
                    <i class="fas fa-eye"></i> View Details
                </button>
                <button class="btn btn-secondary add-to-cart" data-id="${product.id}">
                    <i class="fas fa-shopping-cart"></i> Add to Cart
                </button>
            </div>
        </div>
    `;
    
    // Add event listeners
    card.querySelector('.view-product').addEventListener('click', () => {
        window.location.href = `product.html?id=${product.id}`;
    });
    
    card.querySelector('.add-to-cart').addEventListener('click', () => {
        addToCart(product.id, product.name, product.price, 1);
    });
    
    return card;
}

// Cart Functions
function addToCart(productId, name, price, quantity = 1) {
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            id: productId,
            name,
            price,
            quantity
        });
    }
    
    localStorage.setItem('soloWearCart', JSON.stringify(cart));
    updateCartCount();
    
    // Show notification
    showNotification(`${name} added to cart!`);
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem('soloWearCart', JSON.stringify(cart));
    updateCartCount();
    if (typeof renderCartItems === 'function') {
        renderCartItems();
    }
}

function updateCartQuantity(productId, newQuantity) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity = Math.max(1, newQuantity);
        localStorage.setItem('soloWearCart', JSON.stringify(cart));
        updateCartCount();
        if (typeof renderCartItems === 'function') {
            renderCartItems();
        }
    }
}

function clearCart() {
    cart = [];
    localStorage.setItem('soloWearCart', JSON.stringify(cart));
    updateCartCount();
    if (typeof renderCartItems === 'function') {
        renderCartItems();
    }
}

// Cart Page Functions
function renderCartItems() {
    const container = document.getElementById('cartItems');
    const itemCount = document.getElementById('cartItemCount');
    const subtotalEl = document.getElementById('cartSubtotal');
    const totalEl = document.getElementById('cartTotal');
    
    if (!container) return;
    
    if (cart.length === 0) {
        container.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart"></i>
                <h3>Your cart is empty</h3>
                <p>Add some products to your cart to see them here.</p>
                <a href="shop.html" class="btn btn-primary">Continue Shopping</a>
            </div>
        `;
        itemCount.textContent = '0';
        subtotalEl.textContent = 'PKR 0';
        totalEl.textContent = 'PKR 0';
        return;
    }
    
    let subtotal = 0;
    let html = '';
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        
        html += `
            <div class="cart-item" data-id="${item.id}">
                <div class="cart-item-product">
                    <div class="cart-item-image"></div>
                    <div class="cart-item-details">
                        <h4>${item.name}</h4>
                        <p>Size: M</p>
                    </div>
                </div>
                <div class="cart-item-price">PKR ${item.price}</div>
                <div class="cart-item-quantity">
                    <div class="quantity-control">
                        <button class="quantity-btn minus">-</button>
                        <input type="number" class="quantity-input" value="${item.quantity}" min="1" max="10">
                        <button class="quantity-btn plus">+</button>
                    </div>
                </div>
                <div class="cart-item-total">PKR ${itemTotal}</div>
                <div class="cart-item-actions">
                    <button class="remove-item">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
    itemCount.textContent = cart.length;
    
    const shipping = 200;
    const total = subtotal + shipping;
    
    subtotalEl.textContent = `PKR ${subtotal}`;
    totalEl.textContent = `PKR ${total}`;
    
    // Add event listeners
    container.querySelectorAll('.quantity-btn.minus').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const itemId = e.target.closest('.cart-item').dataset.id;
            const item = cart.find(item => item.id === itemId);
            if (item && item.quantity > 1) {
                updateCartQuantity(itemId, item.quantity - 1);
            }
        });
    });
    
    container.querySelectorAll('.quantity-btn.plus').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const itemId = e.target.closest('.cart-item').dataset.id;
            const item = cart.find(item => item.id === itemId);
            if (item) {
                updateCartQuantity(itemId, item.quantity + 1);
            }
        });
    });
    
    container.querySelectorAll('.quantity-input').forEach(input => {
        input.addEventListener('change', (e) => {
            const itemId = e.target.closest('.cart-item').dataset.id;
            const newQuantity = parseInt(e.target.value);
            if (!isNaN(newQuantity) && newQuantity >= 1 && newQuantity <= 10) {
                updateCartQuantity(itemId, newQuantity);
            }
        });
    });
    
    container.querySelectorAll('.remove-item').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const itemId = e.target.closest('.cart-item').dataset.id;
            removeFromCart(itemId);
        });
    });
}

// Product Detail Page Functions
function loadProductDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    
    if (!productId) {
        window.location.href = 'shop.html';
        return;
    }
    
    const productRef = ref(db, `products/${productId}`);
    
    onValue(productRef, (snapshot) => {
        const product = snapshot.val();
        
        if (!product) {
            window.location.href = 'shop.html';
            return;
        }
        
        // Update page title and meta tags
        document.title = `${product.name} - Solo Wear`;
        document.querySelector('meta[name="description"]').content = product.description || 'Premium t-shirt from Solo Wear';
        
        // Update breadcrumb
        const breadcrumb = document.getElementById('productNameBreadcrumb');
        if (breadcrumb) breadcrumb.textContent = product.name;
        
        // Update product details
        const title = document.getElementById('productTitle');
        const price = document.getElementById('productPrice');
        const description = document.getElementById('productDescription');
        
        if (title) title.textContent = product.name;
        if (price) price.textContent = `PKR ${product.price}`;
        if (description) description.textContent = product.description || 'Premium quality t-shirt with vibrant design.';
        
        // Update schema markup
        const schema = document.getElementById('productSchema');
        if (schema) {
            const schemaData = {
                "@context": "https://schema.org/",
                "@type": "Product",
                "name": product.name,
                "description": product.description || "Premium t-shirt",
                "brand": {
                    "@type": "Brand",
                    "name": "Solo Wear"
                },
                "offers": {
                    "@type": "Offer",
                    "priceCurrency": "PKR",
                    "price": product.price,
                    "availability": "https://schema.org/InStock"
                }
            };
            schema.textContent = JSON.stringify(schemaData);
        }
        
        // Add to cart button
        const addToCartBtn = document.querySelector('.add-to-cart-btn');
        if (addToCartBtn) {
            addToCartBtn.addEventListener('click', () => {
                const quantity = parseInt(document.querySelector('.quantity-input').value);
                const size = document.querySelector('.size-option.active')?.dataset.size || 'M';
                addToCart(productId, product.name, product.price, quantity);
            });
        }
        
        // Size selector
        document.querySelectorAll('.size-option').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.size-option').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });
        
        // Quantity selector
        document.querySelector('.quantity-btn.minus').addEventListener('click', () => {
            const input = document.querySelector('.quantity-input');
            const value = parseInt(input.value);
            if (value > 1) {
                input.value = value - 1;
            }
        });
        
        document.querySelector('.quantity-btn.plus').addEventListener('click', () => {
            const input = document.querySelector('.quantity-input');
            const value = parseInt(input.value);
            if (value < 10) {
                input.value = value + 1;
            }
        });
        
        // Load related products
        loadRelatedProducts(productId);
    });
}

function loadRelatedProducts(currentProductId) {
    const container = document.getElementById('relatedProducts');
    if (!container) return;
    
    const productsRef = ref(db, 'products');
    
    onValue(productsRef, (snapshot) => {
        const data = snapshot.val();
        if (!data) return;
        
        const products = Object.entries(data)
            .map(([id, product]) => ({ id, ...product }))
            .filter(product => product.id !== currentProductId)
            .slice(0, 4);
        
        container.innerHTML = '';
        
        products.forEach(product => {
            const productCard = createProductCard(product);
            container.appendChild(productCard);
        });
    });
}

// Admin Functions
function setupAdminPanel() {
    const loginOverlay = document.getElementById('loginOverlay');
    const adminPanel = document.getElementById('adminPanel');
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const pinInput = document.getElementById('pinInput');
    const pinError = document.getElementById('pinError');
    
    if (!loginOverlay) return;
    
    const ADMIN_PIN = '1234'; // Default PIN - Change in production
    
    // Check if already logged in
    if (localStorage.getItem('adminLoggedIn') === 'true') {
        loginOverlay.style.display = 'none';
        adminPanel.style.display = 'block';
        loadAdminProducts();
        loadOrders();
    }
    
    // Login button
    loginBtn.addEventListener('click', () => {
        if (pinInput.value === ADMIN_PIN) {
            localStorage.setItem('adminLoggedIn', 'true');
            loginOverlay.style.display = 'none';
            adminPanel.style.display = 'block';
            loadAdminProducts();
            loadOrders();
        } else {
            pinError.style.display = 'flex';
            pinInput.value = '';
            setTimeout(() => {
                pinError.style.display = 'none';
            }, 3000);
        }
    });
    
    // Logout button
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('adminLoggedIn');
            window.location.reload();
        });
    }
    
    // Add product form
    const addProductForm = document.getElementById('addProductForm');
    if (addProductForm) {
        addProductForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const product = {
                name: document.getElementById('productName').value,
                price: parseFloat(document.getElementById('productPrice').value),
                description: document.getElementById('productDescription').value,
                image: document.getElementById('productImage').value,
                category: document.getElementById('productCategory').value,
                stock: parseInt(document.getElementById('productStock').value),
                colors: document.getElementById('selectedColors').value,
                createdAt: Date.now()
            };
            
            const productsRef = ref(db, 'products');
            const newProductRef = push(productsRef);
            
            set(newProductRef, product)
                .then(() => {
                    // Show success message
                    const successMsg = document.getElementById('formSuccess');
                    successMsg.style.display = 'flex';
                    
                    // Reset form
                    addProductForm.reset();
                    
                    // Hide success message after 3 seconds
                    setTimeout(() => {
                        successMsg.style.display = 'none';
                    }, 3000);
                })
                .catch((error) => {
                    console.error('Error adding product:', error);
                    alert('Error adding product. Please try again.');
                });
        });
    }
    
    // Color selector
    document.querySelectorAll('.color-option').forEach(option => {
        option.addEventListener('click', () => {
            option.classList.toggle('selected');
            updateSelectedColors();
        });
    });
}

function loadAdminProducts() {
    const tableBody = document.getElementById('inventoryTable');
    const totalProducts = document.getElementById('totalProducts');
    const totalValue = document.getElementById('totalValue');
    const lowStock = document.getElementById('lowStock');
    
    if (!tableBody) return;
    
    const productsRef = ref(db, 'products');
    
    onValue(productsRef, (snapshot) => {
        const data = snapshot.val();
        tableBody.innerHTML = '';
        
        if (!data) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="5" class="no-products">
                        <p>No products found. Add your first product!</p>
                    </td>
                </tr>
            `;
            totalProducts.textContent = '0';
            totalValue.textContent = 'PKR 0';
            lowStock.textContent = '0';
            return;
        }
        
        let totalPrice = 0;
        let lowStockCount = 0;
        let productCount = 0;
        
        Object.entries(data).forEach(([id, product]) => {
            productCount++;
            totalPrice += product.price || 0;
            
            if (product.stock < 5) {
                lowStockCount++;
            }
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <div style="width: 50px; height: 50px; background: linear-gradient(135deg, #4338ca, #c026d3); border-radius: 8px;"></div>
                </td>
                <td>${product.name}</td>
                <td>PKR ${product.price}</td>
                <td>${product.stock}</td>
                <td>
                    <button class="delete-btn" data-id="${id}">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </td>
            `;
            tableBody.appendChild(row);
            
            // Add delete event listener
            row.querySelector('.delete-btn').addEventListener('click', () => {
                if (confirm('Are you sure you want to delete this product?')) {
                    deleteProduct(id);
                }
            });
        });
        
        totalProducts.textContent = productCount;
        totalValue.textContent = `PKR ${totalPrice}`;
        lowStock.textContent = lowStockCount;
    });
}

function deleteProduct(productId) {
    const productRef = ref(db, `products/${productId}`);
    remove(productRef)
        .then(() => {
            console.log('Product deleted successfully');
        })
        .catch((error) => {
            console.error('Error deleting product:', error);
            alert('Error deleting product. Please try again.');
        });
}

function loadOrders() {
    const tableBody = document.getElementById('ordersTable');
    if (!tableBody) return;
    
    // In a real app, you would load orders from Firebase
    // For now, we'll show a placeholder
}

function updateSelectedColors() {
    const selected = Array.from(document.querySelectorAll('.color-option.selected'))
        .map(option => option.dataset.color);
    document.getElementById('selectedColors').value = selected.join(',');
}

// Checkout Functions
function setupCheckout() {
    const paymentOptions = document.querySelectorAll('.payment-option');
    const easypaisaDetails = document.getElementById('easypaisaDetails');
    const codDetails = document.getElementById('codDetails');
    const codFee = document.getElementById('codFee');
    const orderTotal = document.getElementById('orderTotal');
    const placeOrderBtn = document.getElementById('placeOrderBtn');
    
    if (!paymentOptions.length) return;
    
    paymentOptions.forEach(option => {
        option.addEventListener('click', () => {
            paymentOptions.forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
            
            const method = option.dataset.method;
            
            if (method === 'easypaisa') {
                easypaisaDetails.style.display = 'block';
                codDetails.style.display = 'none';
                codFee.textContent = 'PKR 0';
                updateOrderTotal();
            } else if (method === 'cod') {
                easypaisaDetails.style.display = 'none';
                codDetails.style.display = 'block';
                codFee.textContent = 'PKR 150';
                updateOrderTotal();
            }
        });
    });
    
    // Place order button
    if (placeOrderBtn) {
        placeOrderBtn.addEventListener('click', (e) => {
            e.preventDefault();
            
            if (!document.getElementById('agreeTerms').checked) {
                alert('Please agree to the terms and conditions.');
                return;
            }
            
            const form = document.getElementById('checkoutForm');
            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }
            
            // Get form data
            const order = {
                customer: {
                    name: document.getElementById('fullName').value,
                    phone: document.getElementById('phone').value,
                    email: document.getElementById('email').value,
                    address: document.getElementById('address').value,
                    city: document.getElementById('city').value,
                    postalCode: document.getElementById('postalCode').value,
                    notes: document.getElementById('notes').value
                },
                items: cart,
                paymentMethod: document.querySelector('.payment-option.active').dataset.method,
                transactionId: document.getElementById('transactionId').value || null,
                total: calculateOrderTotal(),
                status: 'pending',
                createdAt: Date.now()
            };
            
            // Save order to Firebase
            const ordersRef = ref(db, 'orders');
            const newOrderRef = push(ordersRef);
            
            set(newOrderRef, order)
                .then(() => {
                    // Clear cart
                    clearCart();
                    
                    // Show success message
                    alert('Order placed successfully! We will contact you soon.');
                    window.location.href = 'index.html';
                })
                .catch((error) => {
                    console.error('Error placing order:', error);
                    alert('Error placing order. Please try again.');
                });
        });
    }
    
    // Render checkout items
    renderCheckoutItems();
}

function renderCheckoutItems() {
    const container = document.getElementById('checkoutItems');
    const subtotalEl = document.getElementById('orderSubtotal');
    const shippingEl = document.getElementById('orderShipping');
    const totalEl = document.getElementById('orderTotal');
    
    if (!container) return;
    
    if (cart.length === 0) {
        container.innerHTML = '<p>No items in cart</p>';
        subtotalEl.textContent = 'PKR 0';
        shippingEl.textContent = 'PKR 0';
        totalEl.textContent = 'PKR 0';
        return;
    }
    
    let subtotal = 0;
    let html = '';
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        
        html += `
            <div class="order-item">
                <div class="item-info">
                    <h4>${item.name}</h4>
                    <p>Quantity: ${item.quantity}</p>
                </div>
                <div class="item-price">PKR ${itemTotal}</div>
            </div>
        `;
    });
    
    container.innerHTML = html;
    updateOrderTotal();
}

function calculateOrderTotal() {
    let subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    let shipping = 200;
    let codFee = document.querySelector('.payment-option.active').dataset.method === 'cod' ? 150 : 0;
    
    return subtotal + shipping + codFee;
}

function updateOrderTotal() {
    const subtotalEl = document.getElementById('orderSubtotal');
    const totalEl = document.getElementById('orderTotal');
    
    if (!subtotalEl || !totalEl) return;
    
    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const total = calculateOrderTotal();
    
    subtotalEl.textContent = `PKR ${subtotal}`;
    totalEl.textContent = `PKR ${total}`;
}

// Utility Functions
function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #4338ca, #c026d3);
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Add CSS for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Initialize based on current page
document.addEventListener('DOMContentLoaded', () => {
    // Update cart count on all pages
    updateCartCount();
    
    // Load products on shop page
    if (document.getElementById('allProducts')) {
        loadProducts('allProducts');
        
        // Add search functionality
        const searchInput = document.getElementById('searchProducts');
        if (searchInput) {
            searchInput.addEventListener('input', filterProducts);
        }
        
        // Add sort functionality
        const sortSelect = document.getElementById('sortProducts');
        if (sortSelect) {
            sortSelect.addEventListener('change', sortProducts);
        }
    }
    
    // Load featured products on home page
    if (document.getElementById('featuredProducts')) {
        loadProducts('featuredProducts', 4);
    }
    
    // Load product details on product page
    if (window.location.pathname.includes('product.html')) {
        loadProductDetails();
    }
    
    // Render cart items on cart page
    if (document.getElementById('cartItems')) {
        renderCartItems();
        
        // Apply coupon button
        const applyCouponBtn = document.getElementById('applyCoupon');
        if (applyCouponBtn) {
            applyCouponBtn.addEventListener('click', applyCoupon);
        }
        
        // Checkout button
        const checkoutBtn = document.getElementById('checkoutBtn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => {
                if (cart.length === 0) {
                    alert('Your cart is empty. Add some products first.');
                    return;
                }
                window.location.href = 'checkout.html';
            });
        }
    }
    
    // Setup checkout page
    if (window.location.pathname.includes('checkout.html')) {
        setupCheckout();
    }
    
    // Setup admin panel
    if (window.location.pathname.includes('admin.html')) {
        setupAdminPanel();
    }
});

// Product filtering and sorting
function filterProducts() {
    const searchTerm = document.getElementById('searchProducts').value.toLowerCase();
    const productCards = document.querySelectorAll('.product-card');
    
    productCards.forEach(card => {
        const title = card.querySelector('.product-title').textContent.toLowerCase();
        if (title.includes(searchTerm)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

function sortProducts() {
    const sortBy = document.getElementById('sortProducts').value;
    const container = document.getElementById('allProducts');
    
    // This would require re-rendering products in sorted order
    // In a real implementation, you would sort the data before rendering
    console.log('Sort by:', sortBy);
    // Implementation would go here
}

function applyCoupon() {
    const code = document.getElementById('couponCode').value;
    const discountAmount = document.getElementById('discountAmount');
    
    if (code === 'SOLO10') {
        discountAmount.textContent = '- PKR 100';
        showNotification('Coupon applied successfully!');
        
        // Update total
        const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
        const shipping = 200;
        const discount = 100;
        const total = subtotal + shipping - discount;
        
        document.getElementById('cartTotal').textContent = `PKR ${total}`;
    } else {
        showNotification('Invalid coupon code');
    }
}
