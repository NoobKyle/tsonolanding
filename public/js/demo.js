// ========================================
// STATE MANAGEMENT
// ========================================
const state = {
  currentScreen: 'splash',
  panelIndex: 0,
  ride: null,
  activeRide: false,
  signalQueue: [],
  fabOpen: false,
  panelExpanded: false,
  darkMode: true,
  counterValue: 10,
  selectedRider: 0,
  autoplay: true
};

const mockRiders = [
  {
    id: 'r1',
    name: 'Mike Thompson',
    initials: 'MT',
    handle: '@miket_moto',
    distance: '0.4 miles away',
    eta: '~2 min ETA',
    bike: 'Harley Street 750'
  },
  {
    id: 'r2',
    name: 'Sarah Kim',
    initials: 'SK',
    handle: '@sarahk_ride',
    distance: '0.7 miles away',
    eta: '~4 min ETA',
    bike: 'Ducati Monster'
  },
  {
    id: 'r3',
    name: 'Jake Rodriguez',
    initials: 'JR',
    handle: '@jake_moto',
    distance: '1.2 miles away',
    eta: '~8 min ETA',
    bike: 'Honda CB500F'
  }
];

// ========================================
// SCREEN MANAGEMENT
// ========================================
function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(s => {
    s.classList.remove('active');
  });
  document.getElementById(screenId).classList.add('active');
  state.currentScreen = screenId;
  updateDemoLabel(screenId);

  // Reset some states
  if (screenId !== 'dashboard' || !state.activeRide) {
    document.getElementById('signal-fab').classList.remove('visible');
    document.getElementById('ride-panel').style.display = 'none';
    document.getElementById('bottom-panel').style.display = 'block';
  }

  if (screenId === 'dashboard' && state.activeRide) {
    document.getElementById('signal-fab').classList.add('visible');
    document.getElementById('ride-panel').style.display = 'block';
    document.getElementById('bottom-panel').style.display = 'none';
  }
}

function updateDemoLabel(screenId) {
  const labels = {
    'splash': 'Splash',
    'login': 'Login',
    'dashboard': state.activeRide ? 'Active Ride' : 'Dashboard',
    'create-ride': 'Create Ride',
    'ride-created': 'Ride Created',
    'join-ride': 'Join Ride'
  };
  document.getElementById('screen-label').textContent = labels[screenId] || screenId;
}

// ========================================
// INITIALIZATION
// ========================================
function init() {
  // Auto-advance from splash after 2 seconds (if autoplay enabled)
  if (state.autoplay) {
    setTimeout(() => {
      if (state.currentScreen === 'splash') {
        showScreen('login');
      }
    }, 2000);
  }

  // Login button
  document.getElementById('login-btn').addEventListener('click', function() {
    const btn = this;
    const text = btn.querySelector('.btn-text');
    text.innerHTML = '<div class="spinner"></div>';
    btn.disabled = true;
    setTimeout(() => {
      showScreen('dashboard');
      text.textContent = 'Log In';
      btn.disabled = false;
    }, 1000);
  });

  // Demo button
  document.getElementById('demo-btn').addEventListener('click', () => {
    showScreen('dashboard');
  });

  // Menu toggle
  document.getElementById('menu-toggle').addEventListener('click', (e) => {
    e.stopPropagation();
    document.getElementById('menu-dropdown').classList.toggle('visible');
  });

  // Close menu on outside click
  document.addEventListener('click', () => {
    document.getElementById('menu-dropdown').classList.remove('visible');
  });

  // Bottom panel swipe detection
  setupSwipeDetection();
}

// ========================================
// SWIPE NAVIGATION
// ========================================
let touchStartX = 0;
let touchStartY = 0;

function setupSwipeDetection() {
  const panel = document.getElementById('bottom-panel');

  panel.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  panel.addEventListener('touchend', (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const diffX = touchStartX - touchEndX;
    const diffY = touchStartY - touchEndY;

    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
      if (diffX > 0) {
        navigatePanel(1);
      } else {
        navigatePanel(-1);
      }
    }
  }, { passive: true });
}

function navigatePanel(direction) {
  state.panelIndex = Math.max(0, Math.min(2, state.panelIndex + direction));
  updatePanelPosition();
}

function updatePanelPosition() {
  const wrapper = document.getElementById('panels-wrapper');
  if (wrapper) {
    wrapper.style.transform = `translateX(-${state.panelIndex * 33.333}%)`;
  }

  const indicators = document.querySelectorAll('.panel-indicator');
  indicators.forEach((ind, i) => {
    ind.classList.toggle('active', i === state.panelIndex);
  });
}

