import React from 'react'
import PropTypes from 'prop-types'
import { Menu } from 'antd'
import '../styles/TabList.scss'
import classNames from 'classnames'
import CloseCircleOutlined
  from '@ant-design/icons/lib/icons/CloseCircleOutlined'
import ExclamationCircleOutlined
  from '@ant-design/icons/lib/icons/ExclamationCircleOutlined'

const TabList = ({files, activeId, unsavedIds, onTabClick, onCloseTab}) => {
  return <Menu className="tab-list-component" style={{lineHeight: '36px'}}
               selectedKeys={[activeId.toString()]}
               mode="horizontal">
    {files.map(file => {
      const withUnsavedMark = unsavedIds.includes(file.id)
      return (
        <Menu.Item
          className={
            classNames('tab-item', {active: (activeId === file.id)})}
          key={file.id}
          onClick={() => {onTabClick(file.id)}}>
          <span style={{marginRight: '10px'}}>{file.title}</span>
          <span className="unsaved-icon">{withUnsavedMark &&
          <ExclamationCircleOutlined size='small'/>}</span>
          <span className="close-icon">{
            <CloseCircleOutlined size='small' onClick={(e) => {
              e.stopPropagation()
              onCloseTab(file.id)
            }}/>
          }</span>
        </Menu.Item>
      )
    })}
  </Menu>
}

TabList.propTypes = {
  files: PropTypes.array,
  activeId: PropTypes.string,
  unsavedIds: PropTypes.array,
  onTabClick: PropTypes.func,
  onCloseTab: PropTypes.func,
}

TabList.defaultProps = {
  unsavedIds: [],
}

export default TabList
