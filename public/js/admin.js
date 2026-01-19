/**
 * Tsono Admin Dashboard
 * Authentication, data fetching, and rendering
 */

(function() {
    'use strict';

    // ============================================
    // AUTH FUNCTIONS
    // ============================================

    function getAdminKey() {
        return sessionStorage.getItem('adminKey');
    }

    function setAdminKey(key) {
        sessionStorage.setItem('adminKey', key);
    }

    function clearAuth() {
        sessionStorage.removeItem('adminKey');
    }

    async function validateAdminKey(key) {
        try {
            const response = await fetch('/api/all', {
                method: 'GET',
                headers: {
                    'X-Admin-Key': key
                }
            });
            return response.ok;
        } catch (err) {
            console.error('Validation error:', err);
            return false;
        }
    }

    // ============================================
    // API FUNCTIONS
    // ============================================

    async function fetchWithAuth(url) {
        const key = getAdminKey();
        if (!key) {
            showLogin();
            return null;
        }

        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'X-Admin-Key': key
                }
            });

            if (response.status === 401) {
                clearAuth();
                showLogin();
                return null;
            }

            if (!response.ok) {
                throw new Error('Request failed');
            }

            return await response.json();
        } catch (err) {
            console.error('Fetch error:', err);
            return null;
        }
    }

    async function loadDashboardData() {
        const [allData, analyticsData] = await Promise.all([
            fetchWithAuth('/api/all'),
            fetchWithAuth('/api/analytics')
        ]);

        if (allData) {
            renderStats(allData.summary, analyticsData?.summary?.todayViews || 0);
            renderLeadsTable(allData.data.leads);
            renderContactsTable(allData.data.contacts);
            renderInvestorsTable(allData.data.investors);
        }

        if (analyticsData) {
            renderDailyViews(analyticsData.daily);
            renderTopPages(analyticsData.summary.topPages);
            renderReferrers(analyticsData.recentReferrers);
        }
    }

    // ============================================
    // RENDER FUNCTIONS
    // ============================================

    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function formatDate(isoString) {
        if (!isoString) return '-';
        const date = new Date(isoString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    function formatShortDate(isoString) {
        if (!isoString) return '-';
        const date = new Date(isoString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
    }

    function renderStats(summary, todayViews) {
        document.getElementById('stat-leads').textContent = summary.leads || 0;
        document.getElementById('stat-contacts').textContent = summary.contacts || 0;
        document.getElementById('stat-investors').textContent = summary.investors || 0;
        document.getElementById('stat-views').textContent = todayViews || 0;
    }

    function renderLeadsTable(leads) {
        const tbody = document.getElementById('leads-table-body');

        if (!leads || leads.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4"><div class="empty-state">No leads yet</div></td></tr>';
            return;
        }

        // Sort by timestamp descending (newest first)
        const sorted = [...leads].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        tbody.innerHTML = sorted.map(lead => `
            <tr>
                <td>${escapeHtml(lead.name)}</td>
                <td>${escapeHtml(lead.email)}</td>
                <td>${escapeHtml(lead.interest || 'general')}</td>
                <td>${formatDate(lead.timestamp)}</td>
            </tr>
        `).join('');
    }

    function renderContactsTable(contacts) {
        const tbody = document.getElementById('contacts-table-body');

        if (!contacts || contacts.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5"><div class="empty-state">No contact messages yet</div></td></tr>';
            return;
        }

        const sorted = [...contacts].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        tbody.innerHTML = sorted.map(contact => `
            <tr>
                <td>${escapeHtml(contact.name)}</td>
                <td>${escapeHtml(contact.email)}</td>
                <td>${escapeHtml(contact.subject || '-')}</td>
                <td><div class="message-preview" title="${escapeHtml(contact.message)}">${escapeHtml(contact.message)}</div></td>
                <td>${formatDate(contact.timestamp)}</td>
            </tr>
        `).join('');
    }

    function renderInvestorsTable(investors) {
        const tbody = document.getElementById('investors-table-body');

        if (!investors || investors.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5"><div class="empty-state">No investor inquiries yet</div></td></tr>';
            return;
        }

        const sorted = [...investors].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        tbody.innerHTML = sorted.map(investor => `
            <tr>
                <td>${escapeHtml(investor.name)}</td>
                <td>${escapeHtml(investor.email)}</td>
                <td>${escapeHtml(investor.company || '-')}</td>
                <td>${escapeHtml(investor.inquiryType || 'general')}</td>
                <td>${formatDate(investor.timestamp)}</td>
            </tr>
        `).join('');
    }

    function renderDailyViews(daily) {
        const container = document.getElementById('daily-views');

        if (!daily || Object.keys(daily).length === 0) {
            container.innerHTML = '<div class="empty-state">No analytics data yet</div>';
            return;
        }

        // Get last 7 days
        const days = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateKey = date.toISOString().split('T')[0];
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });

            // Sum all page views for this day
            let totalViews = 0;
            if (daily[dateKey]) {
                totalViews = Object.values(daily[dateKey]).reduce((sum, count) => sum + count, 0);
            }

            days.push({ dateKey, dayName, views: totalViews });
        }

        // Find max for scaling
        const maxViews = Math.max(...days.map(d => d.views), 1);

        container.innerHTML = days.map(day => {
            const height = Math.max((day.views / maxViews) * 80, 4);
            return `
                <div class="day-bar">
                    <div class="count">${day.views}</div>
                    <div class="bar" style="height: ${height}px"></div>
                    <div class="label">${day.dayName}</div>
                </div>
            `;
        }).join('');
    }

    function renderTopPages(topPages) {
        const list = document.getElementById('top-pages');

        if (!topPages || topPages.length === 0) {
            list.innerHTML = '<li class="empty-state">No page views yet</li>';
            return;
        }

        list.innerHTML = topPages.slice(0, 5).map(page => `
            <li>
                <span class="page-name" title="${escapeHtml(page.page)}">${escapeHtml(page.page)}</span>
                <span class="page-views">${page.views}</span>
            </li>
        `).join('');
    }

    function renderReferrers(referrers) {
        const list = document.getElementById('recent-referrers');

        if (!referrers || referrers.length === 0) {
            list.innerHTML = '<li class="empty-state">No referrers yet</li>';
            return;
        }

        list.innerHTML = referrers.slice(0, 5).map(ref => `
            <li>
                <span class="referrer-url" title="${escapeHtml(ref.url)}">${escapeHtml(ref.url)}</span>
                <span class="referrer-time">${formatShortDate(ref.timestamp)}</span>
            </li>
        `).join('');
    }

    // ============================================
    // EXPORT FUNCTIONS
    // ============================================

    function exportCSV(type) {
        const key = getAdminKey();
        if (!key) {
            showLogin();
            return;
        }

        // Create a temporary link to download
        const link = document.createElement('a');
        link.href = `/api/export/${type}`;

        // We need to use fetch with auth header, then download the blob
        fetch(`/api/export/${type}`, {
            method: 'GET',
            headers: {
                'X-Admin-Key': key
            }
        })
        .then(response => {
            if (response.status === 401) {
                clearAuth();
                showLogin();
                throw new Error('Unauthorized');
            }
            if (response.status === 404) {
                alert('No data to export');
                throw new Error('No data');
            }
            if (!response.ok) {
                throw new Error('Export failed');
            }
            return response.blob();
        })
        .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${type}-${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        })
        .catch(err => {
            if (err.message !== 'Unauthorized' && err.message !== 'No data') {
                console.error('Export error:', err);
                alert('Export failed. Please try again.');
            }
        });
    }

    // ============================================
    // UI FUNCTIONS
    // ============================================

    function showLogin() {
        document.getElementById('login-overlay').classList.remove('hidden');
        document.getElementById('dashboard').classList.remove('visible');
    }

    function showDashboard() {
        document.getElementById('login-overlay').classList.add('hidden');
        document.getElementById('dashboard').classList.add('visible');
        loadDashboardData();
    }

    function showLoginError(message) {
        const errorEl = document.getElementById('login-error');
        errorEl.textContent = message || 'Invalid admin key. Please try again.';
        errorEl.classList.add('visible');
    }

    function hideLoginError() {
        document.getElementById('login-error').classList.remove('visible');
    }

    // ============================================
    // EVENT HANDLERS
    // ============================================

    function initEventListeners() {
        // Login form
        const loginForm = document.getElementById('login-form');
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            hideLoginError();

            const keyInput = document.getElementById('admin-key');
            const submitBtn = document.getElementById('login-btn');
            const key = keyInput.value.trim();

            if (!key) {
                showLoginError('Please enter an admin key');
                return;
            }

            submitBtn.disabled = true;
            submitBtn.textContent = 'Validating...';

            const isValid = await validateAdminKey(key);

            if (isValid) {
                setAdminKey(key);
                showDashboard();
            } else {
                showLoginError('Invalid admin key. Please try again.');
                keyInput.value = '';
                keyInput.focus();
            }

            submitBtn.disabled = false;
            submitBtn.textContent = 'Access Dashboard';
        });

        // Logout button
        document.getElementById('logout-btn').addEventListener('click', () => {
            clearAuth();
            document.getElementById('admin-key').value = '';
            showLogin();
        });

        // Tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const tabId = btn.dataset.tab;

                // Update active tab button
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // Update active tab content
                document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
                document.getElementById(`tab-${tabId}`).classList.add('active');
            });
        });

        // Export buttons
        document.querySelectorAll('.btn-export').forEach(btn => {
            btn.addEventListener('click', () => {
                const type = btn.dataset.type;
                exportCSV(type);
            });
        });
    }

    // ============================================
    // INITIALIZATION
    // ============================================

    function init() {
        initEventListeners();

        // Check if already authenticated
        const existingKey = getAdminKey();
        if (existingKey) {
            // Validate the existing key
            validateAdminKey(existingKey).then(isValid => {
                if (isValid) {
                    showDashboard();
                } else {
                    clearAuth();
                    showLogin();
                }
            });
        } else {
            showLogin();
        }
    }

    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
