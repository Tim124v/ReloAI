'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translations, type Locale } from './i18n-data';

interface I18nContextType {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (typeof translations)['en'];
}

const I18nContext = createContext<I18nContextType | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');

  useEffect(() => {
    const stored = localStorage.getItem('relo_lang') as Locale | null;
    if (stored && translations[stored]) setLocaleState(stored);
  }, []);

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    localStorage.setItem('relo_lang', l);
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale, t: translations[locale] }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be inside I18nProvider');
  return ctx;
}
