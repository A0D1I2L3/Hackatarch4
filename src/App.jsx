import React, { useState, useCallback } from "react";
import {
  SLOTS,
  INITIAL_SCORES,
  PARAMS,
  DAY_1_SEED,
  WIN_CONDITIONS,
} from "./engine/constants.js";
import { processEditorTurn, applyScoreUpdates } from "./engine/grokApi.js";
import {
  checkCollapses,
  resolveCollapseEnding,
  checkWin,
} from "./engine/scoring.js";

import StoryCard from "./components/StoryCard.jsx";
import StoryModal from "./components/StoryModal.jsx";
import NewspaperGrid from "./components/NewspaperGrid.jsx";
import ParameterBar from "./components/ParameterBar.jsx";
import ExternalFactorPanel from "./components/ExternalFactorPanel.jsx";
import ConsequenceScreen from "./components/ConsequenceScreen.jsx";
import EndingScreen from "./components/EndingScreen.jsx";
import LoadingScreen from "./components/LoadingScreen.jsx";
import FactorIntroScreen from "./components/FactorIntroScreen.jsx";
import SettingsDrawer from "./components/SettingsDrawer.jsx";
import { useSettings } from "./context/SettingsContext.jsx";

import "./App.css";

function makeInitialSlots() {
  return Object.fromEntries(SLOTS.map((s) => [s.id, null]));
}
function makeInitialResponses(factors) {
  return Object.fromEntries(
    (factors || []).map((f) => [f.factor_id, "ignored"]),
  );
}

const MAX_DAYS = 7;

