// ===========================================
// SOLO WEAR LUXURY FASHION - COMPLETE JAVASCRIPT
// ===========================================

// Firebase Configuration
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

// Global Variables
let products = [];
let cart = [];
let shippingCost = 0;
let adminLoggedIn = false;
const ADMIN_PIN = "134047";

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Initialize Application
function initializeApp() {
    // Initialize components based on current page
    const currentPage = getCurrentPage();
    
    // Common initialization for all pages
    initMobileMenu();
    initAdminOverlay();
    updateCartCount();
    
    // Page-specific initialization
    switch(currentPage) {
        case 'index':
            loadFeaturedProducts();
            break;
        case 'shop':
            initShopPage();
            break;
        case 'product':
            initProductPage();
            break;
        case 'cart':
            initCartPage();
            break;
        case 'checkout':
            initCheckoutPage();
            break;
        case 'admin':
            initAdminPage();
            break;
        case 'contact':
            initContactPage();
            break;
    }
    
    // Load cart from localStorage
    loadCartFromStorage();
    
    // Load shipping cost from Firebase
    loadShippingCost();
    
    // Load products from Firebase
    loadProducts();
}

// Get current page name
function getCurrentPage() {
    const path = window.location.pathname;
    const page = path.split("/").pop().replace(".html", "");
    return page === "" ? "index" : page;
}

// Initialize Mobile Menu
function initMobileMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const mainNav = document.getElementById('mainNav');
    
    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', function() {
            mainNav.classList.toggle('active');
            menuToggle.classList.toggle('active');
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(event) {
            if (!menuToggle.contains(event.target) && !mainNav.contains(event.target)) {
                mainNav.classList.remove('active');
                menuToggle.classList.remove('active');
            }
        });
    }
}

// Initialize Admin Overlay
function initAdminOverlay() {
    const adminOverlay = document.getElementById('adminOverlay');
    const adminLoginBtn = document.getElementById('adminLoginBtn');
    const adminCloseBtn = document.getElementById('adminCloseBtn');
    const adminPinInput = document.getElementById('adminPin');
    const adminError = document.getElementById('adminError');
    
    // Show admin overlay on admin page
    if (getCurrentPage() === 'admin') {
        if (adminOverlay) {
            adminOverlay.classList.add('active');
        }
    }
    
    // Admin login functionality
    if (adminLoginBtn && adminPinInput) {
        adminLoginBtn.addEventListener('click', function() {
            const pin = adminPinInput.value.trim();
            
            if (pin === ADMIN_PIN) {
                // Successful login
                adminError.textContent = '';
                adminError.style.color = '#4CAF50';
                adminError.textContent = 'Login successful!';
                
                // Hide overlay and show dashboard
                setTimeout(() => {
                    if (adminOverlay) {
                        adminOverlay.classList.remove('active');
                    }
                    
                    const adminDashboard = document.getElementById('adminDashboard');
                    if (adminDashboard) {
                        adminDashboard.classList.add('active');
                        adminLoggedIn = true;
                        
                        // Update last login time
                        updateLastLoginTime();
                        
                        // Initialize admin dashboard
                        initAdminDashboard();
                    }
                }, 1000);
            } else {
                // Failed login
                adminError.textContent = 'Invalid PIN. Please try again.';
                adminError.style.color = '#F44336';
                adminPinInput.value = '';
                adminPinInput.focus();
                
                // Shake animation
                adminPinInput.style.animation = 'shake 0.5s';
                setTimeout(() => {
                    adminPinInput.style.animation = '';
                }, 500);
            }
        });
        
        // Allow Enter key to submit
        adminPinInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                adminLoginBtn.click();
            }
        });
    }
    
    // Close overlay button
    if (adminCloseBtn) {
        adminCloseBtn.addEventListener('click', function() {
            if (adminOverlay) {
                adminOverlay.classList.remove('active');
            }
            
            // Redirect to home page if not on admin page
            if (getCurrentPage() !== 'admin') {
                window.location.href = 'index.html';
            }
        });
    }
    
    // Close overlay when clicking outside
    if (adminOverlay) {
        adminOverlay.addEventListener('click', function(e) {
            if (e.target === adminOverlay) {
                adminOverlay.classList.remove('active');
                
                // Redirect to home page if not on admin page
                if (getCurrentPage() !== 'admin') {
                    window.location.href = 'index.html';
                }
            }
        });
    }
}

// Update Last Login Time
function updateLastLoginTime() {
    const now = new Date();
    const lastLoginElement = document.getElementById('lastLoginTime');
    
    if (lastLoginElement) {
        const timeString = now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        const dateString = now.toLocaleDateString();
        lastLoginElement.textContent = `${dateString} at ${timeString}`;
    }
}

// Initialize Admin Dashboard
function initAdminDashboard() {
    initAdminNavigation();
    initProductForm();
    initShippingForm();
    loadAdminProducts();
    loadAdminOrders();
    updateAdminStats();
}

