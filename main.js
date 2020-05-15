const AppWindow = require('./src/AppWindow')
const {app, Menu, ipcMain} = require('electron')
const isDev = require('electron-is-dev')
const path = require('path')
const menuTemplate = require('./src/menuTemplate')
const Store = require('electron-store')
const settingsStore = new Store({name: 'Settings'})

app.on('ready', function () {
  require('devtron').install()
  const urlLocation = isDev ? 'http://localhost:3000/' : './renderer/index.html'
  let mainWidow = new AppWindow({
    width: 800,
    height: 600,
  }, urlLocation)
  console.log('打开窗口======》名称：' + mainWidow.getTitle())
  // set up menu
  const menu = Menu.buildFromTemplate(menuTemplate)
  Menu.setApplicationMenu(menu)

  mainWidow.on('closed', () => {
    mainWidow = null
  })

  // hook up main events
  ipcMain.on('open-settings-window', () => {
    const settingsWindowConfig = {
      width: 500,
      height: 400,
      parent: mainWidow,
    }
    const settingsFileLocation = `file://${path.join(__dirname,
      './settings/settings.html')}`
    let settingWindow = new AppWindow(settingsWindowConfig,
      settingsFileLocation)
    settingWindow.removeMenu()
  })

  ipcMain.on('config-is-saved', () => {
    let cloudSyncMenu = process.platform === 'darwin'
      ? menu.items[3]
      : menu.items[2]

    const switchItems = (toggle) => {
      [1, 2, 3].forEach(number => {
        cloudSyncMenu.submenu.items[number].enabled = toggle
      })
    }
    let qiniuIsConfigured = ['accessKey', 'secretKey', 'bucketName'].every((key)=>{
      return !!settingsStore.get(key)
    })
    switchItems(qiniuIsConfigured)
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
