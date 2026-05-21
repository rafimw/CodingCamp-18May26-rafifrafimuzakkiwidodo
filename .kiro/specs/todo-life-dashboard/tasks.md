# Implementation Plan: To-Do Life Dashboard

## Overview

Build a single-page, client-side productivity dashboard using only HTML, CSS, and Vanilla JavaScript. The implementation is split into five incremental phases: project scaffolding, the Storage utility, each of the four widgets, and a final wiring/polish pass. All persistent state lives in `localStorage`. No build tools, no frameworks, no backend.

---

## Tasks

- [x] 1. Scaffold project structure and base HTML
  - Create `index.html` with the four widget section placeholders (`#greeting-widget`, `#timer-widget`, `#todo-widget`, `#quicklinks-widget`)
  - Add `<link>` to `css/style.css` and `<script src="js/app.js" defer>` — no other external references
  - Create `css/style.css` with reset/base styles, responsive grid layout (320 px – 1920 px), widget card borders/backgrounds, and minimum 12 px font size
  - Create `js/app.js` with a `DOMContentLoaded` listener that calls the four `init()` functions (stubs for now)
  - _Requirements: 10.1, 10.2, 10.3, 11.3, 11.4, 11.5_

- [x] 2. Implement the Storage utility
  - [x] 2.1 Write the `Storage` object with `load(key)` and `save(key, value)` methods
    - `load` wraps `JSON.parse(localStorage.getItem(key))` in `try/catch`; returns parsed value or `null` on any error
    - `save` wraps `localStorage.setItem(key, JSON.stringify(value))` in `try/catch`; returns `true` on success, `false` on failure
    - Use storage keys `"tdld_tasks"` and `"tdld_links"`
    - _Requirements: 6.1, 6.2, 6.3, 9.1, 9.2, 10.5_

- [x] 3. Implement GreetingWidget
  - [x] 3.1 Implement `GreetingWidget.formatTime(date)` and `GreetingWidget.formatDate(date)`
    - `formatTime` returns `"HH:MM"` (zero-padded, 24-hour)
    - `formatDate` returns `"Weekday, DD Month YYYY"` using English day/month names
    - _Requirements: 1.1, 1.2_

  - [ ]* 3.2 Write property test for `formatTime` (Property 1)
    - **Property 1: Time formatting is always valid HH:MM**
    - **Validates: Requirements 1.1**
    - Use `fc.date()` arbitrary; assert result matches `/^([01]\d|2[0-3]):[0-5]\d$/`

  - [ ]* 3.3 Write property test for `formatDate` (Property 2)
    - **Property 2: Date formatting matches the required pattern**
    - **Validates: Requirements 1.2**
    - Use `fc.date()` arbitrary; assert result matches `"Weekday, DD Month YYYY"` structure

  - [x] 3.4 Implement `GreetingWidget.getGreeting(hour)` with the four time-of-day ranges
    - 05–11 → "Good Morning", 12–17 → "Good Afternoon", 18–20 → "Good Evening", 21–04 → "Good Night"
    - _Requirements: 1.3, 1.4, 1.5, 1.6_

  - [ ]* 3.5 Write property test for `getGreeting` (Property 3)
    - **Property 3: Greeting is determined by hour**
    - **Validates: Requirements 1.3, 1.4, 1.5, 1.6**
    - Use `fc.integer({ min: 0, max: 23 })`; assert exactly one of the four greeting strings is returned

  - [x] 3.6 Implement `GreetingWidget.init()`, `render()`, and `scheduleNextTick()`
    - `render()` writes current time, date, and greeting to the DOM immediately
    - `scheduleNextTick()` uses `setTimeout` to fire at the next minute boundary and calls `render()` again
    - `init()` calls `render()` then `scheduleNextTick()`
    - _Requirements: 1.7_

