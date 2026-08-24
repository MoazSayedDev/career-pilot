import { useState } from "react";
import {
  Wand2, Pencil, ArrowRight, Sparkles, Briefcase, GraduationCap,
  Zap, Award, Check, X, Download, Eye, Layers, Target,
} from "lucide-react";
import { Loader2 } from "lucide-react";
import { Btn } from "../../components/ui/Btn";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Textarea } from "../../components/ui/Textarea";
import { Field } from "../../components/ui/Field";
import { cn } from "../../utils";
import type { CVData, Page } from "../../types";

interface DashboardPageProps {
  cvData: CVData;
  onNav: (p: Page) => void;
}

const ALL_SECTIONS = [
  { id: "personal-info",  label: "Personal Info",  icon: <Pencil size={14} /> },
  { id: "experience",     label: "Experience",      icon: <Briefcase size={14} /> },
  { id: "education",      label: "Education",       icon: <GraduationCap size={14} /> },
  { id: "skills",         label: "Skills",          icon: <Zap size={14} /> },
  { id: "projects",       label: "Projects",        icon: <Layers size={14} /> },
  { id: "certificates",   label: "Certificates",    icon: <Award size={14} /> },
  { id: "ai-summary",     label: "Summary",         icon: <Sparkles size={14} /> },
];

