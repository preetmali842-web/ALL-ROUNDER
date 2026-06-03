function initMotivation() {
  renderMotivationView();
}

function renderMotivationView() {
  const root = qs('#view-motivation');

  root.innerHTML = `
    <div class="view-panel">
      <div class="glass section-card">
        <div class="section-head">
          <h3>Motivation Hub</h3>
          <span>Quotes, challenge, and success tips</span>
        </div>

        <div class="section-card" style="margin-top:0">
          <div class="muted">Daily quote</div>
          <strong id="motivationQuote" style="display:block;line-height:1.7;font-size:1.05rem;margin-top:6px"></strong>
        </div>

        <div class="row two" style="margin-top:12px">
          <button class="action-btn" id="randomQuoteBtn">Random Quote</button>
          <button class="action-btn secondary" id="copyQuoteBtn">Copy Quote</button>
        </div>
      </div>

      <div class="glass section-card">
        <div class="section-head">
          <h3>Daily Challenge</h3>
          <span>Small wins build big habits</span>
        </div>
        <div class="section-card" style="margin-top:0">
          <strong id="challengeBox" style="display:block;line-height:1.7"></strong>
        </div>
        <button class="action-btn secondary" id="newChallengeBtn" style="margin-top:12px">New Challenge</button>
      </div>

      <div class="glass section-card">
        <div class="section-head">
          <h3>Success Tips</h3>
          <span>Study smarter every day</span>
        </div>
        <div id="tipsList" class="grid" style="gap:10px"></div>
      </div>
    </div>
  `;

  drawMotivation();
  bindMotivation();
}

function getMotivationData() {
  const quotes = [
    "Success is the sum of small efforts repeated daily.",
    "Discipline beats motivation when motivation fades.",
    "The future belongs to those who prepare for it today.",
    "Small progress every day adds up to big results.",
    "Dream big, work hard, stay consistent.",
    "Your only competition is yesterday's version of you.",
    "A goal without action is just a wish.",
    "Keep going. Every page you study changes your future.",
    "Focus on the next step, not the whole staircase.",
    "Do what is right, not what is easy.",
    "Learning never exhausts the mind.",
    "What we learn with pleasure we never forget."
  ];

  while (quotes.length < 220) {
    quotes.push(`Keep learning, keep growing. Quote ${quotes.length + 1}`);
  }

  const challenges = [
    "Study for 45 minutes without checking your phone.",
    "Complete 3 goals before your next break.",
    "Write one full page of notes from memory.",
    "Revise one subject for 20 minutes straight.",
    "Solve 10 questions without distractions.",
    "Finish one Pomodoro session right now.",
    "Teach one topic to yourself aloud for 5 minutes."
  ];

  const tips = [
    "Set one tiny goal before every session.",
    "Use Pomodoro to avoid mental fatigue.",
    "Revise active recall instead of only reading.",
    "Keep your desk clear before studying.",
    "Finish hard tasks first when focus is highest.",
    "Reward yourself after completing a study block."
  ];

  return { quotes, challenges, tips };
}

function drawMotivation() {
  const { quotes, challenges, tips } = getMotivationData();

  SCAPP.data.quotes = quotes;

  const quote = quotes[Math.floor(Math.random() * quotes.length)];
  const challenge = challenges[new Date().getDay() % challenges.length];

  qs('#motivationQuote').textContent = quote;
  qs('#challengeBox').textContent = challenge;

  qs('#tipsList').innerHTML = tips.map(tip => `
    <div class="progress-mini">
      <div>Success Tip</div>
      <strong style="font-size:1rem;line-height:1.5">${tip}</strong>
    </div>
  `).join('');
}

function bindMotivation() {
  qs('#randomQuoteBtn').onclick = () => {
    const { quotes } = getMotivationData();
    qs('#motivationQuote').textContent = quotes[Math.floor(Math.random() * quotes.length)];
  };

  qs('#copyQuoteBtn').onclick = async () => {
    const text = qs('#motivationQuote').textContent || '';
    try {
      await navigator.clipboard.writeText(text);
    } catch (e) {}
  };

  qs('#newChallengeBtn').onclick = () => {
    const { challenges } = getMotivationData();
    qs('#challengeBox').textContent = challenges[Math.floor(Math.random() * challenges.length)];
  };
}