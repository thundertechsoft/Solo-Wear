// ============================================
// SOLO WEAR - ULTRA PREMIUM FASHION WEBSITE
// Main JavaScript File
// ============================================

// DOM Elements
document.addEventListener('DOMContentLoaded', function() {
    // Initialize mobile menu
    initMobileMenu();
    
    // Initialize all page-specific functionality
    initPageFunctions();
});

// Initialize mobile menu functionality
function initMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    
    if (hamburger && navLinks) {
        hamburger.addEventListener('click', function() {
            navLinks.classList.toggle('active');
            hamburger.classList.toggle('active');
        });
        
        // Close menu when clicking a link
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                hamburger.classList.remove('active');
            });
        });
    }
}

// Initialize page-specific functionality
function initPageFunctions() {
    // Update cart count on all pages
    updateCartCount();
    
    // Initialize product quick view modals
    initQuickView();
    
    // Initialize size selectors on product detail page
    initSizeSelectors();
}

// ============================================
// CART FUNCTIONALITY
// ============================================

// Update cart count in the header
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartCountElements = document.querySelectorAll('#cart-count');
    
    cartCountElements.forEach(element => {
        element.textContent = cart.reduce((total, item) => total + item.quantity, 0);
    });
}

// Add item to cart
function addToCart(productId, productName, productPrice, size = 'M', quantity = 1) {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Check if product already exists in cart with same size
    const existingItemIndex = cart.findIndex(item => 
        item.id === productId && item.size === size
    );
    
    if (existingItemIndex > -1) {
        // Update quantity if item already exists
        cart[existingItemIndex].quantity += quantity;
    } else {
        // Add new item to cart
        cart.push({
            id: productId,
            name: productName,
            price: productPrice,
            size: size,
            quantity: quantity,
            image: getProductImage(productId)
        });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    
    // Show success notification
    showNotification(`${productName} added to cart!`, 'success');
    
    return cart;
}

// Remove item from cart
function removeFromCart(productId, size) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    cart = cart.filter(item => !(item.id === productId && item.size === size));
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    
    // Reload cart page if we're on it
    if (window.location.pathname.includes('cart.html')) {
        loadCartItems();
    }
    
    return cart;
}

// Update cart item quantity
function updateCartItemQuantity(productId, size, newQuantity) {
    if (newQuantity < 1) {
        removeFromCart(productId, size);
        return;
    }
    
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const itemIndex = cart.findIndex(item => 
        item.id === productId && item.size === size
    );
    
    if (itemIndex > -1) {
        cart[itemIndex].quantity = newQuantity;
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        
        // Reload cart page if we're on it
        if (window.location.pathname.includes('cart.html')) {
            loadCartItems();
        }
    }
    
    return cart;
}

// Calculate cart totals
function calculateCartTotals() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const deliveryFee = subtotal > 10000 ? 0 : 500;
    const total = subtotal + deliveryFee;
    
    return {
        subtotal: subtotal,
        delivery: deliveryFee,
        total: total
    };
}

// Format price in PKR
function formatPrice(price) {
    return new Intl.NumberFormat('en-PK', {
        style: 'currency',
        currency: 'PKR',
        minimumFractionDigits: 0
    }).format(price);
}

