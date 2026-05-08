'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { toast } from 'react-toastify';

// Create the Auth Context
const AuthContext = createContext();

// Custom hook to use the Auth Context
export const useAuth = () => {
  return useContext(AuthContext);
};

// Firebase configuration (REPLACE WITH YOUR ACTUAL FIREBASE CONFIG)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Listen for authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    // Clean up subscription on unmount
    return unsubscribe;
  }, []);

  // --- Email/Password Authentication Functions ---

  // Modified signup to accept a name
  const signup = async (email, password, name) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      // Update user profile with the provided name
      if (userCredential.user && name) {
        await updateProfile(userCredential.user, { displayName: name });

        // For immediate reflection, manually update state
        setCurrentUser({ ...userCredential.user, displayName: name });
      }

      return { success: true };
    } catch (error) {
      let errorMessage = 'Failed to create an account.';

      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already in use.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please use a stronger password.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'The email address is not valid.';
      }

      return { success: false, error: errorMessage };
    }
  };

  // Login
  const login = async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { success: true };
    } catch (error) {
      let errorMessage = 'Failed to log in.';

      if (
        error.code === 'auth/user-not-found' ||
        error.code === 'auth/wrong-password' ||
        error.code === 'auth/invalid-credential'
      ) {
        errorMessage = 'Invalid email or password.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email format.';
      }

      return { success: false, error: errorMessage };
    }
  };

  // Logout
  const logout = async () => {
    try {
      await signOut(auth);
      toast.info('Logged out successfully!');
      return { success: true };
    } catch (error) {
      toast.error('Failed to log out.');
      return { success: false, error: 'Failed to log out.' };
    }
  };

  // Context value
  const value = {
    currentUser,
    signup,
    login,
    logout,
    auth, // If other Firebase services need access
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};