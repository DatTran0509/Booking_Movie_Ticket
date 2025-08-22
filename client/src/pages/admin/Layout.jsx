import React, { useEffect } from 'react'
import AdminNavbar from '../../components/admin/AdminNavbar'
import AdminSidebar from '../../components/admin/AdminSidebar'
import { Outlet } from 'react-router-dom'
import { useAppContext } from '../../context/AppContext'
import Loading from '../../components/Loading'
const Layout = () => {
  const {isAdmin, fetchIsAdmin } = useAppContext();

  useEffect(() => {
    fetchIsAdmin();
  },[]);

  return isAdmin ?(
    <>
      <AdminNavbar />
      <div >
        <AdminSidebar />
        <div className="flex-1 ml-64 pt-16">
          <Outlet />
        </div>
      </div>
    </>
  ) : <Loading />
}

export default Layout
