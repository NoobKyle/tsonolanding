// Intersection Observer for fade-in animations
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('visible'); });
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

// Fetch CSRF token function
async function getCsrfToken() {
    try {
        const response = await fetch('/api/csrf-token');
        const data = await response.json();
        return data.csrfToken;
    } catch (error) {
        console.error('Failed to fetch CSRF token:', error);
        return null;
    }
}

// Contact form handling
const contactForm = document.getElementById('contact-form');
const contactSuccess = document.getElementById('contact-success');
const submitBtn = contactForm?.querySelector('.btn-primary');

contactForm?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(contactForm);
    const data = {
        name: formData.get('name'),
        email: formData.get('email'),
        subject: formData.get('subject'),
        message: formData.get('message')
    };

    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;

    try {
        // Get CSRF token
        const csrfToken = await getCsrfToken();
        if (!csrfToken) {
            throw new Error('Failed to get security token');
        }

        const response = await fetch('/api/contact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': csrfToken
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (result.success) {
            contactForm.style.display = 'none';
            contactSuccess.style.display = 'block';
        } else {
            alert(result.message || 'Something went wrong. Please try again.');
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Connection error. Please try again.');
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
});
