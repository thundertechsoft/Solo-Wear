# Solo Wear - Luxury Fashion E-Commerce

Ultra-premium luxury fashion e-commerce website built with HTML5, CSS3, Vanilla JavaScript (ES6 Modules), and Firebase Realtime Database.

## Features

### 🎨 Design & UI/UX
- "Midnight Gold Luxury" theme
- Deep Charcoal background with Gold accents
- Glassmorphism effects
- Premium animations and transitions
- Fully responsive design
- Mobile-first approach

### 🛒 E-Commerce Features
- Dynamic product loading from Firebase
- Shopping cart with quantity controls
- Secure checkout process
- EasyPaisa payment integration
- WhatsApp integration for customer support
- Admin panel for product management

### 🔥 Firebase Integration
- Real-time database updates
- Product management
- Order processing
- No dummy data - all content is dynamic

## Pages

1. **Home Page** (`index.html`)
   - Hero section
   - Featured products (dynamically loaded)
   - Luxury features showcase

2. **Shop Page** (`shop.html`)
   - Full product catalog
   - Search and sort functionality
   - Grid layout with product cards

3. **Product Detail** (`product.html`)
   - Detailed product view
   - Related products
   - Add to cart functionality

4. **Cart Page** (`cart.html`)
   - Shopping cart management
   - Quantity controls (+, -)
   - Delete items
   - Order summary

5. **Checkout Page** (`checkout.html`)
   - Customer information form
   - EasyPaisa payment instructions
   - Transaction ID validation
   - Order confirmation

6. **Admin Panel** (`admin.html`)
   - PIN protected access
   - Add/Edit/Delete products
   - View all orders
   - Order status management

## Setup Instructions

### 1. Firebase Configuration
The project is already configured with the provided Firebase config. No changes needed.

### 2. Local Development
1. Clone or download the project files
2. Open `index.html` in a modern web browser
3. No build process required - works directly in browser

### 3. Admin Access
- Default PIN: `123456`
- **IMPORTANT**: Change this PIN after first login by modifying the PIN validation in `firebase-config.js`

### 4. Adding Products
1. Go to `/admin.html`
2. Enter PIN: `123456`
3. Navigate to "Add Product" tab
4. Fill in product details and submit

## File Structure
