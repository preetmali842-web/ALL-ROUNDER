const SCAPP = {
  state: {
    view: 'dashboard',
    theme: localStorage.getItem('scp_theme') || 'dark',
    sound: JSON.parse(localStorage.getItem('scp_sound') || 'true'),
    notify: JSON.parse(localStorage.getItem('scp_notify') || 'true')
  },
  data: {
    goals: JSON.parse(localStorage.getItem('scp_goals') || '[]'),
    notes: JSON.parse(localStorage.getItem('scp_notes') || '[]'),
    study: JSON.parse(localStorage.getItem('scp_study') || '{}'),
    achievements: JSON.parse(localStorage.getItem('scp_achievements') || '[]'),
    streak: JSON.parse(localStorage.getItem('scp_streak') || '0'),
    gameScores: JSON.parse(localStorage.getItem('scp_gameScores') || '{}'),
    quotes: []
  }
};

const qs = s => document.querySelector(s);
const qsa = s => [...document.querySelectorAll(s)];
const save = (k,v) => localStorage.setItem(k, JSON.stringify(v));

function setTheme(theme){
  document.documentElement.setAttribute('data-theme', theme === 'dark' ? '' : theme);
  if(theme === 'dark') document.documentElement.removeAttribute('data-theme');
  localStorage.setItem('scp_theme', theme);
  SCAPP.state.theme = theme;
}

function initQuotes(){
  SCAPP.data.quotes = [
    "Success is the sum of small efforts repeated daily.",
    "Discipline beats motivation when motivation fades.",
    "Study hard in silence; let success make the noise.",
    "The future belongs to those who prepare for it today.",
    "Small progress every day adds up to big results.",
    "Focus on the step in front of you, not the whole staircase.",
    "You do not need more time; you need more focus.",
    "Dream big, work hard, stay consistent.",
    "Great things are built one session at a time.",
    "Your only competition is yesterday's version of you.",
    "A goal without action is just a wish.",
    "Keep going. Every page you study changes your future."
  ];
  while (SCAPP.data.quotes.length < 220) SCAPP.data.quotes.push(`Keep learning, keep growing. Quote ${SCAPP.data.quotes.length + 1}`);
}

function renderTime(){
  const now = new Date();
  qs('#timeDisplay').textContent = now.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit', second:'2-digit'});
  qs('#dateDisplay').textContent = now.toLocaleDateString([], {weekday:'short', day:'numeric', month:'short', year:'numeric'});
}
function updateDashboardStats(){
  const goalsDone = SCAPP.data.goals.filter(g => g.done).length;
  const hrs = (SCAPP.data.study.dailyHours || 0).toFixed(1);
  qs('#streakCount').textContent = SCAPP.data.streak || 0;
  qs('#streakDisplay').textContent = `${SCAPP.data.streak || 0} days`;
  qs('#studyHoursToday').textContent = `${hrs}h`;
  qs('#goalsDone').textContent = goalsDone;
  qs('#achievementCount').textContent = `${(SCAPP.data.achievements || []).length} achievements`;
}
function unlockAchievements(){
  const goalsDone = SCAPP.data.goals.filter(g => g.done).length;
  const hrs = SCAPP.data.study.dailyHours || 0;
  const pom = JSON.parse(localStorage.getItem('scp_pomodoroSessions') || '0');
  const list = [
    {id:'first_goal', name:'First Goal Completed', icon:'🏁', ok:goalsDone >= 1},
    {id:'streak_5', name:'5-Day Streak', icon:'🔥', ok:(SCAPP.data.streak || 0) >= 5},
    {id:'hours_10', name:'10 Study Hours', icon:'📚', ok:hrs >= 10},
    {id:'tasks_50', name:'50 Tasks Completed', icon:'✅', ok:(JSON.parse(localStorage.getItem('scp_totalTasks') || '0')) >= 50},
    {id:'pomodoro', name:'Pomodoro Master', icon:'🍅', ok:pom >= 10}
  ];
  SCAPP.data.achievements = [...new Set([...(SCAPP.data.achievements || []), ...list.filter(x => x.ok).map(x => x.id)])];
  save('scp_achievements', SCAPP.data.achievements);
  qs('#achievementList').innerHTML = list.map(x => `
    <div class="badge ${SCAPP.data.achievements.includes(x.id) ? '' : 'locked'}">
      <div class="badge-icon">${x.icon}</div>
      <div><strong>${x.name}</strong><small>${SCAPP.data.achievements.includes(x.id) ? 'Unlocked' : 'Locked'}</small></div>
    </div>
  `).join('');
}

