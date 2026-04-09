# Meatguy Steakhouse — Landing Page

One-pager untuk mengarahkan traffic dari iklan video ke **WhatsApp** (reservasi / inquiry). Premium, immersive, satu CTA jelas.

## Isi project

- **`site/[yyyymm]/[slug]/`** — Satu folder per landing (mis. `site/202604/passion-meets-perfection/` berisi `index.html`, `content.json`, `assets/`, opsional `meta.json`). Folder `site` dilayani lewat Express setelah auth portal.
- **`server/`** — Server Node (Express): password portal, dashboard, API daftar landing.
- **`PROJECT_SPEC.md`** — Brief dan syarat project.

## Cara pakai

1. **Lokal:** `npm install` lalu **`npm start`** → **http://localhost:3788**. Form login ada di **`/`** (root); **setelah login sukses selalu ke dashboard** (grid semua landing); parameter `?next=` hanya dipakai saat redirect balik ke form jika password salah, bukan untuk langsung membuka satu landing. Kirim password lewat **`POST /session`**. Password default dev: `admin123` kecuali `PORTAL_PASSWORD` di `.env`. Landing utama: **http://localhost:3788/202604/passion-meets-perfection**. URL lama `/login` dan `/dashboard` dialihkan ke **`/`**. Salin [`.env.example`](.env.example) ke `.env` dan set `SESSION_SECRET` untuk produksi.
2. **Deploy (VPS / Railway / PM2, dll.):** set env `SESSION_SECRET` dan `PORTAL_PASSWORD`, jalankan `node server/index.js` (atau `npm start`).

## Deploy ke Vercel

Proyek ini **bukan** static site murni: Vercel harus menjalankan **Express lewat serverless function**. Repo sudah menyertakan **`vercel.json`** (rewrite semua path ke **`/api`**) dan **`api/index.js`** (mengekspor app dari `server/index.js`).

**Di dashboard Vercel (Project → Settings):**

- **Framework Preset:** Other  
- **Build Command:** _kosongkan_ (tidak ada step build)  
- **Output Directory:** _kosongkan_  
- **Install Command:** `npm install` (default)

**Environment Variables (wajib di Vercel):**

| Name | Keterangan |
|------|------------|
| `SESSION_SECRET` | String acak **minimal 16 karakter**. Wajib: di Vercel variabel `VERCEL=1` membuat app memperlakukan cookie seperti production; tanpa secret, **login (POST `/session`)** akan gagal sampai env ini disetel (sekarang ada halaman **503** penjelasan, bukan Internal Server Error polos). |
| `PORTAL_PASSWORD` | Password portal (jangan pakai default `admin123` di production). |

Setelah menambah env di **Settings → Environment Variables**, lakukan **Redeploy** agar nilai terbaca oleh function.

**Batasan:** fungsi serverless punya limit ukuran & durasi; aset sangat besar (mis. video berat di `site/…/assets/`) bisa mendekati limit atau memperlambat cold start. Kalau perlu, taruh video di CDN/object storage dan rujuk dari HTML.

## Ganti workspace ke project ini

Di Cursor: **File → Open Folder** → pilih folder `meatguy-landing`. Workspace aktif jadi Meatguy Steakhouse.

## WhatsApp CTA

Link: `https://wa.me/628119628008` — sudah dipakai di hero dan di section CTA bawah.
