import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import NhanLixi from './pages/NhanLixi';
import Admin from './pages/Admin';
import NotFound from './pages/NotFound';
import { setBackendUrl } from './utils/api';

function App() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const api = params.get('api');
    if (api && /^https?:\/\//i.test(api.trim())) {
      setBackendUrl(api.trim());
      params.delete('api');
      const newSearch = params.toString();
      const newUrl = window.location.pathname + (newSearch ? '?' + newSearch : '') + window.location.hash;
      window.history.replaceState({}, '', newUrl);
    }
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/nhan-lixi" replace />} />
        <Route path="nhan-lixi" element={<NhanLixi />} />
        <Route path="qr" element={<Navigate to="/admin" replace />} />
        <Route path="admin/*" element={<Admin />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default App;
