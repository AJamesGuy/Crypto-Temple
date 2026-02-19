import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsOpen(false);
  };

  return (
    <nav className="bg-gray-900 border-b border-gray-800 fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <Link to={user ? "/dashboard" : "/login"} className="text-2xl font-bold text-emerald-400">
            CryptoTemple
          </Link>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-8">
            {user ? (
              <>
                <Link to="/dashboard" className="text-gray-300 hover:text-white transition">
                  Dashboard
                </Link>
                <Link to="/trade" className="text-gray-300 hover:text-white transition">
                  Trade
                </Link>
                <Link to="/portfolio" className="text-gray-300 hover:text-white transition">
                  Portfolio
                </Link>
                <Link to="/settings" className="text-gray-300 hover:text-white transition">
                  Settings
                </Link>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="text-red-400 hover:text-red-300 transition"
                >
                  Logout
                </button>

                {/* Balance display */}
                <div className="text-emerald-400 font-medium">
                  ${user.cash_balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-300 hover:text-white transition">
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md transition"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-300 hover:text-white focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-gray-900 border-b border-gray-800">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="block px-3 py-2 text-gray-300 hover:bg-gray-800 rounded-md"
                  onClick={() => setIsOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  to="/trade"
                  className="block px-3 py-2 text-gray-300 hover:bg-gray-800 rounded-md"
                  onClick={() => setIsOpen(false)}
                >
                  Trade
                </Link>
                <Link
                  to="/portfolio"
                  className="block px-3 py-2 text-gray-300 hover:bg-gray-800 rounded-md"
                  onClick={() => setIsOpen(false)}
                >
                  Portfolio
                </Link>
                <Link
                  to="/settings"
                  className="block px-3 py-2 text-gray-300 hover:bg-gray-800 rounded-md"
                  onClick={() => setIsOpen(false)}
                >
                  Settings
                </Link>

                <div className="px-3 py-2 text-sm text-gray-400">
                  Balance: <span className="text-emerald-400">${user.cash_balance.toLocaleString()}</span>
                </div>

                <button
                  onClick={() => { handleLogout(); setIsOpen(false); }}
                  className="block w-full text-left px-3 py-2 text-red-400 hover:bg-gray-800 rounded-md"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block px-3 py-2 text-gray-300 hover:bg-gray-800 rounded-md"
                  onClick={() => setIsOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="block px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md"
                  onClick={() => setIsOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;