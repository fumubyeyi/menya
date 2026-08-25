import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { curriculum, findChapterById as findChapterByIdIn } from "../data";
import type { CurriculumCourse, CurriculumChapter, CurriculumModule, Difficulty, PracticeItem } from "../types";

const CURRICULUM_KEY = "menya:curriculum";

// Client-side curriculum state (no backend) — seeded from the static curriculum
// export, overridden once program staff edit it here. Shared via context (rather
// than the plain-hook pattern used by enrollment) because several independent
// views (Curriculum, ModuleWorkspace, Learning, EnrollmentModal) all need to see
// the same live edits, not just one component instance.
function readCurriculum(): CurriculumCourse[] {
  try {
    const saved = JSON.parse(localStorage.getItem(CURRICULUM_KEY) ?? "null");
    if (Array.isArray(saved) && saved.length > 0 && typeof saved[0]?.name === "string") return saved;
  } catch {
    // fall through to seed data
  }
  return curriculum;
}

interface CurriculumContextValue {
  courses: CurriculumCourse[];
  addCourse: (course: CurriculumCourse) => void;
  importChapters: (courseId: number, chapters: CurriculumChapter[]) => void;
  addChapter: (courseId: number, title: string, difficulty: Difficulty) => void;
  addModule: (courseId: number, chapterId: number, title: string) => void;
  updateModule: (courseId: number, chapterId: number, moduleIndex: number, patch: Partial<CurriculumModule>) => void;
  updateChapterTest: (courseId: number, chapterId: number, test: PracticeItem[]) => void;
  findChapterById: (chapterId: number) => { course: CurriculumCourse; chapter: CurriculumChapter } | undefined;
}

const CurriculumContext = createContext<CurriculumContextValue | null>(null);

export function CurriculumProvider({ children }: { children: ReactNode }) {
  const [courses, setCourses] = useState<CurriculumCourse[]>(readCurriculum);

  const persist = (next: CurriculumCourse[]) => {
    localStorage.setItem(CURRICULUM_KEY, JSON.stringify(next));
    setCourses(next);
  };

  const addCourse = (course: CurriculumCourse) => persist([...courses, course]);

  // Appends reviewed/approved imported chapters onto an existing course's library,
  // as distinct from addCourse (which imports into a brand-new course).
  const importChapters = (courseId: number, chapters: CurriculumChapter[]) => {
    persist(courses.map((c) => c.id !== courseId ? c : { ...c, chapters: [...c.chapters, ...chapters] }));
  };

  const addChapter = (courseId: number, title: string, difficulty: Difficulty) => {
    persist(courses.map((c) => c.id !== courseId ? c : {
      ...c,
      chapters: [...c.chapters, { id: Date.now(), title, difficulty, modules: [] }],
    }));
  };

  const addModule = (courseId: number, chapterId: number, title: string) => {
    if (!title) return;
    persist(courses.map((c) => c.id !== courseId ? c : {
      ...c,
      chapters: c.chapters.map((ch) => ch.id !== chapterId ? ch : { ...ch, modules: [...ch.modules, { title, status: "not-started" as const }] }),
    }));
  };

  const updateModule = (courseId: number, chapterId: number, moduleIndex: number, patch: Partial<CurriculumModule>) => {
    persist(courses.map((c) => c.id !== courseId ? c : {
      ...c,
      chapters: c.chapters.map((ch) => ch.id !== chapterId ? ch : {
        ...ch,
        modules: ch.modules.map((m, i) => i !== moduleIndex ? m : { ...m, ...patch }),
      }),
    }));
  };

  const updateChapterTest = (courseId: number, chapterId: number, test: PracticeItem[]) => {
    persist(courses.map((c) => c.id !== courseId ? c : {
      ...c,
      chapters: c.chapters.map((ch) => ch.id !== chapterId ? ch : { ...ch, test }),
    }));
  };

  const findChapterById = useCallback(
    (chapterId: number) => findChapterByIdIn(courses, chapterId),
    [courses]
  );

  return (
    <CurriculumContext.Provider value={{ courses, addCourse, importChapters, addChapter, addModule, updateModule, updateChapterTest, findChapterById }}>
      {children}
    </CurriculumContext.Provider>
  );
}

export function useCurriculum() {
  const ctx = useContext(CurriculumContext);
  if (!ctx) throw new Error("useCurriculum must be used inside CurriculumProvider");
  return ctx;
}
