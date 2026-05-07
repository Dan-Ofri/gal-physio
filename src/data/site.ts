export const SITE = {
  name: 'גל עופרי פיזיותרפיה',
  tagline: 'חזרה לתנועה מלאה, בהתאמה אישית אליך',
  description:
    'פיזיותרפיסטית מוסמכת בתל אביב עם למעלה מ-10 שנות ניסיון בשיקום ספורט, טיפול בכאב ופציעות אורטופדיות. תיאום ייעוץ ראשוני בקלות.',
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
    street: 'תל אביב',
    city: 'Tel Aviv',           // English for Google local SEO
    cityHebrew: 'תל אביב',
    region: 'Tel Aviv District',
    postalCode: '6100000',
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
    instagram: '',
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
