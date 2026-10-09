import { useState } from 'react';
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import {
  Zap, LayoutDashboard, User, Target, BarChart2,
  Map, FolderOpen, BookOpen, Bell, Trophy, LogOut,
  Menu, X, ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/dashboard/profile', icon: User, label: 'My Profile' },
  { to: '/dashboard/assessment', icon: Target, label: 'Skill Assessment' },
  { to: '/dashboard/skill-gap', icon: BarChart2, label: 'Skill Gap' },
  { to: '/dashboard/roadmap', icon: Map, label: 'Learning Roadmap' },
  { to: '/dashboard/projects', icon: FolderOpen, label: 'Projects' },
  { to: '/dashboard/resources', icon: BookOpen, label: 'Resources' },
  { to: '/dashboard/goals', icon: Trophy, label: 'Goals & Alerts' },
];

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully.');
    navigate('/');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-5 border-b border-white/5">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-indigo-600 rounded-lg flex items-center justify-center">
            <Zap size={15} className="text-white" />
          </div>
          <span className="font-bold text-white">SkillBridge <span className="text-gradient">AI</span></span>
        </Link>
      </div>

      {/* User */}
      <div className="p-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-medium truncate">{user?.name}</p>
            <p className="text-slate-500 text-xs truncate">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) => isActive ? 'nav-link-active' : 'nav-link'}
          >
            <Icon size={17} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer actions */}
      <div className="p-3 border-t border-white/5 space-y-1">
        <Link to="/careers" onClick={() => setSidebarOpen(false)} className="nav-link">
          <ChevronRight size={17} />
          <span>Career Explorer</span>
        </Link>
        <button onClick={handleLogout} className="nav-link w-full text-red-400 hover:text-red-300 hover:bg-red-500/10">
          <LogOut size={17} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-navy-900 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-60 flex-shrink-0 border-r border-white/5 bg-slate-900/50 backdrop-blur-sm">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-72 bg-slate-900 border-r border-white/10 flex flex-col z-10">
            <button onClick={() => setSidebarOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
              <X size={20} />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile topbar */}
        <header className="lg:hidden flex items-center justify-between px-4 h-14 border-b border-white/5 bg-slate-900/50 backdrop-blur-sm">
          <button onClick={() => setSidebarOpen(true)} className="text-slate-400 hover:text-white">
            <Menu size={22} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-primary-500 to-indigo-600 rounded-md flex items-center justify-center">
              <Zap size={12} className="text-white" />
            </div>
            <span className="font-bold text-sm text-white">SkillBridge AI</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
