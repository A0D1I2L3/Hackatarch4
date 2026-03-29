import { createContext, useContext, useState } from "react";

// ─────────────────────────────────────────────────────────────
//  FONT OPTIONS
// ─────────────────────────────────────────────────────────────
export const FONT_OPTIONS = [
  {
    id: "playfair",
    label: "Playfair Display",
    value: "'Playfair Display', 'Times New Roman', serif",
  },
  {
    id: "baskerville",
    label: "Libre Baskerville",
    value: "'Libre Baskerville', Georgia, serif",
  },
  {
    id: "georgia",
    label: "Georgia",
    value: "'Georgia', 'Times New Roman', serif",
  },
  {
    id: "garamond",
    label: "EB Garamond",
    value: "'EB Garamond', Georgia, serif",
  },
  {
    id: "courier",
    label: "Typewriter",
    value: "'Special Elite', 'Courier New', monospace",
  },
];

// ─────────────────────────────────────────────────────────────
//  BACKGROUND / PAPER OPTIONS
// ─────────────────────────────────────────────────────────────
export const BG_OPTIONS = [
  {
    id: "newsprint",
    label: "Newsprint",
    light: "#f5f1e8",
    dark: "#1a1612",
    dot: "#d4cebf",
  },
  {
    id: "ivory",
    label: "Ivory",
    light: "#fdfaf2",
    dark: "#181610",
    dot: "#e8e0cc",
  },
  {
    id: "slate",
    label: "Slate",
    light: "#eef0f4",
    dark: "#141618",
    dot: "#cdd3dc",
  },
  {
    id: "sepia",
    label: "Sepia",
    light: "#f4ede0",
    dark: "#1c1510",
    dot: "#d8c8b0",
  },
  {
    id: "mint",
    label: "Mint",
    light: "#edf4ef",
    dark: "#111a13",
    dot: "#c2d9c8",
  },
];

// ─────────────────────────────────────────────────────────────
//  DEFAULTS
// ─────────────────────────────────────────────────────────────
const DEFAULT_SETTINGS = {
  paperName: "SAMACHAR TIMES",
  paperSlogan: "Truth Without Fear · Est. 1944",
  editorName: "Morgan Voss",
  fontId: "georgia",
  bgId: "newsprint",
  darkMode: false,
};

// ─────────────────────────────────────────────────────────────
//  CONTEXT
// ─────────────────────────────────────────────────────────────
const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  function updateSettings(partial) {
    setSettings((prev) => ({ ...prev, ...partial }));
  }

  const font =
    FONT_OPTIONS.find((f) => f.id === settings.fontId) ?? FONT_OPTIONS[0];
  const bg = BG_OPTIONS.find((b) => b.id === settings.bgId) ?? BG_OPTIONS[0];
  const MONO = "'Special Elite', 'Courier New', monospace";

  const theme = {
    font: font.value,
    mono: MONO,
    bgColor: settings.darkMode ? bg.dark : bg.light,
    dotColor: settings.darkMode ? bg.dot + "55" : bg.dot,
    textColor: settings.darkMode ? "#e8e4db" : "#1a1a1a",
    subColor: settings.darkMode ? "#9a9690" : "#555555",
    cardBg: settings.darkMode ? "#252320" : "#ffffff",
    cardBorder: settings.darkMode ? "#3a3630" : "#cccccc",
    inputBg: settings.darkMode ? "#1e1c19" : "#f9f6f0",
    barBg: settings.darkMode ? "#3a3630" : "#e8e4db",
    accentGold: "#c8a96e",
    darkMode: settings.darkMode,
  };

  return (
    <SettingsContext.Provider
      value={{ settings, updateSettings, theme, FONT_OPTIONS, BG_OPTIONS }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx)
    throw new Error("useSettings must be used inside <SettingsProvider>");
  return ctx;
}
