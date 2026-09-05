"use client";

import { useEffect, useState } from "react";
import { Zap, Languages, Plus, X } from "lucide-react";

import { Btn } from "@/components/ui/Btn";
import { Card } from "@/components/ui/Card";
import { Field } from "@/components/ui/Field";
import { Select } from "@/components/ui/Select";
import { SkillLevelBadge } from "@/components/ui/Badge";
import { PageHeader } from "@/components/ui/PageHeader";

import {
  createSkill,
  deleteSkill,
  getSkills,
} from "@/services/skill/api/skill.service";

import {
  SKILL_LEVELS,
  SKILL_LEVEL_LABELS,
  type Skill,
} from "@/services/skill/types/skill";

import {
  createLanguage,
  deleteLanguage,
  getLanguages,
} from "@/services/language/api/language.service";

import {
  LANGUAGE_LEVELS,
  LANGUAGE_LEVEL_LABELS,
  type Language,
  type LanguageLevel,
} from "@/services/language/types/language";

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

  if (
    normalized === "BEGINNER" ||
    normalized === "INTERMEDIATE" ||
    normalized === "ADVANCED" ||
    normalized === "EXPERT"
  ) {
    return normalized as Skill["level"];
  }

  return "INTERMEDIATE";
};

export default function SkillsPage() {
  /* =========================
     Skills
  ========================= */

  const [skills, setSkills] = useState<Skill[]>([]);
  const [skillName, setSkillName] = useState("");
  const [skillLevel, setSkillLevel] = useState("INTERMEDIATE");
  const [skillError, setSkillError] = useState("");
  const [skillsLoading, setSkillsLoading] = useState(true);
  const [skillSubmitting, setSkillSubmitting] = useState(false);

  /* =========================
     Languages
  ========================= */

  const [languages, setLanguages] = useState<Language[]>([]);
  const [languageName, setLanguageName] = useState("");
  const [languageLevel, setLanguageLevel] = useState<LanguageLevel>(
    LANGUAGE_LEVELS[0],
  );
  const [languageError, setLanguageError] = useState("");
  const [languagesLoading, setLanguagesLoading] = useState(true);
  const [languageSubmitting, setLanguageSubmitting] = useState(false);

  /* =========================
     Load Skills
  ========================= */

  const loadSkills = async () => {
    try {
      const data = await getSkills();
      setSkills(data);
    } catch (err) {
      console.error(err);
    } finally {
      setSkillsLoading(false);
    }
  };

  /* =========================
     Load Languages
  ========================= */

  const loadLanguages = async () => {
    try {
      const data = await getLanguages();
      setLanguages(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLanguagesLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadSkills();
    void loadLanguages();
  }, []);

  /* =========================
     Add Skill
  ========================= */

  const handleAddSkill = async () => {
    if (!skillName.trim()) {
      setSkillError("Skill name is required");
      return;
    }

    setSkillSubmitting(true);

    try {
      await createSkill({
        name: skillName.trim(),
        level: mapLevelToBackend(skillLevel),
        yearsOfExperience: 1,
      });

      setSkillName("");
      setSkillLevel("INTERMEDIATE");
      setSkillError("");

      await loadSkills();
    } catch (err) {
      console.error(err);
      setSkillError("Failed to save skill.");
    } finally {
      setSkillSubmitting(false);
    }
  };

  /* =========================
     Delete Skill
  ========================= */

  const handleDeleteSkill = async (id: string) => {
    try {
      await deleteSkill(id);
      await loadSkills();
    } catch (err) {
      console.error(err);
    }
  };

  /* =========================
     Add Language
  ========================= */

  const handleAddLanguage = async () => {
    if (!languageName.trim()) {
      setLanguageError("Language name is required");
      return;
    }

    setLanguageSubmitting(true);

    try {
      await createLanguage({
        language: languageName.trim(),
        level: languageLevel,
      });

      setLanguageName("");
      setLanguageLevel(LANGUAGE_LEVELS[0]);
      setLanguageError("");

      await loadLanguages();
    } catch (err) {
      console.error(err);
      setLanguageError("Failed to save language.");
    } finally {
      setLanguageSubmitting(false);
    }
  };

  /* =========================
     Delete Language
  ========================= */

  const handleDeleteLanguage = async (id: string) => {
    try {
      await deleteLanguage(id);
      await loadLanguages();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <PageHeader
        icon={<Zap size={24} />}
        title="Skills & Languages"
        subtitle="Showcase your technical skills and language proficiency"
        tipText="Add your strongest skills and the languages you speak to make your CV more complete."
      />

      <div className="grid lg:grid-cols-2 gap-6">
        {/* =================================
            SKILLS
        ================================= */}

        <Card className="p-6 h-fit">
          <h3 className="font-semibold text-gray-800 mb-1 flex items-center gap-2">
            <Zap size={15} className="text-blue-500" />
            Add Skill
          </h3>

          <p className="text-xs text-gray-400 mb-5">
            Add your technical and professional skills
          </p>

          <div className="flex flex-col gap-4">
            <Field label="Skill Name" required error={skillError}>
              <input
                type="text"
                value={skillName}
                onChange={(e) => {
                  setSkillName(e.target.value);
                  setSkillError("");
                }}
                placeholder="e.g. React, Figma, Python..."
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </Field>

            <Field label="Proficiency Level">
              <Select
                value={skillLevel}
                onChange={setSkillLevel}
                options={SKILL_LEVELS.map(
                  (skillLevel) => SKILL_LEVEL_LABELS[skillLevel],
                )}
                placeholder="Select level"
              />
            </Field>

            <Btn
              onClick={() => void handleAddSkill()}
              disabled={skillSubmitting}
            >
              <Plus size={15} />
              {skillSubmitting ? "Saving..." : "Add Skill"}
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
                    setSkillName(skill);
                    setSkillError("");
                  }}
                  className="text-xs px-2.5 py-1 rounded-full border border-gray-200 text-gray-600 hover:border-blue-400 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                >
                  + {skill}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* =================================
            LANGUAGES
        ================================= */}

        <Card className="p-6 h-fit">
          <h3 className="font-semibold text-gray-800 mb-1 flex items-center gap-2">
            <Languages size={15} className="text-blue-500" />
            Add Language
          </h3>

          <p className="text-xs text-gray-400 mb-5">
            Add the languages you speak and your proficiency level
          </p>

          <div className="flex flex-col gap-4">
            <Field label="Language" required error={languageError}>
              <input
                type="text"
                value={languageName}
                onChange={(e) => {
                  setLanguageName(e.target.value);
                  setLanguageError("");
                }}
                placeholder="e.g. English, Arabic, French..."
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </Field>

            <Field label="Proficiency Level">
              <Select
                value={languageLevel}
                onChange={(value) => setLanguageLevel(value as LanguageLevel)}
                options={LANGUAGE_LEVELS.map(
                  (level) => LANGUAGE_LEVEL_LABELS[level],
                )}
                placeholder="Select proficiency"
              />
            </Field>

            <Btn
              onClick={() => void handleAddLanguage()}
              disabled={languageSubmitting}
            >
              <Plus size={15} />
              {languageSubmitting ? "Saving..." : "Add Language"}
            </Btn>
          </div>
        </Card>
      </div>

      {/* =================================
          SKILLS LIST
      ================================= */}

      <Card className="mt-6 p-6">
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Zap size={15} className="text-blue-500" />
          Your Skills ({skills.length})
        </h3>

        {skillsLoading ? (
          <p className="text-sm text-gray-500">Loading skills...</p>
        ) : skills.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-3">
              <Zap size={22} className="text-gray-400" />
            </div>

            <p className="font-medium text-gray-600">No skills added yet</p>

            <p className="text-sm text-gray-400">
              Add your first skill using the form above.
            </p>
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
                  onClick={() => void handleDeleteSkill(skill.id)}
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

      {/* =================================
          LANGUAGES LIST
      ================================= */}

      <Card className="mt-6 p-6">
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Languages size={15} className="text-blue-500" />
          Your Languages ({languages.length})
        </h3>

        {languagesLoading ? (
          <p className="text-sm text-gray-500">Loading languages...</p>
        ) : languages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-3">
              <Languages size={22} className="text-gray-400" />
            </div>

            <p className="font-medium text-gray-600">No languages added yet</p>

            <p className="text-sm text-gray-400">
              Add your first language using the form above.
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {languages.map((language) => (
              <div
                key={language.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 group"
              >
                <div>
                  <p className="text-sm font-semibold text-gray-800">
                    {language.language}
                  </p>

                  <p className="text-xs text-blue-700 mt-0.5">
                    {LANGUAGE_LEVEL_LABELS[language.level]}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => void handleDeleteLanguage(language.id)}
                  className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all"
                  aria-label={`Delete ${language.language}`}
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
