import { app, BrowserWindow, ipcMain, globalShortcut, screen, nativeTheme } from 'electron';
import path from 'node:path';
import started from 'electron-squirrel-startup';
import schedule from 'node-schedule';
import { toggleComplete, deleteTask, createMenu, enableTaskMenu } from './components/application-menu.js';
import { Store } from './js/electron-store.js';
import { Utils } from './js/utils.js';

const store = new Store();
const utils = new Utils();

let mainWindow = null;

// setting the background color of the app helps keep background consistency when the window is launching
let bgColor = '#FFFFFF';
if (nativeTheme.shouldUseDarkColors) {
  bgColor = '#242424'
}

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

const createWindow = () => {

  const defaultWidth = 480;
  const defaultMinWidth = 480;
  const defaultMaxWidth = 480;
  var height = 800;
  const defaultMinHeight = 518;
  const defaultMaxHeight = 1200;

  const screenDimensions =  screen.getPrimaryDisplay().workAreaSize;
  const screenWidth = screenDimensions.width;
  const screenHeight = screenDimensions.height;
  let x = (screenWidth / 2) - (defaultWidth / 2);
  let y = (screenHeight / 2) - (height / 2);
  
  const windowBounds = store.get('windowBounds');
  if (windowBounds !== undefined) {
    // set the window position and height using the values on the last application exit
    height = windowBounds.height;

    // make sure the previous window position is inside the screen (this is important for users that use multiple monitors)
    const windowUpperLeft = [windowBounds.x, windowBounds.y];
    const screenRectangle = [[0, 0], [screenWidth-defaultWidth, screenHeight-height]]

    if (utils.isPointInRectangle(windowUpperLeft, screenRectangle)) {
      x = windowBounds.x;
      y = windowBounds.y;
    }

  }

  // Create the browser window.
  mainWindow = new BrowserWindow({
    backgroundColor: bgColor,

    width: defaultWidth,
    minWidth: defaultMinWidth,
    maxWidth: defaultMaxWidth,
    height: height,
    minHeight: defaultMinHeight,
    maxHeight: defaultMaxHeight,

    x: x,
    y: y,

    resizable: true,
    frame: false,

    nodeIntegration: false, // for additional security
    contextIsolation: false, // important for using IPC

    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      sandbox: false,
    },
  });

  // and load the index.html of the app.
  //mainWindow.loadFile(path.join(__dirname, './pages/tasks.html'));
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }
  //mainWindow.webContents.openDevTools();  // Open the DevTools.

  mainWindow.on('close', () => {
    store.set('windowBounds', mainWindow.getBounds());
  });

  mainWindow.on('focus', () => {
    mainWindow.webContents.send("unsnooze-tasks"); 
  });

  /*
  ipcMain.on('resize-window', (event, width, height) => {
    win.setSize(width, height);
  });
  */

  ipcMain.on('enable-task-menu', (event) => {
    enableTaskMenu(true);
  });

  ipcMain.on('disable-task-menu', (event) => {
    enableTaskMenu(false);
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
  
};

var job = null;
ipcMain.on("schedule-unsnooze", (event, spec) => {
  if (job !== null) job.cancel();   // prevents multiple jobs from being scheduled
  job = schedule.scheduleJob("unsnooze", spec, function() {
    mainWindow.webContents.send("unsnooze-tasks"); 
  });
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {

  createWindow();

  createMenu(mainWindow);
  
  // Register a global shortcuts
  globalShortcut.register('CommandOrControl+Shift+O', () => {
    toggleComplete(mainWindow);
  });
  globalShortcut.register('CommandOrControl+Backspace', () => {
    deleteTask(mainWindow);
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