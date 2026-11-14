// ===== AUDIO UNLOCK & INSTANT VOICE GREETING =====
const prefersReducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
let tourController = null;

if ('speechSynthesis' in window) {
  speechSynthesis.getVoices();
  speechSynthesis.onvoiceschanged = () => speechSynthesis.getVoices();
}

function playWelcomeVoice() {
  if (!('speechSynthesis' in window)) return;
  const utter = new SpeechSynthesisUtterance("Welcome to Rik Mondal's portfolio.");
  
  const voices = speechSynthesis.getVoices();
  const preferredVoice =
    voices.find(v => /Natural|Neural|Google UK English Male|Microsoft Guy|Daniel|Samantha|Alex/i.test(v.name) && v.lang.startsWith('en')) ||
    voices.find(v => v.lang.startsWith('en') && !v.localService) ||
    voices.find(v => v.lang.startsWith('en'));

  if (preferredVoice) utter.voice = preferredVoice;
  utter.rate = 0.88;
  utter.pitch = 0.98;
  utter.volume = 1;

  speechSynthesis.cancel();
  speechSynthesis.speak(utter);
}

const welcomeOverlay = document.getElementById('welcome-overlay');
const skipIntroBtn = document.getElementById('skip-intro');
const skipTourBtn = document.getElementById('skip-tour');

function dismissWelcomeOverlay() {
  if (!welcomeOverlay) return;
  if (startBtn) startBtn.disabled = true;
  if (skipIntroBtn) skipIntroBtn.disabled = true;
  welcomeOverlay.style.opacity = '0';
  setTimeout(() => welcomeOverlay.remove(), 600);
}

function startWithoutTour() {
  dismissWelcomeOverlay();
  startDrift();
  initScrollReveal();
}

const startBtn = document.getElementById('start-btn');
if (startBtn) {
  startBtn.addEventListener('click', () => {
    playWelcomeVoice();
    dismissWelcomeOverlay();
    if (prefersReducedMotion.matches) {
      startDrift();
      initScrollReveal();
    } else {
      tourController = new AbortController();
      runFullPageTour(tourController.signal).catch(error => {
        console.error('Portfolio introduction failed.', error);
      });
    }
  });
}

if (skipIntroBtn) skipIntroBtn.addEventListener('click', startWithoutTour);
if (skipTourBtn) skipTourBtn.addEventListener('click', () => tourController?.abort());

if (welcomeOverlay) {
  welcomeOverlay.addEventListener('keydown', event => {
    if (event.key !== 'Tab') return;
    const buttons = [...welcomeOverlay.querySelectorAll('button:not([disabled])')];
    if (!buttons.length) return;
    const first = buttons[0];
    const last = buttons[buttons.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
  startBtn?.focus();
}

const menuToggle = document.getElementById('menu-toggle');
const siteHeader = menuToggle?.closest('.nav');
const siteNav = document.getElementById('primary-navigation');

function setMobileMenu(open, restoreFocus = false) {
  if (!menuToggle || !siteHeader) return;
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
  siteHeader.classList.toggle('mobile-open', open);
  if (!open && restoreFocus) menuToggle.focus();
}

if (menuToggle && siteNav) {
  menuToggle.addEventListener('click', () => {
    const open = menuToggle.getAttribute('aria-expanded') !== 'true';
    setMobileMenu(open);
    if (open) siteNav.querySelector('a')?.focus();
  });
  siteNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => setMobileMenu(false));
  });
  document.addEventListener('click', event => {
    if (menuToggle.getAttribute('aria-expanded') === 'true' &&
        event.target instanceof Node && !siteHeader.contains(event.target)) {
      setMobileMenu(false);
    }
  });
  matchMedia('(min-width: 861px)').addEventListener('change', event => {
    if (event.matches) setMobileMenu(false);
  });
}

// Sound Effect for Tapping / Clicking Buttons
let clickAudioContext = null;
function playClickSound() {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;
  try {
    if (!clickAudioContext) clickAudioContext = new AudioContext();
    const ctx = clickAudioContext;
    if (ctx.state === 'suspended') {
      ctx.resume().catch(error => console.warn('Click sound could not resume.', error));
    }
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(580, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.05);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.onended = () => {
      osc.disconnect();
      gain.disconnect();
    };
    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  } catch (error) {
    console.warn('Click sound is unavailable in this browser.', error);
  }
}

document.addEventListener('click', e => {
  if (e.target instanceof Element && e.target.closest('button, a')) playClickSound();
});

