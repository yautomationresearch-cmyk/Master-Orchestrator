"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import {
  DEFAULT_CUSTOMIZE,
  customizeCssVars,
  loadCustomize,
  saveCustomize,
  type ThemeCustomizeState,
} from "../lib/customize";
import { googleFontsHref } from "../lib/fonts";
import { pickRandomPalette } from "../lib/palettes";
import type { ThemeId } from "../lib/themes";

type Ctx = {
  state: ThemeCustomizeState;
  setHeadlineFont: (id: string) => void;
  setBodyFont: (id: string) => void;
  setPalette: (id: string) => void;
  randomPalette: () => void;
  resetCustomize: () => void;
  panelOpen: boolean;
  setPanelOpen: (open: boolean) => void;
  cssVarsFor: (themeId: ThemeId) => CSSProperties;
};

const CustomizeContext = createContext<Ctx | null>(null);

export function ThemeCustomizeProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ThemeCustomizeState>(DEFAULT_CUSTOMIZE);
  const [hydrated, setHydrated] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);

  useEffect(() => {
    setState(loadCustomize());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveCustomize(state);
  }, [state, hydrated]);

  useEffect(() => {
    const href = googleFontsHref([state.headlineFontId, state.bodyFontId]);
    if (!href) return;
    const id = "theme-gallery-google-fonts";
    let link = document.getElementById(id) as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      document.head.appendChild(link);
    }
    link.href = href;
  }, [state.headlineFontId, state.bodyFontId]);

  const setHeadlineFont = useCallback((id: string) => {
    setState((s) => ({ ...s, headlineFontId: id }));
  }, []);

  const setBodyFont = useCallback((id: string) => {
    setState((s) => ({ ...s, bodyFontId: id }));
  }, []);

  const setPalette = useCallback((id: string) => {
    setState((s) => ({ ...s, paletteId: id }));
  }, []);

  const randomPalette = useCallback(() => {
    setState((s) => {
      const next = pickRandomPalette(s.paletteId);
      return { ...s, paletteId: next.id };
    });
  }, []);

  const resetCustomize = useCallback(() => {
    setState(DEFAULT_CUSTOMIZE);
  }, []);

  const cssVarsFor = useCallback(
    (themeId: ThemeId) => customizeCssVars(state, themeId) as CSSProperties,
    [state],
  );

  const value = useMemo(
    () => ({
      state,
      setHeadlineFont,
      setBodyFont,
      setPalette,
      randomPalette,
      resetCustomize,
      panelOpen,
      setPanelOpen,
      cssVarsFor,
    }),
    [
      state,
      setHeadlineFont,
      setBodyFont,
      setPalette,
      randomPalette,
      resetCustomize,
      panelOpen,
      cssVarsFor,
    ],
  );

  return <CustomizeContext.Provider value={value}>{children}</CustomizeContext.Provider>;
}

export function useThemeCustomize() {
  const ctx = useContext(CustomizeContext);
  if (!ctx) {
    throw new Error("useThemeCustomize must be used within ThemeCustomizeProvider");
  }
  return ctx;
}
