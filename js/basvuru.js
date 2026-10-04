/**
 * AHMEDİYE ENDERUN — APPLICATION WIZARD (3 ADIMLI ÖN KAYIT)
 * (Kulüp seçimi kayıt esnasında yapılmaz, kabul ve mülakat sonrası belirlenir)
 */

document.addEventListener('DOMContentLoaded', () => {
  initApplicationWizard();
});

function initApplicationWizard() {
  const form = document.getElementById('enderunAppForm');
  const steps = document.querySelectorAll('.wizard-step-panel');
  const progressBars = document.querySelectorAll('.wizard-step-indicator');
  const nextBtns = document.querySelectorAll('.btn-wizard-next');
  const prevBtns = document.querySelectorAll('.btn-wizard-prev');
  let currentStep = 0;

  function showStep(index) {
    steps.forEach((s, idx) => {
      s.style.display = idx === index ? 'block' : 'none';
      if (idx === index) {
        s.style.animation = 'fadeInDown 0.35s ease forwards';
      }
    });

    progressBars.forEach((bar, idx) => {
      if (idx <= index) {
        bar.classList.add('active');
        if (idx < index) bar.classList.add('completed');
      } else {
        bar.classList.remove('active', 'completed');
      }
    });

    window.scrollTo({ top: form?.offsetTop - 100 || 0, behavior: 'smooth' });
  }

  nextBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const currentPanel = steps[currentStep];
      const requiredInputs = currentPanel.querySelectorAll('input[required], select[required]');
      let isValid = true;

      requiredInputs.forEach(input => {
        if (!input.value.trim()) {
          isValid = false;
          input.style.borderColor = '#ef4444';
          input.addEventListener('input', () => {
            input.style.borderColor = '';
          }, { once: true });
        }
      });

      if (!isValid) {
        if (window.showToast) {
          window.showToast('Lütfen zorunlu alanları doldurunuz.', 'warning');
        }
        return;
      }

      if (currentStep < steps.length - 1) {
        currentStep++;
        showStep(currentStep);
      }
    });
  });

  prevBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (currentStep > 0) {
        currentStep--;
        showStep(currentStep);
      }
    });
  });

  // Handle Form Submission
  form?.addEventListener('submit', (e) => {
    e.preventDefault();

    const refCode = 'END-' + new Date().getFullYear() + '-' + Math.floor(10000 + Math.random() * 90000);
    const studentName = document.getElementById('ogrenciAdSoyad')?.value || 'Değerli Talebe';

    const modal = document.getElementById('successModal');
    const refEl = document.getElementById('modalRefCode');
    const nameEl = document.getElementById('modalStudentName');

    if (refEl) refEl.textContent = refCode;
    if (nameEl) nameEl.textContent = studentName;

    if (modal) {
      modal.classList.add('active');
    } else {
      alert('Başvurunuz başarıyla alındı! Takip Numaranız: ' + refCode);
    }
  });
}
