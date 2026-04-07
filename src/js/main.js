// main.js — UI wiring

// ── Theme Toggle ──────────────────────────────────────────────
const themeBtn = document.getElementById('themeToggle');
const savedTheme = localStorage.getItem('te-theme') || 'light';
if (savedTheme === 'dark') applyTheme('dark');

themeBtn.addEventListener('click', () => {
  const next = document.body.dataset.theme === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  localStorage.setItem('te-theme', next);
});

function applyTheme(t) {
  document.body.dataset.theme = t;
  themeBtn.textContent = t === 'dark' ? 'Light mode' : 'Dark mode';
}

// ── Sliders ───────────────────────────────────────────────────
document.getElementById('speedSlider').addEventListener('input', function () {
  cfg.speed = +this.value;
  document.getElementById('speedValue').textContent = (+this.value).toFixed(1) + '×';
});

document.getElementById('sizeSlider').addEventListener('input', function () {
  cfg.size = +this.value;
  document.getElementById('sizeValue').textContent = this.value + ' px';
  particles.forEach(p => p.r = cfg.size);
});

document.getElementById('countInput').addEventListener('change', function () {
  cfg.count = Math.min(60, Math.max(5, +this.value));
  this.value = cfg.count;
  spawnParticles();
});

// ── Toggles ───────────────────────────────────────────────────
document.getElementById('gravityToggle').addEventListener('change', function () {
  cfg.gravity = this.checked;
});
document.getElementById('trailsToggle').addEventListener('change', function () {
  cfg.trails = this.checked;
});
document.getElementById('colorToggle').addEventListener('change', function () {
  cfg.colorBySpeed = this.checked;
});

// ── Sim Controls ──────────────────────────────────────────────
const statusEl = document.getElementById('statusText');

document.getElementById('startBtn').addEventListener('click', () => {
  simRunning = true;
  loop();
  setStatus('Simulation running…');
});

document.getElementById('pauseBtn').addEventListener('click', () => {
  simRunning = !simRunning;
  document.getElementById('pauseBtn').textContent = simRunning ? 'Pause' : 'Resume';
  setStatus(simRunning ? 'Simulation running…' : 'Paused.');
});

document.getElementById('resetBtn').addEventListener('click', () => {
  simRunning = false;
  document.getElementById('pauseBtn').textContent = 'Pause';
  noLoop();
  spawnParticles();
  redraw();
  setStatus('Reset — press Start to begin.');
});

function setStatus(msg, type = '') {
  statusEl.textContent = msg;
  statusEl.className = 'status' + (type ? ' ' + type : '');
}

// ── Presets ───────────────────────────────────────────────────
const presets = {
  calm:    { count: 15, speed: 0.5, size: 14, gravity: false, trails: true  },
  chaos:   { count: 50, speed: 3.0, size: 8,  gravity: false, trails: false },
  gravity: { count: 30, speed: 1.5, size: 10, gravity: true,  trails: true  },
  sparse:  { count: 6,  speed: 1.2, size: 22, gravity: false, trails: true  },
};

document.querySelectorAll('[data-preset]').forEach(btn => {
  btn.addEventListener('click', () => {
    const p = presets[btn.dataset.preset]; if (!p) return;
    Object.assign(cfg, p);
    document.getElementById('countInput').value  = p.count;
    document.getElementById('speedSlider').value = p.speed;
    document.getElementById('speedValue').textContent = p.speed.toFixed(1) + '×';
    document.getElementById('sizeSlider').value  = p.size;
    document.getElementById('sizeValue').textContent  = p.size + ' px';
    document.getElementById('gravityToggle').checked  = p.gravity;
    document.getElementById('trailsToggle').checked   = p.trails;
    spawnParticles();
    if (simRunning) { /* keep running */ } else { redraw(); }
    setStatus('Preset loaded: ' + btn.textContent.trim());
  });
});

// ── Record Trials ─────────────────────────────────────────────
let trialCount = 0;
const tbody = document.getElementById('trialTableBody');

document.getElementById('recordBtn').addEventListener('click', () => {
  const avgSpd = particles.reduce((s, p) => s + p.speed(), 0) / (particles.length || 1);
  trialCount++;
  if (trialCount === 1) tbody.innerHTML = '';

  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td>${trialCount}</td>
    <td>${cfg.count}</td>
    <td>${cfg.speed.toFixed(1)}×</td>
    <td>${cfg.size}</td>
    <td>${cfg.gravity ? 'ON' : 'OFF'}</td>
    <td>${avgSpd.toFixed(2)} u/s</td>
    <td>—</td>
  `;
  tbody.appendChild(tr);
  setStatus('Trial #' + trialCount + ' recorded.', 'ok');
});

document.getElementById('clearBtn').addEventListener('click', () => {
  trialCount = 0;
  tbody.innerHTML = '<tr><td colspan="7">No trials recorded yet.</td></tr>';
  setStatus('Table cleared.');
});

// ── Tabs ──────────────────────────────────────────────────────
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => { b.classList.remove('active'); b.setAttribute('aria-selected','false'); });
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    btn.setAttribute('aria-selected','true');
    document.getElementById(btn.dataset.tab + 'Tab').classList.add('active');
  });
});

// ── Keyboard shortcuts ────────────────────────────────────────
document.addEventListener('keydown', e => {
  if (e.code === 'Space' && e.target === document.body) {
    e.preventDefault();
    document.getElementById('pauseBtn').click();
  }
  if ((e.key === 'r' || e.key === 'R') && e.target === document.body) {
    document.getElementById('resetBtn').click();
  }
});
