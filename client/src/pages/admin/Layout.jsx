import React from 'react'
import AdminNavbar from '../../components/admin/AdminNavbar'
import AdminSidebar from '../../components/admin/AdminSidebar'
import { Outlet } from 'react-router-dom'

const Layout = () => {
  return (
    <>
      <AdminNavbar />
      <div >
        <AdminSidebar />
        <div className="flex-1 ml-64 pt-16">
          <Outlet />
        </div>
      </div>
    </>
  )
}

export default Layout
