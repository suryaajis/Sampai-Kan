# Sampai-Kan 🛵

**Sampai-Kan** adalah aplikasi food delivery online (mirip GoFood / ShopeeFood) berbasis **Express.js + EJS + Sequelize**. Customer memesan makanan dari berbagai **toko**, **merchant** mengelola toko & menu sendiri, dan **driver** menerima dan mengantar pesanan — semua dalam satu platform.

---

## ✨ Fitur Utama

### Untuk Customer
- Jelajah **toko** dan menu dengan filter **kategori** dan **pencarian**
- Halaman detail toko menampilkan seluruh menu satu merchant
- **Keranjang belanja** dengan batasan satu toko per pesanan (mirip GoFood)
- **Checkout** lengkap: alamat, nomor HP, catatan driver, metode pembayaran
- **Riwayat pesanan** dengan timeline status
- **Tracking pesanan**: pending → preparing → picked_up → delivering → delivered
- **Batalkan pesanan** (selama masih pending)
- **Profil** dengan update password aman
- Notifikasi email otomatis saat status berubah

### Untuk Merchant (pemilik toko) 🆕
- Registrasi otomatis membuat **toko baru** beserta akun pemilik
- **Dashboard** dengan statistik (pesanan menunggu, aktif, selesai)
- **Manajemen menu**: tambah, edit, hapus item beserta harga/stok/gambar
- **Manajemen pesanan**: konfirmasi atau tolak pesanan masuk
- **Pengaturan toko**: nama, deskripsi, logo, alamat, telepon, email, status buka/tutup
- **Profil merchant** dengan update password aman

### Untuk Driver
- Dashboard dengan pesanan **tersedia** (status `preparing`) dan **aktif**
- Info **toko pengambilan** lengkap dengan alamat & telepon
- Terima pesanan dengan 1-klik
- Timeline status pengantaran
- **Riwayat pengantaran** & statistik selesai
- Profil driver yang bisa diubah

### Teknologi
- Backend: **Express.js 4**, **Sequelize 6** (PostgreSQL / MySQL)
- View: **EJS** server-side templating
- Styling: **Tailwind CSS** (CDN) + **Font Awesome 6** + **Poppins**
- Auth: **express-session** + **bcryptjs**
- Flash messages: **connect-flash**
- Email: **nodemailer** (opsional, env-based)
- HTTP methods: **method-override** untuk PUT/DELETE

---

## 🚀 Menjalankan Aplikasi

### 1. Install dependencies
```bash
npm install
# Untuk MySQL, tambah driver:
npm install mysql2
```

### 2. Siapkan database
Edit `config/config.json` untuk menyesuaikan kredensial & dialect, lalu:
```bash
npm run db:setup
```
Perintah ini menjalankan `db:create` → `db:migrate` → `db:seed:all`.

> Jika sebelumnya sudah pernah migrasi, jalankan `npx sequelize-cli db:drop && npm run db:setup` agar struktur baru (Stores, Merchants, dst.) ikut terbuat.

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
├── app.js                       # Entry point Express
├── config/config.json           # Database config
├── controllers/
│   ├── mainController.js        # Landing page
│   ├── signController.js        # Register / Login / Logout (3 role)
│   ├── customerController.js    # Menu, toko, profil customer
│   ├── cartController.js        # Session cart (single-store)
│   ├── orderController.js       # Checkout, tracking, dashboard driver & merchant
│   ├── driverController.js      # Profil driver
│   └── merchantController.js    # Dashboard, items CRUD, store settings
├── models/
│   ├── customer.js / driver.js / merchant.js
│   ├── store.js / category.js / item.js
│   ├── order.js / orderItem.js
│   └── index.js
├── migrations/                  # Sequelize migrations (incl. Stores & Merchants)
├── seeders/                     # Seed: categories, stores, items, merchants
├── middlewares/                 # isLoginCustomer / Driver / Merchant
├── helpers/                     # formatPrice, formatDate, statusLabel
├── public/                      # CSS / JS / gambar statis
├── views/
│   ├── partials/                # header / footer / nav-customer / nav-driver / nav-merchant
│   ├── customers/               # listItems, stores, storeDetail, cart, checkout, orders…
│   ├── drivers/                 # dashboard, activeOrder, history, profile
│   └── merchants/               # dashboard, items, itemForm, orders, orderDetail, storeSettings, profile
└── nodemailer.js                # Pengirim email (env-based)
```

---

## 🔄 Status Pesanan

| Status | Pemicu | Aksi berikutnya |
|---|---|---|
| `pending` | Customer checkout | Merchant **konfirmasi** atau **tolak** |
| `preparing` | Merchant konfirmasi | Driver bisa terima |
| `picked_up` | Driver tandai sudah diambil | Driver mulai antar |
| `delivering` | Driver mulai antar | Driver tandai selesai |
| `delivered` | Driver selesai | — |
| `cancelled` | Customer batal / merchant tolak | — |

---

## 🔐 Akun Demo

Setelah `npm run db:setup`, beberapa akun **merchant** sudah siap:

| Toko | Email | Password |
|---|---|---|
| Warung Mama Sari | `sari@warungmamasari.id` | `password123` |
| Grill & BBQ Station | `budi@grillstation.id` | `password123` |
| Minum & Camilan | `rina@minumancamilan.id` | `password123` |

Untuk **customer** dan **driver**, daftarkan akun sendiri via `/register` (3 role tersedia: Customer / Driver / Merchant).

---

## 🎨 Desain

UI mengikuti gaya **GoFood** / **ShopeeFood**:
- Primary color: `#ee4d2d` (oranye)
- Brand green `#00aa13` untuk driver & elemen sukses
- Brand amber `#f7b733` untuk merchant
- Font: Poppins
- Full responsif mobile & desktop

---

Dibuat dengan ❤️ oleh Pair Project Team 1
