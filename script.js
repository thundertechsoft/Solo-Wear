// SOLO WEAR 2025 - Complete E-commerce Solution
// Firebase Configuration and Application Logic

// ============================================
// FIREBASE CONFIGURATION
// ============================================

// Import Firebase modules (using CDN in HTML)
// The actual import is done in the HTML file via CDN
// This is the Firebase configuration as provided
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
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const auth = firebase.auth();

// ============================================
// GLOBAL VARIABLES & UTILITIES
// ============================================

// Image placeholder for broken images
const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1558769132-cb1cb458eabe?q=80&w=1974&auto=format&fit=crop';

// Admin PIN
const ADMIN_PIN = '4047';

// DOM Elements (global for easy access)
let currentUser = null;
let cart = JSON.parse(localStorage.getItem('solowear_cart')) || [];
let products = [];

// ============================================
// IMAGE HANDLING FUNCTIONS
// ============================================

/**
 * Robust image loading with error handling
 * @param {string} imageUrl - The URL of the image to load
 * @param {HTMLElement} imgElement - The img element to update
 */
function loadImageWithFallback(imageUrl, imgElement) {
    if (!imgElement) return;
    
    // Set the image source
    imgElement.src = imageUrl || PLACEHOLDER_IMAGE;
    
    // Add error handler
    imgElement.onerror = function() {
        console.warn(`Failed to load image: ${imageUrl}. Using placeholder.`);
        this.src = PLACEHOLDER_IMAGE;
        
        // Remove the onerror handler to prevent infinite loop
        this.onerror = null;
    };
    
    // Add load handler for successful loads
    imgElement.onload = function() {
        console.log(`Successfully loaded image: ${imageUrl}`);
    };
}

/**
 * Apply image error handling to all product images on page
 */
function initializeImageHandling() {
    // Apply to all product images with class 'product-img'
    document.querySelectorAll('.product-img').forEach(img => {
        if (!img.hasAttribute('data-error-handled')) {
            img.setAttribute('data-error-handled', 'true');
            img.addEventListener('error', function() {
                console.warn('Product image failed to load, using placeholder');
                this.src = PLACEHOLDER_IMAGE;
            });
        }
    });
    
    // Apply to cart item images
    document.querySelectorAll('.cart-item-img img').forEach(img => {
        if (!img.hasAttribute('data-error-handled')) {
            img.setAttribute('data-error-handled', 'true');
            img.addEventListener('error', function() {
                this.src = PLACEHOLDER_IMAGE;
            });
        }
    });
}

// ============================================
// CART MANAGEMENT FUNCTIONS
// ============================================

/**
 * Update cart count in the navigation
 */
function updateCartCount() {
    const cartCountElements = document.querySelectorAll('#cart-count');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    cartCountElements.forEach(element => {
        element.textContent = totalItems;
    });
    
    // Update cart items count if on cart page
    const cartItemsCountElement = document.getElementById('cart-items-count');
    if (cartItemsCountElement) {
        cartItemsCountElement.textContent = totalItems;
    }
    
    // Save cart to localStorage
    localStorage.setItem('solowear_cart', JSON.stringify(cart));
}

/**
 * Add item to cart
 * @param {Object} product - Product to add
 * @param {number} quantity - Quantity to add
 */
function addToCart(product, quantity = 1) {
    // Check if product already exists in cart
    const existingItemIndex = cart.findIndex(item => item.id === product.id);
    
    if (existingItemIndex > -1) {
        // Update quantity if product already in cart
        cart[existingItemIndex].quantity += quantity;
    } else {
        // Add new item to cart
        const cartItem = {
            id: product.id,
            name: product.name,
            price: product.price,
            shipping: product.shipping || 200,
            image: product.image || PLACEHOLDER_IMAGE,
            quantity: quantity
        };
        cart.push(cartItem);
    }
    
    updateCartCount();
    
    // Show success message
    showNotification('Product added to cart!', 'success');
    
    // Update cart display if on cart page
    if (window.location.pathname.includes('cart.html')) {
        displayCartItems();
    }
}

/**
 * Remove item from cart
 * @param {string} productId - ID of product to remove
 */
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCartCount();
    
    // Update cart display if on cart page
    if (window.location.pathname.includes('cart.html')) {
        displayCartItems();
    }
    
    // Update checkout display if on checkout page
    if (window.location.pathname.includes('checkout.html')) {
        displayCheckoutItems();
    }
    
    showNotification('Item removed from cart', 'info');
}

/**
 * Update cart item quantity
 * @param {string} productId - ID of product to update
 * @param {number} newQuantity - New quantity
 */