// Initialize Admin Navigation
function initAdminNavigation() {
    const adminNavLinks = document.querySelectorAll('.admin-nav-link');
    const adminSections = document.querySelectorAll('.admin-section');
    
    adminNavLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Get target section
            const targetSection = this.getAttribute('data-section');
            
            // Update active link
            adminNavLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            // Show target section
            adminSections.forEach(section => {
                section.classList.remove('active');
                if (section.id === `${targetSection}Section`) {
                    section.classList.add('active');
                }
            });
            
            // Handle quick actions
            if (targetSection === 'products') {
                document.getElementById('productName')?.focus();
            }
        });
    });
    
    // Quick action buttons
    const quickAddProduct = document.getElementById('quickAddProduct');
    const quickViewOrders = document.getElementById('quickViewOrders');
    const quickUpdateShipping = document.getElementById('quickUpdateShipping');
    
    if (quickAddProduct) {
        quickAddProduct.addEventListener('click', function() {
            // Switch to products section
            document.querySelector('[data-section="products"]')?.click();
            document.getElementById('productName')?.focus();
        });
    }
    
    if (quickViewOrders) {
        quickViewOrders.addEventListener('click', function() {
            // Switch to orders section
            document.querySelector('[data-section="orders"]')?.click();
        });
    }
    
    if (quickUpdateShipping) {
        quickUpdateShipping.addEventListener('click', function() {
            // Switch to shipping section
            document.querySelector('[data-section="shipping"]')?.click();
            document.getElementById('shippingCost')?.focus();
        });
    }
    
    // Admin logout
    const adminLogoutBtn = document.getElementById('adminLogoutBtn');
    if (adminLogoutBtn) {
        adminLogoutBtn.addEventListener('click', function() {
            adminLoggedIn = false;
            
            // Hide dashboard and show login overlay
            const adminDashboard = document.getElementById('adminDashboard');
            const adminOverlay = document.getElementById('adminOverlay');
            
            if (adminDashboard) adminDashboard.classList.remove('active');
            if (adminOverlay) adminOverlay.classList.add('active');
            
            // Clear PIN input
            const adminPinInput = document.getElementById('adminPin');
            if (adminPinInput) adminPinInput.value = '';
            
            // Clear error message
            const adminError = document.getElementById('adminError');
            if (adminError) adminError.textContent = '';
        });
    }
}

// Initialize Product Form
function initProductForm() {
    const productForm = document.getElementById('productForm');
    const resetProductForm = document.getElementById('resetProductForm');
    
    if (productForm) {
        productForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form values
            const productName = document.getElementById('productName').value.trim();
            const productCategory = document.getElementById('productCategory').value;
            const productPrice = parseFloat(document.getElementById('productPrice').value);
            const productComparePrice = document.getElementById('productComparePrice').value;
            const productDescription = document.getElementById('productDescription').value.trim();
            const productImageURL = document.getElementById('productImageURL').value.trim();
            const productMaterial = document.getElementById('productMaterial').value.trim();
            const productStock = parseInt(document.getElementById('productStock').value) || 10;
            
            // Validate form
            if (!productName || !productCategory || !productPrice || !productDescription || !productImageURL) {
                showFormMessage('productFormMessage', 'Please fill in all required fields.', 'error');
                return;
            }
            
            if (productPrice <= 0) {
                showFormMessage('productFormMessage', 'Price must be greater than 0.', 'error');
                return;
            }
            
            // Create product object
            const product = {
                id: generateProductId(),
                name: productName,
                category: productCategory,
                price: productPrice,
                comparePrice: productComparePrice ? parseFloat(productComparePrice) : null,
                description: productDescription,
                imageURL: productImageURL,
                material: productMaterial || 'Premium Fabric',
                stock: productStock,
                featured: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            
            // Save product to Firebase
            saveProductToFirebase(product);
        });
    }
    
    if (resetProductForm) {
        resetProductForm.addEventListener('click', function() {
            if (productForm) {
                productForm.reset();
                showFormMessage('productFormMessage', 'Form has been reset.', 'success');
            }
        });
    }
}

// Save Product to Firebase
function saveProductToFirebase(product) {
    const productRef = db.ref('products/' + product.id);
    
    productRef.set(product)
        .then(() => {
            showFormMessage('productFormMessage', 'Product saved successfully!', 'success');
            
            // Reset form
            const productForm = document.getElementById('productForm');
            if (productForm) productForm.reset();
            
            // Reload products list
            loadAdminProducts();
            loadProducts();
            
            // Update stats
            updateAdminStats();
        })
        .catch((error) => {
            showFormMessage('productFormMessage', 'Error saving product: ' + error.message, 'error');
        });
}

// Generate Product ID
function generateProductId() {
    return 'prod_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Show Form Message
function showFormMessage(elementId, message, type) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = message;
        element.className = 'form-message ' + type;
        
        // Clear message after 5 seconds
        setTimeout(() => {
            element.textContent = '';
            element.className = 'form-message';
        }, 5000);
    }
}

// Load Admin Products
function loadAdminProducts() {
    const productsList = document.getElementById('adminProductsList');
    if (!productsList) return;
    
    const productsRef = db.ref('products');
    
    productsRef.on('value', (snapshot) => {
        const data = snapshot.val();
        products = [];
        
        if (data) {
            // Convert object to array
            Object.keys(data).forEach(key => {
                products.push(data[key]);
            });
            
            // Update total products count
            const totalProductsElement = document.getElementById('totalProducts');
            if (totalProductsElement) {
                totalProductsElement.textContent = products.length;
            }
            
            // Render products
            renderAdminProducts(products);
        } else {
            productsList.innerHTML = `
                <div class="empty-products-message">
                    <i class="fas fa-box-open"></i>
                    <p>No products added yet</p>
                </div>
            `;
            
            // Update total products count
            const totalProductsElement = document.getElementById('totalProducts');
            if (totalProductsElement) {
                totalProductsElement.textContent = '0';
            }
        }
    });
}

// Render Admin Products
function renderAdminProducts(products) {
    const productsList = document.getElementById('adminProductsList');
    if (!productsList) return;
    
    productsList.innerHTML = '';
    
    products.forEach(product => {
        const productElement = document.createElement('div');
        productElement.className = 'admin-product-item';
        
        const comparePriceHTML = product.comparePrice ? 
            `<span class="product-compare">$${product.comparePrice.toFixed(2)}</span>` : '';
        
        productElement.innerHTML = `
            <div class="admin-product-header">
                <h4>${product.name}</h4>
                <span class="admin-product-price">$${product.price.toFixed(2)} ${comparePriceHTML}</span>
            </div>
            <div class="admin-product-details">
                <p><strong>Category:</strong> ${product.category}</p>
                <p><strong>Stock:</strong> ${product.stock}</p>
                <p><strong>Material:</strong> ${product.material}</p>
                <p><strong>Added:</strong> ${formatDate(product.createdAt)}</p>
            </div>
            <div class="admin-product-actions">
                <button class="btn-edit" data-id="${product.id}">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn-delete" data-id="${product.id}">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        `;
        
        productsList.appendChild(productElement);
    });
    
    // Add event listeners to edit and delete buttons
    document.querySelectorAll('.btn-edit').forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-id');
            editProduct(productId);
        });
    });
    
    document.querySelectorAll('.btn-delete').forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-id');
            deleteProduct(productId);
        });
    });
}

