const {remote} = require('electron')
const Store = require('electron-store')
const settingStore = new Store({name: 'Settings'})
const $ = (id) => {
  return document.getElementById(id)
}

document.addEventListener('DOMContentLoaded', () => {
  let savedFileLocation = settingStore.get('savedFileLocation')
  if(savedFileLocation) {
    $('saved-file-location').value = savedFileLocation
  }

  $('select-new-location').addEventListener('click', () => {
    remote.dialog.showOpenDialog({
      properties: ['openDirectory'],
      message: '选择文件的储蓄路径',
    }).then(({filePaths}) => {
      $('saved-file-location').value = filePaths[0]
      savedFileLocation = filePaths[0]
    })
  })

  $('settings-form').addEventListener('submit',()=>{
    settingStore.set('savedFileLocation', savedFileLocation)
    remote.getCurrentWindow().close()
  })
})