// Load cart items on cart page
function loadCartItems() {
    const cartItemsContainer = document.getElementById('cart-items');
    const emptyCartElement = document.getElementById('empty-cart');
    const cartTable = document.getElementById('cart-table');
    const subtotalElement = document.getElementById('subtotal');
    const deliveryElement = document.getElementById('delivery');
    const totalElement = document.getElementById('total');
    
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    if (cart.length === 0) {
        if (cartItemsContainer) cartItemsContainer.innerHTML = '';
        if (emptyCartElement) emptyCartElement.style.display = 'block';
        if (cartTable) cartTable.style.display = 'none';
        
        // Update totals
        const totals = calculateCartTotals();
        if (subtotalElement) subtotalElement.textContent = formatPrice(totals.subtotal);
        if (deliveryElement) deliveryElement.textContent = formatPrice(totals.delivery);
        if (totalElement) totalElement.textContent = formatPrice(totals.total);
        
        return;
    }
    
    if (emptyCartElement) emptyCartElement.style.display = 'none';
    if (cartTable) cartTable.style.display = 'table';
    
    // Generate cart items HTML
    let cartItemsHTML = '';
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        
        cartItemsHTML += `
            <tr>
                <td>
                    <div class="cart-item-info">
                        <div class="cart-item-image">
                            <img src="${item.image || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23222"/><text x="50" y="50" text-anchor="middle" dy=".3em" fill="%23D4AF37" font-size="14">SOLO</text></svg>'}" alt="${item.name}">
                        </div>
                        <div>
                            <div class="cart-item-name">${item.name}</div>
                            <div class="cart-item-size">Size: ${item.size}</div>
                        </div>
                    </div>
                </td>
                <td class="cart-item-price">${formatPrice(item.price)}</td>
                <td>${item.size}</td>
                <td>
                    <div class="quantity-control">
                        <button class="quantity-btn decrease-btn" data-id="${item.id}" data-size="${item.size}">-</button>
                        <span class="quantity-value">${item.quantity}</span>
                        <button class="quantity-btn increase-btn" data-id="${item.id}" data-size="${item.size}">+</button>
                    </div>
                </td>
                <td class="cart-item-total">${formatPrice(itemTotal)}</td>
                <td>
                    <span class="remove-item" data-id="${item.id}" data-size="${item.size}">
                        <i class="fas fa-trash"></i>
                    </span>
                </td>
            </tr>
        `;
    });
    
    if (cartItemsContainer) {
        cartItemsContainer.innerHTML = cartItemsHTML;
        
        // Add event listeners to quantity buttons
        document.querySelectorAll('.decrease-btn').forEach(button => {
            button.addEventListener('click', function() {
                const productId = this.getAttribute('data-id');
                const size = this.getAttribute('data-size');
                const cart = JSON.parse(localStorage.getItem('cart')) || [];
                const item = cart.find(item => item.id === productId && item.size === size);
                
                if (item) {
                    updateCartItemQuantity(productId, size, item.quantity - 1);
                }
            });
        });
        
        document.querySelectorAll('.increase-btn').forEach(button => {
            button.addEventListener('click', function() {
                const productId = this.getAttribute('data-id');
                const size = this.getAttribute('data-size');
                const cart = JSON.parse(localStorage.getItem('cart')) || [];
                const item = cart.find(item => item.id === productId && item.size === size);
                
                if (item) {
                    updateCartItemQuantity(productId, size, item.quantity + 1);
                }
            });
        });
        
        // Add event listeners to remove buttons
        document.querySelectorAll('.remove-item').forEach(button => {
            button.addEventListener('click', function() {
                const productId = this.getAttribute('data-id');
                const size = this.getAttribute('data-size');
                
                if (confirm('Are you sure you want to remove this item from your cart?')) {
                    removeFromCart(productId, size);
                }
            });
        });
    }
    
    // Update totals
    const totals = calculateCartTotals();
    if (subtotalElement) subtotalElement.textContent = formatPrice(totals.subtotal);
    if (deliveryElement) deliveryElement.textContent = formatPrice(totals.delivery);
    if (totalElement) totalElement.textContent = formatPrice(totals.total);
}

// ============================================
// PRODUCT FUNCTIONALITY
// ============================================

// Get product image (placeholder or from data)
function getProductImage(productId) {
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const product = products.find(p => p.id == productId);
    
    if (product && product.image) {
        return product.image;
    }
    
    // Return placeholder based on ID
    const placeholderColors = ['#1a1a1a', '#2a2a2a', '#3a3a2a', '#2a3a2a', '#1a3a3a'];
    const colorIndex = productId % placeholderColors.length;
    
    return `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect width="400" height="400" fill="${placeholderColors[colorIndex]}"/><text x="200" y="200" text-anchor="middle" dy=".3em" fill="%23D4AF37" font-size="30" font-family="Arial">SOLO WEAR</text></svg>`;
}

