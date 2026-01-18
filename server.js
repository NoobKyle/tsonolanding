const express = require('express');
const fs = require('fs');
const path = require('path');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const csrf = require('csurf');
const lockfile = require('proper-lockfile');
const logger = require('./lib/logger');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

// Trust proxy for secure cookies and correct IP detection behind reverse proxies
if (IS_PRODUCTION) {
  app.set('trust proxy', 1);
}

// HTTPS redirect in production
app.use((req, res, next) => {
  if (IS_PRODUCTION && req.headers['x-forwarded-proto'] !== 'https') {
    return res.redirect(301, `https://${req.hostname}${req.url}`);
  }
  next();
});

// Data files
const DATA_FILES = {
  leads: path.join(DATA_DIR, 'leads.json'),
  contacts: path.join(DATA_DIR, 'contacts.json'),
  investors: path.join(DATA_DIR, 'investors.json'),
  analytics: path.join(DATA_DIR, 'analytics.json')
};

// ============================================
// SECURITY MIDDLEWARE
// ============================================

// Compression
app.use(compression());

// Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// Rate limiting - general
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // 200 requests per 15 min
  message: { success: false, message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting - strict for form submissions
const formLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 form submissions per 15 min
  message: { success: false, message: 'Too many submissions, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(generalLimiter);

// Body parsers
app.use(express.json({ limit: '10kb' })); // Limit body size
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Cookie parser (required for CSRF)
app.use(cookieParser());

// CSRF Protection
const csrfProtection = csrf({ cookie: true });

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initialize data files if they don't exist
Object.values(DATA_FILES).forEach(file => {
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, '[]', 'utf8');
  }
});

// Helper to read data
function readData(file) {
  try {
    const data = fs.readFileSync(file, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}

// Helper to write data with file locking
async function writeData(file, data) {
  let release;
  try {
    release = await lockfile.lock(file, { retries: { retries: 3, minTimeout: 100, maxTimeout: 1000 } });
    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
  } finally {
    if (release) {
      await release();
    }
  }
}

// Validate email format
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Sanitize input - strip HTML tags and limit length
function sanitize(str, maxLength = 1000) {
  if (!str) return '';
  return String(str)
    .replace(/<[^>]*>/g, '') // Strip HTML tags
    .replace(/[<>"'&]/g, (char) => { // Escape special chars
      const entities = { '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#x27;', '&': '&amp;' };
      return entities[char];
    })
    .trim()
    .slice(0, maxLength);
}

// Anonymize email for logging (keeps domain, hashes local part)
function anonymizeEmail(email) {
  if (!email) return 'unknown';
  const parts = email.split('@');
  if (parts.length !== 2) return 'invalid';
  const localPart = parts[0];
  const domain = parts[1];
  // Show first char + masked middle + last char
  const masked = localPart.length > 2
    ? localPart[0] + '***' + localPart[localPart.length - 1]
    : '***';
  return `${masked}@${domain}`;
}

// ============================================
// ANALYTICS
// ============================================

// Get today's date key (YYYY-MM-DD)
function getDateKey() {
  return new Date().toISOString().split('T')[0];
}

// Track a page view
async function trackPageView(page, referer, userAgent) {
  try {
    const analytics = readData(DATA_FILES.analytics);
    const dateKey = getDateKey();

    // Initialize structure if needed
    if (!analytics.pageViews) analytics.pageViews = {};
    if (!analytics.pageViews[dateKey]) analytics.pageViews[dateKey] = {};
    if (!analytics.pageViews[dateKey][page]) analytics.pageViews[dateKey][page] = 0;

    analytics.pageViews[dateKey][page]++;

    // Track referrers (last 100) - sanitize to prevent stored XSS
    if (!analytics.referrers) analytics.referrers = [];
    if (referer && !referer.includes('tsono.app')) {
      // Sanitize referrer URL - only allow valid URL characters
      const sanitizedReferer = sanitize(referer, 500);
      analytics.referrers.unshift({
        url: sanitizedReferer,
        page: sanitize(page, 200),
        timestamp: new Date().toISOString()
      });
      analytics.referrers = analytics.referrers.slice(0, 100);
    }

    await writeData(DATA_FILES.analytics, analytics);
  } catch (err) {
    logger.error({ err, page }, 'Failed to track page view');
  }
}

// Analytics middleware - track page views for HTML files
app.use((req, res, next) => {
  // Only track GET requests for HTML pages (not API calls or assets)
  if (req.method === 'GET' && !req.path.startsWith('/api/') && !req.path.startsWith('/data/')) {
    const page = req.path === '/' ? '/index.html' : req.path;
    // Only track .html files or paths without extensions (likely pages)
    if (page.endsWith('.html') || !path.extname(page)) {
      trackPageView(page, req.get('referer'), req.get('user-agent'));
    }
  }
  next();
});

// Serve static files from root directory (after analytics middleware)
app.use(express.static(__dirname));

// ============================================
// HEALTH CHECK
// ============================================
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// ============================================
// CSRF TOKEN ENDPOINT
// ============================================
app.get('/api/csrf-token', csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// ============================================
// API ENDPOINTS
// ============================================

// --- Lead Submissions (from index.html) ---
app.post('/api/leads', formLimiter, csrfProtection, async (req, res) => {
  const { name, email, interest } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ success: false, message: 'Name is required' });
  }
  if (!email || !isValidEmail(email)) {
    return res.status(400).json({ success: false, message: 'Valid email is required' });
  }

  const lead = {
    id: Date.now(),
    type: 'lead',
    name: sanitize(name, 100),
    email: sanitize(email, 254).toLowerCase(),
    interest: sanitize(interest, 50) || 'general',
    timestamp: new Date().toISOString(),
  };

  try {
    const leads = readData(DATA_FILES.leads);
    leads.push(lead);
    await writeData(DATA_FILES.leads, leads);
    logger.info({ leadId: lead.id, email: anonymizeEmail(lead.email) }, 'New lead signup');
    res.json({ success: true, message: "Thanks for signing up! We'll be in touch soon." });
  } catch (err) {
    logger.error({ err }, 'Error saving lead');
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
});

// --- Contact Form Submissions ---
app.post('/api/contact', formLimiter, csrfProtection, async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ success: false, message: 'Name is required' });
  }
  if (!email || !isValidEmail(email)) {
    return res.status(400).json({ success: false, message: 'Valid email is required' });
  }
  if (!message || !message.trim()) {
    return res.status(400).json({ success: false, message: 'Message is required' });
  }

  const contact = {
    id: Date.now(),
    type: 'contact',
    name: sanitize(name, 100),
    email: sanitize(email, 254).toLowerCase(),
    subject: sanitize(subject, 100) || 'General Inquiry',
    message: sanitize(message, 5000),
    status: 'new',
    timestamp: new Date().toISOString(),
  };

  try {
    const contacts = readData(DATA_FILES.contacts);
    contacts.push(contact);
    await writeData(DATA_FILES.contacts, contacts);
    logger.info({ contactId: contact.id, subject: contact.subject }, 'New contact message');
    res.json({ success: true, message: "Thanks for reaching out! We'll get back to you soon." });
  } catch (err) {
    logger.error({ err }, 'Error saving contact');
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
});

