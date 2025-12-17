// ===== DATABASE MANAGEMENT =====
class Database {
    constructor() {
        this.initializeDatabase();
    }

    initializeDatabase() {
        // Initialize products if not exists
        if (!localStorage.getItem('products')) {
            const defaultProducts = [
                {
                    id: 1,
                    name: "Premium Classic Tee",
                    price: 49.99,
                    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                    category: "classic",
                    description: "Our signature premium cotton T-shirt with perfect weight and drape for everyday luxury.",
                    sizes: ["S", "M", "L", "XL"],
                    stock: 100,
                    rating: 4.8,
                    featured: true
                },
                {
                    id: 2,
                    name: "Luxe V-Neck Tee",
                    price: 54.99,
                    image: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                    category: "v-neck",
                    description: "Sophisticated V-neck design in our premium fabric blend for a sleek, modern look.",
                    sizes: ["S", "M", "L"],
                    stock: 75,
                    rating: 4.7,
                    featured: true
                },
                {
                    id: 3,
                    name: "Black Edition Tee",
                    price: 59.99,
                    image: "https://images.unsplash.com/photo-1562157873-818bc0726f68?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                    category: "premium",
                    description: "Deep black premium tee with enhanced color retention and superior fabric density.",
                    sizes: ["S", "M", "L", "XL"],
                    stock: 50,
                    rating: 4.9,
                    featured: true
                },
                {
                    id: 4,
                    name: "Signature White Tee",
                    price: 44.99,
                    image: "https://images.unsplash.com/photo-1581655353564-df123a1eb820?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                    category: "classic",
                    description: "Crisp white premium tee with opacity and structure for the perfect minimalist look.",
                    sizes: ["M", "L", "XL"],
                    stock: 120,
                    rating: 4.6,
                    featured: false
                },
                {
                    id: 5,
                    name: "Gold Trim Limited",
                    price: 79.99,
                    image: "https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                    category: "limited",
                    description: "Exclusive limited edition with subtle gold thread detailing on collar and hem.",
                    sizes: ["S", "M"],
                    stock: 25,
                    rating: 5.0,
                    featured: true
                },
                {
                    id: 6,
                    name: "Premium Crew Neck",
                    price: 49.99,
                    image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                    category: "crew-neck",
                    description: "Classic crew neck design with reinforced seams for lasting durability and comfort.",
                    sizes: ["S", "M", "L", "XL"],
                    stock: 85,
                    rating: 4.7,
                    featured: false
                }
            ];
            localStorage.setItem('products', JSON.stringify(defaultProducts));
        }

        // Initialize cart if not exists
        if (!localStorage.getItem('cart')) {
            localStorage.setItem('cart', JSON.stringify([]));
        }

        // Initialize orders if not exists
        if (!localStorage.getItem('orders')) {
            localStorage.setItem('orders', JSON.stringify([]));
        }

        // Initialize newsletter subscribers if not exists
        if (!localStorage.getItem('newsletterSubscribers')) {
            localStorage.setItem('newsletterSubscribers', JSON.stringify([]));
        }

        // Initialize admin settings if not exists
        if (!localStorage.getItem('adminSettings')) {
            localStorage.setItem('adminSettings', JSON.stringify({
                pin: '1234',
                storeName: 'Solo Wear',
                easypaisaNumber: '0300-XXXXXXX'
            }));
        }
    }

    getProducts() {
        return JSON.parse(localStorage.getItem('products')) || [];
    }

    getProductById(id) {
        const products = this.getProducts();
        return products.find(product => product.id === parseInt(id));
    }

    saveProduct(product) {
        const products = this.getProducts();
        // Generate new ID if not provided
        if (!product.id) {
            product.id = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
        }
        products.push(product);
        localStorage.setItem('products', JSON.stringify(products));
        return product;
    }

    updateProduct(id, updates) {
        const products = this.getProducts();
        const index = products.findIndex(p => p.id === parseInt(id));
        if (index !== -1) {
            products[index] = { ...products[index], ...updates };
            localStorage.setItem('products', JSON.stringify(products));
            return products[index];
        }
        return null;
    }

    deleteProduct(id) {
        const products = this.getProducts();
        const filteredProducts = products.filter(p => p.id !== parseInt(id));
        localStorage.setItem('products', JSON.stringify(filteredProducts));
        return true;
    }

    getCart() {
        return JSON.parse(localStorage.getItem('cart')) || [];
    }

    saveCart(cart) {
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    addToCart(productId, size = 'M', quantity = 1) {
        const cart = this.getCart();
        const existingItem = cart.find(item => 
            item.productId === productId && item.size === size
        );

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.push({
                productId: parseInt(productId),
                size,
                quantity,
                addedAt: new Date().toISOString()
            });
        }

        this.saveCart(cart);
        return cart;
    }

    updateCartItem(productId, size, quantity) {
        const cart = this.getCart();
        const item = cart.find(item => 
            item.productId === parseInt(productId) && item.size === size
        );
        
        if (item) {
            if (quantity <= 0) {
                this.removeFromCart(productId, size);
            } else {
                item.quantity = quantity;
                this.saveCart(cart);
            }
        }
        return cart;
    }

    removeFromCart(productId, size) {
        const cart = this.getCart();
        const filteredCart = cart.filter(item => 
            !(item.productId === parseInt(productId) && item.size === size)
        );
        this.saveCart(filteredCart);
        return filteredCart;
    }

