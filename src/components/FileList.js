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
import '../styles/FileList.scss'

const {Paragraph} = Typography

const FileList = ({files, onFileDelete, onSaveEdit, onAddFileButtonClick, onFileClick}) => {
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
    const newFile = files.find(item => item.isNew)
    if (newFile) {
      setEditFileId(newFile.id)
      setValue(newFile.title)
    }
  }, [files])

  const editFile = (id, initialValue) => {
    setEditFileId(id)
    setValue(initialValue)
  }

  const cancelEditFile = (id) => {
    const editItem = files.find(file => file.id === id)
    setEditFileId(null)
    setValue('')

    if (editItem.isNew) {
      onFileDelete(editItem.id)
    }
  }

  const saveEditFile = (id, savedValue) => {
    const editItem = files.find(file => file.id === id)
    if (savedValue.trim() !== '') {
      onSaveEdit(id, savedValue, editItem.isNew)
      setEditFileId(null)
      setValue('')
    }
  }

  const handleImportFileButtonClick = () => {
    console.log('import file')
  }

  return <List
    style={{borderTop: '1px solid #f0f0f0'}}
    dataSource={files}
    size='small'
    footer={<List.Item>
      <Button style={{width: '78px'}} size='small' type="primary"
              onClick={onAddFileButtonClick}>
        <PlusOutlined/> Add
      </Button>
      <Button size={'small'}
              onClick={() => handleImportFileButtonClick()}>
        <DownloadOutlined/> Import
      </Button>
    </List.Item>}
    renderItem={item => (
      <List.Item
        className={'file-item'}
        onClick={() => onFileClick(item.id)}
        style={{height: '40px'}}
        actions={
          (editFileId === item.id || item.isNew) ? [
            <Button
              className={'file-operator cancel'}
              style={{padding: 0}}
              type='link'
              key="file-edit-cancel"
              onClick={(e) => {
                e.stopPropagation()
                cancelEditFile(item.id)
              }}>
              <CloseOutlined/>
            </Button>,
            <Button
              className={'file-operator save'}
              style={{padding: 0}}
              type='link'
              key="file-edit-save"
              onClick={(e) => {
                e.stopPropagation()
                saveEditFile(item.id, value)
              }}>
              <CheckOutlined/>
            </Button>] : [
            <Button
              className={'file-operator edit'}
              style={{padding: 0}}
              type='link'
              key="file-edit"
              onClick={(e) => {
                e.stopPropagation()
                editFile(item.id, item.title)
              }}>
              <EditOutlined/>
            </Button>,
            <Button
              className={"file-operator delete"}
              style={{padding: 0}}
              type='link'
              key="file-delete"
              onClick={(e) => {
                e.stopPropagation()
                onFileDelete(item.id)
              }}>
              <DeleteOutlined/>
            </Button>]
        }
      >
        {
          (editFileId === item.id || item.isNew)
            ? <Input
              placeholder={'请输入文件名'}
              defaultValue={item.title}
              size='small'
              onClick={(e) => {e.stopPropagation()}}
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
