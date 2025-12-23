// Firebase Configuration
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, push, set, onValue, remove, get, child } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

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

// DOM Elements
const cartCountElements = document.querySelectorAll('.cart-count');
let cart = JSON.parse(localStorage.getItem('soloWearCart')) || [];

// Initialize WhatsApp Button
function initWhatsAppButton() {
    const whatsappButton = document.createElement('a');
    whatsappButton.href = `https://wa.me/923121399449?text=Hello%20Solo%20Wear%2C%20I'm%20interested%20in%20your%20collection`;
    whatsappButton.className = 'whatsapp-button';
    whatsappButton.target = '_blank';
    whatsappButton.innerHTML = '<i class="fab fa-whatsapp"></i>';
    whatsappButton.title = 'Chat with us on WhatsApp';
    document.body.appendChild(whatsappButton);
}

// Update Cart Count
function updateCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCountElements.forEach(element => {
        element.textContent = totalItems;
    });
}

// Cart Management
function addToCart(product, size = 'L') {
    const existingItem = cart.find(item => 
        item.id === product.id && item.size === size
    );
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            size: size,
            quantity: 1
        });
    }
    
    localStorage.setItem('soloWearCart', JSON.stringify(cart));
    updateCartCount();
    showCartNotification();
}

function removeFromCart(productId, size) {
    cart = cart.filter(item => !(item.id === productId && item.size === size));
    localStorage.setItem('soloWearCart', JSON.stringify(cart));
    updateCartCount();
    renderCartItems();
}

function updateQuantity(productId, size, change) {
    const item = cart.find(item => item.id === productId && item.size === size);
    if (item) {
        item.quantity += change;
        if (item.quantity < 1) {
            removeFromCart(productId, size);
        } else {
            localStorage.setItem('soloWearCart', JSON.stringify(cart));
            updateCartCount();
            renderCartItems();
        }
    }
}

// Show Cart Notification
function showCartNotification() {
    const notification = document.getElementById('cartNotification') || createCartNotification();
    notification.classList.add('show');
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

function createCartNotification() {
    const notification = document.createElement('div');
    notification.id = 'cartNotification';
    notification.className = 'cart-notification';
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-check-circle"></i>
            <span>Product added to cart successfully!</span>
        </div>
    `;
    document.body.appendChild(notification);
    return notification;
}

// Render Cart Items
function renderCartItems() {
    const cartItemsContainer = document.getElementById('cartItems');
    const emptyCart = document.getElementById('emptyCart');
    const subtotalElement = document.getElementById('subtotal');
    const totalElement = document.getElementById('total');
    
    if (!cartItemsContainer) return;
    
    if (cart.length === 0) {
        if (emptyCart) emptyCart.style.display = 'block';
        cartItemsContainer.innerHTML = '';
        subtotalElement.textContent = 'PKR 0';
        totalElement.textContent = 'PKR 500';
        return;
    }
    
    if (emptyCart) emptyCart.style.display = 'none';
    
    let subtotal = 0;
    let html = '';
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        
        html += `
            <div class="cart-item">
                <div class="cart-item-details">
                    <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                    <div>
                        <h4>${item.name}</h4>
                        <p>Size: ${item.size}</p>
                    </div>
                </div>
                <div class="cart-item-price">PKR ${item.price.toLocaleString()}</div>
                <div class="cart-item-quantity">
                    <div class="quantity-controls">
                        <button class="qty-btn" onclick="updateQuantity('${item.id}', '${item.size}', -1)">-</button>
                        <span class="quantity">${item.quantity}</span>
                        <button class="qty-btn" onclick="updateQuantity('${item.id}', '${item.size}', 1)">+</button>
                    </div>
                </div>
                <div class="cart-item-total">PKR ${itemTotal.toLocaleString()}</div>
                <div class="cart-item-remove">
                    <button class="remove-item" onclick="removeFromCart('${item.id}', '${item.size}')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        `;
    });
    
    cartItemsContainer.innerHTML = html;
    const shipping = 500;
    const total = subtotal + shipping;
    
    if (subtotalElement) subtotalElement.textContent = `PKR ${subtotal.toLocaleString()}`;
    if (totalElement) totalElement.textContent = `PKR ${total.toLocaleString()}`;
    
    // Update checkout page if exists
    const checkoutSubtotal = document.getElementById('checkoutSubtotal');
    const checkoutTotal = document.getElementById('checkoutTotal');
    const paymentAmount = document.getElementById('paymentAmount');
    
    if (checkoutSubtotal) checkoutSubtotal.textContent = `PKR ${subtotal.toLocaleString()}`;
    if (checkoutTotal) checkoutTotal.textContent = `PKR ${total.toLocaleString()}`;
    if (paymentAmount) paymentAmount.textContent = `PKR ${total.toLocaleString()}`;
    
    renderCheckoutItems();
}

