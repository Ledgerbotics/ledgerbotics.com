/* =====================================================================
   LedgerBotics — site behaviour
   ---------------------------------------------------------------------
   CONTACT FORM CONFIGURATION — edit these values, nothing else needed.
   See README.md ("Contact form setup") for step-by-step instructions.
   ===================================================================== */
const FORM_CONFIG = {
  // Primary delivery. Submissions are POSTed here and must succeed for the
  // visitor to see the thank-you message. Default: FormSubmit (free), which
  // emails every inquiry to info@ledgerbotics.com and sends the visitor an
  // automatic confirmation email. One-time activation required (see README).
  // To use your own backend instead, point this at your endpoint and keep the
  // JSON shape; it must return HTTP 2xx (and {success:true} if JSON).
  endpoint: 'https://formsubmit.co/ajax/info@ledgerbotics.com',

  // Automatic confirmation email sent to the visitor (FormSubmit "_autoresponse").
  autoResponse:
    'Thank you for contacting LedgerBotics. We have received your inquiry and our team ' +
    'will review your requirements and contact you within one business day.\n\n' +
    'LedgerBotics | Global Accounting Support\nwww.ledgerbotics.com | info@ledgerbotics.com | +1 917 695 6110',

  // Optional CRM: HubSpot Forms API. Leave blank to disable.
  // Create a HubSpot form with fields: email, firstname, lastname, company,
  // country, message (plus any custom properties), then paste its IDs here.
  hubspot: { portalId: '', formGuid: '' },

  // Optional lead database: any webhook (Zapier, Make, Google Apps Script → Sheets).
  // Receives the full lead as JSON. Leave blank to disable.
  webhookUrl: ''
};

const CONTACT = { email: 'info@ledgerbotics.com', phone: '+1 917 695 6110', tel: '+19176956110' };

/* ---------- Helpers ---------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const icon = (n, cls = 'ico') => `<svg class="${cls}" aria-hidden="true"><use href="#i-${n}"></use></svg>`;
const FLAGS = {
  us: '<svg viewBox="0 0 7410 3900" aria-hidden="true"><rect width="7410" height="3900" fill="#b22234"/><path d="M0 450h7410m0 600H0m0 600h7410m0 600H0m0 600h7410m0 600H0" stroke="#fff" stroke-width="300"/><rect width="2964" height="2100" fill="#3c3b6e"/><g stroke="#fff" stroke-width="150" stroke-linecap="round" stroke-dasharray="0 494" fill="none"><path d="M247 210H2718M247 630H2718M247 1050H2718M247 1470H2718M247 1890H2718"/><path d="M494 420H2471M494 840H2471M494 1260H2471M494 1680H2471"/></g></svg>',
  ca: '<svg viewBox="0 0 9600 4800" aria-hidden="true"><path fill="#d52b1e" d="M0 0h2400l99 99h4602l99-99h2400v4800h-2400l-99-99h-4602l-99 99H0z"/><path fill="#fff" d="M2400 0h4800v4800h-4800zm2490 4430-45-863a95 95 0 0 1 111-98l859 151-116-320a65 65 0 0 1 20-73l941-762-212-99a65 65 0 0 1-34-79l186-572-542 115a65 65 0 0 1-73-38l-105-247-423 454a65 65 0 0 1-111-57l204-1052-327 189a65 65 0 0 1-91-27l-332-652-332 652a65 65 0 0 1-91 27l-327-189 204 1052a65 65 0 0 1-111 57l-423-454-105 247a65 65 0 0 1-73 38l-542-115 186 572a65 65 0 0 1-34 79l-212 99 941 762a65 65 0 0 1 20 73l-116 320 859-151a95 95 0 0 1 111 98l-45 863z"/></svg>'
};
const flag = (c, cls = 'flag') => `<span class="${cls}" role="img" aria-label="${c === 'ca' ? 'Canada' : 'United States'} flag">${FLAGS[c]}</span>`;
// Render any static flag placeholders: <span data-flag="us"></span>
function paintFlags(root = document) {
  $$('[data-flag]', root).forEach(el => {
    if (el.dataset.painted) return;
    el.innerHTML = FLAGS[el.dataset.flag] || '';
    el.classList.add('flag');
    if (!el.hasAttribute('role')) { el.setAttribute('role', 'img'); el.setAttribute('aria-label', (el.dataset.flag === 'ca' ? 'Canada' : 'United States') + ' flag'); }
    el.dataset.painted = '1';
  });
}

/* ---------- Country preference (USA / Canada) ---------- */
const COUNTRY_NAMES = { us: 'USA', ca: 'Canada' };
function getCountry() { try { return localStorage.getItem('lb_country') || 'us'; } catch (e) { return 'us'; } }
function setCountry(c, save = true) {
  if (save) { try { localStorage.setItem('lb_country', c); } catch (e) {} }
  // header picker
  const btn = $('#countryBtn');
  if (btn) { $('.cb-flag', btn).innerHTML = FLAGS[c]; $('.cb-name', btn).textContent = COUNTRY_NAMES[c]; }
  $$('#countryMenu [data-country]').forEach(b => b.setAttribute('aria-checked', b.dataset.country === c));
  $$('.drawer-country [data-country]').forEach(b => b.setAttribute('aria-pressed', b.dataset.country === c));
  // pricing currency
  $$('[data-cur-btn]').forEach(b => b.setAttribute('aria-selected', b.dataset.curBtn === c));
  $$('[data-cur]').forEach(el => el.textContent = c === 'ca' ? 'C$' : '$');
  $$('[data-us][data-ca]').forEach(el => el.textContent = el.dataset[c]);
  const note = $('#curNote'); if (note) note.textContent = c === 'ca' ? 'Fixed prices in Canadian dollars (CAD), excluding applicable taxes.' : 'Fixed prices in US dollars (USD), excluding applicable taxes.';
  // country tab groups
  $$('[data-country-tabs] [role="tab"]').forEach(t => { if (t.dataset.tabCountry === c) activateTab(t); });
}
function initCountry() {
  const btn = $('#countryBtn'), menu = $('#countryMenu');
  if (btn && menu) {
    btn.addEventListener('click', e => { e.stopPropagation(); const o = menu.classList.toggle('open'); btn.setAttribute('aria-expanded', o); });
    document.addEventListener('click', () => { menu.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); });
    menu.addEventListener('keydown', e => { if (e.key === 'Escape') { menu.classList.remove('open'); btn.focus(); } });
  }
  $$('[data-country]').forEach(b => b.addEventListener('click', () => { setCountry(b.dataset.country); if (menu) menu.classList.remove('open'); }));
  $$('[data-cur-btn]').forEach(b => b.addEventListener('click', () => setCountry(b.dataset.curBtn)));
  setCountry(getCountry(), false);
}

