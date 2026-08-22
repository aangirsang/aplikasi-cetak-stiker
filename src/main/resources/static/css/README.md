# Struktur CSS Responsive

Paket ini memecah CSS gabungan menjadi beberapa file tanpa menghilangkan aturan utama yang sudah ada.

## Cara pakai

HTML cukup memanggil satu file:

```html
<link rel="stylesheet" href="/css/app.css">
```

Urutan `@import` di `app.css` adalah:

1. base / variables / global
2. components
3. layout
4. auth
5. popup
6. page
7. responsive

## Breakpoint

- Desktop: > 1200px
- Tablet / laptop kecil: 651px - 1200px
- Mobile: <= 650px
- Mobile kecil: <= 450px

## Catatan

Aturan responsive lama dari bagian `data-stiker.css` dipindahkan ke `responsive/tablet.css` dan `responsive/mobile.css` supaya tidak terjadi duplikasi breakpoint.

Untuk mobile, sidebar desktop disembunyikan dan layout utama menjadi satu kolom. Popup dan grid form juga turun menjadi satu/dua kolom sesuai lebar layar.
