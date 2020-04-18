import React, { useState } from 'react'
import './App.css'
import { Input, Layout } from 'antd'
import FileList from './components/FileList'
import TabList from './components/TabList'
import SimpleMDEEditor from 'react-simplemde-editor'
import 'easymde/dist/easymde.min.css'

const {Content, Sider} = Layout
const {Search} = Input

const defaultFiles = [
  {id: 1, title: 'Tab 1 is a test ba ss ', body: '### Content of Tab Pane 1'},
  {id: 2, title: 'Tab 2', body: 'Content of Tab Pane 2'},
  {id: 3, title: 'Tab 3', body: 'Content of Tab Pane 3'},
]

function App () {
  const [files, setFiles] = useState(defaultFiles)
  const [activeFileID, setActiveFileID] = useState('')
  const [openedFileIDs, setOpenedFileIDs] = useState([])
  const [unsavedFileIDs, setUnsavedFileIDs] = useState([])

  const openedFiles = openedFileIDs.map(
    openedID => files.find(file => file.id === openedID))
  const activeFile = files.find(file => file.id === activeFileID)

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
          onSearch={value => console.log(value)}
          style={{width: 170, margin: '15px'}}
        />
        <FileList
          files={files}
          onFileClick={fileClick}
          onFileDelete={(id) => {console.log('delete file id:', id)}}
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
                unsavedIds={[unsavedFileIDs]}
                onTabClick={tabClick}
                onCloseTab={tabClose}
              />
              <SimpleMDEEditor
                key={activeFile && activeFile.id}
                value={activeFile && activeFile.body}
                onChange={(value) => {console.log(value)}}
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
