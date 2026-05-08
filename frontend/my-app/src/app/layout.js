// app/layout.js
import './globals.css';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/components/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Personal AI Assistant',
  description: 'Your life, curated.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gradient-to-b from-purple-900 via-black to-purple-800`}>
        <AuthProvider>
          {children}
          <ToastContainer
            position="bottom-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="dark"
          />
        </AuthProvider>
      </body>
    </html>
  );
}