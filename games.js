let gamesState = {};

function initGames(){ renderGamesView(); }
function renderGamesView(){
  const root = qs('#view-games');
  root.innerHTML = `
    <div class="view-panel">
      <div class="glass section-card">
        <div class="section-head"><h3>Game Center</h3><span>Take a smart break</span></div>
        <div class="row two">
          <button class="action-btn" data-game="flappy">Flappy Bird</button>
          <button class="action-btn" data-game="snake">Snake</button>
        </div>
        <div class="row two" style="margin-top:10px">
          <button class="action-btn" data-game="tictactoe">Tic Tac Toe</button>
          <button class="action-btn" data-game="memory">Memory Match</button>
        </div>
        <div class="row two" style="margin-top:10px">
          <button class="action-btn" data-game="rps">Rock Paper Scissors</button>
          <button class="action-btn secondary" id="closeGame">Close Game</button>
        </div>
      </div>
      <div id="gameHost" class="glass section-card">
        <div class="muted">Select a game to play.</div>
      </div>
    </div>
  `;
  qs('#view-games').onclick = handleGameChoice;
}
function handleGameChoice(e){
  const game = e.target.dataset.game;
  if(game) loadGame(game);
  if(e.target.id === 'closeGame') qs('#gameHost').innerHTML = '<div class="muted">Select a game to play.</div>';
}
function loadGame(game){
  const host = qs('#gameHost');
  if(game === 'tictactoe'){
    host.innerHTML = `
      <div class="section-head"><h3>Tic Tac Toe</h3><span>Player vs Player / Computer</span></div>
      <div class="row two">
        <select id="tttMode"><option value="pvp">Player vs Player</option><option value="cpu">Player vs Computer</option></select>
        <button class="action-btn secondary" id="tttReset">Reset</button>
      </div>
      <div class="muted" style="margin:10px 0">Score: X <span id="xScore">0</span> | O <span id="oScore">0</span> | Draw <span id="dScore">0</span></div>
      <div class="game-board tictactoe" id="tttBoard"></div>
    `;
    gamesState.ttt = { board:Array(9).fill(''), turn:'X', score:{X:0,O:0,D:0} };
    drawTTT();
    qs('#tttReset').onclick = () => { gamesState.ttt.board=Array(9).fill(''); gamesState.ttt.turn='X'; drawTTT(); };
    qs('#tttMode').onchange = ()=>{ gamesState.ttt.mode = qs('#tttMode').value; };
  }
  if(game === 'memory'){
    const items = ['🍎','🚀','📘','⭐','🎯','🎵','🔥','🌙'];
    const deck = [...items, ...items].sort(()=>Math.random()-.5);
    gamesState.memory = { deck, open:[], matched:[], moves:0, start:Date.now(), timer:null };
    host.innerHTML = `
      <div class="section-head"><h3>Memory Match</h3><span>Moves: <span id="memMoves">0</span> | Time: <span id="memTime">0</span>s</span></div>
      <div class="game-board memory-grid" id="memoryBoard"></div>
    `;
    drawMemory();
    clearInterval(gamesState.memory.timer);
    gamesState.memory.timer = setInterval(()=>{
      if(qs('#memTime')) qs('#memTime').textContent = Math.floor((Date.now()-gamesState.memory.start)/1000);
    },1000);
  }
  if(game === 'rps'){
    host.innerHTML = `
      <div class="section-head"><h3>Rock Paper Scissors</h3><span>Play against AI</span></div>
      <div class="row three">
        <button class="action-btn" data-rps="rock">Rock</button>
        <button class="action-btn" data-rps="paper">Paper</button>
        <button class="action-btn" data-rps="scissors">Scissors</button>
      </div>
      <div class="section-card" style="margin-top:12px">
        <div class="muted">Your score: <span id="rpsUser">0</span> | AI: <span id="rpsAI">0</span></div>
        <div id="rpsResult" style="margin-top:10px;font-weight:700"></div>
      </div>
    `;
    gamesState.rps = { user:0, ai:0 };
  }
  if(game === 'snake'){
    host.innerHTML = `
      <div class="section-head"><h3>Snake</h3><span>Swipe or arrow keys</span></div>
      <div class="muted">Score: <span id="snakeScore">0</span> | High: <span id="snakeHigh">${localStorage.getItem('scp_snakeHigh') || 0}</span></div>
      <canvas id="snakeCanvas" width="320" height="320" style="width:100%;max-width:420px;background:rgba(0,0,0,.22);border-radius:18px;margin-top:12px"></canvas>
      <div class="row two" style="margin-top:12px">
        <button class="action-btn" id="snakeStart">Start</button>
        <button class="action-btn secondary" id="snakeRestart">Restart</button>
      </div>
    `;
    initSnake();
  }
  if(game === 'flappy'){
    host.innerHTML = `
      <div class="section-head"><h3>Flappy Bird</h3><span>Tap to fly</span></div>
      <div class="muted">Score: <span id="flappyScore">0</span> | High: <span id="flappyHigh">${localStorage.getItem('scp_flappyHigh') || 0}</span></div>
      <canvas id="flappyCanvas" width="320" height="420" style="width:100%;max-width:420px;background:rgba(0,0,0,.22);border-radius:18px;margin-top:12px"></canvas>
      <div class="row two" style="margin-top:12px">
        <button class="action-btn" id="flappyStart">Start</button>
        <button class="action-btn secondary" id="flappyRestart">Restart</button>
      </div>
    `;
    initFlappy();
  }
}
function drawTTT(){
  const b = gamesState.ttt.board;
  qs('#tttBoard').innerHTML = b.map((v,i)=>`<button class="ttt-cell" data-ttt="${i}">${v}</button>`).join('');
  qs('#xScore').textContent = gamesState.ttt.score.X;
  qs('#oScore').textContent = gamesState.ttt.score.O;
  qs('#dScore').textContent = gamesState.ttt.score.D;
  qs('#tttBoard').onclick = tttMove;
}
function tttMove(e){
  const i = e.target.dataset.ttt;
  if(i == null || gamesState.ttt.board[i]) return;
  gamesState.ttt.board[i] = gamesState.ttt.turn;
  const win = checkWin(gamesState.ttt.board);
  if(win){
    gamesState.ttt.score[win]++; drawTTT(); setTimeout(resetTTT, 400); return;
  }
  if(gamesState.ttt.board.every(Boolean)){ gamesState.ttt.score.D++; drawTTT(); setTimeout(resetTTT, 400); return; }
  gamesState.ttt.turn = gamesState.ttt.turn === 'X' ? 'O' : 'X';
  if(gamesState.ttt.mode === 'cpu' && gamesState.ttt.turn === 'O') setTimeout(cpuMove, 260);
  drawTTT();
}
function cpuMove(){
  const free = gamesState.ttt.board.map((v,i)=>v?null:i).filter(v=>v!=null);
  const idx = free[Math.floor(Math.random()*free.length)];
  gamesState.ttt.board[idx] = 'O';
  const win = checkWin(gamesState.ttt.board);
  if(win){ gamesState.ttt.score[win]++; drawTTT(); setTimeout(resetTTT, 400); return; }
  if(gamesState.ttt.board.every(Boolean)){ gamesState.ttt.score.D++; drawTTT(); setTimeout(resetTTT, 400); return; }
  gamesState.ttt.turn='X'; drawTTT();
}
function resetTTT(){ gamesState.ttt.board=Array(9).fill(''); gamesState.ttt.turn='X'; drawTTT(); }
function checkWin(b){
  const lines=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  for(const l of lines){ const [a,c,d]=l; if(b[a] && b[a]===b[c] && b[a]===b[d]) return b[a]; }
  return null;
}
function drawMemory(){
  const d = gamesState.memory.deck;
  qs('#memoryBoard').innerHTML = d.map((x,i)=>`<button class="mem-card ${gamesState.memory.open.includes(i)||gamesState.memory.matched.includes(i)?'flipped':''}" data-mem="${i}">${gamesState.memory.open.includes(i)||gamesState.memory.matched.includes(i)?x:'?'}</button>`).join('');
  qs('#memMoves').textContent = gamesState.memory.moves;
  qs('#memoryBoard').onclick = memFlip;
}
function memFlip(e){
  const i = +e.target.dataset.mem;
  if(Number.isNaN(i) || gamesState.memory.open.includes(i) || gamesState.memory.matched.includes(i)) return;
  gamesState.memory.open.push(i);
  if(gamesState.memory.open.length === 2){
    gamesState.memory.moves++;
    const [a,b] = gamesState.memory.open;
    if(gamesState.memory.deck[a] === gamesState.memory.deck[b]){
      gamesState.memory.matched.push(a,b);
      gamesState.memory.open = [];
    } else {
      setTimeout(()=>{ gamesState.memory.open = []; drawMemory(); }, 500);
    }
  }
  if(gamesState.memory.matched.length === gamesState.memory.deck.length){
    clearInterval(gamesState.memory.timer);
  }
  drawMemory();
}
function initSnake(){
  const c = qs('#snakeCanvas'), ctx = c.getContext('2d'); let loop, dir={x:1,y:0}, snake=[{x:10,y:10}], food={x:15,y:15}, score=0, running=false;
  const highKey='scp_snakeHigh';
  const draw = ()=>{
    ctx.clearRect(0,0,320,320); ctx.fillStyle='rgba(255,255,255,.08)'; for(let i=0;i<16;i++) for(let j=0;j<16;j++) ctx.fillRect(i*20+1,j*20+1,18,18);
    ctx.fillStyle='#22c55e'; snake.forEach(s=>ctx.fillRect(s.x*20+2,s.y*20+2,16,16));
    ctx.fillStyle='#ef4444'; ctx.fillRect(food.x*20+2,food.y*20+2,16,16);
  };
  const tick = ()=>{
    const head={x:snake[0].x+dir.x,y:snake[0].y+dir.y};
    if(head.x<0||head.y<0||head.x>15||head.y>15||snake.some(s=>s.x===head.x&&s.y===head.y)) return stop();
    snake.unshift(head);
    if(head.x===food.x&&head.y===food.y){ score++; qs('#snakeScore').textContent=score; food={x:Math.floor(Math.random()*16),y:Math.floor(Math.random()*16)}; }
    else snake.pop();
    draw();
  };
  function start(){ if(running) return; running=true; loop=setInterval(tick,140); }
  function stop(){ running=false; clearInterval(loop); localStorage.setItem(highKey, Math.max(score, +(localStorage.getItem(highKey)||0))); qs('#snakeHigh').textContent=localStorage.getItem(highKey); }
  qs('#snakeStart').onclick=start; qs('#snakeRestart').onclick=()=>{ clearInterval(loop); running=false; dir={x:1,y:0}; snake=[{x:10,y:10}]; food={x:15,y:15}; score=0; qs('#snakeScore').textContent=0; draw(); };
  window.addEventListener('keydown', e=>{ if(e.key==='ArrowUp'&&dir.y!==1) dir={x:0,y:-1}; if(e.key==='ArrowDown'&&dir.y!==-1) dir={x:0,y:1}; if(e.key==='ArrowLeft'&&dir.x!==1) dir={x:-1,y:0}; if(e.key==='ArrowRight'&&dir.x!==-1) dir={x:1,y:0}; });
  c.addEventListener('touchstart', touchSwipe(c, d=>{ if(d==='up'&&dir.y!==1) dir={x:0,y:-1}; if(d==='down'&&dir.y!==-1) dir={x:0,y:1}; if(d==='left'&&dir.x!==1) dir={x:-1,y:0}; if(d==='right'&&dir.x!==-1) dir={x:1,y:0}; start(); }));
  draw();
}
function initFlappy(){
  const c = qs('#flappyCanvas'), ctx = c.getContext('2d'); let y=200, vy=0, pipes=[], score=0, running=false, loop;
  const highKey='scp_flappyHigh';
  const reset = ()=>{ y=200; vy=0; pipes=[]; score=0; qs('#flappyScore').textContent=0; draw(); };
  const draw = ()=>{
    ctx.clearRect(0,0,320,420); ctx.fillStyle='rgba(255,255,255,.08)'; ctx.fillRect(0,0,320,420);
    ctx.fillStyle='#fbbf24'; ctx.beginPath(); ctx.arc(70,y,14,0,Math.PI*2); ctx.fill();
    pipes.forEach(p=>{ ctx.fillStyle='#22c55e'; ctx.fillRect(p.x,0,40,p.gap); ctx.fillRect(p.x,p.gap+120,40,420); });
  };
  const tick=()=>{
    vy+=.55; y+=vy; pipes.forEach(p=>p.x-=2.2);
    if(!pipes.length || pipes[pipes.length-1].x < 210) pipes.push({x:320,gap:80+Math.random()*160,hit:false});
    const p = pipes[0];
    if(p && p.x < 52 && p.x > 10){ if(y < p.gap || y > p.gap+120) return stop(); }
    if(p && p.x < 30 && !p.hit){ p.hit=true; score++; qs('#flappyScore').textContent=score; }
    if(y > 404 || y < 0) return stop();
    if(pipes[0] && pipes[0].x < -50) pipes.shift();
    draw();
  };
  function start(){ if(running) return; running=true; loop=setInterval(tick,30); }
  function stop(){ running=false; clearInterval(loop); localStorage.setItem(highKey, Math.max(score, +(localStorage.getItem(highKey)||0))); qs('#flappyHigh').textContent=localStorage.getItem(highKey); }
  const flap = ()=>{ vy = -7.5; start(); };
  qs('#flappyStart').onclick=start; qs('#flappyRestart').onclick=()=>{ clearInterval(loop); running=false; reset(); };
  c.addEventListener('click', flap);
  c.addEventListener('touchstart', e=>{ e.preventDefault(); flap(); }, {passive:false});
  draw();
}
function touchSwipe(el, cb){
  let sx=0, sy=0;
  el.addEventListener('touchstart', e=>{ sx=e.touches[0].clientX; sy=e.touches[0].clientY; }, {passive:true});
  el.addEventListener('touchend', e=>{ const dx=e.changedTouches[0].clientX-sx, dy=e.changedTouches[0].clientY-sy; if(Math.abs(dx)>Math.abs(dy)) cb(dx>0?'right':'left'); else cb(dy>0?'down':'up'); }, {passive:true});
}
function handleRPS(choice){
  const ai = ['rock','paper','scissors'][Math.floor(Math.random()*3)];
  let result = 'Draw';
  if(choice !== ai){
    if((choice==='rock'&&ai==='scissors')||(choice==='paper'&&ai==='rock')||(choice==='scissors'&&ai==='paper')){ result='You win'; gamesState.rps.user++; }
    else { result='AI wins'; gamesState.rps.ai++; }
  }
  qs('#rpsUser').textContent = gamesState.rps.user;
  qs('#rpsAI').textContent = gamesState.rps.ai;
  qs('#rpsResult').textContent = `You: ${choice} | AI: ${ai} | ${result}`;
}
document.addEventListener('click', e=>{ if(e.target.dataset.rps) handleRPS(e.target.dataset.rps); });