function updateCartItemQuantity(productId, newQuantity) {
    const itemIndex = cart.findIndex(item => item.id === productId);
    
    if (itemIndex > -1) {
        if (newQuantity < 1) {
            // Remove item if quantity is 0
            removeFromCart(productId);
        } else {
            // Update quantity
            cart[itemIndex].quantity = newQuantity;
            updateCartCount();
            
            // Update displays
            if (window.location.pathname.includes('cart.html')) {
                displayCartItems();
            }
            if (window.location.pathname.includes('checkout.html')) {
                displayCheckoutItems();
            }
        }
    }
}

/**
 * Calculate cart totals
 * @returns {Object} Object with subtotal, shipping, and grand total
 */
function calculateCartTotals() {
    let subtotal = 0;
    let shippingTotal = 0;
    
    cart.forEach(item => {
        subtotal += item.price * item.quantity;
        shippingTotal += item.shipping * item.quantity;
    });
    
    // Apply free shipping threshold (PKR 15,000)
    const freeShippingThreshold = 15000;
    if (subtotal >= freeShippingThreshold) {
        shippingTotal = 0;
    }
    
    return {
        subtotal: subtotal,
        shipping: shippingTotal,
        grandTotal: subtotal + shippingTotal
    };
}

// ============================================
// DISPLAY FUNCTIONS
// ============================================

/**
 * Display products on home page
 */
