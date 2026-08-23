import { useCallback, useState } from "react";
import type { LibrarySearchQuery, SearchDecision } from "../types";

const queriesKey = (tutorId: number) => `menya:library-search:${tutorId}`;

function readQueries(tutorId: number, fallback: LibrarySearchQuery[]): LibrarySearchQuery[] {
  try {
    const saved = JSON.parse(localStorage.getItem(queriesKey(tutorId)) ?? "null");
    if (Array.isArray(saved) && saved.every((q) => typeof q?.id === "number")) return saved;
  } catch {
    // fall through to seed data
  }
  return fallback;
}

// Client-side Curriculum Library search history (no backend), seeded once per
// tutor from their portion of the seed data, then overridden as they search and
// approve/reject results. Mirrors useEnrollment.ts's plain-hook + localStorage
// pattern — this is single-view state, not shared across components like
// CurriculumContext, so a full Context isn't warranted.
export function useLibrarySearch(tutorId: number, seed: LibrarySearchQuery[]) {
  const [queries, setQueries] = useState<LibrarySearchQuery[]>(() =>
    readQueries(tutorId, seed.filter((q) => q.tutorId === tutorId))
  );

  const persist = useCallback((next: LibrarySearchQuery[]) => {
    setQueries(next);
    localStorage.setItem(queriesKey(tutorId), JSON.stringify(next));
  }, [tutorId]);

  const addQuery = useCallback((query: LibrarySearchQuery) => {
    persist([query, ...queries]);
  }, [queries, persist]);

  const decideQuery = useCallback((id: number, decision: SearchDecision, rejectNote?: string) => {
    persist(queries.map((q) => q.id !== id ? q : { ...q, decision, rejectNote }));
  }, [queries, persist]);

  return { queries, addQuery, decideQuery };
}
