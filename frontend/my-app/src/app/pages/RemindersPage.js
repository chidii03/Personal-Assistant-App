'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, Calendar, Pin, Clock, AlertTriangle } from 'lucide-react'; // Added AlertTriangle for warning
import { toast } from 'react-toastify';
import { useAuth } from '@/components/AuthContext'; // Assuming AuthContext provides currentUser

const RemindersPage = () => {
  const { currentUser } = useAuth(); // Get the current authenticated user

  const [reminders, setReminders] = useState([]); // State to hold active reminders
  const [hasFetchedInitial, setHasFetchedInitial] = useState(false); // To prevent multiple initial toasts

  // Function to fetch reminders/appointments from the backend
  const fetchReminders = async () => {
    // If no user is logged in, use a default/anonymous ID.
    const userId = currentUser?.uid || 'anonymous';

    try {
      // Fetch appointments (which are used as reminders) from your backend
      const response = await fetch(`http://localhost:5000/api/appointments?userId=${userId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      const now = new Date();
      const todayDate = now.toISOString().split('T')[0];

      // Filter for appointments that are today and haven't ended yet
      const todayReminders = data.filter(appt => {
        const apptEndDateTime = new Date(`${appt.date}T${appt.endTime || appt.startTime}`);
        return appt.date === todayDate && apptEndDateTime > now;
      });

      setReminders(todayReminders);

      // Show initial toast if there are upcoming reminders for today
      if (!hasFetchedInitial && todayReminders.length > 0) {
        toast.dismiss(); // Clear any existing toasts
        toast.info(`You have ${todayReminders.length} upcoming appointment reminder${todayReminders.length > 1 ? 's' : ''} for today!`, { autoClose: 5000 });
        setHasFetchedInitial(true);
      }
    } catch (error) {
      console.error('Failed to fetch reminders:', error);
      toast.error('Failed to load reminders. Please ensure backend is running.');
    }
  };

  // Helper function for speech synthesis
  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US'; // Use American English for reminders
      window.speechSynthesis.speak(utterance);
    } else {
      console.warn('Speech synthesis not supported in this browser.');
    }
  };

  // Effect hook to fetch reminders on component mount and when user changes
  useEffect(() => {
    fetchReminders();
  }, [currentUser]); // Re-fetch if currentUser changes

  // Effect hook for real-time reminder notifications
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const nowTime = now.getTime();

      const updatedReminders = reminders.filter(reminder => {
        const startTime = new Date(`${reminder.date}T${reminder.startTime}`).getTime();
        const endTime = reminder.endTime ? new Date(`${reminder.date}T${reminder.endTime}`).getTime() : startTime;

        // Trigger reminder exactly at start time if not already notified
        if (nowTime >= startTime && nowTime < (startTime + 60 * 1000) && !reminder.notified) { // Trigger within the first minute
          toast.dismiss(); // Clear any existing toasts
          const message = `Reminder: Your appointment at ${reminder.location} starts now! It's from ${reminder.startTime} to ${reminder.endTime || 'an unspecified end time'}.`;
          toast.info(
            <div className="flex items-center gap-2">
              <AlertTriangle className="text-yellow-400" />
              <span>{message}</span>
            </div>,
            {
              autoClose: false, // Keep toast open until dismissed
              closeOnClick: false,
              toastId: `reminder-${reminder.id}`, // Unique ID to prevent duplicates
              onClose: () => {
                // Optionally remove from the list once dismissed or update status
                // This removes it from the UI after toast is closed, not just when time passes
                setReminders(prev => prev.filter(r => r.id !== reminder.id));
              }
            }
          );
          speakText(message);
          // Mark reminder as notified to prevent re-triggering for the same event
          // Create a new array with the updated reminder to trigger a re-render and keep state immutable
          setReminders(prev => prev.map(r => r.id === reminder.id ? { ...r, notified: true } : r));
        }

        // Keep the reminder in the list until its end time has passed
        return nowTime < endTime;
      });

      // Only update state if there are actual changes to avoid unnecessary re-renders
      if (updatedReminders.length !== reminders.length || updatedReminders.some((r, i) => r.notified !== reminders[i]?.notified)) {
        setReminders(updatedReminders);
      }
    }, 1000); // Check every second for precise timing

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, [reminders]); // Re-run effect when reminders list changes

  return (
    <motion.div
      id="reminders-section"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      // Apply full-width gradient and remove top-level padding
      className="w-full min-h-screen bg-gradient-to-br from-purple-900 via-black to-purple-800 text-white"
    >
      {/* Content wrapper for internal padding */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"> {/* Added py-8 for vertical padding */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-8">
          {/* Removed the extra bell from here */}
          <h2 className="text-4xl font-extrabold text-white mb-4 sm:mb-0">Reminders</h2>
          <motion.div
            className="flex items-center space-x-2 p-3 bg-slate-900 rounded-lg shadow-xl border border-purple-700"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 100 }}
          >
            <Bell className="w-7 h-7 text-amber-400" />
            <span className="text-2xl font-semibold text-white">
              {reminders.length} Reminder{reminders.length !== 1 && 's'} Today
            </span>
          </motion.div>
        </div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full"
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1
              }
            }
          }}
          initial="hidden"
          animate="show"
        >
          {reminders.length > 0 ? (
            reminders.map((reminder) => (
              <motion.div
                key={reminder.id} // Use unique ID as key for performance
                className="bg-slate-900 p-6 rounded-xl shadow-2xl border border-amber-500 hover:scale-105 transition-transform duration-300 transform perspective-1000 rotateX-3" // Added subtle 3D hover
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  show: { opacity: 1, y: 0 }
                }}
              >
                <div className="flex items-center space-x-4 mb-4">
                  <div className="p-3 bg-amber-600 rounded-full shadow-md">
                    <Calendar className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white tracking-wide">
                    Appointment
                  </h3>
                </div>
                <p className="text-purple-200 mb-3 flex items-center gap-3 text-lg">
                  <Clock className="w-5 h-5 text-purple-400" />
                  <span className="font-semibold">{reminder.startTime}{reminder.endTime ? ` - ${reminder.endTime}` : ''}</span>
                </p>
                <p className="text-purple-300 mb-3 flex items-center gap-3 text-md">
                  <Pin className="w-5 h-5 text-purple-400" />
                  Location: <span className="font-medium">{reminder.location}</span>
                </p>
                <p className="text-slate-400 text-sm italic">Date: {reminder.date}</p>
                <div className="flex items-center mt-5 text-amber-400">
                  <Bell className="w-5 h-5 mr-2" />
                  <span className="text-sm">Active Reminder</span>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full bg-slate-900 p-8 rounded-xl text-center text-slate-400 border border-purple-700 shadow-lg">
              <Bell className="w-16 h-16 mx-auto mb-6 text-slate-600" />
              <p className="text-xl font-medium">No upcoming appointments or reminders for today. Enjoy your day!</p>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default RemindersPage;
