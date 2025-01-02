import * as app from './app.js';
import * as tasks from './tasks-model.js';
import * as settings from './settings-model.js';
import * as snoozed from './snoozed-model.js';
import * as sidebar from './sidebar.js';
import { EditableDivWithPlaceholder } from '../components/editable-div.js';

var _selectedTask = null;
var _editableTaskDetailsTitle = null;
var _taskNotes = null;

/****************************************************************************
 * Element Binding
 ****************************************************************************/
function bindEvents() {

  // no matter where the user clicks, if the menu is open, close it.
  document.addEventListener("click", function(event) {
    closeAppMenu();
    closeSnoozeSelectorMenu();
  });

  // application-specific hotkeys
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") {
      if (sidebar.isShown() && settings.tasksSidebarVisibility === "dbl-click") {
        sidebar.hideSidebar();
        blurAllInputs();
      } else {
        addTaskInputBox.focus();
      }
    } else if (e.metaKey && e.key === "Backspace") {
      deleteTaskAndHighlightNextTask(_selectedTask);
    } else if (e.metaKey && e.shiftKey && e.key === 'p') {
      togglePin(_selectedTask);
    } else if (e.metaKey && e.shiftKey && e.key === '[') {
      selectPreviousTask(_selectedTask);
    } else if (e.metaKey && e.shiftKey && e.key === ']') {
      // handle the case where the user wants to navigate to the first element from the addTaskInputBox
      if (addTaskInputBox === document.activeElement && tasks.getNumTasks(settings.showingCompleted) > 0) {
        const firstTask = tasks.getTaskByIndex(0);
        selectTask(firstTask);
        return;
      }
      selectNextTask(_selectedTask);
    } else if (e.metaKey && e.shiftKey && e.key === 'c') {
      appMenuItemToggleCompleted.click();
    }
  });

  // operating system global hotkey
  window.electronAPI.onToggleCompleted(() => {
    toggleCompleted(_selectedTask);
  });

  // Add Task input box
  addTaskInputBox.addEventListener("keypress", event => {

    if (event.key === "Enter" && addTaskInputBox.value.trim()) {
      const newTask = { id: Date.now().toString(),
        title: addTaskInputBox.value,
        notes: null,
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
      addTaskInputBox.value = "";
    }
  
  });
  addTaskInputBox.addEventListener('focus', event => {
    deselectTask(_selectedTask);
    if (settings.tasksSidebarVisibility === "dbl-click") {
      sidebar.hideSidebar();
    }
  });

  // snooze indicator
  snoozeIndicator.onclick = (event) => { app.showSnoozed(); };

  // application menu
  appEllipsis.onclick = (event) => {
    closeSnoozeSelectorMenu();
    appEllipsis.classList.toggle("active");
    appMenu.classList.toggle("active");
    event.stopPropagation();
  };
  appMenuItemToggleCompleted.onclick = (event) => {
    settings.toggleShowCompleted();
    if (!settings.showingCompleted && _selectedTask !== null && _selectedTask.completed === true) {
      // the selected task is being hidden
      _selectedTask = null;
      addTaskInputBox.focus();
    }
    setAppMenuText();
    renderTasks();
    selectTask(_selectedTask);
  };
  appMenuItemSnoozed.onclick = (event) => { app.showSnoozed(); };
  appMenuItemTrash.onclick = (event) => { app.showTrash(); };
  appMenuItemSettings.onclick = (event) => { app.showSettings(); };

  // sidebar actions
  sidebarActionHide.onclick = (event) => { sidebar.hideSidebar(); };
  sidebarActionCircle.onclick = (event) => { toggleCompleted(_selectedTask); };
  sidebarActionTrash.onclick = (event) => { deleteTaskAndHighlightNextTask(_selectedTask); };
  sidebarActionFlag.onclick = (event) => { toggleFlag(_selectedTask); };
  sidebarActionPin.onclick = (event) => { togglePin(_selectedTask); };

  // snooze button and menu
  snoozeSelectorButton.onclick = (event) => {

    closeAppMenu();  // if it is open
  
    const optionsNear = { weekday: 'long' };
    const optionsFar = { day: 'numeric', month: 'short' };
  
    const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
    const twoDays = new Date(); twoDays.setDate(twoDays.getDate() + 2);
    const threeDays = new Date(); threeDays.setDate(threeDays.getDate() + 3);
    const fiveDays = new Date(); fiveDays.setDate(fiveDays.getDate() + 5);
    const sevenDays = new Date(); sevenDays.setDate(sevenDays.getDate() + 7);
    const tenDays = new Date(); tenDays.setDate(tenDays.getDate() + 10);
    const twoWeeks = new Date(); twoWeeks.setDate(twoWeeks.getDate() + 14);
  
    snoozeOneDayTitle.innerHTML = "Tomorrow";
    snoozeTwoDaysTitle.innerHTML = twoDays.toLocaleDateString('en-US', optionsNear);
    snoozeTwoDaysLabel.innerHTML = "(Two Days)"
    snoozeThreeDaysTitle.innerHTML = threeDays.toLocaleDateString('en-US', optionsNear);
    snoozeThreeDaysLabel.innerHTML = "(Three Days)";
    snoozeFiveDaysTitle.innerHTML = fiveDays.toLocaleDateString('en-US', optionsNear);
    snoozeFiveDaysLabel.innerHTML = "(Five Days)";
    snoozeSevenDaysTitle.innerHTML = sevenDays.toLocaleDateString('en-US', optionsFar);
    snoozeSevenDaysLabel.innerHTML = "(One Week)";
    snoozeTenDaysTitle.innerHTML = tenDays.toLocaleDateString('en-US', optionsFar);
    snoozeTenDaysLabel.innerHTML = "(Ten Days)";
    snoozeTwoWeeksTitle.innerHTML = twoWeeks.toLocaleDateString('en-US', optionsFar);
    snoozeTwoWeeksLabel.innerHTML = "(Two Weeks)";
  
    snoozeSelectorButton.classList.toggle("active");
    snoozeSelectorMenu.classList.toggle("active");
    event.stopPropagation();
  
  };
  snoozeOneDay.onclick = (event) => { snoozeTaskAndHighlightNextTask(_selectedTask, 1); };
  snoozeTwoDays.onclick = (event) => { snoozeTaskAndHighlightNextTask(_selectedTask, 2); };
  snoozeThreeDays.onclick = (event) => { snoozeTaskAndHighlightNextTask(_selectedTask, 3); };
  snoozeFiveDays.onclick = (event) => { snoozeTaskAndHighlightNextTask(_selectedTask, 5); };
  snoozeSevenDays.onclick = (event) => { snoozeTaskAndHighlightNextTask(_selectedTask, 7); };
  snoozeTenDays.onclick = (event) => { snoozeTaskAndHighlightNextTask(_selectedTask, 10); };
  snoozeTwoWeeks.onclick = (event) => { snoozeTaskAndHighlightNextTask(_selectedTask, 14); };

  // editable task title
  _editableTaskDetailsTitle.getEditableDiv().addEventListener('input', () => {
    const title = _editableTaskDetailsTitle.getText();
    // update the title in the task list
    const titleDiv = document.querySelector(`[data-id="${_selectedTask.id}"]`).getElementsByClassName("task-title")[0];
    titleDiv.innerHTML = title;
    _selectedTask.title = title;
    tasks.saveTasks();

    if (title.length === 0) {
      setNoTitle(titleDiv, true);
    } else {
      setNoTitle(titleDiv, false);
    }
  });

  // task notes
  _taskNotes.on('text-change', function(delta, oldDelta, source) {
    // note: delta is the formatted contents in Quill
  
    // update the notes indicator in the task list
    const div = document.querySelector(`[data-id="${_selectedTask.id}"]`); 
    const img = div.getElementsByClassName("icon-note")[0];
    const isEmpty = _taskNotes.getContents().ops.length === 1 && _taskNotes.getText().trim() === "";
    if (isEmpty) {
      img.setAttribute('src', '');
      _taskNotes.setText("");
      _selectedTask.notes = null;
    } else {
      img.setAttribute('src', '../images/note.svg');
      _selectedTask.notes = _taskNotes.getContents();
    }
  
    tasks.saveTasks();
  });

}