- [ ] 4. Checkpoint — Greeting widget
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Implement TimerWidget
  - [x] 5.1 Implement `TimerWidget.formatTime(seconds)` pure function
    - Returns `"MM:SS"` for any integer in [0, 1500]
    - _Requirements: 2.8_

  - [ ]* 5.2 Write property test for `TimerWidget.formatTime` (Property 4)
    - **Property 4: Timer time formatting is always valid MM:SS**
    - **Validates: Requirements 2.8**
    - Use `fc.integer({ min: 0, max: 1500 })`; assert result matches `/^\d{2}:\d{2}$/` and numeric value equals input

  - [x] 5.3 Implement timer state machine: `init()`, `start()`, `stop()`, `reset()`, `tick()`, `render()`
    - Internal state: `{ status: 'idle'|'running'|'paused'|'ended', remaining: number, startedAt: number|null }`
    - `init()` sets `remaining = 1500`, `status = 'idle'`, renders `25:00`, wires button click handlers
    - `start()` transitions `idle`→`running` or `paused`→`running`; records `startedAt`; starts `setInterval` (1 s); disables start button
    - `stop()` transitions `running`→`paused`; clears interval; retains `remaining`; enables start button
    - `reset()` clears interval; sets `remaining = 1500`, `status = 'idle'`; removes session-ended indicator; renders `25:00`
    - `tick()` recalculates `remaining` from `startedAt` timestamp (drift-safe); transitions to `ended` at 0 and shows session-ended indicator
    - `render()` updates MM:SS display and button enabled/disabled states
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.9, 2.10_

  - [ ]* 5.4 Write property test for `stop()` preserving remaining time (Property 5)
    - **Property 5: Timer stop preserves remaining time**
    - **Validates: Requirements 2.5**
    - Use `fc.integer({ min: 1, max: 1500 })`; set timer to running with that remaining; call `stop()`; assert `status === 'paused'` and `remaining` unchanged

  - [ ]* 5.5 Write property test for `reset()` returning to initial state (Property 6)
    - **Property 6: Timer reset always returns to initial state**
    - **Validates: Requirements 2.6**
    - Use `fc.oneof(fc.constant('running'), fc.constant('paused'), fc.constant('ended'))` + `fc.integer({ min: 0, max: 1500 })`; call `reset()`; assert `remaining === 1500` and `status === 'idle'`

  - [ ]* 5.6 Write property test for `start()` (resume) preserving remaining time (Property 7)
    - **Property 7: Timer resume preserves remaining time**
    - **Validates: Requirements 2.3**
    - Use `fc.integer({ min: 1, max: 1499 })`; set timer to paused with that remaining; call `start()`; assert `status === 'running'` and `remaining` unchanged

- [ ] 6. Checkpoint — Timer widget
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Implement TodoWidget — core data and validation
  - [x] 7.1 Implement `TodoWidget.validateTitle(title)` and `TodoWidget.persistTasks()`
    - `validateTitle` returns `null` for valid titles (trimmed length 1–250), or an error string otherwise
    - `persistTasks` calls `Storage.save("tdld_tasks", tasks)`; returns `true`/`false`
    - _Requirements: 3.3, 4.3, 6.1, 6.2, 6.3_

  - [x] 7.2 Implement `TodoWidget.renderTask(task)` returning a DOM element
    - Element contains: title text, completion toggle (`<input type="checkbox">`), edit button, delete button
    - Completed tasks get a strikethrough CSS class
    - _Requirements: 3.5, 5.1, 5.2, 5.3_

  - [ ]* 7.3 Write property test for `renderTask` controls (Property 10)
    - **Property 10: Task rendering always includes all required controls**
    - **Validates: Requirements 3.5**
    - Use `fc.record({ id: fc.uuid(), title: fc.string({ minLength: 1 }), completed: fc.boolean(), createdAt: fc.integer() })`; assert returned element contains toggle, edit, and delete controls

  - [x] 7.4 Implement `TodoWidget.addTask(title)` and `TodoWidget.renderList()`
    - `addTask` validates title, creates a Task object (`crypto.randomUUID()` or `Date.now().toString()` for id), pushes to array, calls `renderList()` and `persistTasks()`; shows inline error if persist fails
    - `renderList()` clears the list container and re-renders all tasks
    - _Requirements: 3.1, 3.2, 3.3, 6.1_

  - [ ]* 7.5 Write property test for task addition round-trip (Property 8)
    - **Property 8: Task addition round-trip**
    - **Validates: Requirements 3.2, 6.1**
    - Use `fc.string({ minLength: 1, maxLength: 250 }).filter(s => s.trim().length > 0)`; call `addTask`; assert task appears in rendered list and in `Storage.load("tdld_tasks")`

  - [ ]* 7.6 Write property test for whitespace-only task titles rejected (Property 9)
    - **Property 9: Whitespace-only task titles are always rejected**
    - **Validates: Requirements 3.3**
    - Use `fc.stringOf(fc.constantFrom(' ', '\t', '\n', '\r'))`; call `addTask`; assert no task added and validation message shown

