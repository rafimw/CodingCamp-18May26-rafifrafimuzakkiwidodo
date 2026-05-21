# Requirements Document

## Introduction

The To-Do List Life Dashboard is a client-side web application built with HTML, CSS, and Vanilla JavaScript. It serves as a personal productivity hub that combines a live greeting with time/date display, a Pomodoro-style focus timer, a persistent to-do list, and a customizable quick-links panel. All data is stored in the browser's Local Storage — no backend or server is required. The app can be used as a standalone web page or packaged as a browser extension.

## Glossary

- **Dashboard**: The single-page web application that hosts all widgets.
- **Greeting_Widget**: The UI component that displays the current time, date, and a time-of-day greeting.
- **Focus_Timer**: The UI component that implements a 25-minute countdown timer with start, stop, and reset controls.
- **Todo_List**: The UI component that manages a collection of Task items.
- **Task**: A single to-do item with a title, completion state, and unique identifier.
- **Quick_Links**: The UI component that displays user-defined shortcut buttons that open URLs in a new tab.
- **Link**: A single quick-link entry with a label and a URL.
- **Storage**: The browser's `localStorage` API used for all client-side persistence.
- **Modern_Browser**: Chrome, Firefox, Edge, or Safari in their current stable release.

---

## Requirements

### Requirement 1: Greeting and Live Clock

**User Story:** As a user, I want to see the current time, date, and a contextual greeting when I open the Dashboard, so that I am immediately oriented to the time of day without switching to another app.

#### Acceptance Criteria

1. THE Greeting_Widget SHALL display the current time in HH:MM format on page load and update it at each clock-minute boundary.
2. THE Greeting_Widget SHALL display the current date in the format "Weekday, DD Month YYYY" (e.g., "Monday, 26 May 2025").
3. WHEN the local time is between 05:00 and 11:59, THE Greeting_Widget SHALL display the greeting "Good Morning".
4. WHEN the local time is between 12:00 and 17:59, THE Greeting_Widget SHALL display the greeting "Good Afternoon".
5. WHEN the local time is between 18:00 and 20:59, THE Greeting_Widget SHALL display the greeting "Good Evening".
6. WHEN the local time is between 21:00 and 04:59, THE Greeting_Widget SHALL display the greeting "Good Night".
7. THE Greeting_Widget SHALL display the correct time, date, and greeting immediately on page load without waiting for the first minute tick.

---

### Requirement 2: Focus Timer

**User Story:** As a user, I want a 25-minute countdown timer with start, stop, and reset controls, so that I can use the Pomodoro technique to manage focused work sessions.

#### Acceptance Criteria

1. THE Focus_Timer SHALL initialise with a countdown value of 25 minutes and 00 seconds (25:00).
2. WHEN the user activates the start control and the timer is idle (not previously started), THE Focus_Timer SHALL begin counting down from 25:00 one second per second.
3. WHEN the user activates the start control and the timer is paused, THE Focus_Timer SHALL resume counting down from the retained remaining time.
4. WHEN the Focus_Timer starts or resumes counting down, THE Focus_Timer SHALL update the displayed time immediately and then every subsequent second.
5. WHEN the user activates the stop control, THE Focus_Timer SHALL pause the countdown and retain the current remaining time.
6. WHEN the user activates the reset control, THE Focus_Timer SHALL stop any active countdown, restore the display to 25:00, and clear any session-ended visual indicator.
7. WHEN the countdown reaches 00:00, THE Focus_Timer SHALL stop automatically and display a visible session-ended indicator (e.g., a distinct colour change or text message) that persists until the user activates the reset control.
8. THE Focus_Timer SHALL display the remaining time in MM:SS format at all times.
9. WHILE the Focus_Timer is counting down, THE Focus_Timer SHALL disable the start control to prevent duplicate timers.
10. WHEN the Focus_Timer is paused or stopped, THE Focus_Timer SHALL enable the start control.

---

### Requirement 3: To-Do List — Add and Display Tasks

**User Story:** As a user, I want to add tasks to a list and see them displayed, so that I can track what I need to accomplish.

#### Acceptance Criteria

