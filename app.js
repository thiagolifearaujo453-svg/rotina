/* =============================================================
   ROTINA v4 - Daily Routine Tracker
   Pure JS + localStorage - Mobile First
============================================================= */

// ============================================================
// CONSTANTS
// ============================================================
const STORAGE_KEY = 'rotina_v3';
const CATEGORIES = ['Saúde','Trabalho','Estudos','Treino','Alimentação','Mentalidade','Finanças','Organização'];

const QUOTES = [
  'Você não precisa estar motivado. Precisa começar.',
  'Disciplina não é ser perfeito. É voltar rápido quando sai do eixo.',
  'Fecha o TikTok e abre sua vida.',
  'Hoje não precisa vencer o mundo. Só não abandona você mesmo.',
  'Cada dia que você se apresenta, mesmo com pouco, é uma vitória.',
  'O segredo é simples: apareça todo dia.',
  'Progresso, não perfeição.',
  'Você já fez coisas difíceis antes. Isso aqui é só mais uma.',
  'Construa hoje a versão de amanhã.',
  'Pequena vitória hoje. Resultado grande depois.',
  'Seu futuro não aceita desculpa velha.',
  'Hoje é dia de fazer o básico bem feito.',
];

const LEVEL_TITLES = [
  'Iniciante','Aprendiz','Consistente','Focado','Determinado',
  'Disciplinado','Inabalável','Elite','Lendário','Imparable'
];

const ACHIEVEMENTS = [
  { id: 'first_day',       icon: '🌱', name: 'Primeira Rotina',      desc: 'Completou o primeiro dia',         xp: 50  },
  { id: 'streak_3',        icon: '🔥', name: 'Em Chamas',            desc: '3 dias seguidos',                  xp: 75  },
  { id: 'streak_7',        icon: '⚡',  name: 'Semana Sólida',         desc: '7 dias de streak',                 xp: 150 },
  { id: 'streak_30',       icon: '💎', name: 'Inabalável',           desc: '30 dias de streak',                xp: 500 },
  { id: 'tasks_100',       icon: '✅',  name: 'Executor',              desc: '100 tarefas concluídas',           xp: 200 },
  { id: 'habits_50',       icon: '🏆', name: 'Construtor',           desc: '50 hábitos marcados',              xp: 150 },
  { id: 'pomodoro_10',     icon: '🍅', name: 'Foco Total',           desc: '10 pomodoros completos',           xp: 100 },
  { id: 'study_10h',       icon: '📚', name: '10 Horas de Estudo',  desc: 'Acumulou 10h estudando',          xp: 200 },
  { id: 'study_50h',       icon: '🎓', name: 'Cabeça na Matéria',    desc: 'Acumulou 50h estudando',          xp: 500 },
  { id: 'water_7',         icon: '💧', name: 'Hidratado',            desc: '7 dias bebendo 8 copos',          xp: 100 },
  { id: 'workout_10',      icon: '💪', name: '10 Treinos',           desc: 'Completou 10 treinos',            xp: 150 },
  { id: 'workout_30',      icon: '🦵', name: '30 Treinos',           desc: 'Completou 30 treinos',            xp: 400 },
  { id: 'minimal_done',    icon: '🌙', name: 'Mesmo Assim',          desc: 'Completou rotina mínima',        xp: 75  },
  { id: 'perfect_week',    icon: '🚀', name: 'Semana Perfeita',      desc: '7 dias com score acima de 80',    xp: 350 },
  { id: 'mental_7',        icon: '🧠', name: 'Autoconsciência',      desc: '7 entradas no diário mental',   xp: 150 },
];

const DEFAULT_HABITS = [
  { id: 1, emoji: '🌅', name: 'Acordar cedo',              category: 'Saúde',       importance: 'alta',  streak: 0, history: [] },
  { id: 2, emoji: '💧', name: 'Beber 2L de água',          category: 'Saúde',       importance: 'alta',  streak: 0, history: [] },
  { id: 3, emoji: '💪', name: 'Treinar',                   category: 'Treino',      importance: 'alta',  streak: 0, history: [] },
  { id: 4, emoji: '📚', name: 'Estudar 2h',                category: 'Estudos',     importance: 'alta',  streak: 0, history: [] },
  { id: 5, emoji: '📖', name: 'Ler 10 páginas',             category: 'Mentalidade', importance: 'média', streak: 0, history: [] },
  { id: 6, emoji: '🌙', name: 'Dormir antes de meia-noite', category: 'Saúde',       importance: 'alta',  streak: 0, history: [] },
  { id: 7, emoji: '🏠', name: 'Organizar o quarto',         category: 'Organização', importance: 'baixa', streak: 0, history: [] },
  { id: 8, emoji: '💰', name: 'Controlar gastos',           category: 'Finanças',    importance: 'média', streak: 0, history: [] },
];

const DEFAULT_TASKS = [
  { id: 1, name: 'Beber água ao acordar',  category: 'Saúde',       status: 'pending' },
  { id: 2, name: 'Fazer exercícios',        category: 'Treino',      status: 'pending' },
  { id: 3, name: 'Estudar por 1 hora',      category: 'Estudos',     status: 'pending' },
  { id: 4, name: 'Ler por 20 minutos',      category: 'Mentalidade', status: 'pending' },
  { id: 5, name: 'Planejar o dia',           category: 'Organização', status: 'pending' },
];

const MINIMAL_TASKS = [
  { id: 'm1', icon: '💧', name: 'Tomar água' },
  { id: 'm2', icon: '🚿', name: 'Tomar banho' },
  { id: 'm3', icon: '🛏', name: 'Arrumar a cama' },
  { id: 'm4', icon: '🍽', name: 'Comer algo decente' },
  { id: 'm5', icon: '🚶', name: 'Caminhar 10 minutos' },
  { id: 'm6', icon: '📖', name: 'Estudar 15 minutos' },
  { id: 'm7', icon: '🌙', name: 'Dormir mais cedo hoje' },
  { id: 'm8', icon: '💬', name: 'Falar com alguém de confiança' },
];

// ============================================================
// STATE
// ============================================================
let state = null;
let currentScreen = 'home';
let pomodoroInterval = null;
let pomodoroSeconds = 25 * 60;
let pomodoroRunning = false;
let pomodoroMode = 'work';
let dailyQuoteIdx = new Date().getDate() % QUOTES.length;

function defaultState() {
  return {
    profile: null,
    today: getDateStr(),
    days: {},
    habits: JSON.parse(JSON.stringify(DEFAULT_HABITS)),
    weeklyPlan: {},
    xp: 0,
    level: 1,
    streak: 0,
    bestStreak: 0,
    achievements: [],
    totalTasks: 0,
    totalHabits: 0,
    totalPomodoros: 0,
    mentalEntries: 0,
    settings: { theme: 'dark', notifications: true },
    nextTaskId: 10,
    nextHabitId: 10,
  };
}

function defaultDay() {
  return {
    tasks: JSON.parse(JSON.stringify(DEFAULT_TASKS)),
    habitsChecked: {},
    study: { sessions: [], totalMinutes: 0 },
    health: { water: 0, workout: null, workoutType: '', sleep: 0, weight: 0, energy: 3 },
    mental: { mood: null, anxiety: 0, energy: 3, goodThing: '', worry: '', improvement: '', blocker: '', minAction: '' },
    minimalChecked: {},
    minimalDone: false,
    score: 0,
  };
}

function getDay(dateStr) {
  if (!state.days[dateStr]) state.days[dateStr] = defaultDay();
  return state.days[dateStr];
}

function today() { return getDay(state.today); }

// ============================================================
// PERSISTENCE
// ============================================================
function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      state = JSON.parse(saved);
      handleDateRollover();
    } else {
      state = defaultState();
    }
  } catch(e) {
    state = defaultState();
  }
}

function save() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch(e) {}
}

function handleDateRollover() {
  const now = getDateStr();
  if (state.today === now) return;
  const prevScore = getDay(state.today).score;
  if (prevScore >= 60) {
    state.streak++;
    if (state.streak > (state.bestStreak || 0)) state.bestStreak = state.streak;
  } else {
    state.streak = 0;
  }
  state.today = now;
}

// ============================================================
// UTILS
// ============================================================
function getDateStr(d) {
  const dt = d || new Date();
  return dt.toISOString().slice(0, 10);
}

function offsetDate(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return getDateStr(d);
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
}

