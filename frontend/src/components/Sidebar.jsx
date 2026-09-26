import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { LayoutDashboard, UserCircle, Briefcase, Users, Settings } from 'lucide-react';

const Sidebar = () => {
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['client', 'freelancer', 'admin'] },
    { name: 'My Profile', path: '/profile', icon: UserCircle, roles: ['client', 'freelancer', 'admin'] },
    { name: 'Jobs', path: '/jobs', icon: Briefcase, roles: ['client', 'freelancer'] },
    { name: 'Manage Users', path: '/admin/users', icon: Users, roles: ['admin'] },
    { name: 'Settings', path: '/settings', icon: Settings, roles: ['client', 'freelancer', 'admin'] },
  ];

  const filteredNavItems = navItems.filter(item => item.roles.includes(user?.role));

  return (
    <div className="hidden md:flex flex-col w-64 bg-slate-900 shadow-xl h-full border-r border-slate-800 z-20">
      <div className="flex items-center justify-center h-16 bg-slate-950 border-b border-slate-800">
        <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-blue-300 tracking-tight">
          SkillSphere
        </span>
      </div>
      
      <div className="p-4 flex-1 overflow-y-auto">
        <div className="mb-6 px-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {user?.role} Portal
          </p>
        </div>
        <nav className="space-y-1.5">
          {filteredNavItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 group ${
                  isActive 
                    ? 'bg-primary-600 text-white shadow-md shadow-primary-500/20' 
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className={`mr-3 h-5 w-5 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-primary-300 transition-colors'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
      
      <div className="p-4 border-t border-slate-800 bg-slate-900">
        <div className="flex items-center px-4 py-3 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer">
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary-500 to-blue-700 flex items-center justify-center text-white font-bold shadow-inner ring-2 ring-slate-800">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="ml-3 truncate">
            <p className="text-sm font-medium text-white truncate">{user?.name}</p>
            <p className="text-xs font-medium text-slate-400 capitalize truncate">{user?.role}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
