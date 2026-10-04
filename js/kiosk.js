/**
 * AHMEDİYE ENDERUN — TV & KIOSK SIGNAGE ENGINE (İZMİR / BORNOVA)
 * Real-time clock, Parse.bot Fazilet Takvimi API entegrasyonu,
 * prayer countdown, Fazilet Takvimi Tarihte Bugün & Günün Önemli Olayları,
 * rotating independent club event cards & daily Hadith/Ayet display.
 */

// ═══ 0. AKILLI RESİM UZANTI ÇÖZÜCÜ (SVG, PNG, JPG, JPEG, WEBP OTOMATİK DESTEĞİ) ═══
window.addEventListener('error', (e) => {
  if (e.target && e.target.tagName === 'IMG') {
    const img = e.target;
    const src = img.getAttribute('src');
    if (!src || src.startsWith('data:') || src.startsWith('http://') || src.startsWith('https://')) return;

    const supportedExts = ['.png', '.jpg', '.jpeg', '.webp', '.svg'];
    const tried = (img.dataset.triedExts || '').split(',').filter(Boolean);
    const lastDot = src.lastIndexOf('.');
    if (lastDot === -1) return;

    const currentExt = src.substring(lastDot).toLowerCase();
    if (!tried.includes(currentExt)) tried.push(currentExt);

    const nextExt = supportedExts.find(ext => !tried.includes(ext));
    if (nextExt) {
      tried.push(nextExt);
      img.dataset.triedExts = tried.join(',');
      const basePath = src.substring(0, lastDot);
      img.src = basePath + nextExt;
    }
  }
}, true);

// ═══ 1. PARSE.BOT FAZİLET TAKVİMİ API YAPILANDIRMASI ═══
const urlParams = new URLSearchParams(window.location.search);
const FAZILET_API_CONFIG = {
  endpoint: 'https://api.parse.bot/scraper/66791d4a-3a57-42ee-9a23-f5c807f44fed/get_daily_prayer_times',
  calendarEndpoint: 'https://api.parse.bot/scraper/66791d4a-3a57-42ee-9a23-f5c807f44fed/get_calendar_date_info',
  apiKey: urlParams.get('apiKey') || urlParams.get('key') || localStorage.getItem('parseBotApiKey') || 'pmx_a28a75b5b3cb03124c549ae85af112ab',
  country: urlParams.get('country') || 'Türkiye',
  city: urlParams.get('city') || 'İzmir',
  district: urlParams.get('district') || 'Bornova'
};

// Fazilet Takvimi Vakitleri (Canlı API ve Offline Yedek)
let activePrayerTimes = [
  { name: 'İmsak',  time: '04:32', id: 'imsak' },
  { name: 'Sabah',  time: '04:52', id: 'sabah' },
  { name: 'Güneş',  time: '06:19', id: 'gunes' },
  { name: 'Öğle',   time: '13:15', id: 'ogle' },
  { name: 'İkindi', time: '16:58', id: 'ikindi' },
  { name: 'Akşam',  time: '19:50', id: 'aksam' },
  { name: 'Yatsı',  time: '21:24', id: 'yatsi' }
];

