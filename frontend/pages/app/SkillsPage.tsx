import { useState } from "react";
import { Zap, Eye, Plus, X, Check } from "lucide-react";
import { Btn } from "../../components/ui/Btn";
import { Card } from "../../components/ui/Card";
import { Field } from "../../components/ui/Field";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { SkillLevelBadge } from "../../components/ui/Badge";
import { PageHeader } from "../../components/ui/PageHeader";
import { uid } from "../../utils";
import type { CVData, SkillItem } from "../../types";

interface SkillsPageProps {
  cvData: CVData;
  setCVData: (d: CVData) => void;
}

const CATEGORIES = ["Frontend", "Backend", "Languages", "Design", "DevOps", "Database", "Mobile", "Other"];
const QUICK_SKILLS = ["JavaScript", "Python", "Docker", "Figma", "SQL", "Git", "AWS", "React Native"];

export function SkillsPage({ cvData, setCVData }: SkillsPageProps) {
  const [name, setName] = useState("");
  const [level, setLevel] = useState("");
  const [category, setCategory] = useState("");
  const [error, setError] = useState("");

  const handleAdd = () => {
    if (!name.trim()) { setError("Skill name is required"); return; }
    setCVData({
      ...cvData,
      skills: [
        ...cvData.skills,
        { id: uid(), name: name.trim(), level: level || "Intermediate", category: category || "General" },
      ],
    });
    setName(""); setLevel(""); setCategory(""); setError("");
  };

  const handleDelete = (id: string) =>
    setCVData({ ...cvData, skills: cvData.skills.filter((s) => s.id !== id) });

  // Group by category
  const grouped = CATEGORIES.reduce((acc, cat) => {
    const items = cvData.skills.filter((s) => s.category === cat);
    if (items.length > 0) acc[cat] = items;
    return acc;
  }, {} as Record<string, SkillItem[]>);
  const ungrouped = cvData.skills.filter((s) => !CATEGORIES.includes(s.category));
  if (ungrouped.length > 0) grouped["General"] = [...(grouped["General"] || []), ...ungrouped];

  return (
    <div>
      <PageHeader
        icon={<Zap size={24} />}
        title="Skills"
        subtitle="Showcase your technical and professional skills"
        tipText="Add both hard and soft skills. Order them by proficiency level for best impact."
      />

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Form */}
        <Card className="lg:col-span-2 p-6 h-fit">
          <h3 className="font-semibold text-gray-800 mb-1 flex items-center gap-2">
            <Zap size={15} className="text-violet-500" />Add Skill
          </h3>
          <p className="text-xs text-gray-400 mb-5">Add your skills one at a time</p>

          <div className="flex flex-col gap-4">
            <Field label="Skill Name" required error={error}>
              <Input value={name} onChange={(v) => { setName(v); setError(""); }} placeholder="e.g. React, Figma, Python…" />
            </Field>
            <Field label="Proficiency Level">
              <Select value={level} onChange={setLevel} options={["Beginner", "Intermediate", "Advanced", "Expert"]} placeholder="Select level" />
            </Field>
            <Field label="Category">
              <Select value={category} onChange={setCategory} options={CATEGORIES} placeholder="Select category" />
            </Field>
            <Btn onClick={handleAdd}><Plus size={15} />Add Skill</Btn>
          </div>

          <div className="mt-6 pt-5 border-t border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Quick Add</p>
            <div className="flex flex-wrap gap-2">
              {QUICK_SKILLS.map((s) => (
                <button
                  key={s}
                  onClick={() => setName(s)}
                  className="text-xs px-2.5 py-1 rounded-full border border-gray-200 text-gray-600 hover:border-violet-400 hover:text-violet-600 hover:bg-violet-50 transition-colors"
                >
                  + {s}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* List + Preview */}
        <div className="lg:col-span-3 flex flex-col gap-5">
          <Card className="p-6">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Zap size={15} className="text-violet-500" />Your Skills ({cvData.skills.length})
            </h3>
            {cvData.skills.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-3">
                  <Zap size={22} className="text-gray-400" />
                </div>
                <p className="font-medium text-gray-600">No skills added yet</p>
                <p className="text-sm text-gray-400">Add your first skill using the form.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-5">
                {Object.entries(grouped).map(([cat, items]) => (
                  <div key={cat}>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{cat}</p>
                    <div className="flex flex-wrap gap-2">
                      {items.map((skill) => (
                        <div
                          key={skill.id}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-700 group"
                        >
                          <span>{skill.name}</span>
                          <SkillLevelBadge level={skill.level} />
                          <button
                            onClick={() => handleDelete(skill.id)}
                            className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all ml-1"
                          >
                            <X size={13} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Eye size={15} className="text-violet-500" />Preview in CV
            </h3>
            <div className="border-t-2 border-violet-600 pt-4">
              <p className="text-xs font-bold tracking-widest text-violet-700 uppercase mb-3">Skills</p>
              {cvData.skills.length === 0 ? (
                <p className="text-xs text-gray-400 italic">Add skills to see the preview</p>
              ) : (
                <div className="flex flex-col gap-1.5">
                  {cvData.skills.slice(0, 10).map((skill) => (
                    <div key={skill.id} className="flex items-center justify-between">
                      <span className="text-xs text-gray-700">{skill.name}</span>
                      <div className="flex gap-0.5">
                        {["Beginner", "Intermediate", "Advanced", "Expert"].map((l, i) => (
                          <div
                            key={l}
                            className={`w-2 h-2 rounded-full ${
                              ["Beginner", "Intermediate", "Advanced", "Expert"].indexOf(skill.level) >= i
                                ? "bg-violet-500"
                                : "bg-gray-200"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
