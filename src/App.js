import React, { useState } from 'react'
import { Input, Layout } from 'antd'
import FileList from './components/FileList'
import TabList from './components/TabList'
import { flattenArr, objToArr, timestampToString } from './utils/helper'
import SimpleMDEEditor from 'react-simplemde-editor'
import fileHelper from './utils/fileHelper'
import { v4 as uuidv4 } from 'uuid'
import './App.css'
import 'easymde/dist/easymde.min.css'
import { MDContentTemp } from './utils/constant'
import useIpcRenderer from './hooks/useIpcRenderer'

const {join, basename, extname, dirname} = window.require('path')
const {remote, ipcRenderer} = window.require('electron')
const Store = window.require('electron-store')

const {Content, Sider} = Layout
const {Search} = Input

//TODO 初次加载更新目录下被手动删除的文件
const fileStore = new Store({name: 'Files Data'})
const settingsStore = new Store({name: 'Settings'})
const getAutoSync = ()=>['accessKey', 'secretKey', 'bucketName', 'enableAutoSync'].every(
  key => !!settingsStore.get(key))

const saveFilesToStore = (files) => {
  const filesStoreObj = objToArr(files).reduce((result, file) => {
    const {id, path, title, createdAt, isSynced, updatedAt} = file
    result[id] = {id, path, title, createdAt, isSynced, updatedAt}
    return result
  }, {})
  fileStore.set('files', filesStoreObj)
}

