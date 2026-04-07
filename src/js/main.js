// main.js — UI wiring

// ── Sliders ──────────────────────────────────────────────────────────────────
const countSlider = document.getElementById('countSlider');
const speedSlider = document.getElementById('speedSlider');
const sizeSlider  = document.getElementById('sizeSlider');
const forceSlider = document.getElementById('forceSlider');

countSlider.addEventListener('input', () => {
    config.count = +countSlider.value;
    document.getElementById('countValue').textContent = config.count;
    spawnParticles();
});

speedSlider.addEventListener('input', () => {
    config.speed = +speedSlider.value;
    document.getElementById('speedValue').textContent = config.speed.toFixed(1) + '×';
});

sizeSlider.addEventListener('input', () => {
    config.size = +sizeSlider.value;
    document.getElementById('sizeValue').textContent = config.size + ' px';
    particles.forEach(p => p.baseRadius = config.size);
});

forceSlider.addEventListener('input', () => {
    config.fieldStrength = +forceSlider.value;
    document.getElementById('forceValue').textContent = config.fieldStrength;
});

// ── Toggles ───────────────────────────────────────────────────────────────────
document.getElementById('gravityToggle').addEventListener('change', e => {
    config.gravity = e.target.checked;
});
document.getElementById('trailsToggle').addEventListener('change', e => {
    config.trails = e.target.checked;
});
document.getElementById('colorToggle').addEventListener('change', e => {
    config.colorBySpeed = e.target.checked;
});

// ── Viz toolbar buttons ───────────────────────────────────────────────────────
document.getElementById('trailsBtn').addEventListener('click', function () {
    config.trails = !config.trails;
    document.getElementById('trailsToggle').checked = config.trails;
    this.classList.toggle('active', config.trails);
});

document.getElementById('gridBtn').addEventListener('click', function () {
    config.showGrid = !config.showGrid;
    this.classList.toggle('active', config.showGrid);
});

// ── Reset / Pause ─────────────────────────────────────────────────────────────
function doReset() { spawnParticles(); }

document.getElementById('resetBtn').addEventListener('click', doReset);
document.getElementById('resetBtn2').addEventListener('click', doReset);

const pauseBtn = document.getElementById('pauseBtn');
pauseBtn.addEventListener('click', () => {
    config.paused = !config.paused;
    pauseBtn.textContent = config.paused ? '▶ Resume' : '⏸ Pause';
});

// Keyboard shortcuts
document.addEventListener('keydown', e => {
    if (e.code === 'Space') { e.preventDefault(); pauseBtn.click(); }
    if (e.key === 'r' || e.key === 'R') doReset();
});

// ── Dropdown ──────────────────────────────────────────────────────────────────
const menuBtn      = document.getElementById('menuBtn');
const dropdownMenu = document.getElementById('dropdownMenu');

menuBtn.addEventListener('click', e => {
    e.stopPropagation();
    dropdownMenu.classList.toggle('open');
});
document.addEventListener('click', () => dropdownMenu.classList.remove('open'));

const presets = {
    calm:    { count: 15, speed: 0.5, size: 14, gravity: false, trails: true  },
    chaos:   { count: 50, speed: 3.0, size: 8,  gravity: false, trails: false },
    gravity: { count: 30, speed: 1.5, size: 10, gravity: true,  trails: true  },
    sparse:  { count: 6,  speed: 1.2, size: 20, gravity: false, trails: true  },
};

document.querySelectorAll('.menu-item[data-preset]').forEach(btn => {
    btn.addEventListener('click', () => {
        const p = presets[btn.dataset.preset];
        if (!p) return;
        Object.assign(config, p);

        // Sync UI
        countSlider.value = p.count;
        document.getElementById('countValue').textContent = p.count;
        speedSlider.value = p.speed;
        document.getElementById('speedValue').textContent = p.speed.toFixed(1) + '×';
        sizeSlider.value = p.size;
        document.getElementById('sizeValue').textContent = p.size + ' px';
        document.getElementById('gravityToggle').checked = p.gravity;
        document.getElementById('trailsToggle').checked  = p.trails;

        spawnParticles();
        dropdownMenu.classList.remove('open');
    });
});

// ── Modals ────────────────────────────────────────────────────────────────────
function openModal(id) {
    const m = document.getElementById(id);
    m.style.display = 'flex';
    requestAnimationFrame(() => m.classList.add('show'));
}
function closeModal(id) {
    const m = document.getElementById(id);
    m.classList.remove('show');
    setTimeout(() => { m.style.display = 'none'; }, 300);
}

document.getElementById('helpBtn').addEventListener('click', () => openModal('helpModal'));
document.getElementById('quizBtn').addEventListener('click', () => openModal('quizModal'));

document.querySelectorAll('.close-modal').forEach(btn => {
    btn.addEventListener('click', () => {
        closeModal('helpModal');
        closeModal('quizModal');
    });
});

// Click backdrop to close
['helpModal', 'quizModal'].forEach(id => {
    document.getElementById(id).addEventListener('click', function (e) {
        if (e.target === this) closeModal(id);
    });
});

// ── Quiz ──────────────────────────────────────────────────────────────────────
function checkAnswer(btn, correct) {
    const question = btn.closest('.quiz-question');
    question.querySelectorAll('.quiz-opt').forEach(b => b.disabled = true);
    btn.classList.add(correct ? 'correct' : 'incorrect');
    if (!correct) {
        question.querySelectorAll('.quiz-opt').forEach(b => {
            if (b.onclick?.toString().includes('true')) b.classList.add('correct');
        });
    }
    const feedback = question.querySelector('.feedback');
    feedback.textContent = correct ? '✅ Correct!' : '❌ Not quite — see the highlighted answer.';
    feedback.style.color = correct ? 'var(--success)' : 'var(--danger)';
    question.querySelector('.next-btn').classList.remove('hidden');
}

function nextQuestion(current) {
    document.querySelector(`[data-q="${current}"]`).classList.remove('active');
    document.querySelector(`[data-q="${current + 1}"]`)?.classList.add('active');
}

function closeQuiz() { closeModal('quizModal'); }

// Expose quiz helpers globally (used in inline onclick)
window.checkAnswer = checkAnswer;
window.nextQuestion = nextQuestion;
window.closeQuiz = closeQuiz;
