export const SITE = {
  name: 'Gal Ofri Physiotherapy',
  tagline: 'Restoring Movement. Rebuilding Lives.',
  description:
    'Expert physiotherapy care in a warm, professional environment. Specialising in sports injuries, post-operative rehabilitation, and chronic pain management.',
  url: 'https://www.galofri-physio.co.il',
  locale: 'en_IL',
  phone: '+972-XX-XXX-XXXX',
  email: 'info@galofri-physio.co.il',
  address: {
    street: '1 Example Street',
    city: 'Tel Aviv',
    region: 'Tel Aviv District',
    postalCode: '6100000',
    country: 'IL',
    countryName: 'Israel',
  },
  geo: {
    latitude: 32.0853,
    longitude: 34.7818,
  },
  openingHours: [
    'Mo-Th 08:00-19:00',
    'Fr 08:00-14:00',
  ],
  social: {
    facebook: '',
    instagram: '',
  },
  openGraph: {
    image: '/og-image.jpg',
    imageAlt: 'Gal Ofri Physiotherapy — professional physiotherapy clinic',
    imageWidth: 1200,
    imageHeight: 630,
  },
} as const;
