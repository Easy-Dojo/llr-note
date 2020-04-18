import React from 'react'
import './App.css'
import { Input, Layout } from 'antd'
import FileList from './components/FileList'
import TabList from './components/TabList'

const {Content, Sider} = Layout
const {Search} = Input

const defaultFiles = [
  {id: 1, title: 'Tab 1', content: 'Content of Tab Pane 1'},
  {id: 2, title: 'Tab 2', content: 'Content of Tab Pane 2'},
  {id: 3, title: 'Tab 3', content: 'Content of Tab Pane 3'},
]

function App () {
  return (
    <Layout>
      <Sider
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
        <FileList/>
      </Sider>

      <Layout className="site-layout">
        <Content style={{
          minHeight: '500px',
          overflow: 'initial',
        }}>
          <TabList
            files={defaultFiles}
            onTabClick={(id) => {console.log('onTabClick', id)}}
            onCloseTab={(id) => {console.log('onCloseTab', id)}}
            unsavedIds={[1, 2]}
            activeId={'1'}
          />
        </Content>
      </Layout>
    </Layout>
  )
}

export default App