// ===== AI-GENERATED THEMED SVG VISUALIZERS FOR MODALS =====
function buildVisualizerArt(theme, label, tag) {
  const palettes = {
    cpp: { c1: '#00599c', c2: '#38bdf8', bg: '#050b16' },
    python: { c1: '#3776ab', c2: '#ffd43b', bg: '#060c14' },
    java: { c1: '#f89820', c2: '#ff4d4d', bg: '#140905' },
    js: { c1: '#f7df1e', c2: '#38bdf8', bg: '#0f0e05' },
    react3d: { c1: '#61dafb', c2: '#b28cff', bg: '#070a14' },
    web: { c1: '#e34f26', c2: '#38bdf8', bg: '#120806' },
    android: { c1: '#3ddc84', c2: '#0284c7', bg: '#04120b' },
    cloud: { c1: '#ffca28', c2: '#38bdf8', bg: '#120e04' },
    blender: { c1: '#ea7600', c2: '#b28cff', bg: '#140a04' },
    ai: { c1: '#a855f7', c2: '#38bdf8', bg: '#0a0514' }
  };
  const p = palettes[theme] || palettes.ai;

  let centerGraphic = '';
  if (theme === 'cpp') {
    // DSA Tree & Memory Pointer Visualization
    centerGraphic = `
      <g stroke="${p.c2}" stroke-width="2" fill="none" opacity="0.85">
        <line x1="400" y1="95" x2="290" y2="175" stroke-dasharray="6 4"/>
        <line x1="400" y1="95" x2="510" y2="175" stroke-dasharray="6 4"/>
        <line x1="290" y1="175" x2="230" y2="255"/>
        <line x1="290" y1="175" x2="350" y2="255"/>
        <line x1="510" y1="175" x2="450" y2="255"/>
        <line x1="510" y1="175" x2="570" y2="255"/>
      </g>
      <g font-family="monospace" font-size="13" font-weight="bold" text-anchor="middle" fill="#fff">
        <circle cx="400" cy="95" r="26" fill="${p.c1}" stroke="${p.c2}" stroke-width="2.5"/>
        <text x="400" y="100">0x01</text>
        <circle cx="290" cy="175" r="22" fill="#0b192c" stroke="${p.c2}" stroke-width="2"/>
        <text x="290" y="180">L*ptr</text>
        <circle cx="510" cy="175" r="22" fill="#0b192c" stroke="${p.c2}" stroke-width="2"/>
        <text x="510" y="180">R*ptr</text>
        <rect x="202" y="240" width="56" height="30" rx="6" fill="#0b192c" stroke="${p.c2}"/>
        <text x="230" y="259">O(logN)</text>
        <rect x="322" y="240" width="56" height="30" rx="6" fill="#0b192c" stroke="${p.c2}"/>
        <text x="350" y="259">STL</text>
        <rect x="422" y="240" width="56" height="30" rx="6" fill="#0b192c" stroke="${p.c2}"/>
        <text x="450" y="259">HEAP</text>
        <rect x="542" y="240" width="56" height="30" rx="6" fill="#0b192c" stroke="${p.c2}"/>
        <text x="570" y="259">DP[]</text>
      </g>`;
  } else if (theme === 'python' || theme === 'ai') {
    // Neural Waveform & Data Science Matrix
    centerGraphic = `
      <g fill="none" stroke-width="2.5">
        <path d="M120 185 Q 210 75, 300 185 T 480 185 T 680 185" stroke="${p.c2}" opacity="0.9"/>
        <path d="M120 185 Q 210 295, 300 185 T 480 185 T 680 185" stroke="${p.c1}" opacity="0.8"/>
      </g>
      <g fill="${p.c2}">
        <circle cx="210" cy="130" r="6"/><circle cx="300" cy="185" r="8"/><circle cx="390" cy="240" r="6"/>
        <circle cx="480" cy="185" r="8"/><circle cx="570" cy="130" r="6"/>
      </g>
      <g font-family="monospace" font-size="12" fill="#e2e8f0" opacity="0.85">
        <text x="145" y="95">tensor.shape = [128, 64]</text>
        <text x="465" y="280">inference_latency: 18ms</text>
      </g>`;
  } else if (theme === 'blender' || theme === 'react3d') {
    // 3D Wireframe Polyhedron & Orbit Rings
    centerGraphic = `
      <g transform="translate(400,185)" stroke="${p.c2}" fill="none">
        <ellipse rx="165" ry="52" transform="rotate(-18)" stroke="${p.c1}" stroke-width="2" opacity="0.8"/>
        <ellipse rx="165" ry="52" transform="rotate(18)" stroke="${p.c2}" stroke-width="1.5" stroke-dasharray="5 5"/>
        <polygon points="0,-78 72,-28 46,64 -46,64 -72,-28" fill="${p.c1}33" stroke="${p.c2}" stroke-width="2.5"/>
        <polyline points="-72,-28 0,10 72,-28" stroke="#fff" stroke-width="1.5" opacity="0.8"/>
        <line x1="0" y1="-78" x2="0" y2="10" stroke="#fff" stroke-width="1.5" opacity="0.8"/>
        <line x1="0" y1="10" x2="-46" y2="64" stroke="#fff" stroke-width="1.5" opacity="0.8"/>
        <line x1="0" y1="10" x2="46" y2="64" stroke="#fff" stroke-width="1.5" opacity="0.8"/>
      </g>`;
  } else if (theme === 'android' || theme === 'cloud') {
    // Real-time Cloud Sync & Mobile Architecture
    centerGraphic = `
      <g transform="translate(400,185)" fill="none" stroke="${p.c2}" stroke-width="2">
        <rect x="-150" y="-75" width="90" height="150" rx="14" fill="#071318" stroke="${p.c1}" stroke-width="2.5"/>
        <rect x="-136" y="-52" width="62" height="92" rx="4" fill="${p.c1}22" stroke="none"/>
        <rect x="55" y="-55" width="110" height="110" rx="18" fill="#071318" stroke="${p.c2}" stroke-width="2.5"/>
        <path d="M-50 -20 L 45 -20" stroke="${p.c1}" stroke-dasharray="6 4"/>
        <path d="M45 20 L -50 20" stroke="${p.c2}" stroke-dasharray="6 4"/>
        <text x="-105" y="5" font-family="monospace" font-size="11" fill="#fff" text-anchor="middle" stroke="none">APP UI</text>
        <text x="110" y="5" font-family="monospace" font-size="11" fill="#fff" text-anchor="middle" stroke="none">FIRESTORE</text>
      </g>`;
  } else {
    // Modular Object-Oriented & Web Architecture Grid
    centerGraphic = `
      <g transform="translate(400,185)" fill="none" stroke="${p.c2}" stroke-width="2">
        <rect x="-175" y="-65" width="105" height="130" rx="10" fill="${p.c1}26" stroke="${p.c1}"/>
        <rect x="-52" y="-65" width="105" height="130" rx="10" fill="${p.c2}1f" stroke="${p.c2}"/>
        <rect x="70" y="-65" width="105" height="130" rx="10" fill="${p.c1}26" stroke="${p.c1}"/>
        <text x="-122" y="4" font-family="monospace" font-size="12" fill="#fff" text-anchor="middle" stroke="none">MODEL</text>
        <text x="0" y="4" font-family="monospace" font-size="12" fill="#fff" text-anchor="middle" stroke="none">LOGIC</text>
        <text x="122" y="4" font-family="monospace" font-size="12" fill="#fff" text-anchor="middle" stroke="none">VIEW</text>
      </g>`;
  }

  return `
    <div class="viz-stage" style="--v1:${p.c1};--v2:${p.c2};--vbg:${p.bg}">
      <svg viewBox="0 0 800 360" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs>
          <radialGradient id="vg-${theme}" cx="50%" cy="45%" r="60%">
            <stop offset="0%" stop-color="${p.c1}" stop-opacity="0.45"/>
            <stop offset="60%" stop-color="${p.c2}" stop-opacity="0.12"/>
            <stop offset="100%" stop-color="${p.bg}" stop-opacity="1"/>
          </radialGradient>
          <pattern id="grid-${theme}" width="36" height="36" patternUnits="userSpaceOnUse">
            <path d="M 36 0 L 0 0 0 36" fill="none" stroke="#ffffff" stroke-opacity="0.06" stroke-width="1"/>
          </pattern>
        </defs>
        <rect width="800" height="360" fill="${p.bg}"/>
        <rect width="800" height="360" fill="url(#vg-${theme})"/>
        <rect width="800" height="360" fill="url(#grid-${theme})"/>
        ${centerGraphic}
      </svg>
      <div class="viz-hud">
        <span class="viz-pill">${tag}</span>
        <span class="viz-title">${label}</span>
      </div>
    </div>`;
}