// Load products on shop page
function loadProducts(searchTerm = '', sortBy = 'default') {
    const productGrid = document.getElementById('product-grid');
    const noProductsElement = document.getElementById('no-products');
    
    if (!productGrid) return;
    
    const products = JSON.parse(localStorage.getItem('products')) || [];
    
    // Filter products by search term
    let filteredProducts = products;
    if (searchTerm) {
        filteredProducts = products.filter(product => 
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }
    
    // Sort products
    switch(sortBy) {
        case 'price-low':
            filteredProducts.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            filteredProducts.sort((a, b) => b.price - a.price);
            break;
        case 'name':
            filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
            break;
        default:
            // Default sorting (by ID or as stored)
            break;
    }
    
    if (filteredProducts.length === 0) {
        productGrid.innerHTML = '';
        if (noProductsElement) noProductsElement.style.display = 'block';
        return;
    }
    
    if (noProductsElement) noProductsElement.style.display = 'none';
    
    // Generate products HTML
    let productsHTML = '';
    
    filteredProducts.forEach(product => {
        productsHTML += `
            <div class="product-card" data-aos="fade-up">
                <div class="product-image">
                    <img src="${product.image || getProductImage(product.id)}" alt="${product.name}">
                    <button class="quick-view-btn" data-id="${product.id}">Quick View</button>
                </div>
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <div class="product-price">${formatPrice(product.price)}</div>
                    <div class="product-actions">
                        <button class="add-to-cart-btn" data-id="${product.id}" data-name="${product.name}" data-price="${product.price}">Add to Cart</button>
                        <a href="product-detail.html?id=${product.id}" class="view-details-btn">View Details</a>
                    </div>
                </div>
            </div>
        `;
    });
    
    productGrid.innerHTML = productsHTML;
    
    // Add event listeners to Add to Cart buttons
    document.querySelectorAll('.add-to-cart-btn').forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-id');
            const productName = this.getAttribute('data-name');
            const productPrice = parseInt(this.getAttribute('data-price'));
            
            addToCart(productId, productName, productPrice);
        });
    });
    
    // Add event listeners to Quick View buttons
    document.querySelectorAll('.quick-view-btn').forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-id');
            openQuickView(productId);
        });
    });
}

// Initialize quick view functionality
function initQuickView() {
    const quickViewModal = document.getElementById('quickview-modal');
    const closeQuickViewBtn = document.getElementById('close-quickview');
    
    if (closeQuickViewBtn) {
        closeQuickViewBtn.addEventListener('click', function() {
            quickViewModal.classList.remove('active');
        });
    }
    
    // Close modal when clicking outside
    if (quickViewModal) {
        quickViewModal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.classList.remove('active');
            }
        });
    }
}

// Open quick view modal
function openQuickView(productId) {
    const quickViewModal = document.getElementById('quickview-modal');
    const quickViewContent = document.getElementById('quickview-content');
    
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const product = products.find(p => p.id == productId);
    
    if (!product) {
        quickViewContent.innerHTML = '<p>Product not found.</p>';
        quickViewModal.classList.add('active');
        return;
    }
    
    // Generate quick view HTML
    const quickViewHTML = `
        <div class="quick-view-container">
            <div class="quick-view-image">
                <img src="${product.image || getProductImage(product.id)}" alt="${product.name}">
            </div>
            <div class="quick-view-info">
                <h3>${product.name}</h3>
                <div class="quick-view-price">${formatPrice(product.price)}</div>
                <div class="quick-view-description">
                    <p>${product.description || 'Premium quality product from Solo Wear collection.'}</p>
                </div>
                <div class="size-selector">
                    <h4>Select Size:</h4>
                    <div class="size-options">
                        <div class="size-option" data-size="S">S</div>
                        <div class="size-option selected" data-size="M">M</div>
                        <div class="size-option" data-size="L">L</div>
                        <div class="size-option" data-size="XL">XL</div>
                    </div>
                </div>
                <button class="add-to-cart-large quick-view-add" data-id="${product.id}" data-name="${product.name}" data-price="${product.price}">
                    ADD TO CART
                </button>
                <a href="product-detail.html?id=${product.id}" class="view-btn">View Full Details</a>
            </div>
        </div>
    `;
    
    quickViewContent.innerHTML = quickViewHTML;
    quickViewModal.classList.add('active');
    
    // Initialize size selector in quick view
    const sizeOptions = quickViewContent.querySelectorAll('.size-option');
    sizeOptions.forEach(option => {
        option.addEventListener('click', function() {
            sizeOptions.forEach(opt => opt.classList.remove('selected'));
            this.classList.add('selected');
        });
    });
    
    // Add to cart button in quick view
    const addToCartBtn = quickViewContent.querySelector('.quick-view-add');
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', function() {
            const productId = this.getAttribute('data-id');
            const productName = this.getAttribute('data-name');
            const productPrice = parseInt(this.getAttribute('data-price'));
            const selectedSize = quickViewContent.querySelector('.size-option.selected').getAttribute('data-size');
            
            addToCart(productId, productName, productPrice, selectedSize);
            quickViewModal.classList.remove('active');
        });
    }
}