// ═══ 2. FAZİLET TAKVİMİ — TÂRİHTE BUGÜN & GÜNÜN MÜHİM HADİSELERİ VERİTABANI (YEREL YEDEK & ARŞİV) ═══
const FAZILET_HISTORY_DATABASE = {
  // Ocak
  "1-1": [
    { year: "630", title: "Mekke-i Mükerreme'nin Fethi", desc: "Fahr-i Kâinat Efendimiz (s.a.v.) ve İslâm ordusunun Mekke-i Mükerreme'yi kansız ve sulh ile fethetmesi." },
    { year: "1926", title: "Miladi Takvimin Kabulü", desc: "Türkiye'de uluslararası saat ve miladi takvim sisteminin resmen uygulanmaya başlanması." }
  ],
  "1-15": [
    { year: "1517", title: "Yavuz Sultan Selim'in Kudüs'e Girişi", desc: "Osmanlı Padişahı Yavuz Sultan Selim Han'ın Mescid-i Aksâ ve Kudüs-i Şerîf'i teslim alması." }
  ],
  // Şubat
  "2-18": [
    { year: "1405", title: "Emir Timur'un Vefatı", desc: "Büyük Türk-İslâm hükümdarı Emir Timur'un Çin seferi yolunda Otrar'da vefatı." }
  ],
  // Mart
  "3-18": [
    { year: "1915", title: "Çanakkale Deniz Zaferi", desc: "Kahraman Osmanlı ordusu ve donanmasının Çanakkale Boğazı'nda itilaf kuvvetlerine karşı kazandığı muazzam zafer." }
  ],
  // Nisan
  "4-20": [
    { year: "571", title: "Velâdet-i Nebî (Peygamber Efendimiz'in Dünyaya Teşrifi)", desc: "Âlemlere rahmet olarak gönderilen Peygamberimiz Hazret-i Muhammed Mustafâ (s.a.v.) Efendimiz'in dünyayı şereflendirmesi." }
  ],
  // Mayıs
  "5-29": [
    { year: "1453", title: "İstanbul'un Fethi", desc: "Fâtih Sultan Mehmed Han Hazretleri'nin Peygamber müjdesine mazhar olarak İstanbul'u fethetmesi ve bir çağın kapanıp yeni bir çağın açılması." }
  ],
  // Haziran
  "6-8": [
    { year: "632", title: "Fahr-i Kâinat Efendimiz'in (s.a.v.) Ahirete İrtihâli", desc: "Server-i Kâinat Efendimiz'in (s.a.v.) refîk-i a'lâya irtihâli ve Hazret-i Ebû Bekir'in (r.a.) ilk halife seçilmesi." }
  ],
  // Temmuz
  "7-15": [
    { year: "1099", title: "Kudüs'ün Haçlılar Tarafından İşgali", desc: "Birinci Haçlı Seferi neticesinde Kudüs-i Şerif'in haçlılarca işgali ve büyük katliam yapılması." }
  ],
  // Ağustos
  "8-26": [
    { year: "1071", title: "Malazgirt Zaferi", desc: "Sultan Muhammed Alparslan komutasındaki Selçuklu ordusunun Bizans ordusunu mağlup ederek Anadolu'nun kapılarını İslâm'a açması." }
  ],
  "8-29": [
    { year: "1521", title: "Belgrad'ın Fethi", desc: "Sultan Süleyman Han (Kanuni) tarafından Orta Avrupa'nın anahtarı sayılan Belgrad Kalesi'nin Osmanlı hâkimiyetine alınması." },
    { year: "1526", title: "Mohaç Meydan Muharebesi Zaferi", desc: "Kanunî Sultan Süleyman Han komutasındaki Osmanlı ordusunun Macar ordusunu 2 saat gibi kısa bir sürede imha ettiği şanlı zafer." },
    { year: "1924", title: "Meçhul Asker Âbidesi", desc: "Dumlupınar'da Kurtuluş Savaşı kahramanları adına Meçhul Asker Âbidesi'nin temelinin atılması." }
  ],
  "8-30": [
    { year: "1922", title: "Başkomutanlık Meydan Muharebesi (Büyük Zafer)", desc: "Dumlupınar'da kazanılan büyük zaferle vatan topraklarının işgalden kurtarılmasında dönüm noktası olan zafer." }
  ],
  // Eylül
  "9-9": [
    { year: "1922", title: "İzmir'in Düşman İşgalinden Kurtuluşu", desc: "Kahraman Türk ordusunun İzmir'e girerek şehri ve vatanı nihai zafere kavuşturması." }
  ],
  "9-28": [
    { year: "1538", title: "Preveze Deniz Zaferi", desc: "Kaptan-ı Derya Barbaros Hayreddin Paşa'nın Haçlı donanmasını bozguna uğratarak Akdeniz'i bir Türk gölü haline getirdiği şanlı deniz zaferi." }
  ],
  // Ekim
  "10-29": [
    { year: "1923", title: "Cumhuriyetin İlânı", desc: "Türkiye Büyük Millet Meclisi'nde Cumhuriyet idaresinin resmen kabul ve ilân edilmesi." }
  ],
  // Kasım
  "11-3": [
    { year: "1839", title: "Gülhane Hatt-ı Hümâyûnu (Tanzimat Fermanı)", desc: "Sultan Abdülmecid Han devrinde Osmanlı idaresinde reform fermanının okunması." }
  ],
  // Aralık
  "12-25": [
    { year: "1144", title: "İmâdeddin Zengî'nin Urfa'yı Fethi", desc: "Haçlı Kontluğu'nun ortadan kaldırılarak Urfa'nın İslâm topraklarına yeniden dahil edilmesi." }
  ]
};

