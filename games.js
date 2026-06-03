let gamesState = {};

function initGames() {
  renderGamesView();
}

function renderGamesView() {
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

function handleGameChoice(e) {
  const game = e.target.dataset.game;
  if (game) loadGame(game);
  if (e.target.id === 'closeGame') qs('#gameHost').innerHTML = '<div class="muted">Select a game to play.</div>';
}

function loadGame(game) {
  const host = qs('#gameHost');

  if (game === 'snake') {
    host.innerHTML = `
      <div class="section-head"><h3>Snake</h3><span>Swipe or arrow keys</span></div>
      <div class="muted">Score: <span id="snakeScore">0</span> | High: <span id="snakeHigh">${localStorage.getItem('scp_snakeHigh') || 0}</span></div>
      <canvas id="snakeCanvas" width="320" height="320" style="width:100%;max-width:420px;background:linear-gradient(180deg,rgba(255,255,255,.08),rgba(255,255,255,.03));border-radius:22px;margin-top:12px;border:1px solid rgba(255,255,255,.1)"></canvas>
      <div class="row two" style="margin-top:12px">
        <button class="action-btn" id="snakeStart">Start</button>
        <button class="action-btn secondary" id="snakeRestart">Restart</button>
      </div>
    `;
    initSnake();
    return;
  }

  if (game === 'flappy') {
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
    return;
  }

  if (game === 'tictactoe') {
    host.innerHTML = `
      <div class="section-head"><h3>Tic Tac Toe</h3><span>Player vs Player / Computer</span></div>
      <div class="row two">
        <select id="tttMode">
          <option value="pvp">Player vs Player</option>
          <option value="cpu">Player vs Computer</option>
        </select>
        <button class="action-btn secondary" id="tttReset">Reset</button>
      </div>
      <div class="muted" style="margin:10px 0">Score: X <span id="xScore">0</span> | O <span id="oScore">0</span> | Draw <span id="dScore">0</span></div>
      <div class="game-board tictactoe" id="tttBoard"></div>
    `;
    gamesState.ttt = { board: Array(9).fill(''), turn: 'X', score: { X: 0, O: 0, D: 0 }, mode: 'pvp' };
    drawTTT();
    qs('#tttReset').onclick = () => {
      gamesState.ttt.board = Array(9).fill('');
      gamesState.ttt.turn = 'X';
      drawTTT();
    };
    qs('#tttMode').onchange = () => {
      gamesState.ttt.mode = qs('#tttMode').value;
    };
    return;
  }

  if (game === 'memory') {
    const items = ['🍎', '🚀', '📘', '⭐', '🎯', '🎵', '🔥', '🌙'];
    const deck = [...items, ...items].sort(() => Math.random() - 0.5);
    gamesState.memory = { deck, open: [], matched: [], moves: 0, start: Date.now(), timer: null };

    host.innerHTML = `
      <div class="section-head"><h3>Memory Match</h3><span>Moves: <span id="memMoves">0</span> | Time: <span id="memTime">0</span>s</span></div>
      <div class="game-board memory-grid" id="memoryBoard"></div>
    `;
    drawMemory();
    clearInterval(gamesState.memory.timer);
    gamesState.memory.timer = setInterval(() => {
      const el = qs('#memTime');
      if (el) el.textContent = Math.floor((Date.now() - gamesState.memory.start) / 1000);
    }, 1000);
    return;
  }

  if (game === 'rps') {
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
    gamesState.rps = { user: 0, ai: 0 };
    return;
  }
}

function drawTTT() {
  const b = gamesState.ttt.board;
  qs('#tttBoard').innerHTML = b.map((v, i) => `<button class="ttt-cell" data-ttt="${i}">${v}</button>`).join('');
  qs('#xScore').textContent = gamesState.ttt.score.X;
  qs('#oScore').textContent = gamesState.ttt.score.O;
  qs('#dScore').textContent = gamesState.ttt.score.D;
  qs('#tttBoard').onclick = tttMove;
}

function tttMove(e) {
  const i = e.target.dataset.ttt;
  if (i == null || gamesState.ttt.board[i]) return;

  gamesState.ttt.board[i] = gamesState.ttt.turn;

  const win = checkWin(gamesState.ttt.board);
  if (win) {
    gamesState.ttt.score[win]++;
    drawTTT();
    setTimeout(resetTTT, 500);
    return;
  }

  if (gamesState.ttt.board.every(Boolean)) {
    gamesState.ttt.score.D++;
    drawTTT();
    setTimeout(resetTTT, 500);
    return;
  }

  gamesState.ttt.turn = gamesState.ttt.turn === 'X' ? 'O' : 'X';

  if (gamesState.ttt.mode === 'cpu' && gamesState.ttt.turn === 'O') {
    setTimeout(cpuMove, 260);
  }

  drawTTT();
}

function cpuMove() {
  const free = gamesState.ttt.board.map((v, i) => v ? null : i).filter(v => v != null);
  if (!free.length) return;

  const idx = free[Math.floor(Math.random() * free.length)];
  gamesState.ttt.board[idx] = 'O';

  const win = checkWin(gamesState.ttt.board);
  if (win) {
    gamesState.ttt.score[win]++;
    drawTTT();
    setTimeout(resetTTT, 500);
    return;
  }

  if (gamesState.ttt.board.every(Boolean)) {
    gamesState.ttt.score.D++;
    drawTTT();
    setTimeout(resetTTT, 500);
    return;
  }

  gamesState.ttt.turn = 'X';
  drawTTT();
}

function resetTTT() {
  gamesState.ttt.board = Array(9).fill('');
  gamesState.ttt.turn = 'X';
  drawTTT();
}

function checkWin(b) {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ];
  for (const [a, c, d] of lines) {
    if (b[a] && b[a] === b[c] && b[a] === b[d]) return b[a];
  }
  return null;
}

