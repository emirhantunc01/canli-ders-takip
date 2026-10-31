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