    clearCart() {
        localStorage.setItem('cart', JSON.stringify([]));
        return [];
    }

    getOrders() {
        return JSON.parse(localStorage.getItem('orders')) || [];
    }

    saveOrder(order) {
        const orders = this.getOrders();
        order.id = orders.length > 0 ? Math.max(...orders.map(o => o.id)) + 1 : 1;
        order.date = new Date().toISOString();
        order.status = 'processing';
        orders.push(order);
        localStorage.setItem('orders', JSON.stringify(orders));
        return order;
    }

    getNewsletterSubscribers() {
        return JSON.parse(localStorage.getItem('newsletterSubscribers')) || [];
    }

    addNewsletterSubscriber(email) {
        const subscribers = this.getNewsletterSubscribers();
        if (!subscribers.includes(email)) {
            subscribers.push(email);
            localStorage.setItem('newsletterSubscribers', JSON.stringify(subscribers));
        }
        return subscribers;
    }

    getAdminSettings() {
        return JSON.parse(localStorage.getItem('adminSettings'));
    }

    updateAdminSettings(settings) {
        const currentSettings = this.getAdminSettings();
        const updatedSettings = { ...currentSettings, ...settings };
        localStorage.setItem('adminSettings', JSON.stringify(updatedSettings));
        return updatedSettings;
    }

    resetAllData() {
        localStorage.removeItem('products');
        localStorage.removeItem('cart');
        localStorage.removeItem('orders');
        localStorage.removeItem('newsletterSubscribers');
        this.initializeDatabase();
    }
}

// Initialize database
const db = new Database();

// ===== CART MANAGEMENT =====
function updateCartCount() {
    const cart = db.getCart();
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    const cartCountElements = document.querySelectorAll('.cart-count');
    cartCountElements.forEach(element => {
        element.textContent = totalItems;
    });
    
    return totalItems;
}

// ===== PRODUCT RENDERING =====
function createProductCard(product) {
    return `
        <div class="product-card" data-id="${product.id}" data-category="${product.category}">
            <div class="product-image">
                <img src="${product.image}" alt="${product.name} - Premium T-shirt" loading="lazy">
                ${product.stock < 20 ? '<span class="product-badge">Low Stock</span>' : ''}
            </div>
            <div class="product-info">
                <span class="product-category">${product.category.toUpperCase()}</span>
                <h3 class="product-title">${product.name}</h3>
                <div class="product-rating">
                    ${generateStars(product.rating)}
                    <span>(${product.rating})</span>
                </div>
                <div class="product-price">$${product.price.toFixed(2)}</div>
                <button class="btn btn-outline add-to-cart-btn" data-id="${product.id}">
                    <i class="fas fa-shopping-bag"></i> Add to Cart
                </button>
                <a href="product-detail.html?id=${product.id}" class="btn btn-small" style="margin-top: 10px;">
                    View Details
                </a>
            </div>
        </div>
    `;
}

function generateStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    let stars = '';
    
    for (let i = 0; i < fullStars; i++) {
        stars += '<i class="fas fa-star"></i>';
    }
    
    if (hasHalfStar) {
        stars += '<i class="fas fa-star-half-alt"></i>';
    }
    
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
        stars += '<i class="far fa-star"></i>';
    }
    
    return stars;
}

function loadFeaturedProducts() {
    const featuredContainer = document.getElementById('featuredProducts');
    if (!featuredContainer) return;
    
    const products = db.getProducts();
    const featuredProducts = products.filter(p => p.featured).slice(0, 4);
    
    if (featuredProducts.length === 0) {
        featuredContainer.innerHTML = '<p class="no-products">No featured products available.</p>';
        return;
    }
    
    featuredContainer.innerHTML = featuredProducts.map(createProductCard).join('');
    
    // Add event listeners to add to cart buttons
    document.querySelectorAll('.add-to-cart-btn').forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-id');
            addToCart(productId);
        });
    });
}

function loadAllProducts() {
    const productsGrid = document.getElementById('productsGrid');
    const productsCount = document.getElementById('productsCount');
    if (!productsGrid) return;
    
    const products = db.getProducts();
    
    if (products.length === 0) {
        productsGrid.innerHTML = '<p class="no-products">No products available. Add some products from the admin panel.</p>';
        productsCount.textContent = '0 products';
        return;
    }
    
    productsGrid.innerHTML = products.map(createProductCard).join('');
    productsCount.textContent = `${products.length} products`;
    
    // Add event listeners to add to cart buttons
    document.querySelectorAll('.add-to-cart-btn').forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-id');
            addToCart(productId);
        });
    });
}

