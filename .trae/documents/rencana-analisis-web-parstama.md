# Rencana Analisis dan Peningkatan Web PARSTAMA

## Summary

Rencana ini disusun untuk menganalisis website `parstama.my.id` dan basis kodenya tanpa mengubah file aplikasi pada fase ini. Fokus analisis dan rekomendasi diarahkan ke lima area: kualitas UI/UX, performa rendering, aksesibilitas, SEO teknis, dan kelayakan pengembangan fitur agar website terlihat lebih modern, lebih kredibel, dan lebih mudah dikembangkan. Implementasi, edit kode, dan perubahan sistem hanya boleh dimulai setelah ada persetujuan eksplisit dari pemilik proyek.

Temuan awal menunjukkan bahwa identitas visual sudah kuat dan fitur inti sudah cukup lengkap, tetapi ada beberapa titik yang paling perlu diprioritaskan pada implementasi nanti:

- beranda masih terlalu bergantung pada client rendering
- strategi gambar belum konsisten
- sinyal indexability antara `robots.ts` dan `sitemap.ts` saling bertabrakan
- structured data baru kuat di halaman artikel, belum ada fondasi entity dan breadcrumb yang rapi
- beberapa halaman publik masih perlu penguatan trust, konten, dan polish aksesibilitas

## Current State Analysis

### Produk dan struktur umum

- Proyek menggunakan `Next.js 16`, `React 19`, `Tailwind 4`, `Prisma`, dan `next-auth` berdasarkan `package.json`.
- URL produksi yang menjadi target audit adalah `https://parstama.my.id`.
- Struktur aplikasi menggunakan App Router di `src/app` dengan area publik seperti `page.tsx`, `daftar`, `blog`, `events`, `faq`, `sejarah`, `struktur-organisasi`, serta area admin dan API.

### Kondisi UI/UX yang sudah baik

- Landing page memiliki branding yang konsisten, hirarki konten yang jelas, CTA utama yang terlihat, dan nuansa visual yang modern.
- Fitur inti situs sudah lebih dari sekadar company profile: ada pendaftaran multi-step, blog, event, struktur organisasi, dan AI assistant.
- Halaman pendaftaran dan landing page sudah menunjukkan niat desain yang kuat, sehingga pendekatan yang tepat nanti adalah perbaikan terarah, bukan desain ulang total.

### Temuan performa dan rendering

- `src/app/page.tsx` hanya merender `LandingClient`, sedangkan `src/components/landing/LandingClient.tsx` adalah komponen client penuh.
- Konten artikel terbaru di beranda dimuat lewat `fetch("/api/articles?limit=5")` di sisi client, sehingga teaser konten tidak muncul di HTML awal.
- Landing page memuat beberapa elemen animasi sekaligus, termasuk `Preloader`, `ShapeGrid`, `Carousel`, dan `LogoLoop`, yang berpotensi menambah beban rendering terutama di perangkat mobile.
- Temuan ini selaras dengan panduan Next.js App Router bahwa konten statis dan data fetching sebaiknya diprioritaskan di server, sedangkan client component dipakai untuk interaksi yang memang perlu.

### Temuan image strategy

- Ditemukan banyak penggunaan `unoptimized` dan elemen `<img>` biasa di beberapa file publik, termasuk `src/components/landing/LandingClient.tsx`, `src/app/blog/[slug]/page.tsx`, `src/app/blog/BlogClient.tsx`, `src/app/cek-status/page.tsx`, dan `src/app/daftar/page.tsx`.
- Sementara itu, `next.config.ts` sudah memiliki `images.remotePatterns`, artinya fondasi image optimization sebenarnya sudah tersedia.
- Kondisi ini menunjukkan strategi optimasi gambar belum dibakukan per kasus.

### Temuan SEO teknis

- `src/app/robots.ts` memblokir `/login` dan `/cek-status`.
- `src/app/sitemap.ts` justru masih memasukkan `/login` dan `/cek-status` ke sitemap publik.
- `src/app/sitemap.ts` juga masih bersifat statis dan belum memasukkan artikel detail yang sebenarnya tersedia lewat route dinamis blog.
- Blog detail di `src/app/blog/[slug]/page.tsx` sudah memiliki `Article` JSON-LD, tetapi belum terlihat fondasi `Organization` untuk homepage/halaman organisasi dan belum ada `BreadcrumbList` untuk navigasi konten.
- Dari referensi Google Search Central, sitemap sebaiknya hanya memuat URL yang memang ingin diindeks, sedangkan breadcrumb dan structured data entity membantu pemahaman struktur situs oleh mesin pencari.

### Temuan data correctness dan observability

- Pada alur blog, metadata dan pengambilan artikel perlu ditinjau karena ada risiko endpoint baca artikel memiliki side effect pada `viewCount`.
- Jika metadata generation atau proses crawl ikut memanggil endpoint yang mengubah data, angka view bisa terinflasi dan menjadi tidak akurat.

### Temuan aksesibilitas dan trust

