// Intersection Observer for fade-in animations
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

document.querySelectorAll('.fade-in').forEach(el => {
    observer.observe(el);
});

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Mobile menu toggle
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const navLinks = document.querySelector('.nav-links');

mobileMenuBtn?.addEventListener('click', () => {
    navLinks?.classList.toggle('active');
    mobileMenuBtn?.classList.toggle('active');
});

// Close menu when clicking a link
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks?.classList.remove('active');
        mobileMenuBtn?.classList.remove('active');
    });
});

// Lead capture form handling
const leadForm = document.getElementById('lead-form');
const formSuccess = document.getElementById('form-success');
const submitBtn = leadForm?.querySelector('.form-submit');

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

if (leadForm) {
    leadForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Get form data
        const formData = new FormData(leadForm);
        const data = {
            name: formData.get('name'),
            email: formData.get('email'),
            interest: formData.get('interest')
        };

        // Show loading state
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span class="btn-spinner"></span> Submitting...';
        submitBtn.disabled = true;

        try {
            // Get CSRF token
            const csrfToken = await getCsrfToken();
            if (!csrfToken) {
                throw new Error('Failed to get security token');
            }

            const response = await fetch('/api/leads', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': csrfToken
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (result.success) {
                // Hide form and show success message
                leadForm.style.display = 'none';
                formSuccess.classList.add('visible');
            } else {
                alert(result.message || 'Something went wrong. Please try again.');
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            alert('Connection error. Please try again.');
            submitBtn.innerHTML = originalBtnText;
            submitBtn.disabled = false;
        }
    });
}
