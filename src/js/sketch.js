// sketch.js — p5.js bouncing-particle simulation

let particles = [];
let simRunning = false;
let simTime = 0;
let collisionCount = 0;
let fpsHistory = [];

let cfg = {
  count: 20, speed: 1.0, size: 12,
  gravity: false, trails: true, colorBySpeed: true,
};

class Particle {
  constructor(w, h) { this.init(w, h); }

  init(w, h) {
    this.x = random(30, w - 30);
    this.y = random(30, h - 30);
    const angle = random(TWO_PI);
    const spd = random(0.8, 2.2) * cfg.speed;
    this.vx = cos(angle) * spd;
    this.vy = sin(angle) * spd;
    this.r = cfg.size;
    this.trail = [];
  }

  update(w, h) {
    if (cfg.gravity) this.vy += 0.12;

    const maxSpd = 7 * cfg.speed;
    const spd = sqrt(this.vx ** 2 + this.vy ** 2);
    if (spd > maxSpd) { this.vx *= maxSpd / spd; this.vy *= maxSpd / spd; }

    if (cfg.trails) {
      this.trail.push({ x: this.x, y: this.y });
      if (this.trail.length > 16) this.trail.shift();
    } else {
      this.trail = [];
    }

    this.x += this.vx; this.y += this.vy;

    if (this.x < this.r)     { this.x = this.r;     this.vx *= -1; collisionCount++; }
    if (this.x > w - this.r) { this.x = w - this.r; this.vx *= -1; collisionCount++; }
    if (this.y < this.r)     { this.y = this.r;     this.vy *= -1; collisionCount++; }
    if (this.y > h - this.r) { this.y = h - this.r; this.vy *= -1; collisionCount++; }
  }

  draw(isDark) {
    const spd = sqrt(this.vx ** 2 + this.vy ** 2);
    const t = constrain(spd / (7 * cfg.speed), 0, 1);

    let col;
    if (cfg.colorBySpeed) {
      if (isDark) {
        // dark: blue → gold
        col = t < 0.5
          ? lerpColor(color('#2196F3'), color('#00BCD4'), t * 2)
          : lerpColor(color('#00BCD4'), color('#c8a24a'), (t - 0.5) * 2);
      } else {
        // light: teal → warm orange
        col = t < 0.5
          ? lerpColor(color('#0f7e9b'), color('#1ab5d0'), t * 2)
          : lerpColor(color('#1ab5d0'), color('#d67b19'), (t - 0.5) * 2);
      }
    } else {
      col = isDark ? color('#c8a24a') : color('#0f7e9b');
    }

    // Trail
    if (cfg.trails && this.trail.length > 1) {
      noFill();
      for (let i = 1; i < this.trail.length; i++) {
        const a = map(i, 0, this.trail.length, 0, 70);
        stroke(red(col), green(col), blue(col), a);
        strokeWeight(map(i, 0, this.trail.length, 1, this.r * 0.5));
        line(this.trail[i-1].x, this.trail[i-1].y, this.trail[i].x, this.trail[i].y);
      }
    }

    noStroke();
    // Glow
    fill(red(col), green(col), blue(col), isDark ? 35 : 25);
    ellipse(this.x, this.y, this.r * 2.6);
    // Body
    fill(col);
    ellipse(this.x, this.y, this.r * 2);
  }

  speed() { return sqrt(this.vx ** 2 + this.vy ** 2); }
}

function setup() {
  const cnv = createCanvas(980, 480);
  cnv.parent('simCanvas');
  // Replace the placeholder canvas element with ours
  const placeholder = document.getElementById('simCanvas');
  if (placeholder && placeholder !== cnv.elt) {
    placeholder.replaceWith(cnv.elt);
    cnv.elt.id = 'simCanvas';
    cnv.elt.className = 'sim-canvas';
    cnv.elt.setAttribute('role','img');
  }
  noLoop();
  spawnParticles();
}

function draw() {
  const isDark = document.body.dataset.theme === 'dark';

  if (isDark) {
    if (cfg.trails) { fill(15, 20, 28, 35); noStroke(); rect(0,0,width,height); }
    else background(15, 20, 28);
  } else {
    if (cfg.trails) { fill(248, 252, 255, 45); noStroke(); rect(0,0,width,height); }
    else background(248, 252, 255);
  }

  if (simRunning) simTime += deltaTime / 1000;

  particles.forEach(p => { if (simRunning) p.update(width, height); p.draw(isDark); });

  fpsHistory.push(frameRate());
  if (fpsHistory.length > 30) fpsHistory.shift();

  updateMetrics();
}

function updateMetrics() {
  const avgSpd = particles.reduce((s, p) => s + p.speed(), 0) / (particles.length || 1);
  const fps = fpsHistory.reduce((a, b) => a + b, 0) / (fpsHistory.length || 1);

  document.getElementById('metricCount').textContent  = particles.length;
  document.getElementById('metricSpeed').textContent  = avgSpd.toFixed(2) + ' u/s';
  document.getElementById('metricFps').textContent    = fps.toFixed(0);
  document.getElementById('metricGravity').textContent = cfg.gravity ? 'ON' : 'OFF';
  document.getElementById('metricTime').textContent   = simTime.toFixed(1) + ' s';
  document.getElementById('metricCollisions').textContent = collisionCount;
}

function spawnParticles() {
  particles = Array.from({ length: cfg.count }, () => new Particle(width, height));
  collisionCount = 0;
  simTime = 0;
}

function windowResized() { /* canvas size is fixed */ }
