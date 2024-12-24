import * as app from './app.js';
import * as tasks from './tasks-model.js';
import * as settings from './settings-model.js';
import * as sidebar from './sidebar.js';

// no matter where the user clicks, if the menu is open, close it.
document.addEventListener("click", function(event) {
  document.getElementById("ellipsis").classList.remove("active");
  document.getElementById("menu").classList.remove("active");
});

var _selectedTask = null;

const _addTaskInputBox = document.getElementById("addTaskInputBox");
_addTaskInputBox.addEventListener("keypress", event => {

  if (event.key === "Enter" && _addTaskInputBox.value.trim()) {
    const newTask = { id: Date.now().toString(),
      title: _addTaskInputBox.value,
      note: "",
      pinned: false,
      flagged: false,
      completed: false
    };

    if (event.shiftKey) {
      tasks.addTask(newTask, "bottom");
    } else {
      tasks.addTask(newTask, "top");
    }

    renderTasks();
    sidebar.showSidebar();
    selectTask(newTask);
    _addTaskInputBox.value = "";
  }
});
_addTaskInputBox.addEventListener('focus', event => {
  deselectTask(_selectedTask);
  if (settings.tasksSidebarVisibility === "dbl-click") {
    sidebar.hideSidebar();
  }
});

const _taskTitle = document.getElementById("taskTitle");
_taskTitle.contentEditable = true;
_taskTitle.onmouseover = () => { document.body.style.cursor = 'text'; }
_taskTitle.onmouseout = () => { document.body.style.cursor = 'default'; }
_taskTitle.oninput = () => {
  // update the title in the task list
  document.querySelector(`[data-id="${_selectedTask.id}"]`).getElementsByClassName("task-title")[0].innerHTML = _taskTitle.innerText;
  // save the updated title
  _selectedTask.title = _taskTitle.innerText;
  tasks.saveTasks();
};

const _notesTextArea = document.getElementById("notesTextArea");
_notesTextArea.oninput = () => {
  // update the notes idicator in the task list
  let div = document.querySelector(`[data-id="${_selectedTask.id}"]`); 
  let img = div.getElementsByClassName("icon-note")[0];
  if (_notesTextArea.value.length > 0) {
    img.setAttribute('src', '../images/note.svg');
  } else {
    img.setAttribute('src', '');
  }
  // save the updated note
  _selectedTask.note = _notesTextArea.value;
  tasks.saveTasks();
};

document.getElementById("ellipsis").onclick = (event) => {
  ellipsis.classList.toggle("active");
  document.getElementById("menu").classList.toggle("active");
  event.stopPropagation();
};
document.getElementById("sidebarActionClose").onclick = (event) => { sidebar.hideSidebar(); };
document.getElementById("sidebarActionCircle").onclick = (event) => { toggleCompleted(_selectedTask); };
document.getElementById("sidebarActionTrash").onclick = (event) => { deleteTaskAndHighlightNextTask(_selectedTask); };
document.getElementById("sidebarActionFlag").onclick = (event) => { toggleFlag(_selectedTask); };
document.getElementById("sidebarActionPin").onclick = (event) => { togglePin(_selectedTask); };
document.getElementById("menuItemTrash").onclick = (event) => {app.showTrash(); };
document.getElementById("menuItemSettings").onclick = (event) => { app.showSettings(); };

document.getElementById("menuItemToggleCompleted").onclick = (event) => {
  settings.toggleShowCompleted();
  if (!settings.showingCompleted && _selectedTask.completed === true) {
    // the selected task is being hidden
    _selectedTask = null;
    _addTaskInputBox.focus();
  }
  setMenuText();
  renderTasks();
  selectTask(_selectedTask);
};


/********************************
 * Hot keys
 ********************************/