function esc(s) {
  return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function calcScore(day) {
  const tasks = day.tasks || [];
  if (tasks.length === 0) return 0;
  let pts = 0;
  tasks.forEach(t => {
    if (t.status === 'done') pts += 1;
    else if (t.status === 'partial') pts += 0.5;
  });
  let taskScore = Math.round((pts / tasks.length) * 100);
  const hDone = Object.values(day.habitsChecked || {}).filter(Boolean).length;
  const hTotal = state.habits.length;
  let habitScore = hTotal > 0 ? Math.round((hDone / hTotal) * 100) : 0;
  return Math.min(100, Math.round(taskScore * 0.65 + habitScore * 0.35));
}

function getScoreColor(s) {
  if (s >= 80) return 'var(--green)';
  if (s >= 50) return 'var(--accent2)';
  if (s >= 25) return 'var(--orange)';
  return 'var(--red)';
}

function getScoreStatus(s) {
  if (s >= 90) return 'Você dominou o dia. Isso é raro.';
  if (s >= 75) return 'Hoje você está no controle.';
  if (s >= 50) return 'Na metade do caminho. Não para agora.';
  if (s >= 25) return 'Ainda dá tempo de virar o jogo.';
  if (s > 0)  return 'Começou. O resto é uma questão de escolha.';
  return 'O dia é seu. Qual é o primeiro passo?';
}

function getMotivation(score) {
  if (score === 100) return 'Missão cumprida. Você não é mais a mesma pessoa de ontem.';
  if (score >= 80) return 'Boa. Você manteve o controle.';
  if (score >= 60) return 'Ainda falta pouco. Não larga agora.';
  if (score >= 40) return 'Hoje foi meio baçunado, mas amanhã dá pra ajustar.';
  if (score >= 20) return 'Dia difícil também conta quando você não desiste.';
  return 'Começa pelo menor passo. Um copo de água já é algo.';
}

function getLevelTitle(level) {
  return LEVEL_TITLES[Math.min(level - 1, LEVEL_TITLES.length - 1)];
}

function xpForNextLevel(level) { return level * 150 + 100; }

// ============================================================
// XP & ACHIEVEMENTS
// ============================================================
function addXP(amount, label) {
  state.xp += amount;
  const needed = xpForNextLevel(state.level);
  if (state.xp >= needed) {
    state.xp -= needed;
    state.level++;
    showToast('🔝 Nível ' + state.level + '! ' + getLevelTitle(state.level), 'xp');
  }
  showXPFlash('+' + amount + ' XP' + (label ? ' — ' + label : ''));
  save();
}

function showXPFlash(text) {
  const el = document.getElementById('xp-flash');
  if (!el) return;
  el.textContent = text;
  el.classList.remove('hidden', 'show');
  void el.offsetWidth;
  el.classList.add('show');
  setTimeout(() => { el.classList.remove('show'); el.classList.add('hidden'); }, 800);
}

function checkAchievements() {
  const day = today();
  const score = calcScore(day);
  const totalStudyMin = Object.values(state.days).reduce((s, d) => s + (d.study?.totalMinutes || 0), 0);
  const totalWorkouts = Object.values(state.days).filter(d => d.health?.workout === true).length;
  const water7 = Array.from({length:7},(_,i) => offsetDate(-i)).every(d => (state.days[d]?.health?.water || 0) >= 8);
  const checks = [
    { id: 'first_day',    cond: () => score > 0 },
    { id: 'streak_3',     cond: () => state.streak >= 3 },
    { id: 'streak_7',     cond: () => state.streak >= 7 },
    { id: 'streak_30',    cond: () => state.streak >= 30 },
    { id: 'tasks_100',    cond: () => state.totalTasks >= 100 },
    { id: 'habits_50',    cond: () => state.totalHabits >= 50 },
    { id: 'pomodoro_10',  cond: () => state.totalPomodoros >= 10 },
    { id: 'study_10h',    cond: () => totalStudyMin >= 600 },
    { id: 'study_50h',    cond: () => totalStudyMin >= 3000 },
    { id: 'water_7',      cond: () => water7 },
    { id: 'workout_10',   cond: () => totalWorkouts >= 10 },
    { id: 'workout_30',   cond: () => totalWorkouts >= 30 },
    { id: 'minimal_done', cond: () => day.minimalDone },
    { id: 'mental_7',     cond: () => state.mentalEntries >= 7 },
    { id: 'perfect_week', cond: () => Array.from({length:7},(_,i) => offsetDate(-i)).every(d => (state.days[d]?.score||0) >= 80) },
  ];
  checks.forEach(({ id, cond }) => {
    if (!state.achievements.includes(id) && cond()) {
      state.achievements.push(id);
      const def = ACHIEVEMENTS.find(a => a.id === id);
      if (def) {
        state.xp += def.xp;
        showToast(def.icon + ' Conquista: ' + def.name + ' (+' + def.xp + ' XP)!', 'xp');
      }
    }
  });
  save();
}

// ============================================================
// SMART SUGGESTIONS
// ============================================================
function getSmartSuggestion() {
  const day = today();
  const m = day.mental;
  const h = day.health;
  const score = calcScore(day);
  const pending = day.tasks.filter(t => t.status === 'pending').length;

  if (h.sleep > 0 && h.sleep < 5.5)
    return { icon: '😴', type: 'warning', text: 'Você dormiu pouco. Hoje não inventa moda. Faz o básico bem feito e dorme mais cedo.' };

  if (m.mood && (m.mood === '😣' || m.mood === '😔') && m.anxiety >= 6)
    return { icon: '🧠', type: 'danger', text: 'Humor baixo e ansiedade alta. Reduz a meta: água, banho, caminhada curta e 25 minutos de foco. Isso já é vencer.' };

  if (m.anxiety >= 7)
    return { icon: '💨', type: 'danger', text: 'Ansiedade alta hoje. Para 5 minutos, respira fundo e anota o que tá te pesando. Depois volta pra rotina.' };

  if (m.energy === 1 || m.energy === 2)
    return { icon: '⚡', type: 'warning', text: 'Energia baixa. Comece pela tarefa mais simples. Movimento gera movimento, mesmo que pequeno.' };

  const noWorkout3 = [offsetDate(-1), offsetDate(-2), offsetDate(-3)].every(d => !state.days[d]?.health?.workout);
  if (noWorkout3 && !h.workout)
    return { icon: '🏋', type: 'warning', text: 'Você não treinou nos últimos 3 dias. Faz 20 minutos hoje, só pra não quebrar o ritmo.' };

  const noStudy2 = [offsetDate(-1), offsetDate(-2)].every(d => !(state.days[d]?.study?.totalMinutes > 0));
  if (noStudy2)
    return { icon: '📚', type: 'warning', text: 'Você não estudou nos últimos 2 dias. Começa com um bloco de 25 minutos. Sem drama, só abre o material.' };

  if (h.water === 0)
    return { icon: '💧', type: 'info', text: 'Você ainda não bebeu água hoje. Vai lá, um copo agora. Isso leva 10 segundos.' };

  if (pending >= 6)
    return { icon: '🎯', type: 'warning', text: 'Muitas tarefas pendentes. Escolha só 3 essenciais. O resto é bônus.' };

  if (score >= 80)
    return { icon: '🔥', type: 'success', text: 'Você está construindo ritmo. Protége esse momento. Não quebra a sequência.' };

  if (state.streak >= 7)
    return { icon: '💪', type: 'success', text: state.streak + ' dias no eixo. Isso não é sorte, é construção. Continua.' };

  return { icon: '💡', type: 'info', text: 'Fecha o TikTok e abre sua vida. Você tem o que precisa pra ter um bom dia.' };
}

// ============================================================
// TOAST
// ============================================================
function showToast(msg, type) {
  const c = document.getElementById('toast-container');
  if (!c) return;
  const t = document.createElement('div');
  t.className = 'toast' + (type ? ' ' + type : '');
  t.textContent = msg;
  c.appendChild(t);
  setTimeout(() => t.remove(), 3500);
}

// ============================================================
// NAVIGATION
// ============================================================
function navigate(screen) {
  currentScreen = screen;
  document.querySelectorAll('.nav-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.screen === screen);
  });
  renderScreen(screen);
}

function toggleMore() {
  const popup = document.getElementById('more-popup');
  const overlay = document.getElementById('more-overlay');
  if (!popup) return;
  const hidden = popup.classList.contains('hidden');
  popup.classList.toggle('hidden', !hidden);
  overlay.classList.toggle('hidden', !hidden);
}

function renderScreen(screen) {
  const renders = {
    home: renderHome, checklist: renderChecklist, habits: renderHabits,
    study: renderStudy, health: renderHealth, mental: renderMental,
    reports: renderReports, achievements: renderAchievements,
    minimal: renderMinimal, weekly: renderWeekly, settings: renderSettings,
  };
  if (renders[screen]) {
    today().score = calcScore(today());
    save();
    renders[screen]();
  }
}

function setContent(html) {
  const el = document.getElementById('main-content');
  if (el) { el.innerHTML = html; el.scrollTo(0, 0); }
}

