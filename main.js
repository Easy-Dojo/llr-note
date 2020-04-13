const {app, BrowserWindow, ipcMain} = require('electron')
const isDev = require('electron-is-dev')

class AppWindow extends BrowserWindow {
  constructor (config, urlLocation) {
    const basicConfig = {
      width: 800,
      height: 600,
      webPreferences: {
        nodeIntegration: true,
      },
    }
    const finalConfig = {...basicConfig, ...config}
    super(finalConfig)
    if (isDev) {
      this.loadURL(urlLocation)
    } else {
      this.loadFile(urlLocation)
    }
    this.once('ready-to-show', () => {
      this.show()
    })
  }
}

function main () {
  require('devtron').install()
  const urlLocation = isDev ? 'http://localhost:3000/' : './renderer/index.html'
  const mainWidow = new AppWindow(null, urlLocation)
  mainWidow.webContents.openDevTools()

  ipcMain.on('message', ((event, message) => {
    console.log(message)
    event.reply('reply', 'reply from main process')
  }))
}

app.on('ready', main)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