// Load product details on product detail page
function loadProductDetails() {
    const productDetailContainer = document.getElementById('product-detail-container');
    const productNotFound = document.getElementById('product-not-found');
    
    if (!productDetailContainer) return;
    
    // Get product ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    
    if (!productId) {
        productDetailContainer.style.display = 'none';
        if (productNotFound) productNotFound.style.display = 'block';
        return;
    }
    
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const product = products.find(p => p.id == productId);
    
    if (!product) {
        productDetailContainer.style.display = 'none';
        if (productNotFound) productNotFound.style.display = 'block';
        return;
    }
    
    if (productNotFound) productNotFound.style.display = 'none';
    
    // Generate product detail HTML
    const productDetailHTML = `
        <div class="product-detail-image" data-aos="fade-right">
            <img src="${product.image || getProductImage(product.id)}" alt="${product.name}">
        </div>
        <div class="product-detail-info" data-aos="fade-left">
            <h1>${product.name}</h1>
            <div class="product-detail-price">${formatPrice(product.price)}</div>
            <div class="product-detail-description">
                <p>${product.description || 'Premium quality product from Solo Wear collection. Crafted with the finest materials and attention to detail.'}</p>
                <p>Category: ${product.category || 'Fashion'}</p>
                <p>Available in sizes: S, M, L, XL</p>
            </div>
            <div class="size-selector">
                <h3>Select Size:</h3>
                <div class="size-options">
                    <div class="size-option" data-size="S">S</div>
                    <div class="size-option selected" data-size="M">M</div>
                    <div class="size-option" data-size="L">L</div>
                    <div class="size-option" data-size="XL">XL</div>
                </div>
            </div>
            <button class="add-to-cart-large" id="add-to-cart-detail" data-id="${product.id}" data-name="${product.name}" data-price="${product.price}">
                ADD TO CART
            </button>
            <p class="delivery-info"><i class="fas fa-truck"></i> Free delivery on orders above PKR 10,000</p>
        </div>
    `;
    
    productDetailContainer.innerHTML = productDetailHTML;
    
    // Initialize size selector
    const sizeOptions = productDetailContainer.querySelectorAll('.size-option');
    sizeOptions.forEach(option => {
        option.addEventListener('click', function() {
            sizeOptions.forEach(opt => opt.classList.remove('selected'));
            this.classList.add('selected');
        });
    });
    
    // Add to cart button
    const addToCartBtn = document.getElementById('add-to-cart-detail');
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', function() {
            const productId = this.getAttribute('data-id');
            const productName = this.getAttribute('data-name');
            const productPrice = parseInt(this.getAttribute('data-price'));
            const selectedSize = productDetailContainer.querySelector('.size-option.selected').getAttribute('data-size');
            
            addToCart(productId, productName, productPrice, selectedSize);
        });
    }
    
    // Load related products
    loadRelatedProducts(productId);
}

// Load related products
function loadRelatedProducts(currentProductId) {
    const relatedGrid = document.getElementById('related-grid');
    
    if (!relatedGrid) return;
    
    const products = JSON.parse(localStorage.getItem('products')) || [];
    // Filter out current product and get up to 4 other products
    const relatedProducts = products
        .filter(p => p.id != currentProductId)
        .slice(0, 4);
    
    if (relatedProducts.length === 0) {
        relatedGrid.innerHTML = '<p>No related products available.</p>';
        return;
    }
    
    let relatedHTML = '';
    
    relatedProducts.forEach(product => {
        relatedHTML += `
            <div class="collection-item" data-aos="fade-up">
                <div class="collection-img">
                    <div class="img-placeholder" style="background: linear-gradient(45deg, #1a1a1a, #333);">
                        <img src="${product.image || getProductImage(product.id)}" alt="${product.name}" style="width:100%; height:100%; object-fit:cover;">
                    </div>
                </div>
                <div class="collection-info">
                    <h3>${product.name}</h3>
                    <p class="price">${formatPrice(product.price)}</p>
                    <a href="product-detail.html?id=${product.id}" class="view-btn">View Details</a>
                </div>
            </div>
        `;
    });
    
    relatedGrid.innerHTML = relatedHTML;
}

// Initialize size selectors
function initSizeSelectors() {
    // This function is called from product detail page initialization
    // Size selectors are initialized within loadProductDetails()
}

// ============================================
// CHECKOUT FUNCTIONALITY
// ============================================

