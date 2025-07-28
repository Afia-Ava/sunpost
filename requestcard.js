document.getElementById('sendInviteBtn').addEventListener('click', function () {
  const questionsInput = document.getElementById('questions').value.trim();
  const emailInput = document.getElementById('email').value.trim();
  if (!questionsInput) {
    alert('Please add at least one custom question.');
    return;
  }
  if (!emailInput) {
    alert('Please enter a recipient email address.');
    return;
  }
  const baseUrl = window.location.origin + '/getcard.html';
  const params = new URLSearchParams();
  params.set('questions', questionsInput);
  params.set('email', emailInput);
  const shareLink = `${baseUrl}?${params.toString()}`;
  const status = document.getElementById('inviteStatus');
  status.innerHTML = `
    <b>Invite sent to:</b> <span style="color:#0078d4;">${emailInput}</span><br><br>
    <b>Link:</b> <input type="text" value="${shareLink}" style="width:100%;padding:8px;font-size:1em;" readonly onclick="this.select()">
    <br><button onclick="copyLink()" style="margin-top:10px;">Copy Link</button>
    <br><br><span style="font-size:0.95em;color:#555;">(Simulated email sent for demo)</span>
  `;
  status.style.display = 'block';
});

document
  .getElementById('generateLinkBtn')
  .addEventListener('click', function () {
    const questionsInput = document.getElementById('questions').value.trim();
    const emailInput = document.getElementById('email').value.trim();
    if (!questionsInput) {
      alert('Please add at least one custom question.');
      return;
    }
    const baseUrl = window.location.origin + '/getcard.html';
    const params = new URLSearchParams();
    // Do not include questions in the link
    if (emailInput) params.set('email', emailInput);
    const shareLink = `${baseUrl}?${params.toString()}`;
    const card = document.getElementById('shareLinkCard');
    card.innerHTML = `
    <b>Share this link with the person you want to fill it up:</b><br><br>
    <input type="text" value="${shareLink}" style="width:100%;padding:8px;font-size:1em;" readonly onclick="this.select()">
    <br><button onclick="copyLink()" style="margin-top:10px;">Copy Link</button>
    ${
      emailInput
        ? `<br><br><b>Or send to:</b> <span style="color:#222;">${emailInput}</span>`
        : ''
    }
  `;
    card.style.display = 'block';
  });

function copyLink() {
  const input = document.querySelector('#shareLinkCard input');
  input.select();
  document.execCommand('copy');
  alert('Link copied to clipboard!');
}