// ===== RESUME-ALIGNED MODAL DATA =====
const modalData = {
  'ai-assistant': {
    type: 'project',
    theme: 'ai',
    vizTag: 'AI · 3D AVATAR SYSTEM',
    vizLabel: 'VOICE + LLM + THREE.JS',
    title: 'Local Desktop AI Assistant with 3D Interactive Avatar',
    sub: 'Python · Three.js · Blender · LLM Integration',
    g: ['#a855f7', '#0a0514'],
    desc: '<b>Overview:</b> Developing a desktop AI assistant featuring a custom-rigged 3D character avatar with voice interaction and dynamic visual backgrounds.<br><b>Architecture:</b> Designed modular pipelines integrating local speech processing with modern LLM workflows for responsive, real-time user interaction.<br><b>Core Stack:</b> Python, Three.js, Blender, LLM Integration.',
    badge: 'Active Flagship Project',
    repo: 'github.com/RikMondal2007'
  },
  'android-cloud': {
    type: 'project',
    theme: 'android',
    vizTag: 'MOBILE · CLOUD SYNC',
    vizLabel: 'ANDROID STUDIO + FIRESTORE',
    title: 'Full-Stack Android Application with Cloud Database',
    sub: 'Android Studio · Java · Firebase Firestore',
    g: ['#3ddc84', '#04120b'],
    desc: '<b>Overview:</b> Engineered a multi-screen Android mobile application featuring real-time cloud data synchronization via Firebase Firestore.<br><b>Security & UX:</b> Implemented structured database access rules and intuitive UI/UX layouts focused on reliability and performance.<br><b>Core Stack:</b> Android Studio (Java/XML), Firebase Firestore & Authentication.',
    badge: 'Full-Stack Mobile Build',
    repo: 'github.com/RikMondal2007'
  },
  'portfolio-3d': {
    type: 'project',
    theme: 'react3d',
    vizTag: 'WEB · INTERACTIVE 3D',
    vizLabel: 'REACT.JS + THREE.JS',
    title: '3D Interactive Developer Portfolio Website',
    sub: 'HTML5 · CSS3 · JavaScript · React.js · Three.js',
    g: ['#61dafb', '#070a14'],
    desc: '<b>Overview:</b> Built and deployed a responsive personal portfolio showcasing interactive 3D web elements alongside modular project and skill sections.<br><b>Deployment:</b> Engineered with fluid motion choreography, accessible navigation, and automated hosting via GitHub Pages.<br><b>Core Stack:</b> HTML5, CSS3, JavaScript (ES6+), React.js, Three.js, GitHub Pages.',
    badge: 'Live Production Portfolio',
    repo: 'github.com/RikMondal2007'
  },
  'billing-system': {
    type: 'project',
    theme: 'cpp',
    vizTag: 'SYSTEMS · OOP ENGINE',
    vizLabel: 'C++ & JAVA BILLING CORE',
    title: 'Console-Based Retail Billing & Inventory System',
    sub: 'C++ · Java · Object-Oriented Programming',
    g: ['#00599c', '#050b16'],
    desc: '<b>Overview:</b> Created an automated shopping bill generator applying object-oriented programming principles to compute itemized totals, taxes, and discounts.<br><b>Implementation:</b> Structured modular classes for inventory tracking, receipt generation, and accurate financial calculations.<br><b>Core Stack:</b> C++, Java, Object-Oriented Design.',
    badge: 'Core OOP Application',
    repo: 'github.com/RikMondal2007'
  },
  'Python': {
    type: 'code',
    theme: 'python',
    vizTag: 'DATA SCIENCE & BACKEND',
    vizLabel: 'PYTHON FOUNDATIONS',
    title: 'Python — Data Science & Backend Logic',
    sub: 'Foundational & Hands-On Proficiency',
    g: ['#3776ab', '#060c14'],
    snippet: `# Python Data & Backend Workflow\ndef process_pipeline(records):\n    cleaned = [r.strip().lower() for r in records if r]\n    return {"count": len(cleaned), "status": "Ready"}`,
    desc: '<b>Focus Areas:</b> Data science foundations for the IIT Madras BS program, backend scripting, data structures (lists, dictionaries, sets), and object-oriented programming.<br><b>Applied Use:</b> Powers speech processing and LLM orchestration in the Local Desktop AI Assistant.',
    badge: 'Data Science & AI Core',
    repo: 'github.com/RikMondal2007'
  },
  'C++': {
    type: 'code',
    theme: 'cpp',
    vizTag: 'DSA & MEMORY SYSTEMS',
    vizLabel: 'C++ · ALGORITHMS & OOP',
    title: 'C++ — Data Structures, Algorithms & OOP',
    sub: 'Foundational & Hands-On Proficiency',
    g: ['#00599c', '#050b16'],
    snippet: `// C++ Object-Oriented & DSA Architecture\nclass BillingEngine {\npublic:\n    double computeTotal(double price, double tax) {\n        return price + (price * tax);\n    }\n};`,
    desc: '<b>Focus Areas:</b> Data Structures and Algorithms (DSA), Object-Oriented Programming (classes, constructors, friend classes), and structured problem solving.<br><b>Applied Use:</b> Built the Console-Based Retail Billing & Inventory System with clean modular logic.',
    badge: 'DSA & OOP Foundations',
    repo: 'github.com/RikMondal2007'
  },
  'Java': {
    type: 'code',
    theme: 'java',
    vizTag: 'OBJECT-ORIENTED CORE',
    vizLabel: 'JAVA · ANDROID & OOP',
    title: 'Java — OOP & Core Application Logic',
    sub: 'Foundational & Hands-On Proficiency',
    g: ['#f89820', '#140905'],
    snippet: `// Java Modular Application Logic\npublic class CloudSyncManager {\n    public boolean verifyConnection() {\n        return true; // Firestore Real-Time Ready\n    }\n}`,
    desc: '<b>Focus Areas:</b> Object-Oriented Programming, class hierarchies, exception handling, and Android application logic.<br><b>Applied Use:</b> Used in Android Studio mobile development and retail billing software.',
    badge: 'Mobile & Core Logic',
    repo: 'github.com/RikMondal2007'
  },
  'JavaScript': {
    type: 'skill',
    theme: 'js',
    vizTag: 'MODERN WEB RUNTIME',
    vizLabel: 'JAVASCRIPT (ES6+)',
    title: 'JavaScript (ES6+)',
    sub: 'Interactive Web & Async Logic',
    g: ['#f7df1e', '#0f0e05'],
    desc: '<b>Capabilities:</b> Modern ES6+ syntax, DOM manipulation, asynchronous workflows (Promises, async/await), event-driven UI choreography, and modular frontend state management.',
    badge: 'Frontend Core',
    repo: 'github.com/RikMondal2007'
  },
  'React & Three.js': {
    type: 'skill',
    theme: 'react3d',
    vizTag: 'COMPONENT UI & WEBGL',
    vizLabel: 'REACT.JS · THREE.JS · NODE.JS',
    title: 'React.js, Three.js & Node.js',
    sub: 'Modern Full-Stack & 3D Web Ecosystem',
    g: ['#61dafb', '#070a14'],
    desc: '<b>Capabilities:</b> Building component-based interfaces with React.js, rendering interactive 3D models/scenes in the browser with Three.js, and structuring server workflows with Node.js.',
    badge: 'Full-Stack & 3D Web',
    repo: 'github.com/RikMondal2007'
  },
  'HTML5 / CSS3': {
    type: 'skill',
    theme: 'web',
    vizTag: 'SEMANTIC UI & MOTION',
    vizLabel: 'HTML5 · CSS3 · UI/UX',
    title: 'HTML5, CSS3 & UI/UX Prototyping',
    sub: 'Responsive Layouts & Accessibility',
    g: ['#e34f26', '#120806'],
    desc: '<b>Capabilities:</b> Semantic HTML5 architecture, responsive CSS Grid/Flexbox systems, custom keyframe animations, and accessible interface prototyping.',
    badge: 'Responsive Design',
    repo: 'github.com/RikMondal2007'
  },
  'Android Studio': {
    type: 'skill',
    theme: 'android',
    vizTag: 'NATIVE MOBILE DEV',
    vizLabel: 'ANDROID STUDIO (JAVA/XML)',
    title: 'Android Studio (Java / XML)',
    sub: 'Multi-Screen Mobile Applications',
    g: ['#3ddc84', '#04120b'],
    desc: '<b>Capabilities:</b> Designing multi-screen Android layouts in XML, implementing activity/fragment navigation in Java, and integrating real-time cloud backends.',
    badge: 'Android Development',
    repo: 'github.com/RikMondal2007'
  },
  'Firebase & DBs': {
    type: 'skill',
    theme: 'cloud',
    vizTag: 'RELATIONAL & NOSQL',
    vizLabel: 'FIREBASE · MYSQL · MONGODB',
    title: 'Firebase, MySQL & MongoDB',
    sub: 'Databases & Cloud Authentication',
    g: ['#ffca28', '#120e04'],
    desc: '<b>Capabilities:</b> Cloud Firestore real-time synchronization, Firebase Authentication, custom security rules, alongside relational (MySQL) and document-based (MongoDB) data modeling.',
    badge: 'Database & Cloud',
    repo: 'github.com/RikMondal2007'
  },
  'Blender & 3D': {
    type: 'skill',
    theme: 'blender',
    vizTag: '3D MODELING & RIGGING',
    vizLabel: 'BLENDER · C# UNITY BASICS',
    title: 'Blender (2D/3D Modeling) & C# (Unity Basics)',
    sub: 'Character Assets & Interactive Scenes',
    g: ['#ea7600', '#140a04'],
    desc: '<b>Capabilities:</b> 3D character modeling, rigging, and exporting web/engine-ready GLB assets in Blender, paired with foundational C# scripting in Unity.',
    badge: '3D Asset Creation',
    repo: 'github.com/RikMondal2007'
  },
  'AI & LLM Workflows': {
    type: 'skill',
    theme: 'ai',
    vizTag: 'INTELLIGENT SYSTEMS',
    vizLabel: 'LLM INTEGRATION & AI AGENTS',
    title: 'LLM Integration & AI-Assisted Workflows',
    sub: 'Next-Gen Engineering & Automation',
    g: ['#a855f7', '#0a0514'],
    desc: '<b>Capabilities:</b> Integrating Large Language Models and speech interfaces into local applications, and leveraging AI-assisted engineering workflows to accelerate prototyping while maintaining clean architecture.',
    badge: 'AI Systems & Productivity',
    repo: 'github.com/RikMondal2007'
  }
};

