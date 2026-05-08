'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { Plus, Edit, Trash2, Search, AlertTriangle } from 'lucide-react';
import Select from 'react-select';
import Flag from 'react-world-flags';
import { useAuth } from '@/components/AuthContext';

// Reusable components
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

const Dialog = ({ children, open, onOpenChange }) => (
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

const DialogHeader = ({ children }) => <div className="flex flex-col space-y-1.5 text-center sm:text-left mb-4">{children}</div>;
const DialogTitle = ({ children }) => <h3 className="text-lg font-semibold leading-none tracking-tight text-amber-400">{children}</h3>;
const DialogDescription = ({ children }) => <p className="text-sm text-slate-400">{children}</p>;
const DialogContent = ({ children }) => <div className="py-4">{children}</div>;
const DialogFooter = ({ children }) => <div className="flex justify-end space-x-2">{children}</div>;

// Country data
const countryCodes = [
 { name: 'Afghanistan', code: '+93', abbr: 'AFG', flag: 'AF', minLen: 9, maxLen: 9 },
  { name: 'Albania', code: '+355', abbr: 'ALB', flag: 'AL', minLen: 9, maxLen: 9 },
  { name: 'Algeria', code: '+213', abbr: 'DZA', flag: 'DZ', minLen: 9, maxLen: 9 },
  { name: 'Andorra', code: '+376', abbr: 'AND', flag: 'AD', minLen: 6, maxLen: 9 },
  { name: 'Angola', code: '+244', abbr: 'AGO', flag: 'AO', minLen: 9, maxLen: 9 },
  { name: 'Argentina', code: '+54', abbr: 'ARG', flag: 'AR', minLen: 10, maxLen: 10 },
  { name: 'Australia', code: '+61', abbr: 'AUS', flag: 'AU', minLen: 9, maxLen: 9 },
  { name: 'Austria', code: '+43', abbr: 'AUT', flag: 'AT', minLen: 10, maxLen: 11 },
  { name: 'Bangladesh', code: '+880', abbr: 'BGD', flag: 'BD', minLen: 10, maxLen: 10 },
  { name: 'Belgium', code: '+32', abbr: 'BEL', flag: 'BE', minLen: 9, maxLen: 9 },
  { name: 'Brazil', code: '+55', abbr: 'BRA', flag: 'BR', minLen: 10, maxLen: 11 },
  { name: 'Canada', code: '+1', abbr: 'CAN', flag: 'CA', minLen: 10, maxLen: 10 },
  { name: 'China', code: '+86', abbr: 'CHN', flag: 'CN', minLen: 11, maxLen: 11 },
  { name: 'Colombia', code: '+57', abbr: 'COL', flag: 'CO', minLen: 10, maxLen: 10 },
  { name: 'Denmark', code: '+45', abbr: 'DNK', flag: 'DK', minLen: 8, maxLen: 8 },
  { name: 'Egypt', code: '+20', abbr: 'EGY', flag: 'EG', minLen: 10, maxLen: 10 },
  { name: 'Finland', code: '+358', abbr: 'FIN', flag: 'FI', minLen: 9, maxLen: 10 },
  { name: 'France', code: '+33', abbr: 'FRA', flag: 'FR', minLen: 9, maxLen: 9 },
  { name: 'Germany', code: '+49', abbr: 'DEU', flag: 'DE', minLen: 10, maxLen: 11 },
  { name: 'Ghana', code: '+233', abbr: 'GHA', flag: 'GH', minLen: 9, maxLen: 9 },
  { name: 'Greece', code: '+30', abbr: 'GRC', flag: 'GR', minLen: 10, maxLen: 10 },
  { name: 'Hong Kong', code: '+852', abbr: 'HKG', flag: 'HK', minLen: 8, maxLen: 8 },
  { name: 'India', code: '+91', abbr: 'IND', flag: 'IN', minLen: 10, maxLen: 10 },
  { name: 'Indonesia', code: '+62', abbr: 'IDN', flag: 'ID', minLen: 10, maxLen: 12 },
  { name: 'Ireland', code: '+353', abbr: 'IRL', flag: 'IE', minLen: 9, maxLen: 9 },
  { name: 'Israel', code: '+972', abbr: 'ISR', flag: 'IL', minLen: 9, maxLen: 9 },
  { name: 'Italy', code: '+39', abbr: 'ITA', flag: 'IT', minLen: 10, maxLen: 10 },
  { name: 'Japan', code: '+81', abbr: 'JPN', flag: 'JP', minLen: 10, maxLen: 10 },
  { name: 'Kenya', code: '+254', abbr: 'KEN', flag: 'KE', minLen: 9, maxLen: 9 },
  { name: 'Malaysia', code: '+60', abbr: 'MYS', flag: 'MY', minLen: 7, maxLen: 10 },
  { name: 'Mexico', code: '+52', abbr: 'MEX', flag: 'MX', minLen: 10, maxLen: 10 },
  { name: 'Netherlands', code: '+31', abbr: 'NLD', flag: 'NL', minLen: 9, maxLen: 9 },
  { name: 'New Zealand', code: '+64', abbr: 'NZL', flag: 'NZ', minLen: 8, maxLen: 9 },
  { name: 'Nigeria', code: '+234', abbr: 'NGA', flag: 'NG', minLen: 10, maxLen: 10 },
  { name: 'Norway', code: '+47', abbr: 'NOR', flag: 'NO', minLen: 8, maxLen: 8 },
  { name: 'Pakistan', code: '+92', abbr: 'PAK', flag: 'PK', minLen: 10, maxLen: 10 },
  { name: 'Peru', code: '+51', abbr: 'PER', flag: 'PE', minLen: 9, maxLen: 9 },
  { name: 'Philippines', code: '+63', abbr: 'PHL', flag: 'PH', minLen: 10, maxLen: 10 },
  { name: 'Poland', code: '+48', abbr: 'POL', flag: 'PL', minLen: 9, maxLen: 9 },
  { name: 'Portugal', code: '+351', abbr: 'PRT', flag: 'PT', minLen: 9, maxLen: 9 },
  { name: 'Russia', code: '+7', abbr: 'RUS', flag: 'RU', minLen: 10, maxLen: 10 },
  { name: 'Saudi Arabia', code: '+966', abbr: 'SAU', flag: 'SA', minLen: 9, maxLen: 9 },
  { name: 'Singapore', code: '+65', abbr: 'SGP', flag: 'SG', minLen: 8, maxLen: 8 },
  { name: 'South Africa', code: '+27', abbr: 'ZAF', flag: 'ZA', minLen: 9, maxLen: 9 },
  { name: 'South Korea', code: '+82', abbr: 'KOR', flag: 'KR', minLen: 10, maxLen: 11 },
  { name: 'Spain', code: '+34', abbr: 'ESP', flag: 'ES', minLen: 9, maxLen: 9 },
  { name: 'Sweden', code: '+46', abbr: 'SWE', flag: 'SE', minLen: 7, maxLen: 10 },
  { name: 'Switzerland', code: '+41', abbr: 'CHE', flag: 'CH', minLen: 9, maxLen: 9 },
  { name: 'Thailand', code: '+66', abbr: 'THA', flag: 'TH', minLen: 9, maxLen: 9 },
  { name: 'Turkey', code: '+90', abbr: 'TUR', flag: 'TR', minLen: 10, maxLen: 10 },
  { name: 'United Arab Emirates', code: '+971', abbr: 'ARE', flag: 'AE', minLen: 9, maxLen: 9 },
  { name: 'United Kingdom', code: '+44', abbr: 'GBR', flag: 'GB', minLen: 10, maxLen: 10 },
  { name: 'United States', code: '+1', abbr: 'USA', flag: 'US', minLen: 10, maxLen: 10 },
  { name: 'Vietnam', code: '+84', abbr: 'VNM', flag: 'VN', minLen: 9, maxLen: 10 },
  // Add other countries similarly...
];

// Custom styles for react-select
const customSelectStyles = {
  control: (provided) => ({
    ...provided,
    backgroundColor: '#2d3748',
    borderColor: '#4a5568',
    color: 'white',
    borderRadius: '0.375rem',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
    '&:hover': {
      borderColor: '#4a5568',
    },
    minHeight: '36px',
    height: '36px',
    width: 'auto', // Allow auto width to accommodate the full label
  }),
  menu: (provided) => ({
    ...provided,
    backgroundColor: '#2d3748',
    borderRadius: '0.375rem',
    maxHeight: '400px',
    overflowY: 'auto',
    '&::-webkit-scrollbar': {
      width: '10px',
    },
    '&::-webkit-scrollbar-track': {
      background: '#1a202c',
      borderRadius: '10px',
    },
    '&::-webkit-scrollbar-thumb': {
      background: '#4a5568',
      borderRadius: '10px',
    },
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected ? '#4a5568' : state.isFocused ? '#4a5568' : '#2d3748',
    color: 'white',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    padding: '8px 12px',
    '&:hover': {
      backgroundColor: '#4a5568',
    },
  }),
  singleValue: (provided) => ({
    ...provided,
    color: 'white',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    '& > div': {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
    },
  }),
  placeholder: (provided) => ({
    ...provided,
    color: '#a0aec0',
    fontSize: '14px',
  }),
  input: (provided) => ({
    ...provided,
    color: 'white',
    fontSize: '14px',
  }),
  valueContainer: (provided) => ({
    ...provided,
    padding: '2px 8px',
  }),
};

const ContactsPage = () => {
  const { currentUser } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [form, setForm] = useState({
    name: '',
    address: '',
    phone_number: '',
    email: '',
    country_code: '+234',
  });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const emailInputRef = useRef(null);

  useEffect(() => {
    fetchContacts();
  }, [currentUser]);

  const fetchContacts = async () => {
    const userId = currentUser?.uid || 'anonymous';
    try {
      const response = await fetch(`http://localhost:5000/api/contacts?userId=${userId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setContacts(data);
    } catch (error) {
      console.error('Failed to fetch contacts:', error);
      toast.error('Failed to load contacts. Please ensure backend is running.');
    }
  };

  const filteredContacts = contacts.filter(contact =>
    Object.values(contact).some(value =>
      String(value).toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const validatePhoneNumber = (fullNumber, selectedCountryCode) => {
    const country = countryCodes.find(c => c.code === selectedCountryCode);
    if (!country) {
      console.warn(`Validation: Country code ${selectedCountryCode} not found in list.`);
      const digitsOnly = fullNumber.replace(/\D/g, '');
      return digitsOnly.length >= 7 && digitsOnly.length <= 15;
    }
    const numberWithoutCode = fullNumber.startsWith(selectedCountryCode)
      ? fullNumber.substring(selectedCountryCode.length)
      : fullNumber;
    const digitsOnly = numberWithoutCode.replace(/\D/g, '');
    return digitsOnly.length >= country.minLen && digitsOnly.length <= country.maxLen;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, address, phone_number, email, country_code } = form;
    const userId = currentUser?.uid || 'anonymous';

    if (phone_number) {
      if (!validatePhoneNumber(country_code + phone_number, country_code)) {
        toast.error(`Invalid phone number for ${country_code}. Please check the number format and length.`);
        return;
      }
    }

    const fullPhoneNumber = phone_number ? `${country_code}${phone_number}` : '';

    try {
      const contactData = {
        name,
        address,
        phone_number: fullPhoneNumber,
        email,
        userId,
      };

      if (editingContact) {
        const response = await fetch(`http://localhost:5000/api/contacts/${editingContact.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(contactData),
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        const updatedContact = await response.json();
        setContacts(contacts.map(c => c.id === updatedContact.id ? updatedContact : c));
        toast.success('Contact updated successfully!');
      } else {
        const response = await fetch('http://localhost:5000/api/contacts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(contactData),
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        const newContact = await response.json();
        setContacts([...contacts, newContact]);
        toast.success('Contact added successfully!');
      }
      setForm({ name: '', address: '', phone_number: '', email: '', country_code: '+234' });
      setIsFormOpen(false);
      setEditingContact(null);
    } catch (error) {
      console.error('Failed to save contact:', error.message);
      toast.error(`Failed to save contact: ${error.message}. Please check your backend server.`);
    }
  };

  const handleDelete = async (id) => {
    toast.info(
      <div className="flex flex-col items-center">
        <AlertTriangle className="w-8 h-8 text-yellow-400 mb-2" />
        <p className="text-white mb-4">Are you sure you want to delete this contact?</p>
        <div className="flex gap-4">
          <Button
            onClick={async () => {
              const userId = currentUser?.uid || 'anonymous';
              try {
                const response = await fetch(`http://localhost:5000/api/contacts/${id}?userId=${userId}`, {
                  method: 'DELETE',
                });
                if (!response.ok) {
                  const errorData = await response.json();
                  throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
                }
                setContacts(contacts.filter(c => c.id !== id));
                toast.dismiss(`confirm-delete-${id}`);
                toast.success('Contact deleted successfully!');
              } catch (error) {
                console.error('Failed to delete contact:', error.message);
                toast.dismiss(`confirm-delete-${id}`);
                toast.error(`Failed to delete contact: ${error.message}.`);
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
        toastId: `confirm-delete-${id}`,
      }
    );
  };

  const handleEdit = (contact) => {
    let localPhoneNumber = contact.phone_number || '';
    let selectedCode = '+234';
    const sortedCountryCodes = [...countryCodes].sort((a, b) => b.code.length - a.code.length);
    for (const country of sortedCountryCodes) {
      if (contact.phone_number && contact.phone_number.startsWith(country.code)) {
        selectedCode = country.code;
        localPhoneNumber = contact.phone_number.substring(country.code.length);
        break;
      }
    }
    setForm({
      name: contact.name,
      address: contact.address,
      phone_number: localPhoneNumber,
      email: contact.email,
      country_code: selectedCode,
    });
    setEditingContact(contact);
    setIsFormOpen(true);
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setForm({ ...form, email: value });
  };

  const handleEmailKeyDown = (e) => {
    if (e.key === '@' && form.email && !form.email.includes('@')) {
      e.preventDefault();
      setForm(prevForm => ({ ...prevForm, email: prevForm.email + '@gmail.com' }));
      setTimeout(() => {
        if (emailInputRef.current) {
          emailInputRef.current.selectionStart = emailInputRef.current.selectionEnd = emailInputRef.current.value.length;
        }
      }, 0);
    }
  };

  const countryOptions = countryCodes.map(country => ({
    value: country.code,
    label: (
      <div className="flex items-center space-x-2">
        <Flag code={country.flag} className="w-6 h-4" />
        <span className="text-sm font-medium">{country.code}</span>
        <span className="text-sm font-medium ml-1">{country.abbr}</span>
      </div>
    ),
    displayLabel: (
      <div className="flex items-center gap-2">
        <Flag code={country.flag} className="w-6 h-4" />
        <span className="text-sm font-medium">{country.code}</span>
        <span className="text-sm font-medium ml-1">{country.abbr}</span>
      </div>
    ),
    fullNameAndCode: `${country.name} (${country.code})`,
  }));

  return (
    <motion.div
      id="contacts-section"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full min-h-screen bg-gradient-to-br from-purple-900 via-black to-purple-800 text-white"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-white mb-4 sm:mb-0 mr-4">Contacts</h2>
          <Button
            onClick={() => {
              setIsFormOpen(true);
              setEditingContact(null);
              setForm({ name: '', address: '', phone_number: '', email: '', country_code: '+234' });
            }}
            className="bg-amber-500 hover:bg-amber-600 px-3 py-2 text-sm sm:px-4 sm:py-2"
          >
            <Plus className="w-4 h-4 mr-2" /> Add New Contact
          </Button>
        </div>

        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogHeader>
            <DialogTitle>{editingContact ? 'Edit Contact' : 'Add New Contact'}</DialogTitle>
            <DialogDescription>
              {editingContact ? 'Update the details for this contact.' : 'Fill in the details to add a new contact.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <DialogContent>
              <div className="grid gap-4 py-4">
                <Input
                  type="text"
                  placeholder="Name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />w
                <Input
                  type="text"
                  placeholder="Address"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                />
                <div className="flex gap-2 items-center">
                  <Select
                    options={countryOptions}
                    value={countryOptions.find(option => option.value === form.country_code)}
                    onChange={(selected) => setForm({ ...form, country_code: selected.value })}
                    styles={customSelectStyles}
                    className="flex-shrink-0"
                    formatOptionLabel={(option, { context }) => (context === 'value' ? option.displayLabel : option.label)}
                    placeholder="Select country"
                  />
                  <Input
                    type="tel"
                    placeholder="Phone Number"
                    value={form.phone_number}
                    onChange={(e) => setForm({ ...form, phone_number: e.target.value.replace(/\D/g, '') })}
                    pattern="[0-9]*"
                    inputMode="numeric"
                    className="flex-1"
                  />
                </div>
                {form.phone_number && !validatePhoneNumber(form.country_code + form.phone_number, form.country_code) && (
                  <p className="text-red-400 text-sm -mt-2">
                    Please enter a valid phone number for the selected country.
                  </p>
                )}
                <Input
                  type="text"
                  placeholder="Email (e.g., yourname@gmail.com)"
                  value={form.email}
                  onChange={handleEmailChange}
                  onKeyDown={handleEmailKeyDown}
                  ref={emailInputRef}
                  required
                />
              </div>
            </DialogContent>
            <DialogFooter>
              <Button type="submit">{editingContact ? 'Save Changes' : 'Add Contact'}</Button>
            </DialogFooter>
          </form>
        </Dialog>

        <div className="relative mb-6 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Search contacts..."
            className="pl-10 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="rounded-lg border overflow-x-auto border-slate-700 shadow-xl w-full contacts-table-container">
          <table className="w-full text-left table-auto min-w-[700px]">
            <thead className="bg-slate-800">
              <tr>
                <th className="p-4 font-bold text-slate-300">ID</th>
                <th className="p-4 font-bold text-slate-300 text-center">Name</th>
                <th className="p-4 font-bold text-slate-300 text-center">Address</th>
                <th className="p-4 font-bold text-slate-300 text-center">Phone</th>
                <th className="p-4 font-bold text-slate-300 text-center">Email</th>
                <th className="p-4 font-bold text-slate-300 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {filteredContacts.length > 0 ? (
                filteredContacts.map((contact, index) => (
                  <motion.tr
                    key={contact.id}
                    className="bg-slate-900 even:bg-slate-800 hover:bg-slate-700 transition-colors"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <td className="p-4">{contact.id}</td>
                    <td className="p-4 text-center">{contact.name}</td>
                    <td className="p-4 text-center">{contact.address}</td>
                    <td className="p-4 text-center">{contact.phone_number}</td>
                    <td className="p-4 text-center">{contact.email}</td>
                    <td className="p-4 text-center">
                      <div className="flex justify-center space-x-2">
                        <Button
                          className="p-2 bg-amber-500 hover:bg-amber-600"
                          onClick={() => handleEdit(contact)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          className="p-2 bg-red-500 hover:bg-red-600"
                          onClick={() => handleDelete(contact.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="p-4 text-center text-slate-400">
                    No contacts found.
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

export default ContactsPage;
