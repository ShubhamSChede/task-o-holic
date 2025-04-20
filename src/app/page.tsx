// app/page.tsx
'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <main className="h-screen w-full relative">
      {/* Background Image */}
      <div className="absolute inset-0 bg-cover bg-center z-0 opacity-25" style={{ backgroundImage: `url('/bg1.jpg')` }}></div>

      {/* Overlay (optional slight darkening for better text visibility) */}
      

      {/* Content */}
      <motion.div
        className="relative z-20 flex flex-col items-center justify-center h-full text-center px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <motion.h1
          className="text-4xl md:text-6xl font-extrabold bg-gradient-to-r from-purple-700 to-purple-400 text-transparent bg-clip-text"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7 }}
        >
          Task-o-holic
        </motion.h1>

        <motion.p
          className="mt-6 text-lg md:text-xl text-gray-700 font-medium max-w-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.7 }}
        >
          Unleash your productivity with the ultimate task management experience. Simple. Beautiful. Addictive.
        </motion.p>

        <motion.div
          className="mt-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <Link href="/login">
            <button className="px-6 py-3 text-white font-medium bg-purple-600 hover:bg-purple-700 rounded-xl shadow-md transition-all duration-300">
              Get Started
            </button>
          </Link>
        </motion.div>
      </motion.div>
    </main>
  );
}