// Edit Product
function editProduct(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    // Fill form with product data
    document.getElementById('productName').value = product.name;
    document.getElementById('productCategory').value = product.category;
    document.getElementById('productPrice').value = product.price;
    document.getElementById('productComparePrice').value = product.comparePrice || '';
    document.getElementById('productDescription').value = product.description;
    document.getElementById('productImageURL').value = product.imageURL;
    document.getElementById('productMaterial').value = product.material;
    document.getElementById('productStock').value = product.stock;
    
    // Change form submit button text
    const submitButton = document.querySelector('#productForm button[type="submit"]');
    if (submitButton) {
        submitButton.innerHTML = '<i class="fas fa-save"></i> Update Product';
        submitButton.setAttribute('data-editing-id', productId);
        
        // Update form submission to handle edit
        const productForm = document.getElementById('productForm');
        if (productForm) {
            const originalSubmitHandler = productForm.onsubmit;
            
            productForm.onsubmit = function(e) {
                e.preventDefault();
                
                // Get updated values
                const updatedProduct = {
                    ...product,
                    name: document.getElementById('productName').value.trim(),
                    category: document.getElementById('productCategory').value,
                    price: parseFloat(document.getElementById('productPrice').value),
                    comparePrice: document.getElementById('productComparePrice').value ? 
                        parseFloat(document.getElementById('productComparePrice').value) : null,
                    description: document.getElementById('productDescription').value.trim(),
                    imageURL: document.getElementById('productImageURL').value.trim(),
                    material: document.getElementById('productMaterial').value.trim(),
                    stock: parseInt(document.getElementById('productStock').value) || 10,
                    updatedAt: new Date().toISOString()
                };
                
                // Update in Firebase
                const productRef = db.ref('products/' + productId);
                productRef.update(updatedProduct)
                    .then(() => {
                        showFormMessage('productFormMessage', 'Product updated successfully!', 'success');
                        
                        // Reset form and button
                        productForm.reset();
                        submitButton.innerHTML = '<i class="fas fa-save"></i> Save Product';
                        submitButton.removeAttribute('data-editing-id');
                        
                        // Restore original handler
                        productForm.onsubmit = originalSubmitHandler;
                        
                        // Reload products
                        loadAdminProducts();
                        loadProducts();
                    })
                    .catch((error) => {
                        showFormMessage('productFormMessage', 'Error updating product: ' + error.message, 'error');
                    });
            };
        }
    }
    
    // Scroll to form
    document.querySelector('[data-section="products"]')?.click();
    document.getElementById('productName')?.focus();
}

// Delete Product
function deleteProduct(productId) {
    if (confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
        const productRef = db.ref('products/' + productId);
        
        productRef.remove()
            .then(() => {
                showFormMessage('productFormMessage', 'Product deleted successfully!', 'success');
                loadAdminProducts();
                loadProducts();
                updateAdminStats();
            })
            .catch((error) => {
                showFormMessage('productFormMessage', 'Error deleting product: ' + error.message, 'error');
            });
    }
}

// Initialize Shipping Form
function initShippingForm() {
    const shippingForm = document.getElementById('shippingForm');
    
    if (shippingForm) {
        // Load current shipping settings
        loadShippingSettings();
        
        shippingForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form values
            const shippingCost = parseFloat(document.getElementById('shippingCost').value);
            const freeShippingThreshold = document.getElementById('freeShippingThreshold').value;
            const shippingDescription = document.getElementById('shippingDescription').value.trim();
            
            // Validate
            if (isNaN(shippingCost) || shippingCost < 0) {
                showFormMessage('shippingFormMessage', 'Please enter a valid shipping cost.', 'error');
                return;
            }
            
            // Create shipping settings object
            const shippingSettings = {
                cost: shippingCost,
                freeShippingThreshold: freeShippingThreshold ? parseFloat(freeShippingThreshold) : null,
                description: shippingDescription,
                updatedAt: new Date().toISOString()
            };
            
            // Save to Firebase
            saveShippingSettings(shippingSettings);
        });
    }
}

// Load Shipping Settings
function loadShippingSettings() {
    const shippingRef = db.ref('shipping');
    
    shippingRef.once('value', (snapshot) => {
        const data = snapshot.val();
        
        if (data) {
            // Update form fields
            const shippingCostInput = document.getElementById('shippingCost');
            const freeShippingThresholdInput = document.getElementById('freeShippingThreshold');
            const shippingDescriptionInput = document.getElementById('shippingDescription');
            
            if (shippingCostInput) shippingCostInput.value = data.cost || 0;
            if (freeShippingThresholdInput) freeShippingThresholdInput.value = data.freeShippingThreshold || '';
            if (shippingDescriptionInput) shippingDescriptionInput.value = data.description || 'Standard shipping with tracking. Delivery within 7-14 business days.';
            
            // Update display
            updateShippingDisplay(data);
        }
    });
}

// Save Shipping Settings
function saveShippingSettings(settings) {
    const shippingRef = db.ref('shipping');
    
    shippingRef.set(settings)
        .then(() => {
            showFormMessage('shippingFormMessage', 'Shipping settings saved successfully!', 'success');
            updateShippingDisplay(settings);
            loadShippingCost(); // Update global shipping cost
        })
        .catch((error) => {
            showFormMessage('shippingFormMessage', 'Error saving shipping settings: ' + error.message, 'error');
        });
}

