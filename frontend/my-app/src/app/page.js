'use client';

import { useState, useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Import refactored components
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';
import { AuthProvider } from '@/components/AuthContext';
import { ReminderProvider } from '@/components/ReminderContext';

// Import refactored pages
import HomePage from './pages/HomePage';
import ContactsPage from './pages/ContactsPage';
import AppointmentsPage from './pages/AppointmentsPage';
import RemindersPage from './pages/RemindersPage';
import AIAssistantPage from './pages/AIAssistantPage';


// Main App component
const App = () => {
  const [activePage, setActivePage] = useState('home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(null); // Initialize as null to prevent hydration mismatch

  useEffect(() => {
    // Set current time only on the client side after hydration
    setCurrentTime(new Date());
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []); // Empty dependency array means this runs once on mount

  const pages = [
    { name: 'Home', page: 'home' },
    { name: 'Contacts', page: 'contacts' },
    { name: 'Appointments', page: 'appointments' },
    { name: 'Reminders', page: 'reminders' },
    { name: 'AI Assistant', page: 'ai-assistant' },
  ];

  return (
    // Wrap the entire app with AuthProvider
    <AuthProvider>
      <ReminderProvider>
      <div className="flex flex-col min-h-screen bg-slate-900 text-slate-100 font-sans">
        <ToastContainer position="bottom-right" theme="dark" />
        
        <Header 
          pages={pages}
          activePage={activePage}
          onPageChange={setActivePage}
          onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} // Toggle sidebar
        />

        <div className="flex flex-1 overflow-hidden">
          <Sidebar 
            pages={pages} 
            activePage={activePage} 
            onPageChange={setActivePage}
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
          />
          <main className="flex-1 p-4 md:p-8 overflow-y-auto w-full max-w-7xl mx-auto"> {/* Centered content */}
            {/* Render pages only when currentTime is available to avoid hydration errors */}
            {currentTime && activePage === 'home' && <HomePage currentTime={currentTime} />}
            {activePage === 'contacts' && <ContactsPage />}
            {activePage === 'appointments' && <AppointmentsPage />}
            {activePage === 'reminders' && <RemindersPage />}
            {activePage === 'ai-assistant' && <AIAssistantPage />}
          </main>
        </div>

        <Footer />
      </div>
       </ReminderProvider>
    </AuthProvider>
  );
};

export default App;
