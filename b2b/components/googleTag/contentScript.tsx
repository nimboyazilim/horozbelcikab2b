'use client';

import { useEffect } from 'react';

// Global window tipi için interface tanımlaması
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

export default function ConsentScript() {
  useEffect(() => {
    window.dataLayer = window.dataLayer || [];
    
    function gtag(...args: any[]) {
      window.dataLayer.push(args);
    }

    window.gtag = gtag; // global erişim için

    gtag('consent', 'default', {
      'ad_storage': 'denied',
      'ad_user_data': 'denied',
      'ad_personalization': 'denied',
      'analytics_storage': 'denied'
    });
  }, []);

  return null;
}
