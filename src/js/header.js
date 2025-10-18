import * as app from './app.js';

appEllipsis.onclick = (event) => {
  //closeSnoozeSelectorMenu();
  appEllipsis.classList.toggle("active");
  appMenu.classList.toggle("active");
  event.stopPropagation();
};

export function closeAppMenu() {
  appEllipsis.classList.remove("active");
  appMenu.classList.remove("active");
}

appMenuItemTasks.onclick = (event) => { app.showTasks(); };
appMenuItemSnoozed.onclick = (event) => { app.showSnoozed(); };
appMenuItemTrash.onclick = (event) => { app.showTrash(); };
appMenuItemSettings.onclick = (event) => { app.showSettings(); };
