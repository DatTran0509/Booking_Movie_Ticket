import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { assets } from '../assets/assets'
import { MenuIcon, SearchIcon, XIcon } from 'lucide-react'
import { useClerk, UserButton, useUser } from '@clerk/clerk-react'
import { TicketPlus } from 'lucide-react'
import { useAppContext } from '../context/AppContext'

const Navbar = () => {
  const {favoriteMovies} = useAppContext()

  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const location = useLocation()
  const { user } = useUser()
  const { openSignIn } = useClerk()
  const navigate = useNavigate()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setIsOpen(false)
  }, [location])

  return (
    <div className={`fixed top-0 left-0 z-50 w-full flex items-center justify-between px-6 md:px-16 lg:px-36 py-5 transition-all duration-500 ${isScrolled ? 'bg-black/90 backdrop-blur-xl shadow-2xl border-b border-white/10' : 'bg-transparent'
      }`}>
      <Link to='/' className='max-md:flex-1 group transition-transform duration-300 hover:scale-105'>
        <img src={assets.logo} className='w-36 h-auto transition-all duration-300 group-hover:brightness-110' alt="" />
      </Link>

      <div className={`max-md:absolute max-md:top-0 max-md:left-0 max-md:font-medium
      max-md:text-lg z-50 flex flex-col md:flex-row items-center
      max-md:justify-center gap-8 md:px-8 py-3 max-md:h-screen
      md:rounded-full backdrop-blur-xl bg-black/80 md:bg-white/10 md:border
      border-gray-300/20 md:shadow-xl overflow-hidden transition-all duration-500 ease-out ${isOpen ? 'max-md:w-full max-md:translate-x-0 max-md:opacity-100' : 'max-md:w-0 max-md:translate-x-full max-md:opacity-0'
        }`}>

        <button className='md:hidden absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300 group' onClick={() => setIsOpen(!isOpen)}>
          <XIcon className='w-6 h-6 cursor-pointer text-white group-hover:rotate-90 transition-transform duration-300' />
        </button>

        <Link
          onClick={() => { scrollTo(0, 0), setIsOpen(false) }}
          to='/'
          className={`relative font-medium transition-all duration-300 hover:text-primary hover:scale-110 group max-md:text-white md:text-white/90 ${location.pathname === '/' ? 'text-primary scale-110 font-semibold' : ''
            }`}
        >
          <span className='relative z-10'>Home</span>
          <span className={`absolute bottom-0 left-0 h-0.5 bg-primary transition-all duration-300 ${location.pathname === '/' ? 'w-full' : 'w-0 group-hover:w-full'
            }`} />
          <span className='absolute inset-0 rounded-lg bg-primary/10 scale-0 group-hover:scale-100 transition-transform duration-300 -z-10' />
        </Link>

        <Link
          onClick={() => { scrollTo(0, 0), setIsOpen(false) }}
          to='/movies'
          className={`relative font-medium transition-all duration-300 hover:text-primary hover:scale-110 group max-md:text-white md:text-white/90 ${location.pathname === '/movies' ? 'text-primary scale-110 font-semibold' : ''
            }`}
        >
          <span className='relative z-10'>Movies</span>
          <span className={`absolute bottom-0 left-0 h-0.5 bg-primary transition-all duration-300 ${location.pathname === '/movies' ? 'w-full' : 'w-0 group-hover:w-full'
            }`} />
          <span className='absolute inset-0 rounded-lg bg-primary/10 scale-0 group-hover:scale-100 transition-transform duration-300 -z-10' />
        </Link>

        <Link
          onClick={() => { scrollTo(0, 0), setIsOpen(false) }}
          to='/theaters'
          className={`relative font-medium transition-all duration-300 hover:text-primary hover:scale-110 group max-md:text-white md:text-white/90 ${location.pathname === '/theaters' ? 'text-primary scale-110 font-semibold' : ''
            }`}
        >
          <span className='relative z-10'>Theaters</span>
          <span className={`absolute bottom-0 left-0 h-0.5 bg-primary transition-all duration-300 ${location.pathname === '/theaters' ? 'w-full' : 'w-0 group-hover:w-full'
            }`} />
          <span className='absolute inset-0 rounded-lg bg-primary/10 scale-0 group-hover:scale-100 transition-transform duration-300 -z-10' />
        </Link>

        <Link
          onClick={() => { scrollTo(0, 0), setIsOpen(false) }}
          to='/releases'
          className={`relative font-medium transition-all duration-300 hover:text-primary hover:scale-110 group max-md:text-white md:text-white/90 ${location.pathname === '/releases' ? 'text-primary scale-110 font-semibold' : ''
            }`}
        >
          <span className='relative z-10'>Releases</span>
          <span className={`absolute bottom-0 left-0 h-0.5 bg-primary transition-all duration-300 ${location.pathname === '/releases' ? 'w-full' : 'w-0 group-hover:w-full'
            }`} />
          <span className='absolute inset-0 rounded-lg bg-primary/10 scale-0 group-hover:scale-100 transition-transform duration-300 -z-10' />
        </Link>

        <Link
          onClick={() => { scrollTo(0, 0), setIsOpen(false) }}
          to='/favorite'
          className={`relative font-medium transition-all duration-300 hover:text-primary hover:scale-110 group max-md:text-white md:text-white/90 ${location.pathname === '/favorite' ? 'text-primary scale-110 font-semibold' : ''
            }`}
        >
          <span className='relative z-10'>Favorites</span>
          <span className={`absolute bottom-0 left-0 h-0.5 bg-primary transition-all duration-300 ${location.pathname === '/favorite' ? 'w-full' : 'w-0 group-hover:w-full'
            }`} />
          <span className='absolute inset-0 rounded-lg bg-primary/10 scale-0 group-hover:scale-100 transition-transform duration-300 -z-10' />
        </Link>
      </div>

      <div className='flex items-center gap-8'>
        <button className='max-md:hidden p-2 rounded-full hover:bg-white/10 transition-all duration-300 group'>
          <SearchIcon className='w-6 h-6 cursor-pointer text-white/80 group-hover:text-white group-hover:scale-110 transition-all duration-300' />
        </button>

        {
          !user ?
            (<button onClick={openSignIn} className='px-4 py-1 sm:px-7 sm:py-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/80 hover:to-primary text-white font-medium cursor-pointer rounded-full shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/50 hover:scale-105 active:scale-95 transition-all duration-300 border border-primary/30 hover:border-primary/60 relative overflow-hidden group'>
              <span className='relative z-10'>Login</span>
              <span className='absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700' />
            </button>
            ) :
            (
              <UserButton>
                <UserButton.MenuItems>
                  <UserButton.Action label='My Bookings' labelIcon={<TicketPlus width={15}/>} onClick={() => navigate('/my-bookings')} />
                </UserButton.MenuItems>
              </UserButton>
            )

        }
      </div>

      <button className='max-md:ml-4 md:hidden p-2 rounded-full hover:bg-white/10 transition-all duration-300 group' onClick={() => setIsOpen(!isOpen)}>
        <MenuIcon className={`w-8 h-8 cursor-pointer text-white transition-all duration-300 ${isOpen ? 'rotate-90 scale-110' : 'group-hover:scale-110'
          }`} />
      </button>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className='md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40'
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}

export default Navbar
