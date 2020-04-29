import { useEffect } from 'react'

const {remote} = window.require('electron')
const {Menu, MenuItem} = remote

const useContextMenu = (itemArr) => {
  useEffect(() => {
    const menu = new Menu()
    itemArr.forEach(item => {
      menu.append(new MenuItem(item))
    })

    const handleContextMenu = (e) => {
      menu.popup({window: remote.getCurrentWindow()})
    }
    window.addEventListener('contextmenu', handleContextMenu)
    return () => {
      window.removeEventListener('contextmenu', handleContextMenu)
    }
  }, [])
}

export default useContextMenu
