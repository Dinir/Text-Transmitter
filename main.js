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
	mainWindow = new BrowserWindow({
		width: 80*8,
		height: 24*15,
		userContentSize: true,
		title: "Text Transmitter",
		autoHideMenuBar: true,
		darkTheme: true,
		webPreferences: {
			defaultEncoding: "UTF-8",
			textAreasAreResizable: false,
			defaultFontFamily: {
				standard: "Noto Sans",
				serif: "Georgia",
				sansSerif: "Noto Sans"
			}
		}
	});
	mainWindow.loadURL('file://'+__dirname+'/index.html');
	// this line below opens dev tools. Feel free to comment it or not.
	mainWindow.webContents.openDevTools();
	mainWindow.on('closed', function() {
		mainWindow = null;
	});
});
