import { create } from "zustand";
import { fetchStoriesFromFirestore, persistDecision } from "../firebase/firestoreService";
import { calculateImpact } from "../engine/decisionEngine";

const INITIAL_METRICS = {
  trust: 70,
  revenue: 60,
  safety: 80,
  legalRisk: 10,
  politicalPressure: 15,
};

function clamp(value) {
  return Math.max(0, Math.min(100, value));
}

function applyImpact(metrics, impact) {
  return {
    trust: clamp(metrics.trust + impact.trust),
    revenue: clamp(metrics.revenue + impact.revenue),
    safety: clamp(metrics.safety + impact.safety),
    legalRisk: clamp(metrics.legalRisk + impact.legalRisk),
    politicalPressure: clamp(
      metrics.politicalPressure + impact.politicalPressure
    ),
  };
}

function checkGameOver(metrics) {
  if (metrics.trust <= 0)
    return { over: true, reason: "You lost all credibility. The public no longer trusts your paper." };
  if (metrics.revenue <= 0)
    return { over: true, reason: "The newspaper ran out of money. Operations have ceased." };
  if (metrics.safety <= 0)
    return { over: true, reason: "Threats became reality. The newsroom was forced to shut down." };
  if (metrics.legalRisk >= 100)
    return { over: true, reason: "A catastrophic lawsuit has bankrupted and shuttered the paper." };
  return { over: false, reason: null };
}

export const useGameStore = create((set, get) => ({
  // State
  stories: [],
  currentStoryIndex: 0,
  currentStory: null,
  metrics: { ...INITIAL_METRICS },
  day: 1,
  isLoading: false,
  error: null,
  lastDecision: null, // { decision, impact, narrative }
<<<<<<< HEAD
=======
  decisions: [],
>>>>>>> 144e1fc (initial)
  gameOver: false,
  gameOverReason: null,
  phase: "decision", // "decision" | "result"

  // Actions
  fetchStories: async () => {
    set({ isLoading: true, error: null });
    try {
      const stories = await fetchStoriesFromFirestore();
      // Shuffle for variety
      const shuffled = [...stories].sort(() => Math.random() - 0.5);
      set({
        stories: shuffled,
        currentStory: shuffled[0] ?? null,
        currentStoryIndex: 0,
        isLoading: false,
      });
    } catch (err) {
      set({ error: err.message, isLoading: false });
    }
  },

  makeDecision: async (decision) => {
    const { currentStory, metrics, day } = get();
    if (!currentStory) return;

    const impact = calculateImpact(currentStory, decision, metrics.politicalPressure);
    const newMetrics = applyImpact(metrics, impact);
    const gameOverCheck = checkGameOver(newMetrics);

    // Persist to Firestore (fire-and-forget, don't block UI)
    persistDecision({
      storyId: currentStory.id,
      decision,
      impact,
    }).catch(console.error);

    const record = { decision, impact, storyTitle: currentStory.title, storyId: currentStory.id, day };
    set((state) => ({
      metrics: newMetrics,
      lastDecision: record,
      decisions: [...state.decisions, record],
      phase: "result",
      gameOver: gameOverCheck.over,
      gameOverReason: gameOverCheck.reason,
    }));
  },

  advanceToNextStory: () => {
    const { stories, currentStoryIndex, day } = get();
    const nextIndex = currentStoryIndex + 1;

    if (nextIndex >= stories.length) {
<<<<<<< HEAD
      // Reshuffle and loop
      const reshuffled = [...stories].sort(() => Math.random() - 0.5);
      set({
        stories: reshuffled,
        currentStory: reshuffled[0],
        currentStoryIndex: 0,
        day: day + 1,
        phase: "decision",
        lastDecision: null,
      });
    } else {
      set({
        currentStory: stories[nextIndex],
        currentStoryIndex: nextIndex,
        day: day + 1,
        phase: "decision",
        lastDecision: null,
      });
    }
=======
      // End of stories — App will handle transition to ending
      return;
    }

    set({
      currentStory: stories[nextIndex],
      currentStoryIndex: nextIndex,
      day: day + 1,
      phase: "decision",
      lastDecision: null,
    });
>>>>>>> 144e1fc (initial)
  },

  resetGame: () => {
    set({
      currentStoryIndex: 0,
      currentStory: null,
      metrics: { ...INITIAL_METRICS },
      day: 1,
      lastDecision: null,
<<<<<<< HEAD
=======
      decisions: [],
>>>>>>> 144e1fc (initial)
      gameOver: false,
      gameOverReason: null,
      phase: "decision",
    });
    get().fetchStories();
  },
}));
