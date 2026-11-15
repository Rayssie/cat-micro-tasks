// 內建 3 款 8-bit 像素橘貓 SVG（睡覺、工作、慶祝）
// 內建 3 款 8-bit 像素橘貓 SVG（已更新為聖誕節限定版）
const CAT_SVGS = {
  sleep: `
    <svg viewBox="0 0 16 16" width="72" height="72" shape-rendering="crispEdges">
      <!-- 聖誕帽 -->
      <rect x="5" y="3" width="6" height="1" fill="#FFFFFF"/>
      <rect x="6" y="1" width="4" height="2" fill="#D62828"/>
      <rect x="10" y="1" width="1" height="1" fill="#D62828"/>
      <rect x="11" y="1" width="2" height="2" fill="#FFFFFF"/>
      <!-- 貓咪本體 -->
      <rect x="3" y="6" width="10" height="7" fill="#FF9F1C"/>
      <rect x="3" y="4" width="2" height="2" fill="#FF9F1C"/>
      <rect x="11" y="4" width="2" height="2" fill="#FF9F1C"/>
      <rect x="5" y="9" width="2" height="1" fill="#2C2C2C"/>
      <rect x="9" y="9" width="2" height="1" fill="#2C2C2C"/>
      <rect x="7" y="10" width="2" height="1" fill="#FF6B6B"/>
      <!-- 睡覺的 Zzz -->
      <rect x="12" y="2" width="3" height="1" fill="#2EC4B6"/>
      <rect x="13" y="3" width="1" height="1" fill="#2EC4B6"/>
      <rect x="12" y="4" width="3" height="1" fill="#2EC4B6"/>
    </svg>`,
  work: `
    <svg viewBox="0 0 16 16" width="72" height="72" shape-rendering="crispEdges">
      <!-- 聖誕帽 (配合站姿往上移 1 單位) -->
      <rect x="5" y="2" width="6" height="1" fill="#FFFFFF"/>
      <rect x="6" y="0" width="4" height="2" fill="#D62828"/>
      <rect x="10" y="0" width="1" height="1" fill="#D62828"/>
      <rect x="11" y="0" width="2" height="2" fill="#FFFFFF"/>
      <!-- 貓咪本體 -->
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
      <!-- 聖誕帽 (取代原本的綠色三角帽) -->
      <rect x="5" y="3" width="6" height="1" fill="#FFFFFF"/>
      <rect x="6" y="1" width="4" height="2" fill="#D62828"/>
      <rect x="10" y="1" width="1" height="1" fill="#D62828"/>
      <rect x="11" y="1" width="2" height="2" fill="#FFFFFF"/>
      <!-- 貓咪本體 -->
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

let currentTask = null;
let currentStepIndex = 0;

// DOM 元素綁定
const lobbyView = document.getElementById('lobby-view');
const questView = document.getElementById('quest-view');
const taskGrid = document.getElementById('task-grid');
const lobbyCatAvatar = document.getElementById('lobby-cat-avatar');
const questCatAvatar = document.getElementById('quest-cat-avatar');

// 初始化首頁
async function initApp() {
  lobbyCatAvatar.innerHTML = CAT_SVGS.sleep;
  try {
    const res = await fetch('data/manifest.json');
    const manifest = await res.json();
    renderLobbyCards(manifest.tasks);
  } catch (err) {
    taskGrid.innerHTML = `<p>讀取任務清單失敗，請確認是否使用 Local Server 開啟網頁喵！</p>`;
    console.error(err);
  }
}

// 渲染大廳任務卡片
function renderLobbyCards(tasks) {
  taskGrid.innerHTML = '';
  tasks.forEach(item => {
    const card = document.createElement('div');
    card.className = 'task-card';
    card.innerHTML = `
      <div>
        <div class="card-top">
          <span class="badge">${item.category}</span>
          <span class="difficulty">${item.difficulty}</span>
        </div>
        <h3 class="card-title">${item.title}</h3>
      </div>
      <p class="card-start-hint">▶ 點擊拆解任務</p>
    `;
    card.addEventListener('click', () => startQuest(item.id));
    taskGrid.appendChild(card);
  });
}

// 載入單一任務 JSON 並進入關卡
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

// 渲染當前微任務步驟
function renderCurrentStep() {
  const step = currentTask.steps[currentStepIndex];
  const total = currentTask.steps.length;

  // 顯示步驟區、隱藏破關區
  document.getElementById('step-card').classList.remove('hidden');
  document.getElementById('complete-step-btn').classList.remove('hidden');
  document.getElementById('victory-card').classList.add('hidden');
  document.getElementById('finish-quest-btn').classList.add('hidden');

  // 更新貓咪圖示與台詞
  questCatAvatar.innerHTML = currentStepIndex === 0 ? CAT_SVGS.sleep : CAT_SVGS.work;
  document.getElementById('cat-speech').textContent = `「${currentTask.cat_intro}」`;

  // 更新進度條
  const percent = ((currentStepIndex) / total) * 100;
  document.getElementById('progress-fill').style.width = `${Math.max(percent, 10)}%`;
  document.getElementById('progress-text').textContent = `STEP ${step.step_number} / ${total}`;

  // 更新步驟內容
  document.getElementById('step-badge').textContent = `STEP ${step.step_number}`;
  document.getElementById('step-timer').textContent = `⏱ 只要 ${step.duration_mins} 分鐘`;
  document.getElementById('step-action').textContent = step.action;
  document.getElementById('step-tip').textContent = `💡 貓咪提示：${step.cat_tip}`;
}

// 點擊「我做完了！下一步」
document.getElementById('complete-step-btn').addEventListener('click', () => {
  currentStepIndex++;
  if (currentStepIndex < currentTask.steps.length) {
    renderCurrentStep();
  } else {
    renderVictory();
  }
});

// 渲染破關畫面
function renderVictory() {
  questCatAvatar.innerHTML = CAT_SVGS.party;
  document.getElementById('cat-speech').textContent = `「${currentTask.cat_outro}」`;
  document.getElementById('progress-fill').style.width = '100%';
  document.getElementById('progress-text').textContent = 'CLEAR! 5 / 5';

  document.getElementById('step-card').classList.add('hidden');
  document.getElementById('complete-step-btn').classList.add('hidden');
  document.getElementById('victory-card').classList.remove('hidden');
  document.getElementById('finish-quest-btn').classList.remove('hidden');
}

// 返回大廳按鈕
function backToLobby() {
  questView.classList.add('hidden');
  lobbyView.classList.remove('hidden');
}

document.getElementById('back-btn').addEventListener('click', backToLobby);
document.getElementById('finish-quest-btn').addEventListener('click', backToLobby);

// 啟動應用
initApp();