// Load checkout items
function loadCheckoutItems() {
    const checkoutItemsContainer = document.getElementById('checkout-items');
    const checkoutSubtotal = document.getElementById('checkout-subtotal');
    const checkoutDelivery = document.getElementById('checkout-delivery');
    const checkoutTotal = document.getElementById('checkout-total');
    const mobileSubtotal = document.getElementById('mobile-subtotal');
    const mobileDelivery = document.getElementById('mobile-delivery');
    const mobileTotal = document.getElementById('mobile-total');
    const paymentAmount = document.getElementById('payment-amount');
    
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    if (cart.length === 0) {
        if (checkoutItemsContainer) {
            checkoutItemsContainer.innerHTML = '<p>Your cart is empty. Please add items to your cart before checkout.</p>';
        }
        return;
    }
    
    // Generate checkout items HTML
    let checkoutItemsHTML = '';
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        
        checkoutItemsHTML += `
            <div class="order-item">
                <div class="order-item-info">
                    <h4>${item.name}</h4>
                    <div class="order-item-meta">Size: ${item.size} | Qty: ${item.quantity}</div>
                </div>
                <div class="order-item-total">${formatPrice(itemTotal)}</div>
            </div>
        `;
    });
    
    if (checkoutItemsContainer) {
        checkoutItemsContainer.innerHTML = checkoutItemsHTML;
    }
    
    // Update totals
    const totals = calculateCartTotals();
    
    if (checkoutSubtotal) checkoutSubtotal.textContent = formatPrice(totals.subtotal);
    if (checkoutDelivery) checkoutDelivery.textContent = formatPrice(totals.delivery);
    if (checkoutTotal) checkoutTotal.textContent = formatPrice(totals.total);
    
    if (mobileSubtotal) mobileSubtotal.textContent = formatPrice(totals.subtotal);
    if (mobileDelivery) mobileDelivery.textContent = formatPrice(totals.delivery);
    if (mobileTotal) mobileTotal.textContent = formatPrice(totals.total);
    
    if (paymentAmount) paymentAmount.textContent = formatPrice(totals.total);
}

// Place order function
function placeOrder() {
    // Get form data
    const fullName = document.getElementById('full-name').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const address = document.getElementById('address').value.trim();
    const city = document.getElementById('city').value;
    const landmark = document.getElementById('landmark').value.trim();
    const transactionId = document.getElementById('transaction-id').value.trim();
    
    // Validate form
    if (!fullName || !phone || !address || !city || !landmark || !transactionId) {
        showNotification('Please fill in all required fields.', 'error');
        return;
    }
    
    // Validate phone number (basic Pakistani format)
    const phoneRegex = /^0[0-9]{10}$/;
    if (!phoneRegex.test(phone)) {
        showNotification('Please enter a valid Pakistani phone number (e.g., 03121234567).', 'error');
        return;
    }
    
    // Get cart
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    if (cart.length === 0) {
        showNotification('Your cart is empty. Please add items to your cart before placing an order.', 'error');
        return;
    }
    
    // Calculate totals
    const totals = calculateCartTotals();
    
    // Generate order ID
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const orderId = 'SW-' + String(orders.length + 1).padStart(5, '0');
    
    // Create order object
    const order = {
        id: orderId,
        date: new Date().toISOString(),
        customer: {
            name: fullName,
            phone: phone,
            address: address,
            city: city,
            landmark: landmark
        },
        items: cart,
        payment: {
            method: 'EasyPaisa',
            transactionId: transactionId,
            amount: totals.total
        },
        status: 'pending',
        totals: totals
    };
    
    // Save order
    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));
    
    // Clear cart
    localStorage.removeItem('cart');
    updateCartCount();
    
    // Show success modal
    const successModal = document.getElementById('order-success-modal');
    const successOrderId = document.getElementById('success-order-id');
    const successOrderTotal = document.getElementById('success-order-total');
    
    if (successOrderId) successOrderId.textContent = orderId;
    if (successOrderTotal) successOrderTotal.textContent = formatPrice(totals.total);
    
    if (successModal) {
        successModal.classList.add('active');
        
        // Reset form
        document.getElementById('checkout-form').reset();
    }
    
    // Scroll to top
    window.scrollTo(0, 0);
}

// ============================================
// ADMIN FUNCTIONALITY
// ============================================