// Render Resume Project Cards in Work Section
const works = [
  { id: 'ai-assistant', t: 'Local Desktop AI Assistant', m: 'Python · Three.js · Blender · LLM', c: 'ai', g: ['#a855f7', '#0a0514'] },
  { id: 'android-cloud', t: 'Full-Stack Android App', m: 'Android Studio · Java · Firebase', c: 'web', g: ['#3ddc84', '#04120b'] },
  { id: 'portfolio-3d', t: '3D Interactive Portfolio', m: 'React.js · Three.js · GitHub Pages', c: 'ai', g: ['#61dafb', '#070a14'] },
  { id: 'billing-system', t: 'Retail Billing & Inventory', m: 'C++ · Java · Object-Oriented Design', c: 'core', g: ['#00599c', '#050b16'] }
];

const grid = document.getElementById('grid');
if (grid) {
  grid.innerHTML = works.map((w, i) => `
    <button class="card-w" data-id="${w.id}" data-c="${w.c}" data-i="${i}">
      <div class="thumb ${w.id}" style="--thumb-accent:${w.g[0]};--thumb-base:${w.g[1]}" aria-hidden="true">
        <span class="thumb-art"></span>
        <span class="thumb-label">${w.c.toUpperCase()} / ${String(i + 1).padStart(2, '0')}</span>
      </div>
      <div class="cap2"><i>${String(i + 1).padStart(2, '0')}</i><span><b>${w.t}</b><small>${w.m}</small></span></div>
    </button>`).join('');
}

