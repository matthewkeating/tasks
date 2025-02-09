import * as app from './app.js';
import * as tasks from './tasks-model.js';
import * as snoozed from './snoozed-model.js';
import * as trash from './trash-model.js';
import * as settings from './settings-model.js';

document.addEventListener("keydown", e => {
  if (e.key === "Escape") app.showTasks();
});

closePage.addEventListener("click", () => {
  app.showTasks();
});

showCompletedCheckbox.checked = settings.showingCompleted;
showCompletedCheckbox.addEventListener("click", () => {
  settings.toggleShowCompleted();
});

const tasksSidebarVisibilityButton = document.querySelector(`input[name="tasks-sidebar-visibility"][value="${settings.tasksSidebarVisibility}"]`);
tasksSidebarVisibilityButton.checked = true;
const tasksSidebarVisibilityButtons = document.querySelectorAll('input[name="tasks-sidebar-visibility"]');
tasksSidebarVisibilityButtons.forEach(radio => {
    radio.addEventListener('change', () => {
        settings.setTasksSidebarVisibility(radio.value);
    });
});

const quickActionButton = document.querySelector(`input[name="quick-actions-visibility"][value="${settings.quickActionsVisibility}"]`);
quickActionButton.checked = true;
const quickActionsRadioButtons = document.querySelectorAll('input[name="quick-actions-visibility"]');
quickActionsRadioButtons.forEach(radio => {
    radio.addEventListener('change', () => {
        settings.setQuickActionsVisibility(radio.value);
    });
});

numCompletedTasksToRetain.value = settings.numCompletedTasksToRetain;
numCompletedTasksToRetain.addEventListener("change", (event) => {
  settings.setNumCompletedTasksToRetain(event.target.value);
});

numDeletedTasksToRetain.value = settings.numDeletedTasksToRetain;
numDeletedTasksToRetain.addEventListener('change', (event) => {
  settings.setNumDeletedTasksToRetain(event.target.value);
});

restoreDefaultSettings.addEventListener("click", () => {
  var result = confirm("Are you sure you want to restore the default settings?");
  if (result) {
    settings.restoreDefaultSettings();
    app.showSettings();
  }
});

downloadTasks.addEventListener("click", () => {
  let data = tasks.getTasksJSON();
  data = data + "\n" + snoozed.getSnoozedTasksJSON();
  data = data + "\n" + trash.getTrashJSON();
  if (data === null) return;
  const blob = new Blob([data], {type: 'application/json'});
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'tasks.json';
  document.body.appendChild(link);
  link.click();                     // Simulate click to trigger download
  document.body.removeChild(link);  // Clean up
  URL.revokeObjectURL(url);         // Release the Blob URL after download
});

deleteAllTasks.addEventListener("click", () => {
  var result = confirm("This action cannot be undone. Are you sure you want to permanently delete this task?");
  if (result) {
    snoozed.unsnoozeAllTasks();
    tasks.deleteAllTasks();
    trash.emptyTrash();
  }
});

window.electronAPI.hideSidebar();
