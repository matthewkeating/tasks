const { app, Menu, shell } = require('electron/main');

// Because the hot keys associated with toggle complete and delete task are
// global hot keys on Mac, they must be suppressed when a task is not selected.
// The functions below use the enabled (or disabled) menu items as a proxy
// for a task being selected.
function toggleComplete(mainWindow) {
  if (Menu.getApplicationMenu().getMenuItemById('task-toggle-complete').enabled) {
    mainWindow.webContents.send('toggle-completed');
  }
}
function deleteTask(mainWindow) {
  if (Menu.getApplicationMenu().getMenuItemById('task-delete-task').enabled) {
    mainWindow.webContents.send('delete-task');
  }
}

function createMenu(mainWindow) {

  const menuTemplate = [
    {
      label: app.getName(),
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        {
          label: 'Settings...',
          click: () => {
            mainWindow.webContents.send('open-settings');
          },
          accelerator: 'CmdOrCtrl+,',
        },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    },
    {
      label: 'File',
      submenu: [
        {
          label: 'New Task',
          click: () => {
            mainWindow.webContents.send('new-task');
          },
          accelerator: 'CmdOrCtrl+N',
        },
        { type: 'separator' },
        { role: 'close' }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectall' }
      ]
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Toggle Show Completed',
          click: () => {
            mainWindow.webContents.send('toggle-show-completed');
          },
          accelerator: 'CmdOrCtrl+Shift+C',
        },
        { type: 'separator' },
        {
          label: 'Snoozed...',
          click: () => {
            mainWindow.webContents.send('open-snoozed');
          },
          accelerator: 'CmdOrCtrl+Shift+S',
        },
        {
          label: 'Trash...',
          click: () => {
            mainWindow.webContents.send('open-trash');
          },
          accelerator: 'CmdOrCtrl+Shift+T',
        },
        { type: 'separator' },
        { role: 'reload' },
        {
          label: 'Toggle Developer Tools',
          accelerator: 'CmdOrCtrl+Option+I', // Optional shortcut
          click: () => {
              mainWindow.webContents.toggleDevTools();
          }
      },
      ]
    },
    {
      label: 'Task',
      submenu: [
        {
          id: 'task-toggle-complete',
          label: 'Toggle Completed',
          enabled: false,
          click: () => {
            toggleComplete();
          },
          accelerator: 'CmdOrCtrl+Shift+O',
        },
        {
          id: 'task-toggle-flag',
          label: 'Toggle Flag',
          enabled: false,
          click: () => {
            mainWindow.webContents.send('toggle-flag');
          },
          accelerator: 'CmdOrCtrl+Shift+F',
        },
        {
          id: 'task-toggle-pin',
          label: 'Toggle Pin',
          enabled: false,
          click: () => {
            mainWindow.webContents.send('toggle-pin');
          },
          accelerator: 'CmdOrCtrl+Shift+P',
        },
        { type: 'separator' },
        {
          id: 'task-next-task',
          label: 'Next Task',
          enabled: false,
          click: () => {
            mainWindow.webContents.send('next-task');
          },
          accelerator: 'CmdOrCtrl+Shift+]',
        },
        {
          id: 'task-previous-task',
          label: 'Previous Task',
          enabled: false,
          click: () => {
            mainWindow.webContents.send('pervious-task');
          },
          accelerator: 'CmdOrCtrl+Shift+[',
        },
        { type: 'separator' },
        {
          id: 'task-delete-task',
          label: 'Delete Task',
          enabled: false,
          click: () => {
            deleteTask();
          },
          accelerator: 'CmdOrCtrl+Backspace',
        }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'View Read Me (on GitHub)...',
          click: () => {
            shell.openExternal("https://github.com/matthewkeating/tasks");
          },
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);

}

function enableTaskMenu(enabled) {
  const ttc = Menu.getApplicationMenu().getMenuItemById('task-toggle-complete');
  const ttf = Menu.getApplicationMenu().getMenuItemById('task-toggle-flag');
  const ttp = Menu.getApplicationMenu().getMenuItemById('task-toggle-pin');
  const tnt = Menu.getApplicationMenu().getMenuItemById('task-next-task');
  const tpt = Menu.getApplicationMenu().getMenuItemById('task-previous-task');
  const tdt = Menu.getApplicationMenu().getMenuItemById('task-delete-task');
  
  ttc.enabled = enabled;
  ttf.enabled = enabled;
  ttp.enabled = enabled;
  tnt.enabled = enabled;
  tpt.enabled = enabled;
  tdt.enabled = enabled;
}

module.exports = { toggleComplete, deleteTask, createMenu, enableTaskMenu };