// ============================================================
// ONBOARDING
// ============================================================
const OB_STEPS = [
  {
    emoji: '✦',
    title: 'Sua rotina.\nSeus resultados.',
    sub: 'Um app feito pra te ajudar a construir disciplina de verdade.\nNão é sobre ser perfeito. É sobre não parar.',
    type: 'welcome'
  },
  {
    emoji: '👤',
    title: 'Como te chamamos?',
    sub: 'Personaliza a experiência pra você.',
    type: 'name',
    field: { label: 'Seu nome', id: 'ob-name', placeholder: 'Ex: Rafael', type: 'text' }
  },
  {
    emoji: '🎯',
    title: 'Qual é seu foco?',
    sub: 'Selecione tudo que faz sentido pra você agora.',
    type: 'chips',
    key: 'goals',
    chips: ['Passar em concurso','Crescer no trabalho','Melhorar o corpo','Estudar mais','Organizar a vida','Ganhar dinheiro','Reduzir ansiedade','Criar disciplina']
  },
  {
    emoji: '⏰',
    title: 'Qual a sua rotina?',
    sub: 'Isso ajuda a criar sugestões certeiras.',
    type: 'schedule'
  },
  {
    emoji: '🙋',
    title: 'O que quer melhorar?',
    sub: 'Marque seus hábitos-alvo.',
    type: 'chips',
    key: 'habitTargets',
    chips: ['Água','Sono','Exercício','Alimentação','Estudo','Leitura','Organização','Finanças','Foco','Ansiedade']
  },
  {
    emoji: '📊',
    title: 'Seu nível de disciplina hoje?',
    sub: 'Seja honesto. Isso é só pra calibrar.',
    type: 'slider',
    key: 'disciplineLevel'
  },
];

let obStep = 0;
let obData = {};

function initOnboarding() {
  obStep = 0;
  obData = { goals: [], habitTargets: [], wakeTime: '06:00', sleepTime: '23:00', disciplineLevel: 5 };
  renderObStep();
  document.getElementById('ob-back').onclick = obBack;
  document.getElementById('ob-next').onclick = obNext;
}

function renderObStep() {
  const step = OB_STEPS[obStep];
  const dots = OB_STEPS.map((_, i) => `<div class="ob-dot${i < obStep ? ' done' : i === obStep ? ' active' : ''}"></div>`).join('');
  document.getElementById('ob-dots').innerHTML = dots;

  const backBtn = document.getElementById('ob-back');
  const nextBtn = document.getElementById('ob-next');
  backBtn.style.display = obStep === 0 ? 'none' : '';
  nextBtn.textContent = obStep === OB_STEPS.length - 1 ? 'Começar minha rotina →' : 'Próximo';

  let body = '';
  if (step.type === 'welcome') {
    body = `<div class="ob-emoji" style="font-size:72px;color:var(--accent2);font-weight:900">${step.emoji}</div>
      <h1 class="ob-title" style="white-space:pre-line">${step.title}</h1>
      <p class="ob-sub">${step.sub}</p>`;
  } else if (step.type === 'name') {
    body = `<div class="ob-emoji">${step.emoji}</div>
      <h1 class="ob-title">${step.title}</h1>
      <p class="ob-sub">${step.sub}</p>
      <div class="form-group">
        <label class="form-label">${step.field.label}</label>
        <input class="form-input" id="${step.field.id}" placeholder="${step.field.placeholder}" type="${step.field.type}" value="${esc(obData.name||'')}" />
      </div>`;
  } else if (step.type === 'chips') {
    const selected = obData[step.key] || [];
    const chips = step.chips.map(c =>
      `<span class="chip${selected.includes(c) ? ' selected' : ''}" onclick="obToggleChip('${step.key}','${c}',this)">${c}</span>`
    ).join('');
    body = `<div class="ob-emoji">${step.emoji}</div>
      <h1 class="ob-title">${step.title}</h1>
      <p class="ob-sub">${step.sub}</p>
      <div class="chip-wrap">${chips}</div>`;
  } else if (step.type === 'schedule') {
    body = `<div class="ob-emoji">${step.emoji}</div>
      <h1 class="ob-title">${step.title}</h1>
      <p class="ob-sub">${step.sub}</p>
      <div class="form-group">
        <label class="form-label">Acordo às</label>
        <input class="form-input" id="ob-wake" type="time" value="${obData.wakeTime}" />
      </div>
      <div class="form-group">
        <label class="form-label">Durmo às</label>
        <input class="form-input" id="ob-sleep" type="time" value="${obData.sleepTime}" />
      </div>
      <div class="chip-wrap">
        ${['Trabalho','Estudo','Treino'].map(a =>
          `<span class="chip${(obData.activities||[]).includes(a)?' selected':''}" onclick="obToggleChip('activities','${a}',this)">${a}</span>`
        ).join('')}
      </div>`;
  } else if (step.type === 'slider') {
    body = `<div class="ob-emoji">${step.emoji}</div>
      <h1 class="ob-title">${step.title}</h1>
      <p class="ob-sub">${step.sub}</p>
      <div style="text-align:center;font-size:64px;font-weight:900;color:var(--accent2);margin:16px 0" id="ob-dis-val">${obData.disciplineLevel}</div>
      <input class="range-input" type="range" min="1" max="10" value="${obData.disciplineLevel}"
        oninput="obData.disciplineLevel=+this.value;document.getElementById('ob-dis-val').textContent=this.value" />
      <div style="display:flex;justify-content:space-between;font-size:12px;color:var(--text3);margin-top:8px">
        <span>Iniciante</span><span>Moderado</span><span>Avançado</span>
      </div>`;
  }
  document.getElementById('ob-step').innerHTML = body;
}

function obToggleChip(key, val, el) {
  if (!obData[key]) obData[key] = [];
  const idx = obData[key].indexOf(val);
  if (idx >= 0) { obData[key].splice(idx, 1); el.classList.remove('selected'); }
  else { obData[key].push(val); el.classList.add('selected'); }
}

function obBack() {
  if (obStep > 0) { obStep--; renderObStep(); }
}

function obNext() {
  const step = OB_STEPS[obStep];
  if (step.type === 'name') {
    const v = document.getElementById('ob-name')?.value?.trim();
    if (!v) { showToast('Coloca seu nome aí!', 'error'); return; }
    obData.name = v;
  }
  if (step.type === 'schedule') {
    obData.wakeTime = document.getElementById('ob-wake')?.value || '06:00';
    obData.sleepTime = document.getElementById('ob-sleep')?.value || '23:00';
  }
  if (obStep < OB_STEPS.length - 1) {
    obStep++;
    renderObStep();
  } else {
    finishOnboarding();
  }
}

function finishOnboarding() {
  state.profile = { ...obData, completed: true };
  state.settings.theme = 'dark';
  if (obData.name) state.settings.name = obData.name;
  save();
  showApp();
}

function showApp() {
  document.getElementById('screen-onboarding').classList.remove('active');
  document.getElementById('screen-app').classList.add('active');
  document.getElementById('bottom-nav').style.display = 'flex';
  navigate('home');
}

