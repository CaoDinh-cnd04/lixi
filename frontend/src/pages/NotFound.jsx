import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
      <h1 style={{ fontSize: '3rem', color: 'var(--text-muted)' }}>404</h1>
      <p style={{ marginBottom: '1rem', color: 'var(--text-muted)' }}>Trang không tồn tại.</p>
      <Link to="/nhan-lixi" className="btn btn-primary">Về trang nhận lì xì</Link>
    </div>
  );
}
