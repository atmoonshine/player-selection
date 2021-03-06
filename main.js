const { app, BrowserWindow } = require('electron');
const path = require('path');
const url = require('url');
const { ipcMain } = require('electron');
const child = require('child_process').execFile;

const log = require('electron-log');
let ffi;
let LAM;

var isWin = process.platform === 'win32';

if (isWin) {
    ffi = require('ffi-napi');
}

let win;

function createWindow() {
    win = new BrowserWindow({
        width: 1920,
        height: 1080,
        webPreferences: {
            nodeIntegration: true
        }
    });
    win.setBackgroundColor('#000000');
    win.setMenuBarVisibility(false);

    ipcMain.on('launch', (_event, args) => {
        const [executablePath, ...parameters] = args.command.arguments;
        console.log('launching', executablePath, parameters);

        child(executablePath, parameters, function(err, data) {
            console.log(err);
            console.log(data.toString());
        });
    });

    ipcMain.on('log', (_event, ...messages) => {
        log.info('log: ', ...messages);
    });

    ipcMain.on('exit', (_event, args) => {
        process.exit(0);
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
    win.webContents.openDevTools();

    win.on('closed', () => {
        win = null;
    });

    // GameLobbyMediator integration
    if (isWin) {
        LAM = ffi.Library(__dirname + '\\lib\\GameLobbyMediator.dll', {
            LAM_Init: ['bool', ['string']],
            LAM_Finalize: ['void', []],
            LAM_StartToReassignController: ['void', []],
            LAM_ReassignControllerDone: ['void', []],
            LAM_RegisterControllerMapUpdateCB: ['void', ['pointer']]
        });

        const callback = ffi.Callback('void', ['string'], function(controllerMap) {
            log.info('controllerMap: ', controllerMap);
            win.webContents.send('UpdateControllerMap', controllerMap);
        });

        // Make an extra reference to the callback pointer to avoid GC
        process.on('exit', function() {
            callback; // extra reference
        });

        LAM.LAM_Init('LobbyApp');

        log.info('registering the callback');
        LAM.LAM_RegisterControllerMapUpdateCB(callback);
        log.info('done');

        ipcMain.on('StartToReassignController', () => {
            log.info('StartToReassignController');
            LAM.LAM_StartToReassignController();
        });

        ipcMain.on('CloseToReassignController', () => {
            log.info('CloseToReassignController');
            LAM.LAM_ReassignControllerDone();
        });

        let triggeredExit = false;
        ipcMain.on('CloseToReassignControllerAndExit', () => {
            log.info('CloseToReassignControllerAndExit');
            LAM.LAM_ReassignControllerDone();

            if (triggeredExit) {
                return;
            }

            triggeredExit = true;

            setTimeout(() => {
                process.exit(0);
            }, 2000);
        });
    }
}

app.on('ready', createWindow);

// on macOS, closing the window doesn't quit the app
app.on('window-all-closed', () => {
    if (isWin) {
        LAM.LAM_Finalize();
    }
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// initialize the app's main window
app.on('activate', () => {
    if (win === null) {
        createWindow();
    }
});
