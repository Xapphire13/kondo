import path from 'path';
import { app, BrowserWindow, Menu, ipcMain } from 'electron'; // eslint-disable-line
import { is } from 'electron-util';
import unhandled from 'electron-unhandled';
import debug from 'electron-debug';
import contextMenu from 'electron-context-menu';
import tempy from 'tempy';
import fs from 'fs';
import { promisify } from 'util';
import menu from './menu';
import test from './test';
// / const {autoUpdater} = require('electron-updater');

const writeFile = promisify(fs.writeFile);

unhandled();
debug({
  devToolsMode: 'previous'
});
contextMenu();

// Note: Must match `build.appId` in package.json
app.setAppUserModelId('com.xapphire13.kondo');

// Uncomment this before publishing your first version.
// It's commented out as it throws an error if there are no published versions.
// if (!is.development) {
//   const FOUR_HOURS = 1000 * 60 * 60 * 4;
//   setInterval(() => {
//     autoUpdater.checkForUpdates();
//   }, FOUR_HOURS);
//
//   autoUpdater.checkForUpdates();
// }

// Prevent window from being garbage collected
let mainWindow: BrowserWindow | undefined;

const createMainWindow = async () => {
  const win = new BrowserWindow({
    title: app.getName(),
    show: false,
    width: 600,
    height: 400,
    webPreferences: {
      nodeIntegration: true
    }
  });

  win.on('ready-to-show', () => {
    win.show();
  });

  win.on('closed', () => {
    // Dereference the window
    // For multiple windows store them in an array
    mainWindow = undefined;
  });

  await win.loadFile(path.join(__dirname, '../static/index.html'));

  return win;
};

// Prevent multiple instances of the app
if (!app.requestSingleInstanceLock()) {
  app.quit();
}

app.on('second-instance', () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) {
      mainWindow.restore();
    }

    mainWindow.show();
  }
});

app.on('window-all-closed', () => {
  if (!is.macos) {
    app.quit();
  }
});

app.on('activate', async () => {
  if (!mainWindow) {
    mainWindow = await createMainWindow();
  }
});

ipcMain.on('scan-disk', async (event: any) => {
  console.log('scanning!');
  const results = await test();
  const tmpPath = tempy.file();
  console.log(`writing to temp file: ${tmpPath}`);
  await writeFile(tmpPath, JSON.stringify(results));
  console.log('done');
  event.reply('scan-complete', tmpPath);
});

(async () => {
  await app.whenReady();
  Menu.setApplicationMenu(menu);
  mainWindow = await createMainWindow();

  // const start = Date.now();
  // console.log(await test());
  // const end = Date.now();

  // console.log(`Took: ${(end - start) / 1000} seconds`);
})();