// ===== PRODUCT DETAIL PAGE =====
function loadProductDetail() {
    const productDetailContainer = document.getElementById('productDetail');
    if (!productDetailContainer) return;
    
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    
    if (!productId) {
        productDetailContainer.innerHTML = '<p class="error">Product not found.</p>';
        return;
    }
    
    const product = db.getProductById(productId);
    
    if (!product) {
        productDetailContainer.innerHTML = '<p class="error">Product not found.</p>';
        return;
    }
    
    productDetailContainer.innerHTML = `
        <div class="product-gallery">
            <div class="main-product-image" id="mainImage">
                <img src="${product.image}" alt="${product.name}" id="productImage">
            </div>
            <div class="thumbnails">
                <div class="thumbnail active" data-image="${product.image}">
                    <img src="${product.image}" alt="${product.name} thumbnail">
                </div>
            </div>
        </div>
        <div class="product-info">
            <h1>${product.name}</h1>
            <div class="product-price">$${product.price.toFixed(2)}</div>
            <div class="product-rating">
                ${generateStars(product.rating)}
                <span>${product.rating} (Based on customer reviews)</span>
            </div>
            <p class="product-description">${product.description}</p>
            
            <div class="size-selector">
                <h3>Select Size</h3>
                <div class="size-options" id="sizeOptions">
                    ${product.sizes.map(size => `
                        <label class="size-option">
                            <input type="radio" name="size" value="${size}" ${size === 'M' ? 'checked' : ''}>
                            <span>${size}</span>
                        </label>
                    `).join('')}
                </div>
            </div>
            
            <div class="quantity-selector">
                <h3>Quantity</h3>
                <div class="quantity-controls">
                    <button class="quantity-btn" id="decreaseQuantity">-</button>
                    <input type="text" class="quantity-input" id="quantityInput" value="1" readonly>
                    <button class="quantity-btn" id="increaseQuantity">+</button>
                </div>
            </div>
            
            <div class="product-actions">
                <button class="btn btn-gold" id="addToCartDetail">
                    <i class="fas fa-shopping-bag"></i> Add to Cart
                </button>
                <button class="btn btn-outline" id="buyNow">
                    <i class="fas fa-bolt"></i> Buy Now
                </button>
            </div>
            
            <div class="product-meta">
                <p><i class="fas fa-box"></i> In Stock: ${product.stock} units</p>
                <p><i class="fas fa-truck"></i> Free shipping on all orders</p>
                <p><i class="fas fa-undo"></i> 30-day return policy</p>
            </div>
        </div>
    `;
    
    // Add event listeners
    const quantityInput = document.getElementById('quantityInput');
    const decreaseBtn = document.getElementById('decreaseQuantity');
    const increaseBtn = document.getElementById('increaseQuantity');
    const addToCartBtn = document.getElementById('addToCartDetail');
    const buyNowBtn = document.getElementById('buyNow');
    const mainImage = document.getElementById('productImage');
    
    let quantity = 1;
    
    decreaseBtn.addEventListener('click', () => {
        if (quantity > 1) {
            quantity--;
            quantityInput.value = quantity;
        }
    });
    
    increaseBtn.addEventListener('click', () => {
        if (quantity < product.stock) {
            quantity++;
            quantityInput.value = quantity;
        }
    });
    
    addToCartBtn.addEventListener('click', () => {
        const size = document.querySelector('input[name="size"]:checked').value;
        addToCart(productId, size, quantity);
        
        // Show success message
        showMessage('Product added to cart!', 'success');
    });
    
    buyNowBtn.addEventListener('click', () => {
        const size = document.querySelector('input[name="size"]:checked').value;
        addToCart(productId, size, quantity);
        window.location.href = 'cart.html';
    });
    
    // Image zoom effect
    mainImage.addEventListener('click', function() {
        const zoomOverlay = document.createElement('div');
        zoomOverlay.className = 'image-zoom-overlay active';
        zoomOverlay.innerHTML = `
            <img src="${this.src}" alt="${product.name}" class="zoom-image">
            <button class="close-zoom" style="position: absolute; top: 20px; right: 20px; background: none; border: none; color: white; font-size: 2rem; cursor: pointer;">
                <i class="fas fa-times"></i>
            </button>
        `;
        document.body.appendChild(zoomOverlay);
        
        zoomOverlay.querySelector('.close-zoom').addEventListener('click', () => {
            document.body.removeChild(zoomOverlay);
        });
    });
    
    // Load related products
    loadRelatedProducts(productId);
}

function loadRelatedProducts(currentProductId) {
    const relatedContainer = document.getElementById('relatedProducts');
    if (!relatedContainer) return;
    
    const products = db.getProducts();
    const relatedProducts = products
        .filter(p => p.id !== parseInt(currentProductId))
        .slice(0, 4);
    
    if (relatedProducts.length === 0) return;
    
    relatedContainer.innerHTML = relatedProducts.map(createProductCard).join('');
    
    // Add event listeners to add to cart buttons
    document.querySelectorAll('#relatedProducts .add-to-cart-btn').forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-id');
            addToCart(productId);
        });
    });
}

