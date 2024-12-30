const { contextBridge, ipcRenderer } = require('electron/renderer');
const { diffDays } = require("@formkit/tempo");

const api = {
  showSidebar: () => ipcRenderer.send('show-sidebar'),
  hideSidebar: () => ipcRenderer.send('hide-sidebar'),
  onToggleCompleted: (callback) => ipcRenderer.on('toggle-completed', callback), // for overriding the global command+o hotkey (see main.js and preload.js for more)
  scheduleUnsnooze: (spec) => ipcRenderer.send("schedule-unsnooze", { spec }),
  unsnoozeTasks: (callback) => ipcRenderer.on("unsnooze-tasks", callback),
};
contextBridge.exposeInMainWorld( 'electronAPI', api );


contextBridge.exposeInMainWorld('tempo', {
  diffDays: (dateA, dateB, roundingMethod) => diffDays(dateA, dateB, roundingMethod),
});