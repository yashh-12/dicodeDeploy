import React from 'react'
import { NavLink, Outlet } from 'react-router-dom'
function Layout() {
  return (
    <div><Outlet/></div>
  )
}

export default Layout