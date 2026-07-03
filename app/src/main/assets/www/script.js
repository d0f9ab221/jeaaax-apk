// Register Service Worker for PWA support
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(reg => console.log('Service Worker registered successfully!', reg.scope))
            .catch(err => console.log('Service Worker registration failed:', err));
    });
}

// Particle System Background
const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');

let particles = [];
const particleCount = 60;

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

class Particle {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = Math.random() * 0.5 - 0.25;
        this.speedY = Math.random() * 0.5 - 0.25;
        this.color = Math.random() > 0.5 ? 'rgba(0, 243, 255, 0.3)' : 'rgba(255, 0, 127, 0.2)';
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
            this.reset();
        }
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Initialize Particles
for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw connections
    for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();

        for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 120) {
                ctx.strokeStyle = `rgba(0, 243, 255, ${0.15 * (1 - dist / 120)})`;
                ctx.lineWidth = 0.5;
                ctx.beginPath();
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.stroke();
            }
        }
    }
    requestAnimationFrame(animateParticles);
}
animateParticles();

// Audio Management
const ambientSound = document.getElementById('ambientSound');
const clickSound = document.getElementById('clickSound');
const audioToggle = document.getElementById('audioToggle');
let isMuted = true;

audioToggle.addEventListener('click', () => {
    isMuted = !isMuted;
    if (!isMuted) {
        ambientSound.play().catch(err => console.log("Audio play blocked by browser"));
        audioToggle.innerHTML = '<i class="fas fa-volume-up"></i>';
        audioToggle.style.boxShadow = '0 0 15px var(--primary-color)';
    } else {
        ambientSound.pause();
        audioToggle.innerHTML = '<i class="fas fa-volume-mute"></i>';
        audioToggle.style.boxShadow = 'none';
    }
});

// Loading Progress Logic
const progressCircle = document.getElementById('progressCircle');
const progressPercent = document.getElementById('progressPercent');
const statusText = document.getElementById('statusText');
const enterBtn = document.getElementById('enterBtn');
const progressRingContainer = document.querySelector('.progress-ring-container');
const statusBox = document.querySelector('.status-box');
const loaderContainer = document.getElementById('loaderContainer');
const mainContent = document.getElementById('mainContent');

const radius = progressCircle.r.baseVal.value;
const circumference = radius * 2 * Math.PI;
progressCircle.style.strokeDasharray = `${circumference} ${circumference}`;
progressCircle.style.strokeDashoffset = circumference;

function setProgress(percent) {
    const offset = circumference - (percent / 100) * circumference;
    progressCircle.style.strokeDashoffset = offset;
    progressPercent.innerText = Math.floor(percent);
}

const statusMessages = [
    { limit: 15, text: "Initializing core protocols..." },
    { limit: 35, text: "Loading visual assets & shaders..." },
    { limit: 55, text: "Establishing secure handshake..." },
    { limit: 75, text: "Configuring interface modules..." },
    { limit: 95, text: "Optimizing performance matrix..." },
    { limit: 100, text: "System ready." }
];

let currentProgress = 0;

function updateLoading() {
    if (currentProgress < 100) {
        currentProgress += Math.random() * 1.8 + 0.2;
        if (currentProgress > 100) currentProgress = 100;
        
        setProgress(currentProgress);

        const currentStatus = statusMessages.find(msg => currentProgress <= msg.limit);
        if (currentStatus && statusText.innerText !== currentStatus.text) {
            statusText.style.opacity = 0;
            setTimeout(() => {
                statusText.innerText = currentStatus.text;
                statusText.style.opacity = 1;
            }, 200);
        }

        requestAnimationFrame(updateLoading);
    } else {
        setTimeout(() => {
            progressRingContainer.classList.add('hidden');
            statusBox.classList.add('hidden');
            enterBtn.classList.remove('hidden');
        }, 500);
    }
}

setTimeout(updateLoading, 800);

enterBtn.addEventListener('click', () => {
    if (!isMuted) {
        clickSound.play();
    }
    
    loaderContainer.style.opacity = '0';
    loaderContainer.style.pointerEvents = 'none';
    
    setTimeout(() => {
        loaderContainer.style.display = 'none';
        mainContent.classList.remove('hidden');
        document.body.style.overflow = 'auto';
    }, 1000);
});

// PWA Installation Logic
let deferredPrompt;
const pwaInstallBtn = document.getElementById('pwaInstallBtn');

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    pwaInstallBtn.classList.remove('hidden');
});

pwaInstallBtn.addEventListener('click', () => {
    if (!deferredPrompt) return;
    pwaInstallBtn.classList.add('hidden');
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
            console.log('User accepted the install prompt');
        } else {
            console.log('User dismissed the install prompt');
        }
        deferredPrompt = null;
    });
});

window.addEventListener('appinstalled', () => {
    console.log('PWA was installed successfully!');
    pwaInstallBtn.classList.add('hidden');
});