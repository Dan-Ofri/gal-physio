export const SITE = {
  name: 'גל עופרי פיזיותרפיה',
  tagline: 'חזרה לתנועה מלאה, בהתאמה אישית אליך',
  description:
    'גל עופרי — פיזיותרפיסטית מוסמכת B.P.T בתל אביב. שיקום ספורט, טיפול בכאב ופציעות אורטופדיות, ליווי אישי לכל שלב בחיים.',
  url: 'https://www.galofri-physio.co.il',
  locale: 'he_IL',

  // ── Contact ──────────────────────────────────────────────────────────────
  phone: '052-308-6600',         // Human-readable display
  phoneE164: '+972523086600',    // E.164 for tel: links and Schema.org
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

  openingHours: ['Mo-Th 08:00-19:00', 'Fr 08:00-14:00'],

  // ── Social ────────────────────────────────────────────────────────────────
  social: {
    instagram: 'https://www.instagram.com/galofri/',
    facebook: '',
    linkedin: '',
  },

  // ── Open Graph ────────────────────────────────────────────────────────────
  openGraph: {
    image: '/og-image.jpg',
    imageAlt: 'גל עופרי פיזיותרפיה — קליניקת פיזיותרפיה ושיקום בתל אביב',
    imageWidth: 1200,
    imageHeight: 630,
  },
} as const;
