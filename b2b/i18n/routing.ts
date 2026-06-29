import {defineRouting} from 'next-intl/routing';
import {createNavigation} from 'next-intl/navigation';
 
export const routing = defineRouting({
  // A list of all locales that are supported
  locales: ['ro', 'en','tr','fr','nl'],
 
  // Used when no locale matches
  defaultLocale: 'tr',
 

  

  pathnames: {
    '/': '/',
    '/product-detail/[slug]': {
      ro: '/detaliu-produs/[slug]',
      en: '/product-detail/[slug]',
      tr: '/urun-detayi/[slug]',
      ru: '/product-detail/[slug]',
      fr: '/detail-produit/[slug]',
      nl: '/productdetail/[slug]'
    },
    '/products/[...slug]': {
      ro: '/produse/[...slug]',
      en: '/products/[...slug]',
      tr: '/urunler/[...slug]',
      ru: '/products/[...slug]',
      fr: '/produits/[...slug]',
      nl: '/producten/[...slug]'
    },
    '/products/': {
      ro: '/produse',
      en: '/products',
      tr: '/urunler',
      ru: '/products',
      fr: '/produits',
      nl: '/producten'
    },
    '/new-products': {
      ro: '/produse-noi',
      en: '/new-products',
      tr: '/yeni-urunler',
      ru: '/new-products',
      fr: '/nouveaux-produits',
      nl: '/nieuwe-producten'
    },
    '/catalog': {
      ro: '/cataloage',
      en: '/catalog',
      tr: '/katalog',
      ru: '/catalog',
      fr: '/catalogue',
      nl: '/catalogus'
    },
    '/news': {
      ro: '/stiri',
      en: '/news',
      tr: '/haberler',
      ru: '/news',
      fr: '/actualites',
      nl: '/nieuws'
    },
    '/news/[slug]': {
      ro: '/stiri/[slug]',
      en: '/news/[slug]',
      tr: '/haberler/[slug]',
      ru: '/news/[slug]',
      fr: '/actualites/[slug]',
      nl: '/nieuws/[slug]'
    },
    '/terms-of-use': {
      ro: '/termeni-de-folosinta',
      en: '/terms-of-use',
      tr: '/kullanim-kosullari',
      ru: '/terms-of-use',
      fr: '/conditions-utilisation',
      nl: '/gebruiksvoorwaarden'
    },
    '/lighting-text': {
      ro: '/text-iluminare',
      en: '/lighting-text',
      tr: '/aydinlatma-metni',
      ru: '/lighting-text',
      fr: '/texte-information',
      nl: '/informatietekst'
    },
    '/corporate': {
      ro: '/corporate',
      en: '/corporate',
      tr: '/hakkimizda',
      ru: '/corporate',
      fr: '/a-propos',
      nl: '/over-ons'
    },
    '/contact': {
      ro: '/adresa-noua',
      en: '/contact',
      tr: '/iletisim',
      ru: '/contact',
      fr: '/contact',
      nl: '/contact'
    },
    '/maintenance': {
      ro: '/mentenanta',
      en: '/maintenance',
      tr: '/bakim',
      ru: '/obsluzhivanie',
      fr: '/maintenance',
      nl: '/onderhoud'
    },
    '/orders': {
      ro: '/comenzi',
      en: '/orders',
      tr: '/siparisler',
      ru: '/orders',
      fr: '/commandes',
      nl: '/bestellingen'
    },
    '/cart/[slug]': {
      ro: '/cos/[slug]',
      en: '/cart/[slug]',
      tr: '/sepet/[slug]',
      ru: '/cart/[slug]',
      fr: '/panier/[slug]',
      nl: '/winkelwagen/[slug]'
    },
    '/profil': {
      ro: '/profil',
      en: '/profile',
      tr: '/profil',
      ru: '/profile',
      fr: '/profil',
      nl: '/profiel'
    },
    '/search/[slug]': {
      ro: '/search/[slug]',
      en: '/search/[slug]',
      tr: '/arama/[slug]',
      ru: '/search/[slug]',
      fr: '/recherche/[slug]',
      nl: '/zoeken/[slug]'
    },
    '/login': {
      ro: '/login',
      en: '/login',
      tr: '/login',
      ru: '/login',
      fr: '/login',
      nl: '/login'
    },
    '/new-dealer': {
      ro: '/new-dealer',
      en: '/new-dealer',
      tr: '/yeni-bayi',
      ru: '/new-dealer',
      fr: '/nouveau-revendeur',
      nl: '/nieuwe-dealer'
    },
    '/account-statement': {
      ro: '/extrase-cont',
      en: '/account-statement',
      tr: '/hesap-ekstresi',
      ru: '/account-statement',
      fr: '/releve-de-compte',
      nl: '/rekeningoverzicht'
    },
    '/outlet-products': {
      ro: '/produse-reducere',
      en: '/outlet-products',
      tr: '/indirimli-urunler',
      ru: '/outlet-products',
      fr: '/produits-destockage',
      nl: '/outletproducten'
    },
    '/category/[slug]': {
      ro: '/categorie/[slug]',
      en: '/category/[slug]',
      tr: '/kategori/[slug]',
      ru: '/category/[slug]',
      fr: '/categorie/[slug]',
      nl: '/categorie/[slug]'
    }
  },
 
});
 
// Lightweight wrappers around Next.js' navigation APIs
// that will consider the routing configuration
export const {Link, redirect, usePathname, useRouter, getPathname} =
  createNavigation(routing);