// ===== OPEN CUSTOMIZED MODAL WITH VISUALIZER HEADER =====
const modal = document.getElementById('modal');
const portraitView = document.getElementById('portrait-view');
let modalReturnFocus = null;
function openCustomModal(data) {
  modalReturnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  modal.classList.remove('portrait-modal');
  portraitView.hidden = true;
  document.getElementById('mt').textContent = data.title;
  document.getElementById('ms').textContent = data.sub;
  const headerBg = document.getElementById('modal-header-bg');
  headerBg.style.background = `linear-gradient(135deg,${data.g[0]},${data.g[1]})`;
  headerBg.innerHTML = buildVisualizerArt(data.theme || 'ai', data.vizLabel || data.title, data.vizTag || 'VERIFIED');
  
  if (data.type === 'code' && data.snippet) {
    document.getElementById('mi').innerHTML = `
      <pre style="background:#05070c;border:1px solid #1e293b;padding:14px;font-family:monospace;font-size:12.5px;color:#7dd3fc;margin-bottom:14px;border-radius:6px;overflow-x:auto;line-height:1.5;">${data.snippet}</pre>
      <p>${data.desc}</p>
      <p style="margin-top:12px;"><b>Status:</b> <span style="color:var(--red);">${data.badge}</span></p>
      <p style="margin-top:8px;"><b>GitHub Profile:</b> <a href="https://${data.repo}" target="_blank" rel="noopener noreferrer" style="color:#7dd3fc;text-decoration:underline;">${data.repo}</a></p>
    `;
  } else {
    document.getElementById('mi').innerHTML = `
      <p>${data.desc}</p>
      <p style="margin-top:12px;"><b>Status:</b> <span style="color:var(--red);">${data.badge}</span></p>
      <p style="margin-top:8px;"><b>GitHub Profile:</b> <a href="https://${data.repo}" target="_blank" rel="noopener noreferrer" style="color:#7dd3fc;text-decoration:underline;">${data.repo}</a></p>
    `;
  }
  modal.hidden = false;
  document.body.classList.add('modal-open');
  document.getElementById('close').focus();
}

function openPortraitModal() {
    modalReturnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    modal.classList.add('portrait-modal');
    document.getElementById('mt').textContent = 'Full portrait';
    portraitView.hidden = false;
    modal.hidden = false;
    document.body.classList.add('modal-open');
    document.getElementById('close').focus();
}
document.getElementById('portrait-view-button')?.addEventListener('click', openPortraitModal);
document.getElementById('portrait-photo-button')?.addEventListener('click', openPortraitModal);

function closeModal() {
  if (modal.hidden) return;
  modal.hidden = true;
  modal.classList.remove('portrait-modal');
  portraitView.hidden = true;
  document.body.classList.remove('modal-open');
  modalReturnFocus?.focus();
}

if (grid) {
  grid.onclick = e => {
    const c = e.target.closest('.card-w');
    if (c) {
      const projId = c.dataset.id;
      const data = modalData[projId] || modalData['ai-assistant'];
      openCustomModal(data);
    }
  };
}

const brandTrack = document.getElementById('brand-track');
if (brandTrack) {
  brandTrack.querySelectorAll('button[data-project]').forEach(button => {
    button.onclick = () => {
      const projId = button.dataset.project;
      const data = modalData[projId] || modalData['ai-assistant'];
      openCustomModal(data);
    };
  });
}

document.querySelectorAll('.skill-chips button').forEach(btn => {
  btn.onclick = () => {
    const skillName = btn.dataset.skill;
    const data = modalData[skillName] || {
      type: 'skill',
      theme: 'ai',
      vizTag: 'TECHNICAL SKILL',
      vizLabel: skillName.toUpperCase(),
      title: skillName,
      sub: 'Technical Competency',
      g: ['#1b1b1f', '#050506'],
      desc: 'Foundational and hands-on technical skill applied in software development workflows.',
      badge: 'Resume Verified',
      repo: 'github.com/RikMondal2007'
    };
    openCustomModal(data);
  };
});

const reelBtn = document.getElementById('reel');
if (reelBtn) {
  reelBtn.onclick = () => {
    openCustomModal({
      type: 'project',
      theme: 'python',
      vizTag: 'IIT MADRAS BS · DATA SCIENCE',
      vizLabel: 'RIK MONDAL · CANDIDATE PROFILE',
      title: 'Professional Summary — Rik Mondal',
      sub: 'Aspiring Data Scientist & Full-Stack Software Developer',
      g: ['#0284c7', '#050b14'],
      desc: '<b>Education:</b> Incoming IIT Madras BS in Data Science and Applications undergraduate (4-Year Degree, Jan 2027 – Present; Qualifier Exam: 75%) with 81.6% in Class 12 PCMB (WBCHSE, 2026) and 76.0% in Class 10 (WBBSE, 2024).<br><b>Focus:</b> Hands-on experience building full-stack web applications, Android mobile apps, and interactive 3D/AI systems using Python, C++, Java, React.js, Three.js, and Firebase.<br><b>Objective:</b> Seeking internships, hackathons, and collaborative engineering opportunities.',
      badge: 'Available for Internships & Hackathons',
      repo: 'github.com/RikMondal2007'
    });
  };
}

const closeBtn = document.getElementById('close');
if (closeBtn) closeBtn.onclick = closeModal;
modal.onclick = e => { if (e.target === modal) closeModal(); };
modal.addEventListener('keydown', event => {
  if (event.key !== 'Tab') return;
  const focusable = [...modal.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])')];
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
});
addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    if (!modal.hidden) closeModal();
    else if (tourController) tourController.abort();
    else if (menuToggle?.getAttribute('aria-expanded') === 'true') setMobileMenu(false, true);
  }
});

// Horizontal Swipe / Drag for Work Cards
const workSlider = document.getElementById('work-slider');
if (workSlider) {
  let isDown = false, startX, scrollLeft;
  workSlider.addEventListener('mousedown', e => {
    isDown = true;
    startX = e.pageX - workSlider.offsetLeft;
    scrollLeft = workSlider.scrollLeft;
  });
  workSlider.addEventListener('mouseleave', () => { isDown = false; });
  workSlider.addEventListener('mouseup', () => { isDown = false; });
  workSlider.addEventListener('mousemove', e => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - workSlider.offsetLeft;
    const walk = (x - startX) * 1.5;
    workSlider.scrollLeft = scrollLeft - walk;
  });
}

