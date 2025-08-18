import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { assets } from '../../assets/assets'

const AdminNavbar = () => {
    const [scrolled, setScrolled] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.scrollY
            if (scrollTop > 50) {
                setScrolled(true)
            } else {
                setScrolled(false)
            }
        }

        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])
    
    return (
        <div className={`
            fixed top-0 left-0 right-0 z-50 
            flex items-center justify-between px-6 md:px-10 h-16 
            transition-all duration-300 ease-in-out
            ${scrolled 
                ? 'bg-black/90 backdrop-blur-xl border-b border-gray-700/50 shadow-lg shadow-black/20' 
                : 'bg-transparent border-b border-gray-300/30'
            }
        `}>
            <Link to='/admin' className='flex items-center gap-3'>
                <img 
                    src={assets.logo} 
                    alt="QuickShow Logo" 
                    className='h-8 w-auto transition-transform duration-300 hover:scale-105'
                />
               
            </Link>

            {/* Optional: User info or additional controls */}
            <div className='flex items-center gap-4'>
                <div className={`
                    px-3 py-1 rounded-full text-sm font-medium transition-all duration-300
                    ${scrolled 
                        ? 'bg-primary/20 text-primary border border-primary/30' 
                        : 'bg-white/10 text-white border border-white/20'
                    }
                `}>
                    Admin Panel
                </div>
            </div>
        </div>
    )
}

export default AdminNavbar
