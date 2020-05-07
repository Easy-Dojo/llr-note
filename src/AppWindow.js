const {BrowserWindow} = require('electron')
const isDev = require('electron-is-dev')

class AppWindow extends BrowserWindow {
  constructor (config, urlLocation) {
    const basicConfig = {
      width: 800,
      height: 600,
      webPreferences: {
        nodeIntegration: true,
      },
      show: false,
      backgroundColor: '#efefef'
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

module.exports = AppWindow