// Genel gün doldurucu Fazilet Takvimi tarihî anekdotları (Veritabanında spesifik gün yoksa kullanılır)
const GENERAL_FAZILET_CHRONOLOGY = [
  { year: "İrfan", title: "Fazilet Takvimi Tarih Notu", desc: "İslâm ve Osmanlı medeniyeti, vakit disiplinini ve ilim meclislerini hayatın merkezine alarak asırlar boyu dünyaya nizam vermiştir." },
  { year: "Enderun", title: "Enderun İrfan Mektebi", desc: "1972'den bugüne Ahmediye Enderun Talebe Yurdu; talebelerine ilim, ahlâk, samimiyet ve yüksek teknoloji şuurunu aşılamaktadır." },
  { year: "Tarih", title: "Ecdat Yadigârı Vakıf Medeniyeti", desc: "Her günü bir hayır ve ibadet fırsatı bilmek, cemiyete faydalı nesiller yetiştirmek kadim Enderun geleneğidir." }
];

document.addEventListener('DOMContentLoaded', () => {
  initClockAndDate();
  fetchFaziletData();
  fetchBornovaWeather();
  initPrayerCountdown();
  initKioskSlideRotation();
  initKioskControls();

  // Bornova canlı hava durumunu 10 dakikada bir otomatik tazele
  setInterval(fetchBornovaWeather, 10 * 60 * 1000);
});

