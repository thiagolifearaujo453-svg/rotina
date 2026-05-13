/* ============================================================
   ROTINA - Daily Routine Tracker
   Pure JS, localStorage, Mobile-first
============================================================ */

// ========== STATE ==========
const STORAGE_KEY = 'rotina_v3';
let state = null;
let currentScreen = 'home';
let pomodoroInterval = null;
let pomodoroSeconds = 25 * 60;
let pomodoroRunning = false;
let pomodoroMode = 'work'; // work | short | long

const QUOTES = [
  'Você não precisa estar motivado. Precisa começar.',
  'Disciplina não é ser perfeito. É voltar rápido quando sai do eixo.',
  'Fecha o TikTok e abre sua vida.',
  'Hoje não precisa vencer o mundo. Só não abandona você mesmo.',
  'Boa, você não deixou o dia te atropelar.',
  'Cada dia que você se apresenta, mesmo com pouco, é uma vitória.',
  'O segredo é simples: apareça todo dia.',
  'Progresso, não perfeição.',
  'Você já fez coisas difíceis antes. Isso aqui é só mais uma.',
  'Construa hoje a versão de amanhã.',
];

const ACHIEVEMENTS = [
  { id: 'first_day', icon: '🌱', name: 'Primeira Rotina', desc: 'Completou seu primeiro dia', xp: 50 },
  { id: 'streak_3', icon: '🔥', name: 'Em Chamas', desc: '3 dias seguidos', xp: 75 },
  { id: 'streak_7', icon: '⚡', name: 'Semana Sólida', desc: '7 dias de streak', xp: 150 },
  { id: 'streak_30', icon: '💎', name: 'Inabalável', desc: '30 dias de streak', xp: 500 },
  { id: 'tasks_100', icon: '✅', name: 'Executor', desc: '100 tarefas concluídas', xp: 200 },
  { id: 'habits_50', icon: '🏆', name: 'Construtor', desc: '50 hábitos marcados', xp: 150 },
  { id: 'pomodoro_10', icon: '🍅', name: 'Foco Total', desc: '10 pomodoros completos', xp: 100 },
  { id: 'mental_7', icon: '🧠', name: 'Autoconsciência', desc: '7 diários mentais', xp: 100 },
  { id: 'perfect_day', icon: '⭐', name: 'Dia Perfeito', desc: 'Score 100 em um dia', xp: 200 },
  { id: 'early_bird', icon: '🌅', name: 'Madrugador', desc: 'Acordou antes das 6h', xp: 75 },
  { id: 'hydrated', icon: '💧', name: 'Bem Hidratado', desc: '8 copos em um dia', xp: 50 },
  { id: 'level_5', icon: '🚀', name: 'Nível 5', desc: 'Alcançou o nível 5', xp: 250 },
  { id: 'weekly_plan', icon: '📅', name: 'Planejador', desc: 'Completou plano semanal', xp: 100 },
];

const DEFAULT_HABITS = [
  { id: 'h1', emoji: '🌅', name: 'Acordar cedo', category: 'Saúde', importance: 'alta', streak: 0, lastChecked: null, checkedToday: false },
  { id: 'h2', emoji: '💧', name: 'Beber 2L de água', category: 'Saúde', importance: 'alta', streak: 0, lastChecked: null, checkedToday: false },
  { id: 'h3', emoji: '💪', name: 'Treinar', category: 'Treino', importance: 'alta', streak: 0, lastChecked: null, checkedToday: false },
  { id: 'h4', emoji: '📚', name: 'Estudar 2h', category: 'Estudos', importance: 'alta', streak: 0, lastChecked: null, checkedToday: false },
  { id: 'h5', emoji: '📖', name: 'Ler 10 páginas', category: 'Leitura', importance: 'media', streak: 0, lastChecked: null, checkedToday: false },
  { id: 'h6', emoji: '🌙', name: 'Dormir antes de meia-noite', category: 'Saúde', importance: 'alta', streak: 0, lastChecked: null, checkedToday: false },
  { id: 'h7', emoji: '🏠', name: 'Organizar o quarto', category: 'Organização', importance: 'media', streak: 0, lastChecked: null, checkedToday: false },
  { id: 'h8', emoji: '💰', name: 'Controlar gastos', category: 'Finanças', importance: 'media', streak: 0, lastChecked: null, checkedToday: false },
];

const DEFAULT_TASKS = [
  { id: 't1', name: 'Tomar água ao acordar', category: 'Saúde', status: 'pending' },
  { id: 't2', name: 'Fazer 30min de exercício', category: 'Treino', status: 'pending' },
  { id: 't3', name: 'Estudar por 1 hora', category: 'Estudos', status: 'pending' },
  { id: 't4', name: 'Meditar 10 minutos', category: 'Mentalidade', status: 'pending' },
  { id: 't5', name: 'Organizar mesa de trabalho', category: 'Organização', status: 'pending' },
];

// ========== INIT ==========
function init() {
  loadState();
  const today = getTodayStr();
  if (!state.lastDay || state.lastDay !== today) {
    handleNewDay(today);
  }
  if (!state.onboardingDone) {
    showOnboarding();
  } else {
    showApp();
    navigate('home');
  }
}

function defaultState() {
  return {
    onboardingDone: false,
    profile: { name: '', age: '', goals: [], wakeTime: '07:00', sleepTime: '23:00', works: false, studies: false, trains: false, habitsToImprove: [], disciplineLevel: 5 },
    habits: JSON.parse(JSON.stringify(DEFAULT_HABITS)),
    tasks: JSON.parse(JSON.stringify(DEFAULT_TASKS)),
    lastDay: null,
    streak: 0,
    xp: 0,
    totalXp: 0,
    achievements: [],
    history: {},
    study: { totalToday: 0, sessions: [], pomodorosTotal: 0 },
    health: { waterGlasses: 0, workout: false, workoutType: '', sleepHours: 7, weight: '', energyLevel: 0 },
    mental: { mood: '', anxiety: 5, energy: 5, goodThing: '', worry: '', improvement: '' },
    weekly: { focus: '', blockers: '', habitToStrengthen: '', goals: '', toAvoid: '' },
    minimal: { tasks: [false,false,false,false,false,false,false] },
    theme: 'dark',
    totalTasksDone: 0,
    totalHabitsDone: 0,
    totalPomodoros: 0,
    totalMentalDiaries: 0,
  };
}

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      state = { ...defaultState(), ...JSON.parse(saved) };
    } else {
      state = defaultState();
    }
  } catch(e) {
    state = defaultState();
  }
  applyTheme();
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function getTodayStr() {
  return new Date().toISOString().slice(0, 10);
}

function handleNewDay(today) {
  if (state.lastDay) {
    // Save yesterday's score
    const score = calcDisciplineScore();
    state.history[state.lastDay] = {
      score,
      tasksCompleted: state.tasks.filter(t => t.status === 'done').length,
      habitsCompleted: state.habits.filter(h => h.checkedToday).length,
      studyHours: state.study.totalToday,
    };
    // Update streak
    if (score >= 70) {
      state.streak += 1;
    } else {
      state.streak = 0;
    }
  }
  // Reset daily data
  state.tasks.forEach(t => { t.status = 'pending'; });
  state.habits.forEach(h => {
    if (h.checkedToday && state.lastDay) {
      h.lastChecked = state.lastDay;
      h.streak = (h.streak || 0) + 1;
    } else if (state.lastDay) {
      const yesterday = state.lastDay;
      if (h.lastChecked !== yesterday) h.streak = 0;
    }
    h.checkedToday = false;
  });
  state.study = { totalToday: 0, sessions: [], pomodorosTotal: state.study.pomodorosTotal || 0 };
  state.health = { waterGlasses: 0, workout: false, workoutType: '', sleepHours: 7, weight: state.health.weight || '', energyLevel: 0 };
  state.mental = { mood: '', anxiety: 5, energy: 5, goodThing: '', worry: '', improvement: '' };
  state.minimal = { tasks: [false,false,false,false,false,false,false] };
  state.lastDay = today;
  saveState();
}

