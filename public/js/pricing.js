// Intersection Observer for fade-in animations
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

// Mobile menu toggle
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const navLinks = document.querySelector('.nav-links');

mobileMenuBtn?.addEventListener('click', () => {
    navLinks?.classList.toggle('active');
    mobileMenuBtn?.classList.toggle('active');
});

document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks?.classList.remove('active');
        mobileMenuBtn?.classList.remove('active');
    });
});

// Billing toggle
const billingToggle = document.getElementById('billing-toggle');
const monthlyLabel = document.getElementById('monthly-label');
const annualLabel = document.getElementById('annual-label');
const planPrices = document.querySelectorAll('.plan-price');

billingToggle?.addEventListener('click', () => {
    billingToggle.classList.toggle('annual');
    monthlyLabel.classList.toggle('active');
    annualLabel.classList.toggle('active');
    planPrices.forEach(price => price.classList.toggle('show-annual'));
});
