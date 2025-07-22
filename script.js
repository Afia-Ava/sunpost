const app = document.getElementById('app');

const categories = [
  {
    name: 'Dating',
    questions: [
      'How do you talk to AI about love?',
      'What’s your ideal first date?',
      'What’s your biggest dating ick?',
    ],
  },
  {
    name: 'Creativity',
    questions: [
      'What’s your go-to AI prompt?',
      'What’s your weirdest late-night spiral?',
      'What’s something you’d never tell an AI?',
    ],
  },
  {
    name: 'Deep Dive',
    questions: [
      'Ask GPT what your biggest fear is.',
      'What’s your most honest AI convo?',
      'What do you wish AI could understand about you?',
    ],
  },
];

let state = {
  page: 'landing',
  user: null,
  authMode: null,
  authError: '',
  users: {},
  customQuestions: '',
  selectedQuestions: [], // [{cat, q}]
  requestLink: '',
  consentGiven: false,
  pastedConvos: '',
  report: null,
};

function render() {
  app.innerHTML = '';
  if (state.page === 'landing') renderLanding();
  else if (state.page === 'auth') renderAuth();
  else if (state.page === 'dashboard') renderDashboard();
  else if (state.page === 'create') renderCreate();
  else if (state.page === 'link') renderLink();
  else if (state.page === 'submitted') renderSubmitted();
  else if (state.page === 'report') renderReport();
}

function renderLanding() {
  app.innerHTML = `
    <nav class="top-navbar pill-navbar">
      <div class="pill-navbar-inner">
        <div class="pill-navbar-logo">
          <a href="index.html" class="logo-text" style="text-decoration:none;">chatcard</a>
        </div>
        <div class="pill-navbar-links">
          <a href="#about" class="nav-link">About</a>
          <a href="#" class="nav-link">Privacy</a>
          <a href="#" class="nav-link">Community</a>
          <a href="#" class="nav-link">Contact</a>
        </div>
        <div class="pill-navbar-actions">
          <div class="login-button-container">
            <a href="login.html" class="login-btn">Log In</a>
          </div>
        </div>
      </div>
    </nav>
    <section class="main-hero">
      <h1 class="hero-title big" style="margin-bottom:0.4em;">ChatCard</h1>
      <div class="hero-desc big">
        ChatCard is a personality layer<br>
        built on top of your AI chats.
      </div>
      <div class="hero-desc sub-caption" style="font-size:1.25em;color:#fff;margin:0 auto;opacity:0.92;white-space:nowrap;">
        Understand yourself. Share your vibe. Let others see the real you.
      </div>
      <div class="hero-btn-row">
        <button class="hero-btn" id="getCardBtn">Get card</button>
        <button class="hero-btn" id="requestCardBtn">Request card</button>
      </div>
    </section>
  `;
}

function goTo(section) {
  console.log(`Navigating to ${section}`);
}

function renderAuth() {
  app.innerHTML = `
    <div class="card center">
      <h2>${state.authMode === 'signup' ? 'Create Account' : 'Log In'}</h2>
      <form id="authForm">
        <input id="authUser" placeholder="Username" autocomplete="username" required />
        <input id="authPass" type="password" placeholder="Password" autocomplete="current-password" required />
        <button type="submit">${
          state.authMode === 'signup' ? 'Sign Up' : 'Log In'
        }</button>
      </form>
      <div class="small" style="color:#f33;min-height:20px;">${
        state.authError || ''
      }</div>
      <button onclick="goTo('landing')" style="background:#eee;color:#222;">Back</button>
    </div>
  `;
  document.getElementById('authForm').onsubmit = e => {
    e.preventDefault();
    const u = document.getElementById('authUser').value.trim();
    const p = document.getElementById('authPass').value;
    if (!u || !p) return;
    if (state.authMode === 'signup') {
      if (state.users[u]) {
        state.authError = 'Username already exists.';
        render();
        return;
      }
      state.users[u] = p;
      state.user = { username: u };
      state.authError = '';
      state.page = 'dashboard';
      render();
    } else {
      if (!state.users[u] || state.users[u] !== p) {
        state.authError = 'Invalid credentials.';
        render();
        return;
      }
      state.user = { username: u };
      state.authError = '';
      state.page = 'dashboard';
      render();
    }
  };
}