function drawMemory() {
  const d = gamesState.memory.deck;
  qs('#memoryBoard').innerHTML = d.map((x, i) => {
    const open = gamesState.memory.open.includes(i);
    const matched = gamesState.memory.matched.includes(i);
    return `
      <button class="mem-card ${open || matched ? 'flipped' : ''}" data-mem="${i}">
        <span>${open || matched ? x : '❓'}</span>
      </button>
    `;
  }).join('');

  qs('#memMoves').textContent = gamesState.memory.moves;
  qs('#memoryBoard').onclick = memFlip;
}

function memFlip(e) {
  const i = +e.target.closest('[data-mem]')?.dataset.mem;
  if (Number.isNaN(i) || gamesState.memory.open.includes(i) || gamesState.memory.matched.includes(i)) return;

  gamesState.memory.open.push(i);

  if (gamesState.memory.open.length === 2) {
    gamesState.memory.moves++;
    const [a, b] = gamesState.memory.open;

    if (gamesState.memory.deck[a] === gamesState.memory.deck[b]) {
      gamesState.memory.matched.push(a, b);
      gamesState.memory.open = [];
    } else {
      setTimeout(() => {
        gamesState.memory.open = [];
        drawMemory();
      }, 550);
    }
  }

  if (gamesState.memory.matched.length === gamesState.memory.deck.length) {
    clearInterval(gamesState.memory.timer);
  }

  drawMemory();
}