/* ═══ 3. PARSE.BOT FAZİLET API'DEN VAKİTLER VE TARİHTE BUGÜN VERİLERİNİ ÇEKME ═══ */
async function fetchFaziletData() {
  const sourceBadge = document.getElementById('kPrayerSource');
  const now = new Date();
  const dateKey = `${now.getMonth() + 1}-${now.getDate()}`;
  
  // Önce yerel Fazilet verilerini anında ekrana bas (Sıfır gecikme)
  updatePrayerUI();
  renderHistoryEvents(FAZILET_HISTORY_DATABASE[dateKey] || GENERAL_FAZILET_CHRONOLOGY, now);

  if (!FAZILET_API_CONFIG.apiKey) {
    console.log('ℹ️ Fazilet API: API key tanımlanmadı (Parse.bot). Yerel Fazilet Takvimi veritabanı aktif.');
    if (sourceBadge) sourceBadge.textContent = 'İzmir / Bornova (Fazilet Takvimi)';
    return;
  }

  try {
    if (sourceBadge) {
      sourceBadge.textContent = '🔄 Fazilet API Bağlanıyor...';
      sourceBadge.style.color = '#facc15';
    }

    const url = new URL(FAZILET_API_CONFIG.endpoint);
    url.searchParams.append('country', FAZILET_API_CONFIG.country);
    url.searchParams.append('city', FAZILET_API_CONFIG.city);
    url.searchParams.append('district', FAZILET_API_CONFIG.district);

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'X-API-Key': FAZILET_API_CONFIG.apiKey,
        'Authorization': `Bearer ${FAZILET_API_CONFIG.apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Parse.bot API Yanıtı: ${response.status} ${response.statusText}`);
    }

    const resJson = await response.json();
    console.log('✅ Parse.bot Fazilet API verisi başarıyla alındı:', resJson);

    const root = resJson.data || resJson;
    const prayerTimesList = root.prayer_times || resJson.prayer_times || [];

    // Bugünün tarihini (YYYY-MM-DD) bul ve eşleştir
    const year = now.getFullYear();
    const monthStr = String(now.getMonth() + 1).padStart(2, '0');
    const dayStr = String(now.getDate()).padStart(2, '0');
    const todayDateStr = `${year}-${monthStr}-${dayStr}`;

    let todayData = null;
    if (Array.isArray(prayerTimesList) && prayerTimesList.length > 0) {
      todayData = prayerTimesList.find(item => item.date === todayDateStr) || prayerTimesList[0];
    } else if (typeof prayerTimesList === 'object') {
      todayData = prayerTimesList;
    }

    // 1. Namaz Vakitlerini Çözümle
    const times = todayData?.times || todayData || {};

    if (times) {
      if (times.imsak) activePrayerTimes[0].time = cleanTimeStr(times.imsak);
      if (times.sabah) {
        activePrayerTimes[1].time = cleanTimeStr(times.sabah);
      } else if (times.imsak) {
        activePrayerTimes[1].time = addMinutesToTime(cleanTimeStr(times.imsak), 20);
      }
      if (times.gunes || times.güneş) activePrayerTimes[2].time = cleanTimeStr(times.gunes || times.güneş);
      if (times.ogle || times.öğle) activePrayerTimes[3].time = cleanTimeStr(times.ogle || times.öğle);
      if (times.ikindi) activePrayerTimes[4].time = cleanTimeStr(times.ikindi);
      if (times.aksam || times.akşam) activePrayerTimes[5].time = cleanTimeStr(times.aksam || times.akşam);
      if (times.yatsi || times.yatsı) activePrayerTimes[6].time = cleanTimeStr(times.yatsi || times.yatsı);

      updatePrayerUI();
    }

    // 2. Hicri Tarihi Güncelle
    const hijriVal = todayData?.hicri_tarih || root.hicri_tarih || root.hijri_date || resJson.hicri;
    const regionName = root.region_name || FAZILET_API_CONFIG.city || 'İzmir';
    if (hijriVal) {
      const hijriEl = document.getElementById('kDateHijri');
      if (hijriEl) {
        hijriEl.textContent = `${hijriVal} • ${regionName}`;
      }
    }

    // 3. Fazilet Takvimi "Tarihte Bugün / Önemli Hadiseler" (Chronology) Çözümle
    let apiChronology = todayData?.chronology || root.chronology || root.historical_events || root.tarihte_bugun;
    
    if (apiChronology && Array.isArray(apiChronology) && apiChronology.length > 0) {
      const parsedEvents = apiChronology.map(item => {
        if (typeof item === 'string') {
          const matchYear = item.match(/\((\d{3,4})\)/);
          if (matchYear) {
            return {
              year: matchYear[1],
              title: "Tarihî Hadise",
              desc: item.replace(matchYear[0], '').trim()
            };
          }
          const parts = item.split(/[:–-]/);
          if (parts.length > 1 && /^\d+$/.test(parts[0].trim())) {
            return {
              year: parts[0].trim(),
              title: "Tarihî Hadise",
              desc: parts.slice(1).join(' ').trim()
            };
          }
          return { year: "Mühim Olay", title: "", desc: item };
        } else if (typeof item === 'object') {
          return {
            year: item.year || item.tarih || item.yil || "Tarih",
            title: item.title || item.baslik || "",
            desc: item.event || item.description || item.desc || item.hadise || JSON.stringify(item)
          };
        }
        return { year: "Tarih", title: "", desc: String(item) };
      });

      renderHistoryEvents(parsedEvents, now);
    } else {
      // API'de o gün için özel chronology yoksa zengin yerel Fazilet tarihçesini göster
      renderHistoryEvents(FAZILET_HISTORY_DATABASE[dateKey] || GENERAL_FAZILET_CHRONOLOGY, now);
    }

    // 4. Günün Âyet & Hadis Bilgisi Varsa Güncelle
    const apiAyah = root.gunun_ayeti || root.ayet || todayData?.gunun_ayeti;
    const apiHadith = root.gunun_hadisi || root.hadis || todayData?.gunun_hadisi;
    if (apiAyah || apiHadith) {
      updateWisdomUI(apiAyah, apiHadith);
    }

    if (sourceBadge) {
      const regionBadge = root.region_name ? `${root.region_name} (Fazilet API)` : 'Fazilet API Canlı';
      sourceBadge.textContent = `⚡ ${regionBadge}`;
      sourceBadge.style.color = '#38bdf8';
    }

  } catch (err) {
    console.warn('⚠️ Fazilet API bağlantı uyarısı (Offline yedek aktif):', err.message);
    if (sourceBadge) {
      sourceBadge.textContent = 'İzmir / Bornova (Fazilet Takvimi)';
      sourceBadge.style.color = '#cbd5e1';
    }
    updatePrayerUI();
    renderHistoryEvents(FAZILET_HISTORY_DATABASE[dateKey] || GENERAL_FAZILET_CHRONOLOGY, now);
  }
}

