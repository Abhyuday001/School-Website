/* ============================================================
   CONTACT PAGE — loads phone/email/address from a published
   Google Sheet tab (CSV).

   Only the address is translated to Hindi on toggle — phone
   numbers and email addresses are identifiers, not language
   content, so they're left exactly as entered in the sheet.
   ============================================================ */
const PUBLIC_LINK_ID = '2PACX-1vSi3HLbT8N47cTTydcW9-AE8-xDuasLpoJCvpFwj1g_Avuey8Far7vGW5bCqS2E0e0mMypvxH4NFNKf';
const CONTACT_URL = `https://docs.google.com/spreadsheets/d/e/${PUBLIC_LINK_ID}/pub?gid=1832021242&output=csv`;

let originalContact = { phone: '', email: '', address: '' }; // always English/as-entered
let contactRenderToken = 0;

async function loadContactData() {
  try {
    const response = await fetch(CONTACT_URL + '&cachebust=' + new Date().getTime());
    const text = await response.text();
    const contentMap = parseKeyValueCSV(text);

    originalContact = {
      phone: contentMap['phone'] || '',
      email: contentMap['email'] || '',
      address: contentMap['address'] || ''
    };

    if (originalContact.phone) document.getElementById('contact-phone').innerText = originalContact.phone;
    if (originalContact.email) document.getElementById('contact-email').innerText = originalContact.email;
    await renderContactAddress();
  } catch (e) {
    console.error("Contact page data fetch error:", e);
  }
}

async function renderContactAddress() {
  const myToken = ++contactRenderToken;
  if (!originalContact.address) return;

  const lang = document.documentElement.getAttribute('lang') || 'en';
  const display = lang === 'hi'
    ? await translateToHindi(originalContact.address)
    : originalContact.address;

  if (myToken !== contactRenderToken) return; // a newer toggle already superseded this
  document.getElementById('contact-address').innerText = display;
}

// Called automatically by script.js whenever the language is switched
window.onLanguageChange = function () {
  renderContactAddress();
};

window.addEventListener('load', loadContactData);
