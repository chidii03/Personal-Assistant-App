'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { Calendar, Plus, Edit, Trash2, Search, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/components/AuthContext';
import Select from 'react-select'; // Import react-select
import Flag from 'react-world-flags'; //  Import react-world-flags
import locationsData from '@/data/locations'; // Import the new data file

// Reusable components (kept consistent)
const Button = ({ children, className, ...props }) => (
  <button
    className={`inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-9 px-4 py-2 bg-amber-500 text-white hover:bg-amber-600 shadow-lg ${className}`}
    {...props}
  >
    {children}
  </button>
);

const Input = ({ className, ...props }) => (
  <input
    className={`flex h-9 w-full rounded-md border border-input px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 bg-slate-700 text-white ${className}`}
    {...props}
  />
);

const Dialog = ({ children, open, onOpenChange }) => {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => onOpenChange(false)}
        >
          <motion.div
            className="bg-slate-800 text-white rounded-xl p-6 w-full max-w-md shadow-2xl border border-slate-700"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const DialogHeader = ({ children }) => <div className="flex flex-col space-y-1.5 text-center sm:text-left mb-4">{children}</div>;
const DialogTitle = ({ children }) => <h3 className="text-lg font-semibold leading-none tracking-tight text-amber-400">{children}</h3>;
const DialogDescription = ({ children }) => <p className="text-sm text-slate-400">{children}</p>;
const DialogContent = ({ children }) => <div className="py-4">{children}</div>;
const DialogFooter = ({ children }) => <div className="flex justify-end space-x-2">{children}</div>;


// ⭐ New custom component for the location dropdown
const LocationSelect = ({ value, onChange }) => {
  // Map locations data to react-select options format
  const options = locationsData.map(loc => ({
    value: loc.name,
    label: loc.name,
    code: loc.code.toLowerCase(),
  }));

  // Find the selected option object from the value
  const selectedOption = options.find(option => option.value === value);

  // Custom styling to match your app's theme
  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      backgroundColor: '#1e293b', // bg-slate-700
      borderColor: state.isFocused ? '#f59e0b' : '#334155', // focus: border-amber-500
      boxShadow: state.isFocused ? '0 0 0 1px #f59e0b' : 'none',
      color: 'white',
      '&:hover': {
        borderColor: '#f59e0b',
      },
    }),
    singleValue: (provided) => ({
      ...provided,
      color: 'white',
      display: 'flex',
      alignItems: 'center',
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isFocused ? '#334155' : 'transparent',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: '#1e293b',
      borderColor: '#334155',
    }),
    placeholder: (provided) => ({
      ...provided,
      color: '#94a3b8',
    }),
    //  Styles for the menu list (the dropdown items)
    menuList: (base) => ({
      ...base,
      //  Add a fixed max height and a scrollbar
      maxHeight: '200px', 
      overflowY: 'auto',
      //  Add webkit scrollbar styles
      '::-webkit-scrollbar': {
        width: '8px',
      },
      '::-webkit-scrollbar-track': {
        background: '#475569', // bg-slate-600
        borderRadius: '10px',
      },
      '::-webkit-scrollbar-thumb': {
        background: '#f59e0b', // bg-amber-500
        borderRadius: '10px',
      },
    }),
  };

  // Custom function to format the label of each option
  const formatOptionLabel = ({ code, label }) => (
    <div className="flex items-center space-x-2">
      {/* Conditionally render the flag if a code exists */}
      {code ? (
        <Flag 
          code={code} 
          // ⭐ Set a fixed small size for the flags
          width="20" // You can adjust this value
        />
      ) : (
        <Calendar className="w-4 h-4 text-slate-400" />
      )}
      <span>{label}</span>
    </div>
  );

  return (
    <Select
      value={selectedOption}
      onChange={option => onChange(option.value)}
      options={options}
      formatOptionLabel={formatOptionLabel}
      styles={customStyles}
      isSearchable={true}
      placeholder="Select an unspecified location..."
      classNamePrefix="react-select"
      required
    />
  );
};


