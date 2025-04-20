// src/app/page.tsx
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-100 to-white">
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-20">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Organize Your Tasks with{' '}
            <span className="text-purple-600">TodoApp</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            A simple, intuitive todo application that helps you stay organized and collaborate with your team.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/login" className="btn-primary">
              Sign In
            </Link>
            <Link href="/register" className="btn-secondary">
              Create Account
            </Link>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="bg-white p-8 rounded-xl shadow-sm border border-purple-200 hover:shadow-md transition-all duration-200 group">
            <div className="text-4xl mb-6 text-purple-600 group-hover:scale-110 transition-transform duration-200">✅</div>
            <h2 className="text-2xl font-semibold mb-4 text-purple-900">Manage Your Tasks</h2>
            <p className="text-purple-600 leading-relaxed">
              Create, update, and organize your tasks with an intuitive interface. Set priorities, due dates, and categories.
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-xl shadow-sm border border-purple-200 hover:shadow-md transition-all duration-200 group">
            <div className="text-4xl mb-6 text-purple-600 group-hover:scale-110 transition-transform duration-200">🤝</div>
            <h2 className="text-2xl font-semibold mb-4 text-purple-900">Collaborate</h2>
            <p className="text-purple-600 leading-relaxed">
              Join organizations, share tasks with team members, and work together efficiently.
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-xl shadow-sm border border-purple-200 hover:shadow-md transition-all duration-200 group">
            <div className="text-4xl mb-6 text-purple-600 group-hover:scale-110 transition-transform duration-200">📊</div>
            <h2 className="text-2xl font-semibold mb-4 text-purple-900">Track Progress</h2>
            <p className="text-purple-600 leading-relaxed">
              View detailed statistics about your task completion and monitor your productivity over time.
            </p>
          </div>
        </div>
      </div>
      
      <footer className="bg-white border-t border-purple-200 py-12 mt-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-purple-600 mb-4 md:mb-0">
              &copy; {new Date().getFullYear()} TodoApp. All rights reserved.
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-purple-600 hover:text-purple-700 transition-colors">Privacy Policy</a>
              <a href="#" className="text-purple-600 hover:text-purple-700 transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}