// ===== CART PAGE FUNCTIONS =====
function loadCartItems() {
    const cartItemsContainer = document.getElementById('cartItems');
    const emptyCartDiv = document.getElementById('emptyCart');
    const itemCountElement = document.getElementById('itemCount');
    
    if (!cartItemsContainer) return;
    
    const cart = db.getCart();
    const products = db.getProducts();
    
    if (cart.length === 0) {
        emptyCartDiv.style.display = 'block';
        cartItemsContainer.innerHTML = '';
        itemCountElement.textContent = '0 items';
        document.getElementById('checkoutBtn').style.display = 'none';
        return;
    }
    
    emptyCartDiv.style.display = 'none';
    document.getElementById('checkoutBtn').style.display = 'block';
    
    let totalItems = 0;
    
    const cartItemsHTML = cart.map(cartItem => {
        const product = products.find(p => p.id === cartItem.productId);
        if (!product) return '';
        
        totalItems += cartItem.quantity;
        
        return `
            <div class="cart-item" data-id="${product.id}" data-size="${cartItem.size}">
                <div class="cart-item-image">
                    <img src="${product.image}" alt="${product.name}">
                </div>
                <div class="cart-item-details">
                    <h3>${product.name}</h3>
                    <div class="cart-item-price">$${product.price.toFixed(2)}</div>
                    <div class="cart-item-size">Size: ${cartItem.size}</div>
                    <div class="cart-item-quantity">
                        <span>Quantity:</span>
                        <div class="quantity-controls">
                            <button class="quantity-btn decrease-quantity">-</button>
                            <input type="text" class="quantity-input" value="${cartItem.quantity}" readonly>
                            <button class="quantity-btn increase-quantity">+</button>
                        </div>
                    </div>
                </div>
                <div class="cart-item-actions">
                    <button class="remove-item" data-id="${product.id}" data-size="${cartItem.size}">
                        <i class="fas fa-trash"></i> Remove
                    </button>
                </div>
            </div>
        `;
    }).join('');
    
    cartItemsContainer.innerHTML = cartItemsHTML;
    itemCountElement.textContent = `${totalItems} item${totalItems !== 1 ? 's' : ''}`;
    
    // Add event listeners
    document.querySelectorAll('.decrease-quantity').forEach(button => {
        button.addEventListener('click', function() {
            const cartItem = this.closest('.cart-item');
            const productId = cartItem.getAttribute('data-id');
            const size = cartItem.getAttribute('data-size');
            const quantityInput = cartItem.querySelector('.quantity-input');
            let quantity = parseInt(quantityInput.value);
            
            if (quantity > 1) {
                quantity--;
                db.updateCartItem(productId, size, quantity);
                loadCartItems();
                updateOrderSummary();
                updateCartCount();
            }
        });
    });
    
    document.querySelectorAll('.increase-quantity').forEach(button => {
        button.addEventListener('click', function() {
            const cartItem = this.closest('.cart-item');
            const productId = cartItem.getAttribute('data-id');
            const size = cartItem.getAttribute('data-size');
            const quantityInput = cartItem.querySelector('.quantity-input');
            let quantity = parseInt(quantityInput.value);
            
            // Check stock availability
            const product = db.getProductById(productId);
            if (quantity < product.stock) {
                quantity++;
                db.updateCartItem(productId, size, quantity);
                loadCartItems();
                updateOrderSummary();
                updateCartCount();
            } else {
                showMessage('Maximum stock reached for this item', 'error');
            }
        });
    });
    
    document.querySelectorAll('.remove-item').forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-id');
            const size = this.getAttribute('data-size');
            db.removeFromCart(productId, size);
            loadCartItems();
            updateOrderSummary();
            updateCartCount();
            showMessage('Item removed from cart', 'success');
        });
    });
}

function updateOrderSummary() {
    const cart = db.getCart();
    const products = db.getProducts();
    
    let subtotal = 0;
    
    cart.forEach(cartItem => {
        const product = products.find(p => p.id === cartItem.productId);
        if (product) {
            subtotal += product.price * cartItem.quantity;
        }
    });
    
    const tax = subtotal * 0.1; // 10% tax
    const total = subtotal + tax;
    
    const subtotalElement = document.getElementById('subtotal');
    const taxElement = document.getElementById('tax');
    const totalElement = document.getElementById('total');
    
    if (subtotalElement) subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
    if (taxElement) taxElement.textContent = `$${tax.toFixed(2)}`;
    if (totalElement) totalElement.textContent = `$${total.toFixed(2)}`;
}

// ===== CHECKOUT PAGE FUNCTIONS =====
function loadCheckoutItems() {
    const checkoutItemsContainer = document.getElementById('checkoutItems');
    if (!checkoutItemsContainer) return;
    
    const cart = db.getCart();
    const products = db.getProducts();
    
    if (cart.length === 0) {
        window.location.href = 'cart.html';
        return;
    }
    
    const itemsHTML = cart.map(cartItem => {
        const product = products.find(p => p.id === cartItem.productId);
        if (!product) return '';
        
        return `
            <div class="order-item">
                <div class="order-item-info">
                    <h4>${product.name}</h4>
                    <div class="order-item-details">
                        Size: ${cartItem.size} | Qty: ${cartItem.quantity}
                    </div>
                </div>
                <div class="order-item-price">
                    $${(product.price * cartItem.quantity).toFixed(2)}
                </div>
            </div>
        `;
    }).join('');
    
    checkoutItemsContainer.innerHTML = itemsHTML;
}

function updateCheckoutSummary() {
    const cart = db.getCart();
    const products = db.getProducts();
    
    let subtotal = 0;
    
    cart.forEach(cartItem => {
        const product = products.find(p => p.id === cartItem.productId);
        if (product) {
            subtotal += product.price * cartItem.quantity;
        }
    });
    
    const tax = subtotal * 0.1; // 10% tax
    const total = subtotal + tax;
    
    const subtotalElement = document.getElementById('checkoutSubtotal');
    const taxElement = document.getElementById('checkoutTax');
    const totalElement = document.getElementById('checkoutTotal');
    
    if (subtotalElement) subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
    if (taxElement) taxElement.textContent = `$${tax.toFixed(2)}`;
    if (totalElement) totalElement.textContent = `$${total.toFixed(2)}`;
}

