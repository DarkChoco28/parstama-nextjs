import { NextRequest, NextResponse } from "next/server"

interface KnowledgeEntry {
  patterns: string[]
  exclude?: string[]
  response: string
}

const knowledgeBase: KnowledgeEntry[] = [
  // ═══════════════════════════════════════
  //  PENDAFTARAN PMR
  // ═══════════════════════════════════════
  {
    patterns: ["cara daftar", "gimana cara daftar", "bagaimana cara daftar", "mau daftar", "ingin daftar", "daftar pmr", "pendaftaran pmr", "form pendaftaran", "formulir pendaftaran", "gabung pmr", "join pmr", "masuk pmr"],
    response: "Untuk mendaftar PMR PARSTAMA:\n\n1️⃣ Buka halaman utama, klik **\"Daftar Sekarang\"**\n2️⃣ Isi **Data Diri** — nama, jenis kelamin, tempat/tanggal lahir, agama\n3️⃣ Isi **Kontak & Sekolah** — alamat, WhatsApp, email, kelas, jurusan\n4️⃣ Isi **Motivasi** — riwayat organisasi & motivasi bergabung\n5️⃣ **Konfirmasi** — centang persetujuan orang tua, kirim\n\nSemua online, gratis, dan simpel! 📱",
  },
  {
    patterns: ["syarat daftar", "persyaratan", "ketentuan daftar", "apa saja syarat", "syarat pendaftaran", "ketentuan pendaftaran"],
    response: "Syarat daftar PMR PARSTAMA:\n\n✅ Siswa aktif **SMKN 1 Singosari**\n✅ Punya semangat kepedulian & jiwa sukarela\n✅ Bersedia ikut seluruh rangkaian seleksi\n✅ Mendapat **izin orang tua/wali**\n✅ Punya minat dan tujuan yang jelas\n\nKalau sudah cocok, langsung daftar! 💪",
  },
  {
    patterns: ["biaya daftar", "berapa biaya", "daftar berapa", "bayar daftar", "uang pendaftaran", "gratis atau tidak", "dipungut biaya", "mahal ga", "mahal gak", "bayar ga", "bayar gak"],
    response: "Pendaftaran PMR PARSTAMA **GRATIS** alias tidak dipungut biaya apapun! 🎉\n\nYang perlu disiapkan:\n• Data diri lengkap\n• Nomor WhatsApp aktif\n• Izin orang tua\n\nHati-hati kalau ada yang minta bayaran — itu bukan panitia kami!",
  },
  {
    patterns: ["cek status", "status daftar", "status pendaftaran", "hasil daftar", "sudah daftar", "uda daftar", "sudah mendaftar", "uda mendaftar"],
    response: "Untuk cek status pendaftaran:\n\n1️⃣ Hubungi panitia via **WhatsApp: 0814-5914-5800**\n2️⃣ Sebutkan **nama lengkap** & **nomor WhatsApp** yang dipakai daftar\n\nStatus:\n🟡 **Pending** — masih diproses\n🟢 **Diterima** — selamat! 🎉\n🔴 **Ditolak** — coba lagi tahun depan",
  },
  {
    patterns: ["diterima", "ditolak", "pending", "status pending", "status diterima", "status ditolak"],
    response: "Penjelasan status pendaftaran:\n\n🟡 **Pending** — pendaftaranmu sedang diverifikasi oleh panitia. Sabar ya!\n🟢 **Diterima** — kamu diterima di PMR PARSTAMA! 🎉\n🔴 **Ditolak** — belum beruntung, bisa coba lagi tahun depan\n\nUntuk info lebih lanjut, hubungi panitia: **WA 0814-5914-5800**",
  },
  {
    patterns: ["timeline", "jadwal daftar", "kapan daftar", "kapan dibuka", "waktu pendaftaran", "seleksi", "pengumuman", "jadwal seleksi"],
    response: "Timeline PMR PARSTAMA:\n\n📅 **Pendaftaran** — dibuka setiap tahun ajaran baru\n📅 **Seleksi** — tes tertulis + wawancara\n📅 **Pengumuman** — via WhatsApp & website\n📅 **Pelatihan** — dimulai setelah pengumuman\n\nPantau terus website ini untuk info terbaru! 📢",
  },
  {
    patterns: ["kontak panitia", "hubungi panitia", "nomor wa panitia", "no hp panitia", "whatsapp panitia", "nomor telepon panitia", "kontak pmr"],
    response: "Kontak panitia PMR PARSTAMA:\n\n📱 **WhatsApp**: 0814-5914-5800\n🏫 **Sekolah**: SMKN 1 Singosari\n\nJam aktif: **Senin–Jumat, 08.00–16.00 WIB**\n\nLangsung chat aja, fast respon! 😊",
  },
  {
    patterns: ["tentang pmr", "apa itu pmr", "pmr parstama", "pmr itu apa", "kenapa pmr", "kegiatan pmr", "tentang parstama", "parstama itu apa"],
    response: "**PMR PARSTAMA** adalah ekstrakurikuler Palang Merah Remaja di SMKN 1 Singosari.\n\nKegiatan kami:\n🎯 Pelatihan **PPGD** (Pertolongan Pertama Gawat Darurat)\n🤝 Bakti sosial & donor darah\n🏆 Kompetisi PMR kecamatan/kota/nasional\n📚 Pengembangan diri & kepemimpinan\n🎖️ Sertifikasi resmi dari **PMI**\n\nBukan sekadar organisasi — kami keluarga! ❤️",
  },
  {
    patterns: ["jumlah anggota", "berapa anggota", "anggota aktif", "member pmr", "berapa member"],
    response: "PMR PARSTAMA punya **100+ anggota aktif** dari berbagai jurusan di SMKN 1 Singosari.\n\nTertarik gabung? Yuk daftar sekarang! 🤝",
  },
  {
    patterns: ["lokasi", "alamat sekolah", "dimana smkn", "alamat smkn", "lokasi pmr", "lokasi parstama", "alamat parstama"],
    response: "Lokasi PMR PARSTAMA:\n\n🏫 **SMKN 1 Singosari**\n📍 Singosari, Malang, Jawa Timur\n\nDatang langsung aja, atau hubungi panitia: **WA 0814-5914-5800** 📱",
  },

  // ═══════════════════════════════════════
  //  MEDIS — PPGD & PERTOLONGAN PERTAMA
  // ═══════════════════════════════════════
  {
    patterns: ["ppgd", "pertolongan pertama gawat darurat", "pertolongan pertama", "first aid", "penanganan darurat", "gawat darurat"],
    response: "**PPGD** (Pertolongan Pertama Gawat Darurat) adalah tindakan awal sebelum bantuan medis profesional tiba.\n\nPrinsip:\n1️⃣ **Pastikan keamanan** — cek area aman\n2️⃣ **Cek respons** — goyangkan bahu, panggil korban\n3️⃣ **Panggil 119** (darurat medis)\n4️⃣ **Lakukan PPGD** sesuai kondisi\n\nIngat: **Keselamatan diri nomor satu!** Jangan jadi pahlawan yang malah jadi korban. 🛡️",
  },
  {
    patterns: ["luka berdarah", "luka sobek", "luka robek", "perdarahan", "darah keluar", "darah banyak", "luka terbuka", "luka dalam"],
    response: "Penanganan **luka berdarah**:\n\n**Luka ringan (gores):**\n1. Cuci dengan air mengalir\n2. Beri antiseptik (betadine)\n3. Tutup dengan plester/kasa steril\n\n**Luka berat (banyak darah):**\n1. **Tekan** luka dengan kain bersih\n2. **Angkat** bagian tubuh lebih tinggi\n3. **Jangan cabut** benda asing yang menancap\n4. Segera ke fasyankes / hubungi **119**\n\n⚠️ Jangan pakai obat sembarangan pada luka terbuka!",
  },
  {
    patterns: ["luka gores", "luka tergores", "luka lecet", "luka kecil", "luka ringan", "luka tipis"],
    response: "Penanganan **luka ringan** (gores/lecet):\n\n1. Cuci tangan sebelum mengobati\n2. Bilas luka dengan **air mengalir**\n3. Bersihkan dari kotoran\n4. Oleskan **antiseptik** (betadine)\n5. Tutup dengan plester/kasa steril\n\nLuka kecil pun harus dijaga kebersihannya agar tidak infeksi! 🩹",
  },
  {
    patterns: ["patah tulang", "fracture", "tulang patah", "tulang retak", "cedera tulang", "tulang bengkok"],
    response: "Penanganan **patah tulang**:\n\n**Tanda:**\n• Nyeri hebat saat digerakkan\n• Bengkak & memar\n• Bentuk abnormal\n• Tidak bisa gerak\n\n**Langkah:**\n1. **Jangan gerakkan** bagian cedera\n2. **Immobilisasi** dengan bidai/splint\n3. Kompres dingin untuk kurangi bengkak\n4. Segera ke **fasyankes**\n\n⚠️ **Jangan coba luruskan tulang sendiri!** Biarkan dokter yang menangani.",
  },
  {
    patterns: ["luka bakar", "burn", "terbakar", "kena air panas", "kena api", "kulit melepuh", "kebakaran"],
    response: "Penanganan **luka bakar**:\n\n**Ringan (derajat 1–2, kulit memerah):**\n1. Alirkan **air mengalir suhu ruangan** selama **10–20 menit**\n2. **Jangan pakai** es, odol, minyak, atau bahan lain!\n3. Tutup dengan kasa steril\n4. Boleh minum pereda nyeri\n\n**Berat (derajat 3, kulit hitam/melepuh parah):**\n1. **Jangan lepaskan** pakaian yang menempel\n2. Tutup dengan kain bersih\n3. Segera ke fasyankes / hubungi **119**\n\n🔑 **Air mengalir, bukan air es!**",
  },
  {
    patterns: ["pingsan", "tidak sadarkan diri", "pengsan", "collapse", "tiba-tiba pingsan", "pingsan mendadak"],
    response: "Penanganan **pingsan** (tidak sadarkan diri):\n\n1. **Pastikan area aman**\n2. **Periksa napas** — taruh telinga di dekat mulut/hidung\n3. **Hubungi 119** segera\n4. Jika bernapas: posisi **recovery position** (miring)\n5. Jika TIDAK bernapas: mulai **RJP**\n\n⚠️ **Jangan:**\n• Siramkan air ke wajah\n• Memaksa korban bangun\n• Menepuk-nepuk pipi keras",
  },
  {
    patterns: ["pusing", "vertigo", "kliyengan", "kayang", "melayang", "kepala pusing"],
    response: "Penanganan **pusing/vertigo**:\n\n1. **Berhenti bergerak**, duduk atau berbaring\n2. **Jangan gerakkan kepala** tiba-tiba\n3. Tatap titik tetap untuk stabilkan penglihatan\n4. Minum air putih cukup\n5. Istirahat di tempat sejuk\n\n⚠️ Jika pusing disertai muntah, penglihatan gelap, atau kesemutan → segera ke **fasyankes**!",
  },
  {
    patterns: ["heat stroke", "heat exhaustion", "kepanasan", "suhu tubuh naik", "panas berlebih"],
    response: "Penanganan **Heat Stroke / Exhaustion**:\n\n**Heat Exhaustion (awal):**\n• Berkeringat banyak, pucat, lemas\n• Pusing, mual, kulit dingin\n\n**Penanganan:**\n1. Pindah ke tempat **sejuk & teduh**\n2. Baringkan, kaki ditinggikan\n3. Lepaskan pakaian berlebih\n4. Minum air putih\n5. Kompres leher, ketiak, selangkangan\n\n**Heat Stroke (DARURAT!):**\n• Kulit kering panas, tidak berkeringat, bingung\n• **Hubungi 119 SEGERA**",
  },
  {
    patterns: ["serangan jantung", "heart attack", "nyeri dada", "dada sesak", "dada nyeri", "dada seperti ditekan", "jantung sakit"],
    response: "Penanganan **serangan jantung**:\n\n**Tanda:**\n• Nyeri dada seperti **ditekan/diremas**\n• Nyeri menjalar ke lengan kiri, rahang, punggung\n• Sesak napas, keringat dingin, mual\n\n**Langkah:**\n1. **Hubungi 119 SEGERA**\n2. Baringkan **setengah duduk**\n3. Longgarkan pakaian ketat\n4. Beri **aspirin** (kunyah, jika tidak alergi)\n5. Jangan biarkan korban **jalan sendiri**\n6. Siapkan RJP jika pingsan\n\n⚠️ **Waktu = nyawa!** Jangan tunda!",
  },
  {
    patterns: ["rjp", "cpr", "resusitasi jantung", "resusitasi paru", "jantung berhenti", "napas berhenti", "tidak bernapas"],
    response: "**RJP (Resusitasi Jantung Paru):**\n\n**Kapan:** Korban tidak merespons + TIDAK bernapas\n\n**Langkah:**\n1. Pastikan **keamanan area**\n2. **Cek respons** — goyangkan bahu, panggil nama\n3. Hubungi **119**\n4. Minta orang lain cari **AED** (jika ada)\n5. **Kompresi dada:**\n   • Tumit tangan di tengah dada\n   • Lengan lurus, bahu di atas tangan\n   • Kedalaman: **5–6 cm**\n   • Kecepatan: **100–120x/menit**\n6. Rasio: **30 kompresi : 2 napas**\n\n🎵 Ikuti irama lagu **\"Stayin' Alive\"** untuk ritme yang tepat!\n\nRJP adalah **keterampilan wajib** di PMR! 🎓",
  },
  {
    patterns: ["asma", "asma bronkial", "sesak nafas", "sesak napas", "nafas berat", "mengi", "inhaler"],
    response: "Penanganan **serangan asma**:\n\n**Tanda:**\n• Sesak napas, suara mengi (grok-grok)\n• Batuk, dada terasa ketat\n• Kesulitan bicara panjang\n\n**Langkah:**\n1. **Dudukkan** korban (tegap)\n2. Bantu pakai **inhaler** jika punya\n3. Bawa ke tempat **teduh & bersih**\n4. Tarik napas **pelan & teratur**\n5. Tidak membaik 15 menit → **hubungi 119**\n\n⚠️ **Jangan berbaring!** Duduk lebih baik untuk paru-paru.",
  },
  {
    patterns: ["diare", "mencret", "bab encer", "diare keras"],
    response: "Penanganan **diare**:\n\n1. **Oralit** (1 sdt gula + ½ sdt garam + 1 gelas air)\n2. Minum **air putih** lebih banyak\n3. Istirahat cukup\n4. Hindari: pedas, berlemak, susu, kopi\n\n⚠️ **Tanda dehidrasi → SEGERA ke fasyankes:**\n• Mulut sangat kering\n• Urine gelap & sedikit\n• Pusing, lemas\n• Kulit tidak elastis\n\n🧼 **Cuci tangan sebelum makan** untuk pencegahan!",
  },
  {
    patterns: ["mual", "muntah", "perut mual", "mules", "ingin muntah"],
    response: "Penanganan **mual/muntah**:\n\n1. **Jangan paksa makan** — istirahatkan perut\n2. Minum air putih **sedikit-sedikit**\n3. Makan makanan **ringan** (roti, biskuit, nasi putih)\n4. Hindari: berlemak, pedas, asam, berbau tajam\n5. Minum **jahe hangat** atau obat mual jika ada\n\n⚠️ **Segera ke fasyankes jika:**\n• Muntah darah atau cokelat gelap\n• Muntah terus > 24 jam\n• Disertai demam tinggi & sakit perut hebat",
  },
  {
    patterns: ["demam", "panas badan", "fever", "suhu tinggi", "meriang", "menggigil", "badan panas"],
    response: "Penanganan **demam**:\n\n1. **Kompres** dahi dengan air hangat\n2. Minum **air putih** banyak\n3. Istirahat di tempat **sejuk**\n4. Kenakan pakaian **tipis & nyaman**\n5. Minum **parasetamol** jika perlu\n\n⚠️ **Segera ke dokter jika:**\n• Demam **> 40°C**\n• Disertai **kejang**\n• Lebih dari **3 hari**\n• Muncul **ruam/bintik merah**\n• Muntah terus-menerus\n\n📊 Pantau suhu berkala!",
  },
  {
    patterns: ["alergi", "reaksi alergi", "biduran", "urtikaria", "gatal alergi", "bengkak alergi"],
    response: "Penanganan **alergi**:\n\n**Ringan (gatal, biduran):**\n1. Hindari penyebab alergi\n2. Minum **antihistamin** (cetirizine)\n3. Kompres area gatal dengan air dingin\n4. Jangan garuk!\n\n**Berat (ANAFILAKSIS) — DARURAT!**\n• Tanda: bengkak wajah/tenggorokan, sesak, pusing, kulit merah pucat\n• **Hubungi 119 SEGERA**\n• Beri obat alergi jika ada\n• Posisikan duduk jika sesak\n\n⚠️ Anafilaksis **mengancam jiwa** — jangan tunda!",
  },
  {
    patterns: ["benda menancap", "luka tembak", "luka tusuk", "benda asing menancap"],
    response: "Penanganan **luka dengan benda menancap**:\n\n⚠️ **JANGAN CABUT BENDA YANG MENANCAP!**\n\n1. **Biarkan benda tetap di tempat**\n2. Stabilkan (bungkus kain di sekelilingnya)\n3. **Hubungi 119** segera\n4. Tekan di **sekeliling** benda (bukan di atas) jika berdarah\n5. Jaga korban tetap **tenang & diam**\n\nCabut benda = pendarahan lebih parah! Biarkan dokter yang menangani. 🏥",
  },
  {
    patterns: ["trauma", "kecelakaan", "kecelakaan lalu lintas", "kecelakaan kerja", "jatuh dari", "tabrakan"],
    response: "Penanganan **trauma/kecelakaan**:\n\n**Urutan prioritas (ABCDE):**\n1️⃣ **Airway** — jalan napas terbuka\n2️⃣ **Breathing** — korban bernapas\n3️⃣ **Circulation** — detak jantung & pendarahan\n4️⃣ **Disability** — kesadaran (AVPU)\n5️⃣ **Exposure** — cek cedera lain, jaga hangat\n\n**Jangan gerakkan** korban kecuali ada bahaya!\nHubungi **119** — biarkan profesional menangani.",
  },
  {
    patterns: ["muntah darah", "batuk darah", "darah dari mulut", "darah dari hidung"],
    response: "Penanganan **muntah/batuk darah**:\n\n⚠️ **Ini kondisi DARURAT!**\n\n1. **Hubungi 119 SEGERA**\n2. Baringkan korban dengan **kepala sedikit tinggi**\n3. Jangan tahan darah — biarkan mengalir keluar\n4. Jika muntah darah: **miringkan kepala ke samping** agar tidak tersedak\n5. Jangan beri makanan/minuman\n6. Jaga korban tetap **tenang**\n\nDarah banyak = **kehilangan banyak darah** → sangat berbahaya! 🏥",
  },
  {
    patterns: ["darah tinggi", "hipertensi", "tekanan darah tinggi", "bp tinggi"],
    response: "Penanganan **darah tinggi (hipertensi)**:\n\n**Jika tidak ada gejala:**\n• Minum obat rutin (jika sudah diresepkan dokter)\n• Pantau tekanan darah berkala\n\n**Jika gejala muncul (pusing, pandangan kabur, mual, sesak):**\n1. Duduk atau berbaring dengan kepala tinggi\n2. Minum obat jika ada\n3. Kontrol tekanan darah\n4. Jika **> 180/120 mmHg** → **Hubungi 119**\n\n⚠️ **Segera ke fasyankes jika:** sakit kepala hebat, sesak napas, penglihatan kabur",
  },
  {
    patterns: ["diabetes", "gula darah", "kencing manis", "gula tinggi", "gula rendah", "hipoglikemia", "hiperglikemia"],
    response: "Penanganan **diabetes (gula darah)**:\n\n**Gula rendah (hipoglikemia) — DARURAT:**\n• Tanda: gemetar, pusing, berkeringat, bingung, lemas\n• **Segera minum/minum manis** (air gula, permen)\n• Jika tidak sadar → **jangan paksa minum** → hubungi **119**\n\n**Gula tinggi (hiperglikemia):**\n• Tanda: haus berlebih, sering kencing, lemas, penglihatan kabur\n• Minum obat (jika ada)\n• Banyak minum air putih\n• Segera ke fasyankes\n\n📊 Pantau gula darah secara rutin!",
  },
  {
    patterns: ["epilepsi", "ayan", "kejang", "kejang demam", "sempak"],
    response: "Penanganan **kejang/epilepsi**:\n\n**Selama kejang:**\n1. **Jangan tahan** tubuh yang kejang\n2. **Jangan masukkan** benda apapun ke mulut!\n3. Singkirkan benda berbahaya di sekitar\n4. **Tunggu** sampai kejang berhenti\n5. **Posisikan miring** (recovery position) setelah kejang\n6. Catat **waktu kejang** dimulai\n\n⚠️ **Hubungi 119 jika:**\n• Kejang > 5 menit\n• Kejang pertama kali\n• Tidak sadar setelah kejang\n• Kejang berulang\n\n❌ **MITOS:** Memasukkan sendok/pensil ke mulut itu **SALAH & BERBAHAYA!**",
  },
  {
    patterns: ["gigitan ular", "ular", "racun ular", "bisa ular"],
    response: "Penanganan **gigitan ular**:\n\n**Langkah:**\n1. **Jangan kejar ular** — foto jika memungkinkan\n2. **Jangan** memotong, menghisap, atau mengikat luka\n3. **Tenangkan** korban & buat berbaring\n4. **Posisikan** bagian yang digigit **lebih rendah** dari jantung\n5. **Lepaskan** perhiasan/baju ketat di area gigitan\n6. **Hubungi 119** SEGERA\n\n⚠️ Jangan pakai es, obat merah, atau tourniquet!\nEfektivitas antiracun tergantung pada **waktu**!",
  },
  {
    patterns: ["gigitan anjing", "rabies", "gigitan hewan", "anjing gigit"],
    response: "Penanganan **gigitan anjing/hewan**:\n\n1. **Cuci luka** dengan sabun & air mengalir selama **10–15 menit**\n2. Beri **antiseptik** (betadine)\n3. **Jangan tutup** luka rapat — biarkan terbuka\n4. Segera ke **fasyankes** untuk vaksin\n\n⚠️ **Rabies** sangat berbahaya!\n• Gejala: demam, sakit kepala, takut air, kejang\n• **Tidak ada obat** jika sudah gejala → fatal\n\n**Vaksin anti-rabies** harus diberikan sesegera mungkin!",
  },

  // ═══════════════════════════════════════
  //  UMUM & INFORMASI
  // ═══════════════════════════════════════
  {
    patterns: ["donor darah", "donor", "donor plasma"],
    response: "**Donor Darah** di PMR PARSTAMA:\n\nKegiatan rutin bekerja sama dengan **PMI**.\n\n**Syarat donor:**\n✅ Usia 17–65 tahun\n✅ Berat badan ≥ 45 kg\n✅ Tekanan darah normal\n✅ Tidak sedang sakit\n\nInfo jadwal: **WA 0814-5914-5800** 📱",
  },
  {
    patterns: ["jam berapa", "jam buka", "jam operasional", "jam aktif"],
    response: "Jam aktif panitia PMR PARSTAMA:\n\n🕐 **Senin–Jumat**: 08.00–16.00 WIB\n🕐 **Sabtu–Minggu**: Libur\n\nChat di luar jam kerja akan dibalas di hari kerja berikutnya! 📱",
  },
  {
    patterns: ["darurat", "nomor darurat", "emergency", "nomor telepon darurat", "nomor penting"],
    response: "Nomor **DARURAT** Indonesia:\n\n🚑 **119** — Darurat Medis / Ambulance\n🚑 **118** — Darurat Medis (lama)\n🚔 **110** — Kepolisian\n🚒 **113** — Pemadam Kebakaran\n\nUntuk medis: hubungi **119**! 🏥",
  },
  {
    patterns: ["terima kasih", "thanks", "makasih", "thx", "sip", "ok mantap"],
    response: "Sama-sama! 😊 Senang bisa membantu.\n\nAda pertanyaan lain? Langsung tanya aja — aku siap bantu 24/7! 💬",
  },
  {
    patterns: ["hai", "halo", "hello", "hi", "hey", "permisi", "assalamualaikum", "selamat pagi", "selamat siang", "selamat sore", "selamat malam"],
    response: "**Halo!** 👋 Selamat datang di AI Assistant **PMR PARSTAMA**.\n\nAku bisa bantu:\n📋 **Pendaftaran** — cara daftar, syarat, biaya\n🏥 **Medis** — PPGD, luka, patah tulang, RJP, dll\n❓ **Tanya apa aja** tentang PMR\n\nKetik pertanyaanmu! 💬",
  },
  {
    patterns: ["siapa kamu", "kamu siapa", "nama kamu", "apa ini", "kamu itu apa", "kamu siapa"],
    response: "Aku **AI Assistant PMR PARSTAMA** 🤖\n\nAku bantu jawab pertanyaan tentang:\n• **Pendaftaran PMR**\n• **Penanganan medis darurat**\n• **Pengetahuan kesehatan**\n\nBukan pengganti dokter — untuk darurat, hubungi **119**! 🏥",
  },
  {
    patterns: ["bantu", "help", "tolong", "bisa apa", "apa yang bisa kamu lakukan", "kamu bisa apa"],
    response: "Tentu! Aku bisa bantu:\n\n📋 **Pendaftaran:**\n• Cara daftar, syarat, biaya, timeline\n• Status pendaftaran\n\n🏥 **Medis & PPGD:**\n• Luka, patah tulang, luka bakar, RJP\n• Serangan jantung, asma, demam, diare\n• Pingsan, kejang, alergi, trauma\n\n💬 **Lainnya:**\n• Kontak panitia, tentang PMR\n\nTanya aja, gratis! 🆓",
  },
]