// Update Shipping Display in Admin
function updateShippingDisplay(settings) {
    const currentShippingCost = document.getElementById('currentShippingCost');
    const currentFreeShipping = document.getElementById('currentFreeShipping');
    const shippingLastUpdated = document.getElementById('shippingLastUpdated');
    
    if (currentShippingCost) {
        currentShippingCost.textContent = `$${settings.cost.toFixed(2)}`;
    }
    
    if (currentFreeShipping) {
        currentFreeShipping.textContent = settings.freeShippingThreshold ? 
            `$${settings.freeShippingThreshold.toFixed(2)}` : 'Not set';
    }
    
    if (shippingLastUpdated) {
        shippingLastUpdated.textContent = formatDate(settings.updatedAt);
    }
}

// Load Admin Orders
function loadAdminOrders() {
    const ordersList = document.getElementById('adminOrdersList');
    if (!ordersList) return;
    
    const ordersRef = db.ref('orders');
    
    ordersRef.on('value', (snapshot) => {
        const data = snapshot.val();
        let orders = [];
        let totalRevenue = 0;
        let pendingOrders = 0;
        let completedOrders = 0;
        
        if (data) {
            // Convert object to array
            Object.keys(data).forEach(key => {
                const order = data[key];
                order.id = key;
                orders.push(order);
                
                // Calculate stats
                totalRevenue += order.total || 0;
                if (order.status === 'pending') pendingOrders++;
                if (order.status === 'completed') completedOrders++;
            });
            
            // Update order stats
            const statTotalOrders = document.getElementById('statTotalOrders');
            const statPendingOrders = document.getElementById('statPendingOrders');
            const statCompletedOrders = document.getElementById('statCompletedOrders');
            const statTotalRevenue = document.getElementById('statTotalRevenue');
            const totalOrdersElement = document.getElementById('totalOrders');
            const totalRevenueElement = document.getElementById('totalRevenue');
            
            if (statTotalOrders) statTotalOrders.textContent = orders.length;
            if (statPendingOrders) statPendingOrders.textContent = pendingOrders;
            if (statCompletedOrders) statCompletedOrders.textContent = completedOrders;
            if (statTotalRevenue) statTotalRevenue.textContent = `$${totalRevenue.toFixed(2)}`;
            if (totalOrdersElement) totalOrdersElement.textContent = orders.length;
            if (totalRevenueElement) totalRevenueElement.textContent = `$${totalRevenue.toFixed(2)}`;
            
            // Render orders (most recent first)
            orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            renderAdminOrders(orders);
        } else {
            ordersList.innerHTML = `
                <div class="empty-orders-message">
                    <i class="fas fa-shopping-cart"></i>
                    <p>No orders placed yet</p>
                </div>
            `;
            
            // Update order stats
            const statTotalOrders = document.getElementById('statTotalOrders');
            const statPendingOrders = document.getElementById('statPendingOrders');
            const statCompletedOrders = document.getElementById('statCompletedOrders');
            const statTotalRevenue = document.getElementById('statTotalRevenue');
            const totalOrdersElement = document.getElementById('totalOrders');
            const totalRevenueElement = document.getElementById('totalRevenue');
            
            if (statTotalOrders) statTotalOrders.textContent = '0';
            if (statPendingOrders) statPendingOrders.textContent = '0';
            if (statCompletedOrders) statCompletedOrders.textContent = '0';
            if (statTotalRevenue) statTotalRevenue.textContent = '$0.00';
            if (totalOrdersElement) totalOrdersElement.textContent = '0';
            if (totalRevenueElement) totalRevenueElement.textContent = '$0.00';
        }
    });
}

// Render Admin Orders
function renderAdminOrders(orders) {
    const ordersList = document.getElementById('adminOrdersList');
    if (!ordersList) return;
    
    ordersList.innerHTML = '';
    
    orders.forEach(order => {
        const orderElement = document.createElement('div');
        orderElement.className = 'admin-order-item';
        
        // Format items list
        let itemsText = '';
        if (order.items && order.items.length > 0) {
            itemsText = order.items.map(item => `${item.name} (x${item.quantity})`).join(', ');
            if (itemsText.length > 50) {
                itemsText = itemsText.substring(0, 50) + '...';
            }
        }
        
        orderElement.innerHTML = `
            <div class="admin-order-header">
                <h4>Order #${order.id.substring(0, 8)}</h4>
                <span class="admin-order-total">$${order.total ? order.total.toFixed(2) : '0.00'}</span>
            </div>
            <div class="admin-order-details">
                <p><strong>Customer:</strong> ${order.customer ? order.customer.name : 'N/A'}</p>
                <p><strong>Date:</strong> ${formatDate(order.createdAt)}</p>
                <p><strong>Items:</strong> ${itemsText || 'No items'}</p>
                <p><strong>Status:</strong> <span class="status-${order.status || 'pending'}">${order.status || 'pending'}</span></p>
            </div>
            <div class="admin-order-actions">
                <button class="btn-view-order" data-id="${order.id}">
                    <i class="fas fa-eye"></i> View
                </button>
                <button class="btn-edit" data-id="${order.id}">
                    <i class="fas fa-edit"></i> Update
                </button>
            </div>
        `;
        
        ordersList.appendChild(orderElement);
    });
    
    // Add status styling
    const style = document.createElement('style');
    style.textContent = `
        .status-pending { color: #FF9800; font-weight: 600; }
        .status-processing { color: #2196F3; font-weight: 600; }
        .status-shipped { color: #3F51B5; font-weight: 600; }
        .status-completed { color: #4CAF50; font-weight: 600; }
        .status-cancelled { color: #F44336; font-weight: 600; }
    `;
    document.head.appendChild(style);
}