function calcDisciplineScore() {
  const tasks = state.tasks;
  const habits = state.habits;
  const taskScore = tasks.length ? (tasks.filter(t => t.status === 'done').length / tasks.length) * 100 : 0;
  const habitScore = habits.length ? (habits.filter(h => h.checkedToday).length / habits.length) * 100 : 0;
  return Math.round(taskScore * 0.7 + habitScore * 0.3);
}

function getXpLevel() {
  const xp = state.totalXp || 0;
  const level = Math.floor(xp / 200) + 1;
  const xpInLevel = xp % 200;
  const xpToNext = 200;
  return { level, xp, xpInLevel, xpToNext };
}

function addXp(amount) {
  state.xp = (state.xp || 0) + amount;
  state.totalXp = (state.totalXp || 0) + amount;
  checkAchievements();
  saveState();
}

function checkAchievements() {
  ACHIEVEMENTS.forEach(ach => {
    if (state.achievements.includes(ach.id)) return;
    let unlock = false;
    if (ach.id === 'first_day' && Object.keys(state.history).length >= 1) unlock = true;
    if (ach.id === 'streak_3' && state.streak >= 3) unlock = true;
    if (ach.id === 'streak_7' && state.streak >= 7) unlock = true;
    if (ach.id === 'streak_30' && state.streak >= 30) unlock = true;
    if (ach.id === 'tasks_100' && (state.totalTasksDone || 0) >= 100) unlock = true;
    if (ach.id === 'habits_50' && (state.totalHabitsDone || 0) >= 50) unlock = true;
    if (ach.id === 'pomodoro_10' && (state.totalPomodoros || 0) >= 10) unlock = true;
    if (ach.id === 'mental_7' && (state.totalMentalDiaries || 0) >= 7) unlock = true;
    if (ach.id === 'perfect_day' && calcDisciplineScore() === 100) unlock = true;
    if (ach.id === 'hydrated' && state.health.waterGlasses >= 8) unlock = true;
    if (ach.id === 'level_5' && getXpLevel().level >= 5) unlock = true;
    if (ach.id === 'weekly_plan' && state.weekly.goals && state.weekly.goals.length > 5) unlock = true;
    if (unlock) {
      state.achievements.push(ach.id);
      state.totalXp += ach.xp;
      showToast(`🏆 Conquista desbloqueada: ${ach.name}!`, 'success');
    }
  });
}

function getSuggestion() {
  const h = state.health;
  const habits = state.habits;
  const tasks = state.tasks;
  if (h.sleepHours < 6) return 'Você dormiu pouco hoje. Priorize o sono — sem ele, tudo fica mais difícil.';
  if (state.mental.anxiety >= 7) return 'Ansiedade elevada detectada. Respira fundo. 5 minutos de caminhada ajudam muito.';
  const pendingTasks = tasks.filter(t => t.status === 'pending').length;
  if (pendingTasks >= tasks.length && tasks.length > 0) return `Você tem ${pendingTasks} tarefas pendentes. Comece pela mais fácil — o movimento gera energia.`;
  const history = state.history;
  const days = Object.keys(history).sort().slice(-3);
  const noStudy = days.every(d => !history[d].studyHours || history[d].studyHours === 0);
  if (noStudy && days.length >= 2) return 'Você não está estudando há alguns dias. Que tal 25 minutos de pomodoro agora?';
  const noWorkout = days.every(d => {
    const habit = state.habits.find(h2 => h2.name.toLowerCase().includes('treinar'));
    return habit ? !habit.checkedToday : true;
  });
  if (noWorkout && days.length >= 2) return 'Treino em falta! Movimento é remédio. Qualquer coisa conta — até 20 minutos de caminhada.';
  return 'Continue firme. Cada ação pequena constrói quem você quer ser.';
}

// ========== THEME ==========
function applyTheme() {
  document.body.className = state.theme || 'dark';
}

function toggleTheme() {
  state.theme = state.theme === 'dark' ? 'light' : 'dark';
  applyTheme();
  saveState();
  navigate('settings');
}

// ========== NAVIGATION ==========
function showOnboarding() {
  document.getElementById('screen-onboarding').classList.add('active');
  document.getElementById('screen-app').classList.remove('active');
  renderOnboarding(0);
}

function showApp() {
  document.getElementById('screen-onboarding').classList.remove('active');
  document.getElementById('screen-app').classList.add('active');
}

function navigate(screen) {
  currentScreen = screen;
  // Update nav buttons
  document.querySelectorAll('.nav-btn[data-screen]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.screen === screen);
  });
  const content = document.getElementById('main-content');
  content.innerHTML = '';
  const renders = {
    home: renderHome,
    checklist: renderChecklist,
    habits: renderHabits,
    study: renderStudy,
    health: renderHealth,
    mental: renderMental,
    reports: renderReports,
    achievements: renderAchievements,
    minimal: renderMinimal,
    weekly: renderWeekly,
    settings: renderSettings,
  };
  if (renders[screen]) renders[screen](content);
  // Scroll to top
  content.scrollTo && content.scrollTo(0, 0);
  window.scrollTo(0, 0);
}

function toggleMore() {
  const popup = document.getElementById('more-popup');
  popup.classList.toggle('hidden');
}

// Close more popup when clicking outside
document.addEventListener('click', e => {
  const popup = document.getElementById('more-popup');
  const btn = document.getElementById('btn-mais');
  if (!popup || !btn) return;
  if (!popup.contains(e.target) && !btn.contains(e.target)) {
    popup.classList.add('hidden');
  }
});