// Render Checkout Items
function renderCheckoutItems() {
    const checkoutItems = document.getElementById('checkoutItems');
    if (!checkoutItems) return;
    
    let html = '';
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        html += `
            <div class="summary-item">
                <span>${item.name} (${item.size}) × ${item.quantity}</span>
                <span>PKR ${itemTotal.toLocaleString()}</span>
            </div>
        `;
    });
    checkoutItems.innerHTML = html;
}

// Firebase Product Management
async function fetchProducts(limit = null) {
    return new Promise((resolve) => {
        const productsRef = ref(db, 'products');
        onValue(productsRef, (snapshot) => {
            const data = snapshot.val();
            let products = [];
            
            if (data) {
                products = Object.entries(data).map(([id, product]) => ({
                    id,
                    ...product
                }));
                
                // Sort by newest first
                products.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
                
                // Limit if specified
                if (limit) {
                    products = products.slice(0, limit);
                }
            }
            
            resolve(products);
        });
    });
}

async function addProduct(product) {
    const newProductRef = push(ref(db, 'products'));
    await set(newProductRef, {
        ...product,
        createdAt: new Date().toISOString()
    });
    return newProductRef.key;
}

async function deleteProduct(productId) {
    await remove(ref(db, `products/${productId}`));
}

// Render Products Grid
function renderProductsGrid(products, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    if (products.length === 0) {
        container.innerHTML = '<div class="loading">No products found</div>';
        return;
    }
    
    let html = '';
    products.forEach(product => {
        html += `
            <div class="product-card animate-fade">
                <a href="product.html?id=${product.id}">
                    <img src="${product.image}" alt="${product.name}" class="product-image">
                    <div class="product-info">
                        <h3 class="product-title">${product.name}</h3>
                        <p class="product-price">PKR ${product.price.toLocaleString()}</p>
                    </div>
                </a>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// Admin Functions
function initAdminPanel() {
    const adminLogin = document.getElementById('adminLogin');
    const adminDashboard = document.getElementById('adminDashboard');
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (!adminLogin) return;
    
    // Check if already logged in
    if (localStorage.getItem('adminLoggedIn') === 'true') {
        adminLogin.style.display = 'none';
        adminDashboard.style.display = 'block';
        loadAdminData();
    }
    
    // Login handler
    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            const pin = document.getElementById('adminPin').value;
            if (pin === '4047') {
                localStorage.setItem('adminLoggedIn', 'true');
                adminLogin.style.display = 'none';
                adminDashboard.style.display = 'block';
                loadAdminData();
            } else {
                alert('Incorrect PIN');
            }
        });
    }
    
    // Logout handler
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('adminLoggedIn');
            adminLogin.style.display = 'flex';
            adminDashboard.style.display = 'none';
        });
    }
    
    // Add product form
    const addProductForm = document.getElementById('addProductForm');
    if (addProductForm) {
        addProductForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const product = {
                name: document.getElementById('productName').value,
                price: parseInt(document.getElementById('productPrice').value),
                image: document.getElementById('productImage').value,
                description: document.getElementById('productDescription').value,
                category: document.getElementById('productCategory').value
            };
            
            try {
                await addProduct(product);
                alert('Product added successfully!');
                addProductForm.reset();
                loadAdminProducts();
            } catch (error) {
                alert('Error adding product: ' + error.message);
            }
        });
    }
}

async function loadAdminData() {
    await loadAdminProducts();
    await loadAdminOrders();
}

async function loadAdminProducts() {
    const products = await fetchProducts();
    const container = document.getElementById('adminProductList');
    const totalProducts = document.getElementById('totalProducts');
    
    if (totalProducts) {
        totalProducts.textContent = products.length;
    }
    
    if (!container) return;
    
    let html = '';
    products.forEach(product => {
        html += `
            <div class="admin-product-item">
                <div class="admin-product-info">
                    <h4>${product.name}</h4>
                    <p>PKR ${product.price.toLocaleString()} • ${product.category}</p>
                </div>
                <div class="admin-product-actions">
                    <button class="delete-btn" onclick="deleteAdminProduct('${product.id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html || '<div class="loading">No products found</div>';
}

async function deleteAdminProduct(productId) {
    if (confirm('Are you sure you want to delete this product?')) {
        try {
            await deleteProduct(productId);
            loadAdminProducts();
        } catch (error) {
            alert('Error deleting product: ' + error.message);
        }
    }
}

async function loadAdminOrders() {
    const ordersRef = ref(db, 'orders');
    onValue(ordersRef, (snapshot) => {
        const data = snapshot.val();
        const container = document.getElementById('orderList');
        const totalOrders = document.getElementById('totalOrders');
        const totalRevenue = document.getElementById('totalRevenue');
        
        let orders = [];
        let revenue = 0;
        
        if (data) {
            orders = Object.entries(data).map(([id, order]) => ({
                id,
                ...order
            }));
            
            revenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
        }
        
        if (totalOrders) {
            totalOrders.textContent = orders.length;
        }
        
        if (totalRevenue) {
            totalRevenue.textContent = `PKR ${revenue.toLocaleString()}`;
        }
        
        if (container) {
            let html = '';
            orders.forEach(order => {
                html += `
                    <div class="admin-order-item">
                        <div class="admin-order-info">
                            <h4>Order #${order.id.substring(0, 8)}</h4>
                            <p>${order.customerName} • ${order.customerEmail}</p>
                            <p>PKR ${order.total?.toLocaleString() || '0'} • ${new Date(order.timestamp).toLocaleDateString()}</p>
                        </div>
                    </div>
                `;
            });
            
            container.innerHTML = html || '<div class="loading">No orders found</div>';
        }
    });
}

// Checkout Functions
function initCheckout() {
    const checkoutForm = document.getElementById('checkoutForm');
    const orderModal = document.getElementById('orderModal');
    
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            if (cart.length === 0) {
                alert('Your cart is empty');
                return;
            }
            
            const order = {
                customerName: document.getElementById('fullName').value,
                customerEmail: document.getElementById('email').value,
                customerPhone: document.getElementById('phone').value,
                customerAddress: document.getElementById('address').value,
                customerCity: document.getElementById('city').value,
                customerPostalCode: document.getElementById('postalCode').value,
                transactionId: document.getElementById('transactionId').value,
                items: cart,
                total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) + 500,
                timestamp: new Date().toISOString(),
                status: 'pending'
            };
            
            try {
                const orderRef = push(ref(db, 'orders'));
                await set(orderRef, order);
                
                // Show confirmation modal
                document.getElementById('orderId').textContent = `SW-${orderRef.key.substring(0, 6).toUpperCase()}`;
                orderModal.style.display = 'flex';
                
                // Clear cart
                cart = [];
                localStorage.setItem('soloWearCart', JSON.stringify(cart));
                updateCartCount();
                
            } catch (error) {
                alert('Error placing order: ' + error.message);
            }
        });
    }
}

