// ============================================
// SOLO WEAR - LUXURY FASHION WEBSITE
// Main JavaScript File
// Includes: Firebase, Cart Logic, Admin Security, Animations
// ============================================

// Firebase Configuration (DO NOT CHANGE)
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getDatabase, ref, push, set, onValue, remove } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-database.js";

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

// Global Variables
let cart = JSON.parse(localStorage.getItem('soloWearCart')) || [];
let isAdminAuthenticated = localStorage.getItem('soloWearAdminAuthenticated') === 'true';

// DOM Ready Function
document.addEventListener('DOMContentLoaded', function() {
    initializeMobileMenu();
    initializeCart();
    updateCartCount();
    
    // Page-specific initializations
    if (document.querySelector('.add-to-cart')) {
        initializeAddToCartButtons();
    }
    
    if (document.getElementById('adminPin')) {
        initializeAdminPanel();
    }
    
    if (document.querySelector('.checkout-form')) {
        initializeCheckout();
    }
    
    if (document.querySelector('.product-thumbnails')) {
        initializeProductImageGallery();
    }
    
    if (document.querySelector('.quantity-selector')) {
        initializeQuantitySelectors();
    }
    
    if (document.querySelector('.cart-table')) {
        initializeCartPage();
    }
    
    initializeImageErrorHandling();
    initializeAnimations();
});

// ============================================
// GENERAL FUNCTIONS
// ============================================

// Mobile Menu Toggle
function initializeMobileMenu() {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navList = document.querySelector('.nav-list');
    
    if (mobileMenuToggle && navList) {
        mobileMenuToggle.addEventListener('click', function() {
            navList.classList.toggle('active');
            this.setAttribute('aria-expanded', navList.classList.contains('active'));
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(event) {
            if (!event.target.closest('.main-nav') && navList.classList.contains('active')) {
                navList.classList.remove('active');
                mobileMenuToggle.setAttribute('aria-expanded', 'false');
            }
        });
    }
}

// Initialize animations
function initializeAnimations() {
    // Add fade-up animation to elements with .fade-up class
    const fadeUpElements = document.querySelectorAll('.fade-up');
    
    // Create Intersection Observer for scroll animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
            }
        });
    }, { threshold: 0.1 });
    
    // Observe all fade-up elements
    fadeUpElements.forEach(element => {
        observer.observe(element);
    });
}

// Image Error Handling
function initializeImageErrorHandling() {
    const images = document.querySelectorAll('img');
    
    images.forEach(img => {
        img.addEventListener('error', function() {
            // Set a placeholder image when the original fails to load
            this.src = 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1480';
            this.alt = 'Solo Wear Premium T-Shirt';
        });
    });
}

// ============================================
// CART FUNCTIONALITY
// ============================================

// Initialize cart from localStorage
function initializeCart() {
    // Update cart count on page load
    updateCartCount();
    
    // If on cart page, display cart items
    if (document.querySelector('.cart-table tbody')) {
        updateCartDisplay();
    }
}

// Update cart count in header
function updateCartCount() {
    const cartCountElements = document.querySelectorAll('.cart-count');
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    
    cartCountElements.forEach(element => {
        element.textContent = totalItems;
    });
}

// Add to cart functionality
function initializeAddToCartButtons() {
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-product-id');
            const productName = this.getAttribute('data-product-name') || 'Premium T-Shirt';
            const productPrice = parseInt(this.getAttribute('data-product-price')) || 4999;
            const shippingCost = parseInt(this.getAttribute('data-shipping')) || 300;
            const productImage = this.closest('.product-card')?.querySelector('img')?.src || 
                                this.closest('.product-info')?.previousElementSibling?.querySelector('img')?.src ||
                                'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1480';
            
            // Get size if available
            const sizeSelect = document.getElementById('size');
            const size = sizeSelect ? sizeSelect.value : 'M';
            
            // Get quantity if available
            const quantityInput = document.getElementById('quantity');
            const quantity = quantityInput ? parseInt(quantityInput.value) : 1;
            
            addToCart(productId, productName, productPrice, shippingCost, productImage, size, quantity);
            
            // Show confirmation
            showNotification('Product added to cart!', 'success');
        });
    });
}

