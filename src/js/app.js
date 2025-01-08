/*
 * Global functions
 */
export function showSettings() {
  window.location.href = "/src/pages/settings.html";
}

export function showSnoozed() {
  window.location.href = "/src/pages/snoozed.html";
}

export function showTasks() {
  window.location.href = "/";
}

export function showTrash() {
  window.location.href = "/src/pages/trash.html";
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