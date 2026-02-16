import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import NhanLixi from './pages/NhanLixi';
import Admin from './pages/Admin';
import NotFound from './pages/NotFound';

function App() {
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
