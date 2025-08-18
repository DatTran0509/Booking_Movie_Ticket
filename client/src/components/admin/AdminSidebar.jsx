import React from 'react'
import { assets } from '../../assets/assets'
import { LayoutDashboardIcon, ListCollapseIcon, ListIcon, PlusSquareIcon } from 'lucide-react'
import { NavLink } from 'react-router-dom'

const AdminSidebar = () => {
    const user = {
        firstName: 'Richard',
        lastName: 'Sanford',
        imageUrl: assets.profile,
    }
    
    const adminNavlinks = [
        { name: 'Dashboard', path: '/admin', icon: LayoutDashboardIcon },
        { name: 'Add Shows', path: '/admin/add-shows', icon: PlusSquareIcon },
        { name: 'List Shows', path: '/admin/list-shows', icon: ListIcon },
        { name: 'List Bookings', path: '/admin/list-bookings', icon: ListCollapseIcon },
    ]

    return (
        <div className='fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-gradient-to-b from-gray-900 to-black border-r border-gray-800 flex flex-col z-20'>
            {/* User Profile Section */}
            <div className='flex flex-col items-center pt-8 pb-6'>
                <div className='relative mb-4'>
                    <img 
                        src={user.imageUrl} 
                        alt="profile" 
                        className='w-20 h-20 rounded-full object-cover border-4 border-white/20 shadow-lg'
                    />
                    <div className='absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-3 border-gray-900'></div>
                </div>
                <p className='text-white font-semibold text-lg'>{user.firstName} {user.lastName}</p>
                <p className='text-gray-400 text-sm mt-1'>Administrator</p>
            </div>

            {/* Navigation Links */}
            <div className='flex-1 px-4'>
                {adminNavlinks.map((link, index) => (
                    <NavLink 
                        key={index} 
                        to={link.path}
                        end={link.path === '/admin'} // Thêm end prop cho dashboard route
                        className={({isActive}) => `
                            relative flex items-center gap-4 w-full py-4 px-6 mb-2
                            text-gray-300 hover:text-white rounded-xl transition-all duration-300
                            ${isActive 
                                ? 'bg-gradient-to-r from-primary/20 to-primary/5 text-primary border-l-4 border-primary shadow-lg shadow-primary/10' 
                                : 'hover:bg-white/5 hover:translate-x-1'
                            }
                        `}
                    >
                        {({isActive}) => (
                            <>
                                <link.icon 
                                    size={20} 
                                    className={`${isActive ? 'text-primary' : 'text-gray-400'} transition-colors duration-300`}
                                />
                                <p className={`font-medium ${isActive ? 'text-primary' : ''}`}>
                                    {link.name}
                                </p>
                                
                                {/* Active Indicator */}
                                {isActive && (
                                    <div className='absolute right-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-primary rounded-l-full'></div>
                                )}
                            </>
                        )}
                    </NavLink>
                ))}
            </div>

            {/* Footer */}
            <div className='p-4 border-t border-gray-800'>
                <div className='text-center'>
                    <p className='text-gray-500 text-xs'>© 2024 QuickShow Admin</p>
                </div>
            </div>
        </div>
    )
}

export default AdminSidebar
