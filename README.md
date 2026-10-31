# Ders Defteri

Matematik derslerini ve iki ayrı kurumun ödeme hesabını takip eden, internetsiz çalışan Windows masaüstü uygulaması.

## Windows'ta açma

- `release/DersDefteri-Kurulum.exe`: Kurulum sihirbazını çalıştırın. Masaüstüne ve Başlat menüsüne **Ders Defteri** kısayolu eklenir.
- Kurmadan çalıştırmak için `release/win-unpacked/Ders Defteri.exe` dosyasını açın. Taşırken `win-unpacked` klasörünün tamamını taşıyın.
- Proje klasöründeki `Baslat.cmd`, hazır masaüstü paketini açar.

Kullanım sırasında Node.js, terminal, tarayıcı veya yerel web sunucusu gerekmez. Uygulama aynı anda tek pencere/işlem olarak çalışır.

## Günlük kullanım

1. **Yeni ders** ile ders türünü seçin. Birden fazla öğrenciyi virgülle ayırın; sınıf, tarih, saat ve konuyu girin.
2. Ders bittikten sonra durumunu **Yapıldı** seçin. Yalnızca yapılan dersler kazanca eklenir.
3. Dershane her ders için 200 TL; canlı ders tek öğrenci için 200 TL, birden çok öğrenci için dersin toplamı 400 TL hesaplanır. Süre ücretle çarpılmaz.
4. **Ödemeler → Ödeme ekle** ile kurumdan aldığınız toplu/kısmi ödemeyi kaydedin. İki hesabın bakiyesi ayrıdır; fazla ödeme avans olur.
5. **Yedekleme** bölümünden düzenli JSON yedeği alın. Geri yükleme mevcut kayıtların tamamını değiştirir; birleştirme yapmaz.

## Verilerin saklandığı yer

`%APPDATA%\DersDefteri\records.json`

Her başarılı değişimde önceki sürüm `records.previous.json` olarak korunur. Yazma işlemi önce geçici dosyaya tamamlanır, ardından ana dosya atomik olarak değiştirilir. Bozuk ana dosya sessizce boşaltılmaz veya üzerine yazılmaz. Önce dosyaların bir kopyasını alın; gerekirse uygulama kapalıyken geçerli `records.previous.json` dosyasını `records.json` yerine kopyalayın. Uygulamayı kaldırmak verileri otomatik silmez.

### Önceki tarayıcı sürümünden taşıma

Eski sürümü daha önce kullandığınız aynı tarayıcıda `http://127.0.0.1:5173` adresinden açın (`npm run dev`). **Yedekleme → JSON yedeğini indir** ile kayıtları dışarı alın. Ardından masaüstü uygulamasında **Yedekleme → Yedek dosyası seç** ile bu dosyayı seçip onaylayın. Tarayıcı kayıtları otomatik silinmez. Masaüstü uygulaması tarayıcının kayıt alanını otomatik okuyamaz.

## Geliştirme ve paketleme

Node.js 22.12 veya üzeri, Windows x64:

```powershell
npm install
npx install-electron
npm run desktop
```

```powershell
npm test
npm run build:desktop
npm run test:desktop
npx playwright test
npm run package:win
```

`npm run dev` yalnızca tarayıcı önizlemesi içindir; burada kayıtlar IndexedDB'dedir. Masaüstünde dosya deposu kullanılır. Electron testleri ayrı geçici profil kullanır ve gerçek kullanıcı kayıtlarına yazmaz. Paketler `release/` dizinine çıkar; kaynak repoya kullanıcı verisi veya exe eklenmez. Windows kurulum paketi imzasızdır.

## Birikmiş alacak (1.2)

