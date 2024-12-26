import * as app from './app.js';
import * as trash from './trash-model.js';
import * as settings from './settings-model.js';

document.addEventListener("keydown", e => {
  if (e.key === "Escape") app.showTasks();
});

closePage.addEventListener("click", () => {
  app.showTasks();
});

tasksArea.firstElementChild.innerText =
  "Last " + settings.numDeletedTasksToRetain + " Deleted Tasks";

const renderTasks = () => {

  const tasksToRender = trash.getTasks();
  
  // reset the deleted tasks container
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
    if (task.completed === true) {
      circle.src = "../images/circle_checked.svg";
    } else {
      circle.src = "../images/circle_empty.svg";
    }

    // Create the div for the task title 
    const titleDiv = document.createElement("div");
    titleDiv.classList.add("task-title");
    if (task.completed) {
      titleDiv.classList.add("task-title-completed");
    }
    titleDiv.innerText = task.title;
    
    const note = document.createElement("img");
    if (task.note.trim().length !== 0) {
      note.src = "../images/note.svg";
    }
    note.classList.add("icon-note");

    const restore = document.createElement("div");
    restore.classList.add("restore");
    restore.innerText = "Restore";
    restore.addEventListener("click", () => {
      trash.undeleteTask(task);
      renderTasks();
    });

    const deleteDiv = document.createElement("div");
    deleteDiv.classList.add("delete");
    deleteDiv.innerText = "Delete";
    deleteDiv.addEventListener("click", () => {
      var result = confirm("This action cannot be undone. Are you sure you want to permanently delete this task?");
      if (result) {
        trash.permanentlyDeleteTask(task);
        renderTasks();
      }
    });


    const actionDiv = document.createElement("div");
    actionDiv.classList.add("vertical-container");
    actionDiv.appendChild(restore);
    actionDiv.appendChild(deleteDiv);

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