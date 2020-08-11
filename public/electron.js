const { app, BrowserWindow, Menu, dialog, nativeImage } = require('electron');
const path = require('path');
const os = require('os');
const fs = require('fs');
const childProcess = require('child_process');
const openAboutWindow = require('about-window').default;

let window, about;

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
            if (process.platform === 'linux' && process.env.XDG_SESSION_TYPE) {
              openDirCommand = 'xdg-open'
            } else if (process.env.windir) {
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
    }, {
      label: '&About', click: () => {

        if (!about) {
          about = openAboutWindow({
            win_options: {
              alwaysOnTop: true,
              darkTheme: true,
            },
            homepage: 'https://homosexual.coffee?link=sootnotes',
            icon_path: path.join(path.dirname(require.main.filename), 'logo192.png'),
            product_name: 'SootNotes',
            description: 'Documentation aid to help you retrace your steps with screenshots, video, and markdown.\n🌈 ☕',
            package_json_dir: path.join(path.dirname(require.main.filename), '..'),
            copyright: 'Copyright © 2020 Ivy Fae<ivy@homosexual.coffee>',
            license: 'GPLv3',
            bug_report_url: 'https://github.com/ivyfae/sootnotes/issues'
          });
          about.on('close', () => {
            about = null;
          });
        }
      }
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
  if (process.platform === 'linux') {
    icon.icon = nativeImage.createFromPath('assets/icon.png');
  } else if (process.env.NODE_ENV === 'development') {
    icon.icon = 'assets/sootnotes.ico';
  }

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
    if(about) about.close();
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
