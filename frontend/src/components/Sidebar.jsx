import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BookOpen, HelpCircle, MessageSquare, CheckSquare, FileText } from 'lucide-react';

export default function Sidebar() {
  const location = useLocation();

  const links = [
    { name: 'Courses (M1)', path: '/courses', icon: BookOpen },
    { name: 'Quizzes (M2)', path: '/quizzes', icon: HelpCircle },
    { name: 'Forums (M3)', path: '/forums', icon: MessageSquare },
    { name: 'Completion (M4)', path: '/completion', icon: CheckSquare },
    { name: 'Assignments (M5)', path: '/assignments', icon: FileText }
  ];

  return (
    <aside className="w-64 border-r border-slate-200 bg-slate-50 flex flex-col justify-between shrink-0 p-4 font-sans text-black">
      <div className="space-y-6">
        <div className="text-[10px] uppercase font-bold text-slate-400 tracking-widest px-3 mb-2">
          Navigation
        </div>
        <nav className="space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path || (link.path === '/courses' && location.pathname === '/');
            return (
              <Link
                key={link.name}
                to={link.path}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-slate-100 text-black border border-slate-200 shadow-sm'
                    : 'text-slate-500 hover:text-black hover:bg-slate-200/50 border border-transparent'
                }`}
              >
                <Icon className="h-4 w-4 text-slate-500" />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="text-center text-[10px] text-slate-400 font-bold">
        SWST 32043 Group
      </div>
    </aside>
  );
}