/* ---------- Tabs ---------- */
function activateTab(tab) {
  const list = tab.closest('[role="tablist"]');
  $$('[role="tab"]', list).forEach(t => {
    const on = t === tab;
    t.setAttribute('aria-selected', on);
    t.tabIndex = on ? 0 : -1;
    const p = document.getElementById(t.getAttribute('aria-controls'));
    if (p) p.hidden = !on;
  });
}
function initTabs() {
  $$('[role="tablist"]').forEach(list => {
    const tabs = $$('[role="tab"]', list);
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => { activateTab(t); if (t.dataset.tabCountry) setCountry(t.dataset.tabCountry); });
      t.addEventListener('keydown', e => {
        let n = null;
        if (e.key === 'ArrowRight') n = tabs[(i + 1) % tabs.length];
        if (e.key === 'ArrowLeft') n = tabs[(i - 1 + tabs.length) % tabs.length];
        if (n) { e.preventDefault(); n.focus(); n.click(); }
      });
    });
  });
}

/* ---------- Mobile drawer ---------- */
function initDrawer() {
  const open = $('#menuOpen'), close = $('#menuClose'), bd = $('#drawerBackdrop'), dr = $('#drawer');
  if (!open || !dr) return;
  const set = v => {
    document.body.classList.toggle('drawer-open', v);
    open.setAttribute('aria-expanded', v);
    dr.setAttribute('aria-hidden', !v);
    if (v) { dr.inert = false; setTimeout(() => close.focus(), 50); } else { dr.inert = true; }
  };
  dr.inert = true;
  open.addEventListener('click', () => set(true));
  close.addEventListener('click', () => { set(false); open.focus(); });
  bd.addEventListener('click', () => set(false));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && document.body.classList.contains('drawer-open')) { set(false); open.focus(); } });
  $$('a', dr).forEach(a => a.addEventListener('click', () => set(false)));
}

