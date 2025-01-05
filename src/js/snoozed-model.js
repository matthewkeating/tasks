import * as tasks from './tasks-model.js';
import * as trash from './trash-model.js';
import { updateTaskListWithSnoozedItems } from './tasks-controller.js';

let _snoozedTasks = JSON.parse(localStorage.getItem("snoozed_tasks")) || [];

export function getTasks() {
  return _snoozedTasks;
}

function saveSnoozed() {
  localStorage.setItem("snoozed_tasks", JSON.stringify(_snoozedTasks));
}

export function addToSnoozed(task, days) {

  const wakeUpDate = new Date();
  wakeUpDate.setDate(wakeUpDate.getDate() + days);
  wakeUpDate.setHours(0, 0, 0, 0);  // set to midnight
  task.wake_up_date = wakeUpDate.toISOString();

  _snoozedTasks.push(task);

  _snoozedTasks.sort((a, b) => {
    const dateA = new Date(a.wake_up_date);
    const dateB = new Date(b.wake_up_date);
    return dateA - dateB;
  });

  saveSnoozed();
}

export function deleteSnoozedTask(task) {
  delete task.wake_up_date;
  trash.addToTrash(task);
  // remove snoozed task
  _snoozedTasks = _snoozedTasks.filter(i => i.id !== task.id);
  saveSnoozed();
}

export function getNumSnoozedTasks() {
  return _snoozedTasks.length;
}

export function getSnoozedTasksJSON() {
  return JSON.stringify(_snoozedTasks, null, 2);
}

export function unsnoozeTask(task) {
  delete task.wake_up_date;
  tasks.addTask(task, "top");
  // remove snoozed task
  _snoozedTasks = _snoozedTasks.filter(i => i.id !== task.id);
  saveSnoozed();
}

export function unsnoozeAllTasks() {
  _snoozedTasks.forEach(task => {
      unsnoozeTask(task);
  });
}

// called from the scheduler
export function unsnoozeTasks() {
  let rerenderRequired = false;
  _snoozedTasks.forEach(task => {
    if (window.tempo.isBefore(task.wake_up_date, new Date())) {
      unsnoozeTask(task);
      rerenderRequired = true;
    }
  });
  if (document.URL.endsWith("tasks.html") && rerenderRequired) {
    updateTaskListWithSnoozedItems();
  }
}

export function scheduleUnsnoozeScheduler() {
  unsnoozeTasks();  // unsnooze once (before setting the job)
  window.electronAPI.scheduleUnsnooze("0 0 * * *");
}

window.electronAPI.unsnoozeTasks(() => {
  unsnoozeTasks();
});