let timerState = {
  stopwatchRunning:false, stopwatchStart:0, stopwatchElapsed:0, stopwatchLaps:[],
  countdownRunning:false, countdownMs:0, countdownTotal:0, countdownInt:null,
  pomodoroRunning:false, pomPhase:'work', pomRemaining:25*60, pomMode:'25/5',
  pomInt:null
};

function initTimer(){
  const root = document.querySelector('#view-timer');
  root.innerHTML = `
    <div class="view-panel">
      <div class="glass section-card">
        <div class="section-head"><h3>Stopwatch</h3><span id="stopwatchValue">00:00:00</span></div>
        <div class="timer-display" id="stopwatchText">00:00:00</div>
        <div class="row three">
          <button class="action-btn" id="swStart">Start</button>
          <button class="action-btn secondary" id="swPause">Pause</button>
          <button class="action-btn secondary" id="swReset">Reset</button>
        </div>
        <button class="action-btn secondary" id="swLap" style="margin-top:12px">Lap</button>
        <div class="calc-history" id="lapList" style="margin-top:12px"></div>
      </div>

      <div class="glass section-card">
        <div class="section-head"><h3>Countdown Timer</h3><span>Alarm & progress</span></div>
        <div class="row two">
          <input class="input" id="countMin" type="number" min="1" placeholder="Minutes" value="25">
          <button class="action-btn" id="countStart">Start</button>
        </div>
        <div class="canvas-wrap" style="margin:18px 0">
          <div class="timer-ring"><span id="countText">25:00</span></div>
        </div>
        <div class="progress-bar"><div id="countBar"></div></div>
        <div class="row two" style="margin-top:12px">
          <button class="action-btn secondary" id="countPause">Pause</button>
          <button class="action-btn secondary" id="countReset">Reset</button>
        </div>
      </div>

      <div class="glass section-card">
        <div class="section-head"><h3>Pomodoro</h3><span>Session tracking</span></div>
        <div class="row two">
          <select id="pomMode">
            <option value="25/5">25 / 5</option>
            <option value="50/10">50 / 10</option>
            <option value="custom">Custom</option>
          </select>
          <button class="action-btn" id="pomStart">Start</button>
        </div>
        <div class="row two hidden" id="customPomRow" style="margin-top:10px">
          <input class="input" id="workMin" type="number" min="1" value="25" placeholder="Work min">
          <input class="input" id="breakMin" type="number" min="1" value="5" placeholder="Break min">
        </div>
        <div class="timer-display" id="pomText">25:00</div>
        <div class="progress-bar"><div id="pomBar"></div></div>
        <div class="row three" style="margin-top:12px">
          <button class="action-btn secondary" id="pomPause">Pause</button>
          <button class="action-btn secondary" id="pomReset">Reset</button>
          <button class="action-btn secondary" id="pomSkip">Skip</button>
        </div>
        <div class="muted" style="margin-top:10px">Sessions today: <span id="pomSessions">0</span></div>
      </div>
    </div>
  `;
  bindTimer();
  renderTimerView();
}

function renderTimerView(){
  updateStopwatchUI(); updateCountdownUI(); updatePomodoroUI();
  document.getElementById('lapList').innerHTML = timerState.stopwatchLaps.map((l,i)=>`<div class="history-item"><span>Lap ${i+1}</span><strong>${l}</strong></div>`).join('') || '<div class="muted">No laps yet.</div>';
  document.getElementById('pomSessions').textContent = JSON.parse(localStorage.getItem('scp_pomodoroSessions') || '0');
}

function bindTimer(){
  qs('#swStart').onclick = startStopwatch;
  qs('#swPause').onclick = pauseStopwatch;
  qs('#swReset').onclick = resetStopwatch;
  qs('#swLap').onclick = addLap;

  qs('#countStart').onclick = startCountdown;
  qs('#countPause').onclick = pauseCountdown;
  qs('#countReset').onclick = resetCountdown;

  qs('#pomMode').onchange = () => {
    const custom = qs('#pomMode').value === 'custom';
    qs('#customPomRow').classList.toggle('hidden', !custom);
    syncPomMode();
  };
  qs('#pomStart').onclick = startPomodoro;
  qs('#pomPause').onclick = pausePomodoro;
  qs('#pomReset').onclick = resetPomodoro;
  qs('#pomSkip').onclick = skipPomodoro;
  setInterval(tickTimer, 200);
}

