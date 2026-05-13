const DEFAULT_TASKS = [
  'Acordar cedo',
  'Beber água ao acordar',
  'Fazer exercícios',
  'Tomar café da manhã',
  'Estudar / trabalhar',
  'Ler por 20 minutos',
  'Dormir no horário certo',
];

const MOTIVATIONS = [
  { min: 0,   text: 'Vamos nessa! 💪' },
  { min: 1,   text: 'Ótimo começo! 🚀' },
  { min: 40,  text: 'Você está indo bem! 🌟' },
  { min: 60,  text: 'Mais da metade! Continue! 🔥' },
  { min: 80,  text: 'Quase lá! Incrível! ⚡' },
  { min: 100, text: 'Rotina completa! Perfeito! 🏆' },
];

let state = loadState();

function loadState() {
  const today = getToday();
  const saved = JSON.parse(localStorage.getItem('rotina_state') || 'null');
  if (saved && saved.date === today) return saved;
  const streak = computeStreak(saved);
  const tasks = saved?.tasks?.map(t => ({ ...t, done: false })) ||
    DEFAULT_TASKS.map((text, i) => ({ id: i + 1, text, done: false }));
  return { date: today, tasks, streak, nextId: tasks.length + 1 };
}

function computeStreak(saved) {
  if (!saved) return 0;
  const yesterday = getDateOffset(-1);
  const allDone = saved.tasks.length > 0 && saved.tasks.every(t => t.done);
  if (saved.date === yesterday && allDone) return (saved.streak || 0) + 1;
  if (saved.date === yesterday) return saved.streak || 0;
  return 0;
}

function getToday() { return new Date().toISOString().slice(0, 10); }

function getDateOffset(offset) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}

function saveState() { localStorage.setItem('rotina_state', JSON.stringify(state)); }

function getProgress() {
  if (state.tasks.length === 0) return 0;
  return Math.round((state.tasks.filter(t => t.done).length / state.tasks.length) * 100);
}

function getMotivation(pct) {
  const match = [...MOTIVATIONS].reverse().find(m => pct >= m.min);
  return match ? match.text : MOTIVATIONS[0].text;
}

function renderTasks() {
  const list = document.getElementById('taskList');
  list.innerHTML = '';
  if (state.tasks.length === 0) {
    list.innerHTML = '<li class="empty-state">Nenhuma tarefa. Adicione uma abaixo!</li>';
    return;
  }
  state.tasks.forEach(task => {
    const li = document.createElement('li');
    li.className = 'task-item' + (task.done ? ' done' : '');
    li.dataset.id = task.id;
    li.innerHTML = `
      <div class="task-checkbox" role="checkbox" aria-checked="${task.done}" tabindex="0"></div>
      <span class="task-text">${escHtml(task.text)}</span>
      <button class="task-delete" title="Remover">&times;</button>
    `;
    li.querySelector('.task-checkbox').addEventListener('click', () => toggleTask(task.id));
    li.querySelector('.task-checkbox').addEventListener('keydown', e => { if (e.key === ' ' || e.key === 'Enter') toggleTask(task.id); });
    li.querySelector('.task-delete').addEventListener('click', () => deleteTask(task.id));
    list.appendChild(li);
  });
}

function renderProgress() {
  const pct = getProgress();
  const done = state.tasks.filter(t => t.done).length;
  const total = state.tasks.length;
  document.getElementById('progressBar').style.width = pct + '%';
  document.getElementById('progressPercent').textContent = pct + '%';
  document.getElementById('progressCircle').setAttribute('stroke-dasharray', `${pct}, 100`);
  document.getElementById('progressLabel').textContent = `${done} de ${total} tarefa${total !== 1 ? 's' : ''} concluída${done !== 1 ? 's' : ''}`;
  document.getElementById('motivationText').textContent = getMotivation(pct);
  document.getElementById('streakCount').textContent = state.streak + (state.streak === 1 ? ' dia' : ' dias');
}

function renderDate() {
  const d = new Date();
  document.getElementById('dateDisplay').textContent = d.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
}

function toggleTask(id) {
  const task = state.tasks.find(t => t.id === id);
  if (!task) return;
  task.done = !task.done;
  saveState();
  renderTasks();
  renderProgress();
  if (state.tasks.length > 0 && state.tasks.every(t => t.done)) celebrate();
}

function deleteTask(id) {
  state.tasks = state.tasks.filter(t => t.id !== id);
  saveState();
  renderTasks();
  renderProgress();
}

function addTask(text) {
  text = text.trim();
  if (!text) return;
  state.tasks.push({ id: state.nextId++, text, done: false });
  saveState();
  renderTasks();
  renderProgress();
}

function resetDay() {
  if (!confirm('Reiniciar o dia vai desmarcar todas as tarefas. Continuar?')) return;
  state.tasks = state.tasks.map(t => ({ ...t, done: false }));
  saveState();
  renderTasks();
  renderProgress();
}

function celebrate() {
  const el = document.getElementById('celebration');
  el.innerHTML = '<div class="celebration-msg">🏆 Rotina completa!<br>Você arrasou hoje!</div>';
  setTimeout(() => { el.innerHTML = ''; }, 3200);
}

function escHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

document.getElementById('btnAdd').addEventListener('click', () => {
  const input = document.getElementById('newTaskInput');
  addTask(input.value);
  input.value = '';
  input.focus();
});

document.getElementById('newTaskInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') { addTask(e.target.value); e.target.value = ''; }
});

document.getElementById('btnReset').addEventListener('click', resetDay);

renderDate();
renderTasks();
renderProgress();

const now = new Date();
const msToMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1) - now;
setTimeout(() => location.reload(), msToMidnight);