// --- Investor Inquiries ---
app.post('/api/investors', formLimiter, csrfProtection, async (req, res) => {
  const { name, email, company, type, message } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ success: false, message: 'Name is required' });
  }
  if (!email || !isValidEmail(email)) {
    return res.status(400).json({ success: false, message: 'Valid email is required' });
  }

  const investor = {
    id: Date.now(),
    type: 'investor',
    name: sanitize(name, 100),
    email: sanitize(email, 254).toLowerCase(),
    company: sanitize(company, 100),
    inquiryType: sanitize(type, 50) || 'general',
    message: sanitize(message, 5000),
    status: 'new',
    timestamp: new Date().toISOString(),
  };

  try {
    const investors = readData(DATA_FILES.investors);
    investors.push(investor);
    await writeData(DATA_FILES.investors, investors);
    logger.info({ investorId: investor.id, inquiryType: investor.inquiryType }, 'New investor inquiry');
    res.json({ success: true, message: "Thanks for your interest! We'll be in touch shortly." });
  } catch (err) {
    logger.error({ err }, 'Error saving investor inquiry');
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
});

// ============================================
// ADMIN API (Protected)
// ============================================

// Middleware for admin routes
function adminAuth(req, res, next) {
  const authHeader = req.headers['x-admin-key'];
  const adminKey = process.env.ADMIN_KEY;

  // In production, ADMIN_KEY is required
  if (IS_PRODUCTION && !adminKey) {
    logger.error('ADMIN_KEY not set in production!');
    return res.status(500).json({ success: false, message: 'Server configuration error' });
  }

  // In development without ADMIN_KEY, allow access with warning
  if (!adminKey) {
    logger.warn('ADMIN_KEY not set - admin endpoints unprotected (dev mode)');
    return next();
  }

  if (authHeader !== adminKey) {
    logger.warn({ ip: req.ip }, 'Unauthorized admin access attempt');
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  // Log successful admin access
  logger.info({ method: req.method, path: req.path, ip: req.ip }, 'Admin access granted');
  next();
}

// Get all leads
app.get('/api/leads', adminAuth, (req, res) => {
  const leads = readData(DATA_FILES.leads);
  res.json({ success: true, count: leads.length, data: leads });
});

// Get all contacts
app.get('/api/contacts', adminAuth, (req, res) => {
  const contacts = readData(DATA_FILES.contacts);
  res.json({ success: true, count: contacts.length, data: contacts });
});

// Get all investor inquiries
app.get('/api/investors', adminAuth, (req, res) => {
  const investors = readData(DATA_FILES.investors);
  res.json({ success: true, count: investors.length, data: investors });
});

// Get all submissions combined
app.get('/api/all', adminAuth, (req, res) => {
  const leads = readData(DATA_FILES.leads);
  const contacts = readData(DATA_FILES.contacts);
  const investors = readData(DATA_FILES.investors);

  res.json({
    success: true,
    summary: {
      leads: leads.length,
      contacts: contacts.length,
      investors: investors.length,
      total: leads.length + contacts.length + investors.length
    },
    data: {
      leads,
      contacts,
      investors
    }
  });
});

// Export all data as CSV
app.get('/api/export/:type', adminAuth, (req, res) => {
  const { type } = req.params;

  let data;
  let filename;

  switch (type) {
    case 'leads':
      data = readData(DATA_FILES.leads);
      filename = 'leads.csv';
      break;
    case 'contacts':
      data = readData(DATA_FILES.contacts);
      filename = 'contacts.csv';
      break;
    case 'investors':
      data = readData(DATA_FILES.investors);
      filename = 'investors.csv';
      break;
    default:
      return res.status(400).json({ success: false, message: 'Invalid type. Use: leads, contacts, or investors' });
  }

  if (data.length === 0) {
    return res.status(404).json({ success: false, message: 'No data found' });
  }

  // Convert to CSV
  const headers = Object.keys(data[0]);
  const csv = [
    headers.join(','),
    ...data.map(row => headers.map(h => `"${String(row[h] || '').replace(/"/g, '""')}"`).join(','))
  ].join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(csv);
});

// Get analytics data
app.get('/api/analytics', adminAuth, (req, res) => {
  const analytics = readData(DATA_FILES.analytics);
  const dateKey = getDateKey();

  // Calculate totals
  let totalViews = 0;
  let todayViews = 0;
  const pageTotals = {};

  if (analytics.pageViews) {
    Object.entries(analytics.pageViews).forEach(([date, pages]) => {
      Object.entries(pages).forEach(([page, count]) => {
        totalViews += count;
        if (date === dateKey) todayViews += count;
        pageTotals[page] = (pageTotals[page] || 0) + count;
      });
    });
  }

  res.json({
    success: true,
    summary: {
      totalViews,
      todayViews,
      topPages: Object.entries(pageTotals)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([page, views]) => ({ page, views }))
    },
    daily: analytics.pageViews || {},
    recentReferrers: (analytics.referrers || []).slice(0, 20)
  });
});