const AppointmentsPage = () => {
  const { currentUser } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [form, setForm] = useState({ date: '', startTime: '', endTime: '', location: 'Unspecified Location' });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchAppointments();
  }, [currentUser]);

  const fetchAppointments = async () => {
    const userId = currentUser?.uid || 'anonymous';
    try {
      const response = await fetch(`http://localhost:5000/api/appointments?userId=${userId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setAppointments(data);
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
      toast.error('Failed to load appointments. Please ensure backend is running and database schema is correct.');
    }
  };

  const filteredAppointments = appointments.filter(appt =>
    Object.values(appt).some(value =>
      String(value).toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { date, startTime, endTime, location } = form;
    const userId = currentUser?.uid || 'anonymous';

    const now = new Date();
    const appointmentDate = new Date(date);
    const startDateTime = new Date(`${date}T${startTime}`);

    if (appointmentDate.toISOString().split('T')[0] < now.toISOString().split('T')[0]) {
      toast.error('Cannot save appointments for past dates. Please select a current or future date.');
      return;
    }

    if (appointmentDate.toISOString().split('T')[0] === now.toISOString().split('T')[0] && startDateTime < now) {
      toast.error('Cannot save appointments with a start time in the past for today. Please choose a future time.');
      return;
    }

    if (endTime) {
      const endDateTime = new Date(`${date}T${endTime}`);
      if (endDateTime <= startDateTime) {
        toast.error('End time must be after start time.');
        return;
      }
    }

    if (location === 'Unspecified Location') {
      toast.error('Please select a valid country for the appointment location.');
      return;
    }

    try {
      const appointmentData = {
        date,
        startTime,
        endTime,
        location,
        userId: userId,
      };

      let response;
      if (editingAppointment) {
        response = await fetch(`http://localhost:5000/api/appointments/${editingAppointment.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(appointmentData),
        });
      } else {
        response = await fetch('http://localhost:5000/api/appointments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(appointmentData),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const savedAppt = await response.json();
      setAppointments(prevAppointments =>
        editingAppointment
          ? prevAppointments.map(a => a.id === savedAppt.id ? savedAppt : a)
          : [...prevAppointments, savedAppt]
      );
      toast.success(`Appointment ${editingAppointment ? 'updated' : 'added'} successfully!`);
      setIsFormOpen(false);
      setEditingAppointment(null);
      setForm({ date: '', startTime: '', endTime: '', location: 'Unspecified Location' });
    } catch (error) {
      console.error('Failed to save appointment:', error.message);
      toast.error(`Failed to save appointment: ${error.message}. This could mean the appointment ID is invalid, or you don't have permission to modify it. Please ensure you're logged in with the correct user.`);
    }
  };

  const handleDelete = async (id) => {
    toast.info(
      <div className="flex flex-col items-center">
        <AlertTriangle className="w-8 h-8 text-yellow-400 mb-2" />
        <p className="text-white mb-4">Are you sure you want to delete this appointment?</p>
        <div className="flex gap-4">
          <Button
            onClick={async () => {
              const userId = currentUser?.uid || 'anonymous';
              try {
                const response = await fetch(`http://localhost:5000/api/appointments/${id}?userId=${userId}`, {
                  method: 'DELETE',
                });
                if (!response.ok) {
                  const errorData = await response.json();
                  throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
                }
                setAppointments(appointments.filter(a => a.id !== id));
                toast.dismiss(`confirm-delete-${id}`);
                toast.success('Appointment deleted successfully!');
              } catch (error) {
                console.error('Failed to delete appointment:', error.message);
                toast.dismiss(`confirm-delete-${id}`);
                toast.error(`Failed to delete appointment: ${error.message}. This could mean the appointment ID is invalid, or you don't have permission to delete it. Please ensure you're logged in with the correct user.`);
              }
            }}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Delete
          </Button>
          <Button onClick={() => toast.dismiss(`confirm-delete-${id}`)} className="bg-gray-500 hover:bg-gray-600">
            Cancel
          </Button>
        </div>
      </div>,
      {
        autoClose: false,
        closeButton: false,
        closeOnClick: false,
        draggable: false,
        toastId: `confirm-delete-${id}`
      }
    );
  };

  const handleEdit = (appointment) => {
    setForm({
      date: appointment.date,
      startTime: appointment.startTime || '',
      endTime: appointment.endTime || '',
      location: appointment.location,
    });
    setEditingAppointment(appointment);
    setIsFormOpen(true);
  };

  return (
    <motion.div
      id="appointments-section"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full min-h-screen bg-gradient-to-br from-purple-900 via-black to-purple-800 text-white"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-white mb-4 sm:mb-0 mr-4">Appointments</h2>
          <Button onClick={() => {
            setIsFormOpen(true);
            setEditingAppointment(null);
            setForm({ date: '', startTime: '', endTime: '', location: 'Unspecified Location' });
          }} className="bg-amber-500 hover:bg-amber-600 px-3 py-2 text-sm sm:px-4 sm:py-2">
            <Plus className="w-4 h-4 mr-2" /> Add New Appointment
          </Button>
        </div>

        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogHeader>
            <DialogTitle>{editingAppointment ? 'Edit Appointment' : 'Add New Appointment'}</DialogTitle>
            <DialogDescription>
              {editingAppointment ? 'Update the details for this appointment.' : 'Fill in the details to add a new appointment.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <DialogContent>
              <div className="grid gap-4 py-4">
                <Input
                  type="date"
                  placeholder="Date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  required
                />
                <Input
                  type="time"
                  placeholder="Start Time"
                  value={form.startTime}
                  onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                  required
                />
                <Input
                  type="time"
                  placeholder="End Time (Optional)"
                  value={form.endTime}
                  onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                />
                {/* ⭐ Use the new custom component here */}
                <LocationSelect
                  value={form.location}
                  onChange={(newLocation) => setForm({ ...form, location: newLocation })}
                />
              </div>
            </DialogContent>
            <DialogFooter>
              <Button type="submit">{editingAppointment ? 'Save Changes' : 'Add Appointment'}</Button>
            </DialogFooter>
          </form>
        </Dialog>

        <div className="relative mb-6 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Search appointments..."
            className="pl-10 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="rounded-lg border overflow-x-auto border-slate-700 shadow-xl w-full">
          <table className="w-full text-left table-auto min-w-[700px]">
            <thead className="bg-slate-800">
              <tr>
                <th className="p-4 font-bold text-slate-300 text-center">ID</th>
                <th className="p-4 font-bold text-slate-300 text-center">Date</th>
                <th className="p-4 font-bold text-slate-300 text-center">Time</th>
                <th className="p-4 font-bold text-slate-300 text-center">Location</th>
                <th className="p-4 font-bold text-slate-300 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {filteredAppointments.length > 0 ? (
                filteredAppointments.map((appointment, index) => (
                  <motion.tr
                    key={appointment.id}
                    className="bg-slate-900 even:bg-slate-800 hover:bg-slate-700 transition-colors"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <td className="p-4 text-center">{appointment.id}</td>
                    <td className="p-4 text-center">{appointment.date}</td>
                    <td className="p-4 text-center">{appointment.startTime}{appointment.endTime ? ` - ${appointment.endTime}` : ''}</td>
                    <td className="p-4 text-center">{appointment.location}</td>
                    <td className="p-4 text-center">
                      <div className="flex justify-center space-x-2">
                        <Button
                          className="p-2 bg-amber-500 hover:bg-amber-600"
                          onClick={() => handleEdit(appointment)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          className="p-2 bg-red-500 hover:bg-red-600"
                          onClick={() => handleDelete(appointment.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="p-4 text-center text-slate-400">
                    No appointments found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

export default AppointmentsPage;