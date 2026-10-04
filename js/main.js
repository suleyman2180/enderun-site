// ═══ 0. AKILLI RESİM UZANTI ÇÖZÜCÜ (SVG, PNG, JPG, JPEG, WEBP OTOMATİK DESTEĞİ) ═══
// Kodda uzantıyı değiştirmeye gerek kalmadan, kullanıcı ahsan.png yüklediğinde otomatik bulur
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

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initCounters();
  initDynamicGallery();
  initGalleryFilter();
  initLightbox();
  initFaqAccordion();
  initFaqSearch();
  initMonthSelector();
  initToasts();
});

/* ═══ 1. NAVBAR & MOBILE MENU ═══ */
function initNavbar() {
  const header = document.querySelector('.site-header');
  const mobileToggle = document.querySelector('.mobile-toggle');
  const navContainer = document.querySelector('.nav-pill-container');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header?.classList.add('scrolled');
    } else {
      header?.classList.remove('scrolled');
    }
  }, { passive: true });

  if (mobileToggle && navContainer) {
    mobileToggle.addEventListener('click', () => {
      navContainer.classList.toggle('open');
      const isOpen = navContainer.classList.contains('open');
      mobileToggle.setAttribute('aria-expanded', isOpen);
    });

    document.addEventListener('click', (e) => {
      if (!header.contains(e.target) && navContainer.classList.contains('open')) {
        navContainer.classList.remove('open');
        mobileToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }
}

/* ═══ 2. STATS NUMBER COUNTER ANIMATION ═══ */
function initCounters() {
  const counterElements = document.querySelectorAll('.stat-num[data-target]');
  if (!counterElements.length) return;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.getAttribute('data-target'), 10);
        const prefix = el.getAttribute('data-prefix') || '';
        const suffix = el.getAttribute('data-suffix') || '';
        const duration = 1800;
        const start = 0;
        const startTime = performance.now();

        function updateCounter(currentTime) {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const easeOut = 1 - Math.pow(1 - progress, 3);
          const current = Math.floor(start + (target - start) * easeOut);

          el.textContent = `${prefix}${current.toLocaleString('tr-TR')}${suffix}`;

          if (progress < 1) {
            requestAnimationFrame(updateCounter);
          } else {
            el.textContent = `${prefix}${target.toLocaleString('tr-TR')}${suffix}`;
          }
        }

        requestAnimationFrame(updateCounter);
        obs.unobserve(el);
      }
    });
  }, { threshold: 0.2 });

  counterElements.forEach(el => observer.observe(el));
}

/* ═══ 3. DİNAMİK GALERİ YÜKLEYİCİ (OTOMATİK YAYINLAMA & CANLI GÜNCELLEME) ═══ */
function initDynamicGallery() {
  const grid = document.querySelector('.gallery-grid');
  if (!grid) return;

  function renderGallery(items) {
    if (!Array.isArray(items) || items.length === 0) return;
    grid.innerHTML = items.map(item => `
      <div class="gallery-item" data-category="${item.category}">
        <img src="${item.src}" alt="${item.title}">
        <div class="gallery-item-overlay">
          <div class="gallery-item-title">${item.title}</div>
        </div>
      </div>
    `).join('');
  }

  // 1. İlk render (galeri-data.js üzerinden)
  if (Array.isArray(window.ENDERUN_GALLERY_ITEMS)) {
    renderGallery(window.ENDERUN_GALLERY_ITEMS);
  }

  // 2. Canlı senkronizasyon (galeri.json üzerinden periyodik kontrol)
  let lastJsonStr = '';
  function checkLiveGalleryUpdates() {
    fetch('assets/images/galeri.json?t=' + Date.now())
      .then(res => res.json())
      .then(data => {
        const jsonStr = JSON.stringify(data);
        if (jsonStr !== lastJsonStr) {
          lastJsonStr = jsonStr;
          window.ENDERUN_GALLERY_ITEMS = data;
          renderGallery(data);

          // Aktif filtre seçiliyse tekrar uygula
          const activeBtn = document.querySelector('.gallery-filter-btn.active');
          if (activeBtn) {
            const filter = activeBtn.getAttribute('data-filter');
            document.querySelectorAll('.gallery-item').forEach(item => {
              const cat = item.getAttribute('data-category');
              item.style.display = (filter === 'all' || cat === filter) ? 'block' : 'none';
            });
          }
        }
      })
      .catch(() => {});
  }

  checkLiveGalleryUpdates();
  setInterval(checkLiveGalleryUpdates, 4000);
}