// Setup PIN login
function setupPinLogin() {
    const pinDisplay = document.getElementById('pin-display');
    const pinKeys = document.querySelectorAll('.pin-key:not(#pin-clear):not(#pin-submit)');
    const pinClear = document.getElementById('pin-clear');
    const pinSubmit = document.getElementById('pin-submit');
    
    if (!pinDisplay) return;
    
    let enteredPin = '';
    const correctPin = '786'; // Default PIN
    
    // Number key handlers
    pinKeys.forEach(key => {
        key.addEventListener('click', function() {
            if (enteredPin.length < 4) {
                enteredPin += this.getAttribute('data-key');
                updatePinDisplay();
            }
        });
    });
    
    // Clear button
    if (pinClear) {
        pinClear.addEventListener('click', function() {
            enteredPin = '';
            updatePinDisplay();
        });
    }
    
    // Submit button
    if (pinSubmit) {
        pinSubmit.addEventListener('click', function() {
            if (enteredPin === correctPin) {
                // Successful login
                localStorage.setItem('adminLoggedIn', 'true');
                document.getElementById('admin-login').style.display = 'none';
                document.getElementById('admin-dashboard').style.display = 'block';
                loadAdminData();
                showNotification('Admin login successful!', 'success');
            } else {
                // Failed login
                showNotification('Incorrect PIN. Please try again.', 'error');
                enteredPin = '';
                updatePinDisplay();
            }
        });
    }
    
    // Update PIN display
    function updatePinDisplay() {
        if (pinDisplay) {
            let displayText = '';
            for (let i = 0; i < 4; i++) {
                if (i < enteredPin.length) {
                    displayText += '•';
                } else {
                    displayText += '_';
                }
            }
            pinDisplay.textContent = displayText;
        }
    }
    
    // Initialize display
    updatePinDisplay();
}

// Reset PIN display
function resetPinDisplay() {
    const pinDisplay = document.getElementById('pin-display');
    if (pinDisplay) {
        pinDisplay.textContent = '____';
    }
}

// Load admin data
function loadAdminData() {
    updateAdminStats();
    loadAdminProducts();
    loadAdminOrders();
    
    // Setup add product form
    setupAddProductForm();
}

// Update admin statistics
function updateAdminStats() {
    const productsCount = document.getElementById('products-count');
    const ordersCount = document.getElementById('orders-count');
    const customersCount = document.getElementById('customers-count');
    
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    
    // Get unique customers from orders
    const customers = new Set();
    orders.forEach(order => {
        customers.add(order.customer.phone);
    });
    
    if (productsCount) productsCount.textContent = products.length;
    if (ordersCount) ordersCount.textContent = orders.length;
    if (customersCount) customersCount.textContent = customers.size;
}

// Load admin products
function loadAdminProducts() {
    const adminProductsList = document.getElementById('admin-products-list');
    const noAdminProducts = document.getElementById('no-admin-products');
    const productsTable = document.getElementById('products-table');
    
    const products = JSON.parse(localStorage.getItem('products')) || [];
    
    if (products.length === 0) {
        if (adminProductsList) adminProductsList.innerHTML = '';
        if (noAdminProducts) noAdminProducts.style.display = 'block';
        if (productsTable) productsTable.style.display = 'none';
        return;
    }
    
    if (noAdminProducts) noAdminProducts.style.display = 'none';
    if (productsTable) productsTable.style.display = 'table';
    
    // Generate products HTML
    let productsHTML = '';
    
    products.forEach(product => {
        productsHTML += `
            <tr>
                <td>${product.id}</td>
                <td>
                    <div class="product-admin-image">
                        <img src="${product.image || getProductImage(product.id)}" alt="${product.name}">
                    </div>
                </td>
                <td>${product.name}</td>
                <td>${formatPrice(product.price)}</td>
                <td>${product.category || 'Fashion'}</td>
                <td>${product.stock || '10'}</td>
                <td>
                    <div class="admin-actions">
                        <button class="edit-btn" data-id="${product.id}">Edit</button>
                        <button class="delete-btn" data-id="${product.id}">Delete</button>
                    </div>
                </td>
            </tr>
        `;
    });
    
    if (adminProductsList) {
        adminProductsList.innerHTML = productsHTML;
        
        // Add event listeners to delete buttons
        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', function() {
                const productId = this.getAttribute('data-id');
                deleteProduct(productId);
            });
        });
        
        // Add event listeners to edit buttons
        document.querySelectorAll('.edit-btn').forEach(button => {
            button.addEventListener('click', function() {
                const productId = this.getAttribute('data-id');
                editProduct(productId);
            });
        });
    }
}