/****************************************************************************
 * Methods
 ****************************************************************************/
function closeAppMenu() {
  appEllipsis.classList.remove("active");
  appMenu.classList.remove("active");
}

function closeSnoozeSelectorMenu() {
  snoozeSelectorButton.classList.remove("active");
  snoozeSelectorMenu.classList.remove("active");
}

function selectTask(task) {

  if (task === null) {
    // Calling functions can send in a null value. In this case, all we want to do is deselect the current task
    deselectTask(_selectedTask);
    return;
  } else if (task !== _selectedTask) {
    deselectTask(_selectedTask);
  }

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

  // show hide the close sidebar icon
  if (settings.tasksSidebarVisibility === "always") {
    sidebarActionHide.classList.add("display-none");
    sidebarActionHideSeparator.classList.add("display-none");
  } else {
    sidebarActionHide.classList.remove("display-none");
    sidebarActionHideSeparator.classList.remove("display-none"); 
  }

  if (task.completed) {
    sidebarActionCircle.src = "../images/circle_checked.svg";
  } else {
    sidebarActionCircle.src = "../images/circle_empty.svg"; 
  }

  if (task.flagged) {
    sidebarActionFlag.src = "../images/flag_filled.svg";
  } else {
    sidebarActionFlag.src = "../images/flag_empty.svg";
  }

  if (task.pinned) {
    sidebarActionPin.src = "../images/pin_filled.svg";
  } else {
    sidebarActionPin.src = "../images/pin_empty.svg";
  }

  _editableTaskDetailsTitle.setText(task.title);

  if (task.notes !== null) {
    _taskNotes.setContents(task.notes);
  } else {
    _taskNotes.setText("");
  }

  taskDetails.classList.remove("display-none");

  if (sidebar.isShown()) {
    _taskNotes.focus();   // Set focus to the notes box
  } else {
    addTaskInputBox.blur(); // this effectively removes focus from any input element
  }
}