// Update Admin Stats
function updateAdminStats() {
    // Products count is updated in loadAdminProducts
    // Orders count and revenue are updated in loadAdminOrders
    
    // Update site visits (simulated)
    const siteVisitsElement = document.getElementById('siteVisits');
    if (siteVisitsElement) {
        // Get current visits from localStorage or use random number
        let visits = localStorage.getItem('siteVisits');
        if (!visits) {
            visits = Math.floor(Math.random() * 1000) + 500;
            localStorage.setItem('siteVisits', visits);
        } else {
            // Increment by random amount
            visits = parseInt(visits) + Math.floor(Math.random() * 10) + 1;
            localStorage.setItem('siteVisits', visits);
        }
        
        siteVisitsElement.textContent = visits.toLocaleString();
    }
    
    // Update last sync time
    const lastSyncTime = document.getElementById('lastSyncTime');
    if (lastSyncTime) {
        const now = new Date();
        const timeString = now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'});
        lastSyncTime.textContent = timeString;
    }
}

// Format Date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
}

// Initialize Shop Page
function initShopPage() {
    const productSearch = document.getElementById('productSearch');
    const sortProducts = document.getElementById('sortProducts');
    
    // Search functionality
    if (productSearch) {
        productSearch.addEventListener('input', function() {
            filterProducts(this.value);
        });
    }
    
    // Sort functionality
    if (sortProducts) {
        sortProducts.addEventListener('change', function() {
            sortProductsList(this.value);
        });
    }
}

// Filter Products
function filterProducts(searchTerm) {
    const shopProductsGrid = document.getElementById('shopProductsGrid');
    if (!shopProductsGrid || !products.length) return;
    
    const filteredProducts = products.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.material.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    renderProductsGrid(filteredProducts, 'shopProductsGrid');
}

// Sort Products List
function sortProductsList(sortBy) {
    let sortedProducts = [...products];
    
    switch(sortBy) {
        case 'price-low':
            sortedProducts.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            sortedProducts.sort((a, b) => b.price - a.price);
            break;
        case 'name':
            sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
            break;
        default:
            // Default sort (by date added, newest first)
            sortedProducts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    
    renderProductsGrid(sortedProducts, 'shopProductsGrid');
}

// Initialize Product Page
function initProductPage() {
    // Quantity controls
    const quantityMinus = document.getElementById('quantityMinus');
    const quantityPlus = document.getElementById('quantityPlus');
    const productQuantity = document.getElementById('productQuantity');
    
    if (quantityMinus && productQuantity) {
        quantityMinus.addEventListener('click', function() {
            let currentValue = parseInt(productQuantity.value);
            if (currentValue > 1) {
                productQuantity.value = currentValue - 1;
            }
        });
    }
    
    if (quantityPlus && productQuantity) {
        quantityPlus.addEventListener('click', function() {
            let currentValue = parseInt(productQuantity.value);
            if (currentValue < 10) {
                productQuantity.value = currentValue + 1;
            }
        });
    }
    
    // Add to cart button
    const addToCartBtn = document.getElementById('addToCartBtn');
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', function() {
            // For demo purposes, add a sample product to cart
            // In a real app, this would add the actual product being viewed
            
            const sampleProduct = {
                id: 'sample_product',
                name: 'Sample Luxury Item',
                price: 299.99,
                imageURL: 'https://via.placeholder.com/150/1a1a1a/cccccc?text=Sample+Product',
                category: 'Clothing'
            };
            
            const quantity = parseInt(productQuantity.value) || 1;
            addToCart(sampleProduct, quantity);
            
            // Show confirmation
            const originalText = addToCartBtn.innerHTML;
            addToCartBtn.innerHTML = '<i class="fas fa-check"></i> Added to Cart!';
            addToCartBtn.style.background = 'linear-gradient(to right, #4CAF50, #45a049)';
            
            setTimeout(() => {
                addToCartBtn.innerHTML = originalText;
                addToCartBtn.style.background = 'linear-gradient(to right, var(--secondary-gold), var(--accent-gold))';
            }, 2000);
        });
    }
    
    // Update shipping cost display
    updateShippingCostDisplay();
}

// Update Shipping Cost Display
function updateShippingCostDisplay() {
    const shippingCostDisplay = document.getElementById('shippingCostDisplay');
    if (shippingCostDisplay) {
        shippingCostDisplay.textContent = `$${shippingCost.toFixed(2)}`;
    }
}

// Initialize Cart Page
function initCartPage() {
    renderCartItems();
    
    // Update cart button
    const updateCartBtn = document.getElementById('updateCartBtn');
    if (updateCartBtn) {
        updateCartBtn.addEventListener('click', function() {
            updateCartQuantities();
        });
    }
    
    // Clear cart button
    const clearCartBtn = document.getElementById('clearCartBtn');
    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', function() {
            if (confirm('Are you sure you want to clear your cart?')) {
                clearCart();
            }
        });
    }
    
    // Checkout button
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function(e) {
            if (cart.length === 0) {
                e.preventDefault();
                alert('Your cart is empty. Add some items before checking out.');
            }
        });
    }
}

