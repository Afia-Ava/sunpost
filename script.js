const app = document.getElementById('app');

let state = {
  page: 'landing',
  user: null,
  authMode: null,
  authError: '',
  users: {},
  customQuestions: '',
  selectedQuestions: [],
};

function render() {
  app.innerHTML = '';
  if (state.page === 'landing') renderLanding();
  else if (state.page === 'auth') renderAuth();
  else if (state.page === 'dashboard') renderDashboard();
  else if (state.page === 'create') renderCreate();
}

function renderLanding() {
  app.innerHTML = `
    <div id="grain"></div>
    <nav class="top-navbar pill-navbar">
      <div class="pill-navbar-inner">
        <div class="pill-navbar-logo">
          <a href="index.html" class="logo-text" style="text-decoration:none;">sunpost</a>
        </div>
        <div class="pill-navbar-links">
          <a href="about.html" class="nav-link">About</a>
          <a href="privacy.html" class="nav-link">Privacy</a>
          <a href="#" class="nav-link">Community</a>
          <a href="contact.html" class="nav-link">Contact</a>
        </div>
        <div class="pill-navbar-actions">
          <div class="login-button-container">
            <a href="login.html" class="login-btn" style="color:#14532d;">Log In</a>
          </div>
        </div>
      </div>
    </nav>
    <section class="main-hero">
      <h1 class="hero-title big" style="margin-bottom:0.4em;font-family: 'Poppins', 'Inter', 'Segoe UI', Arial, sans-serif; color: #23422a !important; text-shadow: none !important;">Sunpost</h1>
      <div class="hero-desc big" style="font-size:3.6vw; font-family: 'Inter', 'Segoe UI', Arial, sans-serif; color: #23422a; font-weight: 600; letter-spacing: -0.5px; text-shadow: none;">
        Send letters like postcards from your mind.
      </div>
      <div class="hero-desc sub-caption" style="font-size:1.25em;color:#23422a !important;margin:-0.5em auto 0 auto;white-space:nowrap;filter:none;transition:none;font-family: 'Poppins', 'Inter', 'Segoe UI', Arial, sans-serif; text-shadow: none !important;">
        Capture a moment, a feeling, or a thought, and send it.
      </div>
      <div style="display: flex; justify-content: center; margin-top: 2.2em;">
        <a href="login.html" id="getStartedBtn" style="text-decoration:none; background:#0d2412; border-radius:18px; box-shadow:0 4px 24px #0d2412; min-width:220px; max-width:320px; width:100%; display:flex; justify-content:center; align-items:center; padding: 0;">
          <button style="background:#0d2412;color:#fff;padding:14px 28px;border-radius:12px;font-size:1.18rem;cursor:pointer;font-family:'Poppins',sans-serif;border:none;box-shadow:0 2px 8px #0d2412;font-weight:700;">Get started</button>
        </a>
      </div>
    </section>
  `;
}

function renderCreate() {
  app.innerHTML = `
    <div class="card" style="max-width:700px;">
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <div style="font-weight:600;">Create Sunpost Request</div>
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
      <h3>Create a Sunpost Request</h3>
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
  state.page = page;
  render();
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

render();

function renderFooter() {
  let footer = document.querySelector('.footer-note');
  if (!footer) {
    footer = document.createElement('footer');
    footer.className = 'footer-note';
    document.body.appendChild(footer);
  }
  footer.style.background = '#0d2913';
  footer.style.color = '#fff';
  footer.innerHTML = '© 2025 Sunpost. All rights reserved.';
}

const origRender = render;
render = function () {
  origRender();
  renderFooter();
};
render();
