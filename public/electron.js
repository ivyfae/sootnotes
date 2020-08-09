const { app, BrowserWindow, Menu, dialog } = require('electron');
const path = require('path');
const os = require('os');
const fs = require('fs');
const childProcess = require('child_process');

let window;

function createMenu() {
  let menu = Menu.buildFromTemplate([
    {
      label: '&File',
      submenu: [
        {
          id: 'chooseOutputDirectory', label: 'Select Output Directory', click: () => {
            dialog.showOpenDialog({ properties: ['openDirectory'] }).then(openDialogReturnValue => {
              const paths = openDialogReturnValue.filePaths[0];
              if (paths) window.webContents.send('menu-outputDirectory', paths);
            });
          }
        },
        {
          id: 'showOutputDirectory', label: 'Show Output Directory', click: () => {
            // This is icky. Fix it
            if (process.env.APPDATA) {
              userPreferencesDir = process.env.APPDATA
            } else if (process.platform == 'darwin') {
              userPreferencesDir = process.env.HOME + '/Library/Preferences';
            } else {
              userPreferencesDir = process.env.HOME + '/.local/share';
            }

            let openDirCommand = 'open';
            if(process.platform === 'linux' && process.env.XDG_SESSION_TYPE) {
              openDirCommand = 'xdg-open'
            } else if(process.env.windir) {
              openDirCommand = 'explorer'
            }

            const filename = path.join(userPreferencesDir, 'SootNotes', 'sootnotes-preferences.json');
            const userPreferences = JSON.parse(fs.readFileSync(filename, 'utf-8'));
            const outputDir = userPreferences.outputDirectory || os.homedir();
            childProcess.exec(`${openDirCommand} "${outputDir}"`);
          }
        }
      ]
    },
    {
      label: '&Options',
      submenu: [
        {
          id: 'alwaysOnTop', accelerator: '&A', label: 'Always on Top', type: 'checkbox', checked: true, click: (menuItem) => {
            window.setAlwaysOnTop(menuItem.checked);
            window.webContents.send('menu-alwaysOnTop', menuItem.checked);
          }
        },
        {
          id: 'manuallyNameCaptures', accelerator: '&M', label: 'Manually Name Captures', type: 'checkbox', value: false, click: (menuItem) => {
            window.webContents.send('menu-manuallyNameCaptures', menuItem.checked);
          }
        }
      ]
    }
  ]);

  if (process.env.NODE_ENV === 'development') {
    // include default electron menu (dev tools, etc)
    const defaultMenu = Menu.getApplicationMenu();
    defaultMenu.items.forEach(i => menu.append(i));
  }
  return menu;
}

function createWindow() {
  const icon = {};
  if (process.env.NODE_ENV === 'development') {
    icon.icon = 'assets/icon.png';
  };

  window = new BrowserWindow(Object.assign({
    minWidth: 530,
    width: 530,
    minHeight: 300,
    height: 309,
    alwaysOnTop: true,
    darkTheme: true,
    backgroundColor: '#222',
    title: 'SootNotes',
    webPreferences: {
      nodeIntegration: true
    }
  }, icon));

  Menu.setApplicationMenu(createMenu());

  window.on('close', () => {
    console.log('electron close');
  });

  // In production mode, this can be added to enable dev tools
  // window.webContents.openDevTools();

  if (process.env.NODE_ENV === 'development') {
    window.loadURL(`http://localhost:3000`);
  } else {
    window.loadURL(path.join(__dirname, `index.html`));
  }
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