function displayFeaturedProducts() {
    const featuredContainer = document.getElementById('featured-products');
    const shopContainer = document.getElementById('shop-products');
    
    if (!featuredContainer && !shopContainer) return;
    
    const container = featuredContainer || shopContainer;
    const isShopPage = !!shopContainer;
    
    // Show loading state
    if (isShopPage) {
        const loadingSpinner = document.getElementById('loading-spinner');
        if (loadingSpinner) {
            loadingSpinner.style.display = 'block';
        }
    }
    
    // Fetch products from Firebase
    const productsRef = db.ref('products');
    
    productsRef.once('value')
        .then(snapshot => {
            const productsData = snapshot.val();
            products = [];
            
            if (productsData) {
                // Convert object to array
                Object.keys(productsData).forEach(key => {
                    products.push({
                        id: key,
                        ...productsData[key]
                    });
                });
                
                // Filter for featured products on home page (first 4)
                const productsToShow = isShopPage ? 
                    products : 
                    products.slice(0, 4);
                
                // Clear container
                container.innerHTML = '';
                
                // Display each product
                productsToShow.forEach(product => {
                    const productCard = createProductCard(product);
                    container.appendChild(productCard);
                });
                
                // Initialize image handling for new images
                initializeImageHandling();
            } else {
                container.innerHTML = `
                    <div class="no-products">
                        <i class="fas fa-box-open"></i>
                        <h3>No products yet</h3>
                        <p>Check back soon for our luxury collection</p>
                    </div>
                `;
            }
        })
        .catch(error => {
            console.error('Error fetching products:', error);
            container.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Unable to load products</h3>
                    <p>Please check your connection and try again</p>
                </div>
            `;
        })
        .finally(() => {
            // Hide loading spinner
            if (isShopPage) {
                const loadingSpinner = document.getElementById('loading-spinner');
                if (loadingSpinner) {
                    loadingSpinner.style.display = 'none';
                }
            }
        });
}

/**
 * Create product card HTML
 * @param {Object} product - Product data
 * @returns {HTMLElement} Product card element
 */
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.setAttribute('data-id', product.id);
    card.setAttribute('data-category', product.category || '');
    
    card.innerHTML = `
        <div class="product-img-container">
            <img src="${product.image || PLACEHOLDER_IMAGE}" 
                 alt="${product.name}" 
                 class="product-img"
                 onerror="this.src='${PLACEHOLDER_IMAGE}'">
        </div>
        <div class="product-info">
            <h3>${product.name}</h3>
            <div class="product-price">PKR ${product.price.toLocaleString()}</div>
            <div class="product-shipping">
                <i class="fas fa-shipping-fast"></i> + Shipping: PKR ${(product.shipping || 200).toLocaleString()}
            </div>
            <button class="btn btn-primary view-product-btn" data-id="${product.id}">
                View Details
            </button>
        </div>
    `;
    
    // Add event listener to view product button
    const viewBtn = card.querySelector('.view-product-btn');
    viewBtn.addEventListener('click', function() {
        const productId = this.getAttribute('data-id');
        window.location.href = `product.html?id=${productId}`;
    });
    
    return card;
}

/**
 * Display product details on product page
 */
function displayProductDetails() {
    const productId = localStorage.getItem('currentProductId');
    if (!productId) return;
    
    // Fetch product from Firebase
    const productRef = db.ref(`products/${productId}`);
    
    productRef.once('value')
        .then(snapshot => {
            const product = snapshot.val();
            
            if (product) {
                // Update product details
                document.getElementById('product-name').textContent = product.name;
                document.getElementById('product-price').textContent = `PKR ${product.price.toLocaleString()}`;
                document.getElementById('product-shipping').textContent = `PKR ${(product.shipping || 200).toLocaleString()}`;
                document.getElementById('product-description').textContent = product.description || 'No description available.';
                document.getElementById('product-category-text').textContent = product.category || 'Uncategorized';
                
                // Update image with error handling
                const mainImage = document.getElementById('main-product-image');
                loadImageWithFallback(product.image, mainImage);
                
                // Update breadcrumb category
                const categoryElement = document.getElementById('product-category');
                if (categoryElement) {
                    categoryElement.textContent = product.category || 'Product';
                }
                
                // Add to cart button functionality
                const addToCartBtn = document.getElementById('add-to-cart');
                const buyNowBtn = document.getElementById('buy-now');
                const quantityInput = document.getElementById('quantity');
                
                if (addToCartBtn) {
                    addToCartBtn.addEventListener('click', function() {
                        const quantity = parseInt(quantityInput.value) || 1;
                        addToCart({
                            id: productId,
                            name: product.name,
                            price: product.price,
                            shipping: product.shipping || 200,
                            image: product.image
                        }, quantity);
                    });
                }
                
                if (buyNowBtn) {
                    buyNowBtn.addEventListener('click', function() {
                        const quantity = parseInt(quantityInput.value) || 1;
                        addToCart({
                            id: productId,
                            name: product.name,
                            price: product.price,
                            shipping: product.shipping || 200,
                            image: product.image
                        }, quantity);
                        // Redirect to cart page
                        setTimeout(() => {
                            window.location.href = 'cart.html';
                        }, 500);
                    });
                }
                
                // Display related products (excluding current product)
                displayRelatedProducts(productId, product.category);
            } else {
                // Product not found
                document.querySelector('.product-detail-grid').innerHTML = `
                    <div class="product-not-found">
                        <i class="fas fa-exclamation-circle"></i>
                        <h2>Product Not Found</h2>
                        <p>The product you're looking for doesn't exist or has been removed.</p>
                        <a href="shop.html" class="btn btn-primary">Back to Collection</a>
                    </div>
                `;
            }
        })
        .catch(error => {
            console.error('Error fetching product:', error);
        });
}

/**
 * Display related products
 * @param {string} currentProductId - ID of current product
 * @param {string} category - Category of current product
 */
function displayRelatedProducts(currentProductId, category) {
    const relatedContainer = document.getElementById('related-products');
    if (!relatedContainer) return;
    
    // Fetch products from Firebase
    const productsRef = db.ref('products');
    
    productsRef.once('value')
        .then(snapshot => {
            const productsData = snapshot.val();
            const relatedProducts = [];
            
            if (productsData) {
                // Convert object to array and filter
                Object.keys(productsData).forEach(key => {
                    if (key !== currentProductId) {
                        const product = { id: key, ...productsData[key] };
                        
                        // Show products from same category, or all if no category match
                        if (!category || product.category === category) {
                            relatedProducts.push(product);
                        }
                    }
                });
                
                // Limit to 4 products
                const productsToShow = relatedProducts.slice(0, 4);
                
                // Clear container
                relatedContainer.innerHTML = '';
                
                // Display related products
                if (productsToShow.length > 0) {
                    productsToShow.forEach(product => {
                        const productCard = createProductCard(product);
                        relatedContainer.appendChild(productCard);
                    });
                } else {
                    relatedContainer.innerHTML = `
                        <div class="no-related-products">
                            <p>No related products found.</p>
                        </div>
                    `;
                }
                
                // Initialize image handling
                initializeImageHandling();
            }
        })
        .catch(error => {
            console.error('Error fetching related products:', error);
        });
}

/**
 * Display cart items on cart page
 */
function displayCartItems() {
    const cartItemsList = document.getElementById('cart-items-list');
    const emptyCartElement = document.getElementById('empty-cart');
    const checkoutBtn = document.getElementById('checkout-btn');
    
    if (!cartItemsList) return;
    
    if (cart.length === 0) {
        // Show empty cart message
        if (emptyCartElement) emptyCartElement.style.display = 'block';
        cartItemsList.innerHTML = '';
        
        // Disable checkout button
        if (checkoutBtn) {
            checkoutBtn.style.opacity = '0.5';
            checkoutBtn.style.pointerEvents = 'none';
        }
        
        // Update totals to zero
        updateCartTotalsDisplay();
        return;
    }
    
    // Hide empty cart message
    if (emptyCartElement) emptyCartElement.style.display = 'none';
    
    // Enable checkout button
    if (checkoutBtn) {
        checkoutBtn.style.opacity = '1';
        checkoutBtn.style.pointerEvents = 'auto';
    }
    
    // Clear current items
    cartItemsList.innerHTML = '';
    
    // Display each cart item
    cart.forEach(item => {
        const cartItemElement = document.createElement('div');
        cartItemElement.className = 'cart-item';
        cartItemElement.setAttribute('data-id', item.id);
        
        cartItemElement.innerHTML = `
            <div class="cart-item-img">
                <img src="${item.image || PLACEHOLDER_IMAGE}" 
                     alt="${item.name}"
                     onerror="this.src='${PLACEHOLDER_IMAGE}'">
            </div>
            <div class="cart-item-details">
                <h3>${item.name}</h3>
                <div class="cart-item-price">PKR ${item.price.toLocaleString()}</div>
                <div class="cart-item-shipping">
                    <i class="fas fa-shipping-fast"></i> Shipping: PKR ${item.shipping.toLocaleString()} per item
                </div>
                <div class="cart-item-quantity">
                    <button class="decrease-qty" data-id="${item.id}">-</button>
                    <input type="number" value="${item.quantity}" min="1" max="10" data-id="${item.id}">
                    <button class="increase-qty" data-id="${item.id}">+</button>
                </div>
            </div>
            <button class="cart-item-remove" data-id="${item.id}">
                <i class="fas fa-trash"></i>
            </button>
        `;
        
        cartItemsList.appendChild(cartItemElement);
    });
    
    // Add event listeners for quantity changes and removal
    document.querySelectorAll('.decrease-qty').forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-id');
            const item = cart.find(item => item.id === productId);
            if (item) {
                updateCartItemQuantity(productId, item.quantity - 1);
            }
        });
    });
    
    document.querySelectorAll('.increase-qty').forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-id');
            const item = cart.find(item => item.id === productId);
            if (item) {
                updateCartItemQuantity(productId, item.quantity + 1);
            }
        });
    });
    
    document.querySelectorAll('.cart-item-quantity input').forEach(input => {
        input.addEventListener('change', function() {
            const productId = this.getAttribute('data-id');
            const newQuantity = parseInt(this.value) || 1;
            updateCartItemQuantity(productId, newQuantity);
        });
    });
    
    document.querySelectorAll('.cart-item-remove').forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-id');
            removeFromCart(productId);
        });
    });
    
    // Update totals display
    updateCartTotalsDisplay();
    
    // Initialize image handling
    initializeImageHandling();
}

/**
 * Update cart totals display on cart page
 */
function updateCartTotalsDisplay() {
    const totals = calculateCartTotals();
    
    document.getElementById('subtotal').textContent = `PKR ${totals.subtotal.toLocaleString()}`;
    document.getElementById('shipping-total').textContent = `PKR ${totals.shipping.toLocaleString()}`;
    document.getElementById('grand-total').textContent = `PKR ${totals.grandTotal.toLocaleString()}`;
}

/**
 * Display checkout items on checkout page
 */
function displayCheckoutItems() {
    const checkoutItemsContainer = document.getElementById('checkout-items');
    if (!checkoutItemsContainer) return;
    
    if (cart.length === 0) {
        // Redirect to cart if cart is empty
        window.location.href = 'cart.html';
        return;
    }
    
    // Clear current items
    checkoutItemsContainer.innerHTML = '';
    
    // Display each cart item
    cart.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'order-item';
        
        itemElement.innerHTML = `
            <div class="order-item-name">
                ${item.name} <span class="item-quantity">× ${item.quantity}</span>
            </div>
            <div class="order-item-price">
                PKR ${(item.price * item.quantity).toLocaleString()}
            </div>
        `;
        
        checkoutItemsContainer.appendChild(itemElement);
    });
    
    // Update checkout totals
    updateCheckoutTotalsDisplay();
}

/**
 * Update checkout totals display
 */
function updateCheckoutTotalsDisplay() {
    const totals = calculateCartTotals();
    
    document.getElementById('checkout-subtotal').textContent = `PKR ${totals.subtotal.toLocaleString()}`;
    document.getElementById('checkout-shipping').textContent = `PKR ${totals.shipping.toLocaleString()}`;
    document.getElementById('checkout-grand-total').textContent = `PKR ${totals.grandTotal.toLocaleString()}`;
}

// ============================================
// ADMIN PANEL FUNCTIONS
// ============================================

/**
 * Initialize admin panel
 */
function initializeAdminPanel() {
    // Check if we're on the admin page
    if (!window.location.pathname.includes('admin.html')) return;
    
    // Check if user is already logged in
    const isLoggedIn = localStorage.getItem('solowear_admin_logged_in') === 'true';
    
    if (isLoggedIn) {
        showAdminPanel();
    } else {
        showLoginForm();
    }
    
    // Login form submission
    const loginBtn = document.getElementById('login-btn');
    if (loginBtn) {
        loginBtn.addEventListener('click', handleAdminLogin);
    }
    
    // Logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleAdminLogout);
    }
    
    // Tab switching
    document.querySelectorAll('.admin-nav a').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const tabId = this.getAttribute('data-tab');
            switchAdminTab(tabId);
            
            // Update active state
            document.querySelectorAll('.admin-nav a').forEach(item => {
                item.classList.remove('active');
            });
            this.classList.add('active');
        });
    });
    
    // Add product form submission
    const addProductForm = document.getElementById('add-product-form');
    if (addProductForm) {
        addProductForm.addEventListener('submit', handleAddProduct);
        
        // Image preview
        const imageInput = document.getElementById('product-image');
        const imagePreview = document.getElementById('image-preview');
        
        if (imageInput && imagePreview) {
            imageInput.addEventListener('input', function() {
                if (this.value) {
                    loadImageWithFallback(this.value, imagePreview);
                    imagePreview.style.display = 'block';
                } else {
                    imagePreview.style.display = 'none';
                }
            });
        }
    }
    
    // Save settings
    const saveSettingsBtn = document.getElementById('save-settings');
    if (saveSettingsBtn) {
        saveSettingsBtn.addEventListener('click', saveAdminSettings);
    }
    
    // Load products for management table
    loadProductsForAdmin();
    
    // Load dashboard stats
    loadDashboardStats();
}

/**
 * Handle admin login
 */
function handleAdminLogin() {
    const pinInput = document.getElementById('pin');
    const pinError = document.getElementById('pin-error');
    
    if (!pinInput || !pinError) return;
    
    const enteredPin = pinInput.value.trim();
    
    if (enteredPin === ADMIN_PIN) {
        // Successful login
        localStorage.setItem('solowear_admin_logged_in', 'true');
        showAdminPanel();
        showNotification('Admin access granted', 'success');
    } else {
        // Failed login
        pinError.textContent = 'Invalid PIN. Please try again.';
        pinInput.focus();
        
        // Shake animation for error
        pinInput.style.animation = 'shake 0.5s';
        setTimeout(() => {
            pinInput.style.animation = '';
        }, 500);
    }
}

/**
 * Handle admin logout
 */
function handleAdminLogout() {
    localStorage.removeItem('solowear_admin_logged_in');
    showLoginForm();
    showNotification('Logged out successfully', 'info');
}

/**
 * Show login form
 */
function showLoginForm() {
    const loginSection = document.getElementById('admin-login');
    const adminPanel = document.getElementById('admin-panel');
    
    if (loginSection) loginSection.style.display = 'flex';
    if (adminPanel) adminPanel.style.display = 'none';
    
    // Clear PIN input
    const pinInput = document.getElementById('pin');
    if (pinInput) pinInput.value = '';
}

/**
 * Show admin panel
 */
function showAdminPanel() {
    const loginSection = document.getElementById('admin-login');
    const adminPanel = document.getElementById('admin-panel');
    
    if (loginSection) loginSection.style.display = 'none';
    if (adminPanel) adminPanel.style.display = 'block';
}

/**
 * Switch admin tabs
 * @param {string} tabId - ID of tab to show
 */
function switchAdminTab(tabId) {
    // Hide all tabs
    document.querySelectorAll('.admin-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Show selected tab
    const selectedTab = document.getElementById(`${tabId}-tab`);
    if (selectedTab) {
        selectedTab.classList.add('active');
    }
}

/**
 * Handle adding a new product
 * @param {Event} e - Form submit event
 */
function handleAddProduct(e) {
    e.preventDefault();
    
    // Get form values
    const name = document.getElementById('product-name').value.trim();
    const category = document.getElementById('product-category').value;
    const image = document.getElementById('product-image').value.trim();
    const price = parseFloat(document.getElementById('product-price').value);
    const shipping = parseFloat(document.getElementById('product-shipping').value);
    const description = document.getElementById('product-description').value.trim();
    
    // Validate inputs
    if (!name || !category || !image || !price || !shipping || !description) {
        showFormStatus('Please fill in all required fields', 'error');
        return;
    }
    
    if (price <= 0) {
        showFormStatus('Price must be greater than 0', 'error');
        return;
    }
    
    if (shipping < 0) {
        showFormStatus('Shipping fee cannot be negative', 'error');
        return;
    }
    
    // Create product object
    const product = {
        name,
        category,
        image,
        price,
        shipping,
        description,
        createdAt: new Date().toISOString()
    };
    
    // Save to Firebase
    const productsRef = db.ref('products');
    const newProductRef = productsRef.push();
    
    newProductRef.set(product)
        .then(() => {
            // Success
            showFormStatus('Product added successfully!', 'success');
            
            // Reset form
            e.target.reset();
            
            // Clear image preview
            const imagePreview = document.getElementById('image-preview');
            if (imagePreview) {
                imagePreview.style.display = 'none';
            }
            
            // Refresh products table
            loadProductsForAdmin();
            
            // Refresh dashboard stats
            loadDashboardStats();
            
            // Switch to manage products tab
            switchAdminTab('manage-products');
            document.querySelectorAll('.admin-nav a').forEach(item => {
                item.classList.remove('active');
                if (item.getAttribute('data-tab') === 'manage-products') {
                    item.classList.add('active');
                }
            });
        })
        .catch(error => {
            console.error('Error adding product:', error);
            showFormStatus('Failed to add product. Please try again.', 'error');
        });
}

/**
 * Show form status message
 * @param {string} message - Status message
 * @param {string} type - 'success' or 'error'
 */
function showFormStatus(message, type) {
    const statusElement = document.getElementById('form-status');
    if (!statusElement) return;
    
    statusElement.textContent = message;
    statusElement.className = `form-status ${type}`;
    
    // Clear after 5 seconds
    setTimeout(() => {
        statusElement.textContent = '';
        statusElement.className = 'form-status';
    }, 5000);
}

/**
 * Load products for admin management table
 */
function loadProductsForAdmin() {
    const tableBody = document.getElementById('products-table-body');
    if (!tableBody) return;
    
    // Fetch products from Firebase
    const productsRef = db.ref('products');
    
    productsRef.once('value')
        .then(snapshot => {
            const productsData = snapshot.val();
            
            // Clear table
            tableBody.innerHTML = '';
            
            if (productsData) {
                // Convert object to array
                const productsArray = Object.keys(productsData).map(key => ({
                    id: key,
                    ...productsData[key]
                }));
                
                // Update total products count
                const totalProductsElement = document.getElementById('total-products');
                if (totalProductsElement) {
                    totalProductsElement.textContent = productsArray.length;
                }
                
                // Add each product to table
                productsArray.forEach(product => {
                    const row = document.createElement('tr');
                    
                    row.innerHTML = `
                        <td>
                            <img src="${product.image || PLACEHOLDER_IMAGE}" 
                                 alt="${product.name}"
                                 onerror="this.src='${PLACEHOLDER_IMAGE}'">
                        </td>
                        <td>${product.name}</td>
                        <td>${product.category || 'Uncategorized'}</td>
                        <td>PKR ${product.price.toLocaleString()}</td>
                        <td>PKR ${(product.shipping || 200).toLocaleString()}</td>
                        <td class="product-actions-cell">
                            <button class="edit-btn" data-id="${product.id}">
                                <i class="fas fa-edit"></i> Edit
                            </button>
                            <button class="delete-btn" data-id="${product.id}">
                                <i class="fas fa-trash"></i> Delete
                            </button>
                        </td>
                    `;
                    
                    tableBody.appendChild(row);
                });
                
                // Add event listeners for edit/delete buttons
                document.querySelectorAll('.edit-btn').forEach(button => {
                    button.addEventListener('click', function() {
                        const productId = this.getAttribute('data-id');
                        editProduct(productId);
                    });
                });
                
                document.querySelectorAll('.delete-btn').forEach(button => {
                    button.addEventListener('click', function() {
                        const productId = this.getAttribute('data-id');
                        deleteProduct(productId);
                    });
                });
            } else {
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="6" class="no-data">No products found. Add your first product.</td>
                    </tr>
                `;
            }
        })
        .catch(error => {
            console.error('Error loading products:', error);
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="no-data">Error loading products. Please try again.</td>
                </tr>
            `;
        });
}

/**
 * Edit product
 * @param {string} productId - ID of product to edit
 */
function editProduct(productId) {
    // Fetch product details
    const productRef = db.ref(`products/${productId}`);
    
    productRef.once('value')
        .then(snapshot => {
            const product = snapshot.val();
            
            if (product) {
                // Populate form with product data
                document.getElementById('product-name').value = product.name || '';
                document.getElementById('product-category').value = product.category || '';
                document.getElementById('product-image').value = product.image || '';
                document.getElementById('product-price').value = product.price || '';
                document.getElementById('product-shipping').value = product.shipping || 200;
                document.getElementById('product-description').value = product.description || '';
                
                // Show image preview
                const imagePreview = document.getElementById('image-preview');
                if (imagePreview && product.image) {
                    loadImageWithFallback(product.image, imagePreview);
                    imagePreview.style.display = 'block';
                }
                
                // Update form to edit mode
                const form = document.getElementById('add-product-form');
                const submitButton = form.querySelector('button[type="submit"]');
                const formTitle = document.querySelector('#add-product-tab h2');
                
                // Change button text
                submitButton.innerHTML = '<i class="fas fa-save"></i> Update Product';
                
                // Change form title
                formTitle.innerHTML = '<i class="fas fa-edit"></i> Edit Product';
                
                // Store product ID for update
                form.setAttribute('data-edit-id', productId);
                
                // Switch to add product tab
                switchAdminTab('add-product');
                document.querySelectorAll('.admin-nav a').forEach(item => {
                    item.classList.remove('active');
                    if (item.getAttribute('data-tab') === 'add-product') {
                        item.classList.add('active');
                    }
                });
                
                showNotification('Product loaded for editing', 'info');
            }
        })
        .catch(error => {
            console.error('Error fetching product for edit:', error);
            showNotification('Failed to load product for editing', 'error');
        });
}

/**
 * Delete product
 * @param {string} productId - ID of product to delete
 */
function deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
        return;
    }
    
    const productRef = db.ref(`products/${productId}`);
    
    productRef.remove()
        .then(() => {
            showNotification('Product deleted successfully', 'success');
            loadProductsForAdmin();
            loadDashboardStats();
        })
        .catch(error => {
            console.error('Error deleting product:', error);
            showNotification('Failed to delete product', 'error');
        });
}

/**
 * Load dashboard statistics
 */
function loadDashboardStats() {
    // Load products count
    const productsRef = db.ref('products');
    
    productsRef.once('value')
        .then(snapshot => {
            const productsData = snapshot.val();
            const productCount = productsData ? Object.keys(productsData).length : 0;
            
            document.getElementById('total-products').textContent = productCount;
        });
    
    // Load orders (this would come from an 'orders' node in Firebase)
    // For now, we'll set it to 0 as we haven't implemented orders
    document.getElementById('total-orders').textContent = '0';
    document.getElementById('total-revenue').textContent = 'PKR 0';
}

/**
 * Save admin settings
 */
function saveAdminSettings() {
    // In a real implementation, this would save to Firebase
    showNotification('Settings saved successfully', 'success');
}

// ============================================
// UI UTILITY FUNCTIONS
// ============================================

/**
 * Show notification message
 * @param {string} message - Notification message
 * @param {string} type - Notification type: 'success', 'error', 'info'
 */
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close">&times;</button>
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Add styles if not already added
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            .notification {
                position: fixed;
                top: 100px;
                right: 20px;
                background: white;
                padding: 15px 20px;
                border-radius: 8px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.15);
                display: flex;
                align-items: center;
                justify-content: space-between;
                min-width: 300px;
                max-width: 400px;
                z-index: 9999;
                transform: translateX(120%);
                transition: transform 0.3s ease;
                border-left: 4px solid #ddd;
            }
            .notification.show {
                transform: translateX(0);
            }
            .notification-success {
                border-left-color: #4CAF50;
            }
            .notification-error {
                border-left-color: #f44336;
            }
            .notification-info {
                border-left-color: #2196F3;
            }
            .notification-content {
                display: flex;
                align-items: center;
                gap: 10px;
                flex: 1;
            }
            .notification-content i {
                font-size: 1.2rem;
            }
            .notification-success .notification-content i {
                color: #4CAF50;
            }
            .notification-error .notification-content i {
                color: #f44336;
            }
            .notification-info .notification-content i {
                color: #2196F3;
            }
            .notification-close {
                background: none;
                border: none;
                font-size: 1.5rem;
                cursor: pointer;
                color: #999;
                margin-left: 15px;
            }
        `;
        document.head.appendChild(style);
    }
    
    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 5000);
    
    // Close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    });
}

