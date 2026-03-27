// ============================================
// IrisComm - Main JavaScript
// ============================================

// ============================================
// State Management
// ============================================
const state = {
    currentScreen: 'landing',
    previousScreen: null,
    currentText: '',
    isSpeaking: false,
    voiceSpeed: 1.0,
    dwellTime: 1500,
    emotion: 'calm',
    isCalibrated: false,
    calibrationProgress: 0,
    selectedPhraseCategory: null,
    messages: [],
    devices: [
        { id: 1, name: 'Living Room Light', type: 'light', isOn: false },
        { id: 2, name: 'Bedroom Fan', type: 'fan', isOn: false },
        { id: 3, name: 'TV', type: 'tv', isOn: false },
        { id: 4, name: 'Air Conditioner', type: 'ac', isOn: false, value: 22 },
        { id: 5, name: 'Front Door', type: 'door', isOn: false },
    ]
};

// ============================================
// Three.js Particle Background
// ============================================
class ParticleBackground {
    constructor() {
        this.container = document.getElementById('particle-container');
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.particles = null;
        this.lines = null;
        this.animationId = null;
        this.time = 0;
        
        this.init();
    }
    
    init() {
        if (!this.container) return;
        
        // Scene setup
        this.scene = new THREE.Scene();
        
        // Camera setup
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.z = 30;
        
        // Renderer setup
        this.renderer = new THREE.WebGLRenderer({ 
            alpha: true, 
            antialias: true,
            powerPreference: "high-performance"
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.container.appendChild(this.renderer.domElement);
        
        // Create particles
        this.createParticles();
        
        // Start animation
        this.animate();
        
        // Handle resize
        window.addEventListener('resize', () => this.handleResize());
    }
    
    createParticles() {
        const particleCount = 2000;
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        
        for (let i = 0; i < particleCount; i++) {
            // Spherical distribution
            const radius = Math.random() * 20 + 10;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            
            const x = radius * Math.sin(phi) * Math.cos(theta);
            const y = radius * Math.sin(phi) * Math.sin(theta);
            const z = radius * Math.cos(phi);
            
            positions[i * 3] = x;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = z;
            
            // Colors - purple to cyan gradient
            colors[i * 3] = 0.31 + Math.random() * 0.2;
            colors[i * 3 + 1] = 0.27 + Math.random() * 0.3;
            colors[i * 3 + 2] = 0.9 + Math.random() * 0.1;
        }
        
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        
        const material = new THREE.PointsMaterial({
            size: 0.15,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending,
        });
        
        this.particles = new THREE.Points(geometry, material);
        this.scene.add(this.particles);
    }
    
    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());
        this.time += 0.001;
        
        if (this.particles) {
            this.particles.rotation.y += 0.0005;
            this.particles.rotation.x += 0.0002;
            
            // Gentle wave motion
            const positions = this.particles.geometry.attributes.position.array;
            for (let i = 0; i < positions.length / 3; i++) {
                positions[i * 3 + 1] += Math.sin(this.time + positions[i * 3]) * 0.02;
            }
            this.particles.geometry.attributes.position.needsUpdate = true;
        }
        
        if (this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }
    }
    
    handleResize() {
        if (!this.camera || !this.renderer) return;
        
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    dispose() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        if (this.renderer && this.container) {
            this.container.removeChild(this.renderer.domElement);
        }
        if (this.particles) {
            this.particles.geometry.dispose();
            this.particles.material.dispose();
        }
    }
}

// Initialize particle background
let particleSystem = null;
document.addEventListener('DOMContentLoaded', () => {
    particleSystem = new ParticleBackground();
    initializeCalibrationDots();
    updateNavigation();
});

// ============================================
// Navigation & Screen Management
// ============================================
function navigateTo(screenId) {
    const currentScreen = document.getElementById(`${state.currentScreen}-screen`);
    const nextScreen = document.getElementById(`${screenId}-screen`);
    
    if (!nextScreen || state.currentScreen === screenId) return;
    
    // Store previous screen
    state.previousScreen = state.currentScreen;
    
    // Remove active class from current screen
    if (currentScreen) {
        currentScreen.classList.remove('active');
        currentScreen.classList.add('hidden');
    }
    
    // Add active class to next screen with animation
    nextScreen.classList.remove('hidden');
    nextScreen.classList.add('active', 'screen-enter');
    
    // Update state
    state.currentScreen = screenId;
    
    // Remove animation class after animation completes
    setTimeout(() => {
        nextScreen.classList.remove('screen-enter');
    }, 300);
    
    // Update navigation
    updateNavigation();
    
    // Scroll to top
    window.scrollTo(0, 0);
}

function updateNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        const screen = item.dataset.screen;
        if (screen === state.currentScreen) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