function initSnake() {
  const c = qs('#snakeCanvas');
  const ctx = c.getContext('2d');
  const cell = 20;
  const grid = 16;
  const boardSize = cell * grid;
  c.width = boardSize;
  c.height = boardSize;

  let loop;
  let dir = { x: 1, y: 0 };
  let snake = [{ x: 10, y: 10 }];
  let food = spawnFood();
  let score = 0;
  let running = false;
  let trail = [];

  const highKey = 'scp_snakeHigh';

  function spawnFood() {
    return {
      x: Math.floor(Math.random() * grid),
      y: Math.floor(Math.random() * grid)
    };
  }

  function drawGrid() {
    ctx.clearRect(0, 0, boardSize, boardSize);

    const bg = ctx.createLinearGradient(0, 0, 0, boardSize);
    bg.addColorStop(0, '#0b1220');
    bg.addColorStop(1, '#111a2c');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, boardSize, boardSize);

    for (let i = 0; i < grid; i++) {
      for (let j = 0; j < grid; j++) {
        ctx.fillStyle = (i + j) % 2 === 0 ? 'rgba(255,255,255,0.035)' : 'rgba(255,255,255,0.02)';
        ctx.fillRect(i * cell, j * cell, cell, cell);
      }
    }
  }

  function drawFood() {
    const x = food.x * cell + cell / 2;
    const y = food.y * cell + cell / 2;
    const glow = ctx.createRadialGradient(x, y, 2, x, y, 11);
    glow.addColorStop(0, '#ff6b6b');
    glow.addColorStop(1, '#ef4444');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(x, y, 8, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(255,255,255,.55)';
    ctx.beginPath();
    ctx.arc(x - 3, y - 3, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawSnake() {
    snake.forEach((s, idx) => {
      const x = s.x * cell + 2;
      const y = s.y * cell + 2;
      const size = cell - 4;

      const grad = ctx.createLinearGradient(x, y, x + size, y + size);
      if (idx === 0) {
        grad.addColorStop(0, '#a7f3d0');
        grad.addColorStop(1, '#22c55e');
      } else {
        grad.addColorStop(0, '#34d399');
        grad.addColorStop(1, '#15803d');
      }

      ctx.fillStyle = grad;
      roundRect(ctx, x, y, size, size, 6);
      ctx.fill();

      if (idx === 0) {
        ctx.fillStyle = '#0b1220';
        ctx.beginPath();
        ctx.arc(x + 6, y + 6, 1.6, 0, Math.PI * 2);
        ctx.arc(x + 10, y + 6, 1.6, 0, Math.PI * 2);
        ctx.fill();
      }
    });
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function draw() {
    drawGrid();
    drawFood();
    drawSnake();
  }

  function stop() {
    running = false;
    clearInterval(loop);
    const high = Math.max(score, +(localStorage.getItem(highKey) || 0));
    localStorage.setItem(highKey, high);
    qs('#snakeHigh').textContent = high;
  }

  function tick() {
    const head = {
      x: snake[0].x + dir.x,
      y: snake[0].y + dir.y
    };

    if (
      head.x < 0 || head.y < 0 ||
      head.x >= grid || head.y >= grid ||
      snake.some(s => s.x === head.x && s.y === head.y)
    ) {
      stop();
      return;
    }

    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
      score++;
      qs('#snakeScore').textContent = score;
      food = spawnFood();
      if (navigator.vibrate) navigator.vibrate(40);
    } else {
      snake.pop();
    }

    draw();
  }

  function start() {
    if (running) return;
    running = true;
    loop = setInterval(tick, 140);
  }

  qs('#snakeStart').onclick = start;
  qs('#snakeRestart').onclick = () => {
    clearInterval(loop);
    running = false;
    dir = { x: 1, y: 0 };
    snake = [{ x: 10, y: 10 }];
    food = spawnFood();
    score = 0;
    qs('#snakeScore').textContent = 0;
    draw();
  };

  window.addEventListener('keydown', e => {
    if (e.key === 'ArrowUp' && dir.y !== 1) dir = { x: 0, y: -1 };
    if (e.key === 'ArrowDown' && dir.y !== -1) dir = { x: 0, y: 1 };
    if (e.key === 'ArrowLeft' && dir.x !== 1) dir = { x: -1, y: 0 };
    if (e.key === 'ArrowRight' && dir.x !== -1) dir = { x: 1, y: 0 };
  });

  c.addEventListener('touchstart', touchSwipe(c, d => {
    if (d === 'up' && dir.y !== 1) dir = { x: 0, y: -1 };
    if (d === 'down' && dir.y !== -1) dir = { x: 0, y: 1 };
    if (d === 'left' && dir.x !== 1) dir = { x: -1, y: 0 };
    if (d === 'right' && dir.x !== -1) dir = { x: 1, y: 0 };
    start();
  }));

  draw();
}

function initFlappy() {
  const c = qs('#flappyCanvas');
  const ctx = c.getContext('2d');
  let y = 200, vy = 0, pipes = [], score = 0, running = false, loop;

  const highKey = 'scp_flappyHigh';

  const reset = () => {
    y = 200;
    vy = 0;
    pipes = [];
    score = 0;
    qs('#flappyScore').textContent = 0;
    draw();
  };

  const draw = () => {
    ctx.clearRect(0, 0, 320, 420);

    const sky = ctx.createLinearGradient(0, 0, 0, 420);
    sky.addColorStop(0, '#0f172a');
    sky.addColorStop(1, '#1e293b');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, 320, 420);

    ctx.fillStyle = 'rgba(255,255,255,.08)';
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.arc(40 + i * 55, 70 + (i % 2) * 15, 18, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(70, y, 14, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(76, y - 4, 3, 0, Math.PI * 2);
    ctx.fill();

    pipes.forEach(p => {
      const topGrad = ctx.createLinearGradient(p.x, 0, p.x + 40, 0);
      topGrad.addColorStop(0, '#34d399');
      topGrad.addColorStop(1, '#16a34a');
      ctx.fillStyle = topGrad;
      ctx.fillRect(p.x, 0, 40, p.gap);

      ctx.fillStyle = topGrad;
      ctx.fillRect(p.x, p.gap + 120, 40, 420);

      ctx.fillStyle = 'rgba(255,255,255,.2)';
      ctx.fillRect(p.x + 6, 0, 6, p.gap);
      ctx.fillRect(p.x + 6, p.gap + 120, 6, 420);
    });
  };

  const tick = () => {
    vy += 0.55;
    y += vy;
    pipes.forEach(p => p.x -= 2.2);

    if (!pipes.length || pipes[pipes.length - 1].x < 210) {
      pipes.push({ x: 320, gap: 80 + Math.random() * 160, hit: false });
    }

    const p = pipes[0];
    if (p && p.x < 90 && p.x > 20) {
      if (y < p.gap || y > p.gap + 120) return stop();
    }

    if (p && p.x < 40 && !p.hit) {
      p.hit = true;
      score++;
      qs('#flappyScore').textContent = score;
    }

    if (y > 404 || y < 0) return stop();
    if (pipes[0] && pipes[0].x < -50) pipes.shift();

    draw();
  };

  function start() {
    if (running) return;
    running = true;
    loop = setInterval(tick, 30);
  }

  function stop() {
    running = false;
    clearInterval(loop);
    const high = Math.max(score, +(localStorage.getItem(highKey) || 0));
    localStorage.setItem(highKey, high);
    qs('#flappyHigh').textContent = high;
  }

  const flap = () => {
    vy = -7.5;
    start();
  };

  qs('#flappyStart').onclick = start;
  qs('#flappyRestart').onclick = () => {
    clearInterval(loop);
    running = false;
    reset();
  };

  c.addEventListener('click', flap);
  c.addEventListener('touchstart', e => {
    e.preventDefault();
    flap();
  }, { passive: false });

  draw();
}

function touchSwipe(el, cb) {
  let sx = 0, sy = 0;
  el.addEventListener('touchstart', e => {
    sx = e.touches[0].clientX;
    sy = e.touches[0].clientY;
  }, { passive: true });

  el.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - sx;
    const dy = e.changedTouches[0].clientY - sy;
    if (Math.abs(dx) > Math.abs(dy)) cb(dx > 0 ? 'right' : 'left');
    else cb(dy > 0 ? 'down' : 'up');
  }, { passive: true });
}

function handleRPS(choice) {
  const ai = ['rock', 'paper', 'scissors'][Math.floor(Math.random() * 3)];
  let result = 'Draw';

  if (choice !== ai) {
    if (
      (choice === 'rock' && ai === 'scissors') ||
      (choice === 'paper' && ai === 'rock') ||
      (choice === 'scissors' && ai === 'paper')
    ) {
      result = 'You win';
      gamesState.rps.user++;
    } else {
      result = 'AI wins';
      gamesState.rps.ai++;
    }
  }

  qs('#rpsUser').textContent = gamesState.rps.user;
  qs('#rpsAI').textContent = gamesState.rps.ai;
  qs('#rpsResult').textContent = `You: ${choice} | AI: ${ai} | ${result}`;
}

document.addEventListener('click', e => {
  if (e.target.dataset.rps) handleRPS(e.target.dataset.rps);
});