// ============================================================
// HOME
// ============================================================
function renderHome() {
  const day = today();
  const score = calcScore(day);
  day.score = score;
  save();

  const name = state.settings?.name || state.profile?.name || 'você';
  const done = day.tasks.filter(t => t.status === 'done').length;
  const total = day.tasks.length;
  const hDone = Object.values(day.habitsChecked || {}).filter(Boolean).length;
  const hTotal = state.habits.length;
  const xpNeeded = xpForNextLevel(state.level);
  const xpPct = Math.round((state.xp / xpNeeded) * 100);
  const dateStr = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
  const suggestion = getSmartSuggestion();
  const quote = QUOTES[dailyQuoteIdx];
  const scoreColor = getScoreColor(score);

  const statsCards = [
    { icon: '✅', val: done + '/' + total, label: 'Tarefas', pct: total ? Math.round(done/total*100) : 0, screen: 'checklist' },
    { icon: '🔥', val: hDone + '/' + hTotal, label: 'Hábitos', pct: hTotal ? Math.round(hDone/hTotal*100) : 0, screen: 'habits' },
    { icon: '💧', val: day.health.water + ' copos', label: 'Água', pct: Math.min(100, Math.round(day.health.water/8*100)), screen: 'health' },
    { icon: '💪', val: day.health.workout === true ? 'Feito ✓' : day.health.workout === false ? 'Não' : '—', label: 'Treino', pct: day.health.workout === true ? 100 : 0, screen: 'health' },
    { icon: '📚', val: +(day.study.totalMinutes/60).toFixed(1) + 'h', label: 'Estudo', pct: Math.min(100, Math.round(day.study.totalMinutes/120*100)), screen: 'study' },
    { icon: day.mental.mood || '😶', val: day.mental.mood || '—', label: 'Humor', pct: 0, screen: 'mental', noBar: true },
    { icon: '😴', val: day.health.sleep ? day.health.sleep + 'h' : '—', label: 'Sono', pct: day.health.sleep ? Math.min(100, Math.round(day.health.sleep/8*100)) : 0, screen: 'health' },
    { icon: '📴', val: state.streak + ' dias', label: 'Sequência', pct: Math.min(100, Math.round(state.streak/30*100)), screen: 'achievements', barClass: 'orange' },
  ];

  const statsHTML = statsCards.map(s =>
    `<div class="stat-card" onclick="navigate('${s.screen}')">
      <div class="stat-icon">${s.icon}</div>
      <div class="stat-value">${s.val}</div>
      <div class="stat-label">${s.label}</div>
      ${!s.noBar ? `<div class="stat-bar"><div class="progress-bar-wrap" style="margin:0"><div class="progress-bar-fill${s.barClass?' '+s.barClass:''}" style="width:${s.pct}%"></div></div></div>` : ''}
    </div>`
  ).join('');

  setContent(`
    <div class="screen-content">
      <div class="hero-card">
        <div class="hero-greeting">${getGreeting()}, ${dateStr}</div>
        <div class="hero-name">${esc(name)}</div>
        <div class="hero-status">${getScoreStatus(score)}</div>
        <div class="hero-row">
          <div class="hero-score-wrap">
            <div class="hero-score" style="background:linear-gradient(135deg,${scoreColor},var(--accent2));-webkit-background-clip:text;background-clip:text">${score}</div>
            <div class="hero-score-label">Score do dia</div>
          </div>
          <div class="hero-stats">
            <div class="hero-stat-item">
              <span class="hero-stat-label">🔥 Sequência</span>
              <span class="hero-stat-val">${state.streak} dias</span>
            </div>
            <div class="hero-stat-item">
              <span class="hero-stat-label">⭐ Nível</span>
              <span class="hero-stat-val">${state.level} — ${getLevelTitle(state.level)}</span>
            </div>
            <div class="hero-stat-item">
              <span class="hero-stat-label">🔩 XP</span>
              <span class="hero-stat-val">${state.xp} / ${xpForNextLevel(state.level)}</span>
            </div>
          </div>
        </div>
        <div class="hero-xp-section">
          <div class="hero-xp-label"><span>XP para o próximo nível</span><span>${xpPct}%</span></div>
          <div class="progress-bar-wrap" style="height:6px"><div class="progress-bar-fill purple" style="width:${xpPct}%"></div></div>
        </div>
        <div class="hero-quote">“${quote}”</div>
      </div>

      <div class="suggestion-card ${suggestion.type}">
        <div class="suggestion-icon">${suggestion.icon}</div>
        <div class="suggestion-body">
          <div class="suggestion-title">Sugestão do dia</div>
          <div class="suggestion-text">${suggestion.text}</div>
        </div>
      </div>

      <div class="section-label">Resumo de hoje</div>
      <div class="stats-grid">${statsHTML}</div>

      <div class="quick-btns">
        <button class="quick-btn" onclick="navigate('minimal')">🌙 Dia difícil</button>
        <button class="quick-btn" onclick="navigate('reports')">📊 Ver progresso</button>
        <button class="quick-btn" onclick="navigate('achievements')">🏆 Conquistas</button>
      </div>
    </div>
  `);
}

// ============================================================
// CHECKLIST
// ============================================================
function renderChecklist() {
  const day = today();
  const done = day.tasks.filter(t => t.status === 'done').length;
  const partial = day.tasks.filter(t => t.status === 'partial').length;
  const total = day.tasks.length;
  const pts = done + partial * 0.5;
  const pct = total ? Math.round(pts / total * 100) : 0;
  const score = calcScore(day);

  const byCategory = {};
  day.tasks.forEach(t => {
    if (!byCategory[t.category]) byCategory[t.category] = [];
    byCategory[t.category].push(t);
  });

  const tasksHTML = Object.entries(byCategory).map(([cat, tasks]) =>
    `<div class="category-label">${cat}</div>` +
    tasks.map(t => `
      <div class="task-item" id="task-${t.id}">
        <div class="task-btns">
          <button class="task-btn${t.status==='done'?' done':''}" onclick="setTaskStatus(${t.id},'done')" title="Feita">✓</button>
          <button class="task-btn${t.status==='partial'?' partial':''}" onclick="setTaskStatus(${t.id},'partial')" title="Parcial">∼</button>
          <button class="task-btn${t.status==='skip'?' skip':''}" onclick="setTaskStatus(${t.id},'skip')" title="Pulei">×</button>
        </div>
        <span class="task-name${t.status==='done'?' done':t.status==='skip'?' skip':''}">${esc(t.name)}</span>
        <button class="task-delete-btn" onclick="deleteTask(${t.id})" title="Remover">🗑</button>
      </div>`
    ).join('')
  ).join('');

  setContent(`
    <div class="screen-content">
      <div class="screen-header">
        <span class="screen-title">Hoje</span>
        <span style="font-size:22px;font-weight:800;color:${getScoreColor(score)}">${score} pts</span>
      </div>
      <div class="progress-hero">
        <div class="progress-hero-top">
          <div>
            <div class="progress-pct" style="color:${getScoreColor(pct)}">${pct}%</div>
            <div class="progress-label">${done} de ${total} concluídas</div>
          </div>
          <button class="btn-sm" style="background:var(--surface2);border:1.5px solid var(--border);color:var(--text2)" onclick="resetDayTasks()">↺ Reiniciar</button>
        </div>
        <div class="progress-bar-wrap"><div class="progress-bar-fill" style="width:${pct}%"></div></div>
        <div class="progress-motivation">${getMotivation(pct)}</div>
      </div>

      <div class="card">
        ${tasksHTML || '<p style="color:var(--text3);text-align:center;padding:16px 0">Nenhuma tarefa. Adicione abaixo!</p>'}
      </div>

      <div class="card">
        <div class="card-title">Adicionar tarefa</div>
        <select class="form-select" id="new-task-cat" style="margin-bottom:8px">
          ${CATEGORIES.map(c => `<option>${c}</option>`).join('')}
        </select>
        <div style="display:flex;gap:8px">
          <input class="form-input" id="new-task-name" placeholder="Nome da tarefa..." style="flex:1;margin:0" onkeydown="if(event.key==='Enter')addTask()" />
          <button class="btn-primary" style="flex:0;padding:12px 18px;font-size:20px" onclick="addTask()">+</button>
        </div>
      </div>
    </div>
  `);
}

function setTaskStatus(id, status) {
  const day = today();
  const task = day.tasks.find(t => t.id === id);
  if (!task) return;
  const prev = task.status;
  task.status = task.status === status ? 'pending' : status;
  if (task.status === 'done' && prev !== 'done') {
    addXP(10, 'Tarefa');
    state.totalTasks++;
    const el = document.getElementById('task-' + id);
    if (el) el.classList.add('completing');
  }
  today().score = calcScore(today());
  save();
  checkAchievements();
  renderChecklist();
}

function deleteTask(id) {
  today().tasks = today().tasks.filter(t => t.id !== id);
  save(); renderChecklist();
}

function addTask() {
  const name = document.getElementById('new-task-name')?.value?.trim();
  const cat = document.getElementById('new-task-cat')?.value || 'Organização';
  if (!name) return;
  today().tasks.push({ id: state.nextTaskId++, name, category: cat, status: 'pending' });
  save(); renderChecklist();
}

function resetDayTasks() {
  if (!confirm('Desmarcar todas as tarefas?')) return;
  today().tasks.forEach(t => t.status = 'pending');
  save(); renderChecklist();
}

// ============================================================
// HABITS
// ============================================================
function renderHabits() {
  const day = today();
  const habitsHTML = state.habits.map(h => {
    const checked = day.habitsChecked[h.id] || false;
    const impClass = h.importance === 'alta' ? 'imp-alta' : h.importance === 'média' ? 'imp-media' : 'imp-baixa';
    return `
      <div class="habit-item">
        <div class="habit-emoji">${h.emoji}</div>
        <div class="habit-info">
          <div class="habit-name">${esc(h.name)}</div>
          <div class="habit-meta">
            <span>${h.category}</span>
            <span class="imp-badge ${impClass}">${h.importance}</span>
            <span class="habit-streak-badge">🔥 ${h.streak} dias</span>
          </div>
        </div>
        <div class="habit-check${checked?' checked':''}" onclick="toggleHabit(${h.id})">${checked ? '✓' : ''}</div>
        <button style="background:none;border:none;color:var(--text3);font-size:18px;cursor:pointer;margin-left:4px" onclick="deleteHabit(${h.id})">×</button>
      </div>`;
  }).join('');

  setContent(`
    <div class="screen-content">
      <div class="screen-header"><span class="screen-title">Hábitos</span></div>
      <div class="card">
        ${habitsHTML || '<p style="color:var(--text3);text-align:center;padding:12px 0">Nenhum hábito ainda.</p>'}
      </div>
      <div class="card">
        <div class="card-title">Novo hábito</div>
        <div style="display:flex;gap:8px;margin-bottom:8px">
          <input class="form-input" id="new-habit-emoji" placeholder="🌙" maxlength="2" style="width:60px;flex:none;text-align:center" />
          <input class="form-input" id="new-habit-name" placeholder="Nome do hábito" style="flex:1" />
        </div>
        <div style="display:flex;gap:8px;margin-bottom:10px">
          <select class="form-select" id="new-habit-cat" style="flex:1">
            ${CATEGORIES.map(c => `<option>${c}</option>`).join('')}
          </select>
          <select class="form-select" id="new-habit-imp" style="flex:1">
            <option value="alta">Alta</option>
            <option value="média" selected>Média</option>
            <option value="baixa">Baixa</option>
          </select>
        </div>
        <button class="btn-primary" style="width:100%" onclick="addHabit()">Adicionar hábito</button>
      </div>
    </div>
  `);
}