document.addEventListener("keydown", e => {
  if (e.key === "Escape") {
    if (sidebar.isShown()) {
      sidebar.hideSidebar();
      blurAllInputs();
    } else {
      _addTaskInputBox.focus();
    }
  } else if (e.metaKey && e.key === "Backspace") {
    deleteTaskAndHighlightNextTask(_selectedTask);
  } else if (e.metaKey && e.shiftKey && e.key === 'p') {
    togglePin(_selectedTask);
  } else if (e.metaKey && e.shiftKey && e.key === '[') {
    selectPreviousTask(_selectedTask);
  } else if (e.metaKey && e.shiftKey && e.key === ']') {
    // handle the case where the user wants to navigate to the first element from the _addTaskInputBox
    if (_addTaskInputBox === document.activeElement && tasks.getNumTasks(settings.showingCompleted) > 0) {
      const firstTask = tasks.getTaskByIndex(0);
      selectTask(firstTask);
      return;
    }
    selectNextTask(_selectedTask);
  } else if (e.metaKey && e.shiftKey && e.key === 'c') {
    document.getElementById("menuItemToggleCompleted").click();
  }
});
// for overriding the global command+o hotkey (see index.js and preload.js for more)
  window.electronAPI.onToggleCompleted(() => {
  toggleCompleted(_selectedTask);
});

/***********************************************
 * Define methods
 ***********************************************/

function selectTask(task) {
  
  if (task !== _selectedTask) {
    deselectTask(_selectedTask);
  }

  // calling functions can send in a null value. In this case all we want to do is deselect the current task.
  if (task === null) return;

  _selectedTask = task;

  // highlight the selected task
  const t = document.querySelector(`[data-id="${task.id}"]`);
  t.classList.add("task-selected");
  
  // show quick actions (if settings are configured as such)
  if (settings.quickActionsVisibility === "on-selected") {
    showQuickAction(_selectedTask.id);
  }
  
  showTaskDetails(_selectedTask);

}

function showTaskDetails(task) {

  const taskDetails = document.getElementById("taskDetails");

  const circle = document.getElementById("sidebarActionCircle");
  const flag = document.getElementById("sidebarActionFlag");
  const pin = document.getElementById("sidebarActionPin");

  if (task.completed) {
    circle.src = "../images/circle_checked.svg";
  } else {
    circle.src = "../images/circle_empty.svg"; 
  }

  if (task.flagged) {
    flag.src = "../images/flag_filled.svg";
  } else {
    flag.src = "../images/flag_empty.svg";
  }

  if (task.pinned) {
    pin.src = "../images/pin_filled.svg";
  } else {
    pin.src = "../images/pin_empty.svg";
  }

  _taskTitle.innerText = task.title;
  _notesTextArea.value = task.note || "";
  _notesTextArea.focus();

  taskDetails.classList.remove("display-none");

  if (sidebar.isShown()) {
    _notesTextArea.focus();   // Set focus to the notes box
  } else {
    _addTaskInputBox.blur(); // this effectively removes focus from any input element
  }
}

function deselectTask(task) {
  // there are situations where this function could be called with null (so we have to check)
  if (task === null) return;

  // remove highlights from any tasks
  const selectedTasks = document.getElementsByClassName("task-selected");
  for (let i = 0; i < selectedTasks.length; i++) {
    selectedTasks[i].classList.remove("task-selected");
  }

  // hide/remove task details (if showing)
  if (document.getElementById("taskDetails") !== null) {
    document.getElementById("taskDetails").classList.add("display-none");
  }

  if (settings.quickActionsVisibility === "on-selected" && task !== null) {
    hideQuickAction(task.id);
  }
  _selectedTask = null;
}

function toggleFlag(task) {
  tasks.toggleFlagged(task);
  renderTasks();
  selectTask(_selectedTask);
}
 
function togglePin(task) {
  tasks.togglePin(task);
  renderTasks();
  selectTask(_selectedTask);
};