- Banyak elemen visual mengandalkan animasi, hover, dan kontras abu-abu tipis di latar gelap, sehingga perlu divalidasi ulang untuk keyboard navigation, reduced motion, dan readability.
- Data statistik di landing masih tampak statis dan perlu diputuskan apakah akan dipertahankan sebagai angka editorial atau dihubungkan ke data nyata.
- Blog publik masih butuh penguatan konten agar kanal SEO dan trust pengguna benar-benar hidup.

## Proposed Changes

### 1. Sinkronkan indexability dan sitemap

#### File

- `src/app/robots.ts`
- `src/app/sitemap.ts`
- `src/app/login/layout.tsx`
- `src/app/cek-status/layout.tsx`

#### What

- Menetapkan kebijakan indexability final untuk route publik dan non-publik.
- Mengeluarkan URL non-indexable dari sitemap.
- Menambahkan route dinamis yang memang layak diindeks ke sitemap, terutama artikel blog.

#### Why

- Saat ini sinyal SEO bertabrakan: sebuah URL bisa diblok dari crawl tetapi tetap diumumkan di sitemap.
- Sitemap yang bersih akan membantu fokus crawl pada halaman yang benar-benar ingin ditumbuhkan secara organik.

#### How

- Pastikan `/login` dan `/cek-status` diperlakukan konsisten sebagai halaman non-indexable.
- Hapus URL non-indexable dari `sitemap.ts`.
- Tambahkan URL artikel blog, dan bila relevan event publik, ke sitemap dinamis.
- Tinjau kembali apakah `robots.ts` cukup untuk kontrol crawl, atau perlu penegasan lewat metadata route-level yang sudah ada.

### 2. Ubah beranda menjadi server-first dengan client islands yang kecil

#### File

- `src/app/page.tsx`
- `src/components/landing/LandingClient.tsx`
- `src/components/landing/Preloader.tsx`
- `src/components/landing/ShapeGrid.tsx`
- `src/components/ui/Carousel.tsx`
- `src/components/landing/FluidMenu.tsx`

#### What

- Memecah landing page agar bagian yang statis dan SEO-critical dirender di server.
- Menyisakan client component hanya pada elemen interaktif yang benar-benar perlu.

#### Why

- HTML awal akan lebih kaya konten, LCP berpotensi membaik, dan beban hydration berkurang.
- Desain modern tetap bisa dipertahankan tanpa membuat seluruh landing page bergantung pada JavaScript.

#### How

- Pindahkan hero, stats, persyaratan, CTA, dan footer ke server component atau struktur yang tidak memerlukan state client.
- Ubah teaser artikel terbaru agar dimuat lewat server-side data fetching, bukan `useEffect` di browser.
- Batasi animasi berat seperti preloader dan background canvas agar tidak selalu aktif di semua perangkat.
- Terapkan strategi graceful degradation untuk perangkat lemah dan mode reduced motion.

### 3. Standarkan image pipeline

#### File

- `next.config.ts`
- `src/components/landing/LandingClient.tsx`
- `src/app/blog/BlogClient.tsx`
- `src/app/blog/[slug]/page.tsx`
- `src/app/cek-status/page.tsx`
- `src/app/daftar/page.tsx`
- `src/app/struktur-organisasi/page.tsx`

#### What

- Menentukan aturan baku kapan memakai `next/image`, kapan `unoptimized`, dan kapan `<img>` biasa masih dibenarkan.

#### Why

- Optimasi gambar yang konsisten akan membantu LCP, CLS, ukuran transfer, dan maintainability.
- Saat ini pipeline gambar campur aduk walau konfigurasi Next Image sudah tersedia.

#### How

- Gunakan `next/image` sebagai default untuk logo, cover artikel, dan gambar visual utama.
- Sisakan `unoptimized` hanya untuk kasus yang memang valid, misalnya SVG tertentu atau aset yang tidak cocok diproses optimizer.
- Audit seluruh sumber gambar terhadap `remotePatterns`.
- Tentukan fallback image untuk kartu artikel dan Open Graph bila gambar tidak tersedia.

### 4. Rapikan metadata dan structured data

#### File

- `src/app/layout.tsx`
- `src/app/page.tsx`
- `src/app/blog/page.tsx`
- `src/app/blog/[slug]/page.tsx`
- `src/app/blog/[slug]/layout.tsx`

#### What

- Menambahkan fondasi `Organization` JSON-LD pada halaman yang tepat.
- Menambahkan `BreadcrumbList` pada halaman artikel.
- Menyamakan sumber metadata dengan sumber render konten agar tidak ada side effect.

#### Why

- Structured data saat ini baru kuat pada level artikel.
- Situs organisasi membutuhkan penegasan entity dan hierarki supaya lebih mudah dipahami crawler dan lebih kuat secara SEO semantik.

#### How

- Tempatkan `Organization` JSON-LD di homepage atau halaman organisasi, bukan disebar ke semua halaman tanpa konteks.
- Tambahkan breadcrumb visual dan/atau `BreadcrumbList` JSON-LD untuk artikel blog.
- Pastikan generator metadata blog mengambil data tanpa memicu perubahan state seperti increment view count.

### 5. Pisahkan pembacaan artikel dari mutasi view count

