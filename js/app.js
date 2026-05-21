/**
 * app.js — To-Do Life Dashboard
 *
 * Single JavaScript file for the entire dashboard (Req 10.3).
 * No external libraries, no modules, no build step (Req 10.1).
 *
 * Execution entry point: DOMContentLoaded fires all four widget init() stubs.
 */

/* ============================================================
   Storage Utility
   Storage keys used by this application:
     "tdld_tasks"  — JSON array of Task objects (used by TodoWidget)
     "tdld_links"  — JSON array of Link objects (used by QuickLinksWidget)
   ============================================================ */
const Storage = {
  /**
   * Load and JSON-parse a value from localStorage.
   * @param {string} key
   * @returns {*|null} Parsed value, or null on any error.
   */
  load(key) {
    try {
      return JSON.parse(localStorage.getItem(key));
    } catch (_) {
      return null;
    }
  },

  /**
   * JSON-stringify and save a value to localStorage.
   * @param {string} key
   * @param {*} value
   * @returns {boolean} true on success, false on failure.
   */
  save(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (_) {
      return false;
    }
  },
};

/* ============================================================
   GreetingWidget  (Req 1.1 – 1.7)
   ============================================================ */
const GreetingWidget = {
  /** @type {string[]} */
  _DAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],

  /** @type {string[]} */
  _MONTHS: [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ],

  /**
   * Format a Date as "HH:MM" (24-hour, zero-padded).
   * @param {Date} date
   * @returns {string}
   */
  formatTime(date) {
    const hh = String(date.getHours()).padStart(2, '0');
    const mm = String(date.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  },

  /**
   * Format a Date as "Weekday, DD Month YYYY".
   * @param {Date} date
   * @returns {string}
   */
  formatDate(date) {
    const weekday = this._DAYS[date.getDay()];
    const dd = String(date.getDate()).padStart(2, '0');
    const month = this._MONTHS[date.getMonth()];
    const yyyy = date.getFullYear();
    return `${weekday}, ${dd} ${month} ${yyyy}`;
  },

  /**
   * Return the appropriate greeting for the given hour (0–23).
   * 05–11 → "Good Morning"
   * 12–17 → "Good Afternoon"
   * 18–20 → "Good Evening"
   * 21–04 → "Good Night"
   * @param {number} hour  Integer in [0, 23]
   * @returns {string}
   */
  getGreeting(hour) {
    if (hour >= 5 && hour <= 11) return 'Good Morning';
    if (hour >= 12 && hour <= 17) return 'Good Afternoon';
    if (hour >= 18 && hour <= 20) return 'Good Evening';
    return 'Good Night';
  },

  /**
   * Write the current time, date, and greeting to the DOM immediately.
   */
  render() {
    const now = new Date();
    document.getElementById('greeting-time').textContent = this.formatTime(now);
    document.getElementById('greeting-date').textContent = this.formatDate(now);
    document.getElementById('greeting-text').textContent = this.getGreeting(now.getHours());
  },

  /**
   * Schedule a setTimeout that fires at the start of the next minute,
   * calls render(), then reschedules itself.
   */
  scheduleNextTick() {
    const now = new Date();
    // Milliseconds remaining until the next whole minute
    const msUntilNextMinute = (60 - now.getSeconds()) * 1000 - now.getMilliseconds();
    setTimeout(() => {
      this.render();
      this.scheduleNextTick();
    }, msUntilNextMinute);
  },

  /**
   * Initialise the greeting widget.
   * Renders immediately (Req 1.7) and schedules the next minute-boundary tick.
   */
  init() {
    this.render();
    this.scheduleNextTick();
  },
};

/* ============================================================
   TimerWidget  (Req 2.1 – 2.10)
   ============================================================ */
