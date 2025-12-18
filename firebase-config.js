// Firebase Configuration
import { initializeApp } from "firebase/app";
import { getDatabase, ref, push, set, onValue, remove } from "firebase/database";

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

// Cart Management
let cart = JSON.parse(localStorage.getItem('soloWearCart')) || [];

// Save cart to localStorage
function saveCart() {
    localStorage.setItem('soloWearCart', JSON.stringify(cart));
}

// Add item to cart
function addToCart(product, quantity = 1) {
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: quantity
        });
    }
    
    saveCart();
    updateCartCount();
    showNotification(`${product.name} added to cart`);
}

// Remove item from cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartCount();
}

// Update item quantity
function updateQuantity(productId, quantity) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity = Math.max(1, quantity);
        saveCart();
    }
}

// Get cart total
function getCartTotal() {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

// Get cart count
function getCartCount() {
    return cart.reduce((count, item) => count + item.quantity, 0);
}

// Update cart count in UI
function updateCartCount() {
    const cartCountElements = document.querySelectorAll('.cart-count');
    const count = getCartCount();
    
    cartCountElements.forEach(element => {
        element.textContent = count;
    });
}

// Show notification
function showNotification(message, type = 'success') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Add to body
    document.body.appendChild(notification);
    
    // Add styles if not already present
    if (!document.querySelector('#notification-styles')) {
        const styles = document.createElement('style');
        styles.id = 'notification-styles';
        styles.textContent = `
            .notification {
                position: fixed;
                top: 100px;
                right: 20px;
                background: var(--secondary-bg);
                border: 1px solid var(--border-color);
                border-left: 4px solid var(--success);
                padding: 1rem 1.5rem;
                border-radius: 4px;
                box-shadow: 0 5px 15px rgba(0,0,0,0.3);
                z-index: 2000;
                animation: slideInRight 0.3s ease, fadeOut 0.3s ease 2.7s forwards;
                max-width: 300px;
            }
            
            .notification.error {
                border-left-color: var(--danger);
            }
            
            .notification-content {
                display: flex;
                align-items: center;
                gap: 1rem;
            }
            
            .notification i {
                font-size: 1.2rem;
                color: var(--success);
            }
            
            .notification.error i {
                color: var(--danger);
            }
            
            @keyframes slideInRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            @keyframes fadeOut {
                to {
                    opacity: 0;
                    transform: translateX(100%);
                }
            }
        `;
        document.head.appendChild(styles);
    }
    
    // Remove after 3 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 3000);
}

