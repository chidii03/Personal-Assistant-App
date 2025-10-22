'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Home, User, Calendar, Bell, Mic, UserCircle, Menu, LogOut } from 'lucide-react';
import { FaWhatsapp, FaXTwitter, FaFacebook, FaInstagram, FaLinkedin } from 'react-icons/fa6';
import { useState } from 'react';
import { useAuth } from './AuthContext'; // Import the AuthContext

const icons = {
  Home: <Home className="w-5 h-5" />,
  Contacts: <User className="w-5 h-5" />,
  Appointments: <Calendar className="w-5 h-5" />,
  Reminders: <Bell className="w-5 h-5" />,
  'AI Assistant': <Mic className="w-5 h-5" />,
};

const Header = ({ onMenuToggle, pages, activePage, onPageChange }) => {
  // const [isSignInModalOpen, setIsSignInModalOpen] = useState(false); // REMOVE THIS STATE
  const { currentUser, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  // Function to handle page change clicks
  const handlePageClick = (pageName) => {
    // No modal opening logic here now.
    onPageChange(pageName);
  };

  return (
    <motion.header
      // Apply the gradient background to the header
      className="bg-gradient-to-br from-purple-900 via-black to-purple-800 text-white p-4 flex items-center justify-between shadow-lg z-10 w-full"
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 100 }}
    >
      <div className="flex items-center space-x-4">
        {/* Mobile Menu Button */}
        <button className="lg:hidden text-amber-400" onClick={onMenuToggle}>
          <Menu />
        </button>

        {/* Logo/Link */}
        <Link href="/" className="flex items-center" onClick={() => onPageChange('home')}>
          <motion.h1
            className="text-2xl font-extrabold text-amber-400"
            whileHover={{ scale: 1.05 }}
          >
            Personal Assistant
          </motion.h1>
        </Link>
      </div>

      {/* Desktop Navigation */}
      <nav className="hidden lg:flex items-center space-x-6">
        {pages.map((page) => (
          <motion.div
            key={page.page}
            whileHover={{ scale: 1.05, color: '#f59e0b' }}
            whileTap={{ scale: 0.95 }}
            className={`group flex items-center space-x-2 p-2 rounded-md cursor-pointer transition-colors relative ${
              activePage === page.page ? 'text-amber-400 font-bold' : 'text-white hover:text-amber-400'
            }`}
            onClick={() => handlePageClick(page.page)}
          >
            {icons[page.name]}
            <span>{page.name}</span>
            {/* Hover underline effect */}
            <motion.span
              className="absolute bottom-0 left-0 h-0.5 bg-amber-400 w-full origin-left"
              initial={{ scaleX: 0 }}
              animate={activePage === page.page ? { scaleX: 1 } : { scaleX: 0 }}
              transition={{ duration: 0.3 }}
              variants={{
                hover: { scaleX: 1 },
                rest: { scaleX: 0 }
              }}
              whileHover="hover"
              exit="rest"
            />
          </motion.div>
        ))}
      </nav>

      {/* Right-side elements */}
      <div className="flex items-center space-x-4">
        {/* Desktop Social Icons */}
        <div className="hidden md:flex items-center space-x-4 text-slate-300">
          <a href="https://facebook.com/profile.php?id=61566909757271" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-[#1877F2] transition-colors">
            <FaFacebook className="w-6 h-6" />
          </a>
          <a href="https://instagram.com/nexelitee" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-purple-600 transition-colors">
            <FaInstagram className="w-6 h-6" />
          </a>
          <a href="https://wa.me/08079379510" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-[#25D366] transition-colors">
            <FaWhatsapp className="w-6 h-6" />
          </a>
          <a href="https://www.linkedin.com/in/stephen-okwu-396914349/" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-[#005C8D] transition-colors">
            <FaLinkedin className="w-6 h-6" />
          </a>
          <a href="https://twitter.com/chidi_03" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors">
            <FaXTwitter className="w-6 h-6" />
          </a>
        </div>

        {/* Sign In/Sign Up/User Icon */}
        {currentUser ? (
          <motion.button
            onClick={handleLogout}
            className="bg-transparent hover:bg-slate-700 p-2 rounded-full transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title={`Logged in as ${currentUser.email}`}
          >
            <LogOut className="w-6 h-6 text-white" />
          </motion.button>
        ) : (
          <Link href="/login"> {/* Changed to Link to the new login page */}
            <motion.button
              className="bg-transparent hover:bg-slate-700 p-2 rounded-full transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Sign In / Sign Up"
            >
              <UserCircle className="w-6 h-6 text-white" />
            </motion.button>
          </Link>
        )}
      </div>

      {/* REMOVE THE SignInModal COMPONENT RENDER HERE */}
      {/* <SignInModal isOpen={isSignInModalOpen} onClose={() => setIsSignInModalOpen(false)} /> */}
    </motion.header>
  );
};

// Reusable Button component (kept here for consistency with the Header file's original structure)
const Button = ({ children, className, ...props }) => (
  <button
    className={`inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-9 px-4 py-2 shadow-lg ${className}`}
    {...props}
  >
    {children}
  </button>
);

export default Header;