// Setup add product form
function setupAddProductForm() {
    const addProductForm = document.getElementById('add-product-form');
    
    if (!addProductForm) return;
    
    addProductForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form values
        const productName = document.getElementById('product-name').value.trim();
        const productPrice = document.getElementById('product-price').value.trim();
        const productDescription = document.getElementById('product-description').value.trim();
        const productImage = document.getElementById('product-image').value.trim();
        const productCategory = document.getElementById('product-category').value;
        const productStock = document.getElementById('product-stock').value || '10';
        
        // Validate form
        if (!productName || !productPrice || !productDescription || !productImage) {
            showNotification('Please fill in all required fields.', 'error');
            return;
        }
        
        // Get existing products
        const products = JSON.parse(localStorage.getItem('products')) || [];
        
        // Generate new product ID
        const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
        
        // Create new product
        const newProduct = {
            id: newId,
            name: productName,
            price: parseInt(productPrice),
            description: productDescription,
            image: productImage,
            category: productCategory,
            stock: parseInt(productStock)
        };
        
        // Add to products array
        products.push(newProduct);
        localStorage.setItem('products', JSON.stringify(products));
        
        // Reset form
        addProductForm.reset();
        
        // Reload admin data
        loadAdminData();
        
        // Show success message
        showNotification('Product added successfully!', 'success');
        
        // Reload shop page if open
        if (window.location.pathname.includes('shop.html')) {
            loadProducts();
        }
    });
}

// Delete product
function deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product?')) {
        return;
    }
    
    let products = JSON.parse(localStorage.getItem('products')) || [];
    products = products.filter(product => product.id != productId);
    
    localStorage.setItem('products', JSON.stringify(products));
    loadAdminData();
    
    showNotification('Product deleted successfully!', 'success');
    
    // Reload shop page if open
    if (window.location.pathname.includes('shop.html')) {
        loadProducts();
    }
}

// Edit product (placeholder - in a real app this would open an edit form)
function editProduct(productId) {
    showNotification('Edit functionality would open a form to modify the product.', 'info');
    // In a complete implementation, this would populate the add product form with existing data
    // and change the submit button to "Update Product"
}

