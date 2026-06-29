export const COLORS = {
  brand: '#00B4D8',
  brandDark: '#0077B6',
  brandGrad: ['#00C6FB', '#005BEA'],
  accent: '#FF6B35',
  accentDark: '#e05528',
  dark: '#0F172A',
  slate: '#334155',
  gray: '#64748B',
  muted: '#94A3B8',
  border: '#E2E8F0',
  light: '#F0F7FF',
  white: '#FFFFFF',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  bg: '#E8F4FD',
};

export const RATE = 22; // €/h

export const ROOMS = {
  cuisine:    { label: 'Cuisine',          emoji: '🍳', price: 5 },
  chambre:    { label: 'Chambre',          emoji: '🛏️', price: 3 },
  salle_bain: { label: 'Salle de bain',    emoji: '🚿', price: 5 },
  salon:      { label: 'Salon / Séjour',   emoji: '🛋️', price: 3 },
  bureau:     { label: 'Bureau',           emoji: '💼', price: 3 },
  entree:     { label: 'Entrée / Couloir', emoji: '🚪', price: 2 },
  complet:    { label: 'Nettoyage Complet',emoji: '✨', price: 0, special: true },
};

export const CLEANERS = [
  { id: 1, name: 'Sophie M.',  rating: 4.9, reviews: 142, eta: 8,  avatar: 'S', color: '#E879F9', lat: 48.8566, lng: 2.3522 },
  { id: 2, name: 'Karim B.',   rating: 4.7, reviews: 89,  eta: 12, avatar: 'K', color: '#38BDF8', lat: 48.8576, lng: 2.3612 },
  { id: 3, name: 'Marie L.',   rating: 4.8, reviews: 203, eta: 6,  avatar: 'M', color: '#34D399', lat: 48.8556, lng: 2.3432 },
  { id: 4, name: 'Thomas R.',  rating: 4.6, reviews: 57,  eta: 15, avatar: 'T', color: '#FBBF24', lat: 48.8596, lng: 2.3702 },
];

// PayPal — remplacez par votre Client ID sandbox/production
export const PAYPAL_CLIENT_ID = 'VOTRE_PAYPAL_CLIENT_ID_ICI';
export const PAYPAL_ENV = 'sandbox'; // 'sandbox' ou 'production'
