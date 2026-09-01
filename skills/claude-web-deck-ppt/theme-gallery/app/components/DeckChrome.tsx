"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { CustomizeSidebar } from "./CustomizeSidebar";
import { useThemeCustomize } from "./ThemeCustomize";

type UseDeckNavOptions = {
  length: number;
};

export function useDeckNavigation({ length }: UseDeckNavOptions) {
  const [active, setActive] = useState(0);
  const next = useCallback(
    () => setActive((current) => Math.min(current + 1, length - 1)),
    [length],
  );
  const previous = useCallback(
    () => setActive((current) => Math.max(current - 1, 0)),
    [],
  );
  const reset = useCallback(() => setActive(0), []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const tag = (event.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      // Don't steal keys while customize panel is focused
      if ((event.target as HTMLElement | null)?.closest?.(".customize-panel")) return;
      if (["ArrowRight", " ", "PageDown"].includes(event.key)) {
        event.preventDefault();
        next();
      } else if (["ArrowLeft", "PageUp"].includes(event.key)) {
        event.preventDefault();
        previous();
      } else if (event.key === "Home" || event.key === "r" || event.key === "R") {
        event.preventDefault();
        reset();
      } else if (event.key === "End") {
        event.preventDefault();
        setActive(length - 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [length, next, previous, reset]);

  return { active, setActive, next, previous, reset };
}

const OVERLAY_HIDE_MS = 1800;

function PaletteIcon() {
  return (
    <svg viewBox="0 0 20 20" width="16" height="16" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="7" cy="8" r="1.4" fill="currentColor" />
      <circle cx="12.5" cy="7.5" r="1.4" fill="currentColor" />
      <circle cx="13" cy="12" r="1.4" fill="currentColor" />
      <circle cx="8" cy="12.5" r="1.4" fill="currentColor" />
      <circle cx="10" cy="10" r="1.2" fill="currentColor" opacity="0.55" />
    </svg>
  );
}

/**
 * Overlay controls outside the PPT canvas:
 * - Readable hub UI type (never PPT display/serif)
 * - fades out after idle; returns on mouse move / key / focus
 * - palette opens customize sidebar (right)
 */
export function DeckChrome({
  active,
  length,
  onPrev,
  onNext,
  onReset,
  themeId,
}: {
  active: number;
  length: number;
  onPrev: () => void;
  onNext: () => void;
  onReset: () => void;
  themeId?: string;
}) {
  const [visible, setVisible] = useState(true);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { state, panelOpen, setPanelOpen } = useThemeCustomize();

  const bump = useCallback(() => {
    if (panelOpen) {
      setVisible(true);
      return;
    }
    setVisible(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setVisible(false), OVERLAY_HIDE_MS);
  }, [panelOpen]);

  useEffect(() => {
    bump();
    const onMove = () => bump();
    const onKey = () => bump();
    window.addEventListener("mousemove", onMove);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("keydown", onKey);
      if (timer.current) clearTimeout(timer.current);
    };
  }, [bump, active]);

  useEffect(() => {
    if (!panelOpen) return;
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPanelOpen(false);
    };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [panelOpen, setPanelOpen]);

  const selectUrl = (() => {
    if (!themeId) return "/";
    const params = new URLSearchParams();
    params.set("select", themeId);
    if (state.headlineFontId !== "theme-default") params.set("hf", state.headlineFontId);
    if (state.bodyFontId !== "theme-default") params.set("bf", state.bodyFontId);
    if (state.paletteId !== "theme-default") params.set("pal", state.paletteId);
    return `/?${params.toString()}`;
  })();

  return (
    <>
      <div className={`deck-top-bar${panelOpen ? " panel-open" : ""}`}>
        <Link href="/" className="deck-back" onMouseEnter={bump} onFocus={bump}>
          ← Gallery
        </Link>
        {themeId && (
          <div className="deck-top-right">
            <button
              type="button"
              className={`deck-palette${panelOpen ? " is-active" : ""}`}
              onClick={() => setPanelOpen(!panelOpen)}
              onMouseEnter={bump}
              onFocus={bump}
              aria-expanded={panelOpen}
              aria-controls="theme-customize-panel"
              title="Customize fonts & colors"
            >
              <PaletteIcon />
              <span>Customize</span>
            </button>
            <Link href={selectUrl} className="deck-select" onMouseEnter={bump} onFocus={bump}>
              Use this theme →
            </Link>
          </div>
        )}
      </div>

      <CustomizeSidebar />

      <nav
        className={`deck-controls${visible || panelOpen ? " is-visible" : ""}`}
        aria-label="Slide controls"
        onMouseEnter={bump}
        onFocus={bump}
      >
        <button type="button" className="btn" onClick={onPrev} disabled={active === 0} aria-label="Previous">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M10 3L5 8l5 5" />
          </svg>
        </button>
        <div className="count" aria-live="polite">
          <span className="current">{active + 1}</span>
          <span className="slash">/</span>
          <span className="total">{length}</span>
        </div>
        <button
          type="button"
          className="btn"
          onClick={onNext}
          disabled={active === length - 1}
          aria-label="Next"
        >
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M6 3l5 5-5 5" />
          </svg>
        </button>
        <span className="divider" aria-hidden="true" />
        <button type="button" className="btn reset" onClick={onReset} aria-label="Reset">
          Reset
          <span className="kbd">R</span>
        </button>
      </nav>
    </>
  );
}