/**
 * Initialize mobile navigation
 */
function initializeMobileNav() {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    
    if (hamburger && navLinks) {
        hamburger.addEventListener('click', function() {
            this.classList.toggle('active');
            navLinks.classList.toggle('active');
        });
        
        // Close mobile menu when clicking a link
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navLinks.classList.remove('active');
            });
        });
    }
}

/**
 * Initialize filter and sort functionality for shop page
 */
function initializeShopFilters() {
    const categoryFilter = document.getElementById('category-filter');
    const priceFilter = document.getElementById('price-filter');
    const sortOptions = document.getElementById('sort-options');
    
    if (categoryFilter) {
        categoryFilter.addEventListener('change', filterProducts);
    }
    
    if (priceFilter) {
        priceFilter.addEventListener('change', filterProducts);
    }
    
    if (sortOptions) {
        sortOptions.addEventListener('change', sortProducts);
    }
}

/**
 * Filter products based on selected filters
 */
function filterProducts() {
    const categoryFilter = document.getElementById('category-filter');
    const priceFilter = document.getElementById('price-filter');
    
    if (!categoryFilter || !priceFilter) return;
    
    const selectedCategory = categoryFilter.value;
    const selectedPriceRange = priceFilter.value;
    
    const productCards = document.querySelectorAll('.product-card');
    
    productCards.forEach(card => {
        let showCard = true;
        
        // Category filter
        if (selectedCategory !== 'all') {
            const cardCategory = card.getAttribute('data-category');
            if (cardCategory !== selectedCategory) {
                showCard = false;
            }
        }
        
        // Price filter
        if (showCard && selectedPriceRange !== 'all') {
            const priceText = card.querySelector('.product-price').textContent;
            const price = parseInt(priceText.replace(/[^0-9]/g, ''));
            
            switch (selectedPriceRange) {
                case '0-5000':
                    if (price > 5000) showCard = false;
                    break;
                case '5000-10000':
                    if (price < 5000 || price > 10000) showCard = false;
                    break;
                case '10000-20000':
                    if (price < 10000 || price > 20000) showCard = false;
                    break;
                case '20000+':
                    if (price < 20000) showCard = false;
                    break;
            }
        }
        
        // Show/hide card
        card.style.display = showCard ? 'block' : 'none';
    });
}

