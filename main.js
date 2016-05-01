'use strict';

const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

let mainWindow;
app.on('window-all-closed', function() {
	if(process.platform != 'darwin') {
		app.quit();
	}
});

app.on('ready', function() {
	mainWindow = new BrowserWindow({width: 80*8, height: 48*15+25}); // +25 is the menu bar height. Not tested on other system than Linux-Chrome.
	mainWindow.loadURL('file://'+__dirname+'/index.html');
	// mainWindow.webContents.openDevTools();
	mainWindow.on('closed', function() {
		mainWindow = null;
	});
});