function deselectTask(task) {
  // there are situations where this function could be called with null (so we have to check)
  if (task === null && taskDetails !== null) {
    taskDetails.classList.add("display-none");
    return;
  }

  // remove highlights from any tasks
  const selectedTasks = document.getElementsByClassName("task-selected");
  for (let i = 0; i < selectedTasks.length; i++) {
    selectedTasks[i].classList.remove("task-selected");
  }

  // hide/remove task details (if showing)
  if (taskDetails !== null) {
    taskDetails.classList.add("display-none");
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
      if (settings.tasksSidebarVisibility === "dbl-click") {
        sidebar.hideSidebar();
      }
    }
  }

  tasks.deleteTask(task);
  renderTasks();
  selectTask(_selectedTask);

}

function snoozeTaskAndHighlightNextTask(task, numDays) {

  // if the user is snoozing the selected task, we want to automatically select the
  // next "most logical" task to in the list
  var nextTaskToHighlight = getNextTaskToHighlight(task);
  if (nextTaskToHighlight !== null) {
    _selectedTask = nextTaskToHighlight;
  } else {
    // there are no tasks left in the list
    _selectedTask = null;
    if (settings.tasksSidebarVisibility === "dbl-click") {
      sidebar.hideSidebar();
    }
  }

  tasks.snoozeTask(task, numDays);
  renderTasks();
  selectTask(_selectedTask);
}

function updateSnoozeIndicator() {
  const numSnoozedTasks = snoozed.getNumSnoozedTasks();
  if (numSnoozedTasks < 1) {
    snoozeIndicator.classList.add("display-none");
    addTaskInputBox.style.paddingRight = "60px";   // TODO: put this in css
  } else {
    snoozeIndicator.classList.remove("display-none");
    addTaskInputBox.style.paddingRight = "86px";   // TODO: put this in css
  }
}