function showView(view){
  SCAPP.state.view = view;
  qsa('.view').forEach(v => v.classList.remove('active'));
  const target = qs(`#view-${view}`);
  if(target) target.classList.add('active');
  qsa('.nav-item').forEach(b => b.classList.toggle('active', b.dataset.view === view));
  const titles = {
    dashboard:['Dashboard','Your all-in-one study companion'],
    calculator:['Calculator','Basic and scientific calculation tools'],
    timer:['Timer Center','Stopwatch, countdown, and Pomodoro'],
    goals:['Daily Goals','Plan, complete, and stay on track'],
    tracker:['Study Tracker','Track study time by subject'],
    notes:['Notes','Capture ideas, formulas, and reminders'],
    motivation:['Motivation Hub','Quotes, challenges, and success tips'],
    games:['Game Center','Fun breaks with built-in games'],
    settings:['Settings','Customize your app experience']
  };
  if(titles[view]){
    qs('#pageTitle').textContent = titles[view][0];
    qs('#pageSubtitle').textContent = titles[view][1];
  }
  if(view === 'calculator' && typeof renderCalculator === 'function') renderCalculator();
  if(view === 'timer' && typeof renderTimerView === 'function') renderTimerView();
  if(view === 'goals' && typeof renderGoalsView === 'function') renderGoalsView();
  if(view === 'tracker' && typeof renderTrackerView === 'function') renderTrackerView();
  if(view === 'notes' && typeof renderNotesView === 'function') renderNotesView();
  if(view === 'motivation' && typeof renderMotivationView === 'function') renderMotivationView();
  if(view === 'games' && typeof renderGamesView === 'function') renderGamesView();
  if(view === 'settings' && typeof renderSettingsView === 'function') renderSettingsView();
}

function initNav(){
  document.addEventListener('click', e => {
    const btn = e.target.closest('[data-view]');
    if(btn && btn.dataset.view){
      showView(btn.dataset.view);
      if(window.innerWidth <= 980){
        qs('#sidebar').classList.remove('open');
        qs('#overlay').classList.remove('show');
      }
    }
  });
  qs('#menuToggle').addEventListener('click', () => {
    qs('#sidebar').classList.add('open'); qs('#overlay').classList.add('show');
  });
  qs('#overlay').addEventListener('click', () => {
    qs('#sidebar').classList.remove('open'); qs('#overlay').classList.remove('show');
  });
  qs('#themeQuickToggle').addEventListener('click', () => {
    const next = SCAPP.state.theme === 'dark' ? 'blue' : SCAPP.state.theme === 'blue' ? 'purple' : SCAPP.state.theme === 'purple' ? 'light' : 'dark';
    setTheme(next);
    renderSettingsSwatches();
  });
}

function maybeInitStorage(){
  if(!localStorage.getItem('scp_firstOpen')) localStorage.setItem('scp_firstOpen', String(Date.now()));
}

function loadAll(){
  setTheme(SCAPP.state.theme);
  initQuotes();
  renderTime();
  updateDashboardStats();
  unlockAchievements();
  initNav();
  if(typeof initCalculator === 'function') initCalculator();
  if(typeof initTimer === 'function') initTimer();
  if(typeof initGoals === 'function') initGoals();
  if(typeof initTracker === 'function') initTracker();
  if(typeof initNotes === 'function') initNotes();
  if(typeof initGames === 'function') initGames();
  if(typeof initSettings === 'function') initSettings();
  showView('dashboard');
}

maybeInitStorage();
loadAll();
setInterval(() => { renderTime(); updateDashboardStats(); }, 1000);