function initPaymentMethods() {
    const paymentOptions = document.querySelectorAll('input[name="payment"]');
    paymentOptions.forEach(option => {
        option.addEventListener('change', function() {
            // Hide all payment details first
            document.querySelectorAll('.payment-details').forEach(detail => {
                detail.style.display = 'none';
            });
            
            // Show selected payment details
            const selectedId = this.id;
            const detailsElement = document.getElementById(`${selectedId}Details`);
            if (detailsElement) {
                detailsElement.style.display = 'block';
            }
        });
    });
    
    // Initialize with card selected
    const cardOption = document.getElementById('card');
    if (cardOption) {
        cardOption.checked = true;
        const cardDetails = document.getElementById('cardDetails');
        if (cardDetails) cardDetails.style.display = 'block';
    }
}

// ===== ADMIN PANEL FUNCTIONS =====
function initAdminPanel() {
    const loginOverlay = document.getElementById('loginOverlay');
    const adminDashboard = document.getElementById('adminDashboard');
    const submitPinBtn = document.getElementById('submitPin');
    const clearPinBtn = document.getElementById('clearPin');
    const deletePinBtn = document.getElementById('deletePin');
    const pinDisplay = document.getElementById('pinDisplay');
    const pinInput = document.getElementById('adminPin');
    const pinButtons = document.querySelectorAll('.pin-btn[data-number]');
    const logoutBtn = document.getElementById('adminLogout');
    
    let enteredPin = '';
    
    // Show login overlay by default
    if (loginOverlay) {
        loginOverlay.style.display = 'flex';
    }
    
    // Number button clicks
    pinButtons.forEach(button => {
        button.addEventListener('click', function() {
            if (enteredPin.length < 4) {
                enteredPin += this.getAttribute('data-number');
                updatePinDisplay();
            }
        });
    });
    
    // Clear button
    if (clearPinBtn) {
        clearPinBtn.addEventListener('click', function() {
            enteredPin = '';
            updatePinDisplay();
        });
    }
    
    // Delete button
    if (deletePinBtn) {
        deletePinBtn.addEventListener('click', function() {
            enteredPin = enteredPin.slice(0, -1);
            updatePinDisplay();
        });
    }
    
    // Submit PIN
    if (submitPinBtn) {
        submitPinBtn.addEventListener('click', function() {
            const adminSettings = db.getAdminSettings();
            
            if (enteredPin === adminSettings.pin) {
                // Successful login
                loginOverlay.style.display = 'none';
                adminDashboard.style.display = 'block';
                loadAdminDashboard();
            } else {
                showMessage('Incorrect PIN. Please try again.', 'error', 'loginMessage');
                enteredPin = '';
                updatePinDisplay();
            }
        });
    }
    
    // Logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            enteredPin = '';
            updatePinDisplay();
            loginOverlay.style.display = 'flex';
            adminDashboard.style.display = 'none';
        });
    }
    
    function updatePinDisplay() {
        pinInput.value = enteredPin;
        pinDisplay.textContent = '●'.repeat(enteredPin.length) + '○'.repeat(4 - enteredPin.length);
    }
}

function loadAdminDashboard() {
    updateAdminStats();
    loadAdminProducts();
    setupAdminForms();
}

function updateAdminStats() {
    const products = db.getProducts();
    const orders = db.getOrders();
    const subscribers = db.getNewsletterSubscribers();
    
    // Calculate total revenue
    let totalRevenue = 0;
    orders.forEach(order => {
        totalRevenue += order.total || 0;
    });
    
    document.getElementById('totalProducts').textContent = products.length;
    document.getElementById('totalOrders').textContent = orders.length;
    document.getElementById('newsletterSubs').textContent = subscribers.length;
    document.getElementById('totalRevenue').textContent = `$${totalRevenue.toFixed(2)}`;
    
    // Update current date
    const currentDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    const dateElement = document.getElementById('currentDate');
    if (dateElement) {
        dateElement.textContent = currentDate;
    }
}

