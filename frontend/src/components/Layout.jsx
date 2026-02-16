import React from 'react';
import { Outlet } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import './Layout.css';

export default function Layout() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="layout">
      <header className="layout-header">
        <div className="layout-inner">
          <a href="/nhan-lixi" className="logo">
            <span className="logo-icon">🧧</span>
            <span>Lì Xì Online</span>
          </a>
          <div className="header-actions">
            <nav className="header-nav">
              <a href="/admin">Admin</a>
            </nav>
            <button
              type="button"
              className="theme-toggle"
            onClick={toggleTheme}
            aria-label={theme === 'light' ? 'Bật dark mode' : 'Bật light mode'}
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
          </div>
        </div>
      </header>
      <main className="layout-main">
        <Outlet />
      </main>
      <footer className="layout-footer">
        <span>Chúc mừng năm mới • Lì xì may mắn</span>
      </footer>
    </div>
  );
}
