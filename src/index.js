const { app, BrowserWindow, ipcMain, globalShortcut, screen } = require('electron/main');
const Store = require('./js/electron-store');
const store = new Store();
const path = require('node:path');

let mainWindow = null;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = () => {

  const defaultWidth = 480;
  const defaultMinWidth = 480;
  const defaultMaxWidth = 480;
  var height = 800;
  const defaultMinHeight = 518;
  const defaultMaxHeight = 1200;
  let x = null;
  let y = null;

  const windowBounds = store.get('windowBounds');
  if (windowBounds === undefined) {
    // position the window in the center of the screen
    const screenDimensions =  screen.getPrimaryDisplay().workAreaSize;
    const screenHeight = screenDimensions.height;
    const screenWidth = screenDimensions.width;
    x = (screenWidth / 2) - (defaultWidth / 2);
    y = (screenHeight / 2) - (defaultHeight / 2);
  } else {
    // set the window position and height using the values on the last application exit
    height = windowBounds.height;
    x = windowBounds.x;
    y = windowBounds.y;
  }

  // Create the browser window.
  mainWindow = new BrowserWindow({
    backgroundColor: '#242424',

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

  mainWindow.on('close', () => {
    const windowBounds = mainWindow.getBounds();
  //  const windowPosition = {
  //    x: windowBounds.x,
  //    y: windowBounds.y
  //  };
    store.set('windowBounds', windowBounds);
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

