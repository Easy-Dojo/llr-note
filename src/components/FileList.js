import React, { useState } from 'react'
import { Button, Input, List, Tooltip, Typography } from 'antd'
import DeleteOutlined from '@ant-design/icons/lib/icons/DeleteOutlined'
import EditOutlined from '@ant-design/icons/lib/icons/EditOutlined'
import CloseOutlined from '@ant-design/icons/lib/icons/CloseOutlined'
import CheckOutlined from '@ant-design/icons/lib/icons/CheckOutlined'
import PlusOutlined from '@ant-design/icons/lib/icons/PlusOutlined'

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

  const editFile = (id) => {
    setEditFileId(id)
  }

  const deleteFile = (id) => {
    console.log('delete:' + id)
  }

  const cancelEditFile = (id) => {
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

  return <List
    dataSource={data}
    size={'small'}
    footer={<List.Item>
      <Button size={'small'} block onClick={() => handleAddFileButtonClick()}><PlusOutlined/></Button>
    </List.Item>}
    renderItem={item => (
      <List.Item
        actions={
          (editFileId !== item.id)
            ? [
              <a onClick={() => editFile(item.id)}
                 key="file-edit"><EditOutlined/></a>,
              <a onClick={() => deleteFile(item.id)}
                 key="file-delete"><DeleteOutlined/></a>]
            : [
              <a onClick={() => cancelEditFile(item.id)}
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
