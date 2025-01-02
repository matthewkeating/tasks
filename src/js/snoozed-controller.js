import * as app from './app.js';
import * as snoozed from './snoozed-model.js';

document.addEventListener("keydown", e => {
  if (e.key === "Escape") app.showTasks();
});

closePage.addEventListener("click", () => {
  app.showTasks();
});

function getWakUpDisplayDate(wakeUpDate) {

  let retVal;
  const currentDate = new Date();
  const diff = window.tempo.diffDays(wakeUpDate, currentDate);

  const optionsNear = { weekday: 'long' };
  const optionsFar = { day: 'numeric', month: 'short' };

  if (diff === 0) {
    retVal = "Tomorrow";
  } else if (diff <= 6) {
    const tmpDate = new Date();
    tmpDate.setDate(currentDate.getDate() + diff+1);
    retVal = tmpDate.toLocaleDateString('en-US', optionsNear);

  } else {
    const tmpDate = new Date(wakeUpDate);
    retVal = tmpDate.toLocaleDateString('en-US', optionsFar);
  }

  return retVal;
}

function renderSnoozedTasks() {

  const tasksToRender = snoozed.getTasks();
  
  // reset the snoozed tasks container
  if (tasksToRender.length === 0) {
    taskContainer.innerHTML = "<div class='empty'>Empty</div>";
  } else {
    taskContainer.innerHTML = "";
  }

  let previousWakeUpDate = null;
  tasksToRender.forEach(task => {

    // Create the div that will hold all the elements of the task
    const taskDiv = document.createElement("div");
    taskDiv.classList.add("task");
    taskDiv.dataset.id = task.id;

    const circle = document.createElement("img");
    circle.classList.add("icon-circle");
    circle.classList.add("icon-disabled");
    circle.src = "../images/circle_empty.svg";

    // Create the div for the task title 
    const titleDiv = document.createElement("div");
    titleDiv.classList.add("task-title");
    titleDiv.innerText = task.title;
    
    const note = document.createElement("img");
    if (task.notes !== null) {
      note.src = "../images/note.svg";
    }
    note.classList.add("icon-note");

    const unsnooze = document.createElement("div");
    unsnooze.classList.add("unsnooze");
    unsnooze.innerText = "Unsnooze";
    unsnooze.addEventListener("click", () => {
      snoozed.unsnoozeTask(task);
      renderSnoozedTasks();
    });

    const actionDiv = document.createElement("div");
    actionDiv.classList.add("vertical-container");
    actionDiv.appendChild(unsnooze);

    // Add all of the above task elements to the task div
    taskDiv.appendChild(circle);
    taskDiv.appendChild(titleDiv);
    taskDiv.appendChild(actionDiv);
    taskDiv.appendChild(note);

    const wakeUpDisplayDate = document.createElement("div");
    
    if (previousWakeUpDate === null) {
      wakeUpDisplayDate.innerText = getWakUpDisplayDate(task.wake_up_date);
      wakeUpDisplayDate.classList.add("heading");
    } else if (previousWakeUpDate != task.wake_up_date) {
      wakeUpDisplayDate.innerText = getWakUpDisplayDate(task.wake_up_date);
      wakeUpDisplayDate.classList.add("heading");
    }
    previousWakeUpDate = task.wake_up_date;
    
    taskContainer.appendChild(wakeUpDisplayDate);
    taskContainer.appendChild(taskDiv); 

  });

};

document.addEventListener("DOMContentLoaded", () => {
  window.electronAPI.hideSidebar();
  renderSnoozedTasks();
});