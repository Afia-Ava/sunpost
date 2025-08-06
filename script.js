const app = document.getElementById('app');

let state = {
  page: 'landing',
  user: null,
  authMode: null,
  authError: '',
  users: {},
  customQuestions: '',
  selectedQuestions: [],
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
            <a href="login.html" class="login-btn">Log In</a>
          </div>
        </div>
      </div>
    </nav>
    <section class="main-hero">
      <h1 class="hero-title big" style="margin-bottom:0.4em;font-family: 'Poppins', 'Inter', 'Segoe UI', Arial, sans-serif; color: #23422a !important; text-shadow: none !important;">Sunpost</h1>
      <div class="hero-desc big" style="font-size:4vw;font-family: 'Poppins', 'Inter', 'Segoe UI', Arial, sans-serif; color: #23422a !important; text-shadow: none !important;">
        Send letters like postcards from your mind.
      </div>
      <div class="hero-desc sub-caption" style="font-size:1.25em;color:#23422a !important;margin:-0.5em auto 0 auto;white-space:nowrap;filter:none;transition:none;font-family: 'Poppins', 'Inter', 'Segoe UI', Arial, sans-serif; text-shadow: none !important;">
        Capture a moment, a feeling, or a thought, and send it.
      </div>
      <div style="display: flex; justify-content: center; margin-top: 2.2em;">
        <a href="login.html" id="getStartedBtn" style="text-decoration:none;">
          <button style="background:#fff;color:#222;padding:14px 48px;border-radius:12px;font-size:1.18rem;cursor:pointer;font-family:'Poppins',sans-serif;border:none;box-shadow:0 2px 8px rgba(0,0,0,0.07);font-weight:700;">Get started</button>
        </a>
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
      window.location.href = 'write.html';
      return;
    } else {
      if (!state.users[u] || state.users[u] !== p) {
        state.authError = 'Invalid credentials.';
        render();
        return;
      }
      state.user = { username: u };
      state.authError = '';
      window.location.href = 'write.html';
      return;
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
      <button onclick="goTo('create')">Request a Sunpost</button>
    </div>
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

function renderUpload() {
  app.innerHTML = `
    <div class="card">
      <h3>Paste Your AI Convos</h3>
      <div style="margin-bottom:1em;color:#444;font-size:1em;">
        <b>Requested Focus:</b> ${
          state.selectedQuestions.length
            ? state.selectedQuestions.map(q => q.q).join(', ')
            : 'General personality'
        }
      </div>
      <textarea id="convos" rows="8" placeholder="Paste your ChatGPT convos here..." style="width:100%;font-size:1em;padding:12px;border-radius:8px;border:1px solid #ccc;margin-bottom:1.2em;"></textarea>
      <button onclick="submitConvos()">Generate Card</button>
      <button onclick="goTo('home')" style="background:#eee;color:#222;margin-left:10px;">Back</button>
      <div id="requestSummaryCard" class="summary-card" style="display:none;margin-top:2em;"></div>
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
  const memory = document.getElementById('convos').value.trim();
  if (!memory) return alert('Please paste your ChatGPT chats.');
  const summary = analyzeRequestPersonality(memory, state.selectedQuestions);
  document.getElementById('requestSummaryCard').style.display = 'block';
  document.getElementById('requestSummaryCard').innerHTML = summary;
  function analyzeRequestPersonality(text, questions) {
    const words = text
      .toLowerCase()
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .split(/\s+/);
    const stopwords = [
      'the',
      'and',
      'i',
      'to',
      'a',
      'of',
      'in',
      'is',
      'it',
      'for',
      'on',
      'with',
      'you',
      'my',
      'me',
      'at',
      'that',
      'this',
      'was',
      'are',
      'but',
      'so',
      'we',
      'they',
      'be',
      'have',
      'has',
      'had',
      'as',
      'from',
      'by',
      'an',
      'or',
      'if',
      'not',
      'do',
      'can',
      'just',
      'your',
      'about',
      'what',
      'when',
      'who',
      'how',
      'why',
      'which',
      'will',
      'would',
      'should',
      'could',
      'all',
      'any',
      'more',
      'some',
      'get',
      'got',
      'like',
      'one',
      'out',
      'up',
      'see',
      'no',
      'yes',
      'too',
      'very',
      'also',
      'because',
      'than',
      'then',
      'now',
      'were',
      'been',
      'did',
      'them',
      'their',
      'our',
      'us',
      'he',
      'she',
      'him',
      'her',
      'his',
      'hers',
      'its',
      'into',
      'over',
      'under',
      'after',
      'before',
      'again',
      'still',
      'where',
      'there',
      'here',
      'go',
      'went',
      'come',
      'came',
      'make',
      'made',
      'want',
      'wanted',
      'need',
      'needed',
      'use',
      'used',
      'say',
      'said',
      'tell',
      'told',
      'ask',
      'asked',
      'think',
      'thought',
      'feel',
      'felt',
      'know',
      'knew',
      'time',
      'day',
      'days',
      'week',
      'weeks',
      'month',
      'months',
      'year',
      'years',
      'chat',
      'gpt',
      'ai',
      'openai',
      'memory',
      'paste',
      'copy',
      'user',
      'assistant',
    ];
    const freq = {};
    words.forEach(w => {
      if (w.length > 2 && !stopwords.includes(w)) {
        freq[w] = (freq[w] || 0) + 1;
      }
    });
    const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]);
    const topTopics = sorted.slice(0, 3).map(x => x[0]);

    let focusResults = '';
    if (questions && questions.length) {
      focusResults = questions
        .map(q => {
          const qWords = q
            .toLowerCase()
            .split(/\s+/)
            .filter(w => w.length > 2 && !stopwords.includes(w));
          const matches = qWords
            .map(qw => ({ qw, freq: freq[qw] || 0 }))
            .filter(x => x.freq > 0);
          if (matches.length) {
            return `<li><b>${q}:</b> Mentioned ${matches
              .map(m => `'${m.qw}' (${m.freq}x)`)
              .join(', ')}</li>`;
          } else {
            return `<li><b>${q}:</b> Not directly mentioned</li>`;
          }
        })
        .join('');
    }

    const positiveWords = [
      'happy',
      'love',
      'excited',
      'great',
      'good',
      'fun',
      'enjoy',
      'awesome',
      'amazing',
      'cool',
      'interesting',
      'positive',
      'success',
      'win',
      'helpful',
      'creative',
      'inspired',
      'hope',
      'peace',
      'calm',
      'relaxed',
      'joy',
      'smile',
      'laugh',
    ];
    const negativeWords = [
      'sad',
      'angry',
      'upset',
      'bad',
      'hate',
      'problem',
      'fail',
      'failure',
      'stress',
      'stressed',
      'anxious',
      'anxiety',
      'worry',
      'worried',
      'negative',
      'cry',
      'pain',
      'hurt',
      'fear',
      'scared',
      'bored',
      'tired',
      'confused',
    ];
    let pos = 0,
      neg = 0;
    words.forEach(w => {
      if (positiveWords.includes(w)) pos++;
      if (negativeWords.includes(w)) neg++;
    });
    let vibe = 'Balanced, thoughtful';
    if (pos > neg) vibe = 'Positive, optimistic';
    if (neg > pos) vibe = 'Introspective, honest';

    return `
    <b>Your Personality Summary</b><br><br>
    <ul style="text-align:left; margin:0 auto; max-width:320px;">
      ${focusResults}
      <li><b>Most open about:</b> ${
        topTopics.length ? topTopics.join(', ') : 'Various topics'
      }</li>
      <li><b>Vibe:</b> ${vibe}</li>
    </ul>
  `;
  }
}

render();
