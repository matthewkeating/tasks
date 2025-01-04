const { contextBridge, ipcRenderer } = require('electron/renderer');
const { diffDays, isBefore } = require("@formkit/tempo");
//const { toggleCompleted } = require('./js/tasks-model');

const api = {

  // calls from menu
  openSettings: (callback) => ipcRenderer.on('open-settings', callback),
  newTask: (callback) => ipcRenderer.on('new-task', callback),
  toggleShowCompleted: (callback) => ipcRenderer.on('toggle-show-completed', callback), // for showing and hiding the completed tasks
  openSnoozed: (callback) => ipcRenderer.on('open-snoozed', callback),
  openTrash: (callback) => ipcRenderer.on('open-trash', callback),
  toggleCompleted: (callback) => ipcRenderer.on('toggle-completed', callback),
  toggleFlag: (callback) => ipcRenderer.on('toggle-flag', callback),
  togglePin: (callback) => ipcRenderer.on('toggle-pin', callback),
  selectNextTask: (callback) => ipcRenderer.on('next-task', callback),
  selectPreviousTask: (callback) => ipcRenderer.on('pervious-task', callback),
  deleteTask: (callback) => ipcRenderer.on('delete-task', callback),

  // calls to menu
  enableTaskMenu: () => ipcRenderer.send('enable-task-menu'),
  disableTaskMenu: () => ipcRenderer.send('disable-task-menu'),

  showSidebar: () => ipcRenderer.send('show-sidebar'),
  hideSidebar: () => ipcRenderer.send('hide-sidebar'),

  scheduleUnsnooze: (spec) => ipcRenderer.send("schedule-unsnooze", { spec }),
  unsnoozeTasks: (callback) => ipcRenderer.on("unsnooze-tasks", callback),
};
contextBridge.exposeInMainWorld( 'electronAPI', api );


contextBridge.exposeInMainWorld('tempo', {
  diffDays: (dateA, dateB, roundingMethod) => diffDays(dateA, dateB, roundingMethod),
  isBefore: (dateA, dateB) => isBefore(dateA, dateB),
});