// script.js - Main JavaScript file
import { updateCartCount } from './firebase-config.js';

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Update cart count
    updateCartCount();
    
    // Mobile menu toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (navMenu && navMenu.classList.contains('active') && 
            !e.target.closest('.nav-menu') && 
            !e.target.closest('.menu-toggle')) {
            navMenu.classList.remove('active');
        }
    });
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 100,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Add animation on scroll
    const animateOnScroll = () => {
        const elements = document.querySelectorAll('.fade-in, .slide-up');
        
        elements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const elementVisible = 150;
            
            if (elementTop < window.innerHeight - elementVisible) {
                element.classList.add('animated');
            }
        });
    };
    
    // Initial check
    animateOnScroll();
    
    // Listen for scroll
    window.addEventListener('scroll', animateOnScroll);
    
    // Glassmorphism effect for certain elements
    const glassElements = document.querySelectorAll('.glass-effect');
    glassElements.forEach(element => {
        element.style.backdropFilter = 'blur(10px)';
        element.style.webkitBackdropFilter = 'blur(10px)';
    });
});

// Image error handling
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('img').forEach(img => {
        img.addEventListener('error', function() {
            this.src = 'https://via.placeholder.com/300x300?text=Solo+Wear';
        });
    });
});

// Export for module usage
export default {};