/**
 * Sort products based on selected option
 */
function sortProducts() {
    const sortOptions = document.getElementById('sort-options');
    if (!sortOptions) return;
    
    const selectedSort = sortOptions.value;
    const productsContainer = document.getElementById('shop-products');
    
    if (!productsContainer) return;
    
    const productCards = Array.from(productsContainer.querySelectorAll('.product-card'));
    
    // Sort based on selected option
    productCards.sort((a, b) => {
        switch (selectedSort) {
            case 'price-low':
                const priceA = parseInt(a.querySelector('.product-price').textContent.replace(/[^0-9]/g, ''));
                const priceB = parseInt(b.querySelector('.product-price').textContent.replace(/[^0-9]/g, ''));
                return priceA - priceB;
                
            case 'price-high':
                const priceAHigh = parseInt(a.querySelector('.product-price').textContent.replace(/[^0-9]/g, ''));
                const priceBHigh = parseInt(b.querySelector('.product-price').textContent.replace(/[^0-9]/g, ''));
                return priceBHigh - priceAHigh;
                
            case 'name':
                const nameA = a.querySelector('h3').textContent.toLowerCase();
                const nameB = b.querySelector('h3').textContent.toLowerCase();
                return nameA.localeCompare(nameB);
                
            case 'newest':
            default:
                return 0; // Keep as-is (newest first by default)
        }
    });
    
    // Reorder products in container
    productCards.forEach(card => {
        productsContainer.appendChild(card);
    });
}

