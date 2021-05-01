const { app, BrowserWindow } = require('electron')
const path = require('path')

let mainWindow;

function createWindow() {

    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,

        // 1. Remove the frame of the window
        frame: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),

            // 2. Enable Node.js integration
            nodeIntegration: true
        }
    })

    mainWindow.loadFile('index.html')
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})