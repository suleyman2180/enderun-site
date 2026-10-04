/**
 * AHMEDİYE ENDERUN — OTOMATİK GALERİ SENKRONİZASYON & CANLI GÖZLEMCİ MOTORU
 * assets/images (veya images) klasörüne resim eklendiğinde, silindiğinde veya değiştirildiğinde
 * galeriyi otomatik günceller ve js/galeri-data.js ile assets/images/galeri.json üretir.
 */

const fs = require('fs');
const path = require('path');

const BASE_DIR = __dirname;
const TARGET_DIR = 'assets/images';

const EXCLUDED_PATHS = [
  'patterns',
  'clubs',
  'posters',
  'logo.svg',
  'galeri.json'
];

const VALID_EXTS = ['.jpg', '.jpeg', '.png', '.webp', '.svg', '.gif'];

const WORD_REPLACEMENTS = {
  "kulup": "Kulüp", "kulubu": "Kulübü", "odasi": "Odası", "on": "Ön",
  "buyuk": "Büyük", "kucuk": "Küçük", "atolye": "Atölye", "atolyesi": "Atölyesi",
  "kutuphane": "Kütüphane", "kutuphanesi": "Kütüphanesi", "doga": "Doğa",
  "ogrenci": "Öğrenci", "muhendisi": "Mühendisi", "yerleske": "Yerleşke",
  "yerleskesi": "Yerleşkesi", "ic": "İç", "dis": "Dış", "sergi": "Sergisi",
  "faaliyet": "Faaliyeti", "meclis": "Meclisi", "etut": "Etüt", "bahce": "Bahçe",
  "cephe": "Cephe", "foto": "Fotoğrafı", "fotografi": "Fotoğrafı", "resim": "Resmi"
};

const TR_UPPER = { "i": "İ", "ı": "I", "ç": "Ç", "ş": "Ş", "ğ": "Ğ", "ü": "Ü", "ö": "Ö" };

function formatTitleFromFilename(fileName) {
  let name = fileName.replace(/\.[^/.]+$/, "");
  name = name.replace(/[-_]+/g, " ").trim();

  return name.split(/\s+/).map(w => {
    if (!w) return "";
    const lower = w.toLowerCase();
    if (WORD_REPLACEMENTS[lower]) return WORD_REPLACEMENTS[lower];
    const firstChar = w.charAt(0);
    const upperFirst = TR_UPPER[firstChar.toLowerCase()] || firstChar.toUpperCase();
    return upperFirst + w.slice(1);
  }).join(" ");
}

function scanGallery() {
  const items = [];
  const seenPaths = new Set();

  function scanDir(dirRelative) {
    const fullDir = path.join(BASE_DIR, dirRelative);
    if (!fs.existsSync(fullDir)) return;

    let entries = [];
    try {
      entries = fs.readdirSync(fullDir, { withFileTypes: true });
    } catch (e) {
      return;
    }

    for (const entry of entries) {
      const relPath = path.join(dirRelative, entry.name).replace(/\\/g, '/');

      // Gizli ve sistem dosyalarını atla
      if (entry.name.startsWith('.') || entry.name === 'Thumbs.db') continue;

      // Özel UI klasörlerini ve sistem çıktılarını atla
      const isExcluded = EXCLUDED_PATHS.some(ex => 
        relPath === `${TARGET_DIR}/${ex}` || relPath.startsWith(`${TARGET_DIR}/${ex}/`)
      );
      if (isExcluded) continue;

      if (entry.isDirectory()) {
        scanDir(relPath);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (!VALID_EXTS.includes(ext)) continue;

        if (seenPaths.has(relPath)) continue;
        seenPaths.add(relPath);

        let category = 'yurt';
        const lowerRel = relPath.toLowerCase();
        if (lowerRel.includes('kulupoda') || lowerRel.includes('kulüpoda') || lowerRel.includes('odalar')) {
          category = 'odalar';
        } else if (lowerRel.includes('etkinlik')) {
          category = 'etkinlik';
        } else if (lowerRel.includes('yurt')) {
          category = 'yurt';
        }

        const title = formatTitleFromFilename(entry.name);
        items.push({
          title: title,
          src: relPath,
          category: category,
          filename: entry.name
        });
      }
    }
  }

  scanDir(TARGET_DIR);

  const jsContent = `/**
 * AHMEDİYE ENDERUN — DİNAMİK GALERİ VERİTABANI
 * assets/images/ altındaki klasörlerden otomatik üretilmiştir.
 * Otomatik gözlemci motoru (sync-galeri.js --watch) tarafından güncellenir.
 */
window.ENDERUN_GALLERY_ITEMS = ${JSON.stringify(items, null, 2)};
`;

  fs.writeFileSync(path.join(BASE_DIR, 'js/galeri-data.js'), jsContent, 'utf-8');
  fs.writeFileSync(path.join(BASE_DIR, 'assets/images/galeri.json'), JSON.stringify(items, null, 2), 'utf-8');

  console.log(`[${new Date().toLocaleTimeString('tr-TR')}] ✅ Galeri senkronize edildi: Toplam ${items.length} görsel listelendi.`);
  return items;
}

let debounceTimer = null;
function triggerSync(event, filename) {
  if (filename && (filename.includes('galeri.json') || filename.includes('galeri-data.js') || filename.startsWith('.'))) {
    return;
  }
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    console.log(`\n🔔 [OTOMATİK YAYINLAMA] Değişiklik algılandı (${event}: ${filename || 'resim'}). Galeri güncelleniyor...`);
    scanGallery();
  }, 300);
}

const isWatchMode = process.argv.includes('--watch') || process.env.WATCH_MODE === '1';

if (isWatchMode) {
  scanGallery();
  console.log('\n👀 [CANLI GÖZLEMCİ AKTİF] Masaüstü Enderun "images" klasörü izleniyor.');
  console.log('🖼️ Bu klasöre yeni resim attığınızda, sildiğinizde veya değiştirdiğinizde site anında güncellenecektir!\n');

  const watchDir = path.join(BASE_DIR, TARGET_DIR);
  try {
    fs.watch(watchDir, { recursive: true }, (event, filename) => {
      triggerSync(event, filename);
    });
  } catch (err) {
    console.error('⚠️ İzleme başlatılırken hata oluştu:', err);
  }
} else {
  scanGallery();
}