function renderDashboard() {
  app.innerHTML = `
    <div class="card center">
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <div style="font-weight:600;">Welcome, ${state.user.username}</div>
        <button onclick="logout()" style="background:#eee;color:#222;font-size:0.95em;padding:7px 16px;">Log Out</button>
      </div>
      <h2 style="margin:18px 0 10px 0;">Dashboard</h2>
      <button onclick="goTo('create')">Request a ChatCard</button>
    </div>
  `;
}

function renderCreate() {
  app.innerHTML = `
    <div class="card" style="max-width:700px;">
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <div style="font-weight:600;">Create ChatCard Request</div>
        <button onclick="goTo('dashboard')" style="background:#eee;color:#222;font-size:0.95em;padding:7px 16px;">Back</button>
      </div>
      <div style="display:flex;gap:24px;">
        <div style="flex:2;">
          <label>Custom Questions</label>
          <textarea id="customQ" rows="3" placeholder="Write your own questions...">${
            state.customQuestions
          }</textarea>
          <label style="margin-top:18px;">Selected Questions</label>
          <ul id="selectedQList" style="min-height:40px;">
            ${state.selectedQuestions
              .map(
                (q, i) =>
                  `<li>${q.q} <button onclick="removeSelectedQ(${i})" style="background:#eee;color:#222;font-size:0.9em;padding:2px 8px;margin-left:8px;">Remove</button></li>`
              )
              .join('')}
          </ul>
        </div>
        <div style="flex:1;min-width:180px;">
          <label>Categories</label>
          ${categories
            .map(
              (cat, ci) => `
            <div style="margin-bottom:10px;">
              <div style="font-weight:500;margin-bottom:4px;">${cat.name}</div>
              ${cat.questions
                .map((q, qi) => {
                  const already = state.selectedQuestions.some(
                    sq => sq.q === q
                  );
                  return `<button onclick="addQuestion('${cat.name.replace(
                    /'/g,
                    "'"
                  )}', '${q.replace(/'/g, "'")}' )" style="background:${
                    already ? '#ddd' : '#222'
                  };color:${
                    already ? '#222' : '#fff'
                  };font-size:0.95em;padding:5px 10px;margin:2px 0 2px 0;" ${
                    already ? 'disabled' : ''
                  }>${q}</button>`;
                })
                .join('<br/>')}
            </div>
          `
            )
            .join('')}
        </div>
      </div>
      <button onclick="generateLink()" style="margin-top:18px;">Generate Link</button>
    </div>
  `;
  document.getElementById('customQ').oninput = e => {
    state.customQuestions = e.target.value;
  };
}

function addQuestion(cat, q) {
  state.selectedQuestions.push({ cat, q });
  render();
}

function removeSelectedQ(i) {
  state.selectedQuestions.splice(i, 1);
  render();
}

function renderCreate() {
  app.innerHTML = `
    <div class="card">
      <h3>Create a ChatCard Request</h3>
      <label>Custom Questions</label>
      <textarea id="customQ" rows="3" placeholder="Write your own questions...">${
        state.customQuestions
      }</textarea>
      <label>Premade Questions</label>
      <div>
        ${premadeQuestions
          .map(
            (q, i) => `
          <div><input type="checkbox" id="pmq${i}" ${
              state.selectedPremade.includes(i) ? 'checked' : ''
            } onchange="togglePremade(${i})" /> ${q}</div>
        `
          )
          .join('')}
      </div>
      <button onclick="generateLink()">Generate Link</button>
      <button onclick="goTo('home')" style="background:#eee;color:#222;">Back</button>
    </div>
  `;
  document.getElementById('customQ').oninput = e => {
    state.customQuestions = e.target.value;
  };
}