- [x] 8. Implement TodoWidget — edit mode
  - [x] 8.1 Implement `TodoWidget.enterEditMode(id)` and `TodoWidget.exitEditMode(cancelAll)`
    - `enterEditMode` cancels any existing edit, replaces title display with `<input>` pre-filled with current title, wires confirm/cancel/blur/keydown(Escape) handlers
    - `exitEditMode(true)` restores original title without saving; `exitEditMode(false)` is called after a successful save
    - _Requirements: 4.1, 4.4, 4.5_

  - [ ]* 8.2 Write property test for edit mode pre-fill (Property 13)
    - **Property 13: Edit mode pre-fills with current title**
    - **Validates: Requirements 4.1**
    - Use Task arbitrary; call `enterEditMode(id)`; assert `<input>` value equals task's current title

  - [x] 8.3 Implement `TodoWidget.editTask(id, newTitle)`
    - Validates new title; updates task in array; calls `renderList()` and `persistTasks()`; shows inline error if persist fails; retains updated title in UI on failure
    - _Requirements: 4.2, 4.3, 6.2_

  - [ ]* 8.4 Write property test for task edit round-trip (Property 11)
    - **Property 11: Task edit round-trip**
    - **Validates: Requirements 4.2, 6.2**
    - Use `fc.tuple(taskArb, fc.string({ minLength: 1 }).filter(s => s.trim().length > 0))`; call `editTask`; assert displayed title and Storage both reflect trimmed new title

  - [ ]* 8.5 Write property test for whitespace-only edit titles rejected (Property 12)
    - **Property 12: Whitespace-only edit titles are always rejected**
    - **Validates: Requirements 4.3**
    - Use `fc.tuple(taskArb, fc.stringOf(fc.constantFrom(' ', '\t', '\n')))`; call `editTask`; assert title unchanged in UI and Storage

- [x] 9. Implement TodoWidget — toggle, delete, and init
  - [x] 9.1 Implement `TodoWidget.toggleComplete(id)` and `TodoWidget.deleteTask(id)`
    - `toggleComplete` flips `completed`, calls `renderList()` and `persistTasks()`; shows inline error on persist failure but retains UI state
    - `deleteTask` removes task from array, calls `renderList()` and `persistTasks()`; restores task to UI and shows inline error if persist fails
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 6.3_

  - [ ]* 9.2 Write property test for completion toggle round-trip (Property 14)
    - **Property 14: Completion toggle is a round-trip**
    - **Validates: Requirements 5.1, 5.2, 5.3**
    - Use Task arbitrary with `fc.boolean()` for `completed`; call `toggleComplete` twice; assert task returns to original completion state and strikethrough styling is correct at each step

  - [ ]* 9.3 Write property test for task deletion round-trip (Property 15)
    - **Property 15: Task deletion round-trip**
    - **Validates: Requirements 5.4, 6.3**
    - Use `fc.array(taskArb, { minLength: 1 })`; call `deleteTask`; assert task absent from rendered list and from `Storage.load("tdld_tasks")`

  - [x] 9.4 Implement `TodoWidget.init()`
    - Loads tasks from `Storage.load("tdld_tasks")`; handles `null`/malformed data by rendering empty list with inline error; calls `renderList()`; wires add-task form submit and input blur handlers
    - _Requirements: 3.4, 3.6, 3.7, 6.4, 6.5_

  - [ ]* 9.5 Write property test for task persistence load round-trip (Property 16)
    - **Property 16: Task persistence load round-trip**
    - **Validates: Requirements 3.6, 6.4**
    - Use `fc.array(taskArb, { minLength: 0, maxLength: 50 })`; pre-populate `localStorage["tdld_tasks"]`; call `init()`; assert rendered list matches stored tasks exactly

- [ ] 10. Checkpoint — To-Do widget
  - Ensure all tests pass, ask the user if questions arise.

- [x] 11. Implement QuickLinksWidget — core data and validation
  - [x] 11.1 Implement `QuickLinksWidget.validateLink(label, url)` and `QuickLinksWidget.persistLinks()`
    - `validateLink` returns `null` for valid inputs (label 1–100 chars, URL 1–2048 chars starting with `http://` or `https://`, link count < 50); returns a descriptive error string otherwise
    - `persistLinks` calls `Storage.save("tdld_links", links)`; returns `true`/`false`
    - _Requirements: 7.2, 7.3, 9.1, 9.2_

  - [x] 11.2 Implement `QuickLinksWidget.renderLink(link)` returning a DOM element
    - Element contains a clickable button (opens URL in new tab via `target="_blank" rel="noopener noreferrer"`) and a delete button
    - _Requirements: 7.4, 8.1_

  - [ ]* 11.3 Write property test for link rendering controls (Property 19)
    - **Property 19: Link rendering always includes a delete control**
    - **Validates: Requirements 8.1**
    - Use `fc.record({ id: fc.uuid(), label: fc.string({ minLength: 1 }), url: urlArb, createdAt: fc.integer() })`; assert returned element contains a clickable button and a delete control

  - [x] 11.4 Implement `QuickLinksWidget.addLink(label, url)` and `QuickLinksWidget.renderPanel()`
    - `addLink` validates inputs, creates a Link object, pushes to array, calls `renderPanel()` and `persistLinks()`; shows inline validation/error messages on failure
    - `renderPanel()` clears the panel container and re-renders all links
    - _Requirements: 7.1, 7.2, 7.3, 9.1_

  - [ ]* 11.5 Write property test for link addition round-trip (Property 17)
    - **Property 17: Link addition round-trip**
    - **Validates: Requirements 7.2, 9.1**
    - Use `fc.tuple(labelArb, urlArb)` with link count below 50; call `addLink`; assert link appears in panel and in `Storage.load("tdld_links")`

  - [ ]* 11.6 Write property test for invalid link submissions rejected (Property 18)
    - **Property 18: Invalid link submissions are always rejected**
    - **Validates: Requirements 7.3**
    - Use `fc.oneof(emptyLabelArb, invalidUrlArb, overLimitArb)`; call `addLink`; assert no link added and validation message shown