function toggleHabit(id) {
  const day = today();
  const prev = day.habitsChecked[id] || false;
  day.habitsChecked[id] = !prev;
  const habit = state.habits.find(h => h.id === id);
  if (!prev && habit) {
    habit.streak = (habit.streak || 0) + 1;
    habit.history = habit.history || [];
    habit.history.push(state.today);
    addXP(15, 'Hábito');
    state.totalHabits++;
  } else if (prev && habit) {
    habit.streak = Math.max(0, (habit.streak || 1) - 1);
  }
  today().score = calcScore(today());
  save(); checkAchievements(); renderHabits();
}

function deleteHabit(id) {
  if (!confirm('Remover este hábito?')) return;
  state.habits = state.habits.filter(h => h.id !== id);
  delete today().habitsChecked[id];
  save(); renderHabits();
}

function addHabit() {
  const name = document.getElementById('new-habit-name')?.value?.trim();
  const emoji = document.getElementById('new-habit-emoji')?.value?.trim() || '⭐';
  const category = document.getElementById('new-habit-cat')?.value || 'Saúde';
  const importance = document.getElementById('new-habit-imp')?.value || 'média';
  if (!name) { showToast('Nome do hábito obrigatório', 'error'); return; }
  state.habits.push({ id: state.nextHabitId++, emoji, name, category, importance, streak: 0, history: [] });
  save(); renderHabits();
}

// ============================================================
// STUDY
// ============================================================
function renderStudy() {
  const day = today();
  const totalH = Math.floor(day.study.totalMinutes / 60);
  const totalM = day.study.totalMinutes % 60;
  const mm = String(Math.floor(pomodoroSeconds / 60)).padStart(2, '0');
  const ss = String(pomodoroSeconds % 60).padStart(2, '0');
  const modeColors = { work: 'work', short: 'short', long: 'long' };
  const modeLabels = { work: 'Foco 📊', short: 'Pausa curta ☕', long: 'Pausa longa 🛌' };

  const sessionsHTML = day.study.sessions.length
    ? day.study.sessions.map(s =>
        `<div class="session-item"><span class="session-subject">${esc(s.subject)}</span><span class="session-time">${s.minutes} min</span></div>`
      ).join('')
    : '<p style="color:var(--text3);text-align:center;padding:12px 0">Nenhuma sessão ainda.</p>';

  setContent(`
    <div class="screen-content">
      <div class="screen-header"><span class="screen-title">Estudos</span></div>

      <div class="study-total-card">
        <div>
          <div class="study-total-val">${totalH}h ${totalM}min</div>
          <div class="study-total-label">estudados hoje</div>
        </div>
        <span style="font-size:40px">📚</span>
      </div>

      <div class="pomodoro-card ${modeColors[pomodoroMode]}">
        <div class="pomo-mode-tabs">
          <button class="pomo-tab${pomodoroMode==='work'?' active':''}" onclick="setPomodoroMode('work')">Foco 25</button>
          <button class="pomo-tab${pomodoroMode==='short'?' active':''}" onclick="setPomodoroMode('short')">Pausa 5</button>
          <button class="pomo-tab${pomodoroMode==='long'?' active':''}" onclick="setPomodoroMode('long')">Pausa 15</button>
        </div>
        <div class="pomo-mode-label">${modeLabels[pomodoroMode]}</div>
        <div class="pomo-time${pomodoroMode==='work'?' work-color':pomodoroMode==='short'?' short-color':''}" id="pomo-display">${mm}:${ss}</div>
        <div class="pomo-btns">
          <button class="btn-primary" style="flex:none;padding:12px 24px" onclick="togglePomodoro()">${pomodoroRunning ? '⏸ Pausar' : '▶ Iniciar'}</button>
          <button class="btn-ghost" style="flex:none;padding:12px 18px" onclick="resetPomodoro()">↺ Reset</button>
        </div>
      </div>

      <div class="card">
        <div class="card-title">Registrar sessão manual</div>
        <input class="form-input" id="study-subject" placeholder="Matéria / assunto" />
        <input class="form-input" id="study-mins" type="number" placeholder="Minutos estudados" min="1" max="600" />
        <button class="btn-primary" style="width:100%" onclick="addStudySession()">Registrar</button>
      </div>

      <div class="card">
        <div class="card-title">Sessões de hoje</div>
        ${sessionsHTML}
      </div>
    </div>
  `);
}

function setPomodoroMode(mode) {
  if (pomodoroRunning) { clearInterval(pomodoroInterval); pomodoroRunning = false; }
  pomodoroMode = mode;
  pomodoroSeconds = mode === 'work' ? 25*60 : mode === 'short' ? 5*60 : 15*60;
  renderStudy();
}

function togglePomodoro() {
  if (pomodoroRunning) {
    clearInterval(pomodoroInterval);
    pomodoroRunning = false;
  } else {
    pomodoroRunning = true;
    pomodoroInterval = setInterval(() => {
      pomodoroSeconds--;
      if (pomodoroSeconds <= 0) {
        clearInterval(pomodoroInterval);
        pomodoroRunning = false;
        const mins = pomodoroMode === 'work' ? 25 : pomodoroMode === 'short' ? 5 : 15;
        if (pomodoroMode === 'work') {
          addXP(20, 'Pomodoro');
          state.totalPomodoros++;
          today().study.sessions.push({ subject: 'Pomodoro', minutes: 25 });
          today().study.totalMinutes += 25;
          showToast('🍅 Pomodoro concluído! Faz uma pausa.', 'success');
          checkAchievements();
        } else {
          showToast('✅ Pausa encerrada! Hora de focar.', 'info');
        }
        pomodoroSeconds = pomodoroMode === 'work' ? 25*60 : pomodoroMode === 'short' ? 5*60 : 15*60;
        save();
        renderStudy();
        return;
      }
      if (currentScreen === 'study') {
        const el = document.getElementById('pomo-display');
        if (el) el.textContent = String(Math.floor(pomodoroSeconds/60)).padStart(2,'0') + ':' + String(pomodoroSeconds%60).padStart(2,'0');
      }
    }, 1000);
  }
  renderStudy();
}

function resetPomodoro() {
  clearInterval(pomodoroInterval);
  pomodoroRunning = false;
  pomodoroSeconds = pomodoroMode === 'work' ? 25*60 : pomodoroMode === 'short' ? 5*60 : 15*60;
  renderStudy();
}

function addStudySession() {
  const subject = document.getElementById('study-subject')?.value?.trim();
  const mins = parseInt(document.getElementById('study-mins')?.value);
  if (!subject || !mins || mins < 1) { showToast('Preencha os campos', 'error'); return; }
  today().study.sessions.push({ subject, minutes: mins });
  today().study.totalMinutes += mins;
  addXP(Math.round(mins / 5), 'Estudo');
  save(); checkAchievements(); renderStudy();
}

// ============================================================
// HEALTH
// ============================================================
function renderHealth() {
  const h = today().health;
  const waterGlasses = Array.from({length:8}, (_,i) =>
    `<div class="water-glass${i < h.water ? ' filled' : ''}" onclick="setWater(${i+1})">💧</div>`
  ).join('');

  setContent(`
    <div class="screen-content">
      <div class="screen-header"><span class="screen-title">Treino & Saúde</span></div>

      <div class="card">
        <div class="card-title">💧 Consumo de água</div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
          <span style="color:var(--text2);font-size:14px">${h.water} de 8 copos</span>
          <span style="font-size:13px;color:var(--accent2);font-weight:700">${Math.round(h.water/8*100)}%</span>
        </div>
        <div class="progress-bar-wrap"><div class="progress-bar-fill" style="width:${Math.min(100,h.water/8*100)}%"></div></div>
        <div class="water-grid">${waterGlasses}</div>
      </div>

      <div class="card">
        <div class="card-title">💪 Treino de hoje</div>
        <div class="workout-toggle">
          <button class="toggle-btn${h.workout===true?' active-yes':''}" onclick="setWorkout(true)">✓ Treinei</button>
          <button class="toggle-btn${h.workout===false?' active-no':''}" onclick="setWorkout(false)">× Não treinei</button>
        </div>
        ${h.workout===true ? `<input class="form-input" id="workout-type" placeholder="Tipo: musculação, corrida, yoga..." value="${esc(h.workoutType||'')}" oninput="saveWorkoutType(this.value)" />` : ''}
      </div>

      <div class="card">
        <div class="card-title">😴 Sono ontem (horas)</div>
        <div style="display:flex;gap:8px">
          <input class="form-input" id="sleep-input" type="number" placeholder="Ex: 7.5" min="0" max="24" step="0.5" value="${h.sleep||''}" style="flex:1" />
          <button class="btn-primary" style="flex:none;padding:12px 16px" onclick="saveSleep()">Salvar</button>
        </div>
        ${h.sleep > 0 && h.sleep < 6 ? '<p style="color:var(--red);font-size:13px;margin-top:8px">⚠️ Sono abaixo de 6h. Tente dormir mais cedo hoje.</p>' : ''}
      </div>

      <div class="card">
        <div class="card-title">⚖️ Peso corporal (kg)</div>
        <div style="display:flex;gap:8px">
          <input class="form-input" id="weight-input" type="number" placeholder="Ex: 75.2" step="0.1" value="${h.weight||''}" style="flex:1" />
          <button class="btn-primary" style="flex:none;padding:12px 16px" onclick="saveWeight()">Salvar</button>
        </div>
      </div>

      <div class="card">
        <div class="card-title">⚡ Nível de energia hoje</div>
        <div class="energy-btns">
          ${['😴','😕','😐','🙂','😄'].map((e,i) =>
            `<button class="energy-btn${h.energy===i+1?' selected':''}" onclick="setEnergy(${i+1})">${e}<br><span style="font-size:10px;color:var(--text3)">${i+1}</span></button>`
          ).join('')}
        </div>
        <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--text3);margin-top:6px">
          <span>Esgotado</span><span>No limite</span>
        </div>
      </div>
    </div>
  `);
}

