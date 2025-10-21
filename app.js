// LocalStorage To-Do App (vanilla JS)
// Key for storage
const STORAGE_KEY = 'todos-v1';

// State
let todos = [];
let filter = 'all'; // all | active | completed

// DOM
const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const todoList = document.getElementById('todo-list');
const todoCount = document.getElementById('todo-count');
const filterButtons = document.querySelectorAll('.filter-btn');
const clearCompletedBtn = document.getElementById('clear-completed');
const exportBtn = document.getElementById('export-btn');
const importBtn = document.getElementById('import-btn');
const importFile = document.getElementById('import-file');

// Utilities
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2,8);

function loadTodos() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    todos = raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("loadTodos error", e);
    todos = [];
  }
}

function saveTodos() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

function addTodo(text) {
  const t = {
    id: uid(),
    text: text.trim(),
    completed: false,
    createdAt: new Date().toISOString()
  };
  todos.unshift(t); // newest first
  saveAndRender();
}

function updateTodo(id, updates) {
  todos = todos.map(t => t.id === id ? {...t, ...updates} : t);
  saveAndRender();
}

function removeTodo(id) {
  todos = todos.filter(t => t.id !== id);
  saveAndRender();
}

function toggleTodo(id) {
  const t = todos.find(x => x.id === id);
  if (t) updateTodo(id, { completed: !t.completed });
}

function clearCompleted() {
  todos = todos.filter(t => !t.completed);
  saveAndRender();
}

function filteredTodos() {
  if (filter === 'active') return todos.filter(t => !t.completed);
  if (filter === 'completed') return todos.filter(t => t.completed);
  return todos;
}

function saveAndRender() {
  saveTodos();
  render();
}

function setFilter(newFilter) {
  filter = newFilter;
  filterButtons.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === newFilter);
    btn.setAttribute('aria-selected', String(btn.dataset.filter === newFilter));
  });
  render();
}

// Render
function render() {
  // Empty
  todoList.innerHTML = '';
  const list = filteredTodos();

  if (list.length === 0) {
    const el = document.createElement('li');
    el.className = 'todo-item';
    el.innerHTML = `<div class="todo-text small">Görev yok.</div>`;
    todoList.appendChild(el);
  } else {
    for (const t of list) {
      const li = document.createElement('li');
      li.className = 'todo-item' + (t.completed ? ' completed' : '');
      li.dataset.id = t.id;

      // checkbox
      const checkbox = document.createElement('button');
      checkbox.className = 'checkbox';
      checkbox.setAttribute('aria-label', t.completed ? 'Geri al' : 'Tamamlandı olarak işaretle');
      checkbox.innerHTML = t.completed ? '✓' : '';
      checkbox.addEventListener('click', () => toggleTodo(t.id));

      // text (contenteditable)
      const text = document.createElement('div');
      text.className = 'todo-text';
      text.textContent = t.text;
      text.tabIndex = 0;
      text.title = 'Düzenlemek için çift tıkla veya seçip Enter\'a bas';
      text.setAttribute('role', 'textbox');
      text.setAttribute('aria-label', 'Görev metni');

      // enable inline editing on dblclick
      text.addEventListener('dblclick', () => {
        text.contentEditable = 'true';
        text.focus();
        document.execCommand('selectAll', false, null);
      });

      // save edit on Enter or blur
      text.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          text.blur();
        }
        if (e.key === 'Escape') {
          text.blur();
        }
      });
      text.addEventListener('blur', () => {
        if (text.contentEditable === 'true') {
          text.contentEditable = 'false';
          const newText = text.textContent.trim();
          if (newText.length === 0) {
            // if emptied, remove
            removeTodo(t.id);
          } else if (newText !== t.text) {
            updateTodo(t.id, { text: newText });
          }
        }
      });

      // meta / actions
      const actions = document.createElement('div');
      actions.style.display = 'flex';
      actions.style.gap = '8px';
      actions.style.alignItems = 'center';

      const created = document.createElement('span');
      created.className = 'small';
      const d = new Date(t.createdAt);
      created.textContent = d.toLocaleString();

      const delBtn = document.createElement('button');
      delBtn.className = 'icon-btn';
      delBtn.setAttribute('aria-label', 'Görevi sil');
      delBtn.innerHTML = '🗑';
      delBtn.addEventListener('click', () => {
        if (confirm('Bu görevi silmek istediğine emin misin?')) removeTodo(t.id);
      });

      actions.appendChild(created);
      actions.appendChild(delBtn);

      li.appendChild(checkbox);
      li.appendChild(text);
      li.appendChild(actions);

      todoList.appendChild(li);
    }
  }

  // count
  const remaining = todos.filter(t => !t.completed).length;
  todoCount.textContent = `${remaining} görev ${remaining === 1 ? '' : ''} bekliyor`;

  // update storage as well (already done in saveAndRender)
}

// Form submit
todoForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const val = todoInput.value.trim();
  if (!val) return;
  addTodo(val);
  todoInput.value = '';
  todoInput.focus();
});

// Filter clicks
filterButtons.forEach(btn => {
  btn.addEventListener('click', () => setFilter(btn.dataset.filter));
});

// Clear completed
clearCompletedBtn.addEventListener('click', () => {
  if (todos.some(t => t.completed)) {
    if (confirm('Tamamlanan tüm görevleri silmek istiyor musunuz?')) {
      clearCompleted();
    }
  } else {
    alert('Silinecek tamamlanmış görev yok.');
  }
});

// Export
exportBtn.addEventListener('click', () => {
  const dataStr = JSON.stringify(todos, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'todos.json';
  a.click();
  URL.revokeObjectURL(url);
});

// Import
importBtn.addEventListener('click', () => importFile.click());
importFile.addEventListener('change', async (ev) => {
  const file = ev.target.files[0];
  if (!file) return;
  try {
    const text = await file.text();
    const json = JSON.parse(text);
    if (!Array.isArray(json)) throw new Error('Beklenen format: dizi');
    // Normalize and merge: keep existing, prepend imported
    const imported = json.map(item => ({
      id: item.id || uid(),
      text: String(item.text || '').trim(),
      completed: Boolean(item.completed),
      createdAt: item.createdAt || new Date().toISOString()
    })).filter(x => x.text.length > 0);

    // Merge without duplicates by id
    const ids = new Set(todos.map(t => t.id));
    const toAdd = imported.filter(i => !ids.has(i.id));
    todos = [...toAdd, ...todos];
    saveAndRender();
    alert(`${toAdd.length} görev içe aktarıldı.`);
  } catch (err) {
    alert('İçe aktarma başarısız: ' + err.message);
  } finally {
    importFile.value = '';
  }
});

// Initial load
loadTodos();
render();