// Load featured products on homepage
function loadFeaturedProducts() {
    const productsGrid = document.getElementById('featuredProducts');
    if (!productsGrid) return;
    
    const productsRef = ref(db, 'products');
    
    onValue(productsRef, (snapshot) => {
        const products = [];
        snapshot.forEach((childSnapshot) => {
            const product = {
                id: childSnapshot.key,
                ...childSnapshot.val()
            };
            if (product.featured) {
                products.push(product);
            }
        });
        
        // Sort by newest first
        products.sort((a, b) => b.timestamp - a.timestamp);
        
        if (products.length === 0) {
            productsGrid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-gem fa-3x"></i>
                    <p>No featured products yet</p>
                    <small>Products will appear here when added via Admin Panel</small>
                </div>
            `;
            return;
        }
        
        // Display only first 4 featured products
        const featuredProducts = products.slice(0, 4);
        
        productsGrid.innerHTML = featuredProducts.map(product => `
            <div class="product-card fade-in">
                <img src="${product.image}" alt="${product.name}" class="product-image" 
                     onerror="this.src='https://via.placeholder.com/300x300?text=Solo+Wear'">
                <div class="product-info">
                    <h3 class="product-title">${product.name}</h3>
                    <p class="product-price">$${product.price.toFixed(2)}</p>
                    <p class="product-description">${product.description.substring(0, 100)}...</p>
                    <div class="product-actions">
                        <a href="product.html?id=${product.id}" class="btn btn-secondary">View Details</a>
                        <button onclick="addToCartFromFeatured('${product.id}')" class="btn btn-primary">
                            <i class="fas fa-shopping-bag"></i> Add to Cart
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    });
}

// Load all products on shop page
function loadAllProducts() {
    const productsGrid = document.getElementById('productsGrid');
    const searchInput = document.getElementById('searchInput');
    const sortSelect = document.getElementById('sortSelect');
    
    if (!productsGrid) return;
    
    const productsRef = ref(db, 'products');
    
    onValue(productsRef, (snapshot) => {
        const products = [];
        snapshot.forEach((childSnapshot) => {
            const product = {
                id: childSnapshot.key,
                ...childSnapshot.val()
            };
            products.push(product);
        });
        
        // Sort products
        function sortProducts(products, sortBy) {
            switch(sortBy) {
                case 'price-low':
                    return [...products].sort((a, b) => a.price - b.price);
                case 'price-high':
                    return [...products].sort((a, b) => b.price - a.price);
                case 'newest':
                default:
                    return [...products].sort((a, b) => b.timestamp - a.timestamp);
            }
        }
        
        // Filter products based on search
        function filterProducts(products, searchTerm) {
            if (!searchTerm) return products;
            return products.filter(product => 
                product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.description.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        
        // Update display
        function updateDisplay() {
            const searchTerm = searchInput ? searchInput.value : '';
            const sortBy = sortSelect ? sortSelect.value : 'newest';
            
            let filteredProducts = filterProducts(products, searchTerm);
            filteredProducts = sortProducts(filteredProducts, sortBy);
            
            if (filteredProducts.length === 0) {
                productsGrid.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-search fa-3x"></i>
                        <p>No products found</p>
                        <small>Try adjusting your search or check back later</small>
                    </div>
                `;
                return;
            }
            
            productsGrid.innerHTML = filteredProducts.map(product => `
                <div class="product-card fade-in">
                    <img src="${product.image}" alt="${product.name}" class="product-image"
                         onerror="this.src='https://via.placeholder.com/300x300?text=Solo+Wear'">
                    <div class="product-info">
                        <h3 class="product-title">${product.name}</h3>
                        <p class="product-price">$${product.price.toFixed(2)}</p>
                        <p class="product-description">${product.description.substring(0, 100)}...</p>
                        <div class="product-actions">
                            <a href="product.html?id=${product.id}" class="btn btn-secondary">View Details</a>
                            <button onclick="addToCartFromShop('${product.id}')" class="btn btn-primary">
                                <i class="fas fa-shopping-bag"></i> Add to Cart
                            </button>
                        </div>
                    </div>
                </div>
            `).join('');
        }
        
        // Initial display
        updateDisplay();
        
        // Add event listeners for filtering and sorting
        if (searchInput) {
            searchInput.addEventListener('input', updateDisplay);
        }
        
        if (sortSelect) {
            sortSelect.addEventListener('change', updateDisplay);
        }
    });
}

// Load product detail
function loadProductDetail(productId) {
    const productDetail = document.getElementById('productDetail');
    if (!productDetail) return;
    
    const productRef = ref(db, `products/${productId}`);
    
    onValue(productRef, (snapshot) => {
        const product = snapshot.val();
        
        if (!product) {
            productDetail.innerHTML = `
                <div class="error-state">
                    <i class="fas fa-exclamation-circle fa-3x"></i>
                    <p>Product not found</p>
                    <a href="shop.html" class="cta-button">Back to Shop</a>
                </div>
            `;
            return;
        }
        
        productDetail.innerHTML = `
            <div class="product-detail fade-in">
                <div class="detail-image-container">
                    <img src="${product.image}" alt="${product.name}" class="detail-image"
                         onerror="this.src='https://via.placeholder.com/500x400?text=Solo+Wear'">
                </div>
                <div class="detail-info">
                    <h1 class="detail-title">${product.name}</h1>
                    <p class="detail-price">$${product.price.toFixed(2)}</p>
                    <div class="detail-description">
                        ${product.description.replace(/\n/g, '<br>')}
                    </div>
                    
                    <div class="detail-meta">
                        <div class="meta-item">
                            <span>Category</span>
                            <span>${product.category || 'Luxury Fashion'}</span>
                        </div>
                        <div class="meta-item">
                            <span>Availability</span>
                            <span>In Stock (${product.stock || 10} units)</span>
                        </div>
                        <div class="meta-item">
                            <span>Shipping</span>
                            <span>Free Worldwide</span>
                        </div>
                    </div>
                    
                    <div class="quantity-selector">
                        <label for="productQuantity">Quantity:</label>
                        <select id="productQuantity">
                            ${Array.from({length: Math.min(product.stock || 10, 10)}, (_, i) => 
                                `<option value="${i + 1}">${i + 1}</option>`
                            ).join('')}
                        </select>
                    </div>
                    
                    <div class="detail-actions">
                        <button onclick="addToCartFromDetail('${productId}')" class="btn btn-primary" style="flex: 2;">
                            <i class="fas fa-shopping-bag"></i> Add to Cart
                        </button>
                        <a href="shop.html" class="btn btn-secondary" style="flex: 1;">
                            Continue Shopping
                        </a>
                    </div>
                </div>
            </div>
        `;
    });
}

// Load related products
function loadRelatedProducts(currentProductId) {
    const relatedProductsGrid = document.getElementById('relatedProducts');
    if (!relatedProductsGrid) return;
    
    const productsRef = ref(db, 'products');
    
    onValue(productsRef, (snapshot) => {
        const products = [];
        snapshot.forEach((childSnapshot) => {
            if (childSnapshot.key !== currentProductId) {
                const product = {
                    id: childSnapshot.key,
                    ...childSnapshot.val()
                };
                products.push(product);
            }
        });
        
        // Take up to 4 random products
        const randomProducts = products
            .sort(() => Math.random() - 0.5)
            .slice(0, 4);
        
        if (randomProducts.length === 0) return;
        
        relatedProductsGrid.innerHTML = randomProducts.map(product => `
            <div class="product-card fade-in">
                <img src="${product.image}" alt="${product.name}" class="product-image"
                     onerror="this.src='https://via.placeholder.com/300x300?text=Solo+Wear'">
                <div class="product-info">
                    <h3 class="product-title">${product.name}</h3>
                    <p class="product-price">$${product.price.toFixed(2)}</p>
                    <div class="product-actions">
                        <a href="product.html?id=${product.id}" class="btn btn-secondary">View Details</a>
                        <button onclick="addToCartFromRelated('${product.id}')" class="btn btn-primary">
                            <i class="fas fa-shopping-bag"></i> Add to Cart
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    });
}

// Load cart items
function loadCartItems() {
    const cartItems = document.getElementById('cartItems');
    const cartSummary = document.getElementById('cartSummary');
    const emptyCartMessage = document.getElementById('emptyCartMessage');
    const cartSubtotal = document.getElementById('cartSubtotal');
    const cartTotal = document.getElementById('cartTotal');
    
    if (!cartItems) return;
    
    if (cart.length === 0) {
        if (emptyCartMessage) emptyCartMessage.style.display = '';
        if (cartSummary) cartSummary.style.display = 'none';
        return;
    }
    
    if (emptyCartMessage) emptyCartMessage.style.display = 'none';
    if (cartSummary) cartSummary.style.display = 'block';
    
    cartItems.innerHTML = '';
    
    cart.forEach(item => {
        const row = document.createElement('tr');
        row.className = 'cart-item';
        row.innerHTML = `
            <td>
                <div class="cart-item-info">
                    <img src="${item.image}" alt="${item.name}" class="cart-item-image"
                         onerror="this.src='https://via.placeholder.com/80x80?text=Solo+Wear'">
                    <div>
                        <div class="cart-item-title">${item.name}</div>
                        <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                    </div>
                </div>
            </td>
            <td>$${item.price.toFixed(2)}</td>
            <td>
                <div class="quantity-controls">
                    <button onclick="decreaseQuantity('${item.id}')" class="quantity-btn">-</button>
                    <input type="number" value="${item.quantity}" min="1" 
                           onchange="updateItemQuantity('${item.id}', this.value)" 
                           class="quantity-input">
                    <button onclick="increaseQuantity('${item.id}')" class="quantity-btn">+</button>
                </div>
            </td>
            <td>$${(item.price * item.quantity).toFixed(2)}</td>
            <td>
                <button onclick="removeCartItem('${item.id}')" class="delete-btn" title="Remove">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        cartItems.appendChild(row);
    });
    
    const subtotal = getCartTotal();
    if (cartSubtotal) cartSubtotal.textContent = `$${subtotal.toFixed(2)}`;
    if (cartTotal) cartTotal.textContent = `$${subtotal.toFixed(2)}`;
}

// Load checkout items
function loadCheckoutItems() {
    const orderItems = document.getElementById('orderItems');
    const orderSubtotal = document.getElementById('orderSubtotal');
    const orderTotal = document.getElementById('orderTotal');
    
    if (!orderItems || cart.length === 0) {
        window.location.href = 'cart.html';
        return;
    }
    
    orderItems.innerHTML = '';
    
    cart.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'order-item';
        itemDiv.innerHTML = `
            <div>
                <div>${item.name} × ${item.quantity}</div>
                <small>$${item.price.toFixed(2)} each</small>
            </div>
            <div>$${(item.price * item.quantity).toFixed(2)}</div>
        `;
        orderItems.appendChild(itemDiv);
    });
    
    const subtotal = getCartTotal();
    if (orderSubtotal) orderSubtotal.textContent = `$${subtotal.toFixed(2)}`;
    if (orderTotal) orderTotal.textContent = `$${subtotal.toFixed(2)}`;
}

// Setup checkout form
function setupCheckoutForm() {
    const checkoutForm = document.getElementById('checkoutForm');
    const checkoutError = document.getElementById('checkoutError');
    
    if (!checkoutForm) return;
    
    checkoutForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Validate cart
        if (cart.length === 0) {
            checkoutError.textContent = 'Your cart is empty. Please add items before checkout.';
            return;
        }
        
        // Validate form
        const formData = {
            name: document.getElementById('fullName').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            address: document.getElementById('address').value.trim(),
            city: document.getElementById('city').value.trim(),
            transactionId: document.getElementById('transactionId').value.trim()
        };
        
        // Validate required fields
        if (!formData.name || !formData.phone || !formData.address || !formData.city || !formData.transactionId) {
            checkoutError.textContent = 'Please fill in all required fields.';
            return;
        }
        
        // Validate phone number
        const phoneRegex = /^[\+]?[0-9]{10,13}$/;
        if (!phoneRegex.test(formData.phone.replace(/[^\d+]/g, ''))) {
            checkoutError.textContent = 'Please enter a valid phone number.';
            return;
        }
        
        // Create order
        const order = {
            ...formData,
            items: cart,
            total: getCartTotal(),
            status: 'pending',
            timestamp: Date.now(),
            orderDate: new Date().toISOString()
        };
        
        try {
            // Save order to Firebase
            const ordersRef = ref(db, 'orders');
            const newOrderRef = push(ordersRef);
            await set(newOrderRef, order);
            
            const orderId = newOrderRef.key;
            
            // Clear cart
            cart = [];
            saveCart();
            updateCartCount();
            
            // Show success modal
            const modal = document.getElementById('orderSuccessModal');
            const orderIdDisplay = document.getElementById('orderIdDisplay');
            
            if (orderIdDisplay) {
                orderIdDisplay.textContent = orderId;
            }
            
            if (modal) {
                modal.style.display = 'flex';
            }
            
            // Reset form
            checkoutForm.reset();
            
        } catch (error) {
            console.error('Error saving order:', error);
            checkoutError.textContent = 'Failed to place order. Please try again.';
        }
    });
}

// Admin Panel Functions
function setupAdminPanel() {
    const pinForm = document.getElementById('pinForm');
    const adminLogin = document.getElementById('adminLogin');
    const adminDashboard = document.getElementById('adminDashboard');
    
    if (!pinForm) return;
    
    // Check if already logged in
    if (sessionStorage.getItem('adminLoggedIn') === 'true') {
        showAdminDashboard();
        return;
    }
    
    pinForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const pin = document.getElementById('adminPin').value;
        
        // Default PIN is 123456 (Change this in production!)
        if (pin === '123456') {
            sessionStorage.setItem('adminLoggedIn', 'true');
            showAdminDashboard();
        } else {
            document.getElementById('pinError').textContent = 'Invalid PIN. Please try again.';
        }
    });
}

function showAdminDashboard() {
    const adminLogin = document.getElementById('adminLogin');
    const adminDashboard = document.getElementById('adminDashboard');
    
    if (adminLogin) adminLogin.style.display = 'none';
    if (adminDashboard) adminDashboard.style.display = 'block';
}

function logoutAdmin() {
    sessionStorage.removeItem('adminLoggedIn');
    window.location.reload();
}

function switchTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active class from all buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    const tab = document.getElementById(`${tabName}Tab`);
    if (tab) {
        tab.classList.add('active');
    }
    
    // Activate selected button
    const buttons = document.querySelectorAll('.tab-btn');
    buttons.forEach(btn => {
        if (btn.textContent.includes(tabName.replace(/([A-Z])/g, ' $1').trim())) {
            btn.classList.add('active');
        }
    });
}

// Load admin products
function loadAdminProducts() {
    const productsGrid = document.getElementById('adminProductsGrid');
    if (!productsGrid) return;
    
    const productsRef = ref(db, 'products');
    
    onValue(productsRef, (snapshot) => {
        const products = [];
        snapshot.forEach((childSnapshot) => {
            const product = {
                id: childSnapshot.key,
                ...childSnapshot.val()
            };
            products.push(product);
        });
        
        if (products.length === 0) {
            productsGrid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-box-open fa-3x"></i>
                    <p>No products yet</p>
                    <small>Add your first product using the "Add Product" tab</small>
                </div>
            `;
            return;
        }
        
        productsGrid.innerHTML = products.map(product => `
            <div class="admin-product-card fade-in">
                <div class="admin-product-header">
                    <img src="${product.image}" alt="${product.name}" 
                         style="width: 100%; height: 200px; object-fit: cover; border-radius: 5px; margin-bottom: 1rem;"
                         onerror="this.src='https://via.placeholder.com/300x200?text=Solo+Wear'">
                    <h4>${product.name}</h4>
                    <p class="product-price">$${product.price.toFixed(2)}</p>
                    <p class="product-description">${product.description.substring(0, 100)}...</p>
                </div>
                <div class="admin-product-actions">
                    <button onclick="editProduct('${product.id}')" class="btn btn-secondary" style="flex: 1;">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button onclick="showDeleteModal('${product.id}', '${product.name}')" class="btn btn-primary" style="flex: 1;">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `).join('');
    });
}

// Load admin orders
function loadAdminOrders() {
    const ordersTable = document.getElementById('ordersTable');
    if (!ordersTable) return;
    
    const ordersRef = ref(db, 'orders');
    
    onValue(ordersRef, (snapshot) => {
        const orders = [];
        snapshot.forEach((childSnapshot) => {
            const order = {
                id: childSnapshot.key,
                ...childSnapshot.val()
            };
            orders.push(order);
        });
        
        if (orders.length === 0) {
            return;
        }
        
        // Sort by newest first
        orders.sort((a, b) => b.timestamp - a.timestamp);
        
        ordersTable.innerHTML = orders.map(order => {
            const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
            const orderDate = new Date(order.orderDate).toLocaleDateString();
            
            return `
                <tr>
                    <td>${order.id.substring(0, 8)}...</td>
                    <td>${order.name}</td>
                    <td>${itemCount} items</td>
                    <td>$${order.total.toFixed(2)}</td>
                    <td>${orderDate}</td>
                    <td>
                        <span class="status-badge status-${order.status}">
                            ${order.status}
                        </span>
                    </td>
                    <td>
                        <button onclick="viewOrderDetails('${order.id}')" class="btn btn-secondary">
                            <i class="fas fa-eye"></i> View
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    });
}

// Setup add product form
function setupAddProductForm() {
    const form = document.getElementById('addProductForm');
    if (!form) return;
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const product = {
            name: document.getElementById('productName').value.trim(),
            price: parseFloat(document.getElementById('productPrice').value),
            image: document.getElementById('productImage').value.trim(),
            description: document.getElementById('productDescription').value.trim(),
            category: document.getElementById('productCategory').value,
            stock: parseInt(document.getElementById('productStock').value) || 10,
            featured: document.getElementById('productFeatured').checked,
            timestamp: Date.now()
        };
        
        // Validate
        if (!product.name || !product.price || !product.image || !product.description) {
            showFormMessage('Please fill in all required fields.', 'error');
            return;
        }
        
        if (product.price <= 0) {
            showFormMessage('Price must be greater than 0.', 'error');
            return;
        }
        
        try {
            const productsRef = ref(db, 'products');
            const newProductRef = push(productsRef);
            await set(newProductRef, product);
            
            showFormMessage('Product added successfully!', 'success');
            form.reset();
            
            // Reload products
            loadAdminProducts();
            
        } catch (error) {
            console.error('Error adding product:', error);
            showFormMessage('Failed to add product. Please try again.', 'error');
        }
    });
}

function showFormMessage(message, type) {
    const messageDiv = document.getElementById('productFormMessage');
    if (!messageDiv) return;
    
    messageDiv.textContent = message;
    messageDiv.className = `form-message ${type}`;
    messageDiv.style.display = 'block';
    
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 3000);
}

// Modal functions for admin
let productToDelete = null;

function showDeleteModal(productId, productName) {
    productToDelete = productId;
    document.getElementById('productToDelete').textContent = productName;
    document.getElementById('deleteModal').style.display = 'flex';
}

function closeDeleteModal() {
    productToDelete = null;
    document.getElementById('deleteModal').style.display = 'none';
}

async function confirmDelete() {
    if (!productToDelete) return;
    
    try {
        const productRef = ref(db, `products/${productToDelete}`);
        await remove(productRef);
        
        showNotification('Product deleted successfully', 'success');
        closeDeleteModal();
        loadAdminProducts();
        
    } catch (error) {
        console.error('Error deleting product:', error);
        showNotification('Failed to delete product', 'error');
    }
}

function viewOrderDetails(orderId) {
    const orderRef = ref(db, `orders/${orderId}`);
    
    onValue(orderRef, (snapshot) => {
        const order = snapshot.val();
        if (!order) return;
        
        const modalContent = document.getElementById('orderDetailsContent');
        if (!modalContent) return;
        
        const orderDate = new Date(order.orderDate).toLocaleString();
        const itemsHTML = order.items.map(item => `
            <div class="order-detail-item">
                <div class="item-info">
                    <strong>${item.name}</strong>
                    <div>Quantity: ${item.quantity}</div>
                    <div>Price: $${item.price.toFixed(2)} each</div>
                </div>
                <div class="item-total">
                    $${(item.price * item.quantity).toFixed(2)}
                </div>
            </div>
        `).join('');
        
        modalContent.innerHTML = `
            <div class="order-details">
                <div class="detail-section">
                    <h4>Order Information</h4>
                    <p><strong>Order ID:</strong> ${orderId}</p>
                    <p><strong>Date:</strong> ${orderDate}</p>
                    <p><strong>Status:</strong> 
                        <span class="status-badge status-${order.status}">
                            ${order.status}
                        </span>
                    </p>
                </div>
                
                <div class="detail-section">
                    <h4>Customer Information</h4>
                    <p><strong>Name:</strong> ${order.name}</p>
                    <p><strong>Phone:</strong> ${order.phone}</p>
                    <p><strong>Address:</strong> ${order.address}, ${order.city}</p>
                    <p><strong>Transaction ID:</strong> ${order.transactionId}</p>
                </div>
                
                <div class="detail-section">
                    <h4>Order Items</h4>
                    ${itemsHTML}
                </div>
                
                <div class="detail-section">
                    <h4>Order Summary</h4>
                    <div class="order-summary-total">
                        <strong>Total:</strong> $${order.total.toFixed(2)}
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('orderDetailsModal').style.display = 'flex';
    }, { onlyOnce: true });
}

function closeOrderDetailsModal() {
    document.getElementById('orderDetailsModal').style.display = 'none';
}

// Export functions for global access
export {
    db,
    ref,
    push,
    set,
    onValue,
    remove,
    
    // Cart functions
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    getCartTotal,
    getCartCount,
    updateCartCount,
    saveCart,
    
    // Product loading functions
    loadFeaturedProducts,
    loadAllProducts,
    loadProductDetail,
    loadRelatedProducts,
    loadCartItems,
    loadCheckoutItems,
    setupCheckoutForm,
    
    // Admin functions
    setupAdminPanel,
    loadAdminProducts,
    loadAdminOrders,
    setupAddProductForm,
    
    // Modal functions
    showDeleteModal,
    closeDeleteModal,
    confirmDelete,
    viewOrderDetails,
    closeOrderDetailsModal,
    logoutAdmin,
    switchTab
};

// Make functions globally available for onclick attributes
window.addToCartFromFeatured = function(productId) {
    const productRef = ref(db, `products/${productId}`);
    onValue(productRef, (snapshot) => {
        const product = snapshot.val();
        if (product) {
            addToCart({id: productId, ...product});
        }
    }, { onlyOnce: true });
};

window.addToCartFromShop = function(productId) {
    const productRef = ref(db, `products/${productId}`);
    onValue(productRef, (snapshot) => {
        const product = snapshot.val();
        if (product) {
            addToCart({id: productId, ...product});
        }
    }, { onlyOnce: true });
};

window.addToCartFromDetail = function(productId) {
    const productRef = ref(db, `products/${productId}`);
    onValue(productRef, (snapshot) => {
        const product = snapshot.val();
        if (product) {
            const quantity = parseInt(document.getElementById('productQuantity').value) || 1;
            addToCart({id: productId, ...product}, quantity);
        }
    }, { onlyOnce: true });
};

window.addToCartFromRelated = function(productId) {
    const productRef = ref(db, `products/${productId}`);
    onValue(productRef, (snapshot) => {
        const product = snapshot.val();
        if (product) {
            addToCart({id: productId, ...product});
        }
    }, { onlyOnce: true });
};

window.decreaseQuantity = function(productId) {
    const item = cart.find(item => item.id === productId);
    if (item && item.quantity > 1) {
        updateQuantity(productId, item.quantity - 1);
        loadCartItems();
    }
};

window.increaseQuantity = function(productId) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        updateQuantity(productId, item.quantity + 1);
        loadCartItems();
    }
};

window.updateItemQuantity = function(productId, quantity) {
    updateQuantity(productId, parseInt(quantity) || 1);
    loadCartItems();
};

window.removeCartItem = function(productId) {
    removeFromCart(productId);
    loadCartItems();
};

window.closeOrderModal = function() {
    document.getElementById('orderSuccessModal').style.display = 'none';
    window.location.href = 'shop.html';
};

// Initialize cart count on page load
document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    
    // Mobile menu toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }
    
    // Setup add product form if on admin page
    if (document.getElementById('addProductForm')) {
        setupAddProductForm();
    }
});
