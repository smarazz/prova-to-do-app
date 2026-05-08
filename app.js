const form = document.getElementById('todo-form');
const input = document.getElementById('todo-input');
const list = document.getElementById('todo-list');
const footer = document.getElementById('footer');
const countEl = document.getElementById('count');
const clearBtn = document.getElementById('clear-done');
const filterBtns = document.querySelectorAll('.filter');
const dateEl = document.getElementById('date');
const clockEl = document.getElementById('clock');

let todos = JSON.parse(localStorage.getItem('todos') || '[]');
let filter = 'all';

function updateTime() {
  const now = new Date();
  dateEl.textContent = now.toLocaleDateString('it-IT', {
    weekday: 'long', day: 'numeric', month: 'long'
  });
  clockEl.textContent = now.toLocaleTimeString('it-IT', {
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  });
}

setInterval(updateTime, 1000);
updateTime();

function save() {
  localStorage.setItem('todos', JSON.stringify(todos));
}

function render() {
  list.innerHTML = '';

  const visible = todos.filter(t =>
    filter === 'all' ? true :
    filter === 'active' ? !t.done :
    t.done
  );

  if (visible.length === 0) {
    const empty = document.createElement('li');
    empty.className = 'empty';
    empty.textContent =
      filter === 'done' ? 'Nessuna attività completata.' :
      filter === 'active' ? 'Nessuna attività attiva.' :
      'Aggiungi la tua prima attività!';
    list.appendChild(empty);
  } else {
    visible.forEach(todo => {
      const li = document.createElement('li');
      li.className = 'todo-item' + (todo.done ? ' done' : '');
      li.dataset.id = todo.id;

      const check = document.createElement('input');
      check.type = 'checkbox';
      check.className = 'check';
      check.checked = todo.done;
      check.addEventListener('change', () => toggle(todo.id));

      const label = document.createElement('span');
      label.className = 'todo-label';
      label.textContent = todo.text;

      const del = document.createElement('button');
      del.className = 'delete-btn';
      del.setAttribute('aria-label', 'Elimina');
      del.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/>
        <path d="M9 6V4h6v2"/>
      </svg>`;
      del.addEventListener('click', () => remove(todo.id));

      li.append(check, label, del);
      list.appendChild(li);
    });
  }

  const active = todos.filter(t => !t.done).length;
  const done = todos.filter(t => t.done).length;
  countEl.textContent = `${active} rimast${active === 1 ? 'a' : 'e'}`;
  footer.hidden = todos.length === 0;
  clearBtn.style.visibility = done > 0 ? 'visible' : 'hidden';
}

function add(text) {
  todos.unshift({ id: Date.now(), text: text.trim(), done: false });
  save();
  render();
}

function toggle(id) {
  const t = todos.find(t => t.id === id);
  if (t) { t.done = !t.done; save(); render(); }
}

function remove(id) {
  const li = list.querySelector(`[data-id="${id}"]`);
  if (li) {
    li.classList.add('removing');
    li.addEventListener('transitionend', () => {
      todos = todos.filter(t => t.id !== id);
      save();
      render();
    }, { once: true });
  }
}

form.addEventListener('submit', e => {
  e.preventDefault();
  const text = input.value.trim();
  if (text) { add(text); input.value = ''; }
});

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filter = btn.dataset.filter;
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    render();
  });
});

clearBtn.addEventListener('click', () => {
  todos = todos.filter(t => !t.done);
  save();
  render();
});

render();