// Saat stringini temizle ve UTC ISO formatını Türkiye saatine (Europe/Istanbul) dönüştür
function cleanTimeStr(t) {
  if (!t) return '--:--';
  if (typeof t === 'string' && (t.includes('T') || t.includes('Z'))) {
    const d = new Date(t);
    if (!isNaN(d.getTime())) {
      return d.toLocaleTimeString('tr-TR', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: 'Europe/Istanbul'
      });
    }
  }
  const str = String(t).trim();
  const parts = str.split(':');
  if (parts.length >= 2) {
    return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`;
  }
  return str;
}

// Belirli bir saate dakika ekleme (Sabah vakti hesaplaması vb.)
function addMinutesToTime(t, minsToAdd) {
  if (!t || t.includes('--')) return t;
  const parts = t.split(':').map(Number);
  if (parts.length < 2 || isNaN(parts[0]) || isNaN(parts[1])) return t;
  let totalMins = parts[0] * 60 + parts[1] + minsToAdd;
  totalMins = (totalMins % 1440 + 1440) % 1440;
  const h = Math.floor(totalMins / 60);
  const m = totalMins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

// ═══ 4. TARİHTE BUGÜN & GÜNÜN ÖNEMLİ OLAYLARINI RENDER ETME ═══
function renderHistoryEvents(eventsList, dateObj) {
  const container = document.getElementById('kHistoryContainer');
  const dateBadge = document.getElementById('kHistoryDateBadge');

  const monthsTr = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ];

  if (dateBadge && dateObj) {
    dateBadge.textContent = `${dateObj.getDate()} ${monthsTr[dateObj.getMonth()]}`;
  }

  if (!container) return;

  if (!eventsList || eventsList.length === 0) {
    container.innerHTML = `
      <div class="k-history-empty">
        <span>📜 Bugün için kayıtlı özel bir tarihî hadise bulunmuyor.</span>
      </div>
    `;
    return;
  }

  let html = '';
  eventsList.forEach(ev => {
    const yearLabel = ev.year ? `<span class="k-history-year">${ev.year}</span>` : `<span class="k-history-year">📌</span>`;
    const titlePart = ev.title ? `<strong>${ev.title}:</strong> ` : '';
    html += `
      <div class="k-history-item">
        ${yearLabel}
        <div class="k-history-desc">
          ${titlePart}${ev.desc}
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

// UI kartlarını vakitlerle güncelle
function updatePrayerUI() {
  activePrayerTimes.forEach(p => {
    const card = document.getElementById('pCard-' + p.id);
    if (card) {
      const timeEl = card.querySelector('.k-prayer-time');
      if (timeEl) timeEl.textContent = p.time;
    }
  });
}

// Günün Âyet ve Hadisini Güncelle
function updateWisdomUI(ayah, hadith) {
  if (ayah) {
    const ayahEl = document.getElementById('kAyahText');
    const ayahRefEl = document.getElementById('kAyahRef');
    if (ayahEl) {
      if (typeof ayah === 'object') {
        ayahEl.textContent = `“${ayah.text || ayah.metin || ''}”`;
        if (ayahRefEl && (ayah.ref || ayah.sure)) ayahRefEl.textContent = `— ${ayah.ref || ayah.sure}`;
      } else {
        ayahEl.textContent = `“${ayah}”`;
      }
    }
  }

  if (hadith) {
    const hadithEl = document.getElementById('kHadithText');
    const hadithRefEl = document.getElementById('kHadithRef');
    if (hadithEl) {
      if (typeof hadith === 'object') {
        hadithEl.textContent = `“${hadith.text || hadith.metin || ''}”`;
        if (hadithRefEl && (hadith.ref || hadith.kaynak)) hadithRefEl.textContent = `— ${hadith.ref || hadith.kaynak}`;
      } else {
        hadithEl.textContent = `“${hadith}”`;
      }
    }
  }
}

/* ═══ 5. CANLI SAAT VE TARİH (İZMİR) ═══ */
let lastDayChecked = -1;
function initClockAndDate() {
  const clockEl = document.getElementById('kClock');
  const dateGregorianEl = document.getElementById('kDateGregorian');
  const dateHijriEl = document.getElementById('kDateHijri');

  const daysTr = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
  const monthsTr = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ];

  function update() {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    const s = String(now.getSeconds()).padStart(2, '0');

    if (clockEl) clockEl.textContent = `${h}:${m}:${s}`;

    const currentDay = now.getDate();
    if (lastDayChecked !== -1 && lastDayChecked !== currentDay) {
      // Gece 00:00 devrinde yeni günün verilerini otomatik yenile
      console.log('🌙 Gün değişti, Fazilet verileri tazeleniyor...');
      fetchFaziletData();
    }
    lastDayChecked = currentDay;

    const dayName = daysTr[now.getDay()];
    const day = now.getDate();
    const month = monthsTr[now.getMonth()];
    const year = now.getFullYear();

    if (dateGregorianEl) {
      dateGregorianEl.textContent = `${day} ${month} ${year}, ${dayName}`;
    }

    if (dateHijriEl && !dateHijriEl.textContent.includes('•')) {
      dateHijriEl.textContent = '16 Safer 1448 • İzmir / Bornova';
    }
  }

  update();
  setInterval(update, 1000);
}

