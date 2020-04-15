import React, { useEffect, useState } from 'react'
import { Button, Input, List, Tooltip, Typography } from 'antd'
import DeleteOutlined from '@ant-design/icons/lib/icons/DeleteOutlined'
import EditOutlined from '@ant-design/icons/lib/icons/EditOutlined'
import CloseOutlined from '@ant-design/icons/lib/icons/CloseOutlined'
import CheckOutlined from '@ant-design/icons/lib/icons/CheckOutlined'
import PlusOutlined from '@ant-design/icons/lib/icons/PlusOutlined'
import useKeyPress from '../hooks/useKeyPress'
import DownloadOutlined from '@ant-design/icons/lib/icons/DownloadOutlined'

const {Paragraph} = Typography
const data = [
  {
    id: 1,
    title: 'Ant Design Title 1是生生世世',
    loading: false,
  },
  {
    id: 2,
    title: 'Ant Design Title 2',
    loading: true,
  },
]

const FileList = () => {
  const [editFileId, setEditFileId] = useState(null)
  const [value, setValue] = useState('')
  const enterPress = useKeyPress(13)
  const escPress = useKeyPress(27)

  useEffect(() => {
    if (enterPress && value !== '' && editFileId !== null) {
      saveEditFile(editFileId, value)
    }

    if (escPress && editFileId !== null) {
      cancelEditFile()
    }
  })

  const editFile = (id, initialValue) => {
    setEditFileId(id)
    setValue(initialValue)
  }

  const deleteFile = (id) => {
    console.log('delete:' + id)
  }

  const cancelEditFile = () => {
    setEditFileId(null)
    setValue('')
  }

  const saveEditFile = (id, savedValue) => {
    console.log(`saveEditFile, id: ${id}, savedValue: ${savedValue}`)
    setEditFileId(null)
    setValue('')
  }

  const handleAddFileButtonClick = () => {
    console.log('add new file')
  }

  const handleImportFileButtonClick = () => {
    console.log('import file')
  }

  return <List
    dataSource={data}
    size={'small'}
    footer={<List.Item>
      <Button style={{width: "78px"}} size={'small'} type="primary"
              onClick={() => handleAddFileButtonClick()}>
        <PlusOutlined/> Add
      </Button>
      <Button size={'small'}
              onClick={() => handleImportFileButtonClick()}>
        <DownloadOutlined/> Import
      </Button>
    </List.Item>}
    renderItem={item => (
      <List.Item
        actions={
          (editFileId !== item.id)
            ? [
              <a onClick={() => editFile(item.id, item.title)}
                 key="file-edit"><EditOutlined/></a>,
              <a onClick={() => deleteFile(item.id)}
                 key="file-delete"><DeleteOutlined/></a>]
            : [
              <a onClick={() => cancelEditFile()}
                 key="file-edit-cancel"><CloseOutlined/></a>,
              <a onClick={() => saveEditFile(item.id, value)}
                 key="file-edit-save"><CheckOutlined/></a>]
        }
      >
        {
          (editFileId !== item.id)
            ? <Tooltip placement="rightTop" title={item.title}>
              <Paragraph style={{margin: 0}}
                         ellipsis>
                {item.title}
              </Paragraph>
            </Tooltip>
            : <Input defaultValue={item.title} size='small'
                     onChange={(e) => {setValue(e.target.value)}}/>
        }

      </List.Item>
    )}
  />
}

export default FileList
