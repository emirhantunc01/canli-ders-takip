# Ders Defteri — tasarım ve uygulama kararları

Kişisel matematik ders takvimi. Ana soru: Bu hafta hangi derslerim var ve iki kurumdan ne kadar alacağım kaldı?

Takvim çalışma alanı, iki bağımsız hesap özeti ve bugün listesi. Achromatic ledger yönü (seed 43018287); mavi-gri defter zemini, yerel Geist yazı tipi, nötr gezinme, canlı derste mavi ve dershanede adaçayı veri işaretleri. İki renk kullanımı ders türlerinin aynı takvimde ayrılması için gereklidir. Örnek veri üretim alanına yazılmaz.

- React/TypeScript, Vite; ders ve ödeme kuralları domain.ts içinde.
- IndexedDB tek işlemle bütün veri belgesini kaydeder. Başarısız yazımda görünür durum değiştirilmez.
- Yedekler sürümlü JSON olarak doğrulanır ve açık onayla mevcut verinin yerine geçer.
- Tarihler yerel takvim günü, saatler 24 saat biçimindedir. Gün değiştiren dersler desteklenmez.
- Kullanım tek tarayıcı sekmesiyle sınırlıdır. Bulut, giriş, platform bağlantısı yoktur.

Doğrulama: ücret/bakiye/yedek ve IndexedDB testleri; Chrome uçtan uca akışlar ve 1440/768/390 piksel görüntüler.

Görsel kontrol notları: Boş takvimde veri rengi uyarısı beklenir; sahte ders eklenmez. Sağdaki bugün akışı takvimle aynı boyda esnetilmez; içeriği kadar yer kaplar. Takvim ekseni ve yardımcı bilgiler 11–12 px, ana kayıt etiketleri 13–14 px tutulur. Son ölçümde hata yoktur; bu üç bağlamsal uyarı kabul edilmiştir.

## Windows masaüstü sürümü (1.1)

React arayüzü yerel paketlenmiş dosyadan Electron penceresinde açılır; HTTP sunucusu kullanılmaz. Preload yalnızca yükle/kaydet köprüsünü sunar; Node erişimi arayüze kapalı, contextIsolation ve sandbox açıktır. IPC çağrılarında ana pencere ve dosya URL'si doğrulanır. Harici gezinme/yeni pencere engellenir. Tek örnek kilidi çakışan dosya yazımlarını engeller.

Uygulama verisi %APPDATA%/DersDefteri/records.json dosyasında sürümlü JSON'dur. Geçerli eski kayıt önce records.previous.json olarak korunur; yeni kayıt fsync+rename ile atomik değiştirilir. Dosya yazımları sıraya alınır ve başarısızlıkta UI durumu güncellenmez. Geçersiz/bozuk dosya sessiz sıfırlanmaz. Eski IndexedDB verisi JSON aktarımıyla taşınır; web önizlemesindeki veri alanı ayrıdır.

Windows NSIS paketi kullanıcı başına kurulur; masaüstü ve Başlat menüsü kısayolu oluşturur. Kurulumdan bağımsız win-unpacked klasörü de çalışır. İmza sertifikası/otomatik güncelleme yoktur.

## Birikmiş alacak kayıtları (1.2)

receivables, ödeme kayıtlarından bağımsız pozitif hak edişlerdir. Hesap: yapılan ders ücretleri + elle girilen birikmiş alacak − tahsilatlar. Kuruş hesabı tam sayılarla yapılır. Tarih, kurum ve tutar doğrulanır; düzenleme/silme toplamı yeniden hesaplatır. Çifte sayımı önlemek için geçmiş tutara dahil dersleri tekrar girmeme açıklaması formda bulunur.

v1 dosyaları açılır; receivables içeren dosya ve dışa aktarımlar v2'dir. v2'de receivables zorunlu dizi olarak doğrulanır ve dosya deposunun snapshot'ına dahil edilir. Eski uygulama v2'yi reddederek sessiz veri kaybını önler. Mevcut kayıtlar yerinde korunur; kullanıcı tutarı kendisi girer.

## Android sürümü (1.3)

Android 8+ native Activity/WebViewAssetLoader kabuğu, yerel `https://appassets.androidplatform.net/assets/www/index.html` kaynağını açar. Uzak kaynaklar 403 ile engellenir, harici gezinme ve izin istekleri reddedilir; INTERNET izni yoktur. JS köprüsü yalnızca kayıt yükle/kaydet, belge dışa aktar ve uygulamayı arka plana al komutlarına sahiptir. Kullanıcı içeriği React tarafından metin olarak işlenir; içe alınan JSON çalıştırılmaz.

Telefon deposu SQLite snapshots tablosunda current ve previous alanlarını tek işlemde yazar. Native doğrulama kurum/tarih/saat/öğrenci/tutar kurallarını tekrar uygular. `synchronous=FULL` kullanılır. JS tarafı SQLite yazımı onaylanmadan UI verisini değiştirmez. Hatalar boş veriye çevrilmez.

Android ACTION_CREATE_DOCUMENT dışa aktarma ve ACTION_OPEN_DOCUMENT içe aktarma akışı kullanılır. Dosya sağlayıcısının write/flush/close işlemlerinin tümü tamamlandıktan sonra başarı olayı yayınlanır. İptal başarı sayılmaz. İçe aktarma masaüstündeki v1/v2 doğrulama ve açık değiştirme onayını korur. APK özel kayıt veya imza anahtarı içermez.

Mobil görünüm alt gezinme, 44+px kontrol alanları, liste varsayılanı, tek sütun ödeme hesapları ve kaydırılabilir diyaloglar kullanır. Masaüstü takvim görünümü korunur. Android geri tuşu açık diyalog/menüyü kapatır, ana ekrana döner veya uygulamayı arka plana alır.