// ========================================
// RIDER SELECTION
// ========================================
function selectRider(index) {
  state.selectedRider = index;
  const rider = mockRiders[index];

  const avatarEl = document.getElementById('selected-rider-avatar');
  const nameEl = document.getElementById('selected-rider-name');
  const handleEl = document.getElementById('selected-rider-handle');
  const distanceEl = document.getElementById('selected-rider-distance');
  const etaEl = document.getElementById('selected-rider-eta');
  const bikeEl = document.getElementById('selected-rider-bike');

  if (avatarEl) avatarEl.textContent = rider.initials;
  if (nameEl) nameEl.textContent = rider.name;
  if (handleEl) handleEl.textContent = rider.handle;
  if (distanceEl) distanceEl.textContent = rider.distance;
  if (etaEl) etaEl.textContent = rider.eta;
  if (bikeEl) bikeEl.textContent = rider.bike;
}

// ========================================
// CREATE RIDE
// ========================================
function adjustCounter(delta) {
  state.counterValue = Math.max(2, Math.min(50, state.counterValue + delta));
  document.getElementById('counter-value').textContent = state.counterValue;
}

function createRide() {
  const btn = document.getElementById('create-ride-btn');
  const rideName = document.getElementById('ride-name-input').value || 'Sunday Cruise';

  btn.innerHTML = '<div class="spinner"></div>';
  btn.disabled = true;

  setTimeout(() => {
    document.getElementById('created-ride-name').textContent = `"${rideName}"`;
    document.getElementById('created-max-riders').textContent = state.counterValue;
    showScreen('ride-created');
    btn.innerHTML = 'Create Ride';
    btn.disabled = false;
  }, 800);
}

// ========================================
// JOIN RIDE
// ========================================
function updateCharCount() {
  const input = document.getElementById('join-code-input');
  const count = input.value.length;
  document.getElementById('char-count').textContent = count;
  document.getElementById('join-ride-btn').disabled = count < 8;
}

function joinRide() {
  const btn = document.getElementById('join-ride-btn');
  btn.innerHTML = '<div class="spinner"></div>';
  btn.disabled = true;

  setTimeout(() => {
    showToast('Joined ride successfully!');
    state.activeRide = true;
    showScreen('dashboard');
    btn.innerHTML = 'Join Ride';
    btn.disabled = false;
  }, 800);
}

// ========================================
// ACTIVE RIDE
// ========================================
function startActiveRide() {
  state.activeRide = true;
  showScreen('dashboard');
}

function toggleRidePanel() {
  const panel = document.getElementById('ride-panel');
  panel.classList.toggle('expanded');
  state.panelExpanded = panel.classList.contains('expanded');
}

function endRide() {
  state.activeRide = false;
  document.getElementById('ride-panel').classList.remove('expanded');
  showScreen('dashboard');
  showToast('Ride ended');
}

// ========================================
// SIGNAL FAB
// ========================================
function toggleFab() {
  state.fabOpen = !state.fabOpen;
  const main = document.getElementById('fab-main');
  const subs = document.querySelectorAll('.fab-sub');

  main.classList.toggle('open', state.fabOpen);
  subs.forEach((sub, i) => {
    setTimeout(() => {
      sub.classList.toggle('visible', state.fabOpen);
    }, state.fabOpen ? i * 50 : 0);
  });
}

// ========================================
// SIGNALS
// ========================================
const signalConfig = {
  stop: {
    icon: '\u270B',
    label: 'STOP',
    color: 'critical',
    message: '"Everyone stop immediately!"'
  },
  hazard: {
    icon: '\u26A0\uFE0F',
    label: 'HAZARD',
    color: 'warning',
    message: '"Road debris ahead, watch out!"'
  },
  help: {
    icon: '\uD83C\uDD98',
    label: 'HELP',
    color: 'critical',
    message: '"I need assistance!"'
  },
  fuel: {
    icon: '\u26FD',
    label: 'FUEL',
    color: 'info',
    message: '"Need to stop for gas soon."'
  },
  regroup: {
    icon: '\uD83D\uDC65',
    label: 'REGROUP',
    color: 'info',
    message: '"Let\'s regroup at the next stop."'
  },
  pullover: {
    icon: '\uD83C\uDD7F\uFE0F',
    label: 'PULL OVER',
    color: 'info',
    message: '"Pulling over ahead."'
  },
  slow: {
    icon: '\uD83D\uDC22',
    label: 'SLOW DOWN',
    color: 'warning',
    message: '"Slowing down, traffic ahead."'
  },
  speed: {
    icon: '\uD83C\uDFC3',
    label: 'SPEED UP',
    color: 'success',
    message: '"Clear road, picking up pace."'
  },
  ok: {
    icon: '\uD83D\uDC4D',
    label: 'ALL OK',
    color: 'success',
    message: '"Everything is good!"'
  }
};

