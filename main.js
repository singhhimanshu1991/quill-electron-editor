const electron = require('electron');
const {Menu} = require('electron');

const app = electron.app
const BrowserWindow = electron.BrowserWindow

const path = require('path')
const url = require('url')
const fs = require('fs');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow() {
    mainWindow = new BrowserWindow({width: 1260, height: 700})
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
    }));

    const electronLocalShortcut = require('electron-localshortcut');
    const dialog = require('electron').dialog;
    var currentFile = null;


    electronLocalShortcut.register(mainWindow, 'CmdOrCtrl+F', function () {
        mainWindow.webContents.send('showFormula', 5);
    });

    electronLocalShortcut.register(mainWindow, 'CmdOrCtrl+S', function () {
        mainWindow.webContents.send('getContent', false);
    });

    electronLocalShortcut.register(mainWindow, 'CmdOrCtrl+O', function () {
        openFile();
    });

    electronLocalShortcut.register(mainWindow, 'CmdOrCtrl+N', function () {
        mainWindow.webContents.send('getContent', true);
    });

    electronLocalShortcut.register(mainWindow, 'CmdOrCtrl+D', function () {
        mainWindow.webContents.openDevTools();
    });

    var ipc = require('electron').ipcMain;

    var contentChanged = false;
    ipc.on('contentChanged', function (event, data) {
        // console.log('content changed');
        contentChanged = true;
    });

    ipc.on('invokeAction', function (event, data) {
        console.log(data, true);
    });

    ipc.on('newFile', function(event, data) {
        // console.log('new file called');
        saveFile(data, true);
    });

    ipc.on('openFile', function(event, data) {
        openFile();
    });

    ipc.on('saveFile', function (event, data) {
        saveFile(data, false);
    });

    ipc.on('openMathHelp', function (event, data) {
        openMathHelpWindow();
    });

    ipc.on('openHelp', function (event, data) {
        openHelpWindow();
    });

    function saveFile(data, createNewFile = false) {
        if(contentChanged === false && createNewFile) {
            mainWindow.webContents.send('setTitle', 'Untitled');
            return;
        }
        if(currentFile === null) {
            currentFile = dialog.showSaveDialog({});
            if(!currentFile) {
                currentFile = null;
                return;
            }
        }
        try {
            fs.writeFileSync(currentFile, data, 'utf-8');
            var filenameInTitle = currentFile.substring(currentFile.lastIndexOf('/')+1);
            contentChanged = false;
            if(createNewFile) {
                filenameInTitle = 'Untitled';
                currentFile = null;
            }
            mainWindow.webContents.send('setTitle', filenameInTitle);
        } catch(e) {
            console.log('Failed to save the file !');
        }
    }

    function openFile() {
        dialog.showOpenDialog(function(fileNames) {
            if (fileNames === undefined) return;
            currentFile = fileNames[0];
            var filenameInTitle = currentFile.substring(currentFile.lastIndexOf('/')+1);
            mainWindow.webContents.send('setTitle', filenameInTitle);
            fs.readFile(currentFile, 'utf-8', function (err, data) {
                mainWindow.webContents.send('setContent', data);
            });
        });
    }

    var mathHelpWindow = null;

    function openMathHelpWindow() {
        if (mathHelpWindow) {
            mathHelpWindow.focus()
            return;
        }

        mathHelpWindow = new BrowserWindow({height: 700, width: 1260, title: "Math Help"});

        mathHelpWindow.loadURL(url.format({
            pathname: path.join(__dirname, 'help/Function Support in KaTeX.htm'),
            protocol: 'file:',
            slashes: true
        }));

        mathHelpWindow.on('closed', function () {
            mathHelpWindow = null;
        });
    }

    function openHelpWindow() {
        var helpWindow = new BrowserWindow({height: 400, width: 400, title: "Help", parent: mainWindow});
        helpWindow.setAlwaysOnTop(true);
        helpWindow.loadURL(url.format({
            pathname: path.join(__dirname, 'help/help.html'),
            protocol: 'file:',
            slashes: true
        }));

        helpWindow.on('closed', function () {
            helpWindow = null;
        });
    }

    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null
    })

    var template = [{
        label: "Application",
        submenu: [
            { label: "About Application", selector: "orderFrontStandardAboutPanel:" },
            { type: "separator" },
            { label: "Quit", accelerator: "Command+Q", click: function() { app.quit(); }}
        ]}, {
        label: "Edit",
        submenu: [
            { label: "Undo", accelerator: "CmdOrCtrl+Z", selector: "undo:" },
            { label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", selector: "redo:" },
            { type: "separator" },
            { label: "Cut", accelerator: "CmdOrCtrl+X", selector: "cut:" },
            { label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:" },
            { label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:" },
            { label: "Select All", accelerator: "CmdOrCtrl+A", selector: "selectAll:" }
        ]}
    ];

    Menu.setApplicationMenu(Menu.buildFromTemplate(template));
    // Menu.setApplicationMenu(Menu.buildFromTemplate(template));
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