// Marquee loop
if (brandTrack) {
  let isDown = false, startX, scrollLeft, isDragging = false, resumeTimer = null;
  let marqueeFrame = null, isVisible = false;
  const autoSpeed = 0.8;

  function stopMarquee() {
    if (marqueeFrame !== null) cancelAnimationFrame(marqueeFrame);
    marqueeFrame = null;
  }

  function startMarquee() {
    if (marqueeFrame !== null || !isVisible || document.hidden || prefersReducedMotion.matches ||
        isDragging || brandTrack.matches(':hover') || brandTrack.contains(document.activeElement)) return;
    const tick = () => {
      marqueeFrame = null;
      if (!isVisible || document.hidden || prefersReducedMotion.matches || isDragging ||
          brandTrack.matches(':hover') || brandTrack.contains(document.activeElement)) return;
      brandTrack.scrollLeft += autoSpeed;
      if (brandTrack.scrollLeft >= (brandTrack.scrollWidth - brandTrack.clientWidth) / 2) {
        brandTrack.scrollLeft = 0;
      }
      marqueeFrame = requestAnimationFrame(tick);
    };
    marqueeFrame = requestAnimationFrame(tick);
  }

  function resumeMarquee() {
    isDown = false;
    clearTimeout(resumeTimer);
    resumeTimer = setTimeout(() => {
      isDragging = false;
      startMarquee();
    }, 400);
  }

  new IntersectionObserver(([entry]) => {
    isVisible = entry.isIntersecting;
    if (isVisible) startMarquee();
    else stopMarquee();
  }).observe(brandTrack);

  document.addEventListener('visibilitychange', startMarquee);
  brandTrack.addEventListener('mouseenter', stopMarquee);
  brandTrack.addEventListener('mouseleave', () => {
    if (isDown) resumeMarquee();
    else startMarquee();
  });
  brandTrack.addEventListener('focusin', stopMarquee);
  brandTrack.addEventListener('focusout', startMarquee);
  prefersReducedMotion.addEventListener('change', () => {
    if (prefersReducedMotion.matches) stopMarquee();
    else startMarquee();
  });

  brandTrack.addEventListener('mousedown', e => {
    isDown = true;
    isDragging = true;
    stopMarquee();
    clearTimeout(resumeTimer);
    startX = e.pageX - brandTrack.offsetLeft;
    scrollLeft = brandTrack.scrollLeft;
  });
  brandTrack.addEventListener('mouseup', resumeMarquee);
  brandTrack.addEventListener('mousemove', e => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - brandTrack.offsetLeft;
    brandTrack.scrollLeft = scrollLeft - (x - startX) * 1.5;
  });
}

// Filter tabs
const projectTabs = [...document.querySelectorAll('.tabs [role="tab"]')];
projectTabs.forEach((button, index) => {
  button.addEventListener('click', () => {
    projectTabs.forEach(tab => {
      const selected = tab === button;
      tab.classList.toggle('on', selected);
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
    });
    grid?.setAttribute('aria-labelledby', button.id);
    document.querySelectorAll('.card-w').forEach(card => {
      card.classList.toggle('off', button.dataset.f !== 'all' && card.dataset.c !== button.dataset.f);
    });
  });
  button.addEventListener('keydown', event => {
    let nextIndex = index;
    if (event.key === 'ArrowRight') nextIndex = (index + 1) % projectTabs.length;
    else if (event.key === 'ArrowLeft') nextIndex = (index - 1 + projectTabs.length) % projectTabs.length;
    else if (event.key === 'Home') nextIndex = 0;
    else if (event.key === 'End') nextIndex = projectTabs.length - 1;
    else return;
    event.preventDefault();
    projectTabs[nextIndex].focus();
    projectTabs[nextIndex].click();
  });
});

// Qualifier score counter
const cnt = document.getElementById('count');
if (cnt) {
  new IntersectionObserver(([e], o) => {
    if (!e.isIntersecting) return;
    const to = +cnt.dataset.to; let n = 0;
    const id = setInterval(() => {
      n += 3;
      if (n >= to) { n = to; clearInterval(id); }
      cnt.textContent = n;
    }, 35);
    o.disconnect();
  }).observe(cnt);
}

// Scroll progress line
addEventListener('scroll', () => {
  const prog = document.querySelector('.progress');
  if (prog) {
    prog.style.height = (scrollY / (document.body.scrollHeight - innerHeight) * 100) + '%';
  }
}, { passive: true });

// ===== FULL-PAGE VIRTUAL CURSOR TOUR =====
const fine = matchMedia('(pointer:fine)').matches && !prefersReducedMotion.matches;
const EASE = 'cubic-bezier(.16,1,.3,1)';
const DRAGE = 'cubic-bezier(.65,0,.25,1)';
const root = document.documentElement;
const cbox = document.querySelector('.cursors');
const cols = ['#5ad1ff', '#ff7aa8', '#b28cff', '#7dffb0', '#ffd166'];
const names = ['Layout', 'Type', 'Color', 'Motion', 'Export'];
const cu = cols.map((c, i) => {
  const d = document.createElement('div'); d.className = 'cu';
  d.innerHTML = `<svg viewBox="0 0 16 16"><path d="M1 1l5 14 2-6 6-2z" fill="${c}"/></svg><span style="background:${c}">${names[i]}</span>`;
  if (cbox) cbox.appendChild(d);
  return d;
});

const place = (el, x, y, t = '4s', e = 'ease-in-out') => {
  el.style.setProperty('--t', t);
  el.style.setProperty('--ce', e);
  el.style.transform = `translate(${x}px,${y}px)`;
};
const rnd = (a, b) => a + Math.random() * (b - a);
function wait(ms, signal) {
  if (signal.aborted) return Promise.resolve();
  return new Promise(resolve => {
    let timer;
    const finish = () => {
      clearTimeout(timer);
      signal.removeEventListener('abort', finish);
      resolve();
    };
    timer = setTimeout(finish, ms);
    signal.addEventListener('abort', finish, { once: true });
  });
}

function scheduleTour(callback, ms, signal) {
  if (signal.aborted) return;
  let timer;
  const cancel = () => clearTimeout(timer);
  timer = setTimeout(() => {
    signal.removeEventListener('abort', cancel);
    if (!signal.aborted) callback();
  }, ms);
  signal.addEventListener('abort', cancel, { once: true });
}
let locked = false;
let swarmTimer = null;

function stopDrift() {
  clearTimeout(swarmTimer);
  swarmTimer = null;
}

function moveCursorSwarm(merge) {
  if (document.hidden || prefersReducedMotion.matches) return;

  const centerX = innerWidth / 2;
  const centerY = innerHeight * 0.48;
  cu.forEach((cursor, index) => {
    const angle = (Math.PI * 2 * index) / cu.length;
    const radius = 18 + index * 4;
    const x = merge ? centerX + Math.cos(angle) * radius : rnd(10, Math.max(10, innerWidth - 30));
    const y = merge ? centerY + Math.sin(angle) * radius : rnd(10, Math.max(10, innerHeight - 30));
    place(cursor, x, y, `${rnd(900, 1400)}ms`, EASE);
  });

  swarmTimer = setTimeout(() => moveCursorSwarm(!merge), merge ? 2500 : 3200);
}

