import React from 'react'
import { Link, useLocation } from 'react-router-dom'

const NavBar = () => {
  const location = useLocation()

  const isActive = (path) => location.pathname === path

  return (
    <nav className="portal-navbar">
      <div className="nav-brand">
        <Link to="/" className="brand-logo">
          🪙 CryptoTemple
        </Link>
      </div>

      <div className="nav-links">
        <Link
          to="/login"
          className={`nav-link ${isActive('/login') ? 'active' : ''}`}
        >
          Login
        </Link>
        <Link
          to="/signup"
          className={`nav-link signup-link ${isActive('/signup') ? 'active' : ''}`}
        >
          Sign Up
        </Link>
      </div>
    </nav>
  )
}

export default NavBar