// Load admin orders
function loadAdminOrders() {
    const adminOrdersList = document.getElementById('admin-orders-list');
    const noAdminOrders = document.getElementById('no-admin-orders');
    const ordersTable = document.getElementById('orders-table');
    
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    
    if (orders.length === 0) {
        if (adminOrdersList) adminOrdersList.innerHTML = '';
        if (noAdminOrders) noAdminOrders.style.display = 'block';
        if (ordersTable) ordersTable.style.display = 'none';
        return;
    }
    
    if (noAdminOrders) noAdminOrders.style.display = 'none';
    if (ordersTable) ordersTable.style.display = 'table';
    
    // Generate orders HTML
    let ordersHTML = '';
    
    // Sort orders by date (newest first)
    const sortedOrders = [...orders].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    sortedOrders.forEach(order => {
        const orderDate = new Date(order.date);
        const formattedDate = orderDate.toLocaleDateString('en-PK', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
        
        ordersHTML += `
            <tr>
                <td>${order.id}</td>
                <td>${order.customer.name}</td>
                <td>${formatPrice(order.totals.total)}</td>
                <td>${order.customer.city}</td>
                <td>
                    <span class="order-status status-${order.status}">
                        ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                </td>
                <td>${formattedDate}</td>
                <td>
                    <button class="edit-btn view-order-btn" data-id="${order.id}">View</button>
                </td>
            </tr>
        `;
    });
    
    if (adminOrdersList) {
        adminOrdersList.innerHTML = ordersHTML;
        
        // Add event listeners to view buttons
        document.querySelectorAll('.view-order-btn').forEach(button => {
            button.addEventListener('click', function() {
                const orderId = this.getAttribute('data-id');
                viewOrderDetails(orderId);
            });
        });
    }
}

// View order details
function viewOrderDetails(orderId) {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const order = orders.find(o => o.id === orderId);
    
    if (!order) {
        showNotification('Order not found.', 'error');
        return;
    }
    
    // Format order details for display
    const orderDate = new Date(order.date);
    const formattedDate = orderDate.toLocaleDateString('en-PK', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    let itemsHTML = '';
    order.items.forEach(item => {
        itemsHTML += `
            <div>${item.name} (Size: ${item.size}, Qty: ${item.quantity}) - ${formatPrice(item.price * item.quantity)}</div>
        `;
    });
    
    const orderDetails = `
        <h3>Order Details: ${order.id}</h3>
        <p><strong>Date:</strong> ${formattedDate}</p>
        
        <h4>Customer Information:</h4>
        <p><strong>Name:</strong> ${order.customer.name}</p>
        <p><strong>Phone:</strong> ${order.customer.phone}</p>
        <p><strong>Address:</strong> ${order.customer.address}, ${order.customer.city}</p>
        <p><strong>Landmark:</strong> ${order.customer.landmark}</p>
        
        <h4>Order Items:</h4>
        ${itemsHTML}
        
        <h4>Payment Information:</h4>
        <p><strong>Method:</strong> ${order.payment.method}</p>
        <p><strong>Transaction ID:</strong> ${order.payment.transactionId}</p>
        <p><strong>Amount:</strong> ${formatPrice(order.payment.amount)}</p>
        
        <h4>Order Summary:</h4>
        <p><strong>Subtotal:</strong> ${formatPrice(order.totals.subtotal)}</p>
        <p><strong>Delivery:</strong> ${formatPrice(order.totals.delivery)}</p>
        <p><strong>Total:</strong> ${formatPrice(order.totals.total)}</p>
        
        <h4>Status: <span class="order-status status-${order.status}">${order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span></h4>
    `;
    
    alert(orderDetails);
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Show notification
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => {
        notification.remove();
    });
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    // Set icon based on type
    let icon = 'info-circle';
    if (type === 'success') icon = 'check-circle';
    if (type === 'error') icon = 'exclamation-circle';
    
    notification.innerHTML = `
        <i class="fas fa-${icon}"></i>
        <span>${message}</span>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 30px;
        background: ${type === 'success' ? 'rgba(40, 167, 69, 0.9)' : type === 'error' ? 'rgba(220, 53, 69, 0.9)' : 'rgba(23, 162, 184, 0.9)'};
        color: white;
        padding: 15px 25px;
        border-radius: 5px;
        display: flex;
        align-items: center;
        gap: 10px;
        z-index: 9999;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        animation: slideInRight 0.3s ease;
        max-width: 400px;
    `;
    
    // Add to document
    document.body.appendChild(notification);
    
    // Remove after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 5000);
    
    // Add CSS for animation if not already present
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            
            @keyframes slideOutRight {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
}

// Initialize sample data if localStorage is empty
function initializeSampleData() {
    // Only initialize if no products exist
    if (!localStorage.getItem('products') || JSON.parse(localStorage.getItem('products')).length === 0) {
        const sampleProducts = [
            {
                id: 1,
                name: "Royal Kurta",
                price: 12999,
                description: "Handcrafted premium cotton kurta with intricate gold embroidery. Perfect for formal occasions and weddings.",
                category: "kurtas",
                stock: 25,
                image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80"
            },
            {
                id: 2,
                name: "Silk Embroidered Shawl",
                price: 8499,
                description: "Pure silk shawl with hand-embroidered traditional patterns. Lightweight yet warm, perfect for all seasons.",
                category: "shawls",
                stock: 15,
                image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80"
            },
            {
                id: 3,
                name: "Designer Sherwani",
                price: 24999,
                description: "Regal sherwani crafted from premium fabric with detailed embroidery and pearl work. The ultimate wedding attire.",
                category: "sherwanis",
                stock: 10,
                image: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w-800&q=80"
            },
            {
                id: 4,
                name: "Premium Waistcoat",
                price: 7999,
                description: "Elegant waistcoat with silk lining and gold button detailing. Can be paired with kurtas or formal shirts.",
                category: "waistcoats",
                stock: 30,
                image: "https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80"
            },
            {
                id: 5,
                name: "Traditional Pajama",
                price: 4499,
                description: "Comfortable yet stylish pajama with intricate side patterns. Made from breathable premium cotton.",
                category: "kurtas",
                stock: 50,
                image: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80"
            },
            {
                id: 6,
                name: "Embroidered Jutti",
                price: 2999,
                description: "Handcrafted traditional jutti with gold thread embroidery. Comfortable for all-day wear.",
                category: "accessories",
                stock: 40,
                image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80"
            }
        ];
        
        localStorage.setItem('products', JSON.stringify(sampleProducts));
    }
}

// Initialize data on first load
initializeSampleData();
