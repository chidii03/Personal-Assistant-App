import { motion, AnimatePresence } from 'framer-motion';
import { Home, User, Calendar, Bell, Mic, X } from 'lucide-react';
import { FaWhatsapp, FaXTwitter, FaFacebook, FaInstagram, FaLinkedin } from 'react-icons/fa6';

const icons = {
  Home: <Home className="w-5 h-5" />,
  Contacts: <User className="w-5 h-5" />,
  Appointments: <Calendar className="w-5 h-5" />,
  Reminders: <Bell className="w-5 h-5" />,
  'AI Assistant': <Mic className="w-5 h-5" />,
};

const Sidebar = ({ pages, activePage, onPageChange, isOpen, onClose }) => {
  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <motion.aside
        className={`fixed inset-y-0 left-0 z-50 w-64 shadow-xl p-4 transition-transform duration-300 ease-in-out transform bg-gradient-to-b from-purple-900 via-black to-purple-800 text-white flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:hidden lg:h-full`}
      >
        <div className="flex items-center justify-between mb-6 lg:mb-8">
          <h2 className="text-xl font-bold text-amber-400">Navigation</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-amber-400 lg:hidden"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="space-y-2 flex-grow">
          {pages.map((page) => (
            <motion.button
              key={page.page}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`flex items-center w-full gap-3 p-3 rounded-lg text-left ${
                activePage === page.page
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-slate-300 hover:bg-slate-700'
              }`}
              onClick={() => {
                onPageChange(page.page);
                onClose();
              }}
            >
              {icons[page.name]}
              <span>{page.name}</span>
            </motion.button>
          ))}
        </nav>

        {/* Social links section now at the bottom */}
        <div className="mt-auto pt-4 border-t border-gray-700">
          <div className="text-xs text-slate-400 mb-2 text-center">Connect with us</div>
          <div className="flex justify-center gap-4">
            <a
              href="https://www.facebook.com/profile.php?id=61566909757271"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-[#1877F2] transition-colors"
            >
              <FaFacebook className="w-6 h-6" />
            </a>
            <a
              href="https://instagram.com/nexelitee"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-purple-600 transition-colors"
            >
              <FaInstagram className="w-6 h-6" />
            </a>
            <a
              href="https://wa.me/08079379510"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-[#25D366] transition-colors"
            >
              <FaWhatsapp className="w-6 h-6" />
            </a>
            <a
              href="https://www.linkedin.com/in/stephen-okwu-396914349/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-[#005C8D] transition-colors"
            >
              <FaLinkedin className="w-6 h-6" />
            </a>
            <a
              href="https://twitter.com/chidi_03"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-white transition-colors"
            >
              <FaXTwitter className="w-6 h-6" />
            </a>
          </div>
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;