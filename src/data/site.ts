export const SITE = {
  name: 'גל עופרי פיזיותרפיה',
  tagline: 'חזרה לתנועה מלאה, בהתאמה אישית אליך',
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
    postalCode: '6522407',
    country: 'IL',
    countryName: 'Israel',
  },

  geo: {
    latitude: 32.0853,
    longitude: 34.7818,
  },

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

/** The opening hours as one line of running text, e.g. for an FAQ answer. */
export const OPENING_HOURS_TEXT = SITE.openingHours
  .map((slot) => `${slot.daysHebrew} ${slot.opens}–${slot.closes}`)
  .join(', ');