/* ---------- Modal ---------- */
let lastFocus = null;
function showModal(iconName, title, sub, html) {
  const bg = $('#modalBg');
  $('#mIc').innerHTML = icon(iconName);
  $('#mTitle').textContent = title;
  $('#mSub').textContent = sub || '';
  $('#mBody').innerHTML = html;
  lastFocus = document.activeElement;
  bg.classList.add('open');
  document.body.style.overflow = 'hidden';
  $('#mBody').scrollTop = 0; $('.modal', bg).scrollTop = 0;
  setTimeout(() => $('#mClose').focus(), 30);
}
function closeModal() {
  $('#modalBg').classList.remove('open');
  document.body.style.overflow = '';
  if (lastFocus) lastFocus.focus();
}
function openService(key) {
  const s = SERVICES[key]; if (!s) return;
  const page = document.body.dataset.page;
  // CTA matches the audience: business page / business services -> assessment; CPA page -> discovery call; elsewhere -> consultation
  const cta = s.cta
    || (page === 'business' || key.startsWith('b-') ? { label: 'Get a Free Accounting Assessment →', href: 'contact.html?type=business&intent=assessment' }
    : page === 'cpa' ? { label: 'Book a Discovery Call →', href: 'contact.html?type=cpa&intent=discovery' }
    : { label: 'Book a Free Consultation →', href: 'contact.html?intent=consultation' });
  showModal(s.icon, s.title, s.sub, `
    <p>${s.overview}</p>
    <h5>${key === 'careers' ? 'Roles we hire for' : "What's included"}</h5>
    <ul class="m-list">${s.includes.map(i => `<li>${icon('check')}<span>${i}</span></li>`).join('')}</ul>
    <h5>${key === 'careers' ? 'Platforms' : 'Software'}</h5><p>${s.tools}</p>
    <h5>${key === 'careers' ? 'How to apply' : 'How it is delivered'}</h5><p>${s.models}</p>
    <div class="modal-cta"><div><b>${key === 'careers' ? 'Ready to apply?' : 'Ready to talk it through?'}</b><small>${key === 'careers' ? 'We review every application.' : 'We reply within one business day.'}</small></div>
    <a class="btn btn-primary" href="${cta.href}">${cta.label}</a></div>`);
}
const CAT_ICON = { 'Bookkeeping': 'book', 'Tax': 'file', 'Startup Finance': 'rocket', 'Payroll': 'wallet', 'Industry': 'building', 'Advisory': 'trending', 'Compliance': 'shield' };
const CAT_CLASS = { 'Tax': 't-tax', 'Startup Finance': 't-startup', 'Payroll': 't-payroll', 'Industry': 't-industry', 'Advisory': 't-advisory', 'Compliance': 't-compliance' };
function openArticle(id) {
  const a = ARTICLES.find(x => x.id === id); if (!a) return;
  showModal(CAT_ICON[a.cat] || 'book', a.title, a.sub, `<div class="article">
    <div class="ameta"><span class="pill">${a.cat}</span><span>${a.date}</span><span>${a.read} min read</span></div>
    ${a.body}<div class="tags">${a.tags.map(t => `<span>#${t}</span>`).join('')}</div></div>
    <div class="modal-cta"><div><b>Want this handled for you?</b><small>Talk to our team about your accounting needs.</small></div>
    <a class="btn btn-primary" href="contact.html?intent=consultation">Book a Free Consultation →</a></div>`);
}
function openCase(id) {
  const c = CASES.find(x => x.id === id); if (!c) return;
  const href = c.aud === 'cpa' ? 'contact.html?type=cpa&intent=discovery' : 'contact.html?type=business&intent=assessment';
  const label = c.aud === 'cpa' ? 'Book a Discovery Call →' : 'Get a Free Accounting Assessment →';
  showModal('chart', c.title, c.tag, `<div class="article">
    <div class="disclaimer"><b>Illustrative scenario.</b> This example illustrates a potential engagement and does not represent a guaranteed result or a verified LedgerBotics client engagement.</div>
    <div class="metrics" style="margin-bottom:10px">${c.metrics.map(m => `<div><b>${m[0]}</b><small>${m[1]}</small></div>`).join('')}</div>
    ${c.body}</div>
    <div class="modal-cta"><div><b>Exploring something similar?</b><small>We'll scope it with you.</small></div><a class="btn btn-primary" href="${href}">${label}</a></div>`);
}
function initModal() {
  const bg = $('#modalBg'); if (!bg) return;
  $('#mClose').addEventListener('click', closeModal);
  bg.addEventListener('click', e => { if (e.target === bg) closeModal(); });
  document.addEventListener('keydown', e => {
    if (!bg.classList.contains('open')) return;
    if (e.key === 'Escape') closeModal();
    if (e.key === 'Tab') { // focus trap
      const f = $$('a[href],button:not([disabled])', bg); if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    }
  });
  document.addEventListener('click', e => {
    const s = e.target.closest('[data-svc]'); if (s) { e.preventDefault(); openService(s.dataset.svc); return; }
    const a = e.target.closest('[data-article]'); if (a) { openArticle(a.dataset.article); return; }
    const c = e.target.closest('[data-case]'); if (c) { openCase(c.dataset.case); }
  });
}

/* ---------- Resources: articles, scenarios, FAQs ---------- */
function initResources() {
  const grid = $('#postGrid');
  if (grid) {
    const filters = $('#postFilters'), more = $('#postMore');
    const cats = ['All', ...new Set(ARTICLES.map(a => a.cat))];
    let active = 'All', shown = 9;
    filters.innerHTML = cats.map(c => `<button type="button" data-cat="${c}" aria-pressed="${c === 'All'}">${c === 'All' ? `All (${ARTICLES.length})` : c}</button>`).join('');
    const render = () => {
      const list = ARTICLES.filter(a => active === 'All' || a.cat === active);
      grid.innerHTML = list.slice(0, shown).map(a => `
        <button type="button" class="post" data-article="${a.id}">
          <div class="thumb ${CAT_CLASS[a.cat] || ''}">${icon(CAT_ICON[a.cat] || 'book')}<span class="rt">${a.read} min</span></div>
          <div class="body"><span class="cat">${a.cat}</span><h4>${a.title}</h4><p>${a.sub}</p><div class="meta">${a.date}</div></div>
        </button>`).join('');
      more.hidden = shown >= list.length;
    };
    filters.addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      active = b.dataset.cat; shown = 9;
      $$('button', filters).forEach(x => x.setAttribute('aria-pressed', x === b));
      render();
    });
    more.addEventListener('click', () => { shown += 9; render(); });
    const n = $('#postCount'); if (n) n.textContent = ARTICLES.length;
    render();
  }
  $$('[data-cases]').forEach(el => {
    const aud = el.dataset.cases;
    const list = CASES.filter(c => aud === 'all' || c.aud === aud);
    el.innerHTML = list.map(c => `
      <button type="button" class="case-card" data-case="${c.id}">
        <div class="ch">${flag(c.country)}<span class="illus">Illustrative scenario</span></div>
        <small class="muted">${c.tag}</small>
        <h4>${c.title}</h4><p class="q">"${c.quote}"</p>
        <div class="metrics">${c.metrics.map(m => `<div><b>${m[0]}</b><small>${m[1]}</small></div>`).join('')}</div>
        <span class="text-link" style="align-self:flex-start">Read scenario</span>
      </button>`).join('');
  });
  $$('[data-faq]').forEach(el => {
    const set = el.dataset.faq === 'all' ? [...FAQS.cpa, ...FAQS.biz] : FAQS[el.dataset.faq];
    el.innerHTML = set.map(f => `<details><summary>${f[0]}${icon('plus')}</summary><div class="a">${f[1]}</div></details>`).join('');
  });
}