function setWater(n) {
  const h = today().health;
  h.water = h.water === n ? n - 1 : n;
  if (h.water < 0) h.water = 0;
  if (n > h.water + 1 || (h.water >= 1)) addXP(2, 'Água');
  save(); renderHealth();
}

function setWorkout(val) {
  today().health.workout = val;
  if (val) { addXP(30, 'Treino'); checkAchievements(); }
  save(); renderHealth();
}

function saveWorkoutType(val) { today().health.workoutType = val; save(); }

function saveSleep() {
  const v = parseFloat(document.getElementById('sleep-input')?.value);
  if (!isNaN(v) && v >= 0) { today().health.sleep = v; save(); showToast('Sono registrado!', 'success'); renderHealth(); }
}

function saveWeight() {
  const v = parseFloat(document.getElementById('weight-input')?.value);
  if (!isNaN(v) && v > 0) { today().health.weight = v; save(); showToast('Peso registrado!', 'success'); }
}

function setEnergy(n) { today().health.energy = n; save(); renderHealth(); }

// ============================================================
// MENTAL
// ============================================================
function renderMental() {
  const m = today().mental;
  const moods = ['😄','🙂','😐','😔','😣'];
  const anxietyHigh = m.anxiety >= 7;

  let reflection = '';
  if (m.mood || m.goodThing || m.worry) {
    if (m.anxiety >= 8) reflection = 'A ansiedade está alta hoje. Mas você abriu o app e registrou. Isso já é autoconsciência. Começa com 5 minutos de respiração.';
    else if (m.mood === '😣' || m.mood === '😔') reflection = 'Dia pesado. Não precisa ser perfeito. Só precisa não abandonar você mesmo.';
    else if (m.mood === '😄') reflection = 'Bom humor hoje. Aproveita esse estádo pra fazer aquilo que você vem adiando.';
    else if (m.goodThing && m.worry) reflection = 'Você viu o lado bom e o que te pesa. Esse equilíbrio é maturidade. Continue vindo aqui.';
    else if (m.goodThing) reflection = 'Tem coisa boa acontecendo. Reconhecer isso é importante pra não deixar o ruim dominar.';
    else if (m.blocker) reflection = 'Identificar o que te bloqueia já é metade da solução. Amanhã você pode trabalhar direto nisso.';
    else reflection = 'Registrar como você está é o primeiro passo pra mudar. Continue vindo aqui.';
  }

  setContent(`
    <div class="screen-content">
      <div class="screen-header"><span class="screen-title">Diário Mental</span></div>

      <div class="card">
        <div class="card-title">Como você está hoje?</div>
        <div class="mood-btns">
          ${moods.map(e => `<button class="mood-btn${m.mood===e?' selected':''}" onclick="setMood('${e}')">${e}</button>`).join('')}
        </div>
      </div>

      <div class="card">
        <div class="card-title">Nível de ansiedade</div>
        <div class="slider-group">
          <div class="slider-label">
            <span>😌 Calmo</span>
            <span class="slider-label-end" id="anx-val">${m.anxiety}</span>
            <span>😱 Ansioso</span>
          </div>
          <input class="range-input" type="range" min="0" max="10" value="${m.anxiety}"
            oninput="updateAnxiety(+this.value)" />
        </div>
        ${anxietyHigh ? `
        <div class="anxiety-alert">
          <span style="font-size:22px">🚨</span>
          <div>
            <div style="font-size:14px;font-weight:700;color:var(--red);margin-bottom:4px">Ansiedade alta</div>
            <div style="font-size:13px;color:var(--text2)">Considera fazer a rotina mínima hoje. É suficiente.</div>
            <button class="btn-sm" style="background:var(--surface3);border:1.5px solid var(--border);color:var(--text);margin-top:8px" onclick="navigate('minimal');toggleMore()">Ir para dia difícil</button>
          </div>
        </div>` : ''}
      </div>

      <div class="card">
        <div class="card-title">⚡ Nível de energia</div>
        <div class="slider-group">
          <div class="slider-label">
            <span>Sem força</span>
            <span class="slider-label-end" id="energy-mental-val">${m.energy}</span>
            <span>Cheio</span>
          </div>
          <input class="range-input" type="range" min="1" max="5" value="${m.energy}"
            oninput="updateMentalEnergy(+this.value)" />
        </div>
      </div>

      <div class="card">
        <div class="card-title">✨ Uma coisa boa do dia</div>
        <textarea class="form-textarea" id="good-thing" placeholder="Algo positivo que aconteceu ou que você agradece..." oninput="saveMentalFields()">${esc(m.goodThing)}</textarea>
      </div>

      <div class="card">
        <div class="card-title">😔 Uma preocupação</div>
        <textarea class="form-textarea" id="worry" placeholder="O que está te pesando hoje..." oninput="saveMentalFields()">${esc(m.worry)}</textarea>
      </div>

      <div class="card">
        <div class="card-title">🚫 O que me atrapalhou hoje?</div>
        <textarea class="form-textarea" id="blocker" placeholder="Distrações, imprevistos, falta de energia..." oninput="saveMentalFields()">${esc(m.blocker||'')}</textarea>
      </div>

      <div class="card">
        <div class="card-title">🎯 Menor ação que posso fazer agora</div>
        <textarea class="form-textarea" id="min-action" placeholder="Qual é o menor passo possível agora?" oninput="saveMentalFields()" style="min-height:60px">${esc(m.minAction||'')}</textarea>
      </div>

      <div class="card">
        <div class="card-title">🔄 Uma atitude pra amanhã</div>
        <textarea class="form-textarea" id="improvement" placeholder="O que você pode fazer diferente..." oninput="saveMentalFields()" style="min-height:60px">${esc(m.improvement)}</textarea>
      </div>

      ${reflection ? `<div class="reflection-box"><div class="reflection-label">💬 Reflexão</div>${reflection}</div>` : ''}

      <button class="btn-primary" style="width:100%;margin-top:4px" onclick="saveMentalAll()">Salvar diário +25 XP</button>
    </div>
  `);
}

function setMood(emoji) { today().mental.mood = emoji; save(); renderMental(); }
function updateAnxiety(v) {
  today().mental.anxiety = v;
  const el = document.getElementById('anx-val');
  if (el) el.textContent = v;
  save();
}
function updateMentalEnergy(v) {
  today().mental.energy = v;
  const el = document.getElementById('energy-mental-val');
  if (el) el.textContent = v;
  save();
}
function saveMentalFields() {
  const m = today().mental;
  m.goodThing = document.getElementById('good-thing')?.value || '';
  m.worry = document.getElementById('worry')?.value || '';
  m.blocker = document.getElementById('blocker')?.value || '';
  m.minAction = document.getElementById('min-action')?.value || '';
  m.improvement = document.getElementById('improvement')?.value || '';
  save();
}
function saveMentalAll() {
  saveMentalFields();
  addXP(25, 'Diário mental');
  state.mentalEntries++;
  showToast('🧠 Diário salvo. Isso importa.', 'success');
  checkAchievements();
  renderMental();
}