const TimerWidget = {
  // ── Internal state ────────────────────────────────────────
  _state: {
    status: 'idle',   // 'idle' | 'running' | 'paused' | 'ended'
    remaining: 1500,  // seconds (25 * 60)
    startedAt: null,  // Date.now() snapshot when last started/resumed
    intervalId: null, // setInterval handle
  },

  // ── DOM references (set in init) ──────────────────────────
  _displayEl: null,
  _endedEl: null,
  _startBtn: null,
  _stopBtn: null,
  _resetBtn: null,

  // ── Pure helpers ──────────────────────────────────────────

  /**
   * Format seconds as "MM:SS" (zero-padded).
   * @param {number} seconds  Integer in [0, 1500]
   * @returns {string}
   */
  formatTime(seconds) {
    const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
    const ss = String(seconds % 60).padStart(2, '0');
    return `${mm}:${ss}`;
  },

  // ── Render ────────────────────────────────────────────────

  /**
   * Update the display and button states to match current _state.
   */
  render() {
    this._displayEl.textContent = this.formatTime(this._state.remaining);

    // Start button: disabled while running (Req 2.9), enabled otherwise (Req 2.10)
    this._startBtn.disabled = this._state.status === 'running';

    // Session-ended indicator (Req 2.7)
    if (this._state.status === 'ended') {
      this._endedEl.removeAttribute('hidden');
      this._displayEl.style.color = '#e94560';
    } else {
      this._endedEl.setAttribute('hidden', '');
      this._displayEl.style.color = '';
    }
  },

  // ── State machine ─────────────────────────────────────────

  /**
   * Start or resume the countdown (Req 2.2, 2.3, 2.4).
   */
  start() {
    if (this._state.status === 'running') return; // no-op if already running
    if (this._state.status === 'ended') return;   // no-op if ended (use reset first)

    // Record the moment we (re)started so tick() can compute drift-safe remaining
    this._state.startedAt = Date.now() - (1500 - this._state.remaining) * 1000;
    this._state.status = 'running';

    this._state.intervalId = setInterval(() => this.tick(), 1000);
    this.render(); // update display immediately (Req 2.4)
  },

  /**
   * Pause the countdown (Req 2.5).
   */
  stop() {
    if (this._state.status !== 'running') return; // no-op

    clearInterval(this._state.intervalId);
    this._state.intervalId = null;
    this._state.status = 'paused';
    // remaining is already up-to-date from the last tick
    this.render();
  },

  /**
   * Reset to initial state (Req 2.6).
   */
  reset() {
    clearInterval(this._state.intervalId);
    this._state.intervalId = null;
    this._state.status = 'idle';
    this._state.remaining = 1500;
    this._state.startedAt = null;
    this.render();
  },

  /**
   * Called every second by setInterval.
   * Recalculates remaining from startedAt to avoid drift (Req 2.4).
   */
  tick() {
    const elapsed = Math.floor((Date.now() - this._state.startedAt) / 1000);
    const remaining = Math.max(0, 1500 - elapsed);
    this._state.remaining = remaining;

    if (remaining <= 0) {
      // Session ended (Req 2.7)
      clearInterval(this._state.intervalId);
      this._state.intervalId = null;
      this._state.status = 'ended';
      this._state.remaining = 0;
    }

    this.render();
  },

  // ── Init ──────────────────────────────────────────────────

  /**
   * Initialise the focus timer widget (Req 2.1).
   */
  init() {
    this._displayEl = document.getElementById('timer-display');
    this._endedEl   = document.getElementById('timer-ended-indicator');
    this._startBtn  = document.getElementById('timer-start-btn');
    this._stopBtn   = document.getElementById('timer-stop-btn');
    this._resetBtn  = document.getElementById('timer-reset-btn');

    // Wire buttons
    this._startBtn.addEventListener('click', () => this.start());
    this._stopBtn.addEventListener('click',  () => this.stop());
    this._resetBtn.addEventListener('click', () => this.reset());

    // Render initial state (25:00, start enabled)
    this.render();
  },
};

/* ============================================================
   TodoWidget  (Req 3.1 – 6.5)
   ============================================================ */
