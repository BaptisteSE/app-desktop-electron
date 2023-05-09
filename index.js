const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const SessionModel = require('./SessionModel');
const SessionController = require('./SessionController');
const SessionView = require('./SessionView');
const path = require('path');

async function createWindow() {
  const model = new SessionModel();
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        preload: path.join(__dirname, 'preload.js'),
        enableRemoteModule: true, // activer la communication entre les processus
    },
  });
  const view = new SessionView(mainWindow.webContents);
  const controller = new SessionController(model, view);

  await controller.loadSessions();

  mainWindow.webContents.on('did-finish-load', async () => {
    await controller.loadSessions();
  });

  mainWindow.loadFile('index.html');
  mainWindow.webContents.openDevTools();

  const menu = Menu.buildFromTemplate([
    {
      label: 'Fichier',
      submenu: [
        {
          label: 'Exporter les parties du jour',
          click: () => {
            const fs = require('fs');
            const path = require('path');
            const sessions = controller.filterSessionsByToday();
            const outputFilePath = path.join(__dirname, 'sessions.txt');
            const outputData = sessions ? sessions.map(session => {
              return `Session ${session.id} - Date et heure : ${session.dateTime} - Salle : ${session.room.name} - Scénario : ${session.scenario.title}`;
            }).join('\n') : '';

            fs.writeFile(outputFilePath, outputData, err => {
              if (err) {
                console.error(err);
                return;
              }
              console.log(`Les données ont été exportées dans le fichier ${outputFilePath}`);
            });
          },
        },
        {
          label: 'Recharger',
          role: 'reload',
        },
        {
          label: 'Zoomer',
          role: 'zoomIn',
        },
        {
          label: 'Dézoomer',
          role: 'zoomOut',
        },
        {
          label: 'Aller sur l\'URL de l\'API',
          click: () => {
            require('electron').shell.openExternal('http://localhost:1337/api/sessions');
          },
        },
        {
          label: 'Quitter',
          role: 'quit',
        },
      ],
    },
  ]);

  Menu.setApplicationMenu(menu);
  
  // Gérer l'événement "stopSession" émis par SessionView
  ipcMain.on('stopSession', async (event, id) => {
    await controller.stopSession(id);
  });
}

app.whenReady().then(createWindow);