/**
 * Initialize checkout form
 */
function initializeCheckoutForm() {
    const checkoutForm = document.getElementById('checkout-form');
    
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Validate policy agreement
            const policyAgree = document.getElementById('policy-agree');
            if (!policyAgree.checked) {
                showNotification('You must agree to the no returns policy to proceed', 'error');
                policyAgree.focus();
                return;
            }
            
            // Get form data
            const formData = {
                name: document.getElementById('full-name').value,
                email: document.getElementById('email').value,
                address: document.getElementById('address').value,
                city: document.getElementById('city').value,
                zip: document.getElementById('zip').value,
                country: document.getElementById('country').value,
                phone: document.getElementById('phone').value,
                notes: document.getElementById('notes').value,
                cart: cart,
                totals: calculateCartTotals(),
                date: new Date().toISOString()
            };
            
            // In a real implementation, you would save the order to Firebase
            // and process payment
            
            // For demo purposes, simulate order processing
            showNotification('Order placed successfully! Thank you for your purchase.', 'success');
            
            // Clear cart
            cart = [];
            updateCartCount();
            localStorage.removeItem('solowear_cart');
            
            // Reset form
            checkoutForm.reset();
            
            // Redirect to home page after 3 seconds
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 3000);
        });
    }
}

// ============================================
// INITIALIZATION
// ============================================

