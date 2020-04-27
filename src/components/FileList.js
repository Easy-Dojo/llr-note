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
    if (enterPress && value.trim() !== '' && editFileId !== null) {
      saveEditFile(editFileId, value)
    }

    if (escPress && editFileId !== null) {
      cancelEditFile(editFileId)
    }
  })

  useEffect(() => {
    const newFile = props.files.find(item => item.isNew)
    if (newFile) {
      setEditFileId(newFile.id)
      setValue(newFile.title)
    }
  }, [props.files])

  const editFile = (id, initialValue) => {
    setEditFileId(id)
    setValue(initialValue)
  }

  const cancelEditFile = (id) => {
    const editItem = props.files.find(file => file.id === id)
    setEditFileId(null)
    setValue('')

    if (editItem.isNew) {
      props.onFileDelete(editItem.id)
    }
  }

  const saveEditFile = (id, savedValue) => {
    if (savedValue.trim() !== '') {
      props.onSaveEdit(id, savedValue)
      setEditFileId(null)
      setValue('')
    }
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
              onClick={props.onAddFileButtonClick}>
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
          (editFileId === item.id || item.isNew) ? [
            <Button style={{padding: 0}} type='link'
                    onClick={() => cancelEditFile(item.id)}
                    key="file-edit-cancel"><CloseOutlined/></Button>,
            <Button style={{padding: 0}} type='link'
                    onClick={() => saveEditFile(item.id, value)}
                    key="file-edit-save"><CheckOutlined/></Button>] : [
            <Button style={{padding: 0}} type='link'
                    onClick={() => editFile(item.id, item.title)}
                    key="file-edit"><EditOutlined/></Button>,
            <Button style={{padding: 0}} type='link'
                    onClick={(e) => {
                      e.stopPropagation()
                      props.onFileDelete(item.id)
                    }}
                    key="file-delete"><DeleteOutlined/></Button>]
        }
      >
        {
          (editFileId === item.id || item.isNew)
            ? <Input
              placeholder={'请输入文件名'}
              defaultValue={item.title}
              size='small'
              onChange={(e) => {
                setValue(e.target.value)
              }}/>
            : <Tooltip placement="rightTop" title={item.title}>
              <Paragraph style={{margin: 0}} ellipsis>
                {item.title}
              </Paragraph>
            </Tooltip>
        }

      </List.Item>
    )}
  />
}

FileList.propTypes = {
  files: PropTypes.array,
}

export default FileList