function toggleCompleted(task) {
  
  tasks.toggleCompleted(task);
  renderTasks();

  if (_selectedTask === task && settings.showingCompleted) {
    // the task being toggled is the currently selected task and the UI is showing completed tasks
    selectTask(task);
  } else if (_selectedTask === task && !settings.showingCompleted) {
    // the task being toggled is the currently selected task but the UI is not showing completed tasks
    getNextTaskToHighlight(task);
  } else if (_selectedTask !== task) {
    // the task being toggled is not the current selected task
    selectTask(_selectedTask);
  } else {
    throw "Unexpected condition."
  }

};

function selectPreviousTask(task) {
  let previousTask = tasks.getPreviousTask(task, settings.showingCompleted);
  selectTask(previousTask);
}

function selectNextTask(task) {
  let nextTask = tasks.getNextTask(task, settings.showingCompleted);
  selectTask(nextTask);
}

function getNextTaskToHighlight(task) {
  
  let indexOfTask = null;
  let taskArray = tasks.getTasks(settings.showingCompleted);
  indexOfTask = taskArray.findIndex(i => i.id === task.id);  // get the position in the array the task passed into this function

  // these are the easy cases :)
  if (taskArray.length === 1) {
    // after deleting, there will be no tasks left in the list
    return null;
  } else if (indexOfTask === 0) {
    // you are deleting the first task in the list, so return the second task
    return taskArray[1];
  } else if (indexOfTask === taskArray.length-1) {
    // you are deleting the last task in the list, so return the second to last task
    return taskArray[taskArray.length - 2];
  }

  // now deal with the harder cases :(
  var retVal = null;

  var previousTask = taskArray[indexOfTask - 1];
  var nextTask = taskArray[indexOfTask + 1];

  if (nextTask.pinned === _selectedTask.pinned && nextTask.completed === _selectedTask.completed) {
    return nextTask;
  } else {
    return previousTask;
  }

  return null;

}

function deleteTaskAndHighlightNextTask(task) {

  if (_selectedTask === task) {
    // if the user is deleting the selected task, we want to automatically select the
    // next "most logical" task to in the list
    var nextTaskToHighlight = getNextTaskToHighlight(task);
    if (nextTaskToHighlight !== null) {
      _selectedTask = nextTaskToHighlight;
    } else {
      // there are no tasks left in the list
      _selectedTask = null;
      sidebar.hideSidebar();
    }
  }

  tasks.deleteTask(task);
  renderTasks();
  selectTask(_selectedTask);

}

function setMenuText() {
  let toggleCompletedMenuTitle;
  if (settings.showingCompleted) {
    toggleCompletedMenuTitle = "Hide Completed"
  } else {
    toggleCompletedMenuTitle = "Show Completed"
  }
  document.getElementById("menuItemToggleCompleted").firstElementChild.innerHTML = toggleCompletedMenuTitle;
}

function getQuickActions(task) {
    
  // pin
  const pin = document.createElement("img");
  if (task.pinned === true) {
    pin.src = "../images/pin_filled.svg";
  } else {
    pin.src = "../images/pin_empty.svg";
  }
  pin.classList.add("icon-pin");
  pin.onclick = () => { togglePin(task); }

  // delete
  const deleteImage = document.createElement("img");
  deleteImage.src = "../images/trash.svg";
  deleteImage.classList.add("icon-trash");
  deleteImage.onclick = () => { deleteTaskAndHighlightNextTask(task); }

  // flag
  const flag = document.createElement("img");
  if (task.flagged) {
    flag.src = "../images/flag_filled.svg";
  } else {
    flag.src = "../images/flag_empty.svg";
  }
  flag.classList.add("icon-flag");
  flag.onclick = () => { toggleFlag(task); }

  // create a element to hold all the quick actions
  const quickActions = document.createElement("div");
  quickActions.id = "qa_" + task.id;
  quickActions.classList.add("quick-actions");
  quickActions.appendChild(deleteImage);
  quickActions.appendChild(flag);
  quickActions.appendChild(pin);
  
  return quickActions;
}

