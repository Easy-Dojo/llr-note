const { app, Menu, ipcMain, dialog } = require('electron')
const uuidv4 = require('uuid/v4')
const isDev = require('electron-is-dev')
const { autoUpdater } = require('electron-updater')
const path = require('path')
const menuTemplate = require('./src/menuTemplate')
const Store = require('electron-store')
const AppWindow = require('./src/AppWindow')
const QiniuManager = require('./src/utils/QiniuManager')
const settingsStore = new Store({name: 'Settings'})
const fileStore = new Store({name: 'Files Data'})

const createCloudManager = () => {
  const accessKey = settingsStore.get('accessKey')
  const secretKey = settingsStore.get('secretKey')
  const bucketName = settingsStore.get('bucketName')
  return new QiniuManager(accessKey, secretKey, bucketName)
}

const getFileByKeyInFileObj = (filesObj, fileKey) => {
  const localFileId = Object.keys(filesObj).find(key => {
    return `${filesObj[key].title}.md` === fileKey
  })

  return localFileId && filesObj[localFileId]
}

app.on('ready', function () {
  autoUpdater.autoDownload = false
  autoUpdater.checkForUpdatesAndNotify()
  autoUpdater.on('error', (error) => {
    dialog.showErrorBox('Error: ', error == null ? "unknown" : (error.stack || error).toString())
  })
  autoUpdater.on('checking-for-update', () => {
    console.log('Checking for update...');
  })
  autoUpdater.on('update-available', () => {
    dialog.showMessageBox({
      type: 'info',
      title: '应用有新的版本',
      message: '发现新版本，是否现在更新?',
      buttons: ['是', '否']
    }, (buttonIndex) => {
      if (buttonIndex === 0) {
        autoUpdater.downloadUpdate()
      }
    })
  })
  autoUpdater.on('update-not-available', () => {
    dialog.showMessageBox({
      title: '没有新版本',
      message: '当前已经是最新版本'
    })
  })
  autoUpdater.on('download-progress', (progressObj) => {
    let log_message = "Download speed: " + progressObj.bytesPerSecond;
    log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
    log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
    console.log(log_message)
  })

  autoUpdater.on('update-downloaded', () => {
    dialog.showMessageBox({
      title: '安装更新',
      message: '更新下载完毕，应用将重启并进行安装'
    }, () => {
      setImmediate(() => autoUpdater.quitAndInstall())
    })
  })

  const mainWindowConfig = {
    width: 1024,
    height: 680
  }

  const urlLocation = isDev
    ? 'http://localhost:3000'
    : `file://${path.join(__dirname, './index.html')}`
  let mainWidow = new AppWindow(mainWindowConfig, urlLocation)

  mainWidow.on('closed', () => {
    mainWidow = null
  })

  // set up menu
  const menu = Menu.buildFromTemplate(menuTemplate)
  Menu.setApplicationMenu(menu)

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

  ipcMain.on('delete-file', (event, args) => {
    const manager = createCloudManager()
    manager.deleteFile(args).then(res => {
      console.log('删除成功')
      mainWidow.webContents.send('delete-file-success')
    }).catch(() => {
      dialog.showErrorBox('同步删除失败', '请检查云同步设置')
    })
  })

  ipcMain.on('rename-file', (event, args) => {
    const manager = createCloudManager()
    manager.renameFile(args.srcKey, args.destKey).then(res => {
      console.log('重命名成功')
      mainWidow.webContents.send('rename-file-success')
    }).catch(() => {
      dialog.showErrorBox('重命名云文件失败', '请检查云同步设置')
    })
  })

  ipcMain.on('download-file', (event, data) => {
    const manager = createCloudManager()
    const filesObj = fileStore.get('files')
    const {key, path, id} = data
    manager.getStat(data.key).then((resp) => {
      const serverUpdatedTime = Math.round(resp.putTime / 10000)
      const localUpdatedTime = filesObj[id].updatedAt
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
    const manager = createCloudManager()
    const filesObj = fileStore.get('files') || {}
    const uploadPromiseArr = Object.keys(filesObj).map(key => {
      const file = filesObj[key]
      return manager.uploadFile(`${file.title}.md`, file.path)
    })
    Promise.all(uploadPromiseArr).then(result => {
      // show uploaded message
      dialog.showMessageBox({
        type: 'info',
        title: `成功上传了${result.length}个文件`,
        message: `成功上传了${result.length}个文件`,
      })
      mainWidow.webContents.send('files-uploaded')
    }).catch(() => {
      dialog.showErrorBox('同步失败', '请检查云同步设置')
    }).finally(() => {
      mainWidow.webContents.send('loading-status', false)
    })
  })

  ipcMain.on('download-all-from-cloud', () => {
    mainWidow.webContents.send('loading-status', true)
    const manager = createCloudManager()
    const filesObj = fileStore.get('files') || {}
    const savedLocation = settingsStore.get('savedFileLocation') ||
      app.getPath('documents')

    manager.getFileInfoList()
    .then(({items})=> {
      const downloadPromiseArr = items
        .filter(item=>{
          let needDownLoad = true;
          const localFile = getFileByKeyInFileObj(filesObj, item.key)
          const serverFileUpdatedTime = Math.round(item.putTime / 10000)
          if(localFile && localFile.updatedAt > serverFileUpdatedTime){
            needDownLoad = false
          }
          return needDownLoad
        })
        .map(item=>{
          const localFile = getFileByKeyInFileObj(filesObj, item.key)
          let savedPath;
          if(localFile &&localFile.path){
            savedPath = localFile.path
          }else{
            savedPath = path.join(savedLocation, item.key)
          }
          return manager.downloadFile(item.key, savedPath)
        })
      return Promise.all(downloadPromiseArr)
    })
    .then(result=>{
      // show uploaded message
      dialog.showMessageBox({
        type: 'info',
        title: `成功下载了${result.length}个文件`,
        message: `成功下载了${result.length}个文件`,
      })
      const finalFilesObj = result.reduce((newFilesObj, qiniuFileName)=>{
        const localFile = getFileByKeyInFileObj(filesObj, qiniuFileName)
        if(localFile){
          const updatedItem = {
            ...localFile,
            isSynced: true,
            updatedAt: new Date().getTime()
          }
          return {...newFilesObj, [localFile.id]: updatedItem}
        }else {
          const newID = uuidv4()
          const newFile = {
            id: newID,
            title: qiniuFileName.substring(0, qiniuFileName.indexOf('.')),
            path: path.join(savedLocation, qiniuFileName),
            isSynced: true,
            updatedAt: new Date().getTime()
          }
          return {...newFilesObj, [newID]: newFile}
        }
      }, {...filesObj})
      mainWidow.webContents.send('files-downloaded', finalFilesObj)
    }).catch(() => {
      dialog.showErrorBox('同步失败', '请检查云同步设置')
    }).finally(() => {
      mainWidow.webContents.send('loading-status', false)
    })
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