export default function App() {
  const { settings, theme } = useSettings();

  const [phase, setPhase] = useState("story_delivery");
  const [dayData, setDayData] = useState(DAY_1_SEED);
  const [dayNumber, setDayNumber] = useState(1);
  const [scores, setScores] = useState({ ...INITIAL_SCORES });
  const [prevScores, setPrevScores] = useState(null);
  const [slots, setSlots] = useState(makeInitialSlots());
  const [draggedStory, setDraggedStory] = useState(null);
  const [gridItems, setGridItems] = useState([]);
  const [factorResponses, setFactorResponses] = useState(
    makeInitialResponses(DAY_1_SEED.external_factors),
  );
  const [arcFlags, setArcFlags] = useState([]);
  const [partA, setPartA] = useState(null);
  const [nextDayData, setNextDayData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [collapseKey, setCollapseKey] = useState(null);
  const [isVictory, setIsVictory] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selectedStory, setSelectedStory] = useState(null);

  const placedIds = new Set(gridItems.map((it) => it.story.story_id));
  const availableStories = dayData.stories.filter(
    (s) => !placedIds.has(s.story_id),
  );
  const placedCount = gridItems.length;
  const allSlotsPlaced = placedCount >= 1;
  const handleDragStart = useCallback((e, story) => {
    setDraggedStory(story);
    e.dataTransfer.effectAllowed = "move";
  }, []);

  const handleGridChange = useCallback((items) => {
    setGridItems(items);
  }, []);

  const handleFactorResponse = useCallback((factorId, response) => {
    setFactorResponses((prev) => ({ ...prev, [factorId]: response }));
  }, []);

  const handlePublish = useCallback(async () => {
    if (!allSlotsPlaced) return;
    setLoading(true);
    setApiError(null);
    setPhase("publishing");

    const factorsWithResponse = dayData.external_factors.map((f) => ({
      ...f,
      player_response: factorResponses[f.factor_id] || "ignored",
    }));

    try {
      const { partA: a, partB: b } = await processEditorTurn({
        day: dayNumber,
        scores,
        slots: gridItems.map((it) => ({
          story_id: it.story.story_id,
          headline: it.story.headline,
          col: it.col,
          row: it.row,
          w: it.w,
          h: it.h,
          weight: it.weight ?? it.w * it.h,
          sensitivity: it.story.slot_sensitivity,
          explosive_rating: it.story.explosive_rating,
        })),
        factors: factorsWithResponse,
        arcFlags,
      });

      const nextScores = applyScoreUpdates(scores, a.score_updates);
      setPrevScores({ ...scores });
      setScores(nextScores);

      const newFlags = b.stories
        .map((s) => s.arc_flag_generated)
        .filter(Boolean);
      setArcFlags((prev) => [...new Set([...prev, ...newFlags])]);

      const collapsed = checkCollapses(nextScores);
      if (collapsed.length > 0) {
        setCollapseKey(collapsed.length >= 2 ? "CASCADE" : collapsed[0]);
        setNextDayData(b);
        setPartA(a);
        setPhase("consequence");
        setLoading(false);
        return;
      }

      if (dayNumber >= MAX_DAYS) {
        setIsVictory(true);
        setNextDayData(b);
        setPartA(a);
        setPhase("consequence");
        setLoading(false);
        return;
      }

      setNextDayData(b);
      setPartA(a);
      setPhase("consequence");
    } catch (err) {
      setApiError(err.message || "Unknown error");
      setPhase("error");
    }
    setLoading(false);
  }, [allSlotsPlaced, dayData, dayNumber, scores, factorResponses, arcFlags]);

  const handleContinueFromConsequence = useCallback(() => {
    if (collapseKey || isVictory || dayNumber >= MAX_DAYS) {
      setPhase("ending");
    } else {
      setPhase("factor_intro");
    }
  }, [collapseKey, isVictory, dayNumber]);

  const handleFactorIntroDone = useCallback(() => {
    const nextDay = dayNumber + 1;
    setDayNumber(nextDay);
    setDayData(nextDayData);
    setSlots(makeInitialSlots());
    setGridItems([]);
    setFactorResponses(makeInitialResponses(nextDayData?.external_factors));
    setPartA(null);
    setNextDayData(null);
    setPhase("story_delivery");
  }, [dayNumber, nextDayData]);

  const handleRestart = useCallback(() => {
    setPhase("story_delivery");
    setDayData(DAY_1_SEED);
    setDayNumber(1);
    setScores({ ...INITIAL_SCORES });
    setPrevScores(null);
    setSlots(makeInitialSlots());
    setDraggedStory(null);
    setGridItems([]);
    setFactorResponses(makeInitialResponses(DAY_1_SEED.external_factors));
    setArcFlags([]);
    setPartA(null);
    setNextDayData(null);
    setApiError(null);
    setCollapseKey(null);
    setIsVictory(false);
  }, []);

  // ── Theme-driven page style ────────────────────────────────
  const pageStyle = {
    minHeight: "100vh",
    background: theme.bgColor,
    backgroundImage: `radial-gradient(${theme.dotColor} 1px, transparent 1px)`,
    backgroundSize: "20px 20px",
    fontFamily: theme.font,
    color: theme.textColor,
    transition: "background 0.4s ease, color 0.3s ease",
  };

  // ── Settings drawer (always mounted for smooth animation) ──
  const settingsDrawer = (
    <SettingsDrawer
      open={settingsOpen}
      onClose={() => setSettingsOpen(false)}
    />
  );

  if (phase === "publishing" || phase === "error") {
    return (
      <>
        {settingsDrawer}
        <LoadingScreen
          error={apiError}
          onRetry={() => {
            setApiError(null);
            setPhase("story_delivery");
          }}
        />
      </>
    );
  }

  if (phase === "consequence" && partA) {
    return (
      <>
        {settingsDrawer}
        <ConsequenceScreen
          partA={partA}
          dayNumber={dayNumber}
          isGameOver={!!collapseKey}
          isVictory={isVictory || dayNumber >= MAX_DAYS}
          onContinue={handleContinueFromConsequence}
        />
      </>
    );
  }

  if (phase === "ending") {
    return (
      <>
        {settingsDrawer}
        <EndingScreen
          scores={scores}
          collapseKey={collapseKey}
          dayNumber={dayNumber}
          arcFlags={arcFlags}
          onRestart={handleRestart}
        />
      </>
    );
  }

  if (phase === "factor_intro" && nextDayData) {
    return (
      <>
        {settingsDrawer}
        <FactorIntroScreen
          dayNumber={dayNumber + 1}
          dayTitle={nextDayData.day_title}
          atmosphere={nextDayData.newsroom_atmosphere}
          factors={nextDayData.external_factors || []}
          onDone={handleFactorIntroDone}
        />
      </>
    );
  }

  return (
    <div className="app-page" style={pageStyle}>
      {settingsDrawer}

      {/* ── TOP BAR ─────────────────────────────────────────── */}
      <div
        className="top-bar"
        style={{
          background: theme.darkMode
            ? `${theme.cardBg}ee`
            : `${theme.bgColor}ee`,
          backdropFilter: "blur(6px)",
        }}
      >
        <div className="top-bar-inner">
          <div className="top-bar-left">
            <div
              className="top-bar-label"
              style={{ fontFamily: theme.mono, color: theme.subColor }}
            >
              {settings.paperName}
            </div>
            <div
              className="top-bar-title"
              style={{ fontFamily: theme.font, color: theme.textColor }}
            >
              Day {dayNumber} — {dayData.day_title || "The Editor's Table"}
            </div>
            {dayData.newsroom_atmosphere && (
              <div
                className="top-bar-atmosphere"
                style={{ color: theme.subColor, fontFamily: theme.font }}
              >
                {dayData.newsroom_atmosphere}
              </div>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {/* Day progress pips */}
            <div className="day-pips">
              {Array.from({ length: MAX_DAYS }).map((_, i) => (
                <div
                  key={i}
                  className={`day-pip ${
                    i < dayNumber - 1
                      ? "pip-done"
                      : i === dayNumber - 1
                        ? "pip-current"
                        : "pip-future"
                  }`}
                />
              ))}
            </div>

            {/* ── CUSTOMIZE BUTTON ── */}
            <button
              onClick={() => setSettingsOpen(true)}
              title="Customize newsroom"
              className="customize-btn"
              style={{
                color: theme.subColor,
                borderColor: theme.cardBorder,
                fontFamily: theme.mono,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = theme.textColor;
                e.currentTarget.style.color = theme.textColor;
                e.currentTarget.style.background = theme.barBg;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = theme.cardBorder;
                e.currentTarget.style.color = theme.subColor;
                e.currentTarget.style.background = "transparent";
              }}
            >
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
              CUSTOMIZE
            </button>
          </div>
        </div>

        <ParameterBar scores={scores} prevScores={prevScores} />
      </div>

      {/* ── MAIN 3-COLUMN GRID ─────────────────────────────────── */}
      <div className="main-grid">
        {/* LEFT: Story Pool */}
        <div
          className="panel story-pool-panel"
          style={{
            background: theme.darkMode
              ? `${theme.cardBg}bb`
              : `${theme.bgColor}bb`,
            borderRight: `1px solid ${theme.cardBorder}`,
          }}
        >
          <div
            className="panel-title"
            style={{ fontFamily: theme.mono, color: theme.textColor }}
          >
            Junior Editor
          </div>
          <div
            className="panel-subtitle"
            style={{ color: theme.subColor, fontFamily: theme.mono }}
          >
            Review stories · drag to the front page
          </div>

          {availableStories.length === 0 ? (
            <p className="all-placed-msg" style={{ color: theme.subColor }}>
              All stories placed
            </p>
          ) : (
            availableStories.map((story) => (
              <StoryCard
                key={story.story_id}
                story={story}
                onDragStart={handleDragStart}
                dragging={draggedStory?.story_id === story.story_id}
                onReadMore={setSelectedStory}
              />
            ))
          )}
        </div>

        {/* CENTRE: Newspaper */}
        <div
          className="newspaper"
          style={{
            background: theme.darkMode ? theme.cardBg : "#fff",
            border: `1px solid ${theme.cardBorder}`,
          }}
        >
          {/* Masthead */}
          <div
            className="newspaper-masthead"
            style={{
              background: theme.darkMode ? theme.inputBg : "#fdfaf6",
              borderBottom: `1px solid ${theme.cardBorder}`,
            }}
          >
            <div
              className="newspaper-title"
              style={{ fontFamily: theme.font, color: theme.textColor }}
            >
              {settings.paperName}
            </div>
            <div
              className="newspaper-tagline"
              style={{ color: theme.subColor, fontFamily: theme.font }}
            >
              {settings.paperSlogan}
            </div>
            <div
              className="newspaper-meta"
              style={{ color: theme.subColor, fontFamily: theme.mono }}
            >
              <span>Halcyon City · Vol. LXXX</span>
              <span className="newspaper-meta-italic">
                Editor: {settings.editorName || "Morgan Voss"}
              </span>
              <span>Day {dayNumber} Edition</span>
            </div>
          </div>

          {/* Edition bar */}
          <div
            className="edition-bar"
            style={{
              background: theme.barBg,
              color: theme.subColor,
              borderBottom: `1px solid ${theme.cardBorder}`,
              fontFamily: theme.mono,
            }}
          >
            <span>FIRST EDITION</span>
            <span>
              {placedCount} headline{placedCount !== 1 ? "s" : ""} placed
            </span>
          </div>

          {/* 10×10 Grid */}
          <div style={{ padding: "12px 14px" }}>
            <NewspaperGrid
              key={`grid-day-${dayNumber}`}
              draggedStory={draggedStory}
              onGridChange={handleGridChange}
              published={false}
              theme={theme}
            />
          </div>

          {/* Publish */}
          <div className="publish-row">
            <button
              onClick={handlePublish}
              disabled={!allSlotsPlaced}
              className={`publish-btn ${allSlotsPlaced ? "publish-btn--ready" : "publish-btn--disabled"}`}
              style={
                allSlotsPlaced
                  ? {
                      background: theme.darkMode ? "#e8e4db" : "#1a1a1a",
                      color: theme.darkMode ? "#1a1a1a" : "#f5f1e8",
                      fontFamily: theme.mono,
                    }
                  : { fontFamily: theme.mono, color: theme.subColor }
              }
            >
              {allSlotsPlaced
                ? `◆ Send to Print · ${placedCount} headline${placedCount !== 1 ? "s" : ""}`
                : "Place at least 1 headline to publish"}
            </button>
          </div>
        </div>

        {/* RIGHT: Factors + Weights */}
        <div
          className="panel right-panel"
          style={{
            background: theme.darkMode
              ? `${theme.cardBg}bb`
              : `${theme.bgColor}bb`,
            borderLeft: `1px solid ${theme.cardBorder}`,
          }}
        >
          <ExternalFactorPanel
            factors={dayData.external_factors}
            responses={factorResponses}
            onResponse={handleFactorResponse}
            disabled={false}
          />
        </div>
      </div>
      {/* Story read popup */}
      {selectedStory && (
        <StoryModal
          story={selectedStory}
          onClose={() => setSelectedStory(null)}
        />
      )}
    </div>
  );
}