function showQuickAction(taskId) {
let qa = document.getElementById("qa_" + taskId);
  if (qa !== null) {
    qa.classList.remove("display-none");
  }
}
function hideQuickAction(taskId) {
  let qa = document.getElementById("qa_" + taskId);
  if (qa !== null) {
    qa.classList.add("display-none");
  } 
}

function renderTasks() {

  var tasksToRender = null;

  // reset the pinned tasks container
  const pinnedHeading = document.getElementById("pinnedHeading");
  const pinnedContainer = document.getElementById("pinnedContainer");
  pinnedContainer.innerHTML = "";
  if (tasks.getNumPinnedTasks() > 0) {
    pinnedHeading.classList.remove("display-none");
    pinnedContainer.classList.remove("display-none");
  } else {
    pinnedHeading.classList.add("display-none");
    pinnedContainer.classList.add("display-none"); 
  }

  // reset the unpinned tasks container
  const unpinnedHeading = document.getElementById("unpinnedHeading");   
  const unpinnedContainer = document.getElementById("unpinnedContainer");
  unpinnedContainer.innerHTML = "";
  if (tasks.getNumUnpinnedTasks() > 0) {
    unpinnedHeading.classList.remove("display-none");
    unpinnedContainer.classList.remove("display-none");
  } else {
    unpinnedHeading.classList.add("display-none");
    unpinnedContainer.classList.add("display-none"); 
  }

  // reset the completed tasks container
  const completedHeading = document.getElementById("completedHeading");
  const completedContainer = document.getElementById("completedContainer");
  completedContainer.innerHTML = "";
  if (settings.showingCompleted === true && tasks.getNumCompletedTasks() > 0) {
    completedHeading.classList.remove("display-none");
    completedContainer.classList.remove("display-none");
  } else {
    completedHeading.classList.add("display-none");
    completedContainer.classList.add("display-none"); 
  }
  
  tasksToRender = tasks.getTasks(settings.showingCompleted);
  tasksToRender.forEach(task => {

    // Create the div that will hold all the elements of the task
    const taskDiv = document.createElement("div");
    taskDiv.classList.add("task");
    taskDiv.draggable = true;  // completed tasks are not draggable
    taskDiv.dataset.id = task.id;
    taskDiv.dataset.type = "selectable";

    // set up click behaviors
    taskDiv.addEventListener("mousedown", (event) => {
      // if statement will allow the event to fire when the taskDiv or titleDiv is selected
      // while preventing it from firing when any of the taskDiv children (e.g., the complete or
      // delete buttons) are clicked
      let divType = event.target.dataset.type;
      if (divType === "selectable") {
        selectTask(task);
      }
    });
    if (settings.tasksSidebarVisibility === "dbl-click") {
      taskDiv.addEventListener("dblclick", (event) => {
        // if statement will allow the click event to fire when the taskDiv or titleDiv is selected
        // while preventing it from firing when any of the taskDiv children (e.g., the complete or
        // delete buttons) are clicked
        let divType = event.target.dataset.type;
        if (divType === "selectable") {
          sidebar.showSidebar();
          _notesTextArea.focus();
        }
      });
    }

    const circle = document.createElement("img");
    circle.classList.add("icon-circle");
    if (task.completed === true) {
      circle.src = "../images/circle_checked.svg";
    } else {
      circle.src = "../images/circle_empty.svg";
    }
    circle.addEventListener("click", (event) => {
      toggleCompleted(task);
      if (task.completed === true) {
        if (!settings.showingCompleted) {
          if (_selectedTask === task) {
            _addTaskInputBox.focus();
          }
        }
      } else {
        selectTask(task);
      }
      event.stopPropagation();
    });

    // Create the div for the task title 
    const title = document.createElement("div");
    title.dataset.id = task.id;
    title.dataset.type = "selectable";
    title.classList.add("task-title");
    if (task.completed) {
      title.classList.add("task-title-completed");
    }
    title.innerText = task.title;

    if (task.flagged === true) {
      title.classList.add("flagged");
    } else {
      title.classList.remove("flagged");
    }

    // Create the img element that will hold the note indicator
    const note = document.createElement("img");
    if (task.note.trim().length !== 0) {
      note.src = "../images/note.svg";
    }
    note.classList.add("icon-note");
    note.addEventListener("click", (event) => { _selectedTask = task; });

    let quickActions = null;
    if (settings.quickActionsVisibility === "never") {
      quickActions = document.createElement("div");
    } else {
      quickActions = getQuickActions(task);
      quickActions.classList.add("display-none");
    }

    // Add all of the above task elements to the task div
    taskDiv.appendChild(circle);
    taskDiv.appendChild(title);
    taskDiv.appendChild(quickActions);
    taskDiv.appendChild(note);
     
    // Add the task div to the task container
    if (task.pinned === true) {
      pinnedContainer.appendChild(taskDiv); 
    } else if (task.completed === true) {
      completedContainer.appendChild(taskDiv);
    } else {
      unpinnedContainer.appendChild(taskDiv); 
    }

  });

};

