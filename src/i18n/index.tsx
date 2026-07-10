// i18n — pt-BR é o idioma padrão. Estrutura pronta para EN/ES/FR/IT/DE.
// Uso: const t = useT(); t("nav.dashboard")
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Locale } from "@/types";
import { ptBR } from "./pt-BR";
import { en } from "./en";

type Dict = typeof ptBR;

const DICTS: Record<Locale, Dict> = {
  "pt-BR": ptBR,
  en: en,
  es: ptBR, // stub — will fall back to pt-BR until traduzido
  fr: ptBR,
  it: ptBR,
  de: ptBR,
};

const STORAGE_KEY = "livepulse.locale";

interface I18nContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

function resolve(dict: Dict, key: string): string {
  const parts = key.split(".");
  let acc: unknown = dict;
  for (const p of parts) {
    if (acc && typeof acc === "object" && p in (acc as Record<string, unknown>)) {
      acc = (acc as Record<string, unknown>)[p];
    } else return key;
  }
  return typeof acc === "string" ? acc : key;
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("pt-BR");

  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;
      if (raw) setLocaleState(raw as Locale);
    } catch {}
  }, []);

  const value = useMemo<I18nContextValue>(() => ({
    locale,
    setLocale: (l) => {
      setLocaleState(l);
      try { window.localStorage.setItem(STORAGE_KEY, l); } catch {}
    },
    t: (key, vars) => {
      let out = resolve(DICTS[locale], key);
      if (vars) for (const [k, v] of Object.entries(vars)) out = out.replaceAll(`{${k}}`, String(v));
      return out;
    },
  }), [locale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useT() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useT must be used within <I18nProvider>");
  return ctx.t;
}

export function useLocale() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useLocale must be used within <I18nProvider>");
  return { locale: ctx.locale, setLocale: ctx.setLocale };
}