// Product Page Functions
async function loadProductDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    
    if (!productId) return;
    
    const products = await fetchProducts();
    const product = products.find(p => p.id === productId);
    
    if (product) {
        // Update page content
        document.title = `${product.name} | Solo Wear`;
        document.getElementById('productName').textContent = product.name;
        document.getElementById('productTitle').textContent = product.name;
        document.getElementById('productPrice').textContent = `PKR ${product.price.toLocaleString()}`;
        document.getElementById('productDesc').textContent = product.description;
        
        const productImage = document.getElementById('productImage');
        if (productImage) {
            productImage.src = product.image;
            productImage.alt = product.name;
        }
        
        // Load related products
        const relatedProducts = products
            .filter(p => p.id !== productId && p.category === product.category)
            .slice(0, 3);
        renderProductsGrid(relatedProducts, 'relatedProducts');
        
        // Add to cart button
        const addToCartBtn = document.querySelector('.add-to-cart-btn');
        if (addToCartBtn) {
            addToCartBtn.addEventListener('click', () => {
                const selectedSize = document.querySelector('.size-btn.active')?.dataset.size || 'L';
                addToCart({
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    image: product.image
                }, selectedSize);
            });
        }
        
        // Size selector
        const sizeButtons = document.querySelectorAll('.size-btn');
        sizeButtons.forEach(button => {
            button.addEventListener('click', () => {
                sizeButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
            });
        });
    }
}

