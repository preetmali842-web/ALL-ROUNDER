let calcState = { expr: '', history: [], sci: false };

function initCalculator() {
  const root = document.querySelector('#view-calculator');
  root.innerHTML = `
    <div class="view-panel">
      <div class="glass section-card">
        <div class="section-head">
          <h3>Calculator</h3>
          <button class="action-btn secondary" id="toggleSci">Scientific Mode</button>
        </div>

        <input class="calc-display" id="calcDisplay" value="0" readonly />

        <div class="row" style="margin-top:12px">
          <div class="row three">
            <button class="action-btn secondary" data-calc="(">(</button>
            <button class="action-btn secondary" data-calc=")">)</button>
            <button class="action-btn secondary" data-calc="%">%</button>
          </div>

          <div class="calc-grid" id="basicKeys"></div>
          <div class="calc-grid hidden" id="sciKeys"></div>
        </div>

        <div class="row two" style="margin-top:12px">
          <button class="action-btn secondary" id="clearCalc">Clear</button>
          <button class="action-btn" id="equalsCalc">=</button>
        </div>

        <div class="row two" style="margin-top:12px">
          <button class="action-btn secondary" id="copyAnswer">Copy Answer</button>
          <button class="action-btn secondary" id="clearHistory">Clear History</button>
        </div>
      </div>

      <div class="glass section-card">
        <div class="section-head">
          <h3>History</h3>
          <span>Tap to reuse</span>
        </div>
        <div class="calc-history" id="calcHistory"></div>
      </div>
    </div>
  `;

  const basic = ['7', '8', '9', '/', '4', '5', '6', '*', '1', '2', '3', '-', '0', '.', '00', '+'];
  document.getElementById('basicKeys').innerHTML = basic.map(k => `<button class="action-btn secondary" data-calc="${k}">${k}</button>`).join('');

  const sci = ['sin(', 'cos(', 'tan(', 'log(', 'ln(', 'sqrt(', '^', 'π', '!'];
  document.getElementById('sciKeys').innerHTML = sci.map(k => `<button class="action-btn secondary" data-calc="${k}">${k}</button>`).join('');

  bindCalculator();
  renderCalculator();
}

function renderCalculator() {
  const display = document.getElementById('calcDisplay');
  if (display) display.value = calcState.expr || '0';

  const history = JSON.parse(localStorage.getItem('scp_calcHistory') || '[]');
  calcState.history = history;

  const box = document.getElementById('calcHistory');
  if (box) {
    box.innerHTML = history.slice().reverse().map(item => `
      <div class="history-item">
        <span>${item.expr}</span>
        <strong>${item.result}</strong>
      </div>
    `).join('') || '<div class="muted">No calculations yet.</div>';
  }
}

function bindCalculator() {
  const root = document.getElementById('view-calculator');

  root.onclick = e => {
    const key = e.target.closest('[data-calc]')?.dataset.calc;
    if (!key) return;

    if (key === 'C') {
      calcState.expr = '';
      renderCalculator();
      return;
    }

    if (calcState.expr === '0' || calcState.expr === 'Error') calcState.expr = '';

    calcState.expr += key;
    renderCalculator();
  };

  document.getElementById('toggleSci').onclick = () => {
    document.getElementById('sciKeys').classList.toggle('hidden');
  };

  document.getElementById('clearCalc').onclick = () => {
    calcState.expr = '';
    renderCalculator();
  };

  document.getElementById('equalsCalc').onclick = () => {
    evaluateCalc();
  };

  document.getElementById('copyAnswer').onclick = async () => {
    const val = document.getElementById('calcDisplay').value;
    try {
      await navigator.clipboard.writeText(val);
    } catch (e) {}
  };

  document.getElementById('clearHistory').onclick = () => {
    localStorage.setItem('scp_calcHistory', '[]');
    renderCalculator();
  };
}

function factorial(n) {
  n = Number(n);
  if (!Number.isInteger(n) || n < 0) return NaN;
  let result = 1;
  for (let i = 2; i <= n; i++) result *= i;
  return result;
}

function safeEval(expr) {
  let x = String(expr)
    .replace(/÷/g, '/')
    .replace(/×/g, '*')
    .replace(/sqrt\(/g, 'Math.sqrt(')
    .replace(/π/g, 'Math.PI')
    .replace(/log\(/g, 'Math.log10(')
    .replace(/ln\(/g, 'Math.log(')
    .replace(/sin\(/g, 'Math.sin(')
    .replace(/cos\(/g, 'Math.cos(')
    .replace(/tan\(/g, 'Math.tan(')
    .replace(/(\d+)!/g, 'factorial($1)')
    .replace(/\^/g, '**');

  x = x.replace(/(\d+(?:\.\d+)?)%/g, '($1/100)');

  return Function('factorial', `return (${x})`)(factorial);
}

function evaluateCalc() {
  try {
    const result = safeEval(calcState.expr);
    if (!Number.isFinite(result)) throw new Error('Invalid result');

    const cleanResult = Number.isInteger(result)
      ? String(result)
      : String(Number(result.toFixed(10)));

    const entry = { expr: calcState.expr, result: cleanResult };
    const history = JSON.parse(localStorage.getItem('scp_calcHistory') || '[]');
    history.push(entry);
    localStorage.setItem('scp_calcHistory', JSON.stringify(history.slice(-50)));

    calcState.expr = cleanResult;
    renderCalculator();
  } catch (err) {
    calcState.expr = 'Error';
    renderCalculator();
    setTimeout(() => {
      calcState.expr = '';
      renderCalculator();
    }, 900);
  }
}