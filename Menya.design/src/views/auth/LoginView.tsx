import { useState } from "react";
import { useNavigate } from "react-router";
import {
  Atom,
  GraduationCap,
  UserCheck,
  Briefcase,
  Eye,
  EyeOff,
  Plus,
  CheckCircle2,
  X,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { students, tutors } from "../../data";
import type { Role } from "../../types";

const ROLE_OPTIONS: {
  role: Role;
  label: string;
  Icon: React.ElementType;
  description: string;
  color: string;
}[] = [
  {
    role: "student",
    label: "Student",
    Icon: GraduationCap,
    description: "View your progress, sessions & assignments",
    color: "#059669",
  },
  {
    role: "tutor",
    label: "Tutor",
    Icon: UserCheck,
    description:
      "Manage students, schedule & review curriculum",
    color: "#3B82F6",
  },
  {
    role: "program",
    label: "Program Director",
    Icon: Briefcase,
    description: "Org-wide oversight, accounts & analytics",
    color: "#F0981E",
  },
];

const ROLE_HOME: Record<Role, string> = {
  student: "/student/home",
  tutor: "/tutor/home",
  program: "/program/dashboard",
};

// ── Create Account Modal ──────────────────────────────────────────────────────
function CreateAccountModal({
  onClose,
}: {
  onClose: () => void;
}) {
  const [step, setStep] = useState<"form" | "done">("form");
  const [accountRole, setAccountRole] = useState<
    "student" | "tutor"
  >("student");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [grade, setGrade] = useState("6");
  const [subjects, setSubjects] = useState<string[]>([]);
  const [generatedPwd] = useState(
    () =>
      `STEM-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
  );

  const ALL_SUBJECTS = [
    "Algebra",
    "Algebra II",
    "Pre-Alg",
    "Geometry",
    "Calculus",
    "Biology",
    "Chemistry",
    "Physics",
    "Earth Science",
    "Statistics",
    "Pre-Calculus",
  ];

  const toggleSubject = (s: string) =>
    setSubjects((prev) =>
      prev.includes(s)
        ? prev.filter((x) => x !== s)
        : [...prev, s],
    );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep("done");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900 text-lg">
            Create Account
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {step === "done" ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 py-12 px-6 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-base">
                Account Created
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {name} can now sign in as a {accountRole}
              </p>
            </div>
            <div className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 text-left">
              <p className="text-[10px] font-mono text-gray-400 uppercase tracking-widest mb-2">
                Login Credentials
              </p>
              <p className="text-sm font-mono text-gray-700">
                <span className="text-gray-400">Email</span>{" "}
                {email}
              </p>
              <p className="text-sm font-mono text-gray-700 mt-1">
                <span className="text-gray-400">Pwd </span>{" "}
                {generatedPwd}
              </p>
            </div>
            <div className="flex gap-3 mt-2">
              <button
                onClick={() => setStep("form")}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Create Another
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-[#1B5E4F] text-white rounded-lg text-sm font-semibold hover:bg-[#1B5E4F]/90 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="flex flex-col flex-1 overflow-hidden"
          >
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              {/* Role toggle */}
              <div>
                <label className="text-[11px] font-mono text-gray-400 uppercase tracking-wider block mb-2">
                  Account Type
                </label>
                <div className="flex gap-2">
                  {(["student", "tutor"] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setAccountRole(r)}
                      className={`flex-1 py-2.5 rounded-lg text-sm font-semibold border transition-colors capitalize ${accountRole === r ? "bg-[#1B5E4F] text-white border-[#1B5E4F]" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <label className="flex flex-col gap-1.5">
                <span className="text-[11px] font-mono text-gray-400 uppercase tracking-wider">
                  Full Name *
                </span>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Jordan Rivera"
                  className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1B5E4F]/25"
                />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-[11px] font-mono text-gray-400 uppercase tracking-wider">
                  Email Address *
                </span>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jordan@school.edu"
                  className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1B5E4F]/25"
                />
              </label>

              {accountRole === "student" && (
                <label className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-mono text-gray-400 uppercase tracking-wider">
                    Grade
                  </span>
                  <select
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1B5E4F]/25 cursor-pointer"
                  >
                    {[
                      "5",
                      "6",
                      "7",
                      "8",
                      "9",
                      "10",
                      "11",
                      "12",
                    ].map((g) => (
                      <option key={g}>Grade {g}</option>
                    ))}
                  </select>
                </label>
              )}

              <div className="flex flex-col gap-2">
                <span className="text-[11px] font-mono text-gray-400 uppercase tracking-wider">
                  Subjects
                </span>
                <div className="flex flex-wrap gap-2">
                  {ALL_SUBJECTS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleSubject(s)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${subjects.includes(s) ? "bg-[#1B5E4F]/10 border-[#1B5E4F]/40 text-[#1B5E4F]" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-gray-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-[#1B5E4F] text-white rounded-lg text-sm font-semibold hover:bg-[#1B5E4F]/90 transition-all flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Create Account
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// ── Login View ────────────────────────────────────────────────────────────────
export default function LoginView() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<Role | null>(
    null,
  );
  const [studentName, setStudentName] = useState(
    students[2].name,
  ); // Sofia
  const [tutorName, setTutorName] = useState(tutors[4].name); // Ms. Umubyeyi
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [error, setError] = useState("");

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!selectedRole) return;

    if (selectedRole === "student") {
      const s = students.find((st) => st.name === studentName);
      if (!s) {
        setError("Student not found.");
        return;
      }
      login({ role: "student", name: s.name, studentId: s.id });
    } else if (selectedRole === "tutor") {
      const t = tutors.find((tu) => tu.name === tutorName);
      if (!t) {
        setError("Tutor not found.");
        return;
      }
      login({ role: "tutor", name: t.name });
    } else {
      if (!email) {
        setError("Please enter your email.");
        return;
      }
      login({ role: "program", name: "Taylor Reed" });
    }

    navigate(ROLE_HOME[selectedRole], { replace: true });
  };

  return (
    <div
      className="min-h-screen flex"
      style={{ fontFamily: "Manrope, sans-serif" }}
    >
      {showCreateModal && (
        <CreateAccountModal
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {/* Left — branding panel */}
      <div
        className="hidden lg:flex flex-col w-[420px] flex-shrink-0 relative overflow-hidden"
        style={{
          background:
            "linear-gradient(160deg, #1B5E4F 0%, #0d3b30 60%, #0a2d24 100%)",
        }}
      >
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 30% 20%, #4ADE80 0%, transparent 60%), radial-gradient(circle at 80% 80%, #F0981E 0%, transparent 50%)",
          }}
        />
        <div className="relative z-10 flex flex-col flex-1 px-10 py-12">
          <div className="flex items-center gap-3 mb-auto">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <Atom className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-white text-xl">
              MENYA
            </span>
          </div>

          <div className="my-12">
            <h2 className="font-display font-bold text-white text-4xl leading-tight mb-4">
              Adaptive STEM
              <br />
              learning for all.
            </h2>
            <p className="text-white/60 text-base leading-relaxed">
              Connecting students, tutors, and program staff
              through a unified platform built for nonprofit
              tutoring organizations.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 pb-4">
            {[
              ["247", "Students"],
              ["18", "Tutors"],
              ["73%", "Avg Score"],
            ].map(([v, l]) => (
              <div key={l}>
                <p className="font-display font-bold text-white text-2xl leading-none">
                  {v}
                </p>
                <p className="text-white/50 text-xs mt-1">
                  {l}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right — sign-in panel */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 bg-[#F4F3EF]">
        {/* Mobile logo */}
        <div className="flex items-center gap-2 mb-8 lg:hidden">
          <div className="w-8 h-8 rounded-lg bg-[#1B5E4F] flex items-center justify-center">
            <Atom className="w-4 h-4 text-white" />
          </div>
          <span className="font-display font-bold text-foreground text-lg">
            StemBridge
          </span>
        </div>

        <div className="w-full max-w-md">
          <h1 className="font-display font-bold text-foreground text-2xl leading-none mb-1">
            Sign in
          </h1>
          <p className="text-sm text-muted-foreground mb-8">
            Choose your role to get started
          </p>

          {/* Role cards */}
          <div className="grid grid-cols-3 gap-3 mb-7">
            {ROLE_OPTIONS.map(
              ({ role, label, Icon, description, color }) => (
                <button
                  key={role}
                  onClick={() => {
                    setSelectedRole(role);
                    setError("");
                  }}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 text-center transition-all ${selectedRole === role ? "border-[#1B5E4F] bg-white shadow-sm" : "border-transparent bg-white/60 hover:bg-white hover:border-gray-200"}`}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${color}18` }}
                  >
                    <Icon
                      className="w-5 h-5"
                      style={{ color }}
                    />
                  </div>
                  <p className="text-xs font-semibold text-foreground leading-tight">
                    {label}
                  </p>
                </button>
              ),
            )}
          </div>

          {/* Sign-in form */}
          {selectedRole && (
            <form
              onSubmit={handleSignIn}
              className="bg-white rounded-2xl border border-border p-6 shadow-sm space-y-4"
            >
              <p className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">
                {
                  ROLE_OPTIONS.find(
                    (r) => r.role === selectedRole,
                  )?.description
                }
              </p>

              {selectedRole === "student" && (
                <label className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">
                    Select your name
                  </span>
                  <select
                    value={studentName}
                    onChange={(e) =>
                      setStudentName(e.target.value)
                    }
                    className="px-3 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/25 cursor-pointer"
                  >
                    {students.map((s) => (
                      <option key={s.id}>{s.name}</option>
                    ))}
                  </select>
                </label>
              )}

              {selectedRole === "tutor" && (
                <label className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">
                    Select your name
                  </span>
                  <select
                    value={tutorName}
                    onChange={(e) =>
                      setTutorName(e.target.value)
                    }
                    className="px-3 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/25 cursor-pointer"
                  >
                    {tutors.map((t) => (
                      <option key={t.name}>{t.name}</option>
                    ))}
                  </select>
                </label>
              )}

              {selectedRole === "program" && (
                <label className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">
                    Email address
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="director@org.edu"
                    className="px-3 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/25"
                  />
                </label>
              )}

              <label className="flex flex-col gap-1.5">
                <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">
                  Password
                </span>
                <div className="relative">
                  <input
                    type={showPwd ? "text" : "password"}
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                    placeholder="Enter any password to demo"
                    className="w-full pl-3 pr-10 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/25"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPwd ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </label>

              {error && (
                <p className="text-xs text-red-600 font-mono">
                  {error}
                </p>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 active:scale-[0.98] transition-all"
              >
                Sign In
              </button>

              {selectedRole === "program" && (
                <button
                  type="button"
                  onClick={() => setShowCreateModal(true)}
                  className="w-full py-2.5 border border-border rounded-xl text-sm font-medium text-foreground hover:bg-muted transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Create Student or Tutor Account
                </button>
              )}
            </form>
          )}

          <p className="text-center text-xs text-muted-foreground mt-6">
            Demo app — any password accepted for sign-in
          </p>
        </div>
      </div>
    </div>
  );
}