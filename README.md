# Ders Defteri

Kişisel, yerel matematik ders takibi. Veriler yalnızca kullanılan tarayıcının IndexedDB deposunda tutulur. Aynı adres ve tarayıcı profilini kullanın. Tarayıcı verilerini temizlemeden önce yedek indirin.

## Çalıştırma

Node.js 22 veya üzeri kurulu olmalıdır.

```powershell
npm install
npm run dev
```

Ardından http://127.0.0.1:5173 adresini açın. Windows'ta `Baslat.cmd` dosyasına çift tıklamak da uygulamayı başlatır. Terminali kullanım boyunca açık tutun.

## Kontroller

```powershell
npm test
npm run build
npx playwright test
```

Takvimde tüm dersler, hesaplarda sadece yapılan dersler sayılır. Ödemeler ilgili kurumun hesabına topluca işlenir. Ay özeti o ayın hareketlerini gösterir; tüm zamanların bakiyesi önceki ayları da içerir. JSON geri yükleme mevcut kayıtları bütünüyle değiştirir. Aynı anda tek sekmede kullanın.

## Günlük kullanım

1. **Yeni ders** ile ders türünü seçin. Birden fazla öğrenciyi virgülle ayırın; sınıf, tarih, saat ve konuyu doldurun.
2. Ders bittikten sonra kaydı açıp durumunu **Yapıldı** seçin. Kazanç bu aşamada hesaplanır.
3. Kurumdan ödeme aldığınızda **Ödemeler → Ödeme ekle** ile kaynağı, tutarı ve tarihi kaydedin.
4. **Yedekleme** ekranından düzenli JSON yedeği indirin. Geri yükleme eski ve yeni kayıtları birleştirmez; mevcut kayıtları değiştirir.

Takvim 00:00–23:59 aralığını destekler ve ilk açılışta 08:00'a kaydırılır. Haftalık takvim dar ekranda yatay kaydırılır. Kayıtlar farklı günlerde düzenlenebilir; dershane için yalnızca ilk tarih önerisi pazardır. Tarayıcı testleri kurulu Google Chrome kullanır.
