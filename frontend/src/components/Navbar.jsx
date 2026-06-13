import React from 'react';
import { BookOpen, LogOut } from 'lucide-react';
import axios from 'axios';
import useAuthStore from '../store/useAuthStore';

export default function Navbar() {
  const { user, clearUser } = useAuthStore();

  const handleLogout = async () => {
    try {
      await axios.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearUser();
    }
  };
  return (
    <nav className="sticky top-0 z-50 h-16 w-full flex items-center justify-between px-6 border-b border-slate-200 bg-white text-black font-sans">
      <div className="flex items-center space-x-3">
        <div className="bg-black p-2 rounded-lg text-white">
          <BookOpen className="h-4 w-4" />
        </div>
        <div>
          <h1 className="text-md font-bold tracking-tight text-black m-0 leading-none">E-Learning Platform</h1>
          <span className="text-[10px] text-slate-500 font-medium">SWST 32043</span>
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        {user && (
          <div className="text-xs text-slate-600 font-semibold bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
            {user.name} ({user.role})
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center justify-center p-2 rounded-lg text-slate-500 hover:text-black hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-all duration-200 cursor-pointer"
          title="Sign Out"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </nav>
  );
}