// Render Cart Items
function renderCartItems() {
    const cartItemsContainer = document.getElementById('cartItemsContainer');
    if (!cartItemsContainer) return;
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="empty-cart-message">
                <i class="fas fa-shopping-cart"></i>
                <h3>Your cart is empty</h3>
                <p>Add some luxurious items from our collection</p>
                <a href="shop.html" class="btn-continue-shopping">Continue Shopping</a>
            </div>
        `;
        
        // Update cart summary
        updateCartSummary();
        return;
    }
    
    let cartHTML = '';
    
    cart.forEach((item, index) => {
        cartHTML += `
            <div class="cart-item" data-index="${index}">
                <div class="cart-item-product">
                    <div class="cart-item-image">
                        <img src="${item.imageURL}" alt="${item.name}" onerror="this.src='https://via.placeholder.com/150/1a1a1a/cccccc?text=Product+Image'">
                    </div>
                    <div class="cart-item-info">
                        <h4>${item.name}</h4>
                        <p>${item.category}</p>
                    </div>
                </div>
                <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                <div class="cart-item-quantity">
                    <input type="number" class="cart-quantity-input" value="${item.quantity}" min="1" max="10" data-index="${index}">
                </div>
                <div class="cart-item-total">$${(item.price * item.quantity).toFixed(2)}</div>
                <div class="cart-item-remove">
                    <button class="remove-item-btn" data-index="${index}">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        `;
    });
    
    cartItemsContainer.innerHTML = cartHTML;
    
    // Add event listeners
    document.querySelectorAll('.remove-item-btn').forEach(button => {
        button.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            removeFromCart(index);
        });
    });
    
    document.querySelectorAll('.cart-quantity-input').forEach(input => {
        input.addEventListener('change', function() {
            const index = parseInt(this.getAttribute('data-index'));
            const newQuantity = parseInt(this.value);
            
            if (newQuantity >= 1 && newQuantity <= 10) {
                updateCartItemQuantity(index, newQuantity);
            } else {
                // Reset to original value
                this.value = cart[index].quantity;
            }
        });
    });
    
    // Update cart summary
    updateCartSummary();
}

// Update Cart Quantities
function updateCartQuantities() {
    document.querySelectorAll('.cart-quantity-input').forEach(input => {
        const index = parseInt(input.getAttribute('data-index'));
        const newQuantity = parseInt(input.value);
        
        if (newQuantity >= 1 && newQuantity <= 10) {
            updateCartItemQuantity(index, newQuantity);
        }
    });
    
    // Show confirmation
    const updateCartBtn = document.getElementById('updateCartBtn');
    if (updateCartBtn) {
        const originalText = updateCartBtn.innerHTML;
        updateCartBtn.innerHTML = '<i class="fas fa-check"></i> Cart Updated!';
        updateCartBtn.style.background = 'linear-gradient(to right, #4CAF50, #45a049)';
        
        setTimeout(() => {
            updateCartBtn.innerHTML = originalText;
            updateCartBtn.style.background = 'rgba(76, 175, 80, 0.2)';
        }, 2000);
    }
}

// Update Cart Summary
function updateCartSummary() {
    // Calculate totals
    let subtotal = 0;
    cart.forEach(item => {
        subtotal += item.price * item.quantity;
    });
    
    const tax = subtotal * 0.08; // 8% tax
    const total = subtotal + shippingCost + tax;
    
    // Update display
    const cartSubtotal = document.getElementById('cartSubtotal');
    const cartShipping = document.getElementById('cartShipping');
    const cartTax = document.getElementById('cartTax');
    const cartTotal = document.getElementById('cartTotal');
    
    if (cartSubtotal) cartSubtotal.textContent = `$${subtotal.toFixed(2)}`;
    if (cartShipping) cartShipping.textContent = `$${shippingCost.toFixed(2)}`;
    if (cartTax) cartTax.textContent = `$${tax.toFixed(2)}`;
    if (cartTotal) cartTotal.textContent = `$${total.toFixed(2)}`;
}

// Initialize Checkout Page
function initCheckoutPage() {
    // Load cart items in checkout summary
    renderCheckoutItems();
    
    // Payment method toggle
    const paymentMethodOptions = document.querySelectorAll('input[name="paymentMethod"]');
    const cardDetails = document.getElementById('cardDetails');
    
    paymentMethodOptions.forEach(option => {
        option.addEventListener('change', function() {
            if (this.value === 'card' && cardDetails) {
                cardDetails.style.display = 'block';
            } else if (cardDetails) {
                cardDetails.style.display = 'none';
            }
        });
    });
    
    // Place order button
    const placeOrderBtn = document.getElementById('placeOrderBtn');
    if (placeOrderBtn) {
        placeOrderBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            if (cart.length === 0) {
                alert('Your cart is empty. Add some items before placing an order.');
                return;
            }
            
            // Validate form
            if (!validateCheckoutForm()) {
                return;
            }
            
            // Create order
            const order = createOrder();
            
            // Save order to Firebase
            saveOrderToFirebase(order);
        });
    }
}

// Render Checkout Items
function renderCheckoutItems() {
    const checkoutItems = document.getElementById('checkoutItems');
    if (!checkoutItems) return;
    
    if (cart.length === 0) {
        checkoutItems.innerHTML = '<div class="empty-order-message"><p>Your cart is empty</p></div>';
        updateCheckoutSummary();
        return;
    }
    
    let itemsHTML = '';
    
    cart.forEach(item => {
        itemsHTML += `
            <div class="order-item">
                <div class="order-item-info">
                    <h4>${item.name}</h4>
                    <p>Quantity: ${item.quantity}</p>
                </div>
                <div class="order-item-price">$${(item.price * item.quantity).toFixed(2)}</div>
            </div>
        `;
    });
    
    checkoutItems.innerHTML = itemsHTML;
    
    // Update checkout summary
    updateCheckoutSummary();
}

// Update Checkout Summary
function updateCheckoutSummary() {
    // Calculate totals
    let subtotal = 0;
    cart.forEach(item => {
        subtotal += item.price * item.quantity;
    });
    
    const tax = subtotal * 0.08; // 8% tax
    const total = subtotal + shippingCost + tax;
    
    // Update display
    const checkoutSubtotal = document.getElementById('checkoutSubtotal');
    const checkoutShipping = document.getElementById('checkoutShipping');
    const checkoutTax = document.getElementById('checkoutTax');
    const checkoutTotal = document.getElementById('checkoutTotal');
    
    if (checkoutSubtotal) checkoutSubtotal.textContent = `$${subtotal.toFixed(2)}`;
    if (checkoutShipping) checkoutShipping.textContent = `$${shippingCost.toFixed(2)}`;
    if (checkoutTax) checkoutTax.textContent = `$${tax.toFixed(2)}`;
    if (checkoutTotal) checkoutTotal.textContent = `$${total.toFixed(2)}`;
}

// Validate Checkout Form
function validateCheckoutForm() {
    const requiredFields = [
        'checkoutFirstName', 'checkoutLastName', 'checkoutEmail', 'checkoutPhone',
        'checkoutAddress', 'checkoutCity', 'checkoutState', 'checkoutZip', 'checkoutCountry'
    ];
    
    for (const fieldId of requiredFields) {
        const field = document.getElementById(fieldId);
        if (!field || !field.value.trim()) {
            alert(`Please fill in the ${field.labels[0].textContent} field.`);
            field.focus();
            return false;
        }
    }
    
    // Validate email
    const emailField = document.getElementById('checkoutEmail');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailField.value)) {
        alert('Please enter a valid email address.');
        emailField.focus();
        return false;
    }
    
    // Check policy agreement
    const policyAgree = document.getElementById('policyAgree');
    if (!policyAgree || !policyAgree.checked) {
        alert('You must agree to the No Returns / All Sales Final policy to place an order.');
        policyAgree.focus();
        return false;
    }
    
    return true;
}

// Create Order Object
function createOrder() {
    // Get form values
    const customer = {
        name: `${document.getElementById('checkoutFirstName').value} ${document.getElementById('checkoutLastName').value}`,
        email: document.getElementById('checkoutEmail').value,
        phone: document.getElementById('checkoutPhone').value,
        address: {
            street: document.getElementById('checkoutAddress').value,
            city: document.getElementById('checkoutCity').value,
            state: document.getElementById('checkoutState').value,
            zip: document.getElementById('checkoutZip').value,
            country: document.getElementById('checkoutCountry').value
        }
    };
    
    // Calculate totals
    let subtotal = 0;
    cart.forEach(item => {
        subtotal += item.price * item.quantity;
    });
    
    const tax = subtotal * 0.08;
    const total = subtotal + shippingCost + tax;
    
    // Get payment method
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked')?.value || 'card';
    
    // Create order
    const order = {
        customer: customer,
        items: cart.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            imageURL: item.imageURL
        })),
        subtotal: subtotal,
        shipping: shippingCost,
        tax: tax,
        total: total,
        paymentMethod: paymentMethod,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    return order;
}

// Save Order to Firebase
function saveOrderToFirebase(order) {
    const ordersRef = db.ref('orders');
    const newOrderRef = ordersRef.push();
    
    newOrderRef.set(order)
        .then(() => {
            // Order saved successfully
            alert(`Order placed successfully! Your order ID is: ${newOrderRef.key.substring(0, 8)}`);
            
            // Clear cart
            clearCart();
            
            // Redirect to home page
            window.location.href = 'index.html';
        })
        .catch((error) => {
            alert('Error placing order: ' + error.message);
        });
}

// Initialize Contact Page
function initContactPage() {
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form values
            const name = document.getElementById('contactName').value.trim();
            const email = document.getElementById('contactEmail').value.trim();
            const phone = document.getElementById('contactPhone').value.trim();
            const subject = document.getElementById('contactSubject').value;
            const message = document.getElementById('contactMessage').value.trim();
            
            // Validate
            if (!name || !email || !subject || !message) {
                showFormMessage('contactFormMessage', 'Please fill in all required fields.', 'error');
                return;
            }
            
            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                showFormMessage('contactFormMessage', 'Please enter a valid email address.', 'error');
                return;
            }
            
            // Save contact message (in a real app, this would send to a server)
            const contactData = {
                name: name,
                email: email,
                phone: phone || 'Not provided',
                subject: subject,
                message: message,
                timestamp: new Date().toISOString()
            };
            
            // For demo purposes, just show success message
            showFormMessage('contactFormMessage', 'Thank you for your message! We will get back to you soon.', 'success');
            
            // Reset form
            contactForm.reset();
        });
    }
}

// Load Products from Firebase
function loadProducts() {
    const productsRef = db.ref('products');
    
    productsRef.on('value', (snapshot) => {
        const data = snapshot.val();
        products = [];
        
        if (data) {
            // Convert object to array
            Object.keys(data).forEach(key => {
                products.push(data[key]);
            });
            
            // Render products based on current page
            const currentPage = getCurrentPage();
            
            if (currentPage === 'index') {
                // Show featured products (first 4 products)
                const featuredProducts = products.slice(0, 4);
                renderProductsGrid(featuredProducts, 'featuredProductsGrid');
            } else if (currentPage === 'shop') {
                // Show all products in shop
                renderProductsGrid(products, 'shopProductsGrid');
            } else if (currentPage === 'product') {
                // Show related products (products from same category)
                // For demo, just show first 4 products
                const relatedProducts = products.slice(0, 4);
                renderProductsGrid(relatedProducts, 'relatedProductsGrid');
            }
        } else {
            // No products in database
            const currentPage = getCurrentPage();
            
            if (currentPage === 'index') {
                const featuredProductsGrid = document.getElementById('featuredProductsGrid');
                if (featuredProductsGrid) {
                    featuredProductsGrid.innerHTML = `
                        <div class="empty-products-message">
                            <i class="fas fa-box-open"></i>
                            <h3>No Products Available</h3>
                            <p>Products will appear here once added via the Admin Panel</p>
                            <a href="admin.html" class="btn-admin-access">Go to Admin Panel</a>
                        </div>
                    `;
                }
            } else if (currentPage === 'shop') {
                const shopProductsGrid = document.getElementById('shopProductsGrid');
                if (shopProductsGrid) {
                    shopProductsGrid.innerHTML = `
                        <div class="empty-products-message">
                            <i class="fas fa-box-open"></i>
                            <h3>No Products Available</h3>
                            <p>Products will appear here once added via the Admin Panel</p>
                            <a href="admin.html" class="btn-admin-access">Go to Admin Panel</a>
                        </div>
                    `;
                }
            }
        }
    });
}

// Render Products Grid
function renderProductsGrid(products, gridId) {
    const productsGrid = document.getElementById(gridId);
    if (!productsGrid) return;
    
    if (!products || products.length === 0) {
        productsGrid.innerHTML = `
            <div class="empty-products-message">
                <i class="fas fa-box-open"></i>
                <p>No products to display</p>
            </div>
        `;
        return;
    }
    
    let productsHTML = '';
    
    products.forEach(product => {
        const comparePriceHTML = product.comparePrice ? 
            `<span class="product-compare">$${product.comparePrice.toFixed(2)}</span>` : '';
        
        productsHTML += `
            <div class="product-card">
                <div class="product-image">
                    <img src="${product.imageURL}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/400x500/1a1a1a/cccccc?text=Product+Image'">
                </div>
                <div class="product-info">
                    <span class="product-category">${product.category}</span>
                    <h3>${product.name}</h3>
                    <div class="product-price">$${product.price.toFixed(2)} ${comparePriceHTML}</div>
                    <p class="product-description">${product.description.substring(0, 100)}...</p>
                    <a href="product.html" class="btn-view-product">View Details</a>
                </div>
            </div>
        `;
    });
    
    productsGrid.innerHTML = productsHTML;
}

// Load Featured Products (for index page)
function loadFeaturedProducts() {
    // This is handled by loadProducts() now
}

// Load Shipping Cost from Firebase
function loadShippingCost() {
    const shippingRef = db.ref('shipping');
    
    shippingRef.once('value', (snapshot) => {
        const data = snapshot.val();
        
        if (data && data.cost) {
            shippingCost = data.cost;
        } else {
            shippingCost = 9.99; // Default shipping cost
        }
        
        // Update shipping cost display on product page
        updateShippingCostDisplay();
        
        // Update shipping cost in cart and checkout if on those pages
        updateCartSummary();
        updateCheckoutSummary();
    });
}

// Cart Functions
function loadCartFromStorage() {
    const savedCart = localStorage.getItem('soloWearCart');
    if (savedCart) {
        try {
            cart = JSON.parse(savedCart);
            updateCartCount();
        } catch (e) {
            console.error('Error loading cart from storage:', e);
            cart = [];
        }
    }
}

function saveCartToStorage() {
    localStorage.setItem('soloWearCart', JSON.stringify(cart));
    updateCartCount();
    
    // Update cart display if on cart page
    if (getCurrentPage() === 'cart') {
        renderCartItems();
    }
    
    // Update checkout display if on checkout page
    if (getCurrentPage() === 'checkout') {
        renderCheckoutItems();
    }
}

function updateCartCount() {
    const cartCountElements = document.querySelectorAll('.cart-count');
    
    let totalItems = 0;
    cart.forEach(item => {
        totalItems += item.quantity;
    });
    
    cartCountElements.forEach(element => {
        element.textContent = totalItems;
    });
}

function addToCart(product, quantity = 1) {
    // Check if product already in cart
    const existingIndex = cart.findIndex(item => item.id === product.id);
    
    if (existingIndex >= 0) {
        // Update quantity
        cart[existingIndex].quantity += quantity;
    } else {
        // Add new item
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            imageURL: product.imageURL,
            category: product.category,
            quantity: quantity
        });
    }
    
    saveCartToStorage();
    
    // Show notification
    showCartNotification(product.name, quantity);
}

function showCartNotification(productName, quantity) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'cart-notification';
    notification.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <div>
            <p><strong>${productName}</strong> added to cart</p>
            <p>Quantity: ${quantity}</p>
        </div>
    `;
    
    // Style notification
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(0, 0, 0, 0.9);
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        gap: 15px;
        z-index: 10000;
        border-left: 4px solid var(--secondary-gold);
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        animation: slideInRight 0.3s ease, fadeOut 0.3s ease 2.7s;
        max-width: 300px;
    `;
    
    // Add animation styles
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
        }
    `;
    document.head.appendChild(style);
    
    // Add notification to page
    document.body.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 3000);
}