export function DashboardPage({ cvData, onNav }: DashboardPageProps) {
  const [mode, setMode] = useState<null | "ai" | "manual">(null);
  const [aiJobDesc, setAiJobDesc] = useState("");
  const [aiRole, setAiRole] = useState("");
  const [generating, setGenerating] = useState(false);
  const [manualSections, setManualSections] = useState<string[]>([
    "personal-info", "experience", "education", "skills",
  ]);

  const completionSections = [
    { label: "Personal Info",  done: !!(cvData.personalInfo.firstName && cvData.personalInfo.email) },
    { label: "Experience",     done: cvData.experiences.length > 0 },
    { label: "Education",      done: cvData.education.length > 0 },
    { label: "Skills",         done: cvData.skills.length > 0 },
    { label: "Projects",       done: cvData.projects.length > 0 },
    { label: "Certificates",   done: cvData.certificates.length > 0 },
  ];
  const completed = completionSections.filter((s) => s.done).length;
  const pct = Math.round((completed / completionSections.length) * 100);

  const toggleSection = (id: string) => {
    setManualSections((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Welcome */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back, Sarah! 👋</h1>
          <p className="text-gray-500 text-sm mt-1">Your CV is {pct}% complete. Keep going!</p>
        </div>
        <div className="hidden md:flex items-center gap-3">
          <Btn size="sm" variant="outline" onClick={() => onNav("preview-cv")}>
            <Eye size={14} />Preview CV
          </Btn>
          <Btn size="sm" onClick={() => onNav("download-cv")}>
            <Download size={14} />Download PDF
          </Btn>
        </div>
      </div>

      {/* Progress */}
      <Card className="p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="font-semibold text-gray-800">CV Completion</p>
            <p className="text-xs text-gray-400 mt-0.5">{completed} of {completionSections.length} sections filled</p>
          </div>
          <span className="text-2xl font-bold text-violet-600">{pct}%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-violet-500 to-purple-600 rounded-full transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="flex flex-wrap gap-2 mt-4">
          {completionSections.map((s) => (
            <span
              key={s.label}
              className={cn(
                "flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium",
                s.done ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"
              )}
            >
              {s.done ? (
                <Check size={11} />
              ) : (
                <div className="w-2.5 h-2.5 rounded-full border-2 border-current opacity-40" />
              )}
              {s.label}
            </span>
          ))}
        </div>
      </Card>

      {/* Mode chooser */}
      {!mode && (
        <div className="grid md:grid-cols-2 gap-5 mb-6">
          {/* AI Card */}
          <div
            onClick={() => setMode("ai")}
            className="bg-gradient-to-br from-violet-600 to-purple-700 rounded-2xl p-6 text-white cursor-pointer hover:shadow-xl hover:shadow-violet-200 hover:-translate-y-0.5 transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mb-4">
              <Wand2 size={22} />
            </div>
            <h3 className="text-xl font-bold mb-2">Generate CV with AI</h3>
            <p className="text-violet-200 text-sm leading-relaxed mb-4">
              Paste a job description, select your target role, and let our AI generate and
              optimize your CV automatically.
            </p>
            <div className="flex items-center gap-1 text-sm font-semibold group-hover:gap-2 transition-all">
              Get started <ArrowRight size={16} />
            </div>
          </div>

          {/* Manual Card */}
          <div
            onClick={() => setMode("manual")}
            className="bg-white border-2 border-gray-200 rounded-2xl p-6 cursor-pointer hover:border-violet-300 hover:shadow-lg hover:-translate-y-0.5 transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center mb-4">
              <Pencil size={22} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Build My CV Manually</h3>
            <p className="text-gray-500 text-sm leading-relaxed mb-4">
              Choose exactly which sections to include and fill in your details at your own pace
              with full control.
            </p>
            <div className="flex items-center gap-1 text-sm font-semibold text-violet-600 group-hover:gap-2 transition-all">
              Start building <ArrowRight size={16} />
            </div>
          </div>
        </div>
      )}

      {/* AI Mode form */}
      {mode === "ai" && (
        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center">
                <Wand2 size={18} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Generate CV with AI</h3>
                <p className="text-xs text-gray-400">Let AI create a tailored CV for your target role</p>
              </div>
            </div>
            <button onClick={() => setMode(null)} className="text-gray-400 hover:text-gray-600">
              <X size={18} />
            </button>
          </div>
          <div className="flex flex-col gap-4">
            <Field label="Target Role / Job Title" required>
              <Input value={aiRole} onChange={setAiRole} placeholder="e.g. Senior Frontend Developer" icon={<Target size={15} />} />
            </Field>
            <Field label="Job Description" required hint="Paste the full job description for the best results">
              <Textarea value={aiJobDesc} onChange={setAiJobDesc} placeholder="Paste the job description here…" rows={5} />
            </Field>
            <Btn
              onClick={() => {
                setGenerating(true);
                setTimeout(() => { setGenerating(false); onNav("ai-summary"); }, 2000);
              }}
              disabled={generating || !aiRole || !aiJobDesc}
            >
              {generating ? (
                <><Loader2 size={16} className="animate-spin" />Generating your CV…</>
              ) : (
                <><Sparkles size={16} />Generate CV with AI</>
              )}
            </Btn>
          </div>
        </Card>
      )}

      {/* Manual Mode */}
      {mode === "manual" && (
        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center">
                <Layers size={18} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Choose Your Sections</h3>
                <p className="text-xs text-gray-400">Select which sections to include in your CV</p>
              </div>
            </div>
            <button onClick={() => setMode(null)} className="text-gray-400 hover:text-gray-600">
              <X size={18} />
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            {ALL_SECTIONS.map((s) => {
              const active = manualSections.includes(s.id);
              return (
                <button
                  key={s.id}
                  onClick={() => toggleSection(s.id)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all",
                    active
                      ? "border-violet-400 bg-violet-50 text-violet-700"
                      : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                  )}
                >
                  <div
                    className={cn(
                      "w-4 h-4 rounded flex items-center justify-center border flex-shrink-0",
                      active ? "bg-violet-600 border-violet-600" : "border-gray-300"
                    )}
                  >
                    {active && <Check size={10} className="text-white" />}
                  </div>
                  {s.icon}
                  <span>{s.label}</span>
                </button>
              );
            })}
          </div>
          <div className="flex gap-3">
            <Btn onClick={() => onNav((manualSections[0] as Page) || "personal-info")}>
              Start with {manualSections.length} section{manualSections.length !== 1 ? "s" : ""}{" "}
              <ArrowRight size={15} />
            </Btn>
            <Btn variant="outline" onClick={() => setMode(null)}>Cancel</Btn>
          </div>
        </Card>
      )}

      {/* Quick-access cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Experience",   count: `${cvData.experiences.length} entries`,   icon: <Briefcase size={18} />,     page: "experience"   as Page, color: "from-blue-50 to-indigo-50 border-blue-200",    icon_bg: "bg-blue-100 text-blue-600" },
          { label: "Education",    count: `${cvData.education.length} entries`,     icon: <GraduationCap size={18} />, page: "education"    as Page, color: "from-emerald-50 to-teal-50 border-emerald-200", icon_bg: "bg-emerald-100 text-emerald-600" },
          { label: "Skills",       count: `${cvData.skills.length} skills`,         icon: <Zap size={18} />,           page: "skills"       as Page, color: "from-amber-50 to-orange-50 border-amber-200",   icon_bg: "bg-amber-100 text-amber-600" },
          { label: "Certificates", count: `${cvData.certificates.length} certs`,   icon: <Award size={18} />,         page: "certificates" as Page, color: "from-rose-50 to-pink-50 border-rose-200",      icon_bg: "bg-rose-100 text-rose-600" },
        ].map((item) => (
          <button
            key={item.label}
            onClick={() => onNav(item.page)}
            className={cn(
              "bg-gradient-to-br border rounded-xl p-4 text-left hover:shadow-md transition-all hover:-translate-y-0.5",
              item.color
            )}
          >
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-3", item.icon_bg)}>
              {item.icon}
            </div>
            <p className="font-semibold text-gray-900 text-sm">{item.label}</p>
            <p className="text-xs text-gray-500 mt-0.5">{item.count}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