/* ═══ 6. FAZİLET VAKİT GERİ SAYIMI ═══ */
function initPrayerCountdown() {
  const nextPrayerNameEl = document.getElementById('kNextPrayerName');
  const countdownDigitsEl = document.getElementById('kCountdownDigits');
  const prayerCards = document.querySelectorAll('.k-prayer-card');

  function calculate() {
    const now = new Date();
    const currentMins = now.getHours() * 60 + now.getMinutes();

    let nextPrayer = activePrayerTimes[0];
    let activeIndex = activePrayerTimes.length - 1;

    for (let i = 0; i < activePrayerTimes.length; i++) {
      const [ph, pm] = activePrayerTimes[i].time.split(':').map(Number);
      const prayerMins = ph * 60 + pm;

      if (prayerMins > currentMins) {
        nextPrayer = activePrayerTimes[i];
        activeIndex = i > 0 ? i - 1 : activePrayerTimes.length - 1;
        break;
      }
    }

    prayerCards.forEach((card, idx) => {
      if (idx === activeIndex) {
        card.classList.add('active');
      } else {
        card.classList.remove('active');
      }
    });

    if (nextPrayerNameEl) {
      nextPrayerNameEl.textContent = `${nextPrayer.name} Vaktine Kalan:`;
    }

    const [nh, nm] = nextPrayer.time.split(':').map(Number);
    let targetTime = new Date();
    targetTime.setHours(nh, nm, 0, 0);

    if (targetTime < now) {
      targetTime.setDate(targetTime.getDate() + 1);
    }

    const diffSecTotal = Math.max(0, Math.floor((targetTime - now) / 1000));
    const dh = Math.floor(diffSecTotal / 3600);
    const dm = Math.floor((diffSecTotal % 3600) / 60);
    const ds = diffSecTotal % 60;

    if (countdownDigitsEl) {
      countdownDigitsEl.textContent = `${String(dh).padStart(2, '0')}:${String(dm).padStart(2, '0')}:${String(ds).padStart(2, '0')}`;
    }
  }

  calculate();
  setInterval(calculate, 1000);
}

