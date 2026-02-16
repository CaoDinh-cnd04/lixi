import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { getStats, getStatsList, removeRecipient, hasBackend } from '../../utils/api';
import './DashboardPage.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const load = () => {
    setLoading(true);
    Promise.all([getStats(), getStatsList()])
      .then(([stats, listData]) => {
        setData(stats);
        setList(listData || []);
        setError('');
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, []);

  const handleRemove = (r) => {
    const id = r._id || r.phone;
    const label = r.name && r.phone ? `${r.name} (${r.phone})` : r.phone || id;
    if (!window.confirm(`Xóa "${label}" khỏi danh sách? Người này sẽ có thể quét QR và nhận lì xì lại.`)) return;
    setDeletingId(id);
    removeRecipient(id)
      .then(() => load())
      .catch((e) => setError(e.message))
      .finally(() => setDeletingId(null));
  };

  if (loading && !data) {
    return (
      <div className="loading-wrap">
        <div className="loading-spinner" />
        <p>Đang tải thống kê...</p>
      </div>
    );
  }

  if (error) {
    return <div className="message-box error">{error}</div>;
  }

  const barData = {
    labels: data?.byDenomination?.map((d) => d.label) || [],
    datasets: [
      {
        label: 'Số lượng đã phát',
        data: data?.byDenomination?.map((d) => d.count) || [],
        backgroundColor: ['#c41e3a', '#d4a84b', '#2e7d32', '#1a5fb4', '#8b3d4a']
      }
    ]
  };

  const doughnutData = {
    labels: data?.byDenomination?.map((d) => d.label) || [],
    datasets: [
      {
        data: data?.byDenomination?.map((d) => d.total) || [],
        backgroundColor: ['#c41e3a', '#d4a84b', '#2e7d32', '#1a5fb4', '#8b3d4a'],
        borderWidth: 0
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    },
    scales: {
      y: { beginAtZero: true }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' }
    }
  };

  return (
    <motion.div
      className="dashboard-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <h1 className="admin-page-title">Dashboard thống kê</h1>
      {hasBackend() ? (
        <div className="message-box success admin-notice">
          <strong>✅ Đang dùng Backend:</strong> Danh sách đồng bộ từ server. Mọi thiết bị quét QR và nhận lì xì đều hiện tại đây.
        </div>
      ) : (
        <div className="message-box info admin-notice">
          <strong>📌 Chỉ dùng localStorage:</strong> Danh sách chỉ hiện người nhận trên <strong>cùng thiết bị</strong>. Để thấy danh sách từ mọi thiết bị, hãy bật Backend (xem README).
        </div>
      )}
      {data?.isLocked && (
        <div className="message-box info">Sự kiện đã được khóa. Không nhận thêm lì xì.</div>
      )}

      <div className="stats-cards">
        <div className="stat-card">
          <span className="stat-value">{data?.totalRecipients ?? 0}</span>
          <span className="stat-label">Tổng số người đã nhận</span>
        </div>
        <div className="stat-card highlight">
          <span className="stat-value">{(data?.totalMoney ?? 0).toLocaleString('vi-VN')}</span>
          <span className="stat-label">Số tiền đã phát (VNĐ)</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{data?.maxRecipients ?? 0}</span>
          <span className="stat-label">Số người tối đa</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{(data?.estimatedBudget ?? 0).toLocaleString('vi-VN')}</span>
          <span className="stat-label">Ngân sách dự kiến (VNĐ)</span>
        </div>
      </div>

      <div className="charts-row">
        <div className="chart-box">
          <h3>Số lượng từng mệnh giá đã phát</h3>
          <div className="chart-inner">
            <Bar data={barData} options={chartOptions} />
          </div>
        </div>
        <div className="chart-box">
          <h3>Tỉ lệ tiền đã phát theo mệnh giá</h3>
          <div className="chart-inner chart-doughnut">
            <Doughnut data={doughnutData} options={doughnutOptions} />
          </div>
        </div>
      </div>

      <div className="table-section">
        <h3>Chi tiết theo mệnh giá</h3>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Mệnh giá</th>
                <th>Số lượng</th>
                <th>Tổng tiền (VNĐ)</th>
              </tr>
            </thead>
            <tbody>
              {data?.byDenomination?.map((d, i) => (
                <tr key={i}>
                  <td>{d.label}</td>
                  <td>{d.count}</td>
                  <td>{d.total?.toLocaleString('vi-VN')}</td>
                </tr>
              ))}
              {(!data?.byDenomination || data.byDenomination.length === 0) && (
                <tr>
                  <td colSpan={3}>Chưa có dữ liệu</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="table-section">
        <h3>Danh sách người nhận (mới nhất)</h3>
        <p className="list-hint">Xóa người nhận → người đó có thể quét QR và nhận lì xì lại.</p>
        <div className="table-wrap list-table">
          <table>
            <thead>
              <tr>
                <th>Họ tên</th>
                <th>Số điện thoại</th>
                <th>Tuổi</th>
                <th>Mệnh giá</th>
                <th>Thời gian</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {list.slice(0, 50).map((r, i) => (
                <tr key={r._id || i}>
                  <td>{r.name}</td>
                  <td>{r.phone || '-'}</td>
                  <td>{r.age}</td>
                  <td>{r.denominationLabel}</td>
                  <td>{r.receivedAt ? new Date(r.receivedAt).toLocaleString('vi-VN') : '-'}</td>
                  <td>
                    <button
                      type="button"
                      className="btn-remove"
                      onClick={() => handleRemove(r)}
                      disabled={deletingId === (r._id || r.phone)}
                      title="Xóa khỏi danh sách để người này có thể quét lại"
                    >
                      {deletingId === (r._id || r.phone) ? '...' : 'Xóa'}
                    </button>
                  </td>
                </tr>
              ))}
              {list.length === 0 && (
                <tr>
                  <td colSpan={6}>Chưa có ai nhận</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