// Page-specific Initialization
async function initPage() {
    // Initialize WhatsApp button
    initWhatsAppButton();
    
    // Update cart count
    updateCartCount();
    
    // Load cart items if on cart page
    renderCartItems();
    
    // Check current page and initialize accordingly
    const path = window.location.pathname;
    
    if (path.includes('index.html') || path === '/') {
        // Load new arrivals
        const products = await fetchProducts(3);
        renderProductsGrid(products, 'newArrivalsGrid');
        
        // Newsletter form
        const newsletterForm = document.querySelector('.newsletter-form');
        if (newsletterForm) {
            newsletterForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const email = newsletterForm.querySelector('input').value;
                alert(`Thank you for subscribing with ${email}!`);
                newsletterForm.reset();
            });
        }
    }
    
    if (path.includes('shop.html')) {
        // Load all products
        const products = await fetchProducts();
        renderProductsGrid(products, 'productsGrid');
        
        // Update product count
        document.getElementById('productCount').textContent = products.length;
        
        // Sort filter
        const sortFilter = document.getElementById('sortFilter');
        if (sortFilter) {
            sortFilter.addEventListener('change', async () => {
                let products = await fetchProducts();
                const sortBy = sortFilter.value;
                
                switch (sortBy) {
                    case 'price-low':
                        products.sort((a, b) => a.price - b.price);
                        break;
                    case 'price-high':
                        products.sort((a, b) => b.price - a.price);
                        break;
                    case 'newest':
                    default:
                        products.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
                }
                
                renderProductsGrid(products, 'productsGrid');
            });
        }
    }
    
    if (path.includes('product.html')) {
        await loadProductDetails();
    }
    
    if (path.includes('cart.html')) {
        // Already handled by renderCartItems()
    }
    
    if (path.includes('checkout.html')) {
        initCheckout();
    }
    
    if (path.includes('admin.html')) {
        initAdminPanel();
    }
    
    // Mobile menu toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navMenu = document.querySelector('.nav-menu');
    
    if (mobileMenuBtn && navMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }
    
    // Scroll animations
    initScrollAnimations();
}

// Scroll Animations
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-slide-up');
            }
        });
    }, observerOptions);
    
    // Observe elements with animation classes
    document.querySelectorAll('.animate-on-scroll').forEach(el => {
        observer.observe(el);
    });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initPage);

// Make functions available globally for onclick handlers
window.updateQuantity = updateQuantity;
window.removeFromCart = removeFromCart;
window.deleteAdminProduct = deleteAdminProduct;

// Export for modules
export { db, ref, push, set, onValue, remove, get, child };