function App () {
  const [files, setFiles] = useState(fileStore.get('files') || {})
  const [activeFileID, setActiveFileID] = useState('')
  const [openedFileIDs, setOpenedFileIDs] = useState([])
  const [unsavedFileIDs, setUnsavedFileIDs] = useState([])
  const [searchedFiles, setSearchedFiles] = useState([])
  const filesArry = objToArr(files)
  const savedLocation = settingsStore.get('savedFileLocation') || remote.app.getPath('documents')

  const activeFile = files[activeFileID]
  const openedFiles = openedFileIDs.map(openedID => files[openedID])
  const fileListArr = (searchedFiles.length > 0) ? searchedFiles : filesArry

  const fileClick = (fileID) => {
    const currentFile = files[fileID]
    if (!currentFile.isNew) {
      setActiveFileID(fileID)
      if (!currentFile.isLoaded) {
        fileHelper.readFile(currentFile.path).then(value => {
          const newFile = {...currentFile, body: value, isLoaded: true}
          setFiles({...files, [fileID]: newFile})
        })
      }
      setOpenedFileIDs(Array.from(new Set([...openedFileIDs, fileID])))
    }
  }

  const tabClick = (fileID) => {
    setActiveFileID(fileID)
  }

  const tabClose = (fileID) => {
    const filterIDs = openedFileIDs.filter(id => fileID !== id)
    setOpenedFileIDs(filterIDs)

    if (filterIDs.length > 0) {
      setActiveFileID(filterIDs[0])
    } else {
      setActiveFileID('')
    }
  }

  const fileChange = (id, value) => {
    if (value !== files[id].body) {
      const newFile = {...files[id], body: value}
      setFiles({...files, [id]: newFile})

      if (!unsavedFileIDs.includes(id)) {
        setUnsavedFileIDs([...unsavedFileIDs, id])
      }
    }
  }

  const deleteFile = (id) => {
    if (files[id].path) {
      fileHelper.deleteFile(files[id].path).then(() => {
        tabClose(id)
        const {[id]: value, ...afterDelete} = files
        setFiles(afterDelete)
        saveFilesToStore(afterDelete)
      })
    } else {
      tabClose(id)
      const {[id]: value, ...afterDelete} = files
      setFiles(afterDelete)
    }
  }

  const updateFileName = (id, title, isNew) => {
    const newPath = isNew
      ? join(savedLocation, `${title}.md`)
      : join(dirname(files[id].path), `${title}.md`)
    const modifiedFile = {...files[id], title, isNew: false, path: newPath}
    const newFiles = {...files, [id]: modifiedFile}

    if (isNew) {
      fileHelper.writeFile(newPath, files[id].body).then(() => {
        setFiles(newFiles)
        saveFilesToStore(newFiles)
      })
    } else {
      const oldPath = files[id].path
      fileHelper.renameFile(oldPath, newPath).then(() => {
        setFiles(newFiles)
        saveFilesToStore(newFiles)
      })
    }
  }

  const fileSearch = (event) => {
    const keyword = event.target.value
    const newFiles = filesArry.filter(file => file.title.includes(keyword))
    setSearchedFiles(newFiles)
  }

  // TODO： 相同文件名不能提交
  const createNewFile = (defaultContent) => {
    const newID = uuidv4()
    console.log('llll')
    console.log(defaultContent)
    const newFile = {
      id: newID,
      title: '',
      body: defaultContent,
      createdAt: new Date().getTime(),
      isNew: true,
    }
    setFiles({...files, [newID]: newFile})
  }

  const saveCurrentFile = () => {
    const {id, path, body, title} = activeFile
    fileHelper.writeFile(path, body).then(() => {
      setUnsavedFileIDs(unsavedFileIDs.filter(unsavedFileID => unsavedFileID !== id))
      if (getAutoSync()) {
        ipcRenderer.send('upload-file', {key: `${title}.md`, path})
      }
    })
  }

  const importFiles = () => {
    remote.dialog.showOpenDialog({
      title: '选择导入的Markdown文件',
      properties: ['openFile', 'multiSelections'],
      filters: [{name: 'Markdown Files', extensions: ['md']}],
    }).then(result => {
      const filteredPaths = result.filePaths.filter(path => {
        const alreadyAdded = Object.values(files)
          .find(file => file.path === path)
        return !alreadyAdded
      })

      const importedFilesArr = filteredPaths.map(path => ({
        id: uuidv4(),
        title: basename(path, extname(path)),
        path,
      }))

      const newFiles = {...files, ...flattenArr(importedFilesArr)}
      setFiles(newFiles)
      saveFilesToStore(newFiles)

      if (importedFilesArr.length > 0) {
        remote.dialog.showMessageBox({
          type: 'info',
          title: '导入成功',
          message: `成功导入了${importedFilesArr.length}个文件`,
        })
      }
    }).catch(err => {
      remote.dialog.showMessageBox({
        type: 'error',
        title: '导入失败',
        message: `成功导入文件失败`,
      })
    })
  }

  const activeFileUploaded = () => {
    const { id } = activeFile
    const modifiedFile = {...files[id], isSynced: true, updatedAt: new Date().getTime()}
    const newFiles = {...files, [id]: modifiedFile}
    setFiles(newFiles)
    saveFilesToStore(newFiles)
  }

  useIpcRenderer({
    'create-new-file': () => createNewFile(MDContentTemp.default),
    'import-file': importFiles,
    'save-edit-file': saveCurrentFile,
    'active-file-uploaded': activeFileUploaded
  })

  return (
    <Layout>
      <Sider
        style={{minHeight: '100vh', borderRight: '1px solid #f0f0f0'}}
        theme={'light'}
        breakpoint="md"
        collapsedWidth="0"
      >
        <Search
          size="small"
          placeholder="search..."
          onChange={fileSearch}
          style={{width: 170, margin: '15px'}}
        />
        <FileList
          files={fileListArr}
          onImportFiles={importFiles}
          onFileClick={fileClick}
          onFileDelete={deleteFile}
          onSaveEdit={updateFileName}
          onAddFileButtonClick={createNewFile}
        />
      </Sider>

      <Layout className="site-layout">
        <Content style={{
          minHeight: '500px',
          overflow: 'initial',
        }}>
          {
            !activeFile &&
            <div className="start-page">选择或者创建新的 Markdown 文档</div>
          }
          {
            activeFile &&
            <>
              <TabList
                files={openedFiles}
                activeId={activeFileID}
                unsavedIds={unsavedFileIDs}
                onTabClick={tabClick}
                onCloseTab={tabClose}
              />
              <SimpleMDEEditor
                key={activeFile && activeFile.id}
                value={activeFile && activeFile.body}
                onChange={(value) => {fileChange(activeFile.id, value)}}
                options={{
                  minHeight: '515px',
                }}
              />
              { activeFile.isSynced &&
              <span className="sync-status">已同步，上次同步{timestampToString(activeFile.updatedAt)}</span>
              }
            </>
          }
        </Content>
      </Layout>
    </Layout>
  )
}

export default App
