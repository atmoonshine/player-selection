const ffi = require('ffi-napi');
const LAM = ffi.Library(__dirname + '\\lib\\GameLobbyMediator.dll', {
    LAM_Init: ['bool', ['string']],
    LAM_Finalize: ['void', []],
    LAM_StartToReassignController: ['void', []],
    LAM_ReassignControllerDone: ['void', []],
    LAM_RegisterControllerMapUpdateCB: ['void', ['pointer']]
});

const callback = ffi.Callback('void', ['string'], function(controllerMap) {
    console.log('controllerMap: ', controllerMap);
    win.webContents.send('UpdateControllerMap', controllerMap);
});

LAM.LAM_Init('LobbyApp');

console.log('registering the callback');
LAM.LAM_RegisterControllerMapUpdateCB(callback);
console.log('done');
LAM.LAM_StartToReassignController();

process.on('beforeExit', code => {
    console.log('Process beforeExit event:', code);
    LAM.LAM_ReassignControllerDone();
    LAM.LAM_Finalize();
    console.log('clean exit');
});

// create an event so node doesn't exit
setTimeout(() => {}, Number.MAX_SAFE_INTEGER);