/**
 * Initialize the application based on current page
 */
function initializeApp() {
    // Initialize mobile navigation
    initializeMobileNav();
    
    // Initialize image handling
    initializeImageHandling();
    
    // Update cart count on all pages
    updateCartCount();
    
    // Page-specific initializations
    if (window.location.pathname.includes('index.html') || 
        window.location.pathname === '/' || 
        window.location.pathname.endsWith('/')) {
        // Home page
        displayFeaturedProducts();
    } else if (window.location.pathname.includes('shop.html')) {
        // Shop page
        displayFeaturedProducts();
        initializeShopFilters();
    } else if (window.location.pathname.includes('product.html')) {
        // Product page
        displayProductDetails();
    } else if (window.location.pathname.includes('cart.html')) {
        // Cart page
        displayCartItems();
    } else if (window.location.pathname.includes('checkout.html')) {
        // Checkout page
        displayCheckoutItems();
        initializeCheckoutForm();
    } else if (window.location.pathname.includes('admin.html')) {
        // Admin page
        initializeAdminPanel();
    }
    
    // Add CSS animation for shake effect
    const shakeStyle = document.createElement('style');
    shakeStyle.textContent = `
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
            20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
    `;
    document.head.appendChild(shakeStyle);
}

// ============================================
// START THE APPLICATION
// ============================================

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', initializeApp);

// Also initialize when page is fully loaded
window.addEventListener('load', function() {
    // Additional initialization after all resources are loaded
    console.log('Solo Wear 2025 - Luxury Fashion Platform Loaded');
});
