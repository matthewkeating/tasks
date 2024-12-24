/*
 * Global hot keys
 */ 
document.addEventListener("keydown", e => {
  if (e.metaKey && e.shiftKey && e.key === 't') {
    showTrash();
  } else if (e.metaKey && e.key === 'n') {
    showTasks();
  } else if (e.metaKey && e.key === ",") {
    showSettings();
  }
});

/*
 * Global functions
 */
export function showSettings() {
  window.location.href = "./settings.html";
}

export function showTasks() {
  window.location.href = "./tasks.html";
}

export function showTrash() {
  window.location.href = "./trash.html";
}