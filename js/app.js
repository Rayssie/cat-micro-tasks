const CAT_SVGS = {
  sleep: `
    <svg viewBox="0 0 16 16" width="72" height="72" shape-rendering="crispEdges">
      <rect x="5" y="3" width="6" height="1" fill="#FFFFFF"/>
      <rect x="6" y="1" width="4" height="2" fill="#D62828"/>
      <rect x="10" y="1" width="1" height="1" fill="#D62828"/>
      <rect x="11" y="1" width="2" height="2" fill="#FFFFFF"/>
      <rect x="3" y="6" width="10" height="7" fill="#FF9F1C"/>
      <rect x="3" y="4" width="2" height="2" fill="#FF9F1C"/>
      <rect x="11" y="4" width="2" height="2" fill="#FF9F1C"/>
      <rect x="5" y="9" width="2" height="1" fill="#2C2C2C"/>
      <rect x="9" y="9" width="2" height="1" fill="#2C2C2C"/>
      <rect x="7" y="10" width="2" height="1" fill="#FF6B6B"/>
      <rect x="12" y="2" width="3" height="1" fill="#2EC4B6"/>
      <rect x="13" y="3" width="1" height="1" fill="#2EC4B6"/>
      <rect x="12" y="4" width="3" height="1" fill="#2EC4B6"/>
    </svg>`,
  work: `
    <svg viewBox="0 0 16 16" width="72" height="72" shape-rendering="crispEdges">
      <rect x="5" y="2" width="6" height="1" fill="#FFFFFF"/>
      <rect x="6" y="0" width="4" height="2" fill="#D62828"/>
      <rect x="10" y="0" width="1" height="1" fill="#D62828"/>
      <rect x="11" y="0" width="2" height="2" fill="#FFFFFF"/>
      <rect x="3" y="5" width="10" height="8" fill="#FF9F1C"/>
      <rect x="3" y="3" width="2" height="2" fill="#FF9F1C"/>
      <rect x="11" y="3" width="2" height="2" fill="#FF9F1C"/>
      <rect x="5" y="7" width="2" height="2" fill="#2C2C2C"/>
      <rect x="9" y="7" width="2" height="2" fill="#2C2C2C"/>
      <rect x="7" y="9" width="2" height="1" fill="#FF6B6B"/>
      <rect x="2" y="12" width="3" height="2" fill="#FFFFFF"/>
      <rect x="11" y="12" width="3" height="2" fill="#FFFFFF"/>
    </svg>`,
  party: `
    <svg viewBox="0 0 16 16" width="72" height="72" shape-rendering="crispEdges">
      <rect x="5" y="3" width="6" height="1" fill="#FFFFFF"/>
      <rect x="6" y="1" width="4" height="2" fill="#D62828"/>
      <rect x="10" y="1" width="1" height="1" fill="#D62828"/>
      <rect x="11" y="1" width="2" height="2" fill="#FFFFFF"/>
      <rect x="3" y="6" width="10" height="7" fill="#FF9F1C"/>
      <rect x="3" y="4" width="2" height="2" fill="#FF9F1C"/>
      <rect x="11" y="4" width="2" height="2" fill="#FF9F1C"/>
      <rect x="5" y="8" width="2" height="1" fill="#2C2C2C"/>
      <rect x="9" y="8" width="2" height="1" fill="#2C2C2C"/>
      <rect x="7" y="10" width="2" height="2" fill="#FF6B6B"/>
      <rect x="1" y="7" width="2" height="3" fill="#FFBF69"/>
      <rect x="13" y="7" width="2" height="3" fill="#FFBF69"/>
    </svg>`
};

const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioContext();

function playSound(type) {
  if (audioCtx.state === 'suspended') audioCtx.resume();
  const now = audioCtx.currentTime;

  if (type === 'click') {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'square';
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.05);
    gain.gain.setValueAtTime(0.05, now);
    gain.gain.linearRampToValueAtTime(0, now + 0.05);
    osc.start(now);
    osc.stop(now + 0.05);
  } else if (type === 'step') {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'square';
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.setValueAtTime(600, now + 0.1);
    gain.gain.setValueAtTime(0.05, now);
    gain.gain.linearRampToValueAtTime(0, now + 0.2);
    osc.start(now);
    osc.stop(now + 0.2);
  } else if (type === 'victory') {
    [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'square';
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.05, now + i * 0.12);
      gain.gain.linearRampToValueAtTime(0, now + i * 0.12 + 0.1);
      osc.start(now + i * 0.12);
      osc.stop(now + i * 0.12 + 0.15);
    });
  }
}

let globalManifest = [];
let currentTask = null;
let currentStepIndex = 0;

const lobbyView = document.getElementById('lobby-view');
const questView = document.getElementById('quest-view');
const taskGrid = document.getElementById('task-grid');
const lobbyCatAvatar = document.getElementById('lobby-cat-avatar');
const questCatAvatar = document.getElementById('quest-cat-avatar');

