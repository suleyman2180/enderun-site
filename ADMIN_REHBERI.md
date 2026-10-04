# 🏛️ AHMEDİYE ENDERUN TALEBE YURDU
## 🛠️ Yönetici & Admin Kullanım Rehberi (Aylık Düzenleme Kılavuzu)

Bu rehber, **Ahmediye Enderun Talebe Yurdu** (İzmir / Bornova) web sitesini ve **TV Kiosk (Dijital Pano)** ekranını her ay kolayca güncellemeniz, yeni etkinlikler, âyetler, hadisler ve duyurular eklemeniz için adım adım hazırlanmıştır.

---

## 📂 1. Dosya ve Klasör Haritası

| Dosya / Klasör | Ne İşe Yarar? | Ne Zaman Değiştirilir? |
| :--- | :--- | :--- |
| **`etkinlikler.html`** | Güncel ayın etkinlik panosu | **Her ay başında** (1 Büyük Etkinlik, 1 İkram, 2-3 Küçük Etkinlik) |
| **`kiosk.html`** | Lobi & koridor TV dijital panosu | **Haftalık/Aylık** (Slaytlar, Âyet, Hadis, Kayan Duyurular) |
| **`galeri.html`** | Yurt içi/dışı, kulüp odaları ve geçmiş etkinlikler | Yeni fotoğraf çekildiğinde veya eski etkinlik arşivi eklendiğinde |
| **`kulupler.html`** | 4 İhtisas Kulübü tanıtımı ve atölyeleri | Kulüp atölye veya alanları güncellendiğinde |
| **`sss.html`** | Genel yurt sıkça sorulan soruları | Yurt genel kuralları veya kayıt şartları değiştikçe |
| **`basvuru.html`** | 3 Adımlı AÖL ön kayıt formu | Dönem başı kayıt şartları değiştiğinde |
| **`js/kiosk.js`** | TV saat, Parse.bot Fazilet API & Tarihte Bugün | Namaz vakitleri veya tarihçe düzenlendiğinde |
| **`assets/images/`** | Resimler, afişler ve logolar | Yeni resim/afiş eklendiğinde |

---

## 📅 2. Etkinlik Takvim Düzeni ve Kuralları

- **Öğrenci Kabul Şartı:** Yurdumuza yalnızca **9, 10 ve 11. sınıf** (AÖL 1 ila 6. Dönem) düzeyindeki erkek talebeler kabul edilmektedir. **12. sınıf / YKS adayları kabul edilmez.**
- **Aylık Dağılım:** Her kulüp ayda **1 Büyük Etkinlik**, **1 Geleneksel İkram** ve **2 ila 3 Küçük Etkinlik** düzenler.
- **Haftalık Çakışmama Kuralı:** Etkinlikler aynı haftaya denk getirilmez. Ancak ay içinde 3. bir küçük etkinlik olursa, bu 3. etkinlik büyük etkinlik veya ikram haftasıyla aynı haftada yer alabilir.
- **Küçük Etkinlik Günleri:** Pazartesi veya Salı akşamları (20:00).
- **Büyük Etkinlik & İkram Günü:** Cuma akşamları (20:00 Büyük Etkinlik, hemen ardından 21:00 Geleneksel İkram).
- **İkram İçeriği:** İkram sadece ikramdır (Geleneksel Sıcak Helva, Tatlı, Çay vb.).

---

## 📺 3. TV Kiosk (Dijital Pano) & 7 Vakit Düzeni (`kiosk.html`)

- TV ekranında namaz vakitleri **7 Vakit** olarak sıralanır:
  1. **İmsak**
  2. **Sabah**
  3. **Güneş**
  4. **Öğle**
  5. **İkindi**
  6. **Akşam**
  7. **Yatsı**
- Sıradaki namaz vaktine kalan süre saniye saniye hesaplanır ve aktif vakit kutusu parlar.
- Tam ekran yapmak için klavyeden **F** tuşuna basabilir veya sağ üstteki **⛶ Tam Ekran** butonunu kullanabilirsiniz.
- Slaytları duraklatmak için **Boşluk (Space)** tuşuna basabilirsiniz.

---

## 🔑 4. Parse.bot Fazilet API Nasıl Alınır ve Nasıl Bağlanır?

Kiosk sistemi, **Fazilet Takvimi** canlı namaz vakitlerini ve **Tarihte Bugün** kronoloji verilerini **Parse.bot** API üzerinden çeker.

