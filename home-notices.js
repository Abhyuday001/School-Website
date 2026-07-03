/* ============================================================
   HOME PAGE — Live Notice Board
   Pulls notices from a published Google Sheet (CSV) and renders
   them as a scrolling ticker + an expandable full list.

   Notices are fetched in English, then translated to Hindi
   on the fly (via translate.js) whenever the site is in Hindi
   mode — no Hindi column needed in the sheet.
   ============================================================ */
const PUBLIC_LINK_ID = '2PACX-1vSi3HLbT8N47cTTydcW9-AE8-xDuasLpoJCvpFwj1g_Avuey8Far7vGW5bCqS2E0e0mMypvxH4NFNKf';
const NOTICES_URL = `https://docs.google.com/spreadsheets/d/e/${PUBLIC_LINK_ID}/pub?output=csv`;

let originalNotices = [];      // [{date, text}] as fetched from the sheet, always English
let noticesExpanded = false;
let noticesRenderToken = 0;    // guards against a slow translation overwriting a newer one

function parseNoticesCSV(text) {
  const lines = text.split(/\r?\n/);
  const data = [];
  for (let i = 1; i < lines.length; i++) {
    const rowText = lines[i].trim();
    if (!rowText) continue;
    const columns = rowText.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
    if (columns.length >= 2) {
      const dateVal = columns[0].replace(/^"|"$/g, '').trim();
      const textVal = columns[1].replace(/^"|"$/g, '').trim();
      if (dateVal && textVal) data.push({ date: dateVal, text: textVal });
    }
  }
  return data;
}

async function loadNotices() {
  const ticker = document.getElementById('live-ticker');
  try {
    const response = await fetch(NOTICES_URL + '&cachebust=' + new Date().getTime());
    const rawText = await response.text();
    originalNotices = parseNoticesCSV(rawText);
    await renderNotices();
  } catch (error) {
    console.error("Error updating notice feed:", error);
    ticker.innerText = "Notice board refresh failed.";
  }
}

/**
 * Renders originalNotices in the currently active language.
 * Safe to call repeatedly (e.g. every time the language toggle fires).
 */
async function renderNotices() {
  const ticker = document.getElementById('live-ticker');
  const list = document.getElementById('live-list');
  const myToken = ++noticesRenderToken;

  if (originalNotices.length === 0) {
    ticker.innerText = document.documentElement.getAttribute('lang') === 'hi'
      ? "फिलहाल कोई सक्रिय सूचना नहीं है।"
      : "No active notices at this time.";
    list.innerHTML = "<li>—</li>";
    return;
  }

  const lang = document.documentElement.getAttribute('lang') || 'en';
  let displayNotices = originalNotices;

  if (lang === 'hi') {
    const translatedTexts = await translateAllToHindi(originalNotices.map(n => n.text));
    // If the user toggled language again while we were translating, bail out —
    // a newer render() call is already handling the current state.
    if (myToken !== noticesRenderToken) return;
    displayNotices = originalNotices.map((n, i) => ({ date: n.date, text: translatedTexts[i] }));
  }

  let tickerString = "";
  displayNotices.forEach(item => {
    tickerString += ` ⚠️ ${item.text} (${item.date}) &nbsp;&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;&nbsp;`;
  });
  ticker.innerHTML = tickerString;

  let listHTML = "";
  displayNotices.forEach(item => {
    listHTML += `<li><strong>${item.date}:</strong> ${item.text}</li>`;
  });
  list.innerHTML = listHTML;
}

function toggleNotices() {
  const noticesNode = document.getElementById('full-notices');
  noticesExpanded = !noticesExpanded;
  noticesNode.style.display = noticesExpanded ? 'block' : 'none';
  updateExpandButtonLabel();
}

function updateExpandButtonLabel() {
  const btn = document.getElementById('expand-notices-btn');
  if (!btn) return;
  const lang = document.documentElement.getAttribute('lang') || 'en';
  const key = noticesExpanded
    ? (lang === 'hi' ? 'data-hi-collapse' : 'data-en-collapse')
    : (lang === 'hi' ? 'data-hi-expand' : 'data-en-expand');
  btn.textContent = btn.getAttribute(key);
}

// Called automatically by script.js whenever the language is switched
window.onLanguageChange = function () {
  updateExpandButtonLabel();
  renderNotices();
};

window.addEventListener('load', loadNotices);