Ödemeler ekranında ilgili hesabın **Birikmiş alacak ekle** düğmesini kullanarak uygulamaya geçmeden önce içeride biriken tutarı girin. Örneğin 5.000 TL alacak ve ardından 1.500 TL ödeme kaydı, 3.500 TL kalan alacak oluşturur. Yeni yapılan dersler ayrıca hak edişe eklenir; birikmiş tutara dahil eski dersleri tekrar girmeyin. Alacak kayıtları tarih ve açıklamayla düzenlenebilir/silinebilir; ay filtresine dahildir. Bu tutar tahsilat değildir.

Yedekler artık v2 biçiminde dersler, ödemeler ve birikmiş alacakları içerir. Eski v1 yedekler/veri dosyaları açılır. Alacak içeren yeni yedekleri eski uygulama sürümüyle açmayın; eski sürüm bunları reddeder.

## Android telefon sürümü (1.3)

Hazır paket: `release/DersDefteri-Android.apk`. Android 8 veya üzeri ve güncel Android System WebView gerekir. APK'yi telefona aktarın, dosyaya dokunup Android'in gösterdiği kurulum adımlarını izleyin. İnternet hesabı veya sunucu gerekmez; kayıtlar yalnızca telefondadır. Windows sürümüyle otomatik eşitleme yoktur.

**Mevcut kayıtları taşıma:** Windows uygulamasında Yedekleme bölümünden JSON yedeği indirin. Dosyayı telefona aktarın. Android uygulamasında **Yedekleme → Yedek dosyası seç** ile seçip onaylayın. Bu işlem telefondaki mevcut kayıtların tamamını değiştirir. Telefon değiştirirken veya uygulamayı kaldırmadan önce **JSON yedeğini indir** ile Android dosya seçicisinden güvenli bir klasöre yedek kaydedin. Uygulama kaldırılınca özel veri alanı silinir.

Android kayıtları özel SQLite veritabanında tutulur; işlem tamamlanmadan başarı gösterilmez. Önceki kayıt sürümü aynı işlem içinde korunur. JSON yedek v1/v2 biçimi masaüstüyle uyumludur. Alacak, ödeme, öğrenci ve ders tutarları aynı kurallarla hesaplanır. APK kullanıcı verisi içermez ve internet/depolama izinleri istemez; dışa aktarma/içe aktarma yalnızca seçtiğiniz belgeyle çalışır.

### Android derleme ve test

Java 17, Android SDK 34 ve Build Tools, `ANDROID_HOME` ve `JAVA_HOME` ayarları gerekir.

```powershell
npm ci
npm run build:android
```

İlk derleme `.local/` içinde yerel imza anahtarı üretir. **Bu klasörü güvenli biçimde yedekleyin; sonraki APK güncellemeleri aynı anahtarla imzalanmalıdır.** Klasör ve parolalar Git'e gönderilmez. Gradle wrapper bağımlılıkları ilk derlemede indirilir.

```powershell
npm test
.\android\gradlew.bat -p android testDebugUnitTest
npm run test:android:native
npm run build:android:debug
npx playwright install android
adb -s emulator-5554 install -r release/DersDefteri-Android-Test.apk
npm run test:android:ui
```

Telefon UI testi yalnızca `emulator-*` cihazını seçer; testten önceki emülatör kayıtlarını geri yükler. Native testler ayrı bir test veritabanı kullanır. Release APK'de WebView geliştirici bağlantısı kapalıdır. Kaynakların mobil varlık dosyaları üretildiği için Git'e dahil edilmez; derleme `dist/` çıktısını Android varlıklarına kopyalar. SHA256 kontrol dosyası APK yanında üretilir.

## Glassmorphism güncellemesi (1.4)

Android APK mevcut uygulamanın üzerine güncelleme olarak kurulabilir; versionCode artırılmıştır ve imza anahtarı aynıdır. Uygulamayı kaldırmadan yeni APK'yi kurun. Bu sürümde veri şeması değişmez. Yeni görünüm yarı saydam cam paneller, açık mavi/mint arka plan ve uyumlu diyalog/alt gezinme içerir; blur desteklenmeyen cihazlarda opak yüzeye geçer.
