import React, { useState } from 'react'
import { Input, Layout } from 'antd'
import FileList from './components/FileList'
import TabList from './components/TabList'
import SimpleMDEEditor from 'react-simplemde-editor'
import { v4 as uuidv4 } from 'uuid';
import './App.css'
import 'easymde/dist/easymde.min.css'
import { flattenArr, objToArr } from './utils/helper'

const {Content, Sider} = Layout
const {Search} = Input

const defaultFiles = [
  {id: "1", title: 'Tab 1 is a test ba ss ', body: '### Content of Tab Pane 1'},
  {id: "2", title: 'Tab 2', body: 'Content of Tab Pane 2'},
  {id: "3", title: 'Tab 3', body: 'Content of Tab Pane 3'},
]

function App () {
  const [files, setFiles] = useState(flattenArr(defaultFiles))
  const [activeFileID, setActiveFileID] = useState('')
  const [openedFileIDs, setOpenedFileIDs] = useState([])
  const [unsavedFileIDs, setUnsavedFileIDs] = useState([])
  const [searchedFiles, setSearchedFiles] = useState([])
  const filesArry = objToArr(files)

  const activeFile = files[activeFileID]
  const openedFiles = openedFileIDs.map(openedID => files[openedID])
  const fileListArr = (searchedFiles.length > 0) ? searchedFiles : filesArry

  const fileClick = (fileID) => {
    setActiveFileID(fileID)
    setOpenedFileIDs(Array.from(new Set([...openedFileIDs, fileID])))
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
    const newFile = {...files[id], body: value}
    setFiles({...files, [id]: newFile})

    if (!unsavedFileIDs.includes(id)) {
      setUnsavedFileIDs([...unsavedFileIDs, id])
    }
  }

  const deleteFile = (id) => {
    delete files[id]
    setFiles(files)

    tabClose(id)
  }

  const updateFileName = (id, title) => {
    const modifiedFile = {...files[id], title, isNew: false}
    setFiles({...files, [id]: modifiedFile})
  }

  const fileSearch = (event) => {
    const keyword = event.target.value
    const newFiles = filesArry.filter(file => file.title.includes(keyword))
    setSearchedFiles(newFiles)
  }

  const createNewFile = () => {
    const newID = uuidv4()

    const newFile = {
      id: newID,
      title: '',
      body: '### temple',
      createdAt: new Date().getTime(),
      isNew: true
    }
    setFiles({...files, [newID]: newFile})
  }

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
            </>
          }
        </Content>
      </Layout>
    </Layout>
  )
}

export default App
