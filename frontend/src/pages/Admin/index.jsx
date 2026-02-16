import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import ConfigPage from './ConfigPage';
import DashboardPage from './DashboardPage';
import QRAdminPage from './QRAdminPage';
import {
  hasStoredSecret,
  createSecret,
  verifySecret,
  setSession,
  clearSession,
  isLoggedIn
} from '../../utils/adminAuth';
import { hasBackend, verifyAdmin, setAdminKeyForApi } from '../../utils/api';
import './Admin.css';

export default function Admin() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [checking, setChecking] = useState(true);
  const [isCreate, setIsCreate] = useState(false);
  const [code, setCode] = useState('');
  const [confirmCode, setConfirmCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const useBackend = hasBackend();

  useEffect(() => {
    setLoggedIn(isLoggedIn());
    setIsCreate(!useBackend && !hasStoredSecret());
    setChecking(false);
  }, [useBackend]);

  const handleCreate = (e) => {
    e.preventDefault();
    setError('');
    const trimmed = code.trim();
    const confirm = confirmCode.trim();
    if (!trimmed || trimmed.length < 4) {
      setError('Mã admin tối thiểu 4 ký tự.');
      return;
    }
    if (trimmed !== confirm) {
      setError('Hai ô mã không trùng khớp.');
      return;
    }
    if (createSecret(trimmed)) {
      setSession();
      setLoggedIn(true);
      setCode('');
      setConfirmCode('');
      navigate('/admin/dashboard');
    } else {
      setError('Không lưu được mã. Thử lại.');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    const trimmed = code.trim();
    if (!trimmed) {
      setError('Vui lòng nhập mã admin.');
      return;
    }
    if (useBackend) {
      setLoading(true);
      try {
        const ok = await verifyAdmin(trimmed);
        if (ok) {
          setAdminKeyForApi(trimmed);
          setSession();
          setLoggedIn(true);
          setCode('');
          navigate('/admin/dashboard');
        } else {
          setError('Mã admin không đúng.');
        }
      } catch (err) {
        setError(err.message || 'Lỗi kết nối server.');
      } finally {
        setLoading(false);
      }
      return;
    }
    if (!verifySecret(trimmed)) {
      setError('Mã admin không đúng.');
      return;
    }
    setSession();
    setLoggedIn(true);
    setCode('');
    navigate('/admin/dashboard');
  };

  const handleLogout = () => {
    clearSession();
    setAdminKeyForApi('');
    setLoggedIn(false);
    setCode('');
    setConfirmCode('');
    setError('');
    navigate('/admin');
  };

  if (checking) {
    return (
      <div className="admin-wrap admin-loading">
        <div className="loading-spinner" />
        <p>Đang kiểm tra...</p>
      </div>
    );
  }

  if (!loggedIn) {
    return (
      <div className="admin-wrap">
        <div className="admin-login">
          <h1>{isCreate ? '🔐 Tạo mã admin' : '🔐 Đăng nhập Admin'}</h1>
          <p className="admin-login-desc">
            {useBackend
              ? 'Nhập mã admin (trùng với ADMIN_SECRET trong file .env của server).'
              : isCreate
                ? 'Tạo mã bí mật để chỉ bạn (hoặc người có mã) vào quản lý. Mã tối thiểu 4 ký tự.'
                : 'Nhập mã admin để vào trang quản lý.'}
          </p>
          {error && <div className="message-box error">{error}</div>}
          <form onSubmit={isCreate ? handleCreate : handleLogin}>
            <input
              type="password"
              placeholder={isCreate ? 'Nhập mã admin' : 'Mã admin'}
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                setError('');
              }}
              autoComplete={isCreate ? 'new-password' : 'current-password'}
              minLength={4}
              autoFocus
            />
            {isCreate && !useBackend && (
              <input
                type="password"
                placeholder="Xác nhận mã admin"
                value={confirmCode}
                onChange={(e) => {
                  setConfirmCode(e.target.value);
                  setError('');
                }}
                autoComplete="new-password"
                minLength={4}
              />
            )}
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Đang kiểm tra...' : isCreate ? 'Tạo mã và vào quản lý' : 'Đăng nhập'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-wrap">
      <nav className="admin-nav">
        <a href="/admin/dashboard">Dashboard</a>
        <a href="/admin/config">Cấu hình</a>
        <a href="/admin/qr">Mã QR</a>
        <button type="button" className="btn-logout" onClick={handleLogout}>
          Đăng xuất
        </button>
      </nav>
      <Routes>
        <Route path="/" element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="config" element={<ConfigPage />} />
        <Route path="qr" element={<QRAdminPage />} />
      </Routes>
    </div>
  );
}
