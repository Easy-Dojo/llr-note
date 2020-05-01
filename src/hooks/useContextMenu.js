import { useEffect, useRef } from 'react'

const {remote} = window.require('electron')
const {Menu, MenuItem} = remote

const useContextMenu = (itemArr, targetSelector) => {
  const clickedElement = useRef(null)

  useEffect(() => {
    const menu = new Menu()
    itemArr.forEach(item => {
      menu.append(new MenuItem(item))
    })

    const handleContextMenu = (e) => {
      if(document.querySelector(targetSelector).contains(e.target)) {
        menu.popup({window: remote.getCurrentWindow()})
        clickedElement.current = e.target
      }
    }
    window.addEventListener('contextmenu', handleContextMenu)
    return () => {
      window.removeEventListener('contextmenu', handleContextMenu)
    }
  }, [])

  return clickedElement
}

export default useContextMenu
