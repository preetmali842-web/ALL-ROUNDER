function initTracker(){ renderTrackerView(); }
function ensureStudy(){
  const s = JSON.parse(localStorage.getItem('scp_study') || '{}');
  s.subjects ||= { Physics:0, Chemistry:0, Mathematics:0, English:0, Biology:0 };
  s.dailyHours ||= 0;
  s.weekly ||= {};
  s.monthly ||= {};
  localStorage.setItem('scp_study', JSON.stringify(s));
  return s;
}
function renderTrackerView(){
  const s = ensureStudy();
  const subjects = Object.keys(s.subjects);
  const root = qs('#view-tracker');
  root.innerHTML = `
    <div class="view-panel">
      <div class="glass section-card">
        <div class="section-head"><h3>Add Study Time</h3><span>Track by subject</span></div>
        <div class="row two">
          <select id="subjectSelect">
            ${subjects.map(x=>`<option>${x}</option>`).join('')}
          </select>
          <input class="input" id="studyMins" type="number" min="1" placeholder="Minutes studied">
        </div>
        <button class="action-btn" id="addStudyBtn" style="margin-top:12px">Add Study Session</button>
      </div>
      <div class="glass section-card">
        <div class="section-head"><h3>Subject Report</h3><span>Weekly and monthly</span></div>
        <div class="grid" id="subjectReport" style="gap:10px"></div>
      </div>
    </div>
  `;
  qs('#addStudyBtn').onclick = addStudy;
  drawTracker();
}
function addStudy(){
  const subject = qs('#subjectSelect').value;
  const mins = +qs('#studyMins').value;
  if(!mins) return;
  const s = ensureStudy();
  s.subjects[subject] = (s.subjects[subject] || 0) + mins/60;
  s.dailyHours = (s.dailyHours || 0) + mins/60;
  const now = new Date();
  const day = now.toISOString().slice(0,10);
  const month = now.toISOString().slice(0,7);
  s.weekly[day] = (s.weekly[day] || 0) + mins/60;
  s.monthly[month] = (s.monthly[month] || 0) + mins/60;
  localStorage.setItem('scp_study', JSON.stringify(s));
  qs('#studyMins').value = '';
  drawTracker();
}
function drawTracker(){
  const s = ensureStudy();
  const total = Object.values(s.subjects).reduce((a,b)=>a+b,0) || 1;
  qs('#subjectReport').innerHTML = Object.entries(s.subjects).map(([sub, hrs]) => `
    <div class="progress-mini">
      <div>${sub}</div>
      <strong>${hrs.toFixed(1)}h</strong>
      <div class="progress-bar" style="margin-top:8px"><div style="width:${(hrs/total)*100}%"></div></div>
    </div>
  `).join('');
  if(typeof updateDashboardStats === 'function') updateDashboardStats();
}