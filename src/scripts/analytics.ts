// Consent-gated Google Analytics 4.
//
// Nothing from Google is requested, and no cookie is written, until the visitor
// presses "אישור" on the banner. "לא תודה" is remembered and loads nothing. The
// choice lives in localStorage under STORAGE_KEY, so the banner does not return;
// the footer's "הגדרות עוגיות" button reopens it to change the answer.
import { SITE } from '@data/site';

const STORAGE_KEY = 'gal-consent';
// 13 months, the longest a measurement cookie is usually kept; GA4's own default is 2 years.
const COOKIE_LIFETIME_SECONDS = 34_128_000;

type Choice = 'granted' | 'denied';

// What gtag.js reads from and writes to the page, plus the per-ID kill switch
// (`ga-disable-<id>`) it honours.
const ga = window as unknown as {
  dataLayer: unknown[];
  // eslint-disable-next-line no-unused-vars -- parameter names in a function type
  gtag: (command: string, ...rest: unknown[]) => void;
  [disableFlag: string]: unknown;
};
const DISABLE_FLAG = `ga-disable-${SITE.analyticsId}`;

function readChoice(): Choice | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === 'granted' || value === 'denied' ? value : null;
  } catch {
    // Storage blocked (private mode, strict settings): treat as undecided.
    return null;
  }
}

function writeChoice(choice: Choice) {
  try {
    localStorage.setItem(STORAGE_KEY, choice);
  } catch {
    // The choice then lasts for this page view only.
  }
}

let loaded = false;

function loadAnalytics() {
  if (loaded) return;
  loaded = true;
  // The kill switch from an earlier "no" in this same page view must not
  // outlive a later "yes".
  ga[DISABLE_FLAG] = false;

  ga.dataLayer = ga.dataLayer || [];
  // gtag.js reads `arguments` objects off the dataLayer, so a rest-parameter
  // array here would be silently ignored.
  ga.gtag = function gtag() {
    ga.dataLayer.push(arguments);
  };
  ga.gtag('consent', 'default', {
    analytics_storage: 'granted',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
  });
  ga.gtag('js', new Date());
  ga.gtag('config', SITE.analyticsId, {
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
    cookie_expires: COOKIE_LIFETIME_SECONDS,
  });

  const tag = document.createElement('script');
  tag.async = true;
  tag.src = `https://www.googletagmanager.com/gtag/js?id=${SITE.analyticsId}`;
  document.head.appendChild(tag);
}

// Withdrawing consent: stop the tag for this page view and remove its cookies
// (_ga and _ga_<id>), on the host and on the parent domain.
function stopAnalytics() {
  ga[DISABLE_FLAG] = true;
  const hostParts = location.hostname.split('.');
  const domains = ['', location.hostname, `.${location.hostname}`];
  if (hostParts.length > 2) domains.push(`.${hostParts.slice(-2).join('.')}`);
  for (const pair of document.cookie.split(';')) {
    const name = pair.split('=')[0].trim();
    if (!name.startsWith('_ga')) continue;
    for (const domain of domains) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${domain ? `; domain=${domain}` : ''}`;
    }
  }
}

function apply(choice: Choice) {
  if (choice === 'granted') loadAnalytics();
  else if (loaded) stopAnalytics();
}

function track(name: string, params: Record<string, string>) {
  if (readChoice() === 'granted' && loaded) ga.gtag('event', name, params);
}

// Where on the page a click happened, so the report can tell the sticky bar
// from the header from the contact section. Ids and tag names only, no text.
function areaOf(link: Element): string {
  const area = link.closest('#quick-contact-bar, header, footer, section[id]');
  if (!area) return 'other';
  if (area.id === 'quick-contact-bar') return 'sticky_bar';
  return area.id || area.tagName.toLowerCase();
}

function initEvents() {
  document.addEventListener('click', (event) => {
    const link = (event.target as Element | null)?.closest('a[href]');
    if (!link) return;
    const href = link.getAttribute('href') ?? '';
    const where = { link_location: areaOf(link) };
    if (href.startsWith('tel:')) track('phone_click', where);
    else if (href.startsWith('https://wa.me/') || href === '/wa') track('whatsapp_click', where);
    else if (href.startsWith('mailto:')) track('email_click', where);
  });
  // Dispatched by Contact.astro after a real, accepted submission (not the
  // honeypot). Carries nothing from the form.
  document.addEventListener('contact-form-sent', () => {
    track('generate_lead', { method: 'contact_form' });
  });
}

function initBanner() {
  const banner = document.getElementById('consent-banner');
  if (!banner) return;
  let opener: HTMLElement | null = null;
  let hideTimer: number | undefined;

  function show() {
    window.clearTimeout(hideTimer);
    banner!.hidden = false;
    // A frame later, so the transition has a starting state to leave.
    requestAnimationFrame(() => banner!.setAttribute('data-open', 'true'));
  }

  function hide() {
    banner!.removeAttribute('data-open');
    hideTimer = window.setTimeout(() => (banner!.hidden = true), 220);
    // Opened from the footer: put focus back where the visitor was.
    opener?.focus();
    opener = null;
  }

  banner.addEventListener('click', (event) => {
    const button = (event.target as Element).closest<HTMLElement>('[data-consent]');
    if (!button) return;
    const choice = button.dataset.consent as Choice;
    writeChoice(choice);
    apply(choice);
    hide();
  });

  document.addEventListener('click', (event) => {
    const trigger = (event.target as Element | null)?.closest<HTMLElement>(
      '[data-consent-settings]'
    );
    if (!trigger) return;
    opener = trigger;
    show();
    banner.querySelector<HTMLElement>('[data-consent]')?.focus();
  });

  if (readChoice() === null) {
    // After the page has settled, so the banner never competes with the first
    // paint and can never be the largest contentful element.
    const reveal = () => window.setTimeout(show, 1000);
    if (document.readyState === 'complete') reveal();
    else window.addEventListener('load', reveal, { once: true });
  }
}

const saved = readChoice();
if (saved) apply(saved);
initEvents();
initBanner();
