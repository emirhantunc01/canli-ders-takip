# Ders Defteri

Kişisel matematik dersi ve kurum ödeme takibi uygulaması. Kullanıcı pazar günleri dershanede birebir, farklı günlerde talebe göre canlı ders verir. Dershane ve canlı platformun ödeme hesapları ayrıdır.

## Kullanım

Android telefonda tek başına, internetsiz kullanım önceliklidir. Ders tarih/saat, öğrenci adları, sınıf ve konu girilir. Planlanan/yapılan/iptal durumları vardır. Yapılan dersler hak ediş oluşturur. Geçmişten birikmiş alacak ayrıca girilir; tahsilatlar ilgili kurumun bakiyesinden düşer. Varsayılan ders süresi 40 dakika, ders başı fiyat süreye bağlı değildir.

## Ücretler

Dershane her ders 200 TL. Canlı ders tek öğrenci 200 TL, birden çok öğrenci için toplam 400 TL. Kısmi ödeme ve avans desteklenir.

## Kalıcı kararlar

Android kayıtları özel SQLite dosyasında, Windows kayıtları özel JSON dosyasında tutulur. JSON yedekleri cihazlar arasında elle aktarılır; bulut/senkronizasyon yoktur. Güncellemeler aynı Android uygulama kimliği ve imza anahtarıyla yapılır. Kullanıcı verileri ve imzalama anahtarı Git'e veya APK'ye dahil edilmez.

## Görsel tercih

Kullanıcı açıkça glassmorphism istemiştir. Cam görünüm okunabilir sayılar, belirgin kontroller ve telefon performansıyla birlikte uygulanır. Ayrıntılar DESIGN.md içindedir.

## Stack

Mevcut React/TypeScript/Vite arayüzü, Windows'ta Electron, Android'de yerel Activity ve WebViewAssetLoader kabuğu. Hesaplama ve yedek biçimi ortaktır.
