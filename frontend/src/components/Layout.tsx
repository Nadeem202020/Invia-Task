import { useNavigate } from 'react-router-dom';
import { LogOut, Package2 } from 'lucide-react';

export default function Layout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const username = localStorage.getItem('username');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-base-950">
      {/* Navbar */}
      <nav className="glass sticky top-0 z-40 border-b border-base-700/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Brand */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg gradient-btn flex items-center justify-center shadow-md">
                <Package2 className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold gradient-text">
                Mini Inventory
              </span>
            </div>

            {/* User & Logout */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-accent-amber/15 flex items-center justify-center text-xs font-bold text-accent-amber uppercase">
                  {username?.charAt(0) || 'U'}
                </div>
                <span className="text-sm text-base-300 hidden sm:inline">
                  {username}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-sm text-base-400 hover:text-accent-rose transition-colors duration-200 px-3 py-1.5 rounded-lg hover:bg-accent-rose/10"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
