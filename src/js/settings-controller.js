import * as app from './app.js';
import * as tasks from './tasks-model.js';
import * as trash from './trash-model.js';
import * as settings from './settings-model.js';

document.addEventListener("keydown", e => {
  if (e.key === "Escape") app.showTasks();
});

document.getElementById("closeSettings").addEventListener("click", () => {
  app.showTasks();
});

document.getElementById("showCompletedCheckbox").checked = settings.showingCompleted;
document.getElementById("showCompletedCheckbox").addEventListener("click", () => {
  settings.toggleShowCompleted();
});

const tasksSidebarVisibilityButton = document.querySelector(`input[name="tasks-sidebar-visibility"][value="${settings.tasksSidebarVisibility}"]`);
tasksSidebarVisibilityButton.checked = true;
const tasksSidebarVisibilityButtons = document.querySelectorAll('input[name="tasks-sidebar-visibility"]');
tasksSidebarVisibilityButtons.forEach(radio => {
    radio.addEventListener('change', () => {
        settings.setTasksSidebarVisibiity(radio.value);
    });
});

const quickActionButton = document.querySelector(`input[name="quick-actions-visibility"][value="${settings.quickActionsVisibility}"]`);
quickActionButton.checked = true;
const qucikActionsRadioButtons = document.querySelectorAll('input[name="quick-actions-visibility"]');
qucikActionsRadioButtons.forEach(radio => {
    radio.addEventListener('change', () => {
        settings.setQucikActionsVisibiity(radio.value);
    });
});

document.getElementById("numCompletedTasksToRetain").value = settings.numCompletedTasksToRetain;
document.getElementById("numCompletedTasksToRetain").addEventListener("change", (event) => {
  settings.setNumCompletedTasksToRetain(event.target.value);
});

document.getElementById("numDeletedTasksToRetain").value = settings.numDeletedTasksToRetain;
document.getElementById("numDeletedTasksToRetain").addEventListener('change', (event) => {
  settings.setNumDeletedTasksToRetain(event.target.value);
});

document.getElementById("restoreDefaultSettings").addEventListener("click", () => {
  var result = confirm("Are you sure you want to restore the default settings?");
  if (result) {
    settings.restoreDefaultSettings();
    app.showSettings();
  }
});

document.getElementById("deleteAllTasks").addEventListener("click", () => {
  var result = confirm("This action cannot be undone. Are you sure you want to permanently delete this task?");
  if (result) {
    tasks.deleteAllTasks();
    trash.emptyTrash();
  }
});

window.electronAPI.hideSidebar();
