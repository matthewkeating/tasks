import * as app from './app.js';
import * as tasks from './tasks-model.js';
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
const qucikActionsRadioButtons = document.querySelectorAll('input[name="quick-actions-visibility"]');
qucikActionsRadioButtons.forEach(radio => {
    radio.addEventListener('change', () => {
        settings.setQucikActionsVisibiity(radio.value);
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

deleteAllTasks.addEventListener("click", () => {
  var result = confirm("This action cannot be undone. Are you sure you want to permanently delete this task?");
  if (result) {
    tasks.deleteAllTasks();
    trash.emptyTrash();
  }
});

window.electronAPI.hideSidebar();