### A) API Anahtarını (API Key) Alma Adımları:
1. [Parse.bot](https://parse.bot) web sitesine gidin ve ücretsiz/giriş hesabınızı oluşturun.
2. Sol menüden **Scrapers / APIs** sekmesine gelin veya yeni bir Fazilet scraper botu seçin.
3. Size özel oluşturulan **API Key (Token)** metnini kopyalayın (örnek format: `pb_live_xxxx...` veya `Bearer token`).

### B) API Anahtarını Koda Bağlama (3 Farklı Kolay Yol):

#### 1. Yöntem: `js/kiosk.js` İçinden Sabitleme (Önerilen Kalıcı Çözüm)
`js/kiosk.js` dosyasının 10. satırındaki `FAZILET_API_CONFIG` bloğuna anahtarınızı yapıştırın:
```javascript
const FAZILET_API_CONFIG = {
  endpoint: 'https://api.parse.bot/scraper/66791d4a-3a57-42ee-9a23-f5c807f44fed/get_daily_prayer_times',
  calendarEndpoint: 'https://api.parse.bot/scraper/66791d4a-3a57-42ee-9a23-f5c807f44fed/get_calendar_date_info',
  apiKey: 'BURAYA_PARSEBOT_API_KEYINIZI_YAZIN', // <-- Buraya yapıştırın
  country: 'Türkiye',
  city: 'İzmir',
  district: 'Bornova'
};
```

#### 2. Yöntem: URL Üzerinden Parametre Olarak Verme
TV tarayıcısını açarken linkin sonuna `?apiKey=ANAHTARINIZ` ekleyebilirsiniz:
`http://localhost:8000/kiosk.html?apiKey=BURAYA_ANAHTAR&city=İzmir&district=Bornova`

#### 3. Yöntem: Tarayıcı Hafızası (localStorage)
Tarayıcı geliştirici konsolundan (F12 -> Console) tek seferlik şu komutu çalıştırabilirsiniz:
```javascript
localStorage.setItem('FAZILET_API_KEY', 'BURAYA_API_ANAHTARINIZ');
```

> 🛡️ **Offline Güvencesi:** İnternet bağlantısı kesilirse veya API key girilmemişse, sistem asla hata vermez; dahili **İzmir / Bornova temkinli Fazilet veritabanı** ve **Tarihte Bugün arşivi** sıfır gecikmeyle çalışmaya devam eder.

---

## 🖼️ 5. Otomatik Galeri ve Resim Yükleme Rehberi (`galeri.html`)

Sistemde galeri **%100 tam otomatik ve canlı** hale getirilmiştir. Herhangi bir kod yazmanıza veya komut çalıştırmanıza gerek yoktur:

### A) Resimleri Klasörlere Bırakma:
- Masaüstündeki `enderun` klasörünün içindeki **`images`** klasörüne (veya `assets/images/`) resimlerinizi sürükleyip bırakmanız yeterlidir.
- Klasör ayrımı yapmak isterseniz:
  - **Kulüp Odaları İçin:** `images/kulupoda/`
  - **Yurt İçi / Dışı İçin:** `images/yurt/`
  - **Geçmiş Etkinlikler İçin:** `images/etkinlik/`
  - **Genel Resimler İçin:** Doğrudan `images/` klasörüne atabilirsiniz.

### B) İsimlendirme Kuralı (Otomatik Başlık):
Resim dosyasının adını ne yaparsanız, sitede **temiz başlık** olarak o görünür:
- `izbitech-kulup-odasi.jpg` ➔ **İzbitech Kulüp Odası**
- `yurt-on-cephe-2026-ekim.png` ➔ **Yurt Ön Cephe 2026 Ekim**
- `ahsan-buyuk-etkinlik.jpg` ➔ **Ahsan Büyük Etkinlik**

### C) Canlı Otomatik Yayınlama (Arka Plan Gözlemcisi):
Resmi klasöre sürüklediğiniz anda, sistem arka planda resmi **anında algılar** ve web sitesinde canlı yayınlar.
*(İsterseniz manuel güncelleme için terminalden `node sync-galeri.js` komutunu da çalıştırabilirsiniz.)*

---

## 🎨 6. Akıllı Logo & Resim Format Desteği (PNG / SVG / JPG)

- Sitede logolar (ör. `ahsan.svg`, `logo.svg` vb.) için **Akıllı Uzantı Çözücü** devrededir.
- Örneğin `ahsan.png` veya `ahsan.jpg` yüklediğinizde, HTML/JS kodunu açıp `.svg` uzantısını değiştirmenize **gerek yoktur**.
- Sistem `.svg` bulamazsa sırasıyla `.png`, `.jpg`, `.jpeg` ve `.webp` formatlarını arka planda kendisi bulup yükler.