/* ═══ 4. GALLERY FILTERING ═══ */
function initGalleryFilter() {
  const filterBtns = document.querySelectorAll('.gallery-filter-btn');
  if (!filterBtns.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');
      const galleryItems = document.querySelectorAll('.gallery-item');

      galleryItems.forEach(item => {
        const cat = item.getAttribute('data-category');
        if (filter === 'all' || cat === filter) {
          item.style.display = 'block';
          item.style.animation = 'fadeInDown 0.4s ease forwards';
        } else {
          item.style.display = 'none';
        }
      });
    });
  });
}

/* ═══ 5. GALLERY LIGHTBOX MODAL ═══ */
function initLightbox() {
  const lightbox = document.getElementById('galleryLightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const lightboxClose = document.getElementById('lightboxClose');

  if (!lightbox) return;

  // Dinamik olarak eklenen veya mevcut galeri elemanlarına tıklama olayını delege et
  document.addEventListener('click', (e) => {
    const item = e.target.closest('.gallery-item');
    if (!item) return;

    const img = item.querySelector('img');
    const title = item.querySelector('.gallery-item-title')?.textContent || '';

    if (img && lightboxImg) {
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt || title;
    }
    if (lightboxCaption) {
      lightboxCaption.innerHTML = `<strong style="font-size: 1.15rem; color: #fff;">${title}</strong>`;
    }
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  });

  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  }

  lightboxClose?.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('active')) {
      closeLightbox();
    }
  });
}

/* ═══ 6. FAQ ACCORDION ═══ */
function initFaqAccordion() {
  const accordions = document.querySelectorAll('.faq-accordion-item');
  if (!accordions.length) return;

  accordions.forEach(item => {
    const btn = item.querySelector('.faq-question-btn');
    btn?.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      
      const parentGroup = item.closest('.faq-category-group');
      if (parentGroup) {
        parentGroup.querySelectorAll('.faq-accordion-item').forEach(sibling => {
          sibling.classList.remove('active');
        });
      }

      if (!isActive) {
        item.classList.add('active');
      }
    });
  });
}

/* ═══ 6. FAQ LIVE INSTANT SEARCH ═══ */
function initFaqSearch() {
  const searchInput = document.getElementById('faqSearchInput');
  const faqItems = document.querySelectorAll('.faq-accordion-item');
  const noResultMsg = document.getElementById('faqNoResults');

  if (!searchInput || !faqItems.length) return;

  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    let visibleCount = 0;

    faqItems.forEach(item => {
      const question = item.querySelector('.faq-question-btn')?.textContent.toLowerCase() || '';
      const answer = item.querySelector('.faq-answer-panel')?.textContent.toLowerCase() || '';

      if (question.includes(query) || answer.includes(query)) {
        item.style.display = 'block';
        visibleCount++;
      } else {
        item.style.display = 'none';
      }
    });

    if (noResultMsg) {
      noResultMsg.style.display = visibleCount === 0 ? 'block' : 'none';
    }
  });
}

/* ═══ 7. MONTH SELECTOR FOR EVENTS PANO ═══ */
function initMonthSelector() {
  const monthBtns = document.querySelectorAll('.month-btn');
  const eventSections = document.querySelectorAll('.month-events-wrapper');

  if (!monthBtns.length || !eventSections.length) return;

  monthBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      monthBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const targetMonth = btn.getAttribute('data-month');

      eventSections.forEach(sec => {
        if (sec.getAttribute('data-month') === targetMonth) {
          sec.style.display = 'grid';
          sec.style.animation = 'fadeInDown 0.35s ease forwards';
        } else {
          sec.style.display = 'none';
        }
      });
    });
  });
}

/* ═══ 8. TOAST NOTIFICATION UTILITY ═══ */
function showToast(message, type = 'info') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  
  let icon = 'ℹ️';
  if (type === 'success') icon = '✅';
  if (type === 'warning') icon = '⚠️';

  toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

function initToasts() {
  window.showToast = showToast;
}
