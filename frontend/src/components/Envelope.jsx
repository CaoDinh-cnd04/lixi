import React from 'react';
import { motion } from 'framer-motion';
import './Envelope.css';

export default function Envelope({ open, amount, label }) {
  return (
    <motion.div
      className={`envelope ${open ? 'envelope--open' : ''}`}
      animate={open ? { scale: [1, 1.05, 1], rotate: [0, -2, 0] } : {}}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <div className="envelope__body">
        <div className="envelope__flap" />
        <div className="envelope__mouth" />
        {open && amount != null && (
          <motion.div
            className="envelope__content"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            <span className="envelope__amount">{amount?.toLocaleString('vi-VN')}</span>
            <span className="envelope__label">{label || 'VNĐ'}</span>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