const TodoWidget = {
  /** @type {Array<{id: string, title: string, completed: boolean, createdAt: number}>} */
  _tasks: [],

  /** @type {string|null} ID of the task currently in edit mode */
  _editingId: null,

  // ── DOM references (set in init) ──────────────────────────
  _listEl: null,
  _inputEl: null,
  _inputValidationEl: null,
  _errorEl: null,

  // ── Validation ────────────────────────────────────────────

  /**
   * Validate a task title.
   * @param {string} title
   * @returns {string|null} null if valid, error message if invalid.
   */
  validateTitle(title) {
    const trimmed = title.trim();
    if (trimmed.length === 0) return 'Task title is required.';
    if (trimmed.length > 250) return 'Task title must be 250 characters or fewer.';
    return null;
  },

  // ── Storage ───────────────────────────────────────────────

  /**
   * Persist the current task array to localStorage.
   * @returns {boolean}
   */
  persistTasks() {
    return Storage.save('tdld_tasks', this._tasks);
  },

  // ── Rendering ─────────────────────────────────────────────

  /**
   * Build a DOM element for a single task.
   * @param {{id: string, title: string, completed: boolean, createdAt: number}} task
   * @returns {HTMLLIElement}
   */
  renderTask(task) {
    const li = document.createElement('li');
    li.className = 'todo-item';
    li.dataset.id = task.id;

    // Completion toggle
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = task.completed;
    checkbox.setAttribute('aria-label', `Mark "${task.title}" as ${task.completed ? 'incomplete' : 'complete'}`);
    checkbox.addEventListener('change', () => this.toggleComplete(task.id));

    // Title span
    const titleSpan = document.createElement('span');
    titleSpan.className = 'todo-item-title' + (task.completed ? ' completed' : '');
    titleSpan.textContent = task.title;

    // Edit button
    const editBtn = document.createElement('button');
    editBtn.type = 'button';
    editBtn.className = 'edit-btn';
    editBtn.textContent = 'Edit';
    editBtn.setAttribute('aria-label', `Edit task: ${task.title}`);
    editBtn.addEventListener('click', () => this.enterEditMode(task.id));

    // Delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'delete-btn';
    deleteBtn.textContent = 'Delete';
    deleteBtn.setAttribute('aria-label', `Delete task: ${task.title}`);
    deleteBtn.addEventListener('click', () => this.deleteTask(task.id));

    li.append(checkbox, titleSpan, editBtn, deleteBtn);
    return li;
  },

  /**
   * Clear and re-render the entire task list.
   */
  renderList() {
    this._listEl.innerHTML = '';
    this._tasks.forEach(task => {
      try {
        // Skip tasks with missing required fields (Req 6.4)
        if (!task.id || typeof task.title !== 'string') {
          console.warn('[TodoWidget] Skipping malformed task:', task);
          return;
        }
        this._listEl.appendChild(this.renderTask(task));
      } catch (err) {
        console.warn('[TodoWidget] Error rendering task:', task, err);
      }
    });
  },

  // ── Add ───────────────────────────────────────────────────

  /**
   * Add a new task from the given title string.
   * @param {string} title
   */
  addTask(title) {
    const error = this.validateTitle(title);
    if (error) {
      this._inputValidationEl.textContent = error;
      return;
    }
    this._inputValidationEl.textContent = '';

    const task = {
      id: (typeof crypto !== 'undefined' && crypto.randomUUID)
        ? crypto.randomUUID()
        : String(Date.now()),
      title: title.trim(),
      completed: false,
      createdAt: Date.now(),
    };

    this._tasks.push(task);
    this.renderList();

    const ok = this.persistTasks();
    if (!ok) {
      this._errorEl.textContent = 'Could not save task — storage unavailable.';
    } else {
      this._errorEl.textContent = '';
    }
  },

  // ── Edit mode ─────────────────────────────────────────────

  /**
   * Switch a task item into inline edit mode.
   * @param {string} id
   */
  enterEditMode(id) {
    // Cancel any existing edit first (Req 4.5)
    if (this._editingId !== null) {
      this.exitEditMode(true);
    }

    const task = this._tasks.find(t => t.id === id);
    if (!task) return;

    this._editingId = id;

    const li = this._listEl.querySelector(`[data-id="${id}"]`);
    if (!li) return;

    // Replace title span with an input
    const titleSpan = li.querySelector('.todo-item-title');
    const editInput = document.createElement('input');
    editInput.type = 'text';
    editInput.className = 'todo-item-edit-input';
    editInput.value = task.title;
    editInput.maxLength = 250;
    editInput.setAttribute('aria-label', 'Edit task title');
    titleSpan.replaceWith(editInput);

    // Replace Edit button with Confirm + Cancel
    const editBtn = li.querySelector('.edit-btn');
    const confirmBtn = document.createElement('button');
    confirmBtn.type = 'button';
    confirmBtn.className = 'confirm-btn';
    confirmBtn.textContent = 'Save';
    confirmBtn.setAttribute('aria-label', 'Save edit');

    const cancelBtn = document.createElement('button');
    cancelBtn.type = 'button';
    cancelBtn.className = 'cancel-btn';
    cancelBtn.textContent = 'Cancel';
    cancelBtn.setAttribute('aria-label', 'Cancel edit');

    editBtn.replaceWith(confirmBtn, cancelBtn);

    // Wire handlers
    const confirm = () => {
      this.editTask(id, editInput.value);
    };
    const cancel = () => {
      this.exitEditMode(true);
    };

    confirmBtn.addEventListener('click', confirm);
    cancelBtn.addEventListener('click', cancel);

    // Escape key cancels (Req 4.4)
    editInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') cancel();
      if (e.key === 'Enter') confirm();
    });

    // Blur cancels (Req 4.4) — use setTimeout to allow button clicks to fire first
    editInput.addEventListener('blur', () => {
      setTimeout(() => {
        if (this._editingId === id) cancel();
      }, 150);
    });

    editInput.focus();
    editInput.select();
  },

  /**
   * Exit edit mode.
   * @param {boolean} cancel  true = discard changes, false = already saved
   */
  exitEditMode(cancel) {
    if (this._editingId === null) return;
    this._editingId = null;
    if (cancel) {
      // Re-render to restore original title
      this.renderList();
    }
  },

  /**
   * Commit an edit for the given task id.
   * @param {string} id
   * @param {string} newTitle
   */
  editTask(id, newTitle) {
    const error = this.validateTitle(newTitle);
    if (error) {
      // Reject — keep original title (Req 4.3)
      this.exitEditMode(true);
      return;
    }

    const task = this._tasks.find(t => t.id === id);
    if (!task) return;

    task.title = newTitle.trim();
    this._editingId = null;
    this.renderList();

    const ok = this.persistTasks();
    if (!ok) {
      this._errorEl.textContent = 'Could not save edit — storage unavailable.';
    } else {
      this._errorEl.textContent = '';
    }
  },

  // ── Toggle & Delete ───────────────────────────────────────

  /**
   * Toggle the completed state of a task.
   * @param {string} id
   */
  toggleComplete(id) {
    const task = this._tasks.find(t => t.id === id);
    if (!task) return;

    task.completed = !task.completed;
    this.renderList();

    const ok = this.persistTasks();
    if (!ok) {
      this._errorEl.textContent = 'Could not save — storage unavailable.';
    } else {
      this._errorEl.textContent = '';
    }
  },

  /**
   * Delete a task by id.
   * @param {string} id
   */
  deleteTask(id) {
    const index = this._tasks.findIndex(t => t.id === id);
    if (index === -1) return;

    const [removed] = this._tasks.splice(index, 1);
    this.renderList();

    const ok = this.persistTasks();
    if (!ok) {
      // Restore on storage failure (Req 5.4)
      this._tasks.splice(index, 0, removed);
      this.renderList();
      this._errorEl.textContent = 'Could not delete task — storage unavailable.';
    } else {
      this._errorEl.textContent = '';
    }
  },

  // ── Init ──────────────────────────────────────────────────

  /**
   * Initialise the to-do list widget.
   * Loads tasks from Storage, renders the list, and wires form handlers.
   */
  init() {
    this._listEl = document.getElementById('todo-list');
    this._inputEl = document.getElementById('todo-input');
    this._inputValidationEl = document.getElementById('todo-input-validation');
    this._errorEl = document.getElementById('todo-error');

    // Load from storage (Req 3.6, 6.4, 6.5)
    const stored = Storage.load('tdld_tasks');
    if (stored === null) {
      // Key absent → empty list (no error); malformed → Storage.load returns null too
      this._tasks = [];
      // Only show error if there was actually something stored (malformed data case)
      const raw = localStorage.getItem('tdld_tasks');
      if (raw !== null) {
        this._errorEl.textContent = 'Could not load saved tasks — data may be corrupted.';
      }
    } else if (Array.isArray(stored)) {
      this._tasks = stored;
    } else {
      // Unexpected non-array value
      this._tasks = [];
      this._errorEl.textContent = 'Could not load saved tasks — data may be corrupted.';
    }

    this.renderList();

    // Wire add-task form submit (Req 3.1, 3.2, 3.3)
    const form = document.getElementById('todo-add-form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.addTask(this._inputEl.value);
      this._inputEl.value = '';
    });

    // Clear validation message while typing
    this._inputEl.addEventListener('input', () => {
      this._inputValidationEl.textContent = '';
    });

    // Blur validation (Req 3.4)
    this._inputEl.addEventListener('blur', () => {
      if (this._inputEl.value.trim() === '') {
        this._inputValidationEl.textContent = 'Task title is required.';
      }
    });
  },
};