function setAppMenuText() {
  let toggleCompletedMenuTitle;
  if (settings.showingCompleted) {
    toggleCompletedMenuTitle = "Hide Completed"
  } else {
    toggleCompletedMenuTitle = "Show Completed"
  }
  appMenuItemToggleCompleted.firstElementChild.innerHTML = toggleCompletedMenuTitle;
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

function setNoTitle(div, hasNoTitle) {
  if (hasNoTitle) {
    div.innerText = "No Title";
  }
  div.classList.toggle("noTitle", hasNoTitle);
}

export function updateTaskListWithSnoozedItems() {
  // export an function for the scheduler to call if snoozed tasks are available
  // and the task list needs to be updated.
  renderTasks();
}

function renderTasks() {

  updateSnoozeIndicator();

  var tasksToRender = null;

  // reset the pinned tasks container
  pinnedContainer.innerHTML = "";
  if (tasks.getNumPinnedTasks() > 0) {
    pinnedHeading.classList.remove("display-none");
    pinnedContainer.classList.remove("display-none");
  } else {
    pinnedHeading.classList.add("display-none");
    pinnedContainer.classList.add("display-none"); 
  }

  // reset the unpinned tasks container
  unpinnedContainer.innerHTML = "";
  if (tasks.getNumUnpinnedTasks() > 0) {
    unpinnedHeading.classList.remove("display-none");
    unpinnedContainer.classList.remove("display-none");
  } else {
    unpinnedHeading.classList.add("display-none");
    unpinnedContainer.classList.add("display-none"); 
  }

  // reset the completed tasks container
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
      // need to select the task on mouse down to make the drag and drop functionality work as expected
      let divType = event.target.dataset.type;
      // if statement will allow the event to fire when the taskDiv or titleDiv is selected
      // while preventing it from firing when any of the taskDiv children (e.g., the complete or
      // delete buttons) are clicked
      if (divType === "selectable") {
        selectTask(task);
      }
    });
    taskDiv.addEventListener("click", (event) => {
      // b/c the click happens after mousedown, we need to set focus to the taskNotes
      let divType = event.target.dataset.type;
      // if statement will allow the event to fire when the taskDiv or titleDiv is selected
      // while preventing it from firing when any of the taskDiv children (e.g., the complete or
      // delete buttons) are clicked
      if (divType === "selectable") {
        _taskNotes.focus();
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
            addTaskInputBox.focus();
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
    if (task.title.length === 0) {
      setNoTitle(title, true);
    }

    if (task.flagged === true) {
      title.classList.add("flagged");
    } else {
      title.classList.remove("flagged");
    }

    // Create the img element that will hold the note indicator
    const note = document.createElement("img");
    if (task.notes !== null) {
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
  addTaskInputBox.blur();
  _editableTaskDetailsTitle.blur();
  notesTextArea.blur();
}

/****************************************************************************
 * Page Initialization
 ****************************************************************************/
document.addEventListener("DOMContentLoaded", () => {

  // Due to importing this file into other js files, this event listener gets fired when the tasks page is not
  // loaded. This is a check (probably a hack) to prevent this from happening.
  if (!document.URL.endsWith("tasks.html")) return;

  _editableTaskDetailsTitle = new EditableDivWithPlaceholder('taskDetailsTitle', false);

  // TODO: Consider installing Quill via npm (rather than directly using it's .js and .css files)
  _taskNotes = new Quill('#notesTextArea', {
    placeholder: "Add notes here..."
  });
  _taskNotes.root.setAttribute('spellcheck', false);

  if (settings.tasksSidebarVisibility === "always") {
    sidebar.showSidebar();
  } else {
    sidebar.hideSidebar();
  }
  setAppMenuText();
  renderTasks();
  bindEvents();
  snoozed.scheduleUnsnoozeScheduler();

  // drag and drop
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