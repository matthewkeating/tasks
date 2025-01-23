const { app, BrowserWindow, Menu, ipcMain, globalShortcut, screen, shell, nativeTheme } = require('electron/main');
const { toggleComplete, deleteTask, createMenu, enableTaskMenu } = require('./components/application-menu.js');
const schedule = require('node-schedule');
const path = require('node:path');
const Store = require('./js/electron-store.js');
const store = new Store();
const Utils = require('./js/utils.js');
const utils = new Utils();

let mainWindow = null;

// setting the background color of the app helps keep background consistency when the window is launching
let bgColor = '#FFFFFF';
if (nativeTheme.shouldUseDarkColors) {
  bgColor = '#242424'
}

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = () => {

  // the app is designed be small and unobtrusive
  // set window size parameters to disallow users from making the window too big or too small
  const minimumWidth = 480;
  const maximumWidth = 780;
  const minimumHeight = 518;
  const maximumHeight = 1200;

  // gather information about the user's screen size
  const primaryScreen = screen.getPrimaryDisplay()
  const screenDimensions = primaryScreen.workAreaSize;
  const menuBarHeight = primaryScreen.bounds.height - primaryScreen.workArea.height;  // this code is specific to mac
  const screenWidth = screenDimensions.width;
  const screenHeight = screenDimensions.height;

  // set sensible defaults for window size and position
  var width = maximumWidth;
  var height = 800;
  let x = (screenWidth - width) / 2;
  let y = ((screenHeight - height) / 2) + menuBarHeight;
  
  // override defaults if the window has previously been positioned by the user
  const windowBounds = store.get('windowBounds');
  if (windowBounds !== undefined) {
    // set the window position and height using the values on the last application exit
    width = windowBounds.width;
    height = windowBounds.height;

    // make sure the previous window position is inside the screen (this is important for users that use multiple monitors)
    const windowUpperLeft = [windowBounds.x, windowBounds.y];
    const screenRectangle = [[0, 0], [screenWidth-width, screenHeight-height+menuBarHeight]]
    const isWindowPositionedInScreen = utils.isPointInRectangle(windowUpperLeft, screenRectangle);

    if (isWindowPositionedInScreen) {
      // move the window to its previous position
      x = windowBounds.x;
      y = windowBounds.y;
    } else {
      // center the window to the screen
      y = Math.round(((screenHeight - windowBounds.height) / 2) + menuBarHeight);
    }

  }

  // Create the browser window.
  mainWindow = new BrowserWindow({
    backgroundColor: bgColor,

    width: width,
    minWidth: minimumWidth,
    maxWidth: maximumWidth,
    height: height,
    minHeight: minimumHeight,
    maxHeight: maximumHeight,

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
  mainWindow.loadFile(path.join(__dirname, './pages/tasks.html'));

  mainWindow.on('close', () => {
    store.set('windowBounds', mainWindow.getBounds());
  });

  mainWindow.on('focus', () => {
    mainWindow.webContents.send("unsnooze-tasks"); 
  });

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
  
  var job = null;
  ipcMain.on("schedule-unsnooze", (event, spec) => {
    if (job !== null) job.cancel();   // prevents multiple jobs from being scheduled
    job = schedule.scheduleJob("unsnooze", spec, function() {
      mainWindow.webContents.send("unsnooze-tasks"); 
    });
  });

  ipcMain.on("open-link-externally", (event, url) => {
    shell.openExternal(url.url);
  });

};

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