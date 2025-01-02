export var showingCompleted = JSON.parse(localStorage.getItem("show_completed")) || false;
export var tasksSidebarVisibility = JSON.parse(localStorage.getItem("tasks_sidebar_visibility")) || "always";
export var quickActionsVisibility = JSON.parse(localStorage.getItem("quick_actions_visibility")) || "on-selected";
export var numCompletedTasksToRetain = JSON.parse(localStorage.getItem("num_completed_tasks_to_retain")) || 20;
export var numDeletedTasksToRetain = JSON.parse(localStorage.getItem("num_deleted_tasks_to_retain")) || 20;

export function restoreDefaultSettings() {
  setShowingCompleted(false);
  setTasksSidebarVisibility("always");
  setQuickActionsVisibility("on-selected");
  setNumCompletedTasksToRetain(20);
  setNumDeletedTasksToRetain(20);
}

function setShowingCompleted(value) {
  showingCompleted = value;
  localStorage.setItem("show_completed", showingCompleted);
}

export function toggleShowCompleted() {
  showingCompleted = !showingCompleted;
  localStorage.setItem("show_completed", showingCompleted);
}

export function setTasksSidebarVisibility(value) {
  tasksSidebarVisibility = value;
  localStorage.setItem("tasks_sidebar_visibility", JSON.stringify(tasksSidebarVisibility));
}

export function setQuickActionsVisibility(value) {
  quickActionsVisibility = value;
  localStorage.setItem("quick_actions_visibility", JSON.stringify(quickActionsVisibility));
}

export function setNumCompletedTasksToRetain(number) {
  localStorage.setItem("num_completed_tasks_to_retain", number);
}

export function setNumDeletedTasksToRetain(number) {
  localStorage.setItem("num_deleted_tasks_to_retain", number);
}