function loadAdminProducts() {
    const tableBody = document.getElementById('productsTableBody');
    const noProductsAdmin = document.getElementById('noProductsAdmin');
    const products = db.getProducts();
    
    if (!tableBody) return;
    
    if (products.length === 0) {
        noProductsAdmin.style.display = 'block';
        tableBody.innerHTML = '';
        return;
    }
    
    noProductsAdmin.style.display = 'none';
    
    const tableRows = products.map(product => `
        <tr>
            <td>${product.id}</td>
            <td>
                <div class="product-table-image">
                    <img src="${product.image}" alt="${product.name}">
                </div>
            </td>
            <td>${product.name}</td>
            <td>${product.category}</td>
            <td>$${product.price.toFixed(2)}</td>
            <td>${product.stock}</td>
            <td>
                <div class="table-actions">
                    <button class="btn btn-small edit-product" data-id="${product.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-small btn-outline delete-product" data-id="${product.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
    
    tableBody.innerHTML = tableRows;
    
    // Add event listeners for delete buttons
    document.querySelectorAll('.delete-product').forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-id');
            if (confirm('Are you sure you want to delete this product?')) {
                db.deleteProduct(productId);
                loadAdminProducts();
                updateAdminStats();
                showMessage('Product deleted successfully', 'success', 'productFormMessage');
            }
        });
    });
}

function setupAdminForms() {
    const addProductForm = document.getElementById('addProductForm');
    const imageUrlInput = document.getElementById('productImage');
    const imagePreview = document.getElementById('imagePreview');
    const changePinBtn = document.getElementById('changePin');
    const exportDataBtn = document.getElementById('exportData');
    const resetDataBtn = document.getElementById('resetData');
    
    // Product image preview
    if (imageUrlInput && imagePreview) {
        imageUrlInput.addEventListener('input', function() {
            const url = this.value.trim();
            if (url) {
                imagePreview.innerHTML = `<img src="${url}" alt="Product preview" onerror="this.onerror=null; this.parentElement.innerHTML='<p>Unable to load image. Please check URL.</p>'">`;
            } else {
                imagePreview.innerHTML = '<p>Image preview will appear here</p>';
            }
        });
    }
    
    // Add product form submission
    if (addProductForm) {
        addProductForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = document.getElementById('productName').value;
            const price = parseFloat(document.getElementById('productPrice').value);
            const image = document.getElementById('productImage').value;
            const category = document.getElementById('productCategory').value;
            const description = document.getElementById('productDescription').value;
            const stock = parseInt(document.getElementById('productStock').value);
            
            // Get selected sizes
            const sizeCheckboxes = document.querySelectorAll('input[name="size"]:checked');
            const sizes = Array.from(sizeCheckboxes).map(cb => cb.value);
            
            if (sizes.length === 0) {
                showMessage('Please select at least one size', 'error', 'productFormMessage');
                return;
            }
            
            const newProduct = {
                name,
                price,
                image,
                category,
                description,
                sizes,
                stock,
                rating: 4.5, // Default rating
                featured: false
            };
            
            db.saveProduct(newProduct);
            
            showMessage('Product added successfully!', 'success', 'productFormMessage');
            loadAdminProducts();
            updateAdminStats();
            
            // Reset form
            this.reset();
            imagePreview.innerHTML = '<p>Image preview will appear here</p>';
        });
    }
    
    // Change PIN
    if (changePinBtn) {
        changePinBtn.addEventListener('click', function() {
            const newPin = document.getElementById('newPin').value;
            if (newPin.length === 4 && /^\d+$/.test(newPin)) {
                db.updateAdminSettings({ pin: newPin });
                showMessage('PIN updated successfully!', 'success');
                document.getElementById('newPin').value = '';
            } else {
                showMessage('Please enter a valid 4-digit PIN', 'error');
            }
        });
    }
    
    // Export data
    if (exportDataBtn) {
        exportDataBtn.addEventListener('click', function() {
            const data = {
                products: db.getProducts(),
                orders: db.getOrders(),
                subscribers: db.getNewsletterSubscribers(),
                settings: db.getAdminSettings()
            };
            
            const dataStr = JSON.stringify(data, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `solo-wear-backup-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            showMessage('Data exported successfully!', 'success');
        });
    }
    
    // Reset data
    if (resetDataBtn) {
        resetDataBtn.addEventListener('click', function() {
            if (confirm('This will reset ALL data (products, cart, orders, subscribers). Are you sure?')) {
                db.resetAllData();
                loadAdminProducts();
                updateAdminStats();
                showMessage('All data has been reset to default', 'success');
            }
        });
    }
}

// ===== UTILITY FUNCTIONS =====
function addToCart(productId, size = 'M', quantity = 1) {
    db.addToCart(productId, size, quantity);
    updateCartCount();
    showMessage('Added to cart!', 'success');
}

