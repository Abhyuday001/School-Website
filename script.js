/* ============================================================
   SHARED SITE SCRIPT
   Handles: Dark Mode toggle, Language (EN/HI) toggle
   Used on: index.html, about.html, contact.html
   ============================================================ */

/* ---------- DARK MODE ---------- */
document.addEventListener("DOMContentLoaded", function () {
  const toggleBtn = document.getElementById('dark-mode-toggle');
  if (!toggleBtn) return;
  const icon = toggleBtn.querySelector('.mode-icon');

  const currentTheme = localStorage.getItem('theme');
  if (currentTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    if (icon) icon.textContent = '☀️';
  }

  toggleBtn.addEventListener('click', function () {
    const theme = document.documentElement.getAttribute('data-theme');
    if (theme === 'dark') {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
      if (icon) icon.textContent = '🌙';
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
      if (icon) icon.textContent = '☀️';
    }
  });
});

/* ---------- LANGUAGE TOGGLE (English / Hindi) ---------- */
(function () {
  const STORAGE_KEY = 'siteLang';

  function applyLanguage(lang) {
    document.querySelectorAll('[data-en][data-hi]').forEach(el => {
      el.textContent = lang === 'hi' ? el.getAttribute('data-hi') : el.getAttribute('data-en');
    });
    document.documentElement.setAttribute('lang', lang);

    const label = document.getElementById('lang-toggle-label');
    if (label) label.textContent = lang === 'hi' ? 'English' : 'हिंदी';

    localStorage.setItem(STORAGE_KEY, lang);

    // Let page-specific scripts (e.g. the notice board expand/collapse
    // button on the home page) refresh their own labels if they define this.
    if (typeof window.onLanguageChange === 'function') {
      window.onLanguageChange(lang);
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    const toggleBtn = document.getElementById('lang-toggle-btn');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', function () {
        const current = document.documentElement.getAttribute('lang') || 'en';
        applyLanguage(current === 'hi' ? 'en' : 'hi');
      });
    }
    const savedLang = localStorage.getItem(STORAGE_KEY) || 'en';
    applyLanguage(savedLang);
  });
})();

/* ---------- Small CSV helper shared by page data-loader scripts ---------- */
function parseKeyValueCSV(text) {
  const lines = text.split(/\r?\n/);
  const map = {};
  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].trim();
    if (!row) continue;
    const columns = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
    if (columns.length >= 2) {
      const key = columns[0].replace(/^"|"$/g, '').trim();
      const value = columns[1].replace(/^"|"$/g, '').trim();
      if (key) map[key] = value;
    }
  }
  return map;
}
