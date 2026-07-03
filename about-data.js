/* ============================================================
   ABOUT PAGE — loads title/history/mission text from a published
   Google Sheet tab (CSV), then translates it to Hindi on the fly
   (via translate.js) whenever the site is in Hindi mode.
   ============================================================ */
const PUBLIC_LINK_ID = '2PACX-1vSi3HLbT8N47cTTydcW9-AE8-xDuasLpoJCvpFwj1g_Avuey8Far7vGW5bCqS2E0e0mMypvxH4NFNKf';
const ABOUT_URL = `https://docs.google.com/spreadsheets/d/e/${PUBLIC_LINK_ID}/pub?gid=1921478699&output=csv`;

let originalAbout = { title: '', history: '', mission: '' }; // always English, as fetched
let aboutRenderToken = 0;

async function loadAboutData() {
  try {
    const response = await fetch(ABOUT_URL + '&cachebust=' + new Date().getTime());
    const text = await response.text();
    const contentMap = parseKeyValueCSV(text);

    originalAbout = {
      title: contentMap['title'] || 'About Us',
      history: contentMap['history'] || '',
      mission: contentMap['mission'] || ''
    };
    await renderAbout();
  } catch (e) {
    console.error("About page data fetch error:", e);
    document.getElementById('about-title').innerText = "About Us";
    document.getElementById('about-history').innerText = "We're having trouble loading this content right now — please check back shortly.";
  }
}

/**
 * Renders originalAbout in the currently active language.
 * Safe to call repeatedly (e.g. every time the language toggle fires).
 */
async function renderAbout() {
  const myToken = ++aboutRenderToken;
  const lang = document.documentElement.getAttribute('lang') || 'en';

  let display = originalAbout;
  if (lang === 'hi') {
    const [title, history, mission] = await translateAllToHindi([
      originalAbout.title, originalAbout.history, originalAbout.mission
    ]);
    if (myToken !== aboutRenderToken) return; // a newer toggle already superseded this
    display = { title, history, mission };
  }

  if (display.title) document.getElementById('about-title').innerText = display.title;
  if (display.history) document.getElementById('about-history').innerText = display.history;
  if (display.mission) document.getElementById('about-mission').innerText = display.mission;
}

// Called automatically by script.js whenever the language is switched
window.onLanguageChange = function () {
  renderAbout();
};

window.addEventListener('load', loadAboutData);