// ============================================================
// REPORTS
// ============================================================
function renderReports() {
  const days7 = Array.from({length:7}, (_,i) => offsetDate(i-6));
  const data = days7.map(d => ({
    date: d,
    label: new Date(d + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'short' }),
    score: state.days[d]?.score || 0,
    study: +(( state.days[d]?.study?.totalMinutes || 0) / 60).toFixed(1),
    workout: state.days[d]?.health?.workout === true ? 1 : 0,
    sleep: state.days[d]?.health?.sleep || 0,
  }));

  const avgScore = Math.round(data.reduce((s,d) => s + d.score, 0) / 7);
  const totalStudy = data.reduce((s,d) => s + d.study, 0).toFixed(1);
  const workouts = data.filter(d => d.workout).length;
  const avgSleep = (data.filter(d => d.sleep > 0).reduce((s,d) => s + d.sleep, 0) / Math.max(1, data.filter(d => d.sleep > 0).length)).toFixed(1);

  const bestDay = data.reduce((a, b) => a.score >= b.score ? a : b);
  const worstDay = data.filter(d => d.score > 0).reduce((a, b) => a.score <= b.score ? a : b, { score: 9999, label: '—' });

  const topHabit = [...state.habits].sort((a, b) => b.streak - a.streak)[0];
  const weakHabit = [...state.habits].sort((a, b) => a.streak - b.streak)[0];

  const insights = [];
  const lowSleepDays = data.filter(d => d.sleep > 0 && d.sleep < 6).length;
  if (lowSleepDays >= 2) insights.push({ icon: '😴', text: 'Sua rotina piora quando o sono fica abaixo de 6h. Priorize dormir mais cedo.' });
  const workoutDays = data.filter(d => d.workout).length;
  const workoutScoreAvg = data.filter(d => d.workout).reduce((s,d) => s + d.score, 0) / Math.max(1, workoutDays);
  const noWorkoutScoreAvg = data.filter(d => !d.workout).reduce((s,d) => s + d.score, 0) / Math.max(1, 7 - workoutDays);
  if (workoutDays >= 2 && workoutScoreAvg > noWorkoutScoreAvg + 10) insights.push({ icon: '💪', text: 'Você performa melhor nos dias em que treina. Vale priorizar o treino.' });
  const studyDays = data.filter(d => d.study > 0).length;
  if (studyDays <= 2) insights.push({ icon: '📚', text: 'Estudo está sendo seu ponto mais fraco essa semana. 25 minutos por dia já muda o jogo.' });
  if (avgScore >= 75) insights.push({ icon: '🚀', text: 'Semana forte! Você está evoluindo. Não quebra o ritmo agora.' });
  else if (avgScore < 40) insights.push({ icon: '🔄', text: 'Semana difícil. Simplifica a rotina nos próximos dias e foca no básico.' });
  if (insights.length === 0) insights.push({ icon: '💡', text: 'Continue registrando sua rotina para ver insights personalizados aqui.' });

  const insightsHTML = insights.map(i => `<div class="insight-item"><span class="insight-icon">${i.icon}</span><span>${i.text}</span></div>`).join('');
  const rankHTML = [...state.habits].sort((a,b) => b.streak - a.streak).slice(0,5).map(h =>
    `<div class="rank-item"><span class="rank-name">${h.emoji} ${esc(h.name)}</span><span class="rank-streak">🔥 ${h.streak} dias</span></div>`
  ).join('');

  setContent(`
    <div class="screen-content">
      <div class="screen-header"><span class="screen-title">Relatórios</span></div>

      <div class="report-stats">
        <div class="report-stat"><div class="report-stat-value" style="color:${getScoreColor(avgScore)}">${avgScore}</div><div class="report-stat-label">Média disciplina</div></div>
        <div class="report-stat"><div class="report-stat-value">${totalStudy}h</div><div class="report-stat-label">Estudado (7d)</div></div>
        <div class="report-stat"><div class="report-stat-value" style="color:var(--orange)">${state.streak}</div><div class="report-stat-label">Sequência atual</div></div>
        <div class="report-stat"><div class="report-stat-value" style="color:var(--green)">${workouts}/7</div><div class="report-stat-label">Treinos</div></div>
      </div>

      <div class="day-highlight">
        <div class="day-card best">
          <div class="day-card-label">🏆 Melhor dia</div>
          <div class="day-card-val text-green">${bestDay.score > 0 ? bestDay.label + ' (' + bestDay.score + ')' : '—'}</div>
        </div>
        <div class="day-card worst">
          <div class="day-card-label">🔴 Dia mais fraco</div>
          <div class="day-card-val text-red">${worstDay.score < 9999 ? worstDay.label + ' (' + worstDay.score + ')' : '—'}</div>
        </div>
      </div>

      <div class="card">
        <div class="chart-title">📊 Score de disciplina — 7 dias</div>
        <canvas id="chart-score" height="120"></canvas>
      </div>

      <div class="card">
        <div class="chart-title">📚 Horas de estudo — 7 dias</div>
        <canvas id="chart-study" height="100"></canvas>
      </div>

      <div class="card">
        <div class="card-title">🧠 Insights da semana</div>
        ${insightsHTML}
      </div>

      <div class="card">
        <div class="card-title">🔥 Hábitos mais consistentes</div>
        ${rankHTML || '<p style="color:var(--text3)">Nenhum hábito registrado.</p>'}
        ${topHabit && weakHabit && topHabit.id !== weakHabit.id ? `
        <div style="margin-top:12px;padding-top:12px;border-top:1px solid var(--border)">
          <div style="font-size:13px;color:var(--text2)">Mais forte: <strong>${topHabit.emoji} ${topHabit.name}</strong> (${topHabit.streak} dias)</div>
          <div style="font-size:13px;color:var(--text2);margin-top:4px">Mais fraco: <strong>${weakHabit.emoji} ${weakHabit.name}</strong> (${weakHabit.streak} dias)</div>
        </div>` : ''}
      </div>
    </div>
  `);

  setTimeout(() => {
    drawChart('chart-score', data.map(d => d.label), data.map(d => d.score), '#4f6ef7', 100);
    drawChart('chart-study', data.map(d => d.label), data.map(d => d.study), '#22d47a', Math.max(...data.map(d => d.study), 2));
  }, 50);
}

function drawChart(id, labels, values, color, maxVal) {
  const canvas = document.getElementById(id);
  if (!canvas) return;
  const W = canvas.parentElement.offsetWidth - 36 || 320;
  canvas.width = W;
  const H = canvas.height;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, W, H);
  const pad = 28;
  const barW = Math.max(6, (W - pad * 2) / labels.length - 8);
  const maxV = maxVal || 1;

  values.forEach((val, i) => {
    const x = pad + i * ((W - pad * 2) / labels.length) + 4;
    const barH = Math.max(0, (val / maxV) * (H - 32));
    const y = H - 22 - barH;
    const isDark = document.body.classList.contains('dark');
    ctx.fillStyle = val > 0 ? color : (isDark ? '#252545' : '#e0e0f0');
    const r = Math.min(6, barW / 2);
    if (barH > 0) {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + barW - r, y);
      ctx.quadraticCurveTo(x + barW, y, x + barW, y + r);
      ctx.lineTo(x + barW, y + barH);
      ctx.lineTo(x, y + barH);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
      ctx.fill();
    } else {
      ctx.fillRect(x, H - 22 - 2, barW, 2);
    }
    ctx.fillStyle = isDark ? '#555580' : '#9898b8';
    ctx.font = '10px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(labels[i], x + barW / 2, H - 6);
    if (val > 0) {
      ctx.fillStyle = isDark ? '#9898b8' : '#5555_80';
      ctx.fillText(Math.round(val * 10) / 10, x + barW / 2, y - 4);
    }
  });
}

// ============================================================
// ACHIEVEMENTS
// ============================================================
function renderAchievements() {
  const xpNeeded = xpForNextLevel(state.level);
  const xpPct = Math.round((state.xp / xpNeeded) * 100);

  const badgesHTML = ACHIEVEMENTS.map(a => {
    const unlocked = state.achievements.includes(a.id);
    return `<div class="badge-item${unlocked ? ' unlocked' : ' locked'}">
      <span class="badge-emoji">${unlocked ? a.icon : '🔒'}</span>
      <div class="badge-name">${a.name}</div>
      <div class="badge-xp">+${a.xp} XP</div>
    </div>`;
  }).join('');

  setContent(`
    <div class="screen-content">
      <div class="screen-header"><span class="screen-title">Conquistas</span></div>

      <div class="level-card">
        <div class="level-top">
          <div class="level-info">
            <div class="level-num">${state.level}</div>
            <div class="level-title">${getLevelTitle(state.level)}</div>
            <div class="level-xp-label">${state.xp} / ${xpNeeded} XP</div>
          </div>
          <div class="level-icon">⭐</div>
        </div>
        <div class="xp-bar-wrap"><div class="xp-bar-fill" style="width:${xpPct}%"></div></div>
      </div>

      <div class="streak-hero">
        <div class="streak-num">${state.streak}</div>
        <div>
          <div class="streak-info-title">Dias seguidos 🔥</div>
          <div class="streak-info-sub">Melhor: ${state.bestStreak || state.streak} dias</div>
        </div>
      </div>

      <div class="section-label">Medalhas</div>
      <div class="badge-grid">${badgesHTML}</div>
    </div>
  `);
}