async function initApp() {
  lobbyCatAvatar.innerHTML = CAT_SVGS.sleep;
  try {
    const res = await fetch('data/manifest.json');
    const manifest = await res.json();
    globalManifest = manifest.tasks;
    renderLobbyCards(globalManifest);
  } catch (err) {
    taskGrid.innerHTML = `<p>讀取 data/manifest.json 失敗喵！</p>`;
    console.error(err);
  }
}

function renderLobbyCards(tasks) {
  taskGrid.innerHTML = '';
  const completedTasks = JSON.parse(localStorage.getItem('catMicroTasksProgress') || '[]');

  tasks.forEach(item => {
    const card = document.createElement('div');
    card.className = 'task-card';

    const isCompleted = completedTasks.includes(item.id);
    const stampHtml = isCompleted ? `<div class="completed-stamp">CLEAR!</div>` : '';

    card.innerHTML = `
      <div>
        <div class="card-top">
          <span class="badge">${item.category}</span>
          <span class="difficulty">${item.difficulty}</span>
        </div>
        <h3 class="card-title">${item.title}</h3>
      </div>
      <p class="card-start-hint">▶ 點擊拆解任務</p>
      ${stampHtml}
    `;
    
    card.addEventListener('click', () => {
      playSound('click');
      startQuest(item.id);
    });
    taskGrid.appendChild(card);
  });
}

document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    playSound('click');
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');

    const category = e.target.getAttribute('data-category');
    if (category === 'all') {
      renderLobbyCards(globalManifest);
    } else {
      const filtered = globalManifest.filter(t => t.category === category);
      renderLobbyCards(filtered);
    }
  });
});

document.getElementById('random-task-btn')?.addEventListener('click', () => {
  playSound('click');
  if (globalManifest.length === 0) return;
  const randomTask = globalManifest[Math.floor(Math.random() * globalManifest.length)];
  startQuest(randomTask.id);
});

async function startQuest(taskId) {
  try {
    const res = await fetch(`data/${taskId}.json`);
    currentTask = await res.json();
    currentStepIndex = 0;

    lobbyView.classList.add('hidden');
    questView.classList.remove('hidden');

    document.getElementById('quest-title').textContent = currentTask.title;
    document.getElementById('quest-category').textContent = currentTask.category;

    renderCurrentStep();
  } catch (err) {
    alert(`找不到 data/${taskId}.json 檔案喵！`);
    console.error(err);
  }
}

function renderCurrentStep() {
  const step = currentTask.steps[currentStepIndex];
  const total = currentTask.steps.length;

  document.getElementById('step-card').classList.remove('hidden');
  document.getElementById('complete-step-btn').classList.remove('hidden');
  document.getElementById('victory-card').classList.add('hidden');
  document.getElementById('finish-quest-btn').classList.add('hidden');

  questCatAvatar.innerHTML = currentStepIndex === 0 ? CAT_SVGS.sleep : CAT_SVGS.work;
  document.getElementById('cat-speech').textContent = `「${currentTask.cat_intro}」`;

  const percent = ((currentStepIndex) / total) * 100;
  document.getElementById('progress-fill').style.width = `${Math.max(percent, 10)}%`;
  document.getElementById('progress-text').textContent = `STEP ${step.step_number} / ${total}`;

  document.getElementById('step-badge').textContent = `STEP ${step.step_number}`;
  document.getElementById('step-timer').textContent = `⏱ 只要 ${step.duration_mins} 分鐘`;
  document.getElementById('step-action').textContent = step.action;
  document.getElementById('step-tip').textContent = `💡 貓咪提示：${step.cat_tip}`;
}

document.getElementById('complete-step-btn').addEventListener('click', () => {
  currentStepIndex++;
  if (currentStepIndex < currentTask.steps.length) {
    playSound('step');
    renderCurrentStep();
  } else {
    playSound('victory');
    renderVictory();
  }
});

function renderVictory() {
  questCatAvatar.innerHTML = CAT_SVGS.party;
  document.getElementById('cat-speech').textContent = `「${currentTask.cat_outro}」`;
  document.getElementById('progress-fill').style.width = '100%';
  document.getElementById('progress-text').textContent = 'CLEAR! 5 / 5';

  document.getElementById('step-card').classList.add('hidden');
  document.getElementById('complete-step-btn').classList.add('hidden');
  document.getElementById('victory-card').classList.remove('hidden');
  document.getElementById('finish-quest-btn').classList.remove('hidden');

  const completedTasks = JSON.parse(localStorage.getItem('catMicroTasksProgress') || '[]');
  if (!completedTasks.includes(currentTask.id)) {
    completedTasks.push(currentTask.id);
    localStorage.setItem('catMicroTasksProgress', JSON.stringify(completedTasks));
  }
  
  renderLobbyCards(globalManifest);
}

function backToLobby() {
  lobbyView.classList.remove('hidden');
  questView.classList.add('hidden');
}

document.getElementById('back-btn').addEventListener('click', () => { 
  playSound('click'); 
  backToLobby(); 
});
document.getElementById('finish-quest-btn').addEventListener('click', () => { 
  playSound('click'); 
  backToLobby(); 
});

initApp();
