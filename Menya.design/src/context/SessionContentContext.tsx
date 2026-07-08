import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

export interface Point {
  x: number;
  y: number;
}

export interface Stroke {
  color: string;
  points: Point[];
}

interface SessionContent {
  notes: string;
  strokes: Stroke[];
}

const EMPTY_CONTENT: SessionContent = { notes: "", strokes: [] };

interface SessionContentContextValue {
  getContent: (sessionId: number) => SessionContent;
  setNotes: (sessionId: number, notes: string) => void;
  addStroke: (sessionId: number, stroke: Stroke) => void;
  clearStrokes: (sessionId: number) => void;
}

const SessionContentContext = createContext<SessionContentContextValue | null>(null);

export function SessionContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<Record<number, SessionContent>>({});

  const getContent = useCallback(
    (sessionId: number) => content[sessionId] ?? EMPTY_CONTENT,
    [content]
  );

  const setNotes = useCallback((sessionId: number, notes: string) => {
    setContent((prev) => ({
      ...prev,
      [sessionId]: { ...(prev[sessionId] ?? EMPTY_CONTENT), notes },
    }));
  }, []);

  const addStroke = useCallback((sessionId: number, stroke: Stroke) => {
    setContent((prev) => {
      const existing = prev[sessionId] ?? EMPTY_CONTENT;
      return { ...prev, [sessionId]: { ...existing, strokes: [...existing.strokes, stroke] } };
    });
  }, []);

  const clearStrokes = useCallback((sessionId: number) => {
    setContent((prev) => ({
      ...prev,
      [sessionId]: { ...(prev[sessionId] ?? EMPTY_CONTENT), strokes: [] },
    }));
  }, []);

  return (
    <SessionContentContext.Provider value={{ getContent, setNotes, addStroke, clearStrokes }}>
      {children}
    </SessionContentContext.Provider>
  );
}

export function useSessionContent() {
  const ctx = useContext(SessionContentContext);
  if (!ctx) throw new Error("useSessionContent must be used inside SessionContentProvider");
  return ctx;
}
