export const SITE = {
  name: 'גל עופרי פיזיותרפיה',
  tagline: 'חזרה לתנועה מלאה, בהתאמה אישית אליכם',
  description:
    // Hebrew only on purpose: meta text has no markup, so each app lays out a
    // Latin run like "B.P.T" on its own and WhatsApp scrambled it. The degree
    // stays on the page itself, where the markup controls its direction.
    'פיזיותרפיסטית מוסמכת בתל אביב: שיקום אחרי פציעות וניתוחים, שיקום ספורטאים ופיזיותרפיה מניעתית, בליווי אישי בכל שלב.',
  // TEMPORARY: the live Vercel address, so link previews (og:image) and
  // canonical URLs work before the real domain is connected. When
  // www.galofri-physio.co.il points at Vercel, switch back here, in
  // astro.config.mjs (site) and in public/robots.txt (Sitemap line).
  url: 'https://gal-physio.vercel.app',
  locale: 'he_IL',

  // ── Contact ──────────────────────────────────────────────────────────────
  phone: '052-308-6600', // Human-readable display
  phoneE164: '+972523086600', // E.164 for tel: links and Schema.org
  email: 'galofri@gmail.com',
  whatsappUrl:
    'https://wa.me/972523086600?text=%D7%94%D7%99%D7%99%20%D7%92%D7%9C%2C%20%D7%94%D7%92%D7%A2%D7%AA%D7%99%20%D7%93%D7%A8%D7%9A%20%D7%94%D7%90%D7%AA%D7%A8%20%D7%95%D7%90%D7%A9%D7%9E%D7%97%20%D7%9C%D7%A9%D7%9E%D7%95%D7%A2%20%D7%A2%D7%95%D7%93',

  // ── Address ───────────────────────────────────────────────────────────────
  address: {
    street: 'בלוך 38',
    city: 'Tel Aviv-Yafo',
    cityHebrew: 'תל אביב-יפו',
    region: 'Tel Aviv District',
    postalCode: '6468104', // confirmed by Dan, Oct 2026
    country: 'IL',
    countryName: 'Israel',
  },

  // The building itself (OpenStreetMap node 2079043539). Until Oct 2026 this
  // held the generic centre of Tel Aviv, about 300m off.
  geo: {
    latitude: 32.0833,
    longitude: 34.7849,
  },

  // Confirmed by Gal, Oct 2026. Feeds the FAQ and the JSON-LD priceRange.
  price: { min: 350, max: 400, currency: '₪' },

  // Follow-up session length, confirmed by Gal, Oct 2026. The first visit is
  // always an hour, which the copy says in words ("שעה"). Feeds the FAQ only:
  // the first-visit section is about the first visit and left it out on purpose.
  sessionMinutes: { followUpMin: 45, followUpMax: 60 },

  // Languages Gal treats in. Schema.org names, for the JSON-LD contactPoint.
  languages: ['Hebrew', 'English'],

  // Where Gal makes home visits, confirmed Oct 2026. `en` feeds the JSON-LD
  // areaServed, `he` the copy (through HOME_VISIT_AREAS_TEXT below).
  homeVisitAreas: [
    { he: 'תל אביב', en: 'Tel Aviv-Yafo' },
    { he: 'רמת גן', en: 'Ramat Gan' },
    { he: 'גבעתיים', en: 'Givatayim' },
  ],

  // Single source: the JSON-LD, the contact panel, the FAQ and the
  // cancellation policy all derive from this (the last two through
  // `OPENING_HOURS_TEXT` below). `days` feeds Schema.org, `daysHebrew` is what
  // visitors read.
  openingHours: [
    {
      days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'],
      daysHebrew: 'ימים א׳–ה׳',
      opens: '08:00',
      closes: '19:00',
    },
    {
      days: ['Friday'],
      daysHebrew: 'יום ו׳',
      opens: '08:00',
      closes: '14:00',
    },
  ],

  // ── Social ────────────────────────────────────────────────────────────────
  social: {
    instagram: 'https://www.instagram.com/galofri/',
    facebook: '',
    linkedin: '',
  },

  // ── Google reviews ────────────────────────────────────────────────────────
  // `profile` opens the Google Business Profile; `write` is the profile's own
  // "Ask for reviews" link (Oct 2026), which opens the write-a-review dialog
  // directly (it redirects to search.google.com/local/writereview?placeid=…).
  googleReviews: {
    profile: 'https://www.google.com/search?kgmid=/g/11ynf97pzh',
    write: 'https://g.page/r/Ce9YSpzcmUTaEBM/review',
  },

  // ── Open Graph ────────────────────────────────────────────────────────────
  openGraph: {
    image: '/og-image.jpg',
    imageAlt: 'גל עופרי, פיזיותרפיסטית, יושבת על מיטת הטיפולים בקליניקה בתל אביב ומחייכת',
    imageWidth: 1200,
    imageHeight: 630,
  },
} as const;

/** The home-visit areas as running text: "תל אביב, רמת גן וגבעתיים". */
const homeVisitNames = SITE.homeVisitAreas.map((area) => area.he);
export const HOME_VISIT_AREAS_TEXT =
  homeVisitNames.length > 1
    ? `${homeVisitNames.slice(0, -1).join(', ')} ו${homeVisitNames.at(-1)}`
    : homeVisitNames[0];

/** The opening hours as one line of running text, e.g. for an FAQ answer. */
export const OPENING_HOURS_TEXT = SITE.openingHours
  .map((slot) => `${slot.daysHebrew} ${slot.opens}–${slot.closes}`)
  .join(', ');
