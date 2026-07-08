import { useState } from "react";
import { PlusCircle, BookOpen, Users } from "lucide-react";
import SubjectTag from "../../components/SubjectTag";
import { curriculum } from "../../data";
import { diffCls, subjectColor } from "../../lib/constants";

const SUBJECT_TABS = ["All", "Algebra", "Biology", "Chemistry", "Physics", "Earth Science", "Statistics"];

export default function Curriculum() {
  const [activeTab, setActiveTab] = useState("All");

  const filtered = activeTab === "All"
    ? curriculum
    : curriculum.filter((c) => c.subject === activeTab || c.subject.includes(activeTab));

  return (
    <div className="p-6 space-y-5 max-w-screen-xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-display font-semibold text-foreground">Curriculum Library</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{curriculum.length} modules across {SUBJECT_TABS.length - 1} subjects</p>
        </div>
        <button className="flex items-center gap-2 bg-primary text-primary-foreground text-sm font-medium px-4 py-2 rounded-lg hover:opacity-90 transition-opacity">
          <PlusCircle className="w-4 h-4" />
          Add New Module
        </button>
      </div>

      {/* Subject Filter Tabs */}
      <div className="flex gap-1 flex-wrap border-b border-border pb-0">
        {SUBJECT_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3.5 py-2 text-sm font-medium rounded-t-lg transition-colors -mb-px border-b-2 ${
              activeTab === tab
                ? "border-primary text-primary bg-primary/5"
                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Module Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-2">
          <BookOpen className="w-8 h-8 opacity-40" />
          <p className="text-sm">No modules for this subject yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item) => {
            const color = subjectColor[item.subject] ?? "#1B5E4F";
            return (
              <div key={item.id} className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-sm hover:border-primary/30 transition-all cursor-pointer group">
                {/* Colored top bar */}
                <div className="h-1.5" style={{ backgroundColor: color }} />

                <div className="p-4 space-y-3">
                  {/* Title & Difficulty */}
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-semibold text-foreground leading-snug flex-1">{item.title}</h3>
                    <span className={`text-[11px] px-2 py-0.5 rounded-full font-mono flex-shrink-0 ${diffCls[item.difficulty]}`}>
                      {item.difficulty}
                    </span>
                  </div>

                  {/* Tags */}
                  <div className="flex gap-1.5 flex-wrap">
                    <SubjectTag subject={item.subject} />
                    <span className="text-[11px] px-2 py-0.5 rounded-md font-mono bg-muted text-muted-foreground">
                      Grade {item.grade}
                    </span>
                  </div>

                  {/* Completion Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">Completion</span>
                      <span className="text-xs font-mono font-semibold text-foreground">{item.completion}%</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${item.completion}%`, backgroundColor: color }}
                      />
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 pt-1 border-t border-border">
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <BookOpen className="w-3.5 h-3.5" />{item.modules} modules
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Users className="w-3.5 h-3.5" />{item.students} students
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
