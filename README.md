# Sampai-Kan 🛵

**Sampai-Kan** adalah aplikasi food delivery online (mirip GoFood / ShopeeFood) berbasis **Express.js + EJS + PostgreSQL (Sequelize)**. Customer bisa memesan makanan/minuman, driver menerima dan mengantar pesanan, semua dalam satu platform.

---

## ✨ Fitur Utama

### Untuk Customer
- Jelajah menu dengan filter **kategori** dan **pencarian**
- **Keranjang belanja** (cart) dengan quantity
- **Checkout** lengkap: alamat, nomor HP, catatan driver, metode pembayaran
- **Riwayat pesanan** dengan timeline status
- **Tracking pesanan real-time**: pending → preparing → picked_up → delivering → delivered
- **Batalkan pesanan** (selama masih pending)
- **Profil** dengan update password aman
- Notifikasi email otomatis saat status berubah

### Untuk Driver
- Dashboard dengan pesanan **tersedia** dan **aktif**
- Terima pesanan dengan 1-klik
- Timeline status pengantaran
- **Riwayat pengantaran**
- Statistik selesai & rating
- Profil driver yang bisa diubah

### Teknologi
- Backend: **Express.js 4**, **Sequelize 6**, **PostgreSQL**
- View: **EJS** server-side templating
- Styling: **Tailwind CSS** (CDN) + **Font Awesome 6** + **Poppins**
- Auth: **express-session** + **bcryptjs**
- Flash messages: **connect-flash**
- Email: **nodemailer** (opsional)
- HTTP methods: **method-override** untuk PUT/DELETE

---

## 🚀 Menjalankan Aplikasi

### 1. Install dependencies
```bash
npm install
```

### 2. Siapkan database PostgreSQL
Edit `config/config.json` untuk menyesuaikan kredensial, lalu:
```bash
npm run db:setup
```

### 3. Setup env (opsional, untuk session & email)
```bash
cp .env.example .env
# edit nilai SESSION_SECRET, MAIL_USER, MAIL_PASS bila perlu
```

### 4. Jalankan
```bash
npm run dev     # development (nodemon)
npm start       # production
```

Buka `http://localhost:3000`

---

## 🗂 Struktur

```
.
├── app.js                    # Entry point Express
├── config/config.json        # Database config
├── controllers/
│   ├── mainController.js     # Landing page
│   ├── signController.js     # Register / Login / Logout
│   ├── customerController.js # Menu, profil customer
│   ├── cartController.js     # Session cart
│   ├── orderController.js    # Checkout, order tracking, driver dashboard
│   └── driverController.js   # Profil driver
├── models/
│   ├── customer.js / driver.js / category.js / item.js
│   ├── order.js / orderItem.js
│   └── index.js
├── migrations/               # Sequelize migrations
├── seeders/                  # Seed data (kategori & item)
├── middlewares/              # Auth middleware
├── helpers/                  # formatPrice, formatDate, statusLabel
├── public/                   # CSS / JS / gambar statis
├── views/                    # Template EJS (Tailwind-based)
│   ├── partials/             # header / footer / navbar / flash
│   ├── customers/            # cart, checkout, orders, orderDetail, dll.
│   └── drivers/              # dashboard, activeOrder, history, profile
└── nodemailer.js             # Pengirim email (env-based)
```

---

## 🔐 Akun Demo

Setelah seed, daftarkan akun sendiri via `/register`, bisa pilih role:
- **Customer** → untuk memesan makanan
- **Driver** → untuk menerima & mengantar pesanan

---

## 🎨 Desain

UI mengikuti gaya **GoFood** / **ShopeeFood**:
- Primary color: `#ee4d2d` (oranye)
- Brand green: `#00aa13` untuk driver & elemen sukses
- Font: Poppins
- Full responsif mobile & desktop

---

Dibuat dengan ❤️ oleh Pair Project Team 1
