import { createContext, useState, useEffect, useContext } from 'react';
import { useAuth } from '@/components/AuthContext';
import { speakText} from '@/components/utils/speech';


const ReminderContext = createContext();

export const ReminderProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [activeReminders, setActiveReminders] = useState([]);

  useEffect(() => {
    const fetchAndCheckReminders = async () => {
      if (!currentUser) return;
      
      try {
        const response = await fetch(`http://localhost:5000/api/appointments?userId=${currentUser.uid}`);
        if (!response.ok) return;
        
        const appointments = await response.json();
        const now = new Date();
        const today = now.toISOString().split('T')[0];
        
        const todayReminders = appointments.filter(appt => {
          const apptDate = new Date(`${appt.date}T${appt.startTime}`);
          return appt.date === today && apptDate > now;
        });
        
        setActiveReminders(todayReminders);
      } catch (error) {
        console.error('Failed to fetch reminders:', error);
      }
    };

    fetchAndCheckReminders();
    const interval = setInterval(fetchAndCheckReminders, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, [currentUser]);

  useEffect(() => {
    const checkAndTriggerReminders = () => {
      const now = new Date();
      
      activeReminders.forEach(reminder => {
        const reminderTime = new Date(`${reminder.date}T${reminder.startTime}`);
        const timeDiff = reminderTime - now;
        
        if (timeDiff > 0 && timeDiff <= 60000 && !reminder.notified) { // 1 minute before
          const message = `Reminder: Your appointment at ${reminder.location} starts in 1 minute!`;
          speak(message);
          
          // Update state to mark as notified
          setActiveReminders(prev => 
            prev.map(r => 
              r.id === reminder.id ? {...r, notified: true} : r
            )
          );
        }
      });
    };

    const interval = setInterval(checkAndTriggerReminders, 10000); // Check every 10 seconds
    return () => clearInterval(interval);
  }, [activeReminders]);

  return (
    <ReminderContext.Provider value={{ activeReminders }}>
      {children}
    </ReminderContext.Provider>
  );
};

export const useReminders = () => useContext(ReminderContext);