1. THE Todo_List SHALL provide an input field (accepting 1–250 characters) and a submit control for entering a new Task title.
2. WHEN the user submits a non-empty Task title, THE Todo_List SHALL add the Task to the list and display it within 1 second.
3. IF the user submits an empty or whitespace-only Task title, THEN THE Todo_List SHALL reject the submission and display an inline validation message indicating the Task title is required.
4. WHEN the user moves focus away from the Task title input field and the field contains only whitespace or is empty, THE Todo_List SHALL display an inline validation message indicating the Task title is required.
5. THE Todo_List SHALL display each Task with its title, a completion toggle, an edit control, and a delete control.
6. WHEN the Dashboard page loads and Storage is accessible, THE Todo_List SHALL read the task collection from Storage and render all saved Tasks.
7. IF Storage is inaccessible or returns malformed data on page load, THEN THE Todo_List SHALL render an empty list and display an inline error message.

---

### Requirement 4: To-Do List — Edit Tasks

**User Story:** As a user, I want to edit an existing task's title, so that I can correct mistakes or update what needs to be done.

#### Acceptance Criteria

1. WHEN the user activates the edit control for a Task, THE Todo_List SHALL replace the Task title display with an editable input field pre-filled with the current title.
2. WHEN the user confirms the edit with a non-empty title, THE Todo_List SHALL update the Task title in the list immediately; IF the Storage update fails, THEN THE Todo_List SHALL retain the updated title in the list and display an inline error message indicating the save failed.
3. IF the user confirms the edit with an empty or whitespace-only title, THEN THE Todo_List SHALL reject the update, retain the original Task title, and display an inline validation message indicating the Task title is required.
4. WHEN the user cancels the edit by activating a cancel control, pressing the Escape key, or moving focus away from the edit field, THE Todo_List SHALL restore the original Task title display without modifying Storage.
5. WHEN the user activates the edit control for a Task while another Task is already in edit mode, THE Todo_List SHALL cancel the in-progress edit (restoring the original title) before opening the new edit field.

---

### Requirement 5: To-Do List — Complete and Delete Tasks

**User Story:** As a user, I want to mark tasks as done and delete tasks I no longer need, so that I can maintain an accurate and clean task list.

#### Acceptance Criteria

1. WHEN the user activates the completion toggle for an incomplete Task, THE Todo_List SHALL mark the Task as complete.
2. WHEN a Task is marked as complete, THE Todo_List SHALL apply a strikethrough to the Task title.
3. WHEN the user activates the completion toggle for a complete Task, THE Todo_List SHALL mark the Task as incomplete and remove the strikethrough from the Task title.
4. WHEN the user activates the delete control for a Task, THE Todo_List SHALL remove the Task from the list immediately; IF the Storage delete fails, THEN THE Todo_List SHALL restore the Task to the list and display an inline error message.
5. WHEN the completion state of a Task changes, THE Todo_List SHALL persist the updated task collection to Storage before the next user interaction; IF the Storage save fails, THEN THE Todo_List SHALL retain the updated completion state in the UI and display an inline error message.

---

### Requirement 6: To-Do List — Persistence

**User Story:** As a user, I want my tasks to be saved automatically, so that my list is still available after I close and reopen the browser tab.

#### Acceptance Criteria

1. WHEN a Task is added, THE Todo_List SHALL save the updated task collection to Storage before the next user interaction.
2. WHEN a Task is edited, THE Todo_List SHALL save the updated task collection to Storage before the next user interaction.
3. WHEN a Task is deleted, THE Todo_List SHALL save the updated task collection to Storage before the next user interaction.
4. WHEN the Dashboard is loaded, THE Todo_List SHALL read the task collection from Storage and render all saved Tasks; IF a rendering error occurs for an individual Task, THE Todo_List SHALL skip that Task and continue rendering the remaining Tasks without halting.
5. IF Storage contains no task data, THEN THE Todo_List SHALL render an empty list without error.

---

### Requirement 7: Quick Links — Add and Display Links

**User Story:** As a user, I want to add shortcut buttons for my favourite websites, so that I can open them quickly from the Dashboard.

#### Acceptance Criteria

