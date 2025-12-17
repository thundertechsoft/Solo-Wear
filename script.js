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
    const hasHalfStar = rating % 1 >= 0.