- [x] 12. Implement QuickLinksWidget — delete and init
  - [x] 12.1 Implement `QuickLinksWidget.deleteLink(id)`
    - Removes link from array, calls `renderPanel()` and `persistLinks()`; restores link to panel and shows inline error if persist fails
    - _Requirements: 8.2, 8.3, 9.2_

  - [ ]* 12.2 Write property test for link deletion round-trip (Property 20)
    - **Property 20: Link deletion round-trip**
    - **Validates: Requirements 8.2, 8.3, 9.2**
    - Use `fc.array(linkArb, { minLength: 1 })`; call `deleteLink`; assert link absent from panel and from `Storage.load("tdld_links")`

  - [x] 12.3 Implement `QuickLinksWidget.init()`
    - Loads links from `Storage.load("tdld_links")`; handles `null`/malformed data by rendering empty panel with inline error; calls `renderPanel()`; wires add-link form submit handler; reads from Storage only on this full-page init (not on individual add/delete)
    - _Requirements: 7.5, 7.6, 9.3, 9.4, 9.5_

  - [ ]* 12.4 Write property test for link persistence load round-trip (Property 21)
    - **Property 21: Link persistence load round-trip**
    - **Validates: Requirements 7.5, 9.3**
    - Use `fc.array(linkArb, { minLength: 0, maxLength: 50 })`; pre-populate `localStorage["tdld_links"]`; call `init()`; assert rendered panel matches stored links exactly

- [ ] 13. Checkpoint — Quick Links widget
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 14. Wire everything together and apply visual polish
  - [ ] 14.1 Wire all four `init()` calls inside the `DOMContentLoaded` listener in `app.js`
    - Confirm execution order: `GreetingWidget.init()`, `TimerWidget.init()`, `TodoWidget.init()`, `QuickLinksWidget.init()`
    - _Requirements: 10.4_

  - [ ] 14.2 Apply responsive CSS layout and visual design
    - Implement CSS grid/flexbox layout so all four widgets are visible and reachable at 320 px–1920 px without horizontal scrollbar
    - Ensure each widget has a visible border or distinct background colour
    - Ensure all text is at minimum 12 px
    - Style validation/error messages (`.validation-msg`, `.error-msg` with `role="alert"`)
    - Style timer session-ended indicator (distinct colour change or text)
    - Style completed task strikethrough
    - _Requirements: 11.3, 11.4, 11.5_

  - [ ] 14.3 Verify technical constraints
    - Confirm `index.html` has no `<script>` or `<link>` tags referencing external URLs
    - Confirm `css/style.css` has no `@import` statements
    - Confirm `js/app.js` is the only JavaScript file
    - _Requirements: 10.1, 10.2, 10.3_

- [ ] 15. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

---

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Property tests use [fast-check](https://github.com/dubzzz/fast-check) with `{ numRuns: 100 }` and run via `npx vitest --run`
- Each property test task references the exact property number from the design document
- Checkpoints ensure incremental validation after each widget is complete
- The Storage utility (task 2) must be implemented before any widget that depends on it
- All four widgets are independent of each other and can be developed in parallel after the Storage utility is ready

---

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["2.1"] },
    { "id": 1, "tasks": ["3.1", "5.1", "7.1", "11.1"] },
    { "id": 2, "tasks": ["3.2", "3.3", "3.4", "5.2", "5.3", "7.2", "11.2"] },
    { "id": 3, "tasks": ["3.5", "5.4", "5.5", "5.6", "7.3", "7.4", "8.1", "11.3", "11.4"] },
    { "id": 4, "tasks": ["3.6", "7.5", "7.6", "8.2", "8.3", "11.5", "11.6", "12.1"] },
    { "id": 5, "tasks": ["8.4", "8.5", "9.1", "12.2", "12.3"] },
    { "id": 6, "tasks": ["9.2", "9.3", "9.4", "12.4"] },
    { "id": 7, "tasks": ["9.5"] },
    { "id": 8, "tasks": ["14.1"] },
    { "id": 9, "tasks": ["14.2", "14.3"] }
  ]
}
```
