const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    console.error('');
    console.error('Cách xử lý:');
    console.error('1. Cài MongoDB và chạy service (localhost:27017), hoặc');
    console.error('2. Dùng MongoDB Atlas (miễn phí): tạo cluster tại https://cloud.mongodb.com');
    console.error('   rồi đặt MONGODB_URI trong file .env (vd: mongodb+srv://user:pass@cluster.xxx.mongodb.net/lixi-online)');
    process.exit(1);
  }
};

module.exports = connectDB;
