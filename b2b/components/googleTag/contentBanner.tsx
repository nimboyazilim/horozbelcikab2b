'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

export default function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);

  const t = useTranslations('CookieConsent');

  useEffect(() => {
    const hasConsent = localStorage.getItem('cookie_consent');
    if (!hasConsent) {
      setVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie_consent', 'granted');
    
    // Consent Mode update kodu
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('consent', 'update', {
        'ad_storage': 'granted',
        'ad_user_data': 'granted',
        'ad_personalization': 'granted',
        'analytics_storage': 'granted'
      });
    }

    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div style={styles.banner}>
      <div style={styles.content}>
        <div style={styles.iconContainer}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.9 1 3 1.9 3 3V21C3 22.1 3.9 23 5 23H19C20.1 23 21 22.1 21 21V9H19V21H5V3H13V9H21Z" fill="currentColor"/>
          </svg>
        </div>
        <div style={styles.textContainer}>
          <h4 style={styles.title}>{t('title')}</h4>
          <p style={styles.text}>
            {t('description')}
          </p>
        </div>
      </div>
      <div style={styles.buttonContainer}>
        <button onClick={handleAccept} style={styles.button}>
          {t('accept')}
        </button>
      </div>
    </div>
  );
}

const styles = {
  banner: {
    position: 'fixed' as const,
    bottom: '20px',
    right: '20px',
    width: '400px',
    maxWidth: 'calc(100vw - 40px)',
    backgroundColor: '#ffffff',
    color: '#333333',
    padding: '20px',
    borderRadius: '16px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    border: '1px solid #e5e7eb',
    zIndex: 1000,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },
  content: {
    display: 'flex',
    gap: '16px',
    marginBottom: '20px'
  },
  iconContainer: {
    flexShrink: 0,
    width: '40px',
    height: '40px',
    backgroundColor: '#f3f4f6',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#6b7280'
  },
  textContainer: {
    flex: 1
  },
  title: {
    margin: '0 0 8px 0',
    fontSize: '16px',
    fontWeight: '600',
    color: '#111827'
  },
  text: {
    margin: 0,
    fontSize: '14px',
    lineHeight: '1.5',
    color: '#6b7280'
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'flex-end'
  },
  button: {
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    border: 'none',
    padding: '12px 24px',
    cursor: 'pointer',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s ease',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    ':hover': {
      backgroundColor: '#2563eb',
      transform: 'translateY(-1px)',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
    }
  }
};
