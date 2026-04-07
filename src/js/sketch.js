// sketch.js — p5.js bouncing-particle simulation

let particles = [];
let config = {
    count: 20,
    speed: 1.0,
    size: 12,
    gravity: false,
    trails: true,
    colorBySpeed: true,
    paused: false,
    showGrid: false,
    fieldStrength: 0,
};

let fpsHistory = [];

class Particle {
    constructor(w, h) {
        this.reset(w, h);
    }

    reset(w, h) {
        this.x = random(20, w - 20);
        this.y = random(20, h - 20);
        const angle = random(TWO_PI);
        const spd = random(0.8, 2.5) * config.speed;
        this.vx = cos(angle) * spd;
        this.vy = sin(angle) * spd;
        this.baseRadius = config.size;
        this.hue = random(360);
        this.trail = [];
    }

    update(w, h) {
        if (config.gravity) this.vy += 0.08;

        // Central field force
        if (config.fieldStrength !== 0) {
            const cx = w / 2, cy = h / 2;
            const dx = cx - this.x, dy = cy - this.y;
            const dist = max(sqrt(dx * dx + dy * dy), 1);
            const f = (config.fieldStrength / 100) * 0.3;
            this.vx += (dx / dist) * f;
            this.vy += (dy / dist) * f;
        }

        // Speed cap
        const spd = sqrt(this.vx * this.vx + this.vy * this.vy);
        const maxSpd = 6 * config.speed;
        if (spd > maxSpd) {
            this.vx = (this.vx / spd) * maxSpd;
            this.vy = (this.vy / spd) * maxSpd;
        }

        if (config.trails) {
            this.trail.push({ x: this.x, y: this.y });
            if (this.trail.length > 18) this.trail.shift();
        } else {
            this.trail = [];
        }

        this.x += this.vx;
        this.y += this.vy;

        // Bounce off walls
        const r = this.baseRadius;
        if (this.x < r)       { this.x = r;     this.vx *= -1; }
        if (this.x > w - r)   { this.x = w - r; this.vx *= -1; }
        if (this.y < r)       { this.y = r;     this.vy *= -1; }
        if (this.y > h - r)   { this.y = h - r; this.vy *= -1; }
    }

    draw() {
        const spd = sqrt(this.vx * this.vx + this.vy * this.vy);
        const maxSpd = 6 * config.speed;
        const t = constrain(spd / maxSpd, 0, 1);

        let col;
        if (config.colorBySpeed) {
            // slow=blue → medium=cyan → fast=orange
            if (t < 0.5) {
                col = lerpColor(color('#2196F3'), color('#00BCD4'), t * 2);
            } else {
                col = lerpColor(color('#00BCD4'), color('#FF9800'), (t - 0.5) * 2);
            }
        } else {
            colorMode(HSB, 360, 100, 100, 100);
            col = color(this.hue, 80, 90, 100);
            colorMode(RGB, 255, 255, 255, 255);
        }

        // Trail
        if (config.trails && this.trail.length > 1) {
            noFill();
            for (let i = 1; i < this.trail.length; i++) {
                const alpha = map(i, 0, this.trail.length, 0, 80);
                stroke(red(col), green(col), blue(col), alpha);
                strokeWeight(map(i, 0, this.trail.length, 1, this.baseRadius * 0.6));
                line(this.trail[i - 1].x, this.trail[i - 1].y, this.trail[i].x, this.trail[i].y);
            }
        }

        // Glow
        noStroke();
        fill(red(col), green(col), blue(col), 40);
        ellipse(this.x, this.y, this.baseRadius * 2.8);

        // Body
        fill(col);
        ellipse(this.x, this.y, this.baseRadius * 2);
    }

    speed() {
        return sqrt(this.vx * this.vx + this.vy * this.vy);
    }
}

function setup() {
    const container = document.getElementById('canvasContainer');
    const cnv = createCanvas(container.offsetWidth, container.offsetHeight);
    cnv.parent('canvasContainer');
    spawnParticles();
}

function draw() {
    if (config.paused) return;

    // Background fade (trails effect)
    if (config.trails) {
        fill(13, 17, 23, 40);
        noStroke();
        rect(0, 0, width, height);
    } else {
        background(13, 17, 23);
    }

    // Grid
    if (config.showGrid) drawGrid();

    particles.forEach(p => { p.update(width, height); p.draw(); });

    updateHUD();
}

function drawGrid() {
    stroke(58, 65, 73, 80);
    strokeWeight(1);
    const step = 40;
    for (let x = 0; x < width; x += step)  line(x, 0, x, height);
    for (let y = 0; y < height; y += step) line(0, y, width,  y);
}

function updateHUD() {
    fpsHistory.push(frameRate());
    if (fpsHistory.length > 30) fpsHistory.shift();
    const avgFps = fpsHistory.reduce((a, b) => a + b, 0) / fpsHistory.length;

    const avgSpd = particles.reduce((s, p) => s + p.speed(), 0) / (particles.length || 1);

    document.getElementById('hudCount').textContent = particles.length;
    document.getElementById('hudSpeed').textContent = avgSpd.toFixed(1);
    document.getElementById('hudFps').textContent = avgFps.toFixed(0);
    document.getElementById('velocityDisplay').innerHTML = avgSpd.toFixed(1) + ' <span class="unit">u/s</span>';

    // Gauge needle: map avgSpd (0-6) to -90 to +90 degrees
    const maxSpd = 6 * config.speed;
    const angle = map(avgSpd, 0, maxSpd, -90, 90);
    document.getElementById('velocimeterNeedle').style.transform =
        `translateX(-50%) rotate(${angle}deg)`;
}

function spawnParticles() {
    particles = [];
    for (let i = 0; i < config.count; i++) {
        particles.push(new Particle(width, height));
    }
}

function windowResized() {
    const container = document.getElementById('canvasContainer');
    resizeCanvas(container.offsetWidth, container.offsetHeight);
}
