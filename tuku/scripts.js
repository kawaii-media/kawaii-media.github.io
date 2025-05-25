function showTentang() {
  const teksPanjang = 'Tuku adalah aplikasi manajemen bisnis dan kasir terintegrasi yang dirancang khusus untuk memberdayakan pemilik usaha, mulai dari UMKM hingga bisnis skala menengah, dalam mengelola seluruh aspek operasional mereka dengan lebih efisien, akurat, dan mudah.\n\nSebagai solusi POS (Point of Sale) yang modern dan intuitif, Tuku memungkinkan Anda memproses transaksi penjualan dengan cepat dan lancar, mendukung berbagai metode pembayaran, serta mencetak struk digital maupun fisik untuk kenyamanan pelanggan. Fitur ini memastikan setiap transaksi tercatat dengan benar, meminimalkan antrean, dan meningkatkan pengalaman berbelanja.\n\nLebih dari sekadar kasir pintar, Tuku juga dilengkapi dengan fitur manajemen bisnis yang komprehensif. Anda dapat mengelola inventaris secara real-time, melacak stok barang, mengatur harga, dan menerima notifikasi otomatis saat stok menipis, sehingga Anda tidak akan pernah kehabisan produk terlaris. Selain itu, Tuku menyediakan dasbor manajemen yang informatif untuk memantau performa penjualan, menganalisis data transaksi, dan menghasilkan laporan keuangan yang akurat dan mudah dibaca. Laporan ini mencakup penjualan harian, mingguan, bulanan, serta analisis produk terlaris, memberikan Anda wawasan mendalam untuk membuat keputusan bisnis yang strategis.\n\nDengan Tuku, Anda dapat menyederhanakan operasional harian, mengurangi kesalahan manual, menghemat waktu berharga, dan fokus pada pengembangan inti bisnis Anda. Tuku adalah mitra teknologi yang andal untuk membantu usaha Anda bertumbuh, meningkatkan efisiensi, dan mencapai kesuksesan yang maksimal.';

  document.getElementById('popupTitle').textContent = 'Tentang Aplikasi';
  document.getElementById('popupContent').textContent = teksPanjang;
  document.getElementById('popupOverlay').style.display = 'flex';
}

function showHubungi() {
  const teksKontak = '📧: akununtukbisnisonlineku@gmail.com\n🕘: Senin - Jumat, 09.00 - 16.00 WIB\n\nKami siap membantu Anda!';

  document.getElementById('popupTitle').textContent = 'Hubungi Kami';
  document.getElementById('popupContent').textContent = teksKontak;
  document.getElementById('popupOverlay').style.display = 'flex';
}

function closePopup() {
  document.getElementById('popupOverlay').style.display = 'none';
}