function showMessage(message, type = 'info', containerId = null) {
    // Create message element
    const messageDiv = document.createElement('div');
    messageDiv.className = `form-message ${type}`;
    messageDiv.textContent = message;
    
    // Add to specified container or create floating message
    if (containerId) {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = '';
            container.appendChild(messageDiv);
        }
    } else {
        // Create floating message
        messageDiv.style.position = 'fixed';
        messageDiv.style.top = '20px';
        messageDiv.style.right = '20px';
        messageDiv.style.zIndex = '10000';
        messageDiv.style.padding = '15px 20px';
        messageDiv.style.borderRadius = 'var(--border-radius)';
        messageDiv.style.boxShadow = 'var(--shadow-lg)';
        messageDiv.style.maxWidth = '300px';
        messageDiv.style.animation = 'slideIn 0.3s ease';
        
        document.body.appendChild(messageDiv);
        
        // Remove after 3 seconds
        setTimeout(() => {
            messageDiv.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (messageDiv.parentNode) {
                    document.body.removeChild(messageDiv);
                }
            }, 300);
        }, 3000);
    }
}

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    // Initialize mobile menu
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mainNav = document.querySelector('.main-nav ul');
    
    if (mobileMenuBtn && mainNav) {
        mobileMenuBtn.addEventListener('click', function() {
            mainNav.classList.toggle('active');
        });
    }
    
    // Initialize newsletter forms
    const newsletterForms = document.querySelectorAll('.newsletter-form');
    newsletterForms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const emailInput = this.querySelector('input[type="email"]');
            const email = emailInput.value.trim();
            
            if (email) {
                db.addNewsletterSubscriber(email);
                showMessage('Thank you for subscribing!', 'success');
                emailInput.value = '';
            }
        });
    });
    
    // Initialize product tabs
    initProductTabs();
    
    // Initialize checkout form
    const checkoutForm = document.getElementById('checkoutForm');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = {
                firstName: document.getElementById('firstName').value,
                lastName: document.getElementById('lastName').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                address: document.getElementById('address').value,
                city: document.getElementById('city').value,
                zip: document.getElementById('zip').value,
                country: document.getElementById('country').value,
                paymentMethod: document.querySelector('input[name="payment"]:checked').value
            };
            
            // For EasyPaisa, require transaction ID
            if (formData.paymentMethod === 'easypaisa') {
                const transactionId = document.getElementById('transactionId').value;
                if (!transactionId) {
                    showMessage('Please enter your EasyPaisa transaction ID', 'error');
                    return;
                }
                formData.transactionId = transactionId;
            }
            
            // Create order
            const cart = db.getCart();
            const products = db.getProducts();
            
            let subtotal = 0;
            const orderItems = cart.map(cartItem => {
                const product = products.find(p => p.id === cartItem.productId);
                if (product) {
                    subtotal += product.price * cartItem.quantity;
                    return {
                        productId: product.id,
                        name: product.name,
                        size: cartItem.size,
                        quantity: cartItem.quantity,
                        price: product.price
                    };
                }
                return null;
            }).filter(item => item !== null);
            
            const tax = subtotal * 0.1;
            const total = subtotal + tax;
            
            const order = {
                ...formData,
                items: orderItems,
                subtotal: subtotal.toFixed(2),
                tax: tax.toFixed(2),
                total: total.toFixed(2),
                status: 'processing'
            };
            
            // Save order
            db.saveOrder(order);
            
            // Clear cart
            db.clearCart();
            updateCartCount();
            
            // Show success message and redirect
            showMessage('Order placed successfully! Thank you for your purchase.', 'success');
            
            // In a real application, you would redirect to order confirmation page
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 3000);
        });
    }
    
    // Update cart count on all pages
    updateCartCount();
});

// ===== SHOP FILTERS =====
function initShopFilters() {
    const categoryFilters = document.querySelectorAll('.category-filter');
    const priceMinSlider = document.getElementById('priceMin');
    const priceMaxSlider = document.getElementById('priceMax');
    const minValueElement = document.getElementById('minValue');
    const maxValueElement = document.getElementById('maxValue');
    const applyPriceBtn = document.querySelector('.apply-price');
    const clearFiltersBtn = document.getElementById('clearFilters');
    const sortSelect = document.getElementById('sortProducts');
    const resetFiltersBtn = document.getElementById('resetFiltersBtn');
    const viewButtons = document.querySelectorAll('.view-btn');
    
    let minPrice = 0;
    let maxPrice = 500;
    
    // Initialize price sliders
    if (priceMinSlider && priceMaxSlider) {
        priceMinSlider.value = minPrice;
        priceMaxSlider.value = maxPrice;
        
        priceMinSlider.addEventListener('input', function() {
            minPrice = parseInt(this.value);
            if (minPrice > maxPrice - 10) {
                minPrice = maxPrice - 10;
                this.value = minPrice;
            }
            minValueElement.textContent = minPrice;
            updatePriceTrack();
        });
        
        priceMaxSlider.addEventListener('input', function() {
            maxPrice = parseInt(this.value);
            if (maxPrice < minPrice + 10) {
                maxPrice = minPrice + 10;
                this.value = maxPrice;
            }
            maxValueElement.textContent = maxPrice;
            updatePriceTrack();
        });
        
        function updatePriceTrack() {
            const track = document.querySelector('.slider-track');
            if (track) {
                const minPercent = (minPrice / 500) * 100;
                const maxPercent = (maxPrice / 500) * 100;
                track.style.left = `${minPercent}%`;
                track.style.width = `${maxPercent - minPercent}%`;
            }
        }
        
        updatePriceTrack();
    }
    
    // Apply price filter
    if (applyPriceBtn) {
        applyPriceBtn.addEventListener('click', filterProducts);
    }
    
    // Category filters
    categoryFilters.forEach(filter => {
        filter.addEventListener('change', filterProducts);
    });
    
    // Sort select
    if (sortSelect) {
        sortSelect.addEventListener('change', filterProducts);
    }
    
    // Clear filters
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', function() {
            categoryFilters.forEach(filter => filter.checked = false);
            if (priceMinSlider && priceMaxSlider) {
                priceMinSlider.value = 0;
                priceMaxSlider.value = 500;
                minPrice = 0;
                maxPrice = 500;
                minValueElement.textContent = '0';
                maxValueElement.textContent = '500';
                updatePriceTrack();
            }
            if (sortSelect) sortSelect.value = 'featured';
            filterProducts();
        });
    }
    
    // Reset filters button
    if (resetFiltersBtn) {
        resetFiltersBtn.addEventListener('click', function() {
            if (clearFiltersBtn) clearFiltersBtn.click();
        });
    }
    
    // View controls
    viewButtons.forEach(button => {
        button.addEventListener('click', function() {
            const view = this.getAttribute('data-view');
            viewButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            const productsGrid = document.getElementById('productsGrid');
            if (productsGrid) {
                if (view === 'list') {
                    productsGrid.classList.add('list-view');
                } else {
                    productsGrid.classList.remove('list-view');
                }
            }
        });
    });
    
    // Initial filter
    filterProducts();
}

