"use client";

import { useEffect, useState } from "react";
import { Zap, Plus, X } from "lucide-react";

import { Btn } from "@/components/ui/Btn";
import { Card } from "@/components/ui/Card";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { SkillLevelBadge } from "@/components/ui/Badge";
import { PageHeader } from "@/components/ui/PageHeader";

import { createSkill, deleteSkill, getSkills } from "@/services/skill/api/skill.service";
import {
  SKILL_LEVELS,
  SKILL_LEVEL_LABELS,
  type Skill,
} from "@/services/skill/types/skill";

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

const mapLevelToBackend = (value: string): Skill["level"] => {
  const normalized = value.toUpperCase().replace(/\s+/g, "_");
  if (normalized === "BEGINNER" || normalized === "INTERMEDIATE" || normalized === "ADVANCED" || normalized === "EXPERT") {
    return normalized as Skill["level"];
  }
  return "INTERMEDIATE";
};

export default function SkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [name, setName] = useState("");
  const [level, setLevel] = useState("INTERMEDIATE");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadSkills = async () => {
    try {
      const data = await getSkills();
      setSkills(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadSkills();
  }, []);

  const handleAdd = async () => {
    if (!name.trim()) {
      setError("Skill name is required");
      return;
    }

    setSubmitting(true);
    try {
      await createSkill({
        name: name.trim(),
        level: mapLevelToBackend(level),
        yearsOfExperience: 1,
      });
      setName("");
      setLevel("INTERMEDIATE");
      setError("");
      await loadSkills();
    } catch (err) {
      console.error(err);
      setError("Failed to save skill.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteSkill(id);
      await loadSkills();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <PageHeader
        icon={<Zap size={24} />}
        title="Skills"
        subtitle="Showcase your technical and professional skills"
        tipText="Add both hard and soft skills. Order them by proficiency level for best impact."
      />

      <div className="grid lg:grid-cols-5 gap-6">
        <Card className="lg:col-span-2 p-6 h-fit">
          <h3 className="font-semibold text-gray-800 mb-1 flex items-center gap-2">
            <Zap size={15} className="text-violet-500" />
            Add Skill
          </h3>

          <p className="text-xs text-gray-400 mb-5">Add your skills one at a time</p>

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
                options={SKILL_LEVELS.map((skillLevel) => SKILL_LEVEL_LABELS[skillLevel])}
                placeholder="Select level"
              />
            </Field>

            <Btn onClick={() => void handleAdd()} disabled={submitting}>
              <Plus size={15} />
              {submitting ? "Saving..." : "Add Skill"}
            </Btn>
          </div>

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

        <div className="lg:col-span-3 flex flex-col gap-5">
          <Card className="p-6">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Zap size={15} className="text-violet-500" />
              Your Skills ({skills.length})
            </h3>

            {loading ? (
              <p className="text-sm text-gray-500">Loading skills...</p>
            ) : skills.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-3">
                  <Zap size={22} className="text-gray-400" />
                </div>
                <p className="font-medium text-gray-600">No skills added yet</p>
                <p className="text-sm text-gray-400">Add your first skill using the form.</p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <div
                    key={skill.id}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-700 group"
                  >
                    <span>{skill.name}</span>
                    <SkillLevelBadge level={SKILL_LEVEL_LABELS[skill.level]} />
                    <button
                      type="button"
                      onClick={() => void handleDelete(skill.id)}
                      className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all ml-1"
                      aria-label={`Delete ${skill.name}`}
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
