import React, { useEffect, useState } from 'react'
import { Button, Input, List, Tooltip, Typography } from 'antd'
import DeleteOutlined from '@ant-design/icons/lib/icons/DeleteOutlined'
import EditOutlined from '@ant-design/icons/lib/icons/EditOutlined'
import CloseOutlined from '@ant-design/icons/lib/icons/CloseOutlined'
import CheckOutlined from '@ant-design/icons/lib/icons/CheckOutlined'
import PlusOutlined from '@ant-design/icons/lib/icons/PlusOutlined'
import useKeyPress from '../hooks/useKeyPress'
import DownloadOutlined from '@ant-design/icons/lib/icons/DownloadOutlined'
import PropTypes from 'prop-types'

const {Paragraph} = Typography

const FileList = (props) => {
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

  const cancelEditFile = () => {
    setEditFileId(null)
    setValue('')
  }

  const saveEditFile = (id, savedValue) => {
    props.onSaveEdit(id, savedValue)
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
    style={{borderTop: '1px solid #f0f0f0'}}
    dataSource={props.files}
    size='small'
    footer={<List.Item>
      <Button style={{width: '78px'}} size='small' type="primary"
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
        onClick={() => props.onFileClick(item.id)}
        style={{height: '40px'}}
        actions={
          (editFileId !== item.id)
            ? [
              <Button style={{padding: 0}} type='link'
                      onClick={() => editFile(item.id, item.title)}
                      key="file-edit"><EditOutlined/></Button>,
              <Button style={{padding: 0}} type='link'
                      onClick={(e) => {
                        e.stopPropagation()
                        props.onFileDelete(item.id)
                      }}
                      key="file-delete"><DeleteOutlined/></Button>]
            : [
              <Button style={{padding: 0}} type='link'
                      onClick={() => cancelEditFile()}
                      key="file-edit-cancel"><CloseOutlined/></Button>,
              <Button style={{padding: 0}} type='link'
                      onClick={() => saveEditFile(item.id, value)}
                      key="file-edit-save"><CheckOutlined/></Button>]
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

FileList.propTypes = {
  files: PropTypes.array,
}

export default FileList