/* ---------- Contact form ---------- */
const SERVICE_OPTIONS = {
  cpa: ['Bookkeeping', 'Month-End Close', 'Tax Preparation Support', 'Audit Support', 'Dedicated Accountant', 'Dedicated Bookkeeper', 'AP / AR', 'Practice Administration', 'Accounting Cleanup', 'Custom Support'],
  business: ['Bookkeeping', 'Month-End Close', 'Accounting Cleanup', 'AP / AR', 'Payroll Support', 'Financial Reporting', 'Management Reporting', 'QBO / Xero Support', 'Controller Support', 'CFO Support', 'Custom Accounting Support']
};
const AUDIENCE_LABEL = { cpa: 'CPA / Accounting Firm', business: 'Business Owner / Company', other: 'Other' };

function initContactForm() {
  const form = $('#contactForm'); if (!form) return;
  const svcWrap = $('#svcOptions');
  const errBox = $('#formError');
  const params = new URLSearchParams(location.search);

  function renderServices(aud, keep = []) {
    if (!SERVICE_OPTIONS[aud]) {
      svcWrap.innerHTML = `<p class="svc-hint">${aud === 'other'
        ? 'Tell us what you need in the message below and we will point you to the right team.'
        : 'Choose “I am a” above to see the services available to you.'}</p>`;
      return;
    }
    svcWrap.innerHTML = `<div class="svc-options">${SERVICE_OPTIONS[aud].map((s, i) =>
      `<label class="choice box"><input type="checkbox" name="services" value="${s}" ${keep.includes(s) ? 'checked' : ''}><span>${s}</span></label>`).join('')}</div>`;
  }
  $$('input[name="audience"]', form).forEach(r => r.addEventListener('change', () => {
    const kept = $$('input[name="services"]:checked', form).map(i => i.value);
    renderServices(r.value, kept);
    clearErr(r);
  }));

  // Prefill from links such as contact.html?type=business&intent=assessment
  const type = { cpa: 'cpa', business: 'business', biz: 'business', other: 'other' }[params.get('type')];
  if (type) { const r = $(`input[name="audience"][value="${type}"]`, form); if (r) r.checked = true; }
  renderServices(type || '');
  const intent = params.get('intent') || '';
  const plan = params.get('plan');
  $('#f_source').value = [document.referrer ? 'ref:' + document.referrer : '', intent && 'intent:' + intent, plan && 'plan:' + plan].filter(Boolean).join(' | ');
  const intentCopy = {
    assessment: 'Free accounting assessment', quote: 'Custom quote for my business', discovery: 'Discovery call',
    consultation: 'Free consultation', pilot: '7-day pilot'
  }[intent];
  const h = $('#contactHeading');
  if (h && intentCopy) h.textContent = { assessment: 'Get a free accounting assessment', quote: 'Get a custom quote', discovery: 'Book a discovery call', consultation: 'Book a free consultation', pilot: 'Request a 7-day pilot' }[intent];
  if (plan) $('#f_message').value = `I'd like to discuss the ${plan} option${intent === 'pilot' ? ', starting with a 7-day pilot' : ''}.`;
  else if (intentCopy && type === 'business') $('#f_message').placeholder = 'Tell us about your business, your accounting needs, current software, and how we can help.';
  const pre = params.get('country'); if (pre) { const c = $(`input[name="country"][value="${pre}"]`, form); if (c) c.checked = true; }
  else { let saved = null; try { saved = localStorage.getItem('lb_country'); } catch (e) {}
    if (saved) { const c = $(`input[name="country"][value="${saved === 'ca' ? 'Canada' : 'United States'}"]`, form); if (c) c.checked = true; } }

  function fieldOf(el) { return el.closest('.field'); }
  function setErr(name, msg) { const f = form.querySelector(`[data-field="${name}"]`); if (f) { f.classList.add('invalid'); const e = $('.err', f); if (e && msg) e.textContent = msg; } }
  function clearErr(el) { const f = fieldOf(el); if (f) f.classList.remove('invalid'); }
  $$('input,select,textarea', form).forEach(el => el.addEventListener('input', () => clearErr(el)));
  $$('input,select', form).forEach(el => el.addEventListener('change', () => clearErr(el)));

  function validate(d) {
    $$('.field.invalid', form).forEach(f => f.classList.remove('invalid'));
    let first = null; const bad = (n, m) => { setErr(n, m); if (!first) first = form.querySelector(`[data-field="${n}"] input, [data-field="${n}"] textarea`); };
    if (!d.name) bad('name', 'Enter your full name.');
    if (!d.email) bad('email', 'Enter your business email.');
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.email)) bad('email', 'Enter an email address like john@company.com.');
    if (!d.company) bad('company', 'Enter your company name.');
    if (!d.country) bad('country', 'Choose your country.');
    if (!d.consent) bad('consent', 'Please confirm we can use these details to reply.');
    if (first) first.focus();
    return !first;
  }

  form.addEventListener('submit', async e => {
    e.preventDefault();
    errBox.classList.remove('show');
    const fd = new FormData(form);
    if ((fd.get('_honey') || '').trim()) return; // bot
    const d = {
      name: (fd.get('full_name') || '').trim(),
      email: (fd.get('email') || '').trim(),
      company: (fd.get('company') || '').trim(),
      audience: fd.get('audience') || '',
      country: fd.get('country') || '',
      services: fd.getAll('services'),
      budget: fd.get('budget') || 'Not specified',
      message: (fd.get('message') || '').trim(),
      consent: !!fd.get('consent'),
      source: fd.get('source') || ''
    };
    if (!validate(d)) return;

    const lead = {
      'Full Name': d.name, email: d.email, 'Company Name': d.company,
      'I am a': AUDIENCE_LABEL[d.audience] || 'Not specified', Country: d.country,
      'Services Needed': d.services.join(', ') || 'Not specified',
      'Approximate Monthly Accounting Need': d.budget, Message: d.message || '(no message)',
      'Page': location.pathname, 'Lead Source': d.source || 'direct', 'Submitted At': new Date().toISOString()
    };
    const btn = $('button[type="submit"]', form), label = btn.innerHTML;
    btn.disabled = true; btn.textContent = 'Submitting…';
    const ctrl = new AbortController(); const timer = setTimeout(() => ctrl.abort(), 15000);
    try {
      const res = await fetch(FORM_CONFIG.endpoint, {
        method: 'POST', signal: ctrl.signal,
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          _subject: `New ${d.audience === 'cpa' ? 'CPA firm' : d.audience === 'business' ? 'business' : 'website'} inquiry: ${d.name} (${d.company})`,
          _template: 'table', _captcha: 'false', _replyto: d.email,
          _autoresponse: FORM_CONFIG.autoResponse, ...lead
        })
      });
      let ok = res.ok;
      try { const j = await res.clone().json(); if (j && 'success' in j) ok = ok && (j.success === true || j.success === 'true'); } catch (_) {}
      if (!ok) throw new Error('Form service rejected the submission (status ' + res.status + ')');

      sendToCrm(d, lead); // non-blocking extras
      form.hidden = true;
      const s = $('#formSuccess'); s.classList.add('show'); s.setAttribute('tabindex', '-1'); s.focus();
      s.scrollIntoView({ behavior: 'smooth', block: 'center' });
      if (window.dataLayer) window.dataLayer.push({ event: 'lead_submitted', audience: d.audience, country: d.country });
    } catch (err) {
      console.error('[LedgerBotics form]', err);
      errBox.innerHTML = `Your inquiry could not be sent. Check your connection and select <b>Submit Inquiry</b> again. If it keeps failing, email <b>${CONTACT.email}</b> or call <b><a href="tel:${CONTACT.tel}">${CONTACT.phone}</a></b>.`;
      errBox.classList.add('show'); errBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } finally {
      clearTimeout(timer); btn.disabled = false; btn.innerHTML = label;
    }
  });
}
function sendToCrm(d, lead) {
  const hs = FORM_CONFIG.hubspot;
  if (hs.portalId && hs.formGuid) {
    const [first, ...rest] = d.name.split(' ');
    const hutk = (document.cookie.match(/hubspotutk=([^;]+)/) || [])[1];
    fetch(`https://api.hsforms.com/submissions/v3/integration/submit/${hs.portalId}/${hs.formGuid}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fields: [['email', d.email], ['firstname', first], ['lastname', rest.join(' ')], ['company', d.company], ['country', d.country],
          ['message', `${AUDIENCE_LABEL[d.audience] || 'Not specified'} | Services: ${lead['Services Needed']} | Monthly need: ${d.budget}\n\n${d.message}`]]
          .map(([name, value]) => ({ name, value })),
        context: { pageUri: location.href, pageName: document.title, ...(hutk ? { hutk } : {}) }
      })
    }).catch(e => console.warn('[LedgerBotics CRM]', e));
  }
  if (FORM_CONFIG.webhookUrl) {
    fetch(FORM_CONFIG.webhookUrl, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain' }, body: JSON.stringify(lead) })
      .catch(e => console.warn('[LedgerBotics webhook]', e));
  }
}

/* ---------- Boot ---------- */
document.addEventListener('DOMContentLoaded', () => {
  paintFlags();
  initCountry();
  initTabs();
  initDrawer();
  initModal();
  initResources();
  initContactForm();
  const y = $('#year'); if (y) y.textContent = new Date().getFullYear();
});