function findBestResponse(input: string): string {
  const lower = input.toLowerCase().trim()

  let bestMatch: KnowledgeEntry | null = null
  let bestScore = 0

  for (const entry of knowledgeBase) {
    let score = 0
    let matchCount = 0

    for (const pattern of entry.patterns) {
      if (lower.includes(pattern)) {
        // Longer pattern = much higher score (priority)
        score += pattern.length * 3
        matchCount++

        // Exact match bonus
        if (lower === pattern) {
          score += pattern.length * 2
        }
      }
    }

    // Require at least 1 match
    if (matchCount > 0 && score > bestScore) {
      bestScore = score
      bestMatch = entry
    }
  }

  if (bestMatch && bestScore > 5) {
    return bestMatch.response
  }

  return "Maaf, aku belum sepenuhnya mengerti pertanyaanmu. 😅\n\nCoba tanyakan tentang:\n\n📋 **Pendaftaran:**\n• \"Bagaimana cara daftar?\"\n• \"Apa saja syaratnya?\"\n• \"Berapa biayanya?\"\n\n🏥 **Medis:**\n• \"Bagaimana penanganan luka?\"\n• \"Apa itu RJP?\"\n• \"Cara menangani pingsan?\"\n\n💬 Atau hubungi panitia: **WA 0814-5914-5800** 📱"
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message } = body as { message: string }

    if (!message?.trim()) {
      return NextResponse.json(
        { error: "Pesan tidak boleh kosong" },
        { status: 400 }
      )
    }

    const response = findBestResponse(message)

    return NextResponse.json({ response })
  } catch (error) {
    console.error("Chat error:", error)
    return NextResponse.json(
      { error: "Terjadi kesalahan" },
      { status: 500 }
    )
  }
}