function filterProducts() {
    const productsGrid = document.getElementById('productsGrid');
    const productsCount = document.getElementById('productsCount');
    const noProductsMessage = document.getElementById('noProductsMessage');
    
    if (!productsGrid) return;
    
    const products = db.getProducts();
    
    // Get active filters
    const selectedCategories = Array.from(document.querySelectorAll('.category-filter:checked'))
        .map(cb => cb.value);
    
    const sortBy = document.getElementById('sortProducts')?.value || 'featured';
    
    // Filter products
    let filteredProducts = products.filter(product => {
        // Category filter
        if (selectedCategories.length > 0 && !selectedCategories.includes(product.category)) {
            return false;
        }
        
        // Price filter
        if (product.price < minPrice || product.price > maxPrice) {
            return false;
        }
        
        return true;
    });
    
    // Sort products
    filteredProducts.sort((a, b) => {
        switch (sortBy) {
            case 'price-low':
                return a.price - b.price;
            case 'price-high':
                return b.price - a.price;
            case 'name':
                return a.name.localeCompare(b.name);
            case 'newest':
                return b.id - a.id;
            case 'featured':
            default:
                return (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || b.id - a.id;
        }
    });
    
    // Update display
    if (filteredProducts.length === 0) {
        productsGrid.style.display = 'none';
        noProductsMessage.style.display = 'block';
        productsCount.textContent = '0 products found';
    } else {
        productsGrid.style.display = 'grid';
        noProductsMessage.style.display = 'none';
        productsGrid.innerHTML = filteredProducts.map(createProductCard).join('');
        productsCount.textContent = `${filteredProducts.length} product${filteredProducts.length !== 1 ? 's' : ''} found`;
        
        // Add event listeners to add to cart buttons
        document.querySelectorAll('.add-to-cart-btn').forEach(button => {
            button.addEventListener('click', function() {
                const productId = this.getAttribute('data-id');
                addToCart(productId);
            });
        });
    }
}

// ===== PRODUCT TABS =====
function initProductTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // Update active button
            tabButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Show active tab
            tabPanes.forEach(pane => {
                pane.classList.remove('active');
                if (pane.id === tabId) {
                    pane.classList.add('active');
                }
            });
        });
    });
}

// ===== HERO SLIDER =====
function initSlider() {
    const slides = document.querySelectorAll('.slide');
    const prevBtn = document.querySelector('.slider-prev');
    const nextBtn = document.querySelector('.slider-next');
    const dotsContainer = document.querySelector('.slider-dots');
    
    if (slides.length === 0) return;
    
    let currentSlide = 0;
    
    // Create dots
    slides.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.className = 'dot';
        if (index === 0) dot.classList.add('active');
        dot.addEventListener('click', () => goToSlide(index));
        dotsContainer.appendChild(dot);
    });
    
    const dots = document.querySelectorAll('.dot');
    
    function goToSlide(n) {
        slides[currentSlide].classList.remove('active');
        dots[currentSlide].classList.remove('active');
        
        currentSlide = (n + slides.length) % slides.length;
        
        slides[currentSlide].classList.add('active');
        dots[currentSlide].classList.add('active');
    }
    
    function nextSlide() {
        goToSlide(currentSlide + 1);
    }
    
    function prevSlide() {
        goToSlide(currentSlide - 1);
    }
    
    // Auto slide every 5 seconds
    let slideInterval = setInterval(nextSlide, 5000);
    
    // Reset interval on interaction
    function resetInterval() {
        clearInterval(slideInterval);
        slideInterval = setInterval(nextSlide, 5000);
    }
    
    if (nextBtn) nextBtn.addEventListener('click', () => { nextSlide(); resetInterval(); });
    if (prevBtn) prevBtn.addEventListener('click', () => { prevSlide(); resetInterval(); });
    
    // Pause on hover
    const sliderContainer = document.querySelector('.slider-container');
    if (sliderContainer) {
        sliderContainer.addEventListener('mouseenter', () => clearInterval(slideInterval));
        sliderContainer.addEventListener('mouseleave', resetInterval);
    }
}

// ===== GLOBAL EXPORTS =====
// Make functions available globally for inline event handlers
window.addToCart = function(productId, size = 'M', quantity = 1) {
    db.addToCart(productId, size, quantity);
    updateCartCount();
    showMessage('Added to cart!', 'success');
};

window.updateCartCount = updateCartCount;
window.loadFeaturedProducts = loadFeaturedProducts;
window.loadAllProducts = loadAllProducts;
window.loadProductDetail = loadProductDetail;
window.initProductTabs = initProductTabs;
window.loadCartItems = loadCartItems;
window.updateOrderSummary = updateOrderSummary;
window.loadCheckoutItems = loadCheckoutItems;
window.updateCheckoutSummary = updateCheckoutSummary;
window.initPaymentMethods = initPaymentMethods;
window.initAdminPanel = initAdminPanel;
window.initShopFilters = initShopFilters;
window.initSlider = initSlider;
