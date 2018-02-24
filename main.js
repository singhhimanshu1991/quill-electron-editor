const electron = require('electron');

const app = electron.app
const BrowserWindow = electron.BrowserWindow

const path = require('path')
const url = require('url')
const fs = require('fs');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow() {
    mainWindow = new BrowserWindow({width: 1200, height: 700})
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
    }));

    const electronLocalShortcut = require('electron-localshortcut');
    const dialog = require('electron').dialog;
    var currentFile = null;

    electronLocalShortcut.register(mainWindow, 'Ctrl+F', function () {
        mainWindow.webContents.send('showFormula', 5);
    });

    electronLocalShortcut.register(mainWindow, 'Ctrl+S', function () {
        mainWindow.webContents.send('getContent', 5);
    });

    electronLocalShortcut.register(mainWindow, 'Ctrl+O', function () {
        openFile();
    });

    var ipc = require('electron').ipcMain;

    ipc.on('invokeAction', function (event, data) {
        console.log(data);
    });

    ipc.on('saveFile', function (event, data) {
        if(currentFile === null) {
            currentFile = dialog.showSaveDialog({});
        }
        try {
            fs.writeFileSync(currentFile, data, 'utf-8');
        } catch(e) {
            alert('Failed to save the file !');
        }
    });

    ipc.on('openFile', function(event, data) {
       openFile();
    });

    function openFile() {
        dialog.showOpenDialog(function(fileNames) {
            if (fileNames === undefined) return;
            currentFile = fileNames[0];
            fs.readFile(currentFile, 'utf-8', function (err, data) {
                mainWindow.webContents.send('setContent', data);
            });
        });
    }


    // Open the DevTools.
    // mainWindow.webContents.openDevTools()

    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null
    })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
});

app.on('activate', function () {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow()
    }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