/* ============================================================
   QuickLinksWidget  (Req 7.1 – 9.5)
   ============================================================ */
const QuickLinksWidget = {
  /** @type {Array<{id: string, label: string, url: string, createdAt: number}>} */
  _links: [],

  // ── DOM references (set in init) ──────────────────────────
  _panelEl: null,
  _labelInputEl: null,
  _urlInputEl: null,
  _labelValidationEl: null,
  _urlValidationEl: null,
  _errorEl: null,

  // ── Validation ────────────────────────────────────────────

  /**
   * Validate label and URL inputs.
   * @param {string} label
   * @param {string} url
   * @returns {string|null} null if valid, error message if invalid.
   */
  validateLink(label, url) {
    const trimLabel = label.trim();
    const trimUrl   = url.trim();

    if (trimLabel.length === 0)   return 'label-empty';
    if (trimLabel.length > 100)   return 'label-too-long';
    if (trimUrl.length === 0)     return 'url-empty';
    if (trimUrl.length > 2048)    return 'url-too-long';
    if (!/^https?:\/\//i.test(trimUrl)) return 'url-invalid';
    if (this._links.length >= 50) return 'limit-reached';
    return null;
  },

  // ── Storage ───────────────────────────────────────────────

  /**
   * Persist the current links array to localStorage.
   * @returns {boolean}
   */
  persistLinks() {
    return Storage.save('tdld_links', this._links);
  },

  // ── Rendering ─────────────────────────────────────────────

  /**
   * Build a DOM element for a single link.
   * @param {{id: string, label: string, url: string, createdAt: number}} link
   * @returns {HTMLDivElement}
   */
  renderLink(link) {
    const item = document.createElement('div');
    item.className = 'quicklink-item';
    item.dataset.id = link.id;

    // Clickable link button — opens in new tab (Req 7.4)
    const btn = document.createElement('a');
    btn.className = 'quicklink-btn';
    btn.href = link.url;
    btn.target = '_blank';
    btn.rel = 'noopener noreferrer';
    btn.textContent = link.label;
    btn.title = link.url;

    // Delete button (Req 8.1)
    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'quicklink-delete-btn';
    deleteBtn.textContent = '✕';
    deleteBtn.setAttribute('aria-label', `Delete link: ${link.label}`);
    deleteBtn.addEventListener('click', () => this.deleteLink(link.id));

    item.append(btn, deleteBtn);
    return item;
  },

  /**
   * Clear and re-render the entire links panel.
   */
  renderPanel() {
    this._panelEl.innerHTML = '';
    this._links.forEach(link => {
      try {
        if (!link.id || typeof link.label !== 'string' || typeof link.url !== 'string') {
          console.warn('[QuickLinksWidget] Skipping malformed link:', link);
          return;
        }
        this._panelEl.appendChild(this.renderLink(link));
      } catch (err) {
        console.warn('[QuickLinksWidget] Error rendering link:', link, err);
      }
    });
  },

  // ── Add ───────────────────────────────────────────────────

  /**
   * Add a new link from the given label and URL.
   * @param {string} label
   * @param {string} url
   */
  addLink(label, url) {
    // Clear previous validation messages
    this._labelValidationEl.textContent = '';
    this._urlValidationEl.textContent   = '';

    const errorCode = this.validateLink(label, url);
    if (errorCode) {
      switch (errorCode) {
        case 'label-empty':    this._labelValidationEl.textContent = 'Label is required.'; break;
        case 'label-too-long': this._labelValidationEl.textContent = 'Label must be 100 characters or fewer.'; break;
        case 'url-empty':      this._urlValidationEl.textContent   = 'URL is required.'; break;
        case 'url-too-long':   this._urlValidationEl.textContent   = 'URL must be 2048 characters or fewer.'; break;
        case 'url-invalid':    this._urlValidationEl.textContent   = 'URL must start with http:// or https://'; break;
        case 'limit-reached':  this._urlValidationEl.textContent   = 'Maximum of 50 links reached.'; break;
      }
      return;
    }

    const link = {
      id: (typeof crypto !== 'undefined' && crypto.randomUUID)
        ? crypto.randomUUID()
        : String(Date.now()),
      label: label.trim(),
      url:   url.trim(),
      createdAt: Date.now(),
    };

    this._links.push(link);
    this.renderPanel();

    const ok = this.persistLinks();
    if (!ok) {
      this._errorEl.textContent = 'Could not save link — storage unavailable.';
    } else {
      this._errorEl.textContent = '';
    }
  },

  // ── Delete ────────────────────────────────────────────────

  /**
   * Delete a link by id.
   * @param {string} id
   */
  deleteLink(id) {
    const index = this._links.findIndex(l => l.id === id);
    if (index === -1) return;

    const [removed] = this._links.splice(index, 1);
    this.renderPanel();

    const ok = this.persistLinks();
    if (!ok) {
      // Restore on storage failure (Req 8.2)
      this._links.splice(index, 0, removed);
      this.renderPanel();
      this._errorEl.textContent = 'Could not delete link — storage unavailable.';
    } else {
      this._errorEl.textContent = '';
    }
  },

  // ── Init ──────────────────────────────────────────────────

  /**
   * Initialise the quick-links widget.
   * Loads links from Storage, renders the panel, and wires form handlers.
   */
  init() {
    this._panelEl           = document.getElementById('quicklinks-panel');
    this._labelInputEl      = document.getElementById('quicklinks-label-input');
    this._urlInputEl        = document.getElementById('quicklinks-url-input');
    this._labelValidationEl = document.getElementById('quicklinks-label-validation');
    this._urlValidationEl   = document.getElementById('quicklinks-url-validation');
    this._errorEl           = document.getElementById('quicklinks-error');

    // Load from storage (Req 7.5, 9.3, 9.5)
    const stored = Storage.load('tdld_links');
    if (stored === null) {
      this._links = [];
      const raw = localStorage.getItem('tdld_links');
      if (raw !== null) {
        this._errorEl.textContent = 'Could not load saved links — data may be corrupted.';
      }
    } else if (Array.isArray(stored)) {
      this._links = stored;
    } else {
      this._links = [];
      this._errorEl.textContent = 'Could not load saved links — data may be corrupted.';
    }

    this.renderPanel();

    // Wire add-link form submit (Req 7.1, 7.2, 7.3)
    const form = document.getElementById('quicklinks-add-form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.addLink(this._labelInputEl.value, this._urlInputEl.value);
      // Clear inputs on success (validation messages absent = success)
      if (!this._labelValidationEl.textContent && !this._urlValidationEl.textContent) {
        this._labelInputEl.value = '';
        this._urlInputEl.value   = '';
      }
    });

    // Clear validation messages while typing (Req 7.3)
    this._labelInputEl.addEventListener('input', () => {
      this._labelValidationEl.textContent = '';
    });
    this._urlInputEl.addEventListener('input', () => {
      this._urlValidationEl.textContent = '';
    });
  },
};

/* ============================================================
   Bootstrap — wire everything on DOMContentLoaded
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  GreetingWidget.init();
  TimerWidget.init();
  TodoWidget.init();
  QuickLinksWidget.init();
});
