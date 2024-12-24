import * as trash from './trash-model.js';

var _tasks = JSON.parse(localStorage.getItem("tasks")) || [];

export function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(_tasks));
};

export function replaceTasks(newTaskArray) {
  _tasks = newTaskArray;
  sortTasks();
  saveTasks();
};

// maintains the order of the task list (pinned on top, completed on bottom)
export function sortTasks() {
  let pinnedTasks = _tasks.filter(task => task.pinned === true);
  let unpinnedTasks = _tasks.filter(task => task.pinned === false && task.completed === false);
  let completedTasks = _tasks.filter(task => task.completed === true);
  _tasks = pinnedTasks.concat(unpinnedTasks).concat(completedTasks); 
}

export function getTasks(includeCompleted) {

  if (arguments.length === 0) {
    includeCompleted = true;
  }

  var retVal;
  if (includeCompleted) {
    retVal = _tasks;
  } else {
    retVal = _tasks.filter((task => task.completed === false));  // get the uncompleted tasks
  }

  return retVal;

}

export function getTaskByIndex(index) {
  if (_tasks.length-1 >= index) {
    return _tasks[index];
  }
  return null;
}

export function getNumTasks(includeCompleted) {
  let retVal = null;
  if (includeCompleted) {
    retVal = _tasks.length;
  } else {
    const array = _tasks.filter(task => task.completed === false);
    retVal = array.length;
  }
  return retVal;
}

export function getNumPinnedTasks() {
  let array = _tasks.filter(task => task.pinned === true);  // get the pinned tasks
  return array.length;
}

export function getNumUnpinnedTasks() {
  let array = _tasks.filter(task => task.pinned === false && task.completed === false);  // get the unpinned tasks
  return array.length;
}

export function getNumCompletedTasks() {
  let array = _tasks.filter(task => task.completed === true);  // get the completed tasks
  return array.length;
}

export function addTask(task, position) {
    if (position === "bottom") {
      _tasks.push(task);     // append to end of list
    } else {
      _tasks.unshift(task);  // add to the start of the list
    }
    sortTasks();
    saveTasks();
}

export function deleteTask(task) {

  trash.addToTrash(task);

  // remove the deleted task from the task list
  _tasks = _tasks.filter(i => i.id !== task.id);
  saveTasks();
}

export function deleteAllTasks() {
  localStorage.removeItem('tasks');
  _tasks = [];
}

export function toggleCompleted(task) {

  let position = "bottom";

  task.completed = !task.completed;
  if (task.completed) {
    task.pinned = false; // completing a pinned task makes it no longer pinned
    position = "top";
  }

  // this is necessary to properly position a task in the task array before the sort operation:
  //  - tasks that have been marked as completed should be positioned at the top of the completed list
  //  - tasks that have been marked as not completed should more to the bottom of the unpinned list
  _tasks = _tasks.filter(i => i.id !== task.id);
  addTask(task, position);
  
  sortTasks();
  saveTasks();
}

export function togglePin(task) {

  task.pinned = !task.pinned;
  if (task.pinned) {
    task.completed = false; // pinning a completed task makes it no longer completed
  }

  // this is necessary to properly position a task in the task array before the sort operation:
  //  - tasks that have been pinned should be positioned at the top of the pinned list
  //  - tasks that have been unpinned should positioned at the top of the unpinned list
  _tasks = _tasks.filter(i => i.id !== task.id);
  addTask(task, "top");

  sortTasks();
  saveTasks();
}

export function toggleFlagged(task) {
  task.flagged = !task.flagged;
  saveTasks();
}

// returns the previous task in the list
// if the task given is null, return null
// if the task given is the first task, return the first task
export function getPreviousTask(task, includeCompleted) {

  let taskArray = getTasks(includeCompleted);

  if (task === null) {
    return null;
  }

  let indexOfCurrentTask = taskArray.findIndex(i => i.id === task.id);
  if (indexOfCurrentTask === 0) {
    // task given is the first task
    return task;
  }
  
  return taskArray[indexOfCurrentTask-1];

}

// returns the next task in the list
// if the task given is null, return null
// if the task given is the last task, return the last task
export function getNextTask(task, includeCompleted) {

  let taskArray = getTasks(includeCompleted);

  if (task === null) {
      return null;
  }

  let indexOfCurrentTask = taskArray.findIndex(i => i.id === task.id);
  if (indexOfCurrentTask === taskArray.length-1) {
    // task given is the last task
    return task;
  }
  
  return taskArray[indexOfCurrentTask+1];

}