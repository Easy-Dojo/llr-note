const {remote} = require('electron')
const Store = require('electron-store')
const settingsStore = new Store({name: 'Settings'})
const qiniuConfigArr = ['#savedFileLocation','#accessKey', '#secretKey', '#bucketName']

const $ = (selector) => {
  let result = document.querySelectorAll(selector)
  return result.length > 1 ? result : result[0]
}

document.addEventListener('DOMContentLoaded', () => {
  let savedFileLocation = settingsStore.get('savedFileLocation')
  if (savedFileLocation) {
    $('#savedFileLocation').value = savedFileLocation
  }

  qiniuConfigArr.forEach(selector => {
    const savedValue = settingsStore.get(selector.substr(1))
    if (savedValue) {
      $(selector).value = savedValue
    }
  })

  $('#select-new-location').addEventListener('click', () => {
    remote.dialog.showOpenDialog({
      properties: ['openDirectory'],
      message: '选择文件的储蓄路径',
    }).then(({filePaths}) => {
      $('#savedFileLocation').value = filePaths[0]
    })
  })

  $('#settings-form').addEventListener('submit', (e) => {
    e.preventDefault()
    qiniuConfigArr.forEach(selector=>{
      if ($(selector)) {
        let {id, value} = $(selector)
        settingsStore.set(id, value ? value : '')
      }
    })
    remote.getCurrentWindow().close()
  })

  $('.nav-tabs').addEventListener('click', (e) => {
    e.preventDefault()
    $('.nav-link').forEach(element=>{
      element.classList.remove('active')
    })
    e.target.classList.add('active')
    $('.config-area').forEach(element => {
      element.style.display = 'none'
    })
    $(e.target.dataset.tab).style.display = 'block'
  })
})