function removeFromCart(index) {
    if (index >= 0 && index < cart.length) {
        cart.splice(index, 1);
        saveCartToStorage();
    }
}

function updateCartItemQuantity(index, quantity) {
    if (index >= 0 && index < cart.length && quantity >= 1 && quantity <= 10) {
        cart[index].quantity = quantity;
        saveCartToStorage();
    }
}

function clearCart() {
    cart = [];
    saveCartToStorage();
}

// Image Error Handling
document.addEventListener('DOMContentLoaded', function() {
    // Set up global image error handler
    document.addEventListener('error', function(e) {
        if (e.target.tagName === 'IMG') {
            e.target.src = 'https://via.placeholder.com/400x500/1a1a1a/cccccc?text=Image+Not+Available';
            e.target.onerror = null; // Prevent infinite loop
        }
    }, true);
});

// Add CSS for cart notification
const cartNotificationStyle = document.createElement('style');
cartNotificationStyle.textContent = `
    .cart-notification i {
        color: var(--secondary-gold);
        font-size: 1.5rem;
    }
    
    .cart-notification div p {
        margin: 0;
        font-size: 0.9rem;
    }
    
    .cart-notification div p:first-child {
        font-weight: 600;
        margin-bottom: 5px;
    }
`;
document.head.appendChild(cartNotificationStyle);

// Initialize the app
window.addEventListener('load', initializeApp);