#### File

- `src/app/blog/[slug]/layout.tsx`
- `src/app/api/articles/[slug]/route.ts`
- bila diperlukan: util atau service baru di `src/lib/`

#### What

- Memisahkan read path dan mutation path untuk data artikel.

#### Why

- View count harus mencerminkan pembacaan yang lebih akurat, bukan hasil crawl, prefetch, metadata generation, atau request otomatis lain.

#### How

- Pastikan metadata dan page content menggunakan jalur pembacaan murni.
- Jika ingin tetap menghitung view, lakukan lewat mekanisme yang eksplisit dan aman dari crawl side effect.
- Tinjau kembali apakah perlu deduplikasi berdasarkan sesi, throttle, atau strategi lain.

### 6. Tingkatkan aksesibilitas dan kenyamanan interaksi

#### File

- `src/app/layout.tsx`
- `src/components/landing/LandingClient.tsx`
- `src/components/landing/Preloader.tsx`
- `src/components/landing/ShapeGrid.tsx`
- `src/components/ui/LogoLoop.tsx`
- `src/app/daftar/page.tsx`
- `src/app/cek-status/page.tsx`

#### What

- Menambahkan standar reduced motion, focus states, skip link, dan validasi kontras.

#### Why

- Website yang tampak modern belum tentu nyaman dipakai semua pengguna.
- Banyak animasi dan elemen visual saat ini perlu diuji ulang agar tidak mengganggu usability.

#### How

- Tambahkan `prefers-reduced-motion` policy yang konsisten.
- Pastikan seluruh CTA, menu, form, dan komponen chat bisa dioperasikan dengan keyboard.
- Audit kontras teks sekunder di atas latar gelap.
- Evaluasi apakah preloader dan animasi dekoratif benar-benar memberi nilai atau justru menghambat.

### 7. Perkuat trust dan strategi konten

#### File

- `src/components/landing/LandingClient.tsx`
- `src/app/blog/page.tsx`
- `src/app/blog/[slug]/page.tsx`
- `src/app/faq/page.tsx`
- bila diperlukan: route atau schema konten terkait blog/event/admin

#### What

- Menambahkan elemen trust yang lebih konkret dan menyiapkan arah pengayaan konten.

#### Why

- Situs sudah punya fitur, tetapi trust publik akan lebih kuat bila angka, konten, dan bukti aktivitas lebih terhubung.
- Blog yang aktif akan sangat membantu SEO, branding, dan kredibilitas.

#### How

- Tentukan apakah statistik beranda akan tetap statis atau ditarik dari data nyata.
- Siapkan daftar konten evergreen untuk blog, misalnya profil organisasi, panduan P3K, manfaat bergabung, dan dokumentasi kegiatan.
- Hubungkan blog, FAQ, form pendaftaran, dan struktur organisasi lewat internal linking yang lebih jelas.

## Assumptions & Decisions

- Analisis utama akan berfokus pada URL produksi `https://parstama.my.id`, dengan repo saat ini sebagai sumber validasi implementasi.
- Fase ini tidak mengubah kode aplikasi apa pun selain dokumen rencana.
- Tidak ada perubahan kode yang boleh dilakukan sebelum persetujuan pengguna diberikan secara eksplisit.
- Saran modernisasi tidak akan diarahkan ke redesign total, melainkan ke peningkatan bertahap agar tampilan tetap konsisten dengan identitas visual yang sudah ada.
- Halaman seperti `/login` dan `/cek-status` diasumsikan bukan target SEO utama.
- `Organization` JSON-LD akan ditempatkan secara kontekstual di homepage atau halaman organisasi, bukan di semua halaman.
- Perbaikan performa akan diprioritaskan tanpa mengorbankan CTA utama dan kejelasan alur pendaftaran.

## Verification steps

Langkah verifikasi berikut disiapkan untuk fase eksekusi nanti, bukan dijalankan sekarang:

1. Validasi HTML awal dan boundary client/server pada beranda setelah refactor.
2. Jalankan audit Lighthouse mobile dan desktop untuk halaman:
   - `/`
   - `/daftar`
   - `/blog`
   - satu contoh `/blog/[slug]`
3. Jalankan audit aksesibilitas untuk keyboard navigation, reduced motion, focus state, dan kontras.
4. Validasi `robots.txt`, `sitemap.xml`, canonical, dan status indexability seluruh route publik utama.
5. Uji Rich Results / structured data untuk:
   - homepage atau halaman organisasi
   - halaman artikel blog
6. Verifikasi bahwa halaman non-indexable tidak lagi muncul di sitemap.
7. Verifikasi bahwa artikel detail muncul di sitemap bila memang ditargetkan untuk SEO.
8. Verifikasi bahwa pembacaan metadata tidak lagi mengubah `viewCount`.
9. Verifikasi gambar utama memakai strategi optimasi yang konsisten dan tidak menghasilkan layout shift yang tidak perlu.
10. Tinjau kembali hasil akhir secara visual pada mobile dan desktop agar peningkatan teknis tetap menjaga nuansa desain PARSTAMA.
