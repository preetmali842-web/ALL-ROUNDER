function initGoals(){ renderGoalsView(); }
function renderGoalsView(){
  const root = qs('#view-goals');
  root.innerHTML = `
    <div class="view-panel">
      <div class="glass section-card">
        <div class="section-head"><h3>Add Goal</h3><span>Auto-saves instantly</span></div>
        <div class="row two">
          <input class="input" id="goalText" placeholder="Enter your goal">
          <button class="action-btn" id="addGoalBtn">Add Goal</button>
        </div>
      </div>
      <div class="glass section-card">
        <div class="section-head"><h3>Goals</h3><span id="goalCount">0 total</span></div>
        <div class="progress-wrap">
          <div class="progress-info"><span>Completion</span><span id="goalPct">0%</span></div>
          <div class="progress-bar"><div id="goalBar"></div></div>
        </div>
        <div id="goalList" class="grid" style="gap:10px"></div>
      </div>
    </div>
  `;
  qs('#addGoalBtn').onclick = addGoal;
  qs('#goalText').addEventListener('keydown', e => { if(e.key === 'Enter') addGoal(); });
  drawGoals();
}
function addGoal(){
  const input = qs('#goalText');
  const text = input.value.trim();
  if(!text) return;
  const goals = JSON.parse(localStorage.getItem('scp_goals') || '[]');
  goals.push({ id: Date.now(), text, done:false, createdAt: Date.now() });
  localStorage.setItem('scp_goals', JSON.stringify(goals));
  input.value = '';
  drawGoals();
}
function drawGoals(){
  const goals = JSON.parse(localStorage.getItem('scp_goals') || '[]');
  const done = goals.filter(g=>g.done).length;
  qs('#goalCount').textContent = `${goals.length} total`;
  qs('#goalPct').textContent = `${goals.length ? Math.round(done/goals.length*100) : 0}%`;
  qs('#goalBar').style.width = `${goals.length ? done/goals.length*100 : 0}%`;
  qs('#goalList').innerHTML = goals.map(g => `
    <div class="goal-item glass section-card">
      <div style="display:flex;justify-content:space-between;gap:10px;align-items:flex-start">
        <label style="display:flex;gap:10px;align-items:flex-start">
          <input type="checkbox" ${g.done ? 'checked' : ''} data-goal-toggle="${g.id}">
          <div>
            <strong style="${g.done ? 'text-decoration:line-through;opacity:.7' : ''}">${g.text}</strong>
            <div class="goal-meta">${new Date(g.createdAt).toLocaleDateString()}</div>
          </div>
        </label>
        <div style="display:flex;gap:8px">
          <button class="action-btn secondary" data-goal-edit="${g.id}">Edit</button>
          <button class="action-btn danger" data-goal-del="${g.id}">Delete</button>
        </div>
      </div>
    </div>
  `).join('') || '<div class="muted">No goals yet. Add one to get started.</div>';
  qs('#view-goals').onclick = handleGoalActions;
  localStorage.setItem('scp_totalTasks', String(goals.filter(g => g.done).length));
  if(typeof updateDashboardStats === 'function') updateDashboardStats();
  if(typeof unlockAchievements === 'function') unlockAchievements();
}
function handleGoalActions(e){
  const t = e.target;
  if(t.matches('[data-goal-toggle]')){
    const goals = JSON.parse(localStorage.getItem('scp_goals') || '[]');
    const g = goals.find(x => String(x.id) === t.dataset.goalToggle);
    if(g) g.done = t.checked;
    localStorage.setItem('scp_goals', JSON.stringify(goals));
    drawGoals();
  }
  if(t.matches('[data-goal-del]')){
    let goals = JSON.parse(localStorage.getItem('scp_goals') || '[]');
    goals = goals.filter(x => String(x.id) !== t.dataset.goalDel);
    localStorage.setItem('scp_goals', JSON.stringify(goals));
    drawGoals();
  }
  if(t.matches('[data-goal-edit]')){
    const goals = JSON.parse(localStorage.getItem('scp_goals') || '[]');
    const g = goals.find(x => String(x.id) === t.dataset.goalEdit);
    const val = prompt('Edit goal', g?.text || '');
    if(val !== null && g){
      g.text = val.trim() || g.text;
      localStorage.setItem('scp_goals', JSON.stringify(goals));
      drawGoals();
    }
  }
}