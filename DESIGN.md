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
