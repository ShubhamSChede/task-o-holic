"use client"; // Add this at the top

import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiCheck, FiUsers, FiPieChart, FiArrowRight, FiGithub, FiTwitter, FiLinkedin } from 'react-icons/fi';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-200 to-white">
      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur-sm sticky top-0 z-10 border-b border-purple-100">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">T</span>
            </div>
            <span className="font-bold text-xl text-purple-900">TodoApp</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <Link href="/features" className="text-gray-600 hover:text-purple-700 transition-colors">
              Features
            </Link>
            <Link href="/pricing" className="text-gray-600 hover:text-purple-700 transition-colors">
              Pricing
            </Link>
            <Link href="/about" className="text-gray-600 hover:text-purple-700 transition-colors">
              About
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-purple-600 hover:text-purple-800 transition-colors">
              Log in
            </Link>
            <Link 
              href="/register" 
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Sign up
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <motion.div 
          className="text-center mb-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Organize Your Tasks with{' '}
            <span className="text-purple-600">TodoApp</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            A simple, intuitive todo application that helps you stay organized and collaborate with your team.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/login" className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-medium shadow-lg shadow-purple-200 transition-all duration-300 transform hover:-translate-y-1">
              Get Started
            </Link>
            <Link href="/demo" className="bg-white hover:bg-purple-50 text-purple-600 border border-purple-200 px-8 py-3 rounded-lg font-medium transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center gap-2">
              View Demo
              <FiArrowRight />
            </Link>
          </div>

          {/* Preview Image */}
          <div className="mt-16 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-purple-100 to-transparent rounded-xl" />
            <div className="bg-white p-6 rounded-xl shadow-xl border border-purple-100 relative z-10 max-w-4xl mx-auto overflow-hidden">
              <div className="h-8 flex items-center gap-2 mb-4">
                <div className="h-3 w-3 rounded-full bg-red-400" />
                <div className="h-3 w-3 rounded-full bg-yellow-400" />
                <div className="h-3 w-3 rounded-full bg-green-400" />
              </div>
              <div className="bg-purple-50 p-4 rounded-lg flex items-center justify-between mb-4">
                <div className="text-purple-900 font-medium">Today's Tasks</div>
                <div className="text-purple-600 text-sm">April 20, 2025</div>
              </div>
              <div className="space-y-3">
                {[
                  { text: "Design team meeting", complete: true },
                  { text: "Finalize project proposal", complete: false },
                  { text: "Send client invoice", complete: false },
                ].map((task, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-purple-100">
                    <div className={`h-5 w-5 rounded-full flex items-center justify-center ${task.complete ? 'bg-purple-600' : 'border-2 border-purple-300'}`}>
                      {task.complete && <FiCheck className="text-white text-xs" />}
                    </div>
                    <span className={task.complete ? 'line-through text-gray-400' : 'text-gray-800'}>
                      {task.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* Features Section */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="bg-white p-8 rounded-xl shadow-md border border-purple-200 hover:shadow-lg hover:border-purple-300 transition-all duration-300 group">
            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mb-6 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-all duration-300">
              <FiCheck className="text-2xl" />
            </div>
            <h2 className="text-2xl font-semibold mb-4 text-purple-900">Manage Your Tasks</h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              Create, update, and organize your tasks with an intuitive interface. Set priorities, due dates, and categories.
            </p>
            <Link href="/features" className="text-purple-600 font-medium flex items-center gap-2 group-hover:gap-3 transition-all duration-300">
              Learn more <FiArrowRight />
            </Link>
          </div>
          
          <div className="bg-white p-8 rounded-xl shadow-md border border-purple-200 hover:shadow-lg hover:border-purple-300 transition-all duration-300 group">
            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mb-6 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-all duration-300">
              <FiUsers className="text-2xl" />
            </div>
            <h2 className="text-2xl font-semibold mb-4 text-purple-900">Collaborate</h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              Join organizations, share tasks with team members, and work together efficiently on projects of any size.
            </p>
            <Link href="/features/collaboration" className="text-purple-600 font-medium flex items-center gap-2 group-hover:gap-3 transition-all duration-300">
              Learn more <FiArrowRight />
            </Link>
          </div>
          
          <div className="bg-white p-8 rounded-xl shadow-md border border-purple-200 hover:shadow-lg hover:border-purple-300 transition-all duration-300 group">
            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mb-6 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-all duration-300">
              <FiPieChart className="text-2xl" />
            </div>
            <h2 className="text-2xl font-semibold mb-4 text-purple-900">Track Progress</h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              View detailed statistics about your task completion and monitor your productivity over time with interactive charts.
            </p>
            <Link href="/features/analytics" className="text-purple-600 font-medium flex items-center gap-2 group-hover:gap-3 transition-all duration-300">
              Learn more <FiArrowRight />
            </Link>
          </div>
        </motion.div>

        {/* Testimonials Section */}
        <div className="mt-32">
          <h2 className="text-3xl font-bold text-center text-purple-900 mb-16">Trusted by Teams Worldwide</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                name: "Sarah Johnson",
                role: "Product Manager",
                company: "TechCorp",
                text: "TodoApp has transformed how our team collaborates. The intuitive interface and powerful features make it my go-to productivity tool."
              },
              {
                name: "Michael Chen",
                role: "Team Lead",
                company: "DesignStudio",
                text: "The ability to organize tasks by projects and priorities has helped us deliver projects on time consistently. Highly recommend!"
              },
              {
                name: "Elena Rodriguez",
                role: "Freelancer",
                company: "Self-employed",
                text: "As someone juggling multiple clients, TodoApp keeps me organized and focused on what matters most each day."
              }
            ].map((testimonial, i) => (
              <div key={i} className="bg-purple-50 p-8 rounded-xl border border-purple-100">
                <div className="flex items-center gap-1 text-yellow-400 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-600 italic mb-6">"{testimonial.text}"</p>
                <div>
                  <div className="font-medium text-purple-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-500">{testimonial.role}, {testimonial.company}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-32 bg-purple-600 rounded-2xl p-12 text-center text-white max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold mb-6">Ready to boost your productivity?</h2>
          <p className="text-purple-100 max-w-2xl mx-auto mb-10">
            Join thousands of teams that use TodoApp to stay organized, collaborate effectively, and achieve their goals.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/register" className="bg-white text-purple-600 hover:bg-purple-50 px-8 py-3 rounded-lg font-medium shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              Start for Free
            </Link>
            <Link href="/pricing" className="bg-purple-700 hover:bg-purple-800 text-white px-8 py-3 rounded-lg font-medium transition-all duration-300 transform hover:-translate-y-1">
              View Pricing
            </Link>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-white border-t border-purple-200 py-16 mt-32">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 bg-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">T</span>
                </div>
                <span className="font-bold text-xl text-purple-900">TodoApp</span>
              </div>
              <p className="text-gray-500 mb-6">
                A simple, intuitive todo application that helps you stay organized.
              </p>
              <div className="flex gap-4">
                <a href="#" className="text-gray-400 hover:text-purple-600 transition-colors">
                  <FiTwitter />
                </a>
                <a href="#" className="text-gray-400 hover:text-purple-600 transition-colors">
                  <FiGithub />
                </a>
                <a href="#" className="text-gray-400 hover:text-purple-600 transition-colors">
                  <FiLinkedin />
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-purple-900 mb-4">Product</h3>
              <ul className="space-y-3">
                <li><Link href="/features" className="text-gray-500 hover:text-purple-600 transition-colors">Features</Link></li>
                <li><Link href="/pricing" className="text-gray-500 hover:text-purple-600 transition-colors">Pricing</Link></li>
                <li><Link href="/integrations" className="text-gray-500 hover:text-purple-600 transition-colors">Integrations</Link></li>
                <li><Link href="/changelog" className="text-gray-500 hover:text-purple-600 transition-colors">Changelog</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-purple-900 mb-4">Company</h3>
              <ul className="space-y-3">
                <li><Link href="/about" className="text-gray-500 hover:text-purple-600 transition-colors">About</Link></li>
                <li><Link href="/careers" className="text-gray-500 hover:text-purple-600 transition-colors">Careers</Link></li>
                <li><Link href="/blog" className="text-gray-500 hover:text-purple-600 transition-colors">Blog</Link></li>
                <li><Link href="/contact" className="text-gray-500 hover:text-purple-600 transition-colors">Contact</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-purple-900 mb-4">Resources</h3>
              <ul className="space-y-3">
                <li><Link href="/help" className="text-gray-500 hover:text-purple-600 transition-colors">Help Center</Link></li>
                <li><Link href="/api" className="text-gray-500 hover:text-purple-600 transition-colors">API Documentation</Link></li>
                <li><Link href="/community" className="text-gray-500 hover:text-purple-600 transition-colors">Community</Link></li>
                <li><Link href="/status" className="text-gray-500 hover:text-purple-600 transition-colors">System Status</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-purple-100 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 mb-4 md:mb-0">
              &copy; {new Date().getFullYear()} TodoApp. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link href="/privacy" className="text-gray-500 hover:text-purple-600 transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="text-gray-500 hover:text-purple-600 transition-colors">Terms of Service</Link>
              <Link href="/cookies" className="text-gray-500 hover:text-purple-600 transition-colors">Cookie Policy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}