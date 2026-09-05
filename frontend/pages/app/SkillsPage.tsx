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
  type Skill,
} from "@/services/skill/types/skill";

import {
  createLanguage,
  deleteLanguage,
  getLanguages,
} from "@/services/language/api/language.service";

import {
  LANGUAGE_LEVELS,
  type Language,
  type LanguageLevel,
} from "@/services/language/types/language";
import { useI18n } from "@/lib/i18n/I18nProvider";

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
  const { t } = useI18n();

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
      setSkillError(t("profile.skills.skillNameRequired"));
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
      setSkillError(t("profile.skills.saveSkillFailed"));
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
      setLanguageError(t("profile.skills.languageNameRequired"));
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
      setLanguageError(t("profile.skills.saveLanguageFailed"));
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
        title={t("profile.skills.title")}
        subtitle={t("profile.skills.subtitle")}
        tipText={t("profile.skills.tip")}
      />

      <div className="grid lg:grid-cols-2 gap-6">
        {/* =================================
            SKILLS
        ================================= */}

        <Card className="p-6 h-fit">
          <h3 className="font-semibold text-gray-800 mb-1 flex items-center gap-2 dark:text-gray-200">
            <Zap size={15} className="text-blue-500" />
            {t("profile.skills.addSkill")}
          </h3>

          <p className="text-xs text-gray-400 mb-5 dark:text-gray-500">
            {t("profile.skills.addSkillHint")}
          </p>

          <div className="flex flex-col gap-4">
            <Field
              label={t("profile.skills.skillName")}
              required
              error={skillError}
            >
              <input
                type="text"
                value={skillName}
                onChange={(e) => {
                  setSkillName(e.target.value);
                  setSkillError("");
                }}
                placeholder={t("profile.skills.skillNamePlaceholder")}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:ring-blue-500/20"
              />
            </Field>

            <Field label={t("profile.skills.proficiencyLevel")}>
              <Select
                value={t(`skillLevel.${skillLevel}`)}
                onChange={(label) => {
                  const match = SKILL_LEVELS.find(
                    (level) => t(`skillLevel.${level}`) === label,
                  );

                  if (match) setSkillLevel(match);
                }}
                options={SKILL_LEVELS.map((level) => t(`skillLevel.${level}`))}
                placeholder={t("profile.skills.levelPlaceholder")}
              />
            </Field>

            <Btn
              onClick={() => void handleAddSkill()}
              disabled={skillSubmitting}
            >
              <Plus size={15} />
              {skillSubmitting ? t("common.saving") : t("profile.skills.addSkill")}
            </Btn>
          </div>

          {/* Quick Add */}

          <div className="mt-6 pt-5 border-t border-gray-100 dark:border-gray-800">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 dark:text-gray-400">
              {t("profile.skills.quickAdd")}
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
                  className="text-xs px-2.5 py-1 rounded-full border border-gray-200 text-gray-600 hover:border-blue-400 hover:text-blue-700 hover:bg-blue-50 transition-colors dark:border-gray-700 dark:text-gray-400 dark:hover:border-blue-500 dark:hover:text-blue-400 dark:hover:bg-blue-500/10"
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
          <h3 className="font-semibold text-gray-800 mb-1 flex items-center gap-2 dark:text-gray-200">
            <Languages size={15} className="text-blue-500" />
            {t("profile.skills.addLanguage")}
          </h3>

          <p className="text-xs text-gray-400 mb-5 dark:text-gray-500">
            {t("profile.skills.addLanguageHint")}
          </p>

          <div className="flex flex-col gap-4">
            <Field
              label={t("profile.skills.languageName")}
              required
              error={languageError}
            >
              <input
                type="text"
                value={languageName}
                onChange={(e) => {
                  setLanguageName(e.target.value);
                  setLanguageError("");
                }}
                placeholder={t("profile.skills.languageNamePlaceholder")}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:ring-blue-500/20"
              />
            </Field>

            <Field label={t("profile.skills.proficiencyLevel")}>
              <Select
                value={t(`languageLevel.${languageLevel}`)}
                onChange={(label) => {
                  const match = LANGUAGE_LEVELS.find(
                    (level) => t(`languageLevel.${level}`) === label,
                  );

                  if (match) setLanguageLevel(match);
                }}
                options={LANGUAGE_LEVELS.map((level) =>
                  t(`languageLevel.${level}`),
                )}
                placeholder={t("profile.skills.proficiencyPlaceholder")}
              />
            </Field>

            <Btn
              onClick={() => void handleAddLanguage()}
              disabled={languageSubmitting}
            >
              <Plus size={15} />
              {languageSubmitting
                ? t("common.saving")
                : t("profile.skills.addLanguage")}
            </Btn>
          </div>
        </Card>
      </div>

      {/* =================================
          SKILLS LIST
      ================================= */}

      <Card className="mt-6 p-6">
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2 dark:text-gray-200">
          <Zap size={15} className="text-blue-500" />
          {t("profile.skills.skillsListTitle", { count: skills.length })}
        </h3>

        {skillsLoading ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t("profile.skills.loadingSkills")}
          </p>
        ) : skills.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-3 dark:bg-gray-800">
              <Zap size={22} className="text-gray-400 dark:text-gray-500" />
            </div>

            <p className="font-medium text-gray-600 dark:text-gray-300">
              {t("profile.skills.noSkills")}
            </p>

            <p className="text-sm text-gray-400 dark:text-gray-500">
              {t("profile.skills.noSkillsHint")}
            </p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <div
                key={skill.id}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-700 group dark:border-gray-700 dark:bg-gray-800/60 dark:text-gray-300"
              >
                <span>{skill.name}</span>

                <SkillLevelBadge level={skill.level} />

                <button
                  type="button"
                  onClick={() => void handleDeleteSkill(skill.id)}
                  className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all ms-1"
                  aria-label={t("profile.skills.deleteSkill", {
                    name: skill.name,
                  })}
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
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2 dark:text-gray-200">
          <Languages size={15} className="text-blue-500" />
          {t("profile.skills.languagesListTitle", {
            count: languages.length,
          })}
        </h3>

        {languagesLoading ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t("profile.skills.loadingLanguages")}
          </p>
        ) : languages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-3 dark:bg-gray-800">
              <Languages size={22} className="text-gray-400 dark:text-gray-500" />
            </div>

            <p className="font-medium text-gray-600 dark:text-gray-300">
              {t("profile.skills.noLanguages")}
            </p>

            <p className="text-sm text-gray-400 dark:text-gray-500">
              {t("profile.skills.noLanguagesHint")}
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {languages.map((language) => (
              <div
                key={language.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 group dark:border-gray-700 dark:bg-gray-800/60"
              >
                <div>
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                    {language.language}
                  </p>

                  <p className="text-xs text-blue-700 mt-0.5 dark:text-blue-400">
                    {t(`languageLevel.${language.level}`)}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => void handleDeleteLanguage(language.id)}
                  className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all"
                  aria-label={t("profile.skills.deleteLanguage", {
                    name: language.language,
                  })}
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