// Track custom event (client-side tracking)
app.post('/api/analytics/event', async (req, res) => {
  const { event, data } = req.body;

  if (!event) {
    return res.status(400).json({ success: false, message: 'Event name required' });
  }

  try {
    const analytics = readData(DATA_FILES.analytics);
    const dateKey = getDateKey();

    if (!analytics.events) analytics.events = {};
    if (!analytics.events[dateKey]) analytics.events[dateKey] = [];

    analytics.events[dateKey].push({
      event,
      data: data || {},
      timestamp: new Date().toISOString()
    });

    // Keep only last 7 days of events
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 7);
    const cutoffKey = cutoff.toISOString().split('T')[0];
    Object.keys(analytics.events).forEach(key => {
      if (key < cutoffKey) delete analytics.events[key];
    });

    await writeData(DATA_FILES.analytics, analytics);
    res.json({ success: true });
  } catch (err) {
    logger.error({ err, event }, 'Error tracking analytics event');
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ============================================
// 404 Handler
// ============================================
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, '404.html'));
});

// ============================================
// CSRF Error Handler
// ============================================
app.use((err, req, res, next) => {
  if (err.code === 'EBADCSRFTOKEN') {
    logger.warn({ ip: req.ip, path: req.path }, 'Invalid CSRF token');
    return res.status(403).json({ success: false, message: 'Invalid security token. Please refresh the page and try again.' });
  }
  next(err);
});

// ============================================
// Error Handler
// ============================================
app.use((err, req, res, next) => {
  logger.error({ err, path: req.path }, 'Unhandled error');
  res.status(500).sendFile(path.join(__dirname, '500.html'));
});

// ============================================
// Start Server
// ============================================
app.listen(PORT, () => {
  logger.info({
    port: PORT,
    mode: IS_PRODUCTION ? 'production' : 'development',
    security: ['helmet', 'rate-limiting', 'compression', 'csrf']
  }, 'Tsono server started');

  if (!IS_PRODUCTION) {
    console.log(`
╔═══════════════════════════════════════════════╗
║         TSONO SERVER RUNNING                  ║
╠═══════════════════════════════════════════════╣
║  Local:    http://localhost:${PORT}              ║
║  Mode:     DEVELOPMENT                        ║
║                                               ║
║  Security: Helmet, Rate Limiting, CSRF, Pino  ║
║                                               ║
║  API Endpoints:                               ║
║    GET  /health           - Health check      ║
║    GET  /api/csrf-token   - Get CSRF token    ║
║    POST /api/leads        - Lead signups      ║
║    POST /api/contact      - Contact form      ║
║    POST /api/investors    - Investor inquiries║
║    POST /api/analytics/event - Track events   ║
║                                               ║
║  Admin Endpoints (requires ADMIN_KEY):        ║
║    GET /api/leads      - View leads           ║
║    GET /api/contacts   - View contacts        ║
║    GET /api/investors  - View investors       ║
║    GET /api/all        - View all data        ║
║    GET /api/analytics  - View analytics       ║
║    GET /api/export/:type - Export as CSV      ║
╚═══════════════════════════════════════════════╝
    `);
  }
});