function formatMs(ms){
  ms = Math.max(0, ms);
  const s = Math.floor(ms/1000), h = Math.floor(s/3600), m = Math.floor((s%3600)/60), sec = s%60;
  return [h,m,sec].map(v=>String(v).padStart(2,'0')).join(':');
}
function updateStopwatchUI(){ qs('#stopwatchText').textContent = formatMs(timerState.stopwatchElapsed); qs('#stopwatchValue').textContent = formatMs(timerState.stopwatchElapsed); }
function startStopwatch(){ if(timerState.stopwatchRunning) return; timerState.stopwatchRunning = true; timerState.stopwatchStart = Date.now() - timerState.stopwatchElapsed; }
function pauseStopwatch(){ timerState.stopwatchRunning = false; }
function resetStopwatch(){ timerState.stopwatchRunning=false; timerState.stopwatchElapsed=0; timerState.stopwatchLaps=[]; renderTimerView(); }
function addLap(){ if(!timerState.stopwatchElapsed) return; timerState.stopwatchLaps.push(formatMs(timerState.stopwatchElapsed)); renderTimerView(); }

function startCountdown(){
  const mins = +qs('#countMin').value || 25;
  timerState.countdownTotal = mins*60*1000;
  timerState.countdownMs = timerState.countdownTotal;
  timerState.countdownRunning = true;
}
function pauseCountdown(){ timerState.countdownRunning = false; }
function resetCountdown(){ timerState.countdownRunning=false; timerState.countdownMs=timerState.countdownTotal; updateCountdownUI(); }
function updateCountdownUI(){
  qs('#countText').textContent = formatMs(timerState.countdownMs).slice(3);
  const pct = timerState.countdownTotal ? ((timerState.countdownTotal - timerState.countdownMs)/timerState.countdownTotal)*100 : 0;
  qs('#countBar').style.width = `${Math.max(0,Math.min(100,pct))}%`;
}

function syncPomMode(){
  const mode = qs('#pomMode').value;
  if(mode === '25/5'){ timerState.pomWork=25; timerState.pomBreak=5; }
  else if(mode === '50/10'){ timerState.pomWork=50; timerState.pomBreak=10; }
  else { timerState.pomWork=+qs('#workMin').value || 25; timerState.pomBreak=+qs('#breakMin').value || 5; }
}
function startPomodoro(){ syncPomMode(); timerState.pomodoroRunning=true; if(!timerState.pomRemaining) timerState.pomRemaining=timerState.pomWork*60; }
function pausePomodoro(){ timerState.pomodoroRunning=false; }
function resetPomodoro(){ timerState.pomodoroRunning=false; timerState.pomPhase='work'; timerState.pomRemaining=timerState.pomWork*60; updatePomodoroUI(); }
function skipPomodoro(){ timerState.pomPhase = timerState.pomPhase==='work' ? 'break' : 'work'; timerState.pomRemaining = (timerState.pomPhase==='work' ? timerState.pomWork : timerState.pomBreak)*60; updatePomodoroUI(); }
function updatePomodoroUI(){
  const total = (timerState.pomPhase === 'work' ? timerState.pomWork : timerState.pomBreak) * 60;
  qs('#pomText').textContent = formatMs(timerState.pomRemaining*1000).slice(3);
  const pct = total ? ((total - timerState.pomRemaining)/total)*100 : 0;
  qs('#pomBar').style.width = `${Math.max(0,Math.min(100,pct))}%`;
}

function tickTimer(){
  if(timerState.stopwatchRunning){ timerState.stopwatchElapsed = Date.now() - timerState.stopwatchStart; updateStopwatchUI(); }
  if(timerState.countdownRunning){
    timerState.countdownMs -= 200;
    if(timerState.countdownMs <= 0){ timerState.countdownMs = 0; timerState.countdownRunning = false; if(navigator.vibrate) navigator.vibrate(200); }
    updateCountdownUI();
  }
  if(timerState.pomodoroRunning){
    timerState.pomRemaining -= .2;
    if(timerState.pomRemaining <= 0){
      const key = 'scp_pomodoroSessions';
      const sessions = +(localStorage.getItem(key) || '0') + (timerState.pomPhase === 'work' ? 1 : 0);
      if(timerState.pomPhase === 'work') localStorage.setItem(key, sessions);
      timerState.pomPhase = timerState.pomPhase === 'work' ? 'break' : 'work';
      timerState.pomRemaining = (timerState.pomPhase === 'work' ? timerState.pomWork : timerState.pomBreak) * 60;
      if(navigator.vibrate) navigator.vibrate([150,60,150]);
      renderTimerView();
    } else updatePomodoroUI();
  }
}