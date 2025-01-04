/*
 * Global functions
 */
export function showSettings() {
  window.location.href = "./settings.html";
}

export function showSnoozed() {
  window.location.href = "./snoozed.html";
}

export function showTasks() {
  window.location.href = "./tasks.html";
}

export function showTrash() {
  window.location.href = "./trash.html";
}

/*
 * IPC Functions
 */
window.electronAPI.newTask(() => {
  showTasks();
});

window.electronAPI.openSettings(() => {
  window.electronAPI.disableTaskMenu();
  showSettings();
});

window.electronAPI.openSnoozed(() => {
  window.electronAPI.disableTaskMenu();
  showSnoozed();
});

window.electronAPI.openTrash(() => {
  window.electronAPI.disableTaskMenu();
  showTrash();
});