async function revealPortraitWithCursors(layer, signal) {
  if (signal.aborted) return;
  const portrait = document.querySelector('.portrait');
  const card = portrait?.querySelector('.portrait-card');
  const photo = portrait?.querySelector('.portrait-photo');
  if (!portrait || !card || !photo) return;

  const cardRect = card.getBoundingClientRect();
  const target = {
    left: cardRect.left + card.clientLeft,
    top: cardRect.top + card.clientTop,
    width: card.clientWidth,
    height: photo.offsetHeight
  };
  const start = {
    left: Math.max(8, target.left + target.width * 0.18),
    top: Math.max(8, target.top + target.height * 0.06),
    width: target.width * 0.78,
    height: target.height * 0.88
  };
  const guide = document.createElement('div');
  guide.className = 'portrait-guide';
  guide.innerHTML = '<em>PORTRAIT FRAME · 01</em><span class="guide-focus"></span>';
  guide.style.cssText = `left:${start.left}px;top:${start.top}px;width:${start.width}px;height:${start.height}px`;
  layer.appendChild(guide);
  portrait.style.opacity = '1';

  const duration = 1700;
  const guideAnimation = guide.animate([
    start,
    { left: target.left, top: target.top, width: target.width, height: target.height }
  ], { duration, easing: EASE, fill: 'forwards' });
  const photoAnimation = photo.animate([
    { opacity: 0, transform: 'translate3d(24px,-18px,0) scale(1.05)', filter: 'blur(5px)' },
    { opacity: 1, transform: 'translate3d(0,0,0) scale(1)', filter: 'blur(0)' }
  ], { duration, easing: EASE, fill: 'forwards' });
  const corners = [
    { x: target.left, y: target.top },
    { x: target.left + target.width, y: target.top },
    { x: target.left, y: target.top + target.height },
    { x: target.left + target.width, y: target.top + target.height },
    { x: target.left + target.width / 2, y: target.top + target.height * 0.34 }
  ];

  cu.forEach((cursor, index) => {
    const corner = corners[index];
    place(cursor, corner.x + (index % 2 ? 80 : -80), corner.y + (index < 2 ? -55 : 55), '0s');
    cursor.classList.add('on');
    cursor.classList.remove('calm');
    void cursor.offsetWidth;
    place(cursor, corner.x, corner.y, `${duration}ms`, EASE);
  });
  signal.addEventListener('abort', () => {
    guideAnimation.cancel();
    photoAnimation.cancel();
  }, { once: true });

  try {
    await wait(duration, signal);
    if (signal.aborted) return;
    photo.classList.add('is-settled');
    root.classList.add('portrait-shown');
    guideAnimation.cancel();
    photoAnimation.cancel();
  } finally {
    guide.remove();
    portrait.style.opacity = '';
  }
}

function autoScrollTo(targetY, duration = 650, signal) {
  return new Promise(resolve => {
    if (signal.aborted) {
      resolve();
      return;
    }
    const prevBehavior = root.style.scrollBehavior;
    root.style.scrollBehavior = 'auto';
    const startY = scrollY;
    const maxScroll = Math.max(0, document.body.scrollHeight - innerHeight);
    const destY = Math.max(0, Math.min(maxScroll, targetY));
    const diff = destY - startY;
    if (Math.abs(diff) < 2) {
      root.style.scrollBehavior = prevBehavior;
      resolve();
      return;
    }
    let frame;
    const finish = () => {
      cancelAnimationFrame(frame);
      root.style.scrollBehavior = prevBehavior;
      signal.removeEventListener('abort', finish);
      resolve();
    };
    signal.addEventListener('abort', finish, { once: true });
    const startTime = performance.now();
    function step(now) {
      const p = Math.min((now - startTime) / duration, 1);
      const ease = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
      scrollTo(0, startY + diff * ease);
      if (p < 1) {
        frame = requestAnimationFrame(step);
      } else {
        finish();
      }
    }
    frame = requestAnimationFrame(step);
  });
}

function startDrift() {
  stopDrift();
  if (prefersReducedMotion.matches) {
    cu.forEach(c => c.classList.remove('on'));
    root.classList.add('ready');
    return;
  }
  if (!document.hidden) {
    cu.forEach(c => {
      c.classList.add('on', 'calm');
      place(c, rnd(10, Math.max(10, innerWidth - 30)), rnd(10, Math.max(10, innerHeight - 30)), '0s');
    });
    swarmTimer = setTimeout(() => moveCursorSwarm(true), 650);
  }
  root.classList.add('ready');
}

document.addEventListener('visibilitychange', () => {
  if (document.hidden) stopDrift();
  else if (root.classList.contains('ready')) startDrift();
});

prefersReducedMotion.addEventListener('change', event => {
  if (event.matches) {
    stopDrift();
    cu.forEach(c => c.classList.remove('on'));
    tourController?.abort();
  } else if (!document.hidden && root.classList.contains('ready')) {
    startDrift();
  }
});

function initScrollReveal() {
  const sel = '.tag,.h2,.tabs,.card-w,.big,.cap,.awards .muted,.list li,.about-intro,.cols>*,.exp li,.mega,.links a,.contact .card,.clients .track-wrap';
  const items = [...document.querySelectorAll(sel)];
  items.forEach(el => el.classList.add('rv'));
  const io = new IntersectionObserver(es => {
    es.filter(e => e.isIntersecting).forEach((e, i) => {
      e.target.style.setProperty('--d', i * .12 + 's');
      e.target.classList.add('in');
      io.unobserve(e.target);
    });
  }, { threshold: .15, rootMargin: '0px 0px -6% 0px' });
  items.forEach(el => io.observe(el));
}

async function buildBatch(selectors, layer, opts = {}) {
  const { step = 120, glide = 220, drag = 420, fill = 480, isHero = false, signal } = opts;
  const elements = selectors
    .flatMap(s => [...document.querySelectorAll(s)])
    .filter(el => el && el.offsetWidth > 0 && el.offsetHeight > 0);

  if (!elements.length) return;

  elements.forEach((el, i) => {
    const c = cu[i % cu.length];
    scheduleTour(() => {
      const r = el.getBoundingClientRect();
      const x = Math.max(r.left, 6);
      const y = Math.max(r.top, 6);
      const w = Math.min(r.right, innerWidth - 6) - x;
      const h = Math.min(r.bottom, innerHeight - 6) - y;
      if (w <= 4 || h <= 4) return;

      if (!c.classList.contains('on')) {
        place(c, rnd(0, innerWidth), -40, '0s');
        void c.offsetWidth;
        c.classList.add('on');
      }

      place(c, x, y, glide + 'ms', DRAGE);

      scheduleTour(() => {
        const f = document.createElement('div');
        f.className = (isHero && i === 0) ? 'fr ph' : 'fr';
        f.style.cssText = `left:${x}px;top:${y}px`;
        f.innerHTML = `<s></s><s style="left:100%"></s><s style="top:100%"></s><s style="left:100%;top:100%"></s><em>${Math.round(w)} × ${Math.round(h)}</em>`;
        layer.appendChild(f);

        f.animate(
          { width: ['0px', w + 'px'], height: ['0px', h + 'px'] },
          { duration: drag, easing: DRAGE, fill: 'forwards' }
        );
        place(c, x + w, y + h, drag + 'ms', DRAGE);
      }, glide, signal);
    }, i * step, signal);
  });

  const drawDone = (elements.length - 1) * step + glide + drag + 140;
  await wait(drawDone, signal);
  if (signal.aborted) return;

  elements.forEach((el, i) => {
    el.style.opacity = '';
    const animation = el.animate([
      { opacity: 0, clipPath: (isHero && i === 0) ? 'inset(50% 50% 50% 50%)' : 'inset(0px 100% 0px 0px)' },
      { opacity: 1, clipPath: 'inset(-80px -80px -80px -80px)' }
    ], { duration: fill, delay: i * 35, easing: EASE, fill: 'backwards' });
    signal.addEventListener('abort', () => animation.cancel(), { once: true });
  });

  await wait(fill + elements.length * 25, signal);
  if (signal.aborted) return;
  [...layer.children].forEach(f => {
    f.style.transition = 'opacity .35s';
    f.style.opacity = '0';
    scheduleTour(() => f.remove(), 360, signal);
  });
}

