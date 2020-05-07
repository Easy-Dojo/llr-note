const AppWindow = require('./src/AppWindow')
const {app, Menu, ipcMain} = require('electron')
const isDev = require('electron-is-dev')
const path = require('path')
const menuTemplate = require('./src/menuTemplate')

app.on('ready', function () {
  require('devtron').install()
  const urlLocation = isDev ? 'http://localhost:3000/' : './renderer/index.html'
  let mainWidow = new AppWindow({
    width: 800,
    height: 600,
  }, urlLocation)
  console.log('打开窗口======》名称：' + mainWidow.getTitle())

  mainWidow.on('closed', () => {
    mainWidow = null
  })
  // hook up main events
  ipcMain.on('open-settings-window', ()=>{
    const settingsWindowConfig = {
      width: 500,
      height: 400,
      parent: mainWidow
    }
    const settingsFileLocation = `file://${path.join(__dirname, './settings/settings.html')}`
    let settingWindow = new AppWindow(settingsWindowConfig, settingsFileLocation)

  })

  // set up menu
  const menu = Menu.buildFromTemplate(menuTemplate)
  Menu.setApplicationMenu(menu)
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
