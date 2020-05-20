const AppWindow = require('./src/AppWindow')
const {app, Menu, ipcMain, dialog} = require('electron')
const isDev = require('electron-is-dev')
const path = require('path')
const menuTemplate = require('./src/menuTemplate')
const Store = require('electron-store')
const settingsStore = new Store({name: 'Settings'})
const fileStore = new Store({name: 'Files Data'})
const QiniuManager = require('./src/utils/QiniuManager')

const createCloudManager = () => {
  const accessKey = settingsStore.get('accessKey')
  const secretKey = settingsStore.get('secretKey')
  const bucketName = settingsStore.get('bucketName')
  return new QiniuManager(accessKey, secretKey, bucketName)
}

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

  ipcMain.on('upload-file', (event, args) => {
    const manager = createCloudManager()
    manager.uploadFile(args.key, args.path).then(res => {
      console.log('上传成功', res)
      mainWidow.webContents.send('active-file-uploaded')
    }).catch(() => {
      dialog.showErrorBox('同步失败', '请检查云同步设置')
    })
  })

  ipcMain.on('download-file', (event, data) => {
    const manager = createCloudManager()
    const filesObj = fileStore.get('files')
    const {key, path, id} = data
    manager.getStat(data.key).then((resp) => {
      const serverUpdatedTime = Math.round(resp.putTime / 10000)
      const localUpdatedTime = filesObj[id].updatedAt
      console.log(serverUpdatedTime)
      console.log(localUpdatedTime)
      if (serverUpdatedTime > localUpdatedTime || !localUpdatedTime) {
        console.log('new file downloaded')
        manager.downloadFile(key, path).then(() => {
          mainWidow.webContents.send('file-downloaded',
            {status: 'download-success', id})
        })
      } else {
        console.log('no new file')
        mainWidow.webContents.send('file-downloaded',
          {status: 'no-new-file', id})
      }
    }, (error) => {
      if (error.statusCode === 612) {
        mainWidow.webContents.send('file-downloaded', {status: 'no-file', id})
      }
    })
  })

  ipcMain.on('upload-all-to-cloud', () => {
    mainWidow.webContents.send('loading-status', true)
    setTimeout(() => {
      mainWidow.webContents.send('loading-status', false)
    }, 2000)
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
    let qiniuIsConfigured = ['accessKey', 'secretKey', 'bucketName'].every(
      (key) => {
        return !!settingsStore.get(key)
      })
    switchItems(qiniuIsConfigured)
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
