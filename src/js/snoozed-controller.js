import * as app from './app.js';
import * as snoozed from './snoozed-model.js';

document.addEventListener("keydown", e => {
  if (e.key === "Escape") app.showTasks();
});

closePage.addEventListener("click", () => {
  app.showTasks();
});

/*
document.getElementById("snoozedTasksArea").firstElementChild.innerText =
  "Last " + settings.numDeletedTasksToRetain + " Deleted Tasks";
*/

const renderTasks = () => {

  const tasksToRender = snoozed.getTasks();
  
  // reset the snoozed tasks container
  if (tasksToRender.length === 0) {
    taskContainer.innerHTML = "<div class='empty'>Empty</div>";
  } else {
    taskContainer.innerHTML = "";
  }

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
    if (task.note.trim().length !== 0) {
      note.src = "../images/note.svg";
    }
    note.classList.add("icon-note");

    const unsnooze = document.createElement("div");
    unsnooze.classList.add("unsnooze");
    unsnooze.innerText = "Unsnooze";
    unsnooze.addEventListener("click", () => {
      snoozed.unsnoozeTask(task);
      renderTasks();
    });

    const actionDiv = document.createElement("div");
    actionDiv.classList.add("vertical-container");
    actionDiv.appendChild(unsnooze);

    // Add all of the above task elements to the task div
    taskDiv.appendChild(circle);
    taskDiv.appendChild(titleDiv);
    taskDiv.appendChild(actionDiv);
    taskDiv.appendChild(note);

    taskContainer.appendChild(taskDiv); 

  });

};

window.electronAPI.hideSidebar();
renderTasks();