async function runFullPageTour(signal) {
  const layer = document.createElement('div');
  layer.className = 'guides';
  const heroSelectors = ['.script', '.name', '.role', '.lead', '.actions', '.logo', '.nav nav', '.pill', '.meta'];
  const sectionSteps = [
    { target: '#work', selectors: ['#work .tag', '#work .h2', '.tabs', '.grid'] },
    { target: '.clients', selectors: ['.clients .tag', '.track-wrap'] },
    { target: '#awards', selectors: ['#awards .h2', '.big', '#awards .cap', '#awards .muted', '.list li'] },
    { target: '#about', selectors: ['#about .tag', '#about .h2', '#about .about-intro', '.cols > div', '.cols blockquote'] },
    { target: '#experience', selectors: ['#experience .tag', '.exp li'] },
    { target: '#contact', selectors: ['#contact .tag', '.mega', '.links a', '.contact .card'] }
  ];

  const ghostEl = document.querySelector('.ghost');
  const allNodes = [
    ghostEl,
    ...heroSelectors.flatMap(s => [...document.querySelectorAll(s)]),
    ...sectionSteps.flatMap(st => st.selectors.flatMap(s => [...document.querySelectorAll(s)]))
  ].filter(Boolean);

  document.body.appendChild(layer);
  if (skipTourBtn) {
    skipTourBtn.hidden = false;
    skipTourBtn.focus();
  }
  root.classList.add('intro');
  locked = true;

  try {
    root.style.scrollBehavior = 'auto';
    scrollTo(0, 0);
    root.style.scrollBehavior = '';
    allNodes.forEach(el => el.style.opacity = '0');

    await wait(350, signal);
    if (signal.aborted) return;

    await revealPortraitWithCursors(layer, signal);
    if (signal.aborted) return;
    await buildBatch(heroSelectors, layer, { step: 160, glide: 240, drag: 460, fill: 520, signal });
    if (signal.aborted) return;
    if (ghostEl) {
      ghostEl.style.opacity = '';
      const animation = ghostEl.animate([{ opacity: 0 }, { opacity: 0.95 }], { duration: 600, fill: 'forwards' });
      signal.addEventListener('abort', () => animation.cancel(), { once: true });
    }

    for (const step of sectionSteps) {
      if (signal.aborted) return;
      const secEl = document.querySelector(step.target);
      if (!secEl) continue;
      const dest = secEl.getBoundingClientRect().top + scrollY - 70;
      await autoScrollTo(dest, 550, signal);
      if (signal.aborted) return;
      await buildBatch(step.selectors, layer, { step: 95, glide: 190, drag: 360, fill: 420, signal });
    }

    await wait(450, signal);
    if (signal.aborted) return;
    await autoScrollTo(0, 850, signal);

    layer.classList.add('gone');
    cu.forEach(c => c.classList.add('calm'));
    await wait(400, signal);
  } finally {
    if (skipTourBtn) skipTourBtn.hidden = true;
    root.classList.remove('intro');
    root.style.scrollBehavior = '';
    locked = false;
    allNodes.forEach(el => { el.style.opacity = ''; });
    layer.remove();
    startDrift();
    initScrollReveal();
    if (tourController?.signal === signal) tourController = null;
  }
}

// Smooth scrolling desktop
if (fine) {
  root.classList.add('sm');
  let target = scrollY, cur = scrollY, run = false;
  const max = () => document.body.scrollHeight - innerHeight;
  const tick = () => {
    cur += (target - cur) * .075;
    if (Math.abs(target - cur) < .4) { cur = target; run = false; }
    scrollTo(0, cur);
    if (run) requestAnimationFrame(tick);
  };
  const go = y => { target = Math.max(0, Math.min(max(), y)); if (!run) { run = true; cur = scrollY; requestAnimationFrame(tick); } };
  addEventListener('wheel', e => {
    if (e.ctrlKey || modal.hidden === false) return;
    e.preventDefault();
    if (!locked) go(target + e.deltaY * .9);
  }, { passive: false });
  addEventListener('scroll', () => { if (!run) target = cur = scrollY; }, { passive: true });
}

// Cursor ring + 3D Portrait Parallax
if (fine) {
  const ring = document.createElement('div'); ring.className = 'ring'; document.body.appendChild(ring);
  let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my, px = 0, py = 0;
  let cursorFrame = null;
  function moveCursor() {
    cursorFrame = null;
    rx += (mx - rx) * .12; ry += (my - ry) * .12;
    px += ((mx / innerWidth - .5) * 2 - px) * .05; py += ((my / innerHeight - .5) * 2 - py) * .05;
    ring.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%)`;
    root.style.setProperty('--mx', px.toFixed(3));
    root.style.setProperty('--my', py.toFixed(3));
    if (Math.abs(mx - rx) > .3 || Math.abs(my - ry) > .3 || Math.abs(px) > .002 || Math.abs(py) > .002) {
      cursorFrame = requestAnimationFrame(moveCursor);
    }
  }
  addEventListener('mousemove', event => {
    mx = event.clientX;
    my = event.clientY;
    if (cursorFrame === null) cursorFrame = requestAnimationFrame(moveCursor);
  });
  document.addEventListener('mouseover', event => {
    const target = event.target;
    ring.classList.toggle('hovered', target instanceof Element && !!target.closest('a,button'));
  });
}