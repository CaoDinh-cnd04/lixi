const authAdmin = (req, res, next) => {
  const key = req.headers['x-admin-key'] || req.query.adminKey;
  if (!key || key !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ success: false, message: 'Mã admin không đúng' });
  }
  next();
};

module.exports = { authAdmin };