function startCalibration() {
    navigateTo('calibration');
    startCalibrationProcess();
}

function goBackFromPhrases() {
    if (state.selectedPhraseCategory) {
        state.selectedPhraseCategory = null;
        document.getElementById('phrase-categories').style.display = 'grid';
        document.getElementById('phrase-list').style.display = 'none';
    } else {
        navigateTo('communication');
    }
}

// ============================================
// Calibration System
// ============================================
function initializeCalibrationDots() {
    const grid = document.getElementById('calibration-grid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    // Create scanner line
    const scanner = document.createElement('div');
    scanner.className = 'calibration-scanner';
    grid.appendChild(scanner);
    
    // Create 9 calibration dots in a 3x3 grid
    for (let i = 0; i < 9; i++) {
        const dot = document.createElement('div');
        dot.className = 'calibration-dot';
        dot.style.left = `${20 + (i % 3) * 40}%`;
        dot.style.top = `${20 + Math.floor(i / 3) * 40}%`;
        dot.dataset.index = i;
        grid.appendChild(dot);
    }
}

function startCalibrationProcess() {
    state.calibrationProgress = 0;
    state.isCalibrated = false;
    
    const dots = document.querySelectorAll('.calibration-dot');
    const progressFill = document.getElementById('progress-fill');
    const progressValue = document.getElementById('calibration-progress');
    const actions = document.getElementById('calibration-actions');
    
    if (actions) actions.style.display = 'none';
    
    let currentDot = 0;
    
    const interval = setInterval(() => {
        state.calibrationProgress += 2;
        
        const dotIndex = Math.floor(state.calibrationProgress / 11.11);
        
        if (dotIndex > currentDot && currentDot < dots.length) {
            for (let i = 0; i <= currentDot; i++) {
                if (dots[i]) {
                    dots[i].classList.add('completed');
                }
            }
            currentDot = dotIndex;
        }
        
        if (progressFill) {
            progressFill.style.width = `${state.calibrationProgress}%`;
        }
        
        if (progressValue) {
            progressValue.textContent = `${Math.round(state.calibrationProgress)}%`;
        }
        
        if (state.calibrationProgress >= 100) {
            clearInterval(interval);
            state.isCalibrated = true;
            
            // Mark all dots as completed
            dots.forEach(dot => dot.classList.add('completed'));
            
            // Show continue button
            if (actions) {
                actions.style.display = 'flex';
            }
        }
    }, 100);
}

// ============================================
// Communication Functions
// ============================================
function handleKeyPress(key) {
    const messageElement = document.getElementById('current-message');
    const speechMessageElement = document.getElementById('speech-message');
    
    if (key === '⌫') {
        state.currentText = state.currentText.slice(0, -1);
    } else if (key === 'CLR') {
        state.currentText = '';
    } else {
        state.currentText += key;
    }
    
    const displayText = state.currentText || 'Start typing with your eyes...';
    
    if (messageElement) {
        messageElement.textContent = displayText;
    }
    
    if (speechMessageElement) {
        speechMessageElement.textContent = state.currentText || 'No message to speak';
    }
    
    // Visual feedback on key press
    event.target.classList.add('active');
    setTimeout(() => {
        event.target.classList.remove('active');
    }, 200);
}

function addText(text) {
    state.currentText += text + ' ';
    updateMessageDisplay();
}

function updateMessageDisplay() {
    const messageElement = document.getElementById('current-message');
    const speechMessageElement = document.getElementById('speech-message');
    
    const displayText = state.currentText || 'Start typing with your eyes...';
    
    if (messageElement) {
        messageElement.textContent = displayText;
    }
    
    if (speechMessageElement) {
        speechMessageElement.textContent = state.currentText || 'No message to speak';
    }
}

function sendMessage() {
    if (!state.currentText.trim()) return;
    
    state.messages.push({
        text: state.currentText,
        type: 'user',
        timestamp: new Date()
    });
    
    state.currentText = '';
    updateMessageDisplay();
    
    // Show success feedback
    showNotification('Message sent!', 'success');
}

function toggleSpeech() {
    state.isSpeaking = !state.isSpeaking;
    
    const playPauseBtn = document.getElementById('play-pause-btn');
    const voiceWave = document.getElementById('voice-wave');
    
    if (state.isSpeaking) {
        if (playPauseBtn) {
            playPauseBtn.innerHTML = `
                <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="6" y="4" width="4" height="16"/>
                    <rect x="14" y="4" width="4" height="16"/>
                </svg>
                Pause
            `;
        }
        if (voiceWave) {
            voiceWave.classList.add('speaking');
        }
        
        // Simulate speech
        simulateSpeech();
    } else {
        if (playPauseBtn) {
            playPauseBtn.innerHTML = `
                <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polygon points="5 3 19 12 5 21 5 3"/>
                </svg>
                Play
            `;
        }
        if (voiceWave) {
            voiceWave.classList.remove('speaking');
        }
    }
}

function simulateSpeech() {
    if (!state.currentText || !state.isSpeaking) return;
    
    // Simulate speech duration based on text length and speed
    const duration = (state.currentText.length * 50) / state.voiceSpeed;
    
    setTimeout(() => {
        if (state.isSpeaking) {
            toggleSpeech();
        }
    }, duration);
}

function setEmotion(emotion) {
    state.emotion = emotion;
    
    // Update UI
    const buttons = document.querySelectorAll('.emotion-btn');
    buttons.forEach(btn => {
        if (btn.dataset.emotion === emotion) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    showNotification(`Emotion set to ${emotion}`, 'info');
}

// ============================================
// Emergency Functions
// ============================================
function sendEmergencyAlert() {
    state.messages.push({
        text: '🚨 EMERGENCY! Immediate assistance required!',
        type: 'system',
        timestamp: new Date()
    });
    
    showNotification('Emergency alert sent!', 'emergency');
    
    setTimeout(() => {
        navigateTo('communication');
    }, 2000);
}

function callCaregiver() {
    showNotification('Calling caregiver...', 'info');
    
    setTimeout(() => {
        showNotification('Call initiated', 'success');
    }, 1500);
}

// ============================================
// Phrases System
// ============================================
const phrasesByCategory = {
    medical: ['I need water', 'I feel pain', 'Please call caregiver', 'I need medicine'],
    food: ['I am hungry', 'I am thirsty', 'I would like water', 'I would like food'],
    emotions: ['I am happy', 'I am sad', 'I am tired', 'I am comfortable'],
    requests: ['Please help me', 'Turn on the lights', 'Open the window', 'Play music'],
    social: ['Hello', 'Good morning', 'Thank you', 'I love you'],
    emergency: ['Help!', 'Emergency!', 'Call 911', 'I need help'],
};

function showPhrases(categoryId) {
    state.selectedPhraseCategory = categoryId;
    
    const categoriesView = document.getElementById('phrase-categories');
    const phraseListView = document.getElementById('phrase-list');
    const categoryNameElement = document.getElementById('selected-category-name');
    const phrasesContent = document.getElementById('phrases-content');
    
    // Get category name
    const categoryNames = {
        medical: 'Medical',
        food: 'Food & Drink',
        emotions: 'Emotions',
        requests: 'Requests',
        social: 'Social',
        emergency: 'Emergency',
    };
    
    if (categoryNameElement) {
        categoryNameElement.textContent = categoryNames[categoryId];
    }
    
    // Generate phrases
    if (phrasesContent) {
        phrasesContent.innerHTML = '';
        const phrases = phrasesByCategory[categoryId] || [];
        
        phrases.forEach(phrase => {
            const button = document.createElement('button');
            button.className = 'gaze-button primary lg phrase-btn';
            button.textContent = phrase;
            button.onclick = () => {
                addText(phrase);
                navigateTo('communication');
            };
            phrasesContent.appendChild(button);
        });
    }
    
    // Switch views
    if (categoriesView) {
        categoriesView.style.display = 'none';
    }
    if (phraseListView) {
        phraseListView.style.display = 'block';
    }
}

// ============================================
// Speech Settings
// ============================================
function setSpeed(speed) {
    state.voiceSpeed = speed;
    
    // Update display
    const speedValueElement = document.getElementById('speed-value');
    const settingsSpeedValueElement = document.getElementById('settings-speed-value');
    const speedSlider = document.getElementById('speed-slider');
    
    if (speedValueElement) {
        speedValueElement.textContent = speed.toFixed(1);
    }
    
    if (settingsSpeedValueElement) {
        settingsSpeedValueElement.textContent = speed.toFixed(1);
    }
    
    if (speedSlider) {
        speedSlider.value = speed;
    }
    
    // Update button states
    const speedButtons = document.querySelectorAll('.speed-btn');
    speedButtons.forEach(btn => {
        if (btn.textContent === `${speed.toFixed(1)}x` || btn.textContent === `${speed}x`) {
            btn.classList.add('primary');
            btn.classList.remove('secondary');
        } else {
            btn.classList.remove('primary');
            btn.classList.add('secondary');
        }
    });
}

// ============================================
// Settings Functions
// ============================================
function setDwellTime(time) {
    state.dwellTime = time;
    
    // Update button states
    const dwellButtons = document.querySelectorAll('.dwell-btn');
    dwellButtons.forEach(btn => {
        const btnTime = parseInt(btn.dataset.dwell);
        if (btnTime === time) {
            btn.classList.add('primary');
            btn.classList.remove('secondary');
        } else {
            btn.classList.remove('primary');
            btn.classList.add('secondary');
        }
    });
    
    showNotification(`Dwell time set to ${time}ms`, 'info');
}

function addContact() {
    showNotification('Add contact feature coming soon', 'info');
}

// Speed slider listener
document.addEventListener('DOMContentLoaded', () => {
    const speedSlider = document.getElementById('speed-slider');
    if (speedSlider) {
        speedSlider.addEventListener('input', (e) => {
            setSpeed(parseFloat(e.target.value));
        });
    }
});

// ============================================
// Gaze Button Interaction (Hover-based simulation)
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    const gazeButtons = document.querySelectorAll('.gaze-button');
    
    gazeButtons.forEach(button => {
        let hoverTimer = null;
        let progressStartTime = null;
        let animationFrame = null;
        
        button.addEventListener('mouseenter', () => {
            progressStartTime = Date.now();
            
            const animateProgress = () => {
                const elapsed = Date.now() - progressStartTime;
                const progress = Math.min((elapsed / state.dwellTime) * 100, 100);
                
                button.style.setProperty('--gaze-progress', `${progress}%`);
                
                if (progress >= 100) {
                    button.click();
                    button.classList.remove('gazing');
                } else {
                    animationFrame = requestAnimationFrame(animateProgress);
                }
            };
            
            button.classList.add('gazing');
            animationFrame = requestAnimationFrame(animateProgress);
        });
        
        button.addEventListener('mouseleave', () => {
            if (animationFrame) {
                cancelAnimationFrame(animationFrame);
            }
            button.classList.remove('gazing');
            button.style.setProperty('--gaze-progress', '0%');
        });
    });
});

// ============================================
// Notification System
// ============================================
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 2rem;
        right: 2rem;
        padding: 1rem 1.5rem;
        border-radius: var(--radius-lg);
        background: ${getNotificationColor(type)};
        color: white;
        font-weight: 500;
        z-index: 1000;
        animation: slideInRight 0.3s ease-out;
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-in forwards';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

function getNotificationColor(type) {
    switch (type) {
        case 'success':
            return 'oklch(0.7 0.18 145 / 90%)';
        case 'error':
        case 'emergency':
            return 'oklch(0.6 0.25 25 / 90%)';
        case 'info':
        default:
            return 'oklch(0.55 0.25 270 / 90%)';
    }
}

// Add notification animations to CSS dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// ============================================
// Voice Command Simulation (for demo)
// ============================================
function simulateVoiceCommand() {
    const commands = [
        'I need water',
        'I am feeling pain',
        'Please call caregiver',
        'Turn on the lights',
        'I am happy today'
    ];
    
    const randomCommand = commands[Math.floor(Math.random() * commands.length)];
    addText(randomCommand);
    showNotification(`Voice command detected: "${randomCommand}"`, 'success');
}

// ============================================
// Keyboard Shortcuts (for accessibility testing)
// ============================================
document.addEventListener('keydown', (e) => {
    // ESC to go back to landing
    if (e.key === 'Escape' && state.currentScreen !== 'landing') {
        navigateTo('landing');
    }
    
    // Number keys for quick navigation (1-7)
    const screenMap = {
        '1': 'landing',
        '2': 'calibration',
        '3': 'communication',
        '4': 'emergency',
        '5': 'phrases',
        '6': 'speech',
        '7': 'settings'
    };
    
    if (screenMap[e.key] && !e.ctrlKey && !e.altKey) {
        navigateTo(screenMap[e.key]);
    }
});

// ============================================
// Performance Optimization
// ============================================
// Reduce particle count on low-end devices
function detectLowEndDevice() {
    const deviceMemory = navigator.deviceMemory || 4;
    return deviceMemory <= 2;
}

if (detectLowEndDevice()) {
    // Could reduce particle count or disable certain effects
    console.log('Low-end device detected, optimizing performance...');
}

// ============================================
// Page Visibility API
// ============================================
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Pause animations when page is not visible
        if (particleSystem && particleSystem.animationId) {
            cancelAnimationFrame(particleSystem.animationId);
        }
    } else {
        // Resume animations when page becomes visible
        if (particleSystem) {
            particleSystem.animate();
        }
    }
});

// ============================================
// Service Worker Registration (for PWA support)
// ============================================
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Uncomment below to enable PWA support
        // navigator.serviceWorker.register('/sw.js')
        //     .then(registration => console.log('SW registered'))
        //     .catch(error => console.log('SW registration failed:', error));
    });
}

console.log('IrisComm Website loaded successfully! 🎉');
