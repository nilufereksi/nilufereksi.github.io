// small contact helpers: copy email and show feedback
document.addEventListener('DOMContentLoaded', () => {
  const copyBtn = document.getElementById('copy-email-btn');
  const copyTextBtn = document.getElementById('copy-email');
  const feedback = document.getElementById('contact-feedback');

  function showFeedback(msg) {
    if (!feedback) return;
    feedback.textContent = msg;
    feedback.hidden = false;
    feedback.style.opacity = '1';
    clearTimeout(feedback._t);
    feedback._t = setTimeout(() => {
      feedback.style.opacity = '0';
      feedback._t2 = setTimeout(() => feedback.hidden = true, 300);
    }, 1800);
  }

  function copyEmail() {
    const text = 'refulin17353@gmail.com';
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => showFeedback('Email copied to clipboard'));
    } else {
      // fallback
      const ta = document.createElement('textarea');
      ta.value = text; document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); showFeedback('Email copied to clipboard'); } catch (e) { showFeedback('Copy failed — use the Send button'); }
      ta.remove();
    }
  }

  if (copyBtn) copyBtn.addEventListener('click', copyEmail);
  if (copyTextBtn) copyTextBtn.addEventListener('click', copyEmail);
});
