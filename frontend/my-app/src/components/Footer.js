'use client';

import React, { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Phone, Mail } from "lucide-react";
import { FaWhatsapp, FaXTwitter, FaFacebook, FaInstagram, FaLinkedin } from 'react-icons/fa6';
import { toast } from "react-toastify";

const Footer = () => {
  const year = new Date().getFullYear();
  const [email, setEmail] = useState("");

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address.");
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message);
        setEmail("");
      } else {
        toast.error(data.error || 'Failed to subscribe.');
      }
    } catch (error) {
      console.error('Subscription error:', error);
      toast.error('An unexpected error occurred. Please try again.');
    }
  };

  return (
    <motion.footer 
      className="bg-gradient-to-b from-gray-900 via-purple-900 to-black text-slate-300 py-12 md:py-16 overflow-hidden w-full"
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 100, delay: 0.2 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-8 xl:px-0">
        <div className="flex flex-col md:flex-row md:flex-wrap xl:flex-nowrap gap-10 xl:gap-16 justify-between pb-10 xl:pb-15">
          {/* Help & Support */}
          <div className="w-full md:w-1/2 xl:w-auto flex-1 md:pr-4">
            <h2 className="mb-6 text-xl font-semibold text-amber-400">
              Help & Support
            </h2>
            <ul className="flex flex-col gap-3 text-slate-400">
              <li className="flex gap-3 items-start">
                <MapPin className="flex-shrink-0 w-5 h-5 text-amber-500 mt-0.5" />
                <span>No 69 Obafemi Awolowo Way, Ikeja, Lagos, Nigeria.</span>
              </li>
              <li>
                <a href="tel:+2348079379510" className="flex items-center gap-3 hover:text-amber-400 transition-colors">
                  <Phone className="w-5 h-5 text-amber-500" />
                  +234 807 937 9510
                </a>
              </li>
              <li>
                <a href="mailto:stephenokwu795@gmail.com" className="flex items-center gap-3 hover:text-amber-400 transition-colors">
                  <Mail className="w-5 h-5 text-amber-500" />
                  stephenokwu795@gmail.com
                </a>
              </li>
            </ul>

            {/* Social Links */}
            <div className="flex items-center gap-4 mt-8">
              <a href="https://www.facebook.com/profile.php?id=61566909757271"target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-[#1877F2] transition-colors">
                <FaFacebook className="w-6 h-6" />
              </a>
              <a href="https://instagram.com/nexelitee" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-purple-600 transition-colors">
                <FaInstagram className="w-6 h-6" />
              </a>
              <a href="https://wa.me/08079379510" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-[#25D366] transition-colors">
                <FaWhatsapp className="w-6 h-6" />
              </a>
              <a href="https://www.linkedin.com/in/stephen-okwu-396914349/"  target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-[#005C8D] transition-colors">
                <FaLinkedin className="w-6 h-6" />
              </a>
              <a href="https://twitter.com/chidi_03" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors">
                <FaXTwitter className="w-6 h-6" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="w-full md:w-1/2 xl:w-auto flex-1 md:pl-4">
            <h2 className="mb-6 text-xl font-semibold text-amber-400">
              About the App
            </h2>
            <p className="text-slate-400">
              Discover a smarter way to live with our AI Personal Assistant. Seamlessly blending advanced technology with elegant design, it organizes your tasks, schedules, and reminders, making every day more productive and enjoyable.
            </p>
          </div>

          {/* Email Subscription */}
          <div className="w-full md:w-1/2 xl:w-auto flex-1 md:pr-4">
            <h2 className="mb-6 text-xl font-semibold text-amber-400">
              Stay Updated
            </h2>
            <p className="text-slate-400 mb-4">
              Subscribe to our newsletter for exclusive updates and offers.
            </p>
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 rounded-md bg-gray-800 border border-gray-700 text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button
                type="submit"
                className="bg-amber-500 text-black px-6 py-2 rounded-md font-semibold hover:bg-amber-600 transition-colors shadow-lg"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-700 pt-8 text-center text-slate-500">
          <p>&copy;{year} Personal Assistant App. All rights reserved.</p>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;