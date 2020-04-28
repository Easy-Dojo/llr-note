const fs = require('fs').promises

const fileHelper = {
  readFile: (path) => {
    return fs.readFile(path, {encoding: 'utf8'})
  },
  writeFile: (path, content) => {
    return fs.writeFile(path, content,{encoding: 'utf8'})
  },
  renameFile: (path, newPath) => {
    return fs.rename(path, newPath)
  },
  deleteFile: (path) => {
    return fs.unlink(path)
  },
}