function sendSignal(type) {
  const config = signalConfig[type];
  showToast(`${config.label} signal sent!`);

  // Close FAB if open
  if (state.fabOpen) {
    toggleFab();
  }

  // Simulate receiving a signal after 1.5 seconds
  setTimeout(() => {
    simulateSignal(type);
  }, 1500);
}

let countdownInterval = null;

function simulateSignal(type) {
  type = type || 'hazard';
  const config = signalConfig[type] || signalConfig.hazard;
  const notification = document.getElementById('signal-notification');
  const header = document.getElementById('signal-notif-header');

  // Update notification content
  document.getElementById('signal-notif-icon').textContent = config.icon;
  document.getElementById('signal-notif-type').textContent = config.label;
  document.getElementById('signal-message').textContent = config.message;

  // Update header color class
  header.className = 'signal-notif-header ' + config.color;

  // Update acknowledge button
  document.querySelector('.signal-notif-actions .btn-primary').textContent = `Got it ${config.icon}`;

  notification.classList.add('visible');

  // Start countdown
  let timeLeft = 10;
  document.getElementById('countdown-time').textContent = timeLeft;
  document.getElementById('countdown-progress').style.strokeDashoffset = 0;

  clearInterval(countdownInterval);
  countdownInterval = setInterval(() => {
    timeLeft--;
    document.getElementById('countdown-time').textContent = timeLeft;
    document.getElementById('countdown-progress').style.strokeDashoffset = 100 - (timeLeft * 10);

    if (timeLeft <= 0) {
      dismissSignal();
    }
  }, 1000);
}

function dismissSignal() {
  clearInterval(countdownInterval);
  document.getElementById('signal-notification').classList.remove('visible');
}

function acknowledgeSignal() {
  showToast('Signal acknowledged!');
  dismissSignal();
}

// ========================================
// UTILITY FUNCTIONS
// ========================================
function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('visible');
  setTimeout(() => {
    toast.classList.remove('visible');
  }, 2000);
}

function copyCode() {
  navigator.clipboard.writeText('ABC123XY').then(() => {
    showToast('Code copied!');
  }).catch(() => {
    showToast('Code copied!');
  });
}

function toggleTheme() {
  state.darkMode = !state.darkMode;
  document.getElementById('app').classList.toggle('light-mode', !state.darkMode);
  showToast(state.darkMode ? 'Dark mode' : 'Light mode');
}

function resetDemo() {
  state.currentScreen = 'splash';
  state.panelIndex = 0;
  state.activeRide = false;
  state.fabOpen = false;
  state.panelExpanded = false;
  state.counterValue = 10;

  document.getElementById('counter-value').textContent = 10;
  document.getElementById('join-code-input').value = '';
  document.getElementById('char-count').textContent = '0';
  document.getElementById('join-ride-btn').disabled = true;
  document.getElementById('ride-panel').classList.remove('expanded');
  document.getElementById('fab-main').classList.remove('open');
  document.querySelectorAll('.fab-sub').forEach(s => s.classList.remove('visible'));

  dismissSignal();
  updatePanelPosition();
  showScreen('splash');

  // Restart splash timer
  setTimeout(() => {
    if (state.currentScreen === 'splash') {
      showScreen('login');
    }
  }, 2000);
}

// Check URL parameters
function checkUrlParams() {
  const params = new URLSearchParams(window.location.search);

  // Standalone mode (for direct viewing)
  if (params.has('standalone')) {
    document.body.classList.add('standalone');
  }

  // Theme parameter
  if (params.get('theme') === 'light') {
    document.getElementById('app').classList.add('light-mode');
    state.darkMode = false;
  }

  // Disable auto-advance from splash
  if (params.get('autoplay') === 'false') {
    state.autoplay = false;
  }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
  checkUrlParams();
  init();
});
