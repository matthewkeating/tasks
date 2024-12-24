import * as tasks from './tasks-model.js';
import * as settings from './settings-model.js';

var _deletedTasks = JSON.parse(localStorage.getItem("deleted_tasks")) || [];

export function getTasks() {
  return _deletedTasks;
}

function saveTrash() {
  localStorage.setItem("deleted_tasks", JSON.stringify(_deletedTasks));
}

export function addToTrash(task) {

  // add task to the trash (but only keep the last n tasks, based on user settings)
  if (_deletedTasks.length === settings.numDeletedTasksToRetain) {
    _deletedTasks.pop();  // remove the last item in the list
  }
  _deletedTasks.unshift(task);  // add to the top of the list

  // save the deleted task list to local storage
  saveTrash();

}

export function undeleteTask(task) {
  tasks.addTask(task);
  permanentlyDeleteTask(task);
}

export function permanentlyDeleteTask(task) {
  // remove the deleted task from the task list
  _deletedTasks = _deletedTasks.filter(i => i.id !== task.id);
  saveTrash();
}

export function emptyTrash() {
  localStorage.removeItem('deleted_tasks');
  _deletedTasks = [];
}