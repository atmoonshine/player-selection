const { app, BrowserWindow } = require('electron');
const path = require('path');
const url = require('url');
const { ipcMain } = require('electron');
const child = require('child_process').execFile;

let win;

function createWindow() {
    win = new BrowserWindow({
        width: 1920,
        height: 1080,
        webPreferences: {
            nodeIntegration: true
        }
    });

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

// on macOS, closing the window doesn't quit the app
app.on('window-all-closed', () => {
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
