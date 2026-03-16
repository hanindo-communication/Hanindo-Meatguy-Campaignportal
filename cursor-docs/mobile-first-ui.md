# Mobile-first UI — Meatguy Landing

## Note

**~90% pengunjung buka halaman ini dari hape.**  

Maka UI harus **fokus untuk mobile (HP)** dulu:

- Design dan layout dioptimalkan untuk layar kecil dulu, baru di-scale/expand untuk desktop.
- Touch targets cukup besar (min ~44px), jarak antar elemen nyaman untuk tap.
- Teks readable tanpa zoom (font size, line-height, kontras).
- Hero, CTA, dan konten penting above-the-fold enak di HP; hindari elemen yang hanya berguna di desktop.
- Gambar/background tetap performa (resolusi sesuai, lazy load jika perlu) agar load cepat di mobile.
- Section awards, header, dan background tetap rapi di viewport sempit; hindari horizontal scroll.

Implementasi: CSS mobile-first (base style untuk mobile, lalu `min-width` media query untuk tablet/desktop), viewport meta sudah ada.
