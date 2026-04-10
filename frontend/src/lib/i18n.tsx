'use client';

import { createContext, useContext, ReactNode } from 'react';
import { translations, type Locale } from './i18n-data';

interface I18nContextType {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (typeof translations)['en'];
}

const I18nContext = createContext<I18nContextType | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const locale: Locale = 'en';
  const setLocale = (_l: Locale) => {};

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
