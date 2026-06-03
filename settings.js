function initSettings(){ renderSettingsView(); }
function renderSettingsSwatches(){}
function renderSettingsView(){
  const root = qs('#view-settings');
  const theme = localStorage.getItem('scp_theme') || 'dark';
  const sound = JSON.parse(localStorage.getItem('scp_sound') || 'true');
  const notify = JSON.parse(localStorage.getItem('scp_notify') || 'true');
  root.innerHTML = `
    <div class="view-panel">
      <div class="glass section-card">
        <div class="section-head"><h3>Themes</h3><span>Choose your style</span></div>
        <div class="row two">
          <button class="action-btn secondary" data-theme-set="dark">Dark</button>
          <button class="action-btn secondary" data-theme-set="light">Light</button>
        </div>
        <div class="row two" style="margin-top:10px">
          <button class="action-btn secondary" data-theme-set="blue">Blue</button>
          <button class="action-btn secondary" data-theme-set="purple">Purple</button>
        </div>
      </div>

      <div class="glass section-card">
        <div class="section-head"><h3>Preferences</h3><span>Sound and notifications</span></div>
        <div class="row two">
          <button class="action-btn secondary" id="soundToggle">${sound ? 'Sound: On' : 'Sound: Off'}</button>
          <button class="action-btn secondary" id="notifyToggle">${notify ? 'Notifications: On' : 'Notifications: Off'}</button>
        </div>
      </div>

      <div class="glass section-card">
        <div class="section-head"><h3>Daily Challenge</h3><span>New goal every day</span></div>
        <div class="muted" id="challengeText"></div>
        <button class="action-btn secondary" id="newQuoteBtn" style="margin-top:12px">Random Quote</button>
        <div class="section-card" style="margin-top:12px">
          <strong id="quoteBox"></strong>
        </div>
      </div>

      <div class="glass section-card">
        <div class="section-head"><h3>Reset Data</h3><span>Use carefully</span></div>
        <button class="action-btn danger" id="resetAll">Reset All Data</button>
      </div>
    </div>
  `;
  qs('#view-settings').onclick = settingsActions;
  drawSettings();
}
function drawSettings(){
  const day = new Date().getDay();
  const challenges = [
    'Study for 1 hour without distractions.',
    'Complete 3 goals today.',
    'Write 1 useful note from your studies.',
    'Do one Pomodoro session now.',
    'Revise one subject for 20 minutes.',
    'Beat your yesterday study time.',
    'Solve 10 math questions.',
  ];
  qs('#challengeText').textContent = challenges[day];
  qs('#quoteBox').textContent = (SCAPP.data.quotes || [])[Math.floor(Math.random()*(SCAPP.data.quotes.length||1))] || '';
}
function settingsActions(e){
  if(e.target.dataset.themeSet){
    setTheme(e.target.dataset.themeSet);
  }
  if(e.target.id === 'soundToggle'){
    const v = !(JSON.parse(localStorage.getItem('scp_sound') || 'true'));
    localStorage.setItem('scp_sound', JSON.stringify(v));
    e.target.textContent = `Sound: ${v ? 'On' : 'Off'}`;
  }
  if(e.target.id === 'notifyToggle'){
    const v = !(JSON.parse(localStorage.getItem('scp_notify') || 'true'));
    localStorage.setItem('scp_notify', JSON.stringify(v));
    e.target.textContent = `Notifications: ${v ? 'On' : 'Off'}`;
  }
  if(e.target.id === 'newQuoteBtn'){
    qs('#quoteBox').textContent = SCAPP.data.quotes[Math.floor(Math.random()*SCAPP.data.quotes.length)];
  }
  if(e.target.id === 'resetAll'){
    if(confirm('Reset all saved data?')){
      Object.keys(localStorage).forEach(k => { if(k.startsWith('scp_')) localStorage.removeItem(k); });
      location.reload();
    }
  }
}