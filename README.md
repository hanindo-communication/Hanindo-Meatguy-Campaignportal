# Meatguy Steakhouse — Landing Page

One-pager untuk mengarahkan traffic dari iklan video ke **WhatsApp** (reservasi / inquiry). Premium, immersive, satu CTA jelas.

## Isi project

- **`site/[yyyymm]/[slug]/`** — Satu folder per landing (mis. `site/202604/passion-meets-perfection/` berisi `index.html`, `content.json`, `assets/`, opsional `meta.json`). Folder bernama `site` (bukan `public`) agar Vercel tidak melayankan HTML lewat CDN di luar Express — password portal tetap berlaku.
- **`server/`** — Server Node (Express): password portal, dashboard, API daftar landing.
- **`PROJECT_SPEC.md`** — Brief dan syarat project.

## Cara pakai

1. **Lokal:** `npm install` lalu **`npm start`** → **http://localhost:3788**. Form login ada di **`/`** (root); setelah masuk, **`/`** menampilkan direktori semua landing (grid + pratinjau). Kirim password lewat **`POST /session`**. Password default dev: `admin123` kecuali `PORTAL_PASSWORD` di `.env`. Landing utama: **http://localhost:3788/202604/passion-meets-perfection**. URL lama `/login` dan `/dashboard` dialihkan ke **`/`**. Salin [`.env.example`](.env.example) ke `.env` dan set `SESSION_SECRET` untuk produksi.
2. **Deploy:** Host Node (PM2, VPS, dll.): set env `SESSION_SECRET` dan `PORTAL_PASSWORD`, jalankan `node server/index.js`. **Vercel:** entry [`index.js`](index.js) (mengekspor Express) + [`vercel.json`](vercel.json) (`includeFiles: site/**`). Di dashboard Vercel set **Environment Variables** `SESSION_SECRET` (≥16 karakter) dan `PORTAL_PASSWORD`, lalu deploy ulang.

## Ganti workspace ke project ini

Di Cursor: **File → Open Folder** → pilih folder `meatguy-landing`. Workspace aktif jadi Meatguy Steakhouse.

## WhatsApp CTA

Link: `https://wa.me/628119628008` — sudah dipakai di hero dan di section CTA bawah.
