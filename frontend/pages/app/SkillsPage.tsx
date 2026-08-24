"use client";

import { useState } from "react";
import { Zap, Eye, Plus, X } from "lucide-react";

import { Btn } from "@/components/ui/Btn";
import { Card } from "@/components/ui/Card";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { SkillLevelBadge } from "@/components/ui/Badge";
import { PageHeader } from "@/components/ui/PageHeader";

interface Skill {
  id: string;
  name: string;
  level: string;
  category: string;
}

const CATEGORIES = [
  "Frontend",
  "Backend",
  "Languages",
  "Design",
  "DevOps",
  "Database",
  "Mobile",
  "Other",
];

const QUICK_SKILLS = [
  "JavaScript",
  "Python",
  "Docker",
  "Figma",
  "SQL",
  "Git",
  "AWS",
  "React Native",
];

export default function SkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([]);

  const [name, setName] = useState("");
  const [level, setLevel] = useState("");
  const [category, setCategory] = useState("");
  const [error, setError] = useState("");

  const handleAdd = () => {
    if (!name.trim()) {
      setError("Skill name is required");
      return;
    }

    const newSkill: Skill = {
      id: crypto.randomUUID(),
      name: name.trim(),
      level: level || "Intermediate",
      category: category || "Other",
    };

    setSkills((prev) => [...prev, newSkill]);

    setName("");
    setLevel("");
    setCategory("");
    setError("");
  };

  const handleDelete = (id: string) => {
    setSkills((prev) => prev.filter((skill) => skill.id !== id));
  };

  const grouped = CATEGORIES.reduce(
    (acc, categoryName) => {
      const items = skills.filter((skill) => skill.category === categoryName);

      if (items.length > 0) {
        acc[categoryName] = items;
      }

      return acc;
    },
    {} as Record<string, Skill[]>,
  );

  const ungrouped = skills.filter(
    (skill) => !CATEGORIES.includes(skill.category),
  );

  if (ungrouped.length > 0) {
    grouped["Other"] = [...(grouped["Other"] || []), ...ungrouped];
  }

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
            <Zap size={15} className="text-violet-500" />
            Add Skill
          </h3>

          <p className="text-xs text-gray-400 mb-5">
            Add your skills one at a time
          </p>

          <div className="flex flex-col gap-4">
            <Field label="Skill Name" required error={error}>
              <Input
                value={name}
                onChange={(value) => {
                  setName(value);
                  setError("");
                }}
                placeholder="e.g. React, Figma, Python..."
              />
            </Field>

            <Field label="Proficiency Level">
              <Select
                value={level}
                onChange={setLevel}
                options={["Beginner", "Intermediate", "Advanced", "Expert"]}
                placeholder="Select level"
              />
            </Field>

            <Field label="Category">
              <Select
                value={category}
                onChange={setCategory}
                options={CATEGORIES}
                placeholder="Select category"
              />
            </Field>

            <Btn onClick={handleAdd}>
              <Plus size={15} />
              Add Skill
            </Btn>
          </div>

          {/* Quick Add */}
          <div className="mt-6 pt-5 border-t border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Quick Add
            </p>

            <div className="flex flex-wrap gap-2">
              {QUICK_SKILLS.map((skill) => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => {
                    setName(skill);
                    setError("");
                  }}
                  className="text-xs px-2.5 py-1 rounded-full border border-gray-200 text-gray-600 hover:border-violet-400 hover:text-violet-600 hover:bg-violet-50 transition-colors"
                >
                  + {skill}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Skills + Preview */}
        <div className="lg:col-span-3 flex flex-col gap-5">
          {/* Skills List */}
          <Card className="p-6">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Zap size={15} className="text-violet-500" />
              Your Skills ({skills.length})
            </h3>

            {skills.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-3">
                  <Zap size={22} className="text-gray-400" />
                </div>

                <p className="font-medium text-gray-600">No skills added yet</p>

                <p className="text-sm text-gray-400">
                  Add your first skill using the form.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-5">
                {Object.entries(grouped).map(([categoryName, items]) => (
                  <div key={categoryName}>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                      {categoryName}
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {items.map((skill) => (
                        <div
                          key={skill.id}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-700 group"
                        >
                          <span>{skill.name}</span>

                          <SkillLevelBadge level={skill.level} />

                          <button
                            type="button"
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

          {/* Preview */}
          <Card className="p-6">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Eye size={15} className="text-violet-500" />
              Preview in CV
            </h3>

            <div className="border-t-2 border-violet-600 pt-4">
              <p className="text-xs font-bold tracking-widest text-violet-700 uppercase mb-3">
                Skills
              </p>

              {skills.length === 0 ? (
                <p className="text-xs text-gray-400 italic">
                  Add skills to see the preview
                </p>
              ) : (
                <div className="flex flex-col gap-1.5">
                  {skills.slice(0, 10).map((skill) => {
                    const levels = [
                      "Beginner",
                      "Intermediate",
                      "Advanced",
                      "Expert",
                    ];

                    const currentLevel = levels.indexOf(skill.level);

                    return (
                      <div
                        key={skill.id}
                        className="flex items-center justify-between"
                      >
                        <span className="text-xs text-gray-700">
                          {skill.name}
                        </span>

                        <div className="flex gap-0.5">
                          {levels.map((item, index) => (
                            <div
                              key={item}
                              className={`w-2 h-2 rounded-full ${
                                currentLevel >= index
                                  ? "bg-violet-500"
                                  : "bg-gray-200"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
