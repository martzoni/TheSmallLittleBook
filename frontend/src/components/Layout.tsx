import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaUser, FaSignOutAlt, FaHome } from 'react-icons/fa';

const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Header/Navbar */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link to="/" className="flex-shrink-0 flex items-center">
                <span className="text-lg font-bold text-blue-600">
                  Le petit grand Livre
                </span>
              </Link>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  to="/associations"
                  className="border-transparent text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  <FaHome className="mr-2" /> Mes associations
                </Link>
              </div>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              <div className="ml-3 relative">
                <div className="flex items-center">
                  <span className="mr-3 text-sm font-medium text-gray-700">
                    {user?.name || 'Utilisateur'}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="p-1 rounded-full text-gray-600 hover:text-gray-900 flex items-center"
                  >
                    <FaSignOutAlt className="text-gray-500 ml-2" />
                    <span className="ml-1 text-sm">Déconnexion</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      <div className="sm:hidden bg-white border-t p-2">
        <Link
          to="/associations"
          className="block py-2 px-4 text-base font-medium text-gray-700 hover:bg-gray-100"
        >
          <FaHome className="inline mr-2" /> Mes associations
        </Link>
        <button
          onClick={handleLogout}
          className="block w-full text-left py-2 px-4 text-base font-medium text-gray-700 hover:bg-gray-100"
        >
          <FaSignOutAlt className="inline mr-2" /> Déconnexion
        </button>
      </div>

      {/* Main content */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} TheSmallLittleBook - Application de comptabilité pour associations
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
