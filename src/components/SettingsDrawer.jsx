import { useState, useEffect } from "react";
import {
  useSettings,
  FONT_OPTIONS,
  BG_OPTIONS,
} from "../context/SettingsContext.jsx";

// ─────────────────────────────────────────────────────────────
//  TOGGLE SWITCH
// ─────────────────────────────────────────────────────────────
function ToggleSwitch({ value, onChange, accentColor = "#1a1a1a" }) {
  return (
    <div
      onClick={() => onChange(!value)}
      style={{
        width: 44,
        height: 24,
        borderRadius: 12,
        background: value ? accentColor : "#d1d5db",
        position: "relative",
        cursor: "pointer",
        transition: "background 0.2s",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 3,
          left: value ? 22 : 3,
          width: 18,
          height: 18,
          borderRadius: "50%",
          background: "#fff",
          transition: "left 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
          boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
        }}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  SECTION LABEL
// ─────────────────────────────────────────────────────────────
function SectionLabel({ text, theme }) {
  return (
    <div
      style={{
        fontFamily: theme.mono,
        fontSize: 9,
        color: theme.subColor,
        letterSpacing: 2,
        textTransform: "uppercase",
        marginBottom: 8,
        marginTop: 18,
      }}
    >
      {text}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  SETTINGS DRAWER  (slides in from right)
// ─────────────────────────────────────────────────────────────
export default function SettingsDrawer({ open, onClose }) {
  const { settings, updateSettings, theme } = useSettings();
  const [localName, setLocalName] = useState(settings.paperName);
  const [localSlogan, setLocalSlogan] = useState(settings.paperSlogan);
  const [localEditor, setLocalEditor] = useState(settings.editorName);

  // Sync local fields only when the drawer opens
  useEffect(() => {
    if (open) {
      setLocalName(settings.paperName);
      setLocalSlogan(settings.paperSlogan);
      setLocalEditor(settings.editorName);
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleSave() {
    updateSettings({
      paperName: localName || "THE EDITOR",
      paperSlogan: localSlogan || "Truth Without Fear · Est. 1944",
      editorName: localEditor || "Morgan Voss",
    });
    onClose();
  }

  const inputStyle = {
    width: "100%",
    padding: "8px 10px",
    fontFamily: theme.font,
    fontSize: 13,
    color: theme.textColor,
    background: theme.inputBg,
    border: `1.5px solid ${theme.cardBorder}`,
    borderRadius: 5,
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.15s",
  };

  const optionCard = (selected) => ({
    border: `2px solid ${selected ? theme.accentGold : theme.cardBorder}`,
    borderRadius: 5,
    padding: "8px 10px",
    cursor: "pointer",
    background: selected
      ? theme.darkMode
        ? "#2a2620"
        : "#fdf8f0"
      : theme.cardBg,
    transition: "all 0.15s",
  });

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.35)",
          zIndex: 998,
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transition: "opacity 0.25s",
          backdropFilter: open ? "blur(2px)" : "none",
        }}
      />

      {/* Drawer panel */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: 360,
          background: theme.bgColor,
          backgroundImage: `radial-gradient(${theme.dotColor} 1px, transparent 1px)`,
          backgroundSize: "18px 18px",
          borderLeft: `1.5px solid ${theme.cardBorder}`,
          boxShadow: open ? "-8px 0 40px rgba(0,0,0,0.25)" : "none",
          transform: open ? "translateX(0)" : "translateX(100%)",
          transition:
            "transform 0.3s cubic-bezier(0.32, 0.72, 0, 1), box-shadow 0.3s",
          zIndex: 999,
          display: "flex",
          flexDirection: "column",
          fontFamily: theme.font,
          color: theme.textColor,
          overflowY: "auto",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "18px 20px 14px",
            borderBottom: `1px solid ${theme.cardBorder}`,
            background: theme.cardBg,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div
              style={{
                fontFamily: theme.mono,
                fontSize: 9,
                letterSpacing: 3,
                color: theme.subColor,
                marginBottom: 4,
              }}
            >
              CUSTOMIZE
            </div>
            <div
              style={{
                fontFamily: theme.font,
                fontSize: 20,
                fontWeight: "bold",
                letterSpacing: -0.5,
              }}
            >
              Newsroom Settings
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: `1px solid ${theme.cardBorder}`,
              borderRadius: "50%",
              width: 32,
              height: 32,
              cursor: "pointer",
              color: theme.subColor,
              fontSize: 16,
              lineHeight: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = theme.barBg;
              e.currentTarget.style.color = theme.textColor;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = theme.subColor;
            }}
          >
            ×
          </button>
        </div>

        {/* Scrollable body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "4px 20px 20px" }}>
          {/* ── Newspaper Identity ── */}
          <div
            style={{
              background: theme.cardBg,
              border: `1px solid ${theme.cardBorder}`,
              borderRadius: 7,
              padding: "14px 16px",
              marginTop: 16,
            }}
          >
            <SectionLabel text="Newspaper Name" theme={theme} />
            <input
              style={{ ...inputStyle, marginBottom: 10 }}
              value={localName}
              onChange={(e) => setLocalName(e.target.value)}
              placeholder="THE EDITOR"
              maxLength={40}
              onFocus={(e) => (e.target.style.borderColor = theme.accentGold)}
              onBlur={(e) => (e.target.style.borderColor = theme.cardBorder)}
            />

            <SectionLabel text="Slogan" theme={theme} />
            <input
              style={{ ...inputStyle, marginBottom: 10 }}
              value={localSlogan}
              onChange={(e) => setLocalSlogan(e.target.value)}
              placeholder="Truth Without Fear · Est. 1944"
              maxLength={60}
              onFocus={(e) => (e.target.style.borderColor = theme.accentGold)}
              onBlur={(e) => (e.target.style.borderColor = theme.cardBorder)}
            />

            <SectionLabel text="Editor Name" theme={theme} />
            <input
              style={inputStyle}
              value={localEditor}
              onChange={(e) => setLocalEditor(e.target.value)}
              placeholder="Morgan Voss"
              maxLength={40}
              onFocus={(e) => (e.target.style.borderColor = theme.accentGold)}
              onBlur={(e) => (e.target.style.borderColor = theme.cardBorder)}
            />

            {/* Live masthead preview */}
            <div
              style={{
                marginTop: 14,
                padding: "12px 14px",
                background: theme.inputBg,
                borderRadius: 5,
                textAlign: "center",
                border: `1px dashed ${theme.cardBorder}`,
              }}
            >
              <div
                style={{
                  fontFamily: theme.mono,
                  fontSize: 8,
                  color: theme.subColor,
                  letterSpacing: 2,
                  marginBottom: 4,
                }}
              >
                MASTHEAD PREVIEW
              </div>
              <div
                style={{
                  fontFamily: theme.font,
                  fontSize: 18,
                  fontWeight: "bold",
                  color: theme.textColor,
                  letterSpacing: -0.5,
                }}
              >
                {localName || "THE EDITOR"}
              </div>
              <div
                style={{
                  fontFamily: theme.font,
                  fontStyle: "italic",
                  fontSize: 10,
                  color: theme.subColor,
                  marginTop: 2,
                }}
              >
                {localSlogan || "Truth Without Fear · Est. 1944"}
              </div>
              <div
                style={{
                  fontFamily: theme.mono,
                  fontSize: 8,
                  color: theme.subColor,
                  marginTop: 2,
                  opacity: 0.7,
                }}
              >
                Editor: {localEditor || "Morgan Voss"}
              </div>
            </div>
          </div>

          {/* ── Typeface ── */}
          <div
            style={{
              background: theme.cardBg,
              border: `1px solid ${theme.cardBorder}`,
              borderRadius: 7,
              padding: "14px 16px",
              marginTop: 12,
            }}
          >
            <SectionLabel text="Typeface" theme={theme} />
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {FONT_OPTIONS.map((f) => (
                <div
                  key={f.id}
                  onClick={() => updateSettings({ fontId: f.id })}
                  style={optionCard(settings.fontId === f.id)}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div
                      style={{
                        fontFamily: f.value,
                        fontSize: 15,
                        color: theme.textColor,
                      }}
                    >
                      {f.label}
                    </div>
                    <div
                      style={{
                        fontFamily: f.value,
                        fontSize: 10,
                        color: theme.subColor,
                        fontStyle: "italic",
                      }}
                    >
                      A paper of record.
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Page Color ── */}
          <div
            style={{
              background: theme.cardBg,
              border: `1px solid ${theme.cardBorder}`,
              borderRadius: 7,
              padding: "14px 16px",
              marginTop: 12,
            }}
          >
            <SectionLabel text="Page Color" theme={theme} />
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(5, 1fr)",
                gap: 6,
                marginBottom: 16,
              }}
            >
              {BG_OPTIONS.map((b) => {
                const swatch = settings.darkMode ? b.dark : b.light;
                const selected = settings.bgId === b.id;
                return (
                  <div
                    key={b.id}
                    onClick={() => updateSettings({ bgId: b.id })}
                    style={{
                      border: `2px solid ${selected ? theme.accentGold : theme.cardBorder}`,
                      borderRadius: 5,
                      padding: "6px 4px",
                      textAlign: "center",
                      cursor: "pointer",
                      background: selected
                        ? theme.darkMode
                          ? "#2a2620"
                          : "#fdf8f0"
                        : theme.cardBg,
                      transition: "all 0.15s",
                    }}
                  >
                    <div
                      style={{
                        width: "100%",
                        height: 22,
                        borderRadius: 3,
                        background: swatch,
                        backgroundImage: `radial-gradient(${b.dot} 1px, transparent 1px)`,
                        backgroundSize: "6px 6px",
                        border: `1px solid ${b.dot}`,
                        marginBottom: 5,
                      }}
                    />
                    <div
                      style={{
                        fontFamily: theme.mono,
                        fontSize: 7,
                        color: theme.subColor,
                        letterSpacing: 0.5,
                      }}
                    >
                      {b.label.toUpperCase()}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Dark mode toggle */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                paddingTop: 12,
                borderTop: `1px solid ${theme.cardBorder}`,
              }}
            >
              <div>
                <div
                  style={{
                    fontFamily: theme.mono,
                    fontSize: 9,
                    color: theme.subColor,
                    letterSpacing: 2,
                    marginBottom: 2,
                  }}
                >
                  DARK MODE
                </div>
                <div style={{ fontSize: 11, color: theme.subColor }}>
                  {settings.darkMode
                    ? "Ink on black — the night shift."
                    : "Newsprint — classic daylight."}
                </div>
              </div>
              <ToggleSwitch
                value={settings.darkMode}
                onChange={(v) => updateSettings({ darkMode: v })}
                accentColor={theme.accentGold}
              />
            </div>
          </div>
        </div>

        {/* Footer: Save */}
        <div
          style={{
            padding: "14px 20px",
            borderTop: `1px solid ${theme.cardBorder}`,
            background: theme.cardBg,
            flexShrink: 0,
            display: "flex",
            gap: 8,
          }}
        >
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: "10px 0",
              background: "transparent",
              color: theme.subColor,
              border: `1px solid ${theme.cardBorder}`,
              borderRadius: 5,
              fontFamily: theme.mono,
              fontSize: 10,
              letterSpacing: 1,
              cursor: "pointer",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = theme.textColor;
              e.currentTarget.style.color = theme.textColor;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = theme.cardBorder;
              e.currentTarget.style.color = theme.subColor;
            }}
          >
            DISCARD
          </button>
          <button
            onClick={handleSave}
            style={{
              flex: 2,
              padding: "10px 0",
              background: theme.darkMode ? "#e8e4db" : "#1a1a1a",
              color: theme.darkMode ? "#1a1a1a" : "#f5f1e8",
              border: "none",
              borderRadius: 5,
              fontFamily: theme.mono,
              fontSize: 11,
              letterSpacing: 2,
              cursor: "pointer",
              transition: "opacity 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            SAVE SETTINGS →
          </button>
        </div>
      </div>
    </>
  );
}
