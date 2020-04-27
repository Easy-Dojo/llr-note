import React from 'react'
import PropTypes from 'prop-types'
import { Menu } from 'antd'
import CloseOutlined from '@ant-design/icons/lib/icons/CloseOutlined'
import MyIcon from './MyIcon'
import '../styles/TabList.scss'
import classNames from 'classnames'

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
          <MyIcon type="icon-circle"/>}</span>
          <span className="close-icon">{
            <CloseOutlined size='small' onClick={(e) => {
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