// ========== TOAST ==========
function showToast(msg, type = 'info', duration = 3000) {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${msg}</span>`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), duration);
}

// ========== ONBOARDING ==========
let obStep = 0;
let obData = {};

function renderOnboarding(step) {
  obStep = step;
  const stepEl = document.getElementById('ob-step');
  const dotsEl = document.getElementById('ob-dots');
  const backBtn = document.getElementById('ob-back');
  const nextBtn = document.getElementById('ob-next');

  // Dots
  dotsEl.innerHTML = '';
  for (let i = 0; i < 6; i++) {
    const dot = document.createElement('div');
    dot.className = `ob-dot${i === step ? ' active' : ''}`;
    dotsEl.appendChild(dot);
  }

  backBtn.style.display = step === 0 ? 'none' : 'block';
  nextBtn.textContent = step === 5 ? 'Começar 🚀' : 'Próximo';

  const steps = [
    () => `
      <div class="ob-emoji">✨</div>
      <h1 class="ob-title">Bem-vindo ao Rotina</h1>
      <p class="ob-sub">Seu companheiro de disciplina diária.<br>Vamos construir hábitos que transformam.</p>
    `,
    () => `
      <h2 class="ob-title" style="font-size:22px">Quem é você?</h2>
      <p class="ob-sub">Nos conte um pouco sobre você</p>
      <div class="form-group">
        <label class="form-label">Seu nome</label>
        <input class="form-input" id="ob-name" type="text" placeholder="Ex: João" value="${obData.name || ''}" />
      </div>
      <div class="form-group">
        <label class="form-label">Sua idade</label>
        <input class="form-input" id="ob-age" type="number" placeholder="Ex: 22" min="13" max="60" value="${obData.age || ''}" />
      </div>
    `,
    () => `
      <h2 class="ob-title" style="font-size:22px">Seus objetivos</h2>
      <p class="ob-sub">O que você quer melhorar? (Selecione todos)</p>
      <div class="chip-wrap" id="ob-goals">
        ${['Produtividade','Saúde','Finanças','Estudos','Esportes','Mindfulness','Sono','Social'].map(g =>
          `<div class="chip${(obData.goals||[]).includes(g)?' selected':''}" onclick="toggleChip(this,'${g}','goals')">${g}</div>`
        ).join('')}
      </div>
    `,
    () => `
      <h2 class="ob-title" style="font-size:22px">Sua rotina</h2>
      <p class="ob-sub">Ajuste o app à sua realidade</p>
      <div class="form-group">
        <label class="form-label">Horário de acordar</label>
        <input class="form-input" id="ob-wake" type="time" value="${obData.wakeTime || '07:00'}" />
      </div>
      <div class="form-group">
        <label class="form-label">Horário de dormir</label>
        <input class="form-input" id="ob-sleep" type="time" value="${obData.sleepTime || '23:00'}" />
      </div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:8px">
        ${['Trabalha','Estuda','Treina'].map((item, i) => {
          const keys = ['works','studies','trains'];
          return `<div class="chip${obData[keys[i]]?' selected':''}" onclick="toggleBool(this,'${keys[i]}')">${item}</div>`;
        }).join('')}
      </div>
    `,
    () => `
      <h2 class="ob-title" style="font-size:22px">Hábitos para melhorar</h2>
      <p class="ob-sub">Quais hábitos você quer trabalhar?</p>
      <div class="chip-wrap" id="ob-habits">
        ${['Acordar cedo','Beber água','Fazer exercício','Estudar mais','Dormir bem','Organização','Menos celular','Leitura','Meditação'].map(h =>
          `<div class="chip${(obData.habitsToImprove||[]).includes(h)?' selected':''}" onclick="toggleChip(this,'${h}','habitsToImprove')">${h}</div>`
        ).join('')}
      </div>
    `,
    () => `
      <h2 class="ob-title" style="font-size:22px">Nível de disciplina</h2>
      <p class="ob-sub">Como você se avalia hoje?</p>
      <div style="text-align:center;margin:20px 0">
        <span style="font-size:56px;font-weight:900;color:var(--accent)" id="ob-disc-val">${obData.disciplineLevel || 5}</span>
        <span style="font-size:20px;color:var(--text2)">/10</span>
      </div>
      <input type="range" class="range-input" id="ob-disc" min="1" max="10" value="${obData.disciplineLevel || 5}"
        oninput="document.getElementById('ob-disc-val').textContent=this.value" />
      <div style="display:flex;justify-content:space-between;margin-top:6px">
        <span style="font-size:12px;color:var(--text3)">Precisando de ajuda</span>
        <span style="font-size:12px;color:var(--text3)">Muito disciplinado</span>
      </div>
      <p style="text-align:center;color:var(--text2);font-size:14px;margin-top:20px">Sem julgamentos. Queremos te ajudar a partir de onde você está.</p>
    `,
  ];

  stepEl.innerHTML = steps[step]();

  // Re-attach listeners
  backBtn.onclick = () => renderOnboarding(Math.max(0, step - 1));
  nextBtn.onclick = () => obNext(step);
}

function toggleChip(el, val, key) {
  if (!obData[key]) obData[key] = [];
  const idx = obData[key].indexOf(val);
  if (idx >= 0) { obData[key].splice(idx, 1); el.classList.remove('selected'); }
  else { obData[key].push(val); el.classList.add('selected'); }
}

function toggleBool(el, key) {
  obData[key] = !obData[key];
  el.classList.toggle('selected', obData[key]);
}

function obNext(step) {
  if (step === 1) {
    obData.name = document.getElementById('ob-name')?.value.trim() || '';
    obData.age = document.getElementById('ob-age')?.value || '';
    if (!obData.name) { showToast('Digite seu nome!', 'error'); return; }
  }
  if (step === 3) {
    obData.wakeTime = document.getElementById('ob-wake')?.value || '07:00';
    obData.sleepTime = document.getElementById('ob-sleep')?.value || '23:00';
  }
  if (step === 5) {
    obData.disciplineLevel = parseInt(document.getElementById('ob-disc')?.value || '5');
    // Save to state
    state.profile = { ...state.profile, ...obData };
    state.onboardingDone = true;
    saveState();
    showApp();
    navigate('home');
    showToast(`Bem-vindo, ${state.profile.name}! Vamos começar. 🚀`, 'success');
    return;
  }
  renderOnboarding(step + 1);
}

// ========== HOME ==========
function renderHome(container) {
  const score = calcDisciplineScore();
  const name = state.profile.name || 'Você';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';
  const quote = QUOTES[Math.floor(Math.random() * QUOTES.length)];
  const { level, xpInLevel, xpToNext } = getXpLevel();
  const suggestion = getSuggestion();
  const tasks = state.tasks;
  const habits = state.habits;
  const tasksDone = tasks.filter(t => t.status === 'done').length;
  const habitsDone = habits.filter(h => h.checkedToday).length;

  container.innerHTML = `
    <div class="screen-content">
      <div class="card greeting-card">
        <div class="greeting-sub">${greeting},</div>
        <div class="greeting-name">${name} 👋</div>
        <div style="display:flex;align-items:flex-end;gap:10px;margin-top:16px">
          <div>
            <div style="font-size:12px;color:var(--text2);margin-bottom:2px">Score do dia</div>
            <div class="discipline-score">${score}</div>
          </div>
          <div style="flex:1;padding-bottom:10px">
            <div style="font-size:12px;color:var(--text2);margin-bottom:6px">Nível ${level} • ${xpInLevel}/${xpToNext} XP</div>
            <div class="xp-bar-wrap"><div class="xp-bar-fill" style="width:${(xpInLevel/xpToNext)*100}%"></div></div>
            <div style="font-size:12px;color:var(--orange);margin-top:4px">🔥 ${state.streak} dias de streak</div>
          </div>
        </div>
      </div>

      <div class="card suggestion-card">
        <div class="suggestion-title">💡 Sugestão do dia</div>
        <div class="suggestion-text">${suggestion}</div>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <span class="stat-icon">✅</span>
          <span class="stat-value">${tasksDone}/${tasks.length}</span>
          <span class="stat-label">Tarefas hoje</span>
        </div>
        <div class="stat-card">
          <span class="stat-icon">🔥</span>
          <span class="stat-value">${habitsDone}/${habits.length}</span>
          <span class="stat-label">Hábitos hoje</span>
        </div>
        <div class="stat-card">
          <span class="stat-icon">📚</span>
          <span class="stat-value">${(state.study.totalToday || 0).toFixed(1)}h</span>
          <span class="stat-label">Estudo hoje</span>
        </div>
        <div class="stat-card">
          <span class="stat-icon">💧</span>
          <span class="stat-value">${state.health.waterGlasses}/8</span>
          <span class="stat-label">Copos d'água</span>
        </div>
        <div class="stat-card">
          <span class="stat-icon">🧠</span>
          <span class="stat-value">${state.mental.mood || '—'}</span>
          <span class="stat-label">Humor</span>
        </div>
        <div class="stat-card">
          <span class="stat-icon">🍅</span>
          <span class="stat-value">${state.study.pomodorosTotal || 0}</span>
          <span class="stat-label">Pomodoros total</span>
        </div>
        <div class="stat-card">
          <span class="stat-icon">🏆</span>
          <span class="stat-value">${state.achievements.length}/13</span>
          <span class="stat-label">Conquistas</span>
        </div>
        <div class="stat-card">
          <span class="stat-icon">💪</span>
          <span class="stat-value">${state.health.workout ? 'Sim' : 'Não'}</span>
          <span class="stat-label">Treinou hoje</span>
        </div>
      </div>

      <div class="quick-btns">
        <button class="quick-btn" onclick="navigate('checklist')">📋 Tarefas</button>
        <button class="quick-btn" onclick="navigate('study')">🍅 Pomodoro</button>
        <button class="quick-btn" onclick="navigate('mental')">🧠 Mental</button>
        <button class="quick-btn" onclick="navigate('minimal')">🌱 Dia difícil</button>
      </div>

      <div class="card quote-card">
        <div class="quote-text">"${quote}"</div>
      </div>
    </div>
  `;
}

// ========== CHECKLIST ==========
function renderChecklist(container) {
  const tasks = state.tasks;
  const done = tasks.filter(t => t.status === 'done').length;
  const partial = tasks.filter(t => t.status === 'partial').length;
  const total = tasks.length;
  const pct = total ? Math.round(((done + partial * 0.5) / total) * 100) : 0;

  const motivTexts = [
    'Vamos lá! O primeiro passo é o mais difícil.',
    'Bom começo! Continue assim.',
    'Na metade! Você consegue.',
    'Quase lá! Não para agora.',
    'Incrível! Dia produtivo garantido.',
  ];
  const motivIdx = Math.min(Math.floor(pct / 25), 4);

  // Group tasks by category
  const categories = {};
  tasks.forEach(t => {
    if (!categories[t.category]) categories[t.category] = [];
    categories[t.category].push(t);
  });

  const taskRows = Object.entries(categories).map(([cat, catTasks]) => `
    <div class="category-label">${cat}</div>
    ${catTasks.map(task => `
      <div class="task-item" id="task-${task.id}">
        <span class="task-name ${task.status === 'done' ? 'done' : task.status === 'skip' ? 'skip' : ''}">${task.name}</span>
        <div class="task-btns">
          <button class="task-btn ${task.status === 'done' ? 'done' : ''}" onclick="setTaskStatus('${task.id}','done')" title="Feito">✓</button>
          <button class="task-btn ${task.status === 'partial' ? 'partial' : ''}" onclick="setTaskStatus('${task.id}','partial')" title="Parcial">~</button>
          <button class="task-btn ${task.status === 'skip' ? 'skip' : ''}" onclick="setTaskStatus('${task.id}','skip')" title="Pular">✕</button>
        </div>
      </div>
    `).join('')}
  `).join('');

  container.innerHTML = `
    <div class="screen-content">
      <div class="screen-header">
        <span style="font-size:26px">✅</span>
        <h1 class="screen-title">Tarefas de Hoje</h1>
      </div>
      <div class="card">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <span style="font-size:14px;color:var(--text2)">${done} de ${total} concluídas</span>
          <span style="font-weight:800;color:var(--accent)">${pct}%</span>
        </div>
        <div class="progress-bar-wrap" style="margin-top:10px">
          <div class="progress-bar-fill" style="width:${pct}%"></div>
        </div>
        <div class="progress-text">${motivTexts[motivIdx]}</div>
      </div>

      <div class="card">
        ${taskRows}
      </div>

      <div class="card">
        <div class="section-label">Adicionar tarefa</div>
        <div class="form-group">
          <input class="form-input" id="new-task-name" placeholder="Nome da tarefa" />
        </div>
        <div class="form-group">
          <select class="form-select" id="new-task-cat">
            <option>Saúde</option>
            <option>Treino</option>
            <option>Estudos</option>
            <option>Mentalidade</option>
            <option>Organização</option>
            <option>Trabalho</option>
            <option>Finanças</option>
            <option>Outro</option>
          </select>
        </div>
        <button class="btn-primary" onclick="addTask()">+ Adicionar</button>
      </div>
    </div>
  `;
}

function setTaskStatus(id, status) {
  const task = state.tasks.find(t => t.id === id);
  if (!task) return;
  const wasNotDone = task.status !== 'done';
  task.status = task.status === status ? 'pending' : status;
  if (task.status === 'done' && wasNotDone) {
    state.totalTasksDone = (state.totalTasksDone || 0) + 1;
    addXp(10);
    showToast('Tarefa concluída! +10 XP', 'success');
  }
  saveState();
  navigate('checklist');
}

function addTask() {
  const name = document.getElementById('new-task-name')?.value.trim();
  const cat = document.getElementById('new-task-cat')?.value || 'Outro';
  if (!name) { showToast('Digite o nome da tarefa', 'error'); return; }
  state.tasks.push({ id: 't' + Date.now(), name, category: cat, status: 'pending' });
  saveState();
  navigate('checklist');
  showToast('Tarefa adicionada!', 'success');
}

// ========== HABITS ==========
function renderHabits(container) {
  const habits = state.habits;
  const checkedCount = habits.filter(h => h.checkedToday).length;

  const habitRows = habits.map(h => `
    <div class="habit-item">
      <span class="habit-emoji">${h.emoji || '⭐'}</span>
      <div class="habit-info">
        <div class="habit-name">${h.name}</div>
        <div class="habit-streak">🔥 ${h.streak || 0} dias de streak ${h.category ? '• ' + h.category : ''}</div>
      </div>
      <button class="habit-check ${h.checkedToday ? 'checked' : ''}" onclick="toggleHabit('${h.id}')">
        ${h.checkedToday ? '✓' : ''}
      </button>
    </div>
  `).join('');

  container.innerHTML = `
    <div class="screen-content">
      <div class="screen-header">
        <span style="font-size:26px">🔥</span>
        <h1 class="screen-title">Hábitos</h1>
      </div>

      <div class="card">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
          <span style="color:var(--text2);font-size:14px">${checkedCount}/${habits.length} hoje</span>
          <span style="color:var(--accent);font-weight:700">${habits.length ? Math.round((checkedCount/habits.length)*100) : 0}%</span>
        </div>
        <div class="progress-bar-wrap">
          <div class="progress-bar-fill" style="width:${habits.length ? (checkedCount/habits.length)*100 : 0}%"></div>
        </div>
      </div>

      <div class="card">
        ${habitRows || '<p style="color:var(--text2);font-size:14px">Nenhum hábito ainda.</p>'}
      </div>

      <div class="card">
        <div class="section-label">Novo hábito</div>
        <div style="display:flex;gap:10px;margin-bottom:12px">
          <input class="form-input" id="new-habit-emoji" placeholder="Emoji" style="width:70px" maxlength="2" />
          <input class="form-input" id="new-habit-name" placeholder="Nome do hábito" />
        </div>
        <div style="display:flex;gap:10px;margin-bottom:12px">
          <select class="form-select" id="new-habit-cat">
            <option>Saúde</option><option>Treino</option><option>Estudos</option>
            <option>Mentalidade</option><option>Organização</option><option>Finanças</option><option>Outro</option>
          </select>
          <select class="form-select" id="new-habit-imp">
            <option value="alta">Alta</option>
            <option value="media">Média</option>
            <option value="baixa">Baixa</option>
          </select>
        </div>
        <button class="btn-primary" onclick="addHabit()">+ Adicionar Hábito</button>
      </div>
    </div>
  `;
}

function toggleHabit(id) {
  const habit = state.habits.find(h => h.id === id);
  if (!habit) return;
  habit.checkedToday = !habit.checkedToday;
  if (habit.checkedToday) {
    state.totalHabitsDone = (state.totalHabitsDone || 0) + 1;
    addXp(15);
    showToast(`${habit.emoji} ${habit.name} — +15 XP`, 'success');
  }
  saveState();
  navigate('habits');
}

function addHabit() {
  const emoji = document.getElementById('new-habit-emoji')?.value.trim() || '⭐';
  const name = document.getElementById('new-habit-name')?.value.trim();
  const category = document.getElementById('new-habit-cat')?.value || 'Outro';
  const importance = document.getElementById('new-habit-imp')?.value || 'media';
  if (!name) { showToast('Digite o nome do hábito', 'error'); return; }
  state.habits.push({ id: 'h' + Date.now(), emoji, name, category, importance, streak: 0, lastChecked: null, checkedToday: false });
  saveState();
  navigate('habits');
  showToast('Hábito adicionado!', 'success');
}

// ========== STUDY ==========
function renderStudy(container) {
  const sessions = state.study.sessions || [];
  const modeLabels = { work: '🍅 Foco (25min)', short: '☕ Pausa curta (5min)', long: '🛋️ Pausa longa (15min)' };
  const modeSecs = { work: 25 * 60, short: 5 * 60, long: 15 * 60 };

  container.innerHTML = `
    <div class="screen-content">
      <div class="screen-header">
        <span style="font-size:26px">📚</span>
        <h1 class="screen-title">Estudos</h1>
      </div>

      <div class="card" style="text-align:center">
        <div style="font-size:13px;color:var(--text2);margin-bottom:4px">Horas hoje</div>
        <div style="font-size:40px;font-weight:900;color:var(--accent)">${(state.study.totalToday || 0).toFixed(1)}h</div>
        <div style="font-size:13px;color:var(--text3)">Total pomodoros: ${state.study.pomodorosTotal || 0}</div>
      </div>

      <div class="pomodoro-display">
        <div class="pomo-mode" id="pomo-mode-label">${modeLabels[pomodoroMode]}</div>
        <div class="pomo-time" id="pomo-time">${formatTime(pomodoroRunning ? pomodoroSeconds : modeSecs[pomodoroMode])}</div>
        <div class="pomo-btns">
          <button class="btn-sm" style="background:var(--accent);color:#fff" onclick="pomodoroToggle()" id="pomo-play">${pomodoroRunning ? '⏸ Pausar' : '▶ Iniciar'}</button>
          <button class="btn-sm" style="background:var(--surface2);color:var(--text);border:1.5px solid var(--border)" onclick="pomodoroReset()">⟳ Reset</button>
        </div>
        <div style="display:flex;gap:8px;justify-content:center;margin-top:12px;flex-wrap:wrap">
          ${Object.entries(modeLabels).map(([k,v]) => `
            <button class="btn-sm" style="background:${k===pomodoroMode?'var(--surface)':'var(--surface2)'};color:var(--text);border:${k===pomodoroMode?'2px solid var(--accent)':'1.5px solid var(--border)'}" onclick="setPomoMode('${k}')">${v}</button>
          `).join('')}
        </div>
      </div>

      <div class="card">
        <div class="section-label">Registrar sessão</div>
        <div style="display:flex;gap:10px;margin-bottom:10px">
          <input class="form-input" id="session-subject" placeholder="Matéria/Assunto" />
          <input class="form-input" id="session-hours" type="number" placeholder="Horas" step="0.5" min="0.25" max="12" style="width:90px" />
        </div>
        <button class="btn-primary" onclick="logSession()">+ Registrar</button>
      </div>

      ${sessions.length ? `
        <div class="card">
          <div class="section-label">Sessões de hoje</div>
          ${sessions.map(s => `
            <div class="session-item">
              <span>${s.subject}</span>
              <span style="color:var(--accent);font-weight:700">${s.hours}h</span>
            </div>
          `).join('')}
        </div>
      ` : ''}
    </div>
  `;
}

function formatTime(secs) {
  const m = Math.floor(secs / 60).toString().padStart(2, '0');
  const s = (secs % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function setPomoMode(mode) {
  pomodoroMode = mode;
  const modeSecs = { work: 25 * 60, short: 5 * 60, long: 15 * 60 };
  pomodoroSeconds = modeSecs[mode];
  if (pomodoroRunning) {
    clearInterval(pomodoroInterval);
    pomodoroRunning = false;
  }
  navigate('study');
}

function pomodoroToggle() {
  if (pomodoroRunning) {
    clearInterval(pomodoroInterval);
    pomodoroRunning = false;
    const btn = document.getElementById('pomo-play');
    if (btn) btn.textContent = '▶ Iniciar';
  } else {
    pomodoroRunning = true;
    const btn = document.getElementById('pomo-play');
    if (btn) btn.textContent = '⏸ Pausar';
    pomodoroInterval = setInterval(() => {
      pomodoroSeconds--;
      const timeEl = document.getElementById('pomo-time');
      if (timeEl) timeEl.textContent = formatTime(pomodoroSeconds);
      if (pomodoroSeconds <= 0) {
        clearInterval(pomodoroInterval);
        pomodoroRunning = false;
        if (pomodoroMode === 'work') {
          state.study.totalToday = (state.study.totalToday || 0) + 25/60;
          state.study.pomodorosTotal = (state.study.pomodorosTotal || 0) + 1;
          state.totalPomodoros = (state.totalPomodoros || 0) + 1;
          addXp(20);
          saveState();
          showToast('🍅 Pomodoro completo! +20 XP', 'success');
          pomodoroMode = 'short';
          pomodoroSeconds = 5 * 60;
        } else {
          showToast('☕ Pausa acabou! Hora de focar.', 'info');
          pomodoroMode = 'work';
          pomodoroSeconds = 25 * 60;
        }
        navigate('study');
      }
    }, 1000);
  }
}

function pomodoroReset() {
  if (pomodoroRunning) { clearInterval(pomodoroInterval); pomodoroRunning = false; }
  const modeSecs = { work: 25 * 60, short: 5 * 60, long: 15 * 60 };
  pomodoroSeconds = modeSecs[pomodoroMode];
  navigate('study');
}

function logSession() {
  const subject = document.getElementById('session-subject')?.value.trim();
  const hours = parseFloat(document.getElementById('session-hours')?.value);
  if (!subject || !hours || isNaN(hours)) { showToast('Preencha matéria e horas', 'error'); return; }
  if (!state.study.sessions) state.study.sessions = [];
  state.study.sessions.push({ subject, hours, time: new Date().toLocaleTimeString('pt-BR', {hour:'2-digit',minute:'2-digit'}) });
  state.study.totalToday = (state.study.totalToday || 0) + hours;
  addXp(10);
  saveState();
  navigate('study');
  showToast(`📚 ${hours}h de ${subject} registradas! +10 XP`, 'success');
}

// ========== HEALTH ==========
function renderHealth(container) {
  const h = state.health;
  const workoutTypes = ['Musculação', 'Corrida', 'Ciclismo', 'Natação', 'Yoga', 'Futebol', 'Outro'];

  container.innerHTML = `
    <div class="screen-content">
      <div class="screen-header">
        <span style="font-size:26px">💪</span>
        <h1 class="screen-title">Saúde & Treino</h1>
      </div>

      <div class="card">
        <div class="section-label">Água (${h.waterGlasses}/8 copos)</div>
        <div class="water-grid">
          ${[...Array(8)].map((_, i) => `
            <div class="water-glass ${i < h.waterGlasses ? 'filled' : ''}" onclick="setWater(${i+1})">💧</div>
          `).join('')}
        </div>
        <div style="font-size:13px;color:var(--text2);margin-top:8px">${h.waterGlasses >= 8 ? '✅ Meta atingida!' : `${8 - h.waterGlasses} copos para a meta`}</div>
      </div>

      <div class="card">
        <div class="section-label">Treino hoje</div>
        <div class="toggle-row">
          <span class="toggle-label">Treinei hoje</span>
          <div class="toggle ${h.workout ? 'on' : ''}" onclick="toggleWorkout()"></div>
        </div>
        ${h.workout ? `
          <div class="form-group" style="margin-top:12px">
            <label class="form-label">Tipo de treino</label>
            <select class="form-select" id="workout-type" onchange="setWorkoutType(this.value)">
              ${workoutTypes.map(t => `<option ${h.workoutType===t?'selected':''}>${t}</option>`).join('')}
            </select>
          </div>
        ` : ''}
      </div>

      <div class="card">
        <div class="section-label">Sono</div>
        <div class="form-group">
          <label class="form-label">Horas de sono: <strong>${h.sleepHours || 7}h</strong></label>
          <input type="range" class="range-input" min="2" max="12" step="0.5" value="${h.sleepHours || 7}"
            oninput="setSleep(this.value)" />
          <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--text3)"><span>2h</span><span>12h</span></div>
        </div>
      </div>

      <div class="card">
        <div class="section-label">Peso (kg)</div>
        <input class="form-input" id="weight-input" type="number" placeholder="Ex: 70.5" step="0.1" value="${h.weight || ''}" oninput="setWeight(this.value)" />
      </div>

      <div class="card">
        <div class="section-label">Nível de energia</div>
        <div class="energy-btns">
          ${['😴','😐','🙂','😊','🔥'].map((e, i) => `
            <button class="energy-btn ${h.energyLevel === i+1 ? 'selected' : ''}" onclick="setEnergy(${i+1})">${e}</button>
          `).join('')}
        </div>
        <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--text3);margin-top:6px"><span>Sem energia</span><span>Energia máxima</span></div>
      </div>
    </div>
  `;
}

function setWater(glasses) {
  state.health.waterGlasses = glasses;
  if (glasses >= 8) { addXp(10); showToast('💧 Meta de água atingida! +10 XP', 'success'); }
  saveState();
  navigate('health');
}

function toggleWorkout() {
  state.health.workout = !state.health.workout;
  if (state.health.workout) { addXp(20); showToast('💪 Treino registrado! +20 XP', 'success'); }
  saveState();
  navigate('health');
}

function setWorkoutType(val) {
  state.health.workoutType = val;
  saveState();
}

function setSleep(val) {
  state.health.sleepHours = parseFloat(val);
  document.querySelector('.form-label strong') && (document.querySelector('.form-label strong').textContent = val + 'h');
  saveState();
}

function setWeight(val) {
  state.health.weight = val;
  saveState();
}

function setEnergy(val) {
  state.health.energyLevel = val;
  saveState();
  navigate('health');
}

// ========== MENTAL ==========
const MOODS = ['😢','😕','😐','🙂','😄'];
const MOOD_LABELS = ['Péssimo','Ruim','Ok','Bem','Ótimo'];

function renderMental(container) {
  const m = state.mental;

  const reflection = generateReflection(m);

  container.innerHTML = `
    <div class="screen-content">
      <div class="screen-header">
        <span style="font-size:26px">🧠</span>
        <h1 class="screen-title">Diário Mental</h1>
      </div>

      <div class="card">
        <div class="section-label">Como você está hoje?</div>
        <div class="mood-btns">
          ${MOODS.map((mood, i) => `
            <button class="mood-btn ${m.mood === mood ? 'selected' : ''}" onclick="setMood('${mood}')" title="${MOOD_LABELS[i]}">${mood}</button>
          `).join('')}
        </div>
        <div style="text-align:center;font-size:13px;color:var(--text2);margin-top:6px">
          ${m.mood ? MOOD_LABELS[MOODS.indexOf(m.mood)] : 'Selecione seu humor'}
        </div>
      </div>

      <div class="card">
        <div class="slider-group">
          <div class="slider-label"><span>Ansiedade</span><strong style="color:var(--orange)">${m.anxiety}/10</strong></div>
          <input type="range" class="range-input" min="0" max="10" value="${m.anxiety}" oninput="setMentalSlider('anxiety',this.value)" />
        </div>
        <div class="slider-group">
          <div class="slider-label"><span>Energia</span><strong style="color:var(--green)">${m.energy}/10</strong></div>
          <input type="range" class="range-input" min="0" max="10" value="${m.energy}" oninput="setMentalSlider('energy',this.value)" />
        </div>
      </div>

      <div class="card">
        <div class="form-group">
          <label class="form-label">Uma coisa boa que aconteceu hoje</label>
          <textarea class="form-textarea" id="mental-good" placeholder="Ex: Acordei animado, terminei uma tarefa difícil...">${m.goodThing || ''}</textarea>
        </div>
        <div class="form-group">
          <label class="form-label">O que está te preocupando?</label>
          <textarea class="form-textarea" id="mental-worry" placeholder="Ex: Prazo no trabalho, conversa difícil...">${m.worry || ''}</textarea>
        </div>
        <div class="form-group">
          <label class="form-label">O que você pode melhorar amanhã?</label>
          <textarea class="form-textarea" id="mental-improve" placeholder="Ex: Dormir mais cedo, beber mais água...">${m.improvement || ''}</textarea>
        </div>
        <button class="btn-primary" onclick="saveMental()">Salvar Diário</button>
      </div>

      ${reflection ? `
        <div class="card">
          <div class="section-label">💬 Reflexão automática</div>
          <div class="reflection-box">${reflection}</div>
        </div>
      ` : ''}
    </div>
  `;
}

function setMood(mood) {
  state.mental.mood = mood;
  saveState();
  navigate('mental');
}

function setMentalSlider(key, val) {
  state.mental[key] = parseInt(val);
  // Update display inline
  saveState();
}

function saveMental() {
  state.mental.goodThing = document.getElementById('mental-good')?.value || '';
  state.mental.worry = document.getElementById('mental-worry')?.value || '';
  state.mental.improvement = document.getElementById('mental-improve')?.value || '';
  state.totalMentalDiaries = (state.totalMentalDiaries || 0) + 1;
  addXp(25);
  saveState();
  navigate('mental');
  showToast('🧠 Diário salvo! +25 XP', 'success');
}

function generateReflection(m) {
  if (!m.mood && !m.goodThing) return '';
  const parts = [];
  if (m.mood === '😢' || m.mood === '😕') parts.push('Dias difíceis fazem parte. O que importa é que você não desistiu de se conhecer.');
  if (m.mood === '😄' || m.mood === '🙂') parts.push('Que bom que você está bem! Aproveite essa energia para avançar nos seus objetivos.');
  if (m.anxiety >= 7) parts.push('Sua ansiedade está elevada. Tente respirar fundo 4 vezes antes de dormir — isso ativa o sistema de calma do corpo.');
  if (m.anxiety <= 3) parts.push('Você está tranquilo hoje. Aproveite esse estado para trabalhar em coisas importantes.');
  if (m.energy >= 8) parts.push('Alta energia! Dia ideal para atacar aquela tarefa que você tem adiado.');
  if (m.energy <= 3) parts.push('Energia baixa. Talvez valha priorizar descanso e uma tarefa só. Menos é mais quando estamos no limite.');
  if (m.goodThing) parts.push(`Você reconheceu algo positivo hoje. Isso treina seu cérebro a encontrar mais coisas boas.`);
  if (m.improvement) parts.push(`Querer melhorar é o primeiro passo. Amanhã você tem uma nova chance.`);
  return parts.join(' ');
}

// ========== REPORTS ==========
function renderReports(container) {
  const history = state.history;
  const days7 = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().slice(0, 10);
  });

  const scores7 = days7.map(d => history[d] ? history[d].score : 0);
  const study7 = days7.map(d => history[d] ? (history[d].studyHours || 0) : 0);
  const labels7 = days7.map(d => { const dt = new Date(d + 'T12:00:00'); return ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'][dt.getDay()]; });

  const avgScore = scores7.reduce((a,b) => a+b, 0) / 7;
  const totalStudy = study7.reduce((a,b) => a+b, 0);
  const habitsSorted = [...state.habits].sort((a,b) => (b.streak||0) - (a.streak||0));

  const insights = [];
  if (avgScore >= 70) insights.push({ icon: '🌟', text: `Média de score ${avgScore.toFixed(0)} nos últimos 7 dias. Você está acima da meta de disciplina!` });
  else insights.push({ icon: '⚠️', text: `Média de score ${avgScore.toFixed(0)}. Tente chegar a 70+ por dia para manter o streak.` });
  if (totalStudy >= 7) insights.push({ icon: '📚', text: `${totalStudy.toFixed(1)} horas de estudo na semana. Excelente dedicação!` });
  else insights.push({ icon: '📚', text: `${totalStudy.toFixed(1)} horas de estudo na semana. Tente 1h por dia para construir consistência.` });
  const topHabit = habitsSorted[0];
  if (topHabit) insights.push({ icon: '🔥', text: `Seu hábito mais forte é "${topHabit.name}" com ${topHabit.streak} dias de streak.` });

  container.innerHTML = `
    <div class="screen-content">
      <div class="screen-header">
        <span style="font-size:26px">📊</span>
        <h1 class="screen-title">Relatórios</h1>
      </div>

      <div class="report-stats">
        <div class="report-stat">
          <div class="report-stat-value">${avgScore.toFixed(0)}</div>
          <div class="report-stat-label">Score médio</div>
        </div>
        <div class="report-stat">
          <div class="report-stat-value">${state.streak}</div>
          <div class="report-stat-label">Streak atual</div>
        </div>
        <div class="report-stat">
          <div class="report-stat-value">${totalStudy.toFixed(1)}h</div>
          <div class="report-stat-label">Estudo na semana</div>
        </div>
        <div class="report-stat">
          <div class="report-stat-value">${state.achievements.length}</div>
          <div class="report-stat-label">Conquistas</div>
        </div>
      </div>

      <div class="card">
        <div class="section-label">Disciplina — 7 dias</div>
        <canvas id="chart-score" width="440" height="180"></canvas>
      </div>

      <div class="card">
        <div class="section-label">Horas de estudo — 7 dias</div>
        <canvas id="chart-study" width="440" height="180"></canvas>
      </div>

      <div class="card">
        <div class="section-label">Ranking de hábitos (streak)</div>
        ${habitsSorted.slice(0, 5).map((h, i) => `
          <div class="rank-item">
            <span style="color:var(--text3);width:20px">${i+1}.</span>
            <span class="rank-name">${h.emoji} ${h.name}</span>
            <span class="rank-streak">🔥 ${h.streak} dias</span>
          </div>
        `).join('')}
      </div>

      <div class="card">
        <div class="section-label">💡 Insights</div>
        ${insights.map(ins => `
          <div class="insight-item">
            <span class="insight-icon">${ins.icon}</span>
            <span>${ins.text}</span>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  // Draw charts
  setTimeout(() => {
    drawBarChart('chart-score', labels7, scores7, '#4f6ef7', 100);
    drawBarChart('chart-study', labels7, study7, '#22d47a', Math.max(...study7, 2));
  }, 50);
}

function drawBarChart(canvasId, labels, values, color, maxVal) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.offsetWidth || 440;
  const H = 180;
  canvas.width = W;
  canvas.height = H;
  const pad = { top: 16, bottom: 32, left: 10, right: 10 };
  const barW = (W - pad.left - pad.right) / labels.length - 6;
  ctx.clearRect(0, 0, W, H);
  // BG
  ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--surface') || '#111122';
  ctx.fillRect(0, 0, W, H);
  // Bars
  labels.forEach((label, i) => {
    const val = values[i];
    const x = pad.left + i * ((W - pad.left - pad.right) / labels.length) + 3;
    const barH = ((val / maxVal) * (H - pad.top - pad.bottom));
    const y = H - pad.bottom - barH;
    // Bar
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.85;
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(x, y, barW, barH, [4, 4, 0, 0]) : ctx.rect(x, y, barW, barH);
    ctx.fill();
    ctx.globalAlpha = 1;
    // Value
    ctx.fillStyle = '#eeeef8';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    if (val > 0) ctx.fillText(Math.round(val * 10) / 10, x + barW / 2, y - 4);
    // Label
    ctx.fillStyle = '#9898b8';
    ctx.font = '11px sans-serif';
    ctx.fillText(label, x + barW / 2, H - 8);
  });
}

// ========== ACHIEVEMENTS ==========
function renderAchievements(container) {
  const { level, xpInLevel, xpToNext, xp } = getXpLevel();
  const topStreak = Math.max(...state.habits.map(h => h.streak || 0), 0);

  container.innerHTML = `
    <div class="screen-content">
      <div class="screen-header">
        <span style="font-size:26px">🏆</span>
        <h1 class="screen-title">Conquistas</h1>
      </div>

      <div class="card level-card">
        <div style="display:flex;align-items:center;gap:16px">
          <div style="text-align:center">
            <div style="font-size:12px;color:var(--text2)">Nível</div>
            <div class="level-num">${level}</div>
          </div>
          <div style="flex:1">
            <div style="display:flex;justify-content:space-between;font-size:13px;color:var(--text2);margin-bottom:6px">
              <span>${xp} XP total</span>
              <span>${xpInLevel}/${xpToNext} XP</span>
            </div>
            <div class="xp-bar-wrap"><div class="xp-bar-fill" style="width:${(xpInLevel/xpToNext)*100}%"></div></div>
            <div style="font-size:12px;color:var(--text3);margin-top:4px">${xpToNext - xpInLevel} XP para o próximo nível</div>
          </div>
        </div>
      </div>

      <div class="card" style="background:linear-gradient(135deg,#1a1008,#0d0c05);border-color:var(--orange)">
        <div style="display:flex;align-items:center;gap:12px">
          <span style="font-size:36px">🔥</span>
          <div>
            <div style="font-size:13px;color:var(--text2)">Maior streak de hábito</div>
            <div style="font-size:28px;font-weight:900;color:var(--orange)">${topStreak} dias</div>
          </div>
          <div style="margin-left:auto;text-align:right">
            <div style="font-size:13px;color:var(--text2)">Streak atual</div>
            <div style="font-size:28px;font-weight:900;color:var(--yellow)">${state.streak}</div>
          </div>
        </div>
      </div>

      <div class="badge-grid">
        ${ACHIEVEMENTS.map(ach => {
          const unlocked = state.achievements.includes(ach.id);
          return `
            <div class="badge-item ${unlocked ? 'unlocked' : 'locked'}">
              <div class="badge-emoji">${ach.icon}</div>
              <div class="badge-name">${ach.name}</div>
              ${unlocked ? `<div style="font-size:10px;color:var(--yellow);margin-top:4px">+${ach.xp} XP</div>` : ''}
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

// ========== MINIMAL DAY ==========
const MINIMAL_TASKS = [
  { icon: '💧', name: 'Beber água' },
  { icon: '🚿', name: 'Tomar banho' },
  { icon: '🛏️', name: 'Arrumar a cama' },
  { icon: '🍽️', name: 'Comer algo' },
  { icon: '🚶', name: 'Sair para caminhar' },
  { icon: '📖', name: 'Estudar 15 minutos' },
  { icon: '🌙', name: 'Dormir cedo' },
];

function renderMinimal(container) {
  const done = state.minimal.tasks.filter(Boolean).length;
  const allDone = done === MINIMAL_TASKS.length;

  container.innerHTML = `
    <div class="screen-content">
      <div class="screen-header">
        <span style="font-size:26px">🌱</span>
        <h1 class="screen-title">Modo Dia Difícil</h1>
      </div>

      <div class="card" style="background:linear-gradient(135deg,#0d1a0d,#071007);border-color:var(--green)">
        <p style="font-size:15px;color:var(--text2);line-height:1.6">Nem todo dia você vai estar no seu melhor. E tá tudo bem. Aqui estão 7 tarefas básicas — faça o que puder.</p>
      </div>

      <div class="card">
        <div style="display:flex;justify-content:space-between;margin-bottom:10px">
          <span style="color:var(--text2);font-size:14px">${done}/7 tarefas</span>
          <span style="color:var(--green);font-weight:700">${Math.round((done/7)*100)}%</span>
        </div>
        <div class="progress-bar-wrap">
          <div class="progress-bar-fill" style="width:${(done/7)*100}%;background:linear-gradient(90deg,var(--green),var(--accent))"></div>
        </div>
      </div>

      ${MINIMAL_TASKS.map((t, i) => `
        <div class="minimal-task ${state.minimal.tasks[i] ? 'done' : ''}" onclick="toggleMinimal(${i})">
          <span class="minimal-task-icon">${t.icon}</span>
          <span class="minimal-task-name" style="${state.minimal.tasks[i] ? 'text-decoration:line-through;color:var(--text3)' : ''}">${t.name}</span>
          <span class="minimal-check">${state.minimal.tasks[i] ? '✅' : '⬜'}</span>
        </div>
      `).join('')}

      <div class="celebration ${allDone ? 'show' : ''}">
        <h2>🎉 Você conseguiu!</h2>
        <p style="color:var(--text2)">Em um dia difícil, você completou tudo. Isso é força real.</p>
      </div>
    </div>
  `;
}

function toggleMinimal(idx) {
  state.minimal.tasks[idx] = !state.minimal.tasks[idx];
  if (state.minimal.tasks[idx]) { addXp(5); }
  saveState();
  navigate('minimal');
  if (state.minimal.tasks.every(Boolean)) {
    addXp(50);
    showToast('🎉 Modo dia difícil completo! +50 XP', 'success');
  }
}

// ========== WEEKLY ==========
function renderWeekly(container) {
  const w = state.weekly;

  container.innerHTML = `
    <div class="screen-content">
      <div class="screen-header">
        <span style="font-size:26px">📅</span>
        <h1 class="screen-title">Planejamento Semanal</h1>
      </div>

      <div class="card">
        <p style="font-size:14px;color:var(--text2);margin-bottom:16px">Reserve 5 minutos para definir a semana. Quem planeja, performa.</p>

        <div class="week-section">
          <div class="week-label">🎯 Foco principal da semana</div>
          <div class="week-sub">O que é mais importante alcançar?</div>
          <textarea class="form-textarea" id="w-focus" placeholder="Ex: Terminar o projeto X, estudar para a prova...">${w.focus || ''}</textarea>
        </div>

        <div class="week-section">
          <div class="week-label">🚧 Possíveis bloqueios</div>
          <div class="week-sub">O que pode atrapalhar?</div>
          <textarea class="form-textarea" id="w-blockers" placeholder="Ex: Reuniões demais, distração com redes sociais...">${w.blockers || ''}</textarea>
        </div>

        <div class="week-section">
          <div class="week-label">💪 Hábito para fortalecer</div>
          <div class="week-sub">Qual hábito você vai priorizar esta semana?</div>
          <textarea class="form-textarea" id="w-habit" placeholder="Ex: Dormir antes de meia-noite todo dia...">${w.habitToStrengthen || ''}</textarea>
        </div>

        <div class="week-section">
          <div class="week-label">📌 Metas da semana</div>
          <div class="week-sub">Liste 3 metas concretas</div>
          <textarea class="form-textarea" id="w-goals" placeholder="1. ...
2. ...
3. ..." style="min-height:100px">${w.goals || ''}</textarea>
        </div>

        <div class="week-section">
          <div class="week-label">🚫 O que evitar</div>
          <div class="week-sub">Comportamentos ou hábitos que você quer reduzir</div>
          <textarea class="form-textarea" id="w-avoid" placeholder="Ex: Passar mais de 1h no TikTok, comer fora todo dia...">${w.toAvoid || ''}</textarea>
        </div>

        <button class="btn-primary" onclick="saveWeekly()">💾 Salvar Planejamento</button>
      </div>
    </div>
  `;
}

function saveWeekly() {
  state.weekly = {
    focus: document.getElementById('w-focus')?.value || '',
    blockers: document.getElementById('w-blockers')?.value || '',
    habitToStrengthen: document.getElementById('w-habit')?.value || '',
    goals: document.getElementById('w-goals')?.value || '',
    toAvoid: document.getElementById('w-avoid')?.value || '',
  };
  addXp(30);
  saveState();
  checkAchievements();
  showToast('📅 Planejamento salvo! +30 XP', 'success');
}

// ========== SETTINGS ==========
function renderSettings(container) {
  const isDark = state.theme === 'dark';

  container.innerHTML = `
    <div class="screen-content">
      <div class="screen-header">
        <span style="font-size:26px">⚙️</span>
        <h1 class="screen-title">Configurações</h1>
      </div>

      <div class="settings-section">
        <div class="settings-section-title">Perfil</div>
        <div class="card">
          <div class="form-group">
            <label class="form-label">Seu nome</label>
            <input class="form-input" id="settings-name" value="${state.profile.name || ''}" placeholder="Seu nome" />
          </div>
          <button class="btn-primary" onclick="saveName()">Salvar nome</button>
        </div>
      </div>

      <div class="settings-section">
        <div class="settings-section-title">Aparência</div>
        <div class="card">
          <div class="toggle-row">
            <span class="toggle-label">${isDark ? '🌙 Tema escuro' : '☀️ Tema claro'}</span>
            <div class="toggle ${isDark ? 'on' : ''}" onclick="toggleTheme()"></div>
          </div>
        </div>
      </div>

      <div class="settings-section">
        <div class="settings-section-title">Estatísticas</div>
        <div class="card">
          <div class="toggle-row" style="border:none;padding:8px 0">
            <span style="color:var(--text2);font-size:14px">Total de tarefas feitas</span>
            <span style="font-weight:700">${state.totalTasksDone || 0}</span>
          </div>
          <div class="toggle-row" style="border:none;padding:8px 0">
            <span style="color:var(--text2);font-size:14px">Total de hábitos marcados</span>
            <span style="font-weight:700">${state.totalHabitsDone || 0}</span>
          </div>
          <div class="toggle-row" style="border:none;padding:8px 0">
            <span style="color:var(--text2);font-size:14px">Total de pomodoros</span>
            <span style="font-weight:700">${state.totalPomodoros || 0}</span>
          </div>
          <div class="toggle-row" style="border:none;padding:8px 0">
            <span style="color:var(--text2);font-size:14px">XP total</span>
            <span style="font-weight:700;color:var(--yellow)">${state.totalXp || 0}</span>
          </div>
          <div class="toggle-row" style="border:none;padding:8px 0">
            <span style="color:var(--text2);font-size:14px">Streak atual</span>
            <span style="font-weight:700;color:var(--orange)">🔥 ${state.streak}</span>
          </div>
        </div>
      </div>

      <div class="settings-section">
        <div class="settings-section-title" style="color:var(--red)">Zona de perigo</div>
        <div class="card" style="border-color:var(--red)">
          <p style="font-size:13px;color:var(--text2);margin-bottom:14px">Isso vai apagar todos os seus dados permanentemente.</p>
          <button class="danger-btn" onclick="confirmReset()">🗑️ Resetar tudo</button>
        </div>
      </div>
    </div>
  `;
}

function saveName() {
  const name = document.getElementById('settings-name')?.value.trim();
  if (!name) { showToast('Digite um nome válido', 'error'); return; }
  state.profile.name = name;
  saveState();
  showToast('Nome salvo!', 'success');
}

function confirmReset() {
  if (confirm('Tem certeza? Todos os dados serão apagados.')) {
    localStorage.removeItem(STORAGE_KEY);
    location.reload();
  }
}

// ========== START ==========
document.addEventListener('DOMContentLoaded', init);