function renderLink() {
  app.innerHTML = `
    <div class="card">
      <h3>ChatCard Request</h3>
      <p class="small">Share this link with your friend/date/interviewer:</p>
      <input readonly value="https://chatcard.link/request/abc123" />
      <hr />
      <p>When someone opens the link:</p>
      <ol>
        <li>They consent to share their AI convos</li>
        <li>They can connect their ChatGPT (mock) or paste convos</li>
        <li>AI analyzes and generates a secret ChatCard</li>
      </ol>
      <button onclick="goTo('consent')">Open as recipient</button>
      <button onclick="goTo('dashboard')" style="background:#eee;color:#222;">Back</button>
    </div>
  `;
}

function renderConsent() {
  app.innerHTML = `
    <div class="card">
      <h3>Consent Required</h3>
      <p>Do you agree to share your AI convos for analysis?</p>
      <button onclick="giveConsent()">I Consent</button>
      <button onclick="goTo('home')" style="background:#eee;color:#222;">Back</button>
    </div>
  `;
}

function renderUpload() {
  app.innerHTML = `
    <div class="card">
      <h3>Paste Your AI Convos</h3>
      <textarea id="convos" rows="6" placeholder="Paste your ChatGPT convos here..."></textarea>
      <button onclick="submitConvos()">Submit</button>
      <button onclick="goTo('home')" style="background:#eee;color:#222;">Back</button>
    </div>
  `;
}

function renderSubmitted() {
  app.innerHTML = `
    <div class="card center">
      <h3>Submitted!</h3>
      <p class="small">Thanks! The requester will get your ChatCard soon.</p>
      <button onclick="goTo('home')">Back to Home</button>
    </div>
  `;
}

function renderReport() {
  app.innerHTML = `
    <div class="card">
      <h3>Secret ChatCard Report</h3>
      <div style="background:#f6f7fb;padding:16px;border-radius:8px;">
        <b>AI Analysis:</b>
        <ul>
          <li>Most open about: Creativity, late-night thoughts</li>
          <li>Biggest fear: Not being understood</li>
          <li>Vibe: Playful, introspective, honest</li>
        </ul>
      </div>
      <button onclick="goTo('home')">Keep Private</button>
      <button onclick="alert('Shared!')" style="background:#eee;color:#222;">Share Back</button>
      <button onclick="goTo('home')" style="background:#f33;color:#fff;">Delete</button>
    </div>
  `;
}

function goTo(page, mode) {
  if (page === 'auth') {
    state.authMode = mode;
    state.page = 'auth';
    state.authError = '';
    render();
    return;
  }
  if (page === 'consent') renderConsent();
  else if (page === 'upload') renderUpload();
  else {
    state.page = page;
    render();
  }
}

function logout() {
  state.user = null;
  state.page = 'landing';
  render();
}

function togglePremade(i) {
  if (state.selectedPremade.includes(i)) {
    state.selectedPremade = state.selectedPremade.filter(x => x !== i);
  } else {
    state.selectedPremade.push(i);
  }
  render();
}

function generateLink() {
  if (state.customQuestions.trim()) {
    state.customQuestions.split('\n').forEach(line => {
      const q = line.trim();
      if (q && !state.selectedQuestions.some(sq => sq.q === q)) {
        state.selectedQuestions.push({ cat: 'Custom', q });
      }
    });
  }
  state.requestLink = 'https://chatcard.link/request/abc123';
  state.page = 'link';
  render();
}

function giveConsent() {
  state.consentGiven = true;
  goTo('upload');
}

function submitConvos() {
  state.pastedConvos = document.getElementById('convos').value;
  state.page = 'submitted';
  render();
  setTimeout(() => {
    state.page = 'report';
    render();
  }, 2000);
}

render();