/* ═══ 7. KIOSK SLIDE AUTO-ROTATION ═══ */
let slideInterval = null;
let isPaused = false;
let currentSlideIndex = 0;

function initKioskSlideRotation() {
  const slides = document.querySelectorAll('.k-slide-item');
  const progressBar = document.getElementById('kSlideProgress');
  const totalSlides = slides.length;

  if (!totalSlides) return;

  function showSlide(index) {
    slides.forEach((s, idx) => {
      s.classList.toggle('active', idx === index);
    });

    if (progressBar) {
      progressBar.style.width = '0%';
      progressBar.style.transition = 'none';
      requestAnimationFrame(() => {
        progressBar.style.transition = 'width 8s linear';
        progressBar.style.width = '100%';
      });
    }
  }

  showSlide(0);

  function nextSlide() {
    if (isPaused) return;
    currentSlideIndex = (currentSlideIndex + 1) % totalSlides;
    showSlide(currentSlideIndex);
  }

  slideInterval = setInterval(nextSlide, 8000);
  window.kioskNextSlide = () => {
    currentSlideIndex = (currentSlideIndex + 1) % totalSlides;
    showSlide(currentSlideIndex);
  };
  window.kioskPrevSlide = () => {
    currentSlideIndex = (currentSlideIndex - 1 + totalSlides) % totalSlides;
    showSlide(currentSlideIndex);
  };
}

/* ═══ 8. KIOSK CONTROLS & PARSE.BOT API AYARI ═══ */
function initKioskControls() {
  const pauseBtn = document.getElementById('kPauseBtn');
  const fsBtn = document.getElementById('kFsBtn');

  pauseBtn?.addEventListener('click', () => {
    isPaused = !isPaused;
    pauseBtn.textContent = isPaused ? '▶ Oynat' : '⏸ Duraklat';
  });

  fsBtn?.addEventListener('click', () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error('Fullscreen error:', err);
      });
      fsBtn.textContent = '🗗 Küçült';
    } else {
      document.exitFullscreen();
      fsBtn.textContent = '⛶ Tam Ekran';
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'f' || e.key === 'F') {
      fsBtn?.click();
    } else if (e.code === 'Space') {
      pauseBtn?.click();
    } else if (e.key === 'ArrowRight') {
      window.kioskNextSlide?.();
    } else if (e.key === 'ArrowLeft') {
      window.kioskPrevSlide?.();
    }
  });
}