1. THE Quick_Links SHALL provide an input field for a Link label (accepting 1–100 characters), an input field for a Link URL (accepting 1–2048 characters), and a submit control.
2. WHEN the user submits a Link with a non-empty label, a non-empty URL beginning with `http://` or `https://`, and the total link count is below 50, THE Quick_Links SHALL add the Link and display it as a clickable button without requiring a page reload.
3. IF the user submits a Link with an empty label, an empty URL, a URL not beginning with `http://` or `https://`, or when the link collection has reached 50 entries, THEN THE Quick_Links SHALL reject the submission and display an inline validation message identifying which field or limit caused the rejection.
4. WHEN the user activates a Link button, THE Quick_Links SHALL open the associated URL in a new browser tab.
5. THE Quick_Links SHALL load and display all previously saved Links from Storage on page load.
6. IF Storage is inaccessible or returns malformed data on page load, THEN THE Quick_Links SHALL render an empty panel and display an inline error message.

---

### Requirement 8: Quick Links — Delete Links

**User Story:** As a user, I want to remove quick links I no longer need, so that the panel stays relevant and uncluttered.

#### Acceptance Criteria

1. THE Quick_Links SHALL display a delete control alongside each Link button.
2. WHEN the user activates the delete control for a Link, THE Quick_Links SHALL remove the Link from the panel immediately; IF the Storage delete fails, THEN THE Quick_Links SHALL restore the Link to the panel and display an inline error message.
3. WHEN a Link is successfully removed, THE Quick_Links SHALL not display that Link on the next Dashboard load.

---

### Requirement 9: Quick Links — Persistence

**User Story:** As a user, I want my quick links to be saved automatically, so that they are still available after I close and reopen the browser tab.

#### Acceptance Criteria

1. WHEN a Link is added, THE Quick_Links SHALL save the updated link collection to Storage before the next user interaction; IF the Storage save fails, THEN THE Quick_Links SHALL retain the updated UI state while Storage remains stale until the next save operation succeeds.
2. WHEN a Link is deleted, THE Quick_Links SHALL save the updated link collection to Storage before the next user interaction; IF the Storage save fails, THEN THE Quick_Links SHALL retain the updated UI state while Storage remains stale until the next save operation succeeds.
3. WHEN the Dashboard is loaded or refreshed, THE Quick_Links SHALL read the link collection from Storage and render all saved Links; IF Storage is inaccessible or returns malformed data, THEN THE Quick_Links SHALL render an empty panel and display an inline error message.
4. THE Quick_Links SHALL only read from Storage on a full Dashboard load or refresh, not on individual link add or delete operations.
5. IF Storage contains no link data, THEN THE Quick_Links SHALL render an empty panel without error.

---

### Requirement 10: Technical Constraints

**User Story:** As a developer, I want the Dashboard to be built with HTML, CSS, and Vanilla JavaScript only, so that it runs without any build tools, frameworks, or backend server.

#### Acceptance Criteria

1. THE Dashboard SHALL be implemented using only HTML, CSS, and Vanilla JavaScript, with no external frameworks, libraries, or third-party scripts loaded from external URLs or bundled into the project files.
2. THE Dashboard SHALL use exactly one CSS file located in the `css/` directory with no `@import` statements referencing additional CSS files.
3. THE Dashboard SHALL use exactly one JavaScript file located in the `js/` directory.
4. THE Dashboard SHALL satisfy all widget behavioral requirements defined in Requirements 1–9 in Modern_Browser without requiring installation of any runtime or server.
5. THE Dashboard SHALL store all persistent data exclusively in Storage with no network requests for data persistence.

---

### Requirement 11: Performance and Visual Design

**User Story:** As a user, I want the Dashboard to load quickly and respond instantly to my interactions, so that it does not interrupt my workflow.

#### Acceptance Criteria

1. WHILE the network connection is at least 10 Mbps with a round-trip time of 50 ms or less, THE Dashboard SHALL render the initial view within 2 seconds.
2. WHEN the user interacts with any control, THE Dashboard SHALL reflect the change in the UI within 100 milliseconds.
3. THE Dashboard SHALL visually separate each widget section from the others using a visible border or a distinct background colour difference.
4. WHILE the screen resolution is 1280×720 or above, THE Dashboard SHALL render all text at a minimum font size of 12px.
5. THE Dashboard SHALL be responsive such that no horizontal scrollbar appears and all interactive controls are reachable without horizontal scrolling at viewport widths from 320px to 1920px.
