const { app, BrowserWindow, ipcMain, globalShortcut } = require('electron/main');
const path = require('node:path');

let mainWindow;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    backgroundColor: '#242424',
    width: 480,
    minWidth: 480,
    maxWidth: 480,
    height: 800,
    minHeight: 518,
    maxHeight: 1200,
    resizable: true,
    frame: false,
    nodeIntegration: false, // for additional security
    contextIsolation: false, // important for using IPC
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  ipcMain.on('show-sidebar', (event) => {
    mainWindow.setMinimumSize(780, 518);
    mainWindow.setMaximumSize(780, 1200);
    mainWindow.setSize(780, mainWindow.getSize()[1], true);
  });

  ipcMain.on('hide-sidebar', (event) => {
    mainWindow.setMinimumSize(480, 518);
    mainWindow.setMaximumSize(480, 1200);
    mainWindow.setSize(480, mainWindow.getSize()[1], true);
  });


  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, './pages/tasks.html'));

  ipcMain.on('resize-window', (event, width, height) => {
    win.setSize(width, height);
  });
  
  // Open the DevTools.
  //mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  // Register a global shortcuts
  globalShortcut.register('CommandOrControl+Shift+O', () => {
        mainWindow.webContents.send('toggle-completed');
  });

  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('will-quit', () => {
  // Unregister all shortcuts when quitting
  globalShortcut.unregisterAll();
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