/* ═══ 9. BORNOVA CANLI HAVA DURUMU (OPEN-METEO ÜCRETSİZ API) ═══ */
const WMO_WEATHER_MAP = {
  0: { desc: 'Açık & Güneşli', icon: '☀️' },
  1: { desc: 'Az Bulutlu', icon: '🌤️' },
  2: { desc: 'Parçalı Bulutlu', icon: '⛅' },
  3: { desc: 'Bulutlu', icon: '☁️' },
  45: { desc: 'Sisli', icon: '🌫️' },
  48: { desc: 'Yoğun Sisli', icon: '🌫️' },
  51: { desc: 'Hafif Çisenti', icon: '🌧️' },
  53: { desc: 'Çiseleyen Yağmur', icon: '🌧️' },
  55: { desc: 'Yoğun Çisenti', icon: '🌧️' },
  61: { desc: 'Hafif Yağmurlu', icon: '🌧️' },
  63: { desc: 'Yağmurlu', icon: '🌧️' },
  65: { desc: 'Kuvvetli Yağmurlu', icon: '🌧️' },
  71: { desc: 'Hafif Karlı', icon: '❄️' },
  73: { desc: 'Karlı', icon: '❄️' },
  75: { desc: 'Yoğun Karlı', icon: '❄️' },
  80: { desc: 'Sağanak Yağışlı', icon: '🌦️' },
  81: { desc: 'Kuvvetli Sağanak', icon: '🌦️' },
  82: { desc: 'Şiddetli Sağanak', icon: '🌦️' },
  95: { desc: 'Gök Gürültülü Fırtına', icon: '🌩️' },
  96: { desc: 'Gök Gürültülü Dolu', icon: '⛈️' },
  99: { desc: 'Şiddetli Fırtına', icon: '⛈️' }
};

async function fetchBornovaWeather() {
  const iconEl = document.getElementById('kWeatherIcon');
  const tempEl = document.getElementById('kWeatherTemp');
  const descEl = document.getElementById('kWeatherDesc');
  const apparentEl = document.getElementById('kWeatherApparent');
  const humidityEl = document.getElementById('kWeatherHumidity');
  const windEl = document.getElementById('kWeatherWind');

  if (!tempEl) return;

  try {
    const response = await fetch(
      'https://api.open-meteo.com/v1/forecast?latitude=38.4622&longitude=27.2164&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m&timezone=Europe%2FIstanbul'
    );

    if (!response.ok) throw new Error('Hava durumu verisi alınamadı');

    const data = await response.json();
    const current = data.current;

    const temp = Math.round(current.temperature_2m);
    const apparent = Math.round(current.apparent_temperature);
    const humidity = current.relative_humidity_2m;
    const wind = Math.round(current.wind_speed_10m);
    const code = current.weather_code;

    const weatherInfo = WMO_WEATHER_MAP[code] || { desc: 'Açık', icon: '☀️' };

    let icon = weatherInfo.icon;
    if (current.is_day === 0 && code === 0) {
      icon = '🌙';
    } else if (current.is_day === 0 && (code === 1 || code === 2)) {
      icon = '🌤️';
    }

    if (iconEl) iconEl.textContent = icon;
    if (tempEl) tempEl.textContent = temp;
    if (descEl) descEl.textContent = weatherInfo.desc;
    if (apparentEl) apparentEl.textContent = apparent;
    if (humidityEl) humidityEl.textContent = `%${humidity}`;
    if (windEl) windEl.textContent = `${wind} km/s`;

    console.log(`🌤️ Bornova Canlı Hava Durumu Güncellendi: ${temp}°C, ${weatherInfo.desc}`);
  } catch (err) {
    console.warn('⚠️ Bornova hava durumu canlı bağlantı uyarısı (Offline yedek aktif):', err.message);
    if (tempEl && tempEl.textContent === '--') {
      if (iconEl) iconEl.textContent = '☀️';
      if (tempEl) tempEl.textContent = '28';
      if (descEl) descEl.textContent = 'Açık & Güneşli';
      if (apparentEl) apparentEl.textContent = '27';
      if (humidityEl) humidityEl.textContent = '%40';
      if (windEl) windEl.textContent = '15 km/s';
    }
  }
}