// ============================================================
// MINIMAL DAY
// ============================================================
function renderMinimal() {
  const day = today();
  const checked = day.minimalChecked || {};
  const doneCount = MINIMAL_TASKS.filter(t => checked[t.id]).length;
  const total = MINIMAL_TASKS.length;
  const pct = Math.round(doneCount / total * 100);
  const allDone = doneCount === total;

  const tasksHTML = MINIMAL_TASKS.map(t => `
    <div class="minimal-task${checked[t.id] ? ' done' : ''}" onclick="toggleMinimal('${t.id}')">
      <span class="minimal-task-icon">${t.icon}</span>
      <span class="minimal-task-name">${t.name}</span>
      <span class="minimal-check">${checked[t.id] ? '✅' : '○'}</span>
    </div>
  `).join('');

  setContent(`
    <div class="screen-content">
      <div class="minimal-header">
        <h1>🌙 Modo Dia Difícil</h1>
        <p>“Hoje não precisa vencer o mundo.<br>Só não abandona você mesmo.”</p>
      </div>

      <div class="minimal-progress">
        <div class="progress-bar-wrap"><div class="progress-bar-fill green" style="width:${pct}%"></div></div>
        <span class="minimal-progress-label">${doneCount}/${total}</span>
      </div>

      ${tasksHTML}

      ${allDone ? `
        <div class="minimal-win">
          <h2>🏆 Você conseguiu!</h2>
          <p>Dia difícil também conta quando você não desiste.<br>Isso é mais do que a maioria fez hoje.</p>
        </div>` : `
        <div class="card" style="background:linear-gradient(135deg,rgba(168,85,247,0.06),rgba(79,110,247,0.04));border-color:rgba(168,85,247,0.2);text-align:center">
          <p style="font-size:14px;color:var(--text2);line-height:1.6">“Dia difícil também conta<br>quando você não desiste.”</p>
        </div>`
      }
    </div>
  `);
}

function toggleMinimal(id) {
  const day = today();
  if (!day.minimalChecked) day.minimalChecked = {};
  const prev = day.minimalChecked[id];
  day.minimalChecked[id] = !prev;
  if (!prev) addXP(8, 'Rotina mínima');
  const allDone = MINIMAL_TASKS.every(t => day.minimalChecked[t.id]);
  if (allDone && !day.minimalDone) {
    day.minimalDone = true;
    addXP(50, 'Rotina mínima completa!');
    checkAchievements();
  }
  save(); renderMinimal();
}

// ============================================================
// WEEKLY
// ============================================================
function getWeekKey() {
  const d = new Date();
  d.setDate(d.getDate() - d.getDay());
  return getDateStr(d);
}

function renderWeekly() {
  const w = state.weeklyPlan[getWeekKey()] || {};
  setContent(`
    <div class="screen-content">
      <div class="screen-header"><span class="screen-title">Planejamento Semanal</span></div>

      <div class="card">
        <div class="weekly-question">🎯 Qual é o foco principal dessa semana?</div>
        <div class="weekly-hint">Uma coisa. Se tudo é prioridade, nada é.</div>
        <textarea class="form-textarea" id="w-focus" placeholder="Ex: Passar na prova, finalizar projeto...">${esc(w.focus||'')}</textarea>
      </div>

      <div class="card">
        <div class="weekly-question">⚠️ O que mais pode te atrapalhar?</div>
        <div class="weekly-hint">Identificar blockers é metade da batalha.</div>
        <textarea class="form-textarea" id="w-block" placeholder="Ex: Procrastinação, redes sociais, compromissos...">${esc(w.block||'')}</textarea>
      </div>

      <div class="card">
        <div class="weekly-question">🔥 Qual hábito você quer fortalecer?</div>
        <textarea class="form-textarea" id="w-habit" placeholder="Ex: Acordar às 6h, estudar todo dia...">${esc(w.habit||'')}</textarea>
      </div>

      <div class="card">
        <div class="weekly-question">📝 Metas da semana</div>
        <textarea class="form-textarea" id="w-goals" placeholder="Liste suas metas para essa semana...">${esc(w.goals||'')}</textarea>
      </div>

      <div class="card">
        <div class="weekly-question">🚫 Coisas a evitar</div>
        <textarea class="form-textarea" id="w-avoid" placeholder="Ex: Ficar até tarde, compras por impulso...">${esc(w.avoid||'')}</textarea>
      </div>

      <button class="btn-primary" style="width:100%" onclick="saveWeekly()">💾 Salvar planejamento +30 XP</button>
    </div>
  `);
}

function saveWeekly() {
  const key = getWeekKey();
  state.weeklyPlan[key] = {
    focus: document.getElementById('w-focus')?.value || '',
    block: document.getElementById('w-block')?.value || '',
    habit: document.getElementById('w-habit')?.value || '',
    goals: document.getElementById('w-goals')?.value || '',
    avoid: document.getElementById('w-avoid')?.value || '',
  };
  addXP(30, 'Planejamento semanal');
  showToast('📅 Semana planejada!', 'success');
  save();
}

// ============================================================
// SETTINGS
// ============================================================
function renderSettings() {
  const isDark = document.body.classList.contains('dark');
  const totalStudyH = +(Object.values(state.days).reduce((s,d) => s + (d.study?.totalMinutes || 0), 0) / 60).toFixed(1);
  const totalWorkouts = Object.values(state.days).filter(d => d.health?.workout === true).length;

  setContent(`
    <div class="screen-content">
      <div class="screen-header"><span class="screen-title">Configurações</span></div>

      <div class="settings-section">
        <div class="settings-section-title">Perfil</div>
        <div class="card">
          <div class="form-group">
            <label class="form-label">Seu nome</label>
            <input class="form-input" id="settings-name" value="${esc(state.settings?.name || state.profile?.name || '')}" placeholder="Seu nome" />
          </div>
          <button class="btn-primary" style="width:100%" onclick="saveName()">Salvar nome</button>
        </div>
      </div>

      <div class="settings-section">
        <div class="settings-section-title">Estatísticas</div>
        <div class="stats-overview">
          <div class="stats-ov-item"><div class="stats-ov-val" style="color:var(--yellow)">${state.level}</div><div class="stats-ov-label">Nível</div></div>
          <div class="stats-ov-item"><div class="stats-ov-val" style="color:var(--orange)">${state.streak}</div><div class="stats-ov-label">Streak</div></div>
          <div class="stats-ov-item"><div class="stats-ov-val">${state.achievements.length}</div><div class="stats-ov-label">Medalhas</div></div>
          <div class="stats-ov-item"><div class="stats-ov-val" style="color:var(--green)">${totalStudyH}h</div><div class="stats-ov-label">Estudado</div></div>
          <div class="stats-ov-item"><div class="stats-ov-val">${totalWorkouts}</div><div class="stats-ov-label">Treinos</div></div>
          <div class="stats-ov-item"><div class="stats-ov-val">${state.totalTasks}</div><div class="stats-ov-label">Tarefas</div></div>
        </div>
      </div>

      <div class="settings-section">
        <div class="settings-section-title">Preferências</div>
        <div class="card">
          <div class="toggle-row">
            <span class="toggle-label">🌙 Tema escuro</span>
            <button class="toggle${isDark ? ' on' : ''}" onclick="toggleTheme()" id="theme-toggle"></button>
          </div>
        </div>
      </div>

      <div class="settings-section">
        <div class="settings-section-title">⚠️ Zona de perigo</div>
        <div class="card">
          <p style="font-size:14px;color:var(--text2);margin-bottom:14px">Apaga todos os dados. Não tem como desfazer.</p>
          <button class="danger-btn" onclick="resetAll()">Resetar todos os dados</button>
        </div>
      </div>
    </div>
  `);
}

function saveName() {
  const v = document.getElementById('settings-name')?.value?.trim();
  if (!v) return;
  if (!state.settings) state.settings = {};
  state.settings.name = v;
  if (state.profile) state.profile.name = v;
  save();
  showToast('Nome salvo!', 'success');
}

function toggleTheme() {
  const isDark = document.body.classList.contains('dark');
  document.body.classList.toggle('dark', !isDark);
  document.body.classList.toggle('light', isDark);
  if (!state.settings) state.settings = {};
  state.settings.theme = isDark ? 'light' : 'dark';
  save();
  renderSettings();
}

function resetAll() {
  if (!confirm('Apagar TODOS os dados? Isso não tem como desfazer.')) return;
  localStorage.removeItem(STORAGE_KEY);
  location.reload();
}

// ============================================================
// INIT
// ============================================================
function init() {
  loadState();

  const theme = state.settings?.theme || 'dark';
  document.body.classList.remove('dark', 'light');
  document.body.classList.add(theme);

  if (state.profile?.completed) {
    showApp();
  } else {
    document.getElementById('screen-onboarding').classList.add('active');
    document.getElementById('bottom-nav').style.display = 'none';
    initOnboarding();
  }

  const midnight = new Date();
  midnight.setHours(24, 0, 0, 0);
  setTimeout(() => location.reload(), midnight - new Date());
}

init();
