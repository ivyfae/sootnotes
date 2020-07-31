const { app, BrowserWindow, Menu, dialog } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');

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
        },
        // {
        //   id: 'optionsDivider', type: 'separator'
        // },
        // {
        //   id: 'revertAll', type: 'normal', label: 'Revert all settings to default', click: () => {
        //     window.webContents.send('menu-revertAll');
        //   }
        // }
      ]
    }
  ]);

  // uncomment to enable dev tools
  const defaultMenu = Menu.getApplicationMenu();
  defaultMenu.items.forEach(i => menu.append(i));
  return menu;
}

function createWindow() {
  window = new BrowserWindow({
    minWidth: 530,
    width: 530,
    minHeight: 300,
    height: 309,
    alwaysOnTop: true,
    darkTheme: true,
    backgroundColor: '#222',
    title: 'SootNotes',
    icon: 'assets/icon.png',
    webPreferences: {
      nodeIntegration: true
    }
  });

  Menu.setApplicationMenu(createMenu());


  window.on('close', () => {
    console.log('electron close');
  });

  //if (isDev) {
    window.loadURL(`http://localhost:3000`);
  //} else {
    //window.loadURL(path.join(__dirname, `index.html`));
    // window.webContents.openDevTools();
  //}
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