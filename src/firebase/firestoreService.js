import { db } from "./config";
import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  limit,
} from "firebase/firestore";

// Seed stories if collection is empty
const SEED_STORIES = [
  {
    title: "Leaked Documents Reveal City Mayor Embezzled Relief Funds",
    truthScore: 88,
    evidence: "strong",
    viralityScore: 92,
    riskLevel: "high",
  },
  {
    title: "Local Pharma Giant's New Drug Linked to Unreported Side Effects",
    truthScore: 71,
    evidence: "moderate",
    viralityScore: 78,
    riskLevel: "high",
  },
  {
    title: "Celebrity Chef Opens Seventh Restaurant Downtown",
    truthScore: 99,
    evidence: "strong",
    viralityScore: 45,
    riskLevel: "low",
  },
  {
    title: "Anonymous Source Claims Governor Plans Secret Tax Hike",
    truthScore: 34,
    evidence: "weak",
    viralityScore: 81,
    riskLevel: "high",
  },
  {
    title: "University Study Links Social Media to Teen Anxiety Surge",
    truthScore: 82,
    evidence: "strong",
    viralityScore: 67,
    riskLevel: "medium",
  },
  {
    title: "Police Union Allegedly Suppressed Bodycam Footage of Incident",
    truthScore: 65,
    evidence: "moderate",
    viralityScore: 88,
    riskLevel: "high",
  },
  {
    title: "Tech Startup Raises $200M, Sources Say Half Came From Offshore Shell",
    truthScore: 55,
    evidence: "weak",
    viralityScore: 74,
    riskLevel: "medium",
  },
  {
    title: "Whistleblower Exposes Contaminated Water Supply in Three Suburbs",
    truthScore: 91,
    evidence: "strong",
    viralityScore: 95,
    riskLevel: "medium",
  },
  {
    title: "State Senator Caught Voting on Legislation Tied to His Own Holdings",
    truthScore: 79,
    evidence: "moderate",
    viralityScore: 83,
    riskLevel: "high",
  },
  {
    title: "Annual Fireworks Display Cancelled Due to Budget Shortfalls",
    truthScore: 97,
    evidence: "strong",
    viralityScore: 22,
    riskLevel: "low",
  },
  {
    title: "Insider Claims Defense Contractor Billed $40M for Phantom Services",
    truthScore: 60,
    evidence: "weak",
    viralityScore: 89,
    riskLevel: "high",
  },
  {
    title: "Doctors Association Warns of Antibiotic Shortage Within Six Months",
    truthScore: 85,
    evidence: "strong",
    viralityScore: 72,
    riskLevel: "medium",
  },
];

export async function fetchStoriesFromFirestore() {
  const storiesRef = collection(db, "stories");
<<<<<<< HEAD
  const snapshot = await getDocs(query(storiesRef, orderBy("title"), limit(50)));
=======

  let snapshot;
  try {
    snapshot = await getDocs(query(storiesRef, orderBy("title"), limit(50)));
  } catch (err) {
    // Firestore index may not be set up — fall back to unordered fetch
    console.warn("Ordered query failed, falling back to unordered:", err.message);
    snapshot = await getDocs(query(storiesRef, limit(50)));
  }
>>>>>>> 144e1fc (initial)

  if (snapshot.empty) {
    // Seed the collection
    await seedStories();
    return SEED_STORIES.map((s, i) => ({ id: `seed-${i}`, ...s }));
  }

  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

async function seedStories() {
  const storiesRef = collection(db, "stories");
  for (const story of SEED_STORIES) {
    await addDoc(storiesRef, story);
  }
}

export async function persistDecision({ storyId, decision, impact }) {
  const decisionsRef = collection(db, "decisions");
  await addDoc(decisionsRef, {
    storyId,
    decision,
    impact,
    createdAt: serverTimestamp(),
  });
}
