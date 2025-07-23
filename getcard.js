function connectChatGPT() {
  // Simulate connecting and generating a summary
  document.querySelector('.connect-btn').disabled = true;
  document.querySelector('.connect-btn').innerText = 'Connecting...';
  setTimeout(function () {
    document.querySelector('.connect-btn').style.display = 'none';
    document.getElementById('summaryCard').style.display = 'block';
    document.getElementById('summaryCard').innerHTML = `
      <b>Your Personality Summary</b><br><br>
      <ul style="text-align:left; margin:0 auto; max-width:320px;">
        <li><b>Most open about:</b> Creativity, late-night thoughts</li>
        <li><b>Biggest strength:</b> Honest self-reflection</li>
        <li><b>Vibe:</b> Playful, introspective, authentic</li>
      </ul>
    `;
  }, 1800);
}