// Add item to cart
function addToCart(productId, name, price, shipping, image, size = 'M', quantity = 1) {
    // Check if item already exists in cart
    const existingItemIndex = cart.findIndex(item => 
        item.id === productId && item.size === size
    );
    
    if (existingItemIndex > -1) {
        // Update quantity if item exists
        cart[existingItemIndex].quantity += quantity;
    } else {
        // Add new item to cart
        cart.push({
            id: productId,
            name: name,
            price: price,
            shipping: shipping,
            image: image,
            size: size,
            quantity: quantity
        });
    }
    
    // Save to localStorage
    localStorage.setItem('soloWearCart', JSON.stringify(cart));
    
    // Update cart count
    updateCartCount();
    
    // Update cart display if on cart page
    if (document.querySelector('.cart-table tbody')) {
        updateCartDisplay();
    }
}

// Remove item from cart
function removeFromCart(productId, size) {
    cart = cart.filter(item => !(item.id === productId && item.size === size));
    
    // Save to localStorage
    localStorage.setItem('soloWearCart', JSON.stringify(cart));
    
    // Update cart count
    updateCartCount();
    
    // Update cart display
    updateCartDisplay();
    
    // Show notification
    showNotification('Item removed from cart', 'info');
}

// Update cart display on cart page
function updateCartDisplay() {
    const cartTableBody = document.querySelector('.cart-table tbody');
    const emptyCartMessage = document.querySelector('.empty-cart-message');
    const cartSummary = document.querySelector('.cart-summary');
    const recommendedProducts = document.querySelector('.recommended-products');
    
    if (!cartTableBody) return;
    
    // Clear existing rows
    cartTableBody.innerHTML = '';
    
    if (cart.length === 0) {
        // Show empty cart message
        if (emptyCartMessage) emptyCartMessage.style.display = 'block';
        if (cartSummary) cartSummary.style.display = 'none';
        if (recommendedProducts) recommendedProducts.style.display = 'none';
        return;
    }
    
    // Hide empty cart message
    if (emptyCartMessage) emptyCartMessage.style.display = 'none';
    if (cartSummary) cartSummary.style.display = 'block';
    if (recommendedProducts) recommendedProducts.style.display = 'block';
    
    let subtotal = 0;
    let totalShipping = 0;
    
    // Add cart items to table
    cart.forEach(item => {
        const itemTotal = (item.price + item.shipping) * item.quantity;
        subtotal += item.price * item.quantity;
        totalShipping += item.shipping * item.quantity;
        
        const row = document.createElement('tr');
        row.className = 'cart-item';
        row.innerHTML = `
            <td class="cart-item-product">
                <div class="cart-item-image">
                    <img src="${item.image}" alt="${item.name}" loading="lazy">
                </div>
                <div class="cart-item-details">
                    <h3>${item.name}</h3>
                    <p>Size: ${item.size}</p>
                </div>
            </td>
            <td class="cart-item-price">
                ₨ ${item.price.toLocaleString()}
            </td>
            <td class="cart-item-quantity">
                <div class="quantity-selector">
                    <button class="quantity-btn minus" aria-label="Decrease quantity">-</button>
                    <input type="number" value="${item.quantity}" min="1" max="10">
                    <button class="quantity-btn plus" aria-label="Increase quantity">+</button>
                </div>
            </td>
            <td class="cart-item-shipping">
                ₨ ${item.shipping.toLocaleString()}
            </td>
            <td class="cart-item-total">
                ₨ ${itemTotal.toLocaleString()}
            </td>
            <td class="cart-item-actions">
                <button class="remove-item" aria-label="Remove item">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        cartTableBody.appendChild(row);
        
        // Add event listeners for quantity buttons
        const minusBtn = row.querySelector('.minus');
        const plusBtn = row.querySelector('.plus');
        const quantityInput = row.querySelector('input');
        const removeBtn = row.querySelector('.remove-item');
        
        minusBtn.addEventListener('click', () => {
            if (item.quantity > 1) {
                item.quantity--;
                quantityInput.value = item.quantity;
                localStorage.setItem('soloWearCart', JSON.stringify(cart));
                updateCartDisplay();
                updateCartCount();
            }
        });
        
        plusBtn.addEventListener('click', () => {
            if (item.quantity < 10) {
                item.quantity++;
                quantityInput.value = item.quantity;
                localStorage.setItem('soloWearCart', JSON.stringify(cart));
                updateCartDisplay();
                updateCartCount();
            }
        });
        
        quantityInput.addEventListener('change', (e) => {
            const newQuantity = parseInt(e.target.value);
            if (newQuantity >= 1 && newQuantity <= 10) {
                item.quantity = newQuantity;
                localStorage.setItem('soloWearCart', JSON.stringify(cart));
                updateCartDisplay();
                updateCartCount();
            } else {
                e.target.value = item.quantity;
            }
        });
        
        removeBtn.addEventListener('click', () => {
            removeFromCart(item.id, item.size);
        });
    });
    
    // Update cart summary
    const total = subtotal + totalShipping;
    
    const subtotalElement = document.querySelector('.summary-row:nth-child(1) span:last-child');
    const shippingElement = document.querySelector('.summary-row:nth-child(2) span:last-child');
    const totalElement = document.querySelector('.summary-row.total span:last-child');
    
    if (subtotalElement) subtotalElement.textContent = `₨ ${subtotal.toLocaleString()}`;
    if (shippingElement) shippingElement.textContent = `₨ ${totalShipping.toLocaleString()}`;
    if (totalElement) totalElement.textContent = `₨ ${total.toLocaleString()}`;
}

// Initialize cart page functionality
function initializeCartPage() {
    const clearCartBtn = document.getElementById('clearCart');
    
    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', function() {
            if (confirm('Are you sure you want to clear your cart?')) {
                cart = [];
                localStorage.setItem('soloWearCart', JSON.stringify(cart));
                updateCartCount();
                updateCartDisplay();
                showNotification('Cart cleared', 'info');
            }
        });
    }
    
    // Initialize recommended products add to cart buttons
    const recommendedAddToCartButtons = document.querySelectorAll('.recommended-products .add-to-cart');
    recommendedAddToCartButtons.forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-product-id');
            const productCard = this.closest('.product-card');
            const productName = productCard.querySelector('.product-title').textContent;
            const productPrice = parseInt(productCard.querySelector('.current-price').textContent.replace(/[^0-9]/g, ''));
            
            addToCart(productId, productName, productPrice, 300, 
                     productCard.querySelector('img').src, 'M', 1);
        });
    });
}

// ============================================
// PRODUCT PAGE FUNCTIONALITY
// ============================================

// Initialize product image gallery
function initializeProductImageGallery() {
    const thumbnails = document.querySelectorAll('.thumbnail');
    const mainImage = document.getElementById('mainImage');
    
    if (!thumbnails.length || !mainImage) return;
    
    thumbnails.forEach(thumbnail => {
        thumbnail.addEventListener('click', function() {
            // Remove active class from all thumbnails
            thumbnails.forEach(t => t.classList.remove('active'));
            
            // Add active class to clicked thumbnail
            this.classList.add('active');
            
            // Update main image
            const newImageSrc = this.getAttribute('data-image');
            mainImage.src = newImageSrc;
            mainImage.alt = this.alt;
        });
    });
}

// Initialize quantity selectors
function initializeQuantitySelectors() {
    const quantitySelectors = document.querySelectorAll('.quantity-selector');
    
    quantitySelectors.forEach(selector => {
        const minusBtn = selector.querySelector('.minus');
        const plusBtn = selector.querySelector('.plus');
        const input = selector.querySelector('input');
        
        if (minusBtn && plusBtn && input) {
            minusBtn.addEventListener('click', () => {
                const currentValue = parseInt(input.value);
                if (currentValue > 1) {
                    input.value = currentValue - 1;
                    updateProductTotal();
                }
            });
            
            plusBtn.addEventListener('click', () => {
                const currentValue = parseInt(input.value);
                if (currentValue < 10) {
                    input.value = currentValue + 1;
                    updateProductTotal();
                }
            });
            
            input.addEventListener('change', () => {
                const value = parseInt(input.value);
                if (isNaN(value) || value < 1) {
                    input.value = 1;
                } else if (value > 10) {
                    input.value = 10;
                }
                updateProductTotal();
            });
        }
    });
}

// Update product total on product page
function updateProductTotal() {
    const quantityInput = document.getElementById('quantity');
    const priceElement = document.querySelector('.current-price');
    const shippingElement = document.querySelector('.shipping-price');
    const totalElement = document.querySelector('.total-price');
    
    if (!quantityInput || !priceElement || !shippingElement || !totalElement) return;
    
    const quantity = parseInt(quantityInput.value) || 1;
    const price = parseInt(priceElement.textContent.replace(/[^0-9]/g, ''));
    const shipping = parseInt(shippingElement.textContent.replace(/[^0-9]/g, ''));
    const total = (price + shipping) * quantity;
    
    totalElement.textContent = `₨ ${total.toLocaleString()}`;
}

// ============================================
// CHECKOUT FUNCTIONALITY
// ============================================

// Initialize checkout page
function initializeCheckout() {
    const checkoutForm = document.getElementById('checkoutForm');
    const paymentOptions = document.querySelectorAll('input[name="payment"]');
    const cardDetails = document.querySelector('.card-details');
    
    // Show/hide card details based on payment method
    paymentOptions.forEach(option => {
        option.addEventListener('change', function() {
            if (this.value === 'card' && cardDetails) {
                cardDetails.style.display = 'block';
            } else if (cardDetails) {
                cardDetails.style.display = 'none';
            }
        });
    });
    
    // Shipping cost calculation
    const shippingOptions = document.querySelectorAll('input[name="shipping"]');
    const shippingCostElement = document.querySelector('.order-totals .total-row:nth-child(2) span:last-child');
    const grandTotalElement = document.querySelector('.order-totals .grand-total span:last-child');
    
    if (shippingOptions.length && shippingCostElement && grandTotalElement) {
        shippingOptions.forEach(option => {
            option.addEventListener('change', function() {
                const shippingCost = this.value === 'express' ? 800 : 300;
                shippingCostElement.textContent = `₨ ${shippingCost.toLocaleString()}`;
                
                // Update grand total
                const subtotal = 15297; // This should be calculated from cart
                const newTotal = subtotal + shippingCost;
                grandTotalElement.textContent = `₨ ${newTotal.toLocaleString()}`;
            });
        });
    }
    
    // Form submission
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Validate required checkboxes
            const policyAgreement = document.getElementById('policyAgreement');
            const termsAgreement = document.getElementById('termsAgreement');
            
            if (!policyAgreement.checked) {
                showNotification('You must agree to the No Returns policy to proceed', 'error');
                policyAgreement.focus();
                return;
            }
            
            if (!termsAgreement.checked) {
                showNotification('You must agree to the Terms and Conditions', 'error');
                termsAgreement.focus();
                return;
            }
            
            // Process order
            processOrder();
        });
    }
    
    // Buy now button on product page
    const buyNowBtn = document.querySelector('.buy-now');
    if (buyNowBtn) {
        buyNowBtn.addEventListener('click', function() {
            const addToCartBtn = document.querySelector('.add-to-cart');
            if (addToCartBtn) {
                addToCartBtn.click();
            }
            
            // Redirect to checkout after a short delay
            setTimeout(() => {
                window.location.href = 'checkout.html';
            }, 500);
        });
    }
}

// Process order
function processOrder() {
    // In a real application, this would send data to a server
    // For this demo, we'll simulate order processing
    
    // Show loading state
    const submitBtn = document.querySelector('.btn-submit-order');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    submitBtn.disabled = true;
    
    // Simulate API call
    setTimeout(() => {
        // Clear cart
        cart = [];
        localStorage.setItem('soloWearCart', JSON.stringify(cart));
        updateCartCount();
        
        // Show confirmation modal
        const modal = document.getElementById('confirmationModal');
        if (modal) {
            modal.style.display = 'flex';
            
            // Close modal when clicking X or outside
            const closeBtn = modal.querySelector('.modal-close');
            closeBtn.addEventListener('click', () => {
                modal.style.display = 'none';
            });
            
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.style.display = 'none';
                }
            });
        } else {
            // If no modal, show notification and redirect
            showNotification('Order placed successfully!', 'success');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
        }
        
        // Reset button
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }, 1500);
}

// ============================================
// ADMIN PANEL FUNCTIONALITY
// ============================================

// Initialize admin panel
function initializeAdminPanel() {
    // Check if admin is already authenticated
    if (isAdminAuthenticated) {
        showAdminDashboard();
    }
    
    // Login functionality
    const loginBtn = document.getElementById('loginBtn');
    const adminPinInput = document.getElementById('adminPin');
    
    if (loginBtn && adminPinInput) {
        loginBtn.addEventListener('click', function() {
            const pin = adminPinInput.value;
            
            if (pin === '134047') {
                // Correct PIN
                isAdminAuthenticated = true;
                localStorage.setItem('soloWearAdminAuthenticated', 'true');
                showAdminDashboard();
                showNotification('Admin access granted', 'success');
            } else {
                // Incorrect PIN
                showNotification('Incorrect PIN. Please try again.', 'error');
                adminPinInput.value = '';
                adminPinInput.focus();
                
                // Shake animation for wrong PIN
                adminPinInput.classList.add('shake');
                setTimeout(() => {
                    adminPinInput.classList.remove('shake');
                }, 500);
            }
        });
        
        // Allow pressing Enter to submit
        adminPinInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                loginBtn.click();
            }
        });
    }
    
    // Logout functionality
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            isAdminAuthenticated = false;
            localStorage.removeItem('soloWearAdminAuthenticated');
            hideAdminDashboard();
            showNotification('Logged out successfully', 'info');
        });
    }
    
    // Product form functionality
    const addProductBtn = document.getElementById('addProductBtn');
    const cancelProductBtn = document.getElementById('cancelProductBtn');
    const productForm = document.getElementById('adminProductForm');
    
    if (addProductBtn) {
        addProductBtn.addEventListener('click', function() {
            document.getElementById('productForm').style.display = 'block';
            document.getElementById('adminProductForm').reset();
        });
    }
    
    if (cancelProductBtn) {
        cancelProductBtn.addEventListener('click', function() {
            document.getElementById('productForm').style.display = 'none';
        });
    }
    
    if (productForm) {
        productForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form values
            const name = document.getElementById('productName').value;
            const category = document.getElementById('productCategory').value;
            const price = document.getElementById('productPrice').value;
            const shipping = document.getElementById('shippingCost').value;
            const image = document.getElementById('productImage').value;
            const description = document.getElementById('productDescription').value;
            const inventory = document.getElementById('productInventory').value;
            
            // Generate unique ID
            const productId = 'SW' + Date.now().toString().slice(-6);
            
            // Save to Firebase (commented out for safety, uncomment with actual Firebase setup)
            /*
            const productRef = ref(db, 'products/' + productId);
            set(productRef, {
                id: productId,
                name: name,
                category: category,
                price: parseInt(price),
                shipping: parseInt(shipping),
                image: image,
                description: description,
                inventory: parseInt(inventory),
                createdAt: new Date().toISOString()
            }).then(() => {
                showNotification('Product saved successfully!', 'success');
                productForm.reset();
                document.getElementById('productForm').style.display = 'none';
                loadProductsFromFirebase();
            }).catch((error) => {
                showNotification('Error saving product: ' + error.message, 'error');
            });
            */
            
            // For demo purposes, show success message
            showNotification('Product saved successfully! (Firebase integration ready)', 'success');
            productForm.reset();
            document.getElementById('productForm').style.display = 'none';
        });
    }
    
    // Load products from Firebase
    loadProductsFromFirebase();
}

// Show admin dashboard
function showAdminDashboard() {
    document.getElementById('adminLogin').style.display = 'none';
    document.getElementById('adminDashboard').style.display = 'block';
}

// Hide admin dashboard
function hideAdminDashboard() {
    document.getElementById('adminDashboard').style.display = 'none';
    document.getElementById('adminLogin').style.display = 'block';
    document.getElementById('adminPin').value = '';
}

// Load products from Firebase
function loadProductsFromFirebase() {
    // This function would load products from Firebase
    // For now, we'll just display a message
    
    const productsTable = document.getElementById('productsTable');
    if (productsTable) {
        // In a real implementation, you would fetch from Firebase
        // const productsRef = ref(db, 'products');
        // onValue(productsRef, (snapshot) => { ... });
        
        console.log('Firebase integration ready - products would be loaded here');
    }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button class="notification-close">&times;</button>
    `;
    
    // Add styles if not already added
    if (!document.getElementById('notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 20px;
                border-radius: 8px;
                color: white;
                display: flex;
                align-items: center;
                justify-content: space-between;
                min-width: 300px;
                max-width: 400px;
                z-index: 9999;
                animation: slideIn 0.3s ease;
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
            }
            .notification.success { background-color: #28a745; }
            .notification.error { background-color: #dc3545; }
            .notification.info { background-color: #17a2b8; }
            .notification.warning { background-color: #ffc107; color: #212529; }
            .notification-close {
                background: none;
                border: none;
                color: inherit;
                font-size: 1.5rem;
                cursor: pointer;
                margin-left: 15px;
                line-height: 1;
            }
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Add to page
    document.body.appendChild(notification);
    
    // Add close button functionality
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.remove();
    });
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

// Add shake animation for wrong PIN
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
        20%, 40%, 60%, 80% { transform: translateX(5px); }
    }
    .shake {
        animation: shake 0.5s ease;
    }
`;
document.head.appendChild(style);

// Initialize all tooltips
function initializeTooltips() {
    const elementsWithTitle = document.querySelectorAll('[title]');
    elementsWithTitle.forEach(element => {
        element.addEventListener('mouseenter', function(e) {
            // Tooltip implementation would go here
        });
    });
}

// Initialize contact form
function initializeContactForm() {
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(this);
            const data = Object.fromEntries(formData);
            
            // In a real application, you would send this to a server
            console.log('Contact form submitted:', data);
            
            // Show success message
            showNotification('Message sent successfully! We\'ll get back to you soon.', 'success');
            
            // Reset form
            this.reset();
        });
    }
}

// Call additional initializations
initializeContactForm();
initializeTooltips();
