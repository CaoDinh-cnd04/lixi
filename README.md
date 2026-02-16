# 🧧 Lì Xì Online - Web lì xì sự kiện

Có **hai chế độ**:
- **Chỉ Frontend (localStorage):** Không cần server, dữ liệu lưu trên từng thiết bị. Admin chỉ thấy danh sách người nhận trên cùng thiết bị.
- **Frontend + Backend (MongoDB):** Dữ liệu lưu trên server → **Admin thấy danh sách từ mọi thiết bị** (điện thoại quét QR, máy tính mở Admin đều đồng bộ).

## 📁 Cấu trúc thư mục

```
web lixi/
├── frontend/                # React (Vite)
│   ├── public/images/       # Ảnh tiền (1000.png, 20000.png, ...)
│   └── src/...
├── backend/                 # Node.js + Express + MongoDB (tùy chọn)
│   ├── src/
│   │   ├── models/         # Config, Recipient
│   │   ├── routes/         # config, receive, stats, admin, qr
│   │   └── server.js
│   └── .env
└── README.md
```

## 🚀 Chạy local

### Cách 1: Chỉ Frontend (không backend)

```bash
cd frontend
npm install
npm run dev
```

Mở **http://localhost:5173**. Dữ liệu lưu localStorage; Admin chỉ thấy danh sách trên cùng thiết bị.

### Cách 2: Frontend + Backend (để Admin thấy danh sách từ mọi thiết bị)

**Bước 1 – Backend**

```bash
cd backend
cp .env.example .env
```

Sửa **.env**: đặt `MONGODB_URI` (vd: `mongodb://localhost:27017/lixi-online` hoặc dùng MongoDB Atlas) và `ADMIN_SECRET` (mã admin để đăng nhập). **Hướng dẫn chi tiết dùng MongoDB trên web (Atlas):** xem [HUONG-DAN-MONGODB-ATLAS.md](./HUONG-DAN-MONGODB-ATLAS.md).

```bash
npm install
npm run dev
```

**Bước 2 – Frontend**

Tạo file **frontend/.env** (hoặc .env.local):

```
VITE_API_URL=http://localhost:5000
```

```bash
cd frontend
npm install
npm run dev
```

**Bước 3 – Đăng nhập Admin**

Vào **http://localhost:5173/admin** → nhập **mã admin** trùng với `ADMIN_SECRET` trong backend/.env → vào Dashboard/Cấu hình/Mã QR. Mọi thiết bị quét QR và nhận lì xì sẽ được lưu trên server và hiện trong danh sách Admin.

### Cách dùng

1. **Cấu hình:** Admin → Cấu hình (số người, mệnh giá, tỉ lệ %, thời gian sự kiện).
2. **Nhận lì xì:** Người dùng quét QR hoặc mở /nhan-lixi → điền thông tin → Mở bao lì xì.
3. **Thống kê:** Admin → Dashboard (khi dùng backend: danh sách đồng bộ từ mọi thiết bị).

---

## 📦 Deploy (Production)

### Deploy chỉ Frontend (không backend)

1. Build:
   ```bash
   cd frontend
   npm run build
   ```

3. Không cần biến môi trường, không cần database. Mỗi lần truy cập từ cùng domain sẽ dùng chung localStorage (lưu ý: nếu mở từ domain/thiết bị khác thì dữ liệu riêng).

#### Deploy lên GitHub Pages (tự động)

1. Đẩy code lên GitHub (repo **project site**, ví dụ tên repo: `web-lixi`).
2. Trong repo: **Settings → Pages** → **Source** chọn **GitHub Actions**.
3. Mỗi lần push lên nhánh `main` (hoặc `master`), workflow **Deploy to GitHub Pages** sẽ build frontend và deploy.
4. Trang sẽ có dạng: `https://<username>.github.io/<tên-repo>/` (vd: `https://username.github.io/web-lixi/`).
5. Chế độ này chỉ deploy **frontend** (localStorage), không có backend. Để dùng backend từ mọi thiết bị, deploy backend riêng (Railway, Render...) rồi build frontend với `VITE_API_URL=https://your-backend.com` và deploy frontend lên Vercel/Netlify hoặc tạo workflow build với env `VITE_API_URL` rồi deploy.

### Deploy Frontend + Backend (danh sách từ mọi thiết bị)

1. Deploy backend (Railway, Render, VPS...) với MongoDB (Atlas hoặc self-hosted). Set biến: `MONGODB_URI`, `ADMIN_SECRET`, `FRONTEND_URL` (URL frontend), `PORT`.
2. Build frontend với `VITE_API_URL=https://your-backend-url.com` (URL backend đã deploy).
3. Deploy thư mục **frontend/dist** lên Vercel/Netlify/...
4. Admin đăng nhập bằng mã trùng `ADMIN_SECRET`; danh sách người quét QR từ mọi thiết bị hiện trong Dashboard.

---

## 🔒 Bảo mật

- **Validate**: Họ tên (≥2 ký tự), tuổi (1–120), SĐT (9–11 số). Chống trùng SĐT, (tên + SĐT), (tên + tuổi), 1 IP 1 lần.
- **Admin**: Chỉ vào được /admin khi nhập đúng mã (localStorage khi không backend; trùng ADMIN_SECRET khi có backend).
- **Backend**: SĐT/IP lưu dạng hash; rate limit API.

---

## 📌 Tính năng chính

| Tính năng | Mô tả |
|----------|--------|
| Admin Panel | Cấu hình số người tối đa, mệnh giá, tỉ lệ % (tổng 100%), ngân sách dự kiến, thời gian sự kiện, khóa/mở khóa. Không cần đăng nhập. |
| QR Code | Mã QR tạo ngay trên web → link trang nhận lì xì (cùng URL với web đang chạy). |
| Trang nhận | Form họ tên, tuổi, SĐT; validate; chống trùng SĐT và (tên + tuổi) trên cùng thiết bị. |
| Random | Random mệnh giá theo tỉ lệ đã cấu hình; tự khóa khi đủ số người hoặc hết thời gian. |
| Dashboard | Tổng người nhận, tổng tiền đã phát, thống kê từng mệnh giá, biểu đồ (Chart.js). |
| UI/UX | Animation mở bao lì xì, âm thanh, confetti mệnh giá lớn, dark/light mode, đếm ngược, responsive. |

---

## 📄 License

MIT.
