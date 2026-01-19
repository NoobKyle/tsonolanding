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

// Connect buttons - set inquiry type and scroll to form
document.querySelectorAll('.btn-connect').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const type = btn.dataset.type;
        if (type) {
            document.getElementById('inquiry-type').value = type;
        }
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

// Investor form handling
const investorForm = document.getElementById('investor-inquiry-form');
const investorSuccess = document.getElementById('investor-success');
const submitBtn = investorForm?.querySelector('.btn-primary');

investorForm?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(investorForm);
    const data = {
        name: formData.get('name'),
        email: formData.get('email'),
        company: formData.get('company'),
        type: formData.get('type'),
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

        const response = await fetch('/api/investors', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': csrfToken
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (result.success) {
            investorForm.style.display = 'none';
            investorSuccess.style.display = 'block';
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
