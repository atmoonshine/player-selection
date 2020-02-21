const { app, BrowserWindow } = require('electron');
const path = require('path');
const url = require('url');
const { ipcMain } = require('electron');
const child = require('child_process').execFile;
const log = require('electron-log');
const ffi = require('ffi-napi');

let LAM = null;
let win;

function createWindow() {
    win = new BrowserWindow({
        width: 1920,
        height: 1080,
        webPreferences: {
            nodeIntegration: true
        }
    });
    win.setMenuBarVisibility(false);

    ipcMain.on('launch', (_event, args) => {
        const [executablePath, ...parameters] = args.command.arguments;
        console.log('launching', executablePath, parameters);

        child(executablePath, parameters, function(err, data) {
            console.log(err);
            console.log(data.toString());
        });
    });

    ipcMain.on('change-players', (_event, args) => {
        const readyPlayers = args.filter(player => !!player.gamepad);
        console.log('change-players', readyPlayers);
    });

    // load the dist folder from Angular
    win.loadURL(
        url.format({
            pathname: path.join(__dirname, `/dist/ATGamesPicker/index.html`),
            // pathname: 'https://atmoonshine.github.io/player-selection/',
            protocol: 'file:',
            slashes: true
        })
    );

    win.setFullScreen(true);

    // The following is optional and will open the DevTools:
    // win.webContents.openDevTools()

    win.on('closed', () => {
        win = null;
    });
}

app.on('ready', createWindow);

//LAM = ffi.Library(__dirname + '\\..\\..\\lib\\GameLobbyMediator.dll', {
LAM = ffi.Library(__dirname + '\\lib\\GameLobbyMediator.dll', {
    LAM_Init: ['bool', ['string']],
    LAM_Finalize: ['void', []],
    LAM_StartToReassignController: ['void', []],
    LAM_ReassignControllerDone: ['void', []],
    LAM_RegisterControllerMapUpdateCB: ['void', ['pointer']]
});

var callback = ffi.Callback('void', ['string'], function(controllerMap) {
    log.info('controllerMap: ', controllerMap);
    mainWindow.webContents.send('UpdateControllerMap', controllerMap);
});

LAM.LAM_Init('LobbyApp');

log.info('registering the callback');
LAM.LAM_RegisterControllerMapUpdateCB(callback);
log.info('done');

process.on('exit', function() {
    callback;
});

log.info('end');

ipcMain.on('StartToReassignController', () => {
    LAM.LAM_StartToReassignController();
});

ipcMain.on('CloseToReassignController', () => {
    LAM.LAM_ReassignControllerDone();
});

// Quit when all windows are closed.
app.on('window-all-closed', function() {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    LAM.LAM_Finalize();
    if (process.platform !== 'darwin') app.quit();
});

// initialize the app's main window
app.on('activate', () => {
    if (win === null) {
        createWindow();
    }
});
