# E-Pharmacy Dashboard

Eczane ürünlerini, stoklarını, tedarikçilerini, müşterilerini ve siparişlerini yönetmek için geliştirilmiş responsive React uygulaması. Dashboard ekranı kayıt sayılarını, son müşterileri ve gelir/gider hareketlerini gösterir. Arayüz dili, sağlanan tasarımlara uygun olarak İngilizcedir.

## Teknolojiler

- React ve React Router ile bileşenler, iç içe sayfa yönlendirmeleri ve korumalı rotalar.
- Vite ile geliştirme sunucusu ve üretim derlemesi. [Vite dokümantasyonu](https://vite.dev/guide/)
- React Hook Form ve Yup ile form yönetimi ve doğrulama. [React Hook Form dokümantasyonu](https://react-hook-form.com/)
- Firebase Authentication ile e-posta/şifre oturumu ve Cloud Firestore Lite ile veri erişimi. [Firebase web kurulumu](https://firebase.google.com/docs/web/setup)
- CSS ile responsive düzen, yerel Inter font dosyaları, SVG ikon sprite ve favicon.
- Prettier ile kaynak kod biçimlendirmesi.

## Kurulum

Node.js 22.12 veya üzeri önerilir. Proje klasöründe aşağıdaki npm komutlarını çalıştırın.

```sh
npm install
npm run dev
```

Uygulamayı terminalde yazdırılan yerel adresten açın. Firebase yapılandırması ve veri modu tanımlanmamış bir geliştirme ortamında örnek verilerle demo modu açılır.

| Komut                  | İşlev                                         |
| ---------------------- | --------------------------------------------- |
| `npm run dev`          | Geliştirme sunucusunu başlatır                |
| `npm run build`        | Üretim dosyalarını `dist` klasörüne oluşturur |
| `npm run preview`      | Son üretim derlemesini yerelde sunar          |
| `npm run format`       | Kaynak kodu ve README dosyasını biçimlendirir |
| `npm run format:check` | Biçimlendirmeyi kontrol eder                  |

## Demo hesabı

| Alan    | Değer              |
| ------- | ------------------ |
| E-posta | `vendor@gmail.com` |
| Şifre   | `Pharmacy123!`     |

Demo modunda ürün, tedarikçi ve müşteri değişiklikleri tarayıcının `localStorage` alanında saklanır. Sayfa yenilendiğinde kayıtlar ve açık oturum korunur. Bu veriler kullanılan tarayıcıya aittir. Demo verilerini başlangıca döndürmek için uygulamanın site verilerini tarayıcı ayarlarından temizleyebilirsiniz.

Üretim derlemesinin varsayılan veri modu Firebase'dir. Üretim derlemesini örnek verilerle önizlemek için proje kökünde `.env.local` dosyası oluşturup aşağıdaki değeri ekleyin, ardından yeniden derleyin.

```env
VITE_DATA_MODE=demo
```

```sh
npm run build
npm run preview
```

## Firebase bağlantısı

`.env.example` dosyasını `.env.local` adıyla kopyalayın. Firebase projesindeki web uygulamasının yapılandırmasını kullanarak alanları doldurun.

```env
VITE_DATA_MODE=firebase
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_APP_ID=your-app-id
```

Ortam değişkenlerini güncelledikten sonra geliştirme sunucusunu yeniden başlatın. Üretim ortamındaki değişiklikler için yeniden derleme gerekir.

Firebase projesinde e-posta/şifre sağlayıcısı etkinleştirilmeli ve yönetici hesabı oluşturulmalıdır. Firestore veritabanının güvenlik kuralları, oturum açmış yöneticinin ilgili kayıtlara erişimini tanımlamalıdır. Kullanılan istemci veri yolları aşağıdaki yapıdadır.

```text
users/{uid}/products/{id}
users/{uid}/suppliers/{id}
users/{uid}/customers/{id}
users/{uid}/orders/{id}
users/{uid}/transactions/{id}
```

`uid`, Firebase Authentication tarafından verilen kullanıcı kimliğidir. Her koleksiyon bu kullanıcıya ait kayıtları içerir. Ürünlerde `name`, `category`, `stock`, `supplier`, `price` alanları kullanılır. Tedarikçilerde `name`, `address`, `company`, `deliveryDate`, `amount`, `status` alanları bulunur. Müşterilerde `name`, `email`, `address`, `phone`, `registerDate`, `spent` alanları yer alır. Tarih alanları `YYYY-MM-DD` biçimindedir. Örnek kayıtların tam yapısı [src/data/seed.js](src/data/seed.js) dosyasındadır.

Firebase web yapılandırması, gerçek yönetici hesabı, Firestore güvenlik kuralları ve başlangıç verileri proje bağlantısı aşamasında tamamlanacaktır. Genel değerlendirme kriterlerindeki Firebase koşulu doğrultusunda frontend veri katmanı Firebase istemci SDK'sıyla hazırlanmıştır.

## Sayfalar ve teknik görev kapsamı

| Rota         | İçerik                                                                               |
| ------------ | ------------------------------------------------------------------------------------ |
| `/login`     | E-posta ve şifre doğrulaması, şifre görünürlüğü, asenkron giriş ve hata bildirimleri |
| `/`          | Oturum durumuna göre yönlendirme                                                     |
| `/home`      | Dashboard yönlendirmesi                                                              |
| `/dashboard` | Ürün, tedarikçi ve müşteri sayıları, son müşteriler, gelir/gider listesi             |
| `/orders`    | Müşteri adına göre filtrelenen sipariş tablosu ve durum etiketleri                   |
| `/products`  | Ürün adına göre filtreleme, yeni ürün ekleme, düzenleme ve silme                     |
| `/suppliers` | Tedarikçi adına göre filtreleme, yeni tedarikçi ekleme ve düzenleme                  |
| `/customers` | Müşteri adına göre filtreleme, sayfalama, müşteri düzenleme ve sipariş geçmişi       |

Yönetim sayfaları oturum gerektirir. Başarılı giriş kullanıcıyı ana panele taşır. Ortak başlık ve yan menü sayfalar arasında gezinmeyi sağlar. Aktif sayfa menüde vurgulanır. Çıkış işlemi oturumu sonlandırır ve giriş sayfasını açar.

Tablolarda sayfalama, boş sonuç bildirimi ve yükleme/hata durumları bulunur. Ürünler en yeni kayıt önce gelecek şekilde sıralanır. Modal formlar mevcut kayıtları doldurur, alanları doğrular ve işlem sırasında tekrar gönderimi engeller. Klavye ile modal içinde gezinilebilir, `Escape` ile kapatılabilir ve kapandıktan sonra odak önceki öğeye döner.

Ürün kategorileri `Medicine`, `Head`, `Hand`, `Dental Care`, `Skin Care`, `Eye Care`, `Vitamins & Supplements`, `Orthopedic Products` ve `Baby Care` olarak tanımlanmıştır.

## Tasarım ve görev kaynakları

Tasarım referansları proje içindeki Figma ekran görüntüleridir. Figma dosyasının bağlantısı paylaşıldığında bu bölüme eklenebilir.

- [Masaüstü ekranları](images/dekstop/)
- [Tablet ekranları](images/tablet/)
- [Mobil ekranları](images/mobile/)
- [UI Kit](images/dekstop/UI%20Kit.png)

Uygulama, verilen FrontEnd yönetim paneli görev metni ve BackEnd veri/işlem gereksinimleri temel alınarak hazırlanmıştır. Bu README içindeki sayfa ve özellik listesi frontend teknik kapsamını özetler.

Düzen 320 pikselden itibaren esnektir. Tablet kırılma noktası 768 piksel, masaüstü kırılma noktası 1440 pikseldir. Dar ekranlarda menü açılır panel içinde gösterilir ve geniş tablolar kendi alanlarında yatay kaydırılabilir.

## Yayına hazırlama

Netlify için derleme komutu `npm run build`, yayın klasörü `dist` olarak ayarlanır. `public/_redirects` dosyası, uygulama rotalarının doğrudan açılmasını ve yenilenmesini destekleyen SPA yönlendirmesini içerir. Firebase ortam değişkenleri hosting servisinin derleme ortamında tanımlanmalıdır.

Canlı yayın ve gerçek Firebase bağlantısı tamamlanmayı beklemektedir. Bu teslimat frontend kaynak kodunu ve yayınlanabilir üretim derlemesi yapılandırmasını içerir.