function blurAllInputs() {
  _addTaskInputBox.blur();
  _taskTitle.blur();
  _notesTextArea.blur();
}

/***********************************************
 * Ddrag and drop stuff
 ***********************************************/
document.addEventListener("DOMContentLoaded", () => {

  const draggableContainers = document.querySelectorAll(".draggable-container");

  draggableContainers.forEach(container => {

    container.addEventListener("dragstart", event => {
      event.target.classList.add("dragging");
    });
    
    container.addEventListener("dragend", event => {
      event.target.classList.remove("dragging");
    });

    container.addEventListener("dragover", event => {

      event.preventDefault();

      const dragging = document.querySelector(".dragging");
      const afterElement = getDragAfterElement(container, event.clientY);

      if (container.id == "completedContainer") {
        container.classList.add("dragover-completed");  
        return;
      }

      if (afterElement == null) {
        container.appendChild(dragging);
      } else {
        container.insertBefore(dragging, afterElement);
      }
    });

    container.addEventListener('dragleave', (event) => {
      if (container.id == "completedContainer") {
        container.classList.remove("dragover-completed");
      }
    });

    container.addEventListener("drop", event => {  

      if (container.id == "pinnedContainer") {
        _selectedTask.pinned = true;
        _selectedTask.completed = false;
      }
      if (container.id == "unpinnedContainer") {
        _selectedTask.pinned = false;
        _selectedTask.completed = false;
      }
      if (container.id == "completedContainer") {
        _selectedTask.pinned = false;
        _selectedTask.completed = true;
        container.classList.remove("dragover-completed");
      }

      const children = document.getElementById(container.id).children;
      const updatedOrder = Array.from(children).map(div => div.dataset.id);
      let taskArray = tasks.getTasks(settings.showingCompleted);
      taskArray.sort((a, b) => updatedOrder.indexOf(a.id) - updatedOrder.indexOf(b.id));
      tasks.replaceTasks(taskArray);
      renderTasks();
      selectTask(_selectedTask);

    });
      
    // Add drag events to each task
    const t = container.querySelectorAll(".task");
    t.forEach(task => {
      task.addEventListener("dragstart", event => {
        event.target.classList.add("dragging");
      });
      task.addEventListener("dragend", event => {
        event.target.classList.remove("dragging");
      });
    });
  });

  const getDragAfterElement = (container, y) => {
    const draggableElements = [...container.querySelectorAll(".task:not(.dragging)")];
    return draggableElements.reduce((closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      return offset < 0 && offset > closest.offset ? { offset, element: child } : closest;
    }, { offset: Number.NEGATIVE_INFINITY }).element;
  };
});

/***********************************************
 * Commands to run on page load
 ***********************************************/

if (settings.tasksSidebarVisibility === "always") {
  sidebar.showSidebar();
} else {
  sidebar.hideSidebar();
}
setMenuText();
renderTasks();