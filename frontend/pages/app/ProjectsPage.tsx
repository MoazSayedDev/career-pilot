"use client";

import { useEffect, useState } from "react";
import {
  FolderOpen,
  Calendar,
  Link,
  Edit2,
  Trash2,
  Plus,
  Check,
} from "lucide-react";

import { Btn } from "@/components/ui/Btn";
import { Card } from "@/components/ui/Card";
import { Field } from "@/components/ui/Field";
import { PageHeader } from "@/components/ui/PageHeader";

import {
  createProject,
  deleteProject,
  getProjects,
  updateProject,
} from "@/services/project/api/project.service";
import type { Project } from "@/services/project/types/project";
import { useI18n } from "@/lib/i18n/I18nProvider";

const INITIAL_FORM = {
  name: "",
  description: "",
  technologies: "",
  githubUrl: "",
  url: "",
  startDate: "",
  endDate: "",
};

const parseList = (value: string) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const formatDate = (value?: string | null) => {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return date.toISOString().slice(0, 10);
};

const inputClassName =
  "w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:ring-blue-500/20";

const iconInputClassName =
  "w-full rounded-lg border border-gray-200 bg-white py-2.5 ps-9 pe-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:ring-blue-500/20";

const iconClassName =
  "absolute start-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500";

export default function ProjectsPage() {
  const { t } = useI18n();
  const [projects, setProjects] = useState<Project[]>([]);
  const [form, setForm] = useState(INITIAL_FORM);
  const [editId, setEditId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const refresh = () => setReloadKey((key) => key + 1);

  useEffect(() => {
    let cancelled = false;

    const loadProjects = async () => {
      try {
        const data = await getProjects();

        if (!cancelled) {
          setProjects(data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadProjects();

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const updateField = (key: keyof typeof INITIAL_FORM, value: string) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));

    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!form.name.trim()) {
      newErrors.name = t("profile.projects.nameRequired");
    }

    if (!form.description.trim()) {
      newErrors.description = t("profile.projects.descriptionRequired");
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setForm(INITIAL_FORM);
    setEditId(null);
    setErrors({});
  };

  const handleSave = async () => {
    if (!validate()) return;

    setSubmitting(true);

    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        technologies: parseList(form.technologies),
        liveDemo: form.url.trim() || undefined,
        github: form.githubUrl.trim() || undefined,
        startDate: form.startDate
          ? new Date(form.startDate).toISOString()
          : undefined,
        endDate: form.endDate
          ? new Date(form.endDate).toISOString()
          : undefined,
      };

      if (editId) {
        await updateProject(editId, payload);
      } else {
        await createProject(payload);
      }

      resetForm();
      refresh();
    } catch (error) {
      console.error(error);

      setErrors((prev) => ({
        ...prev,
        root: t("profile.projects.saveFailed"),
      }));
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (project: Project) => {
    setForm({
      name: project.name,
      description: project.description,
      technologies: project.technologies.join(", "),
      githubUrl: project.github ?? "",
      url: project.liveDemo ?? "",
      startDate: formatDate(project.startDate),
      endDate: formatDate(project.endDate),
    });

    setEditId(project.id);
    setErrors({});
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProject(id);

      if (editId === id) {
        resetForm();
      }

      refresh();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <PageHeader
        icon={<FolderOpen size={24} />}
        title={t("profile.projects.title")}
        subtitle={t("profile.projects.subtitle")}
        tipText={t("profile.projects.tip")}
      />

      <div className="grid lg:grid-cols-5 gap-6">
        <Card className="lg:col-span-2 p-6 h-fit">
          <h3 className="font-semibold text-gray-800 mb-1 flex items-center gap-2 dark:text-gray-200">
            <FolderOpen size={15} className="text-blue-500" />
            {editId
              ? t("profile.projects.editExisting")
              : t("profile.projects.addNew")}
          </h3>

          <p className="text-xs text-gray-400 mb-5 dark:text-gray-500">
            {editId
              ? t("profile.projects.editHint")
              : t("profile.projects.addHint")}
          </p>

          <div className="flex flex-col gap-4">
            <Field
              label={t("profile.projects.name")}
              required
              error={errors.name}
            >
              <input
                type="text"
                value={form.name}
                onChange={(event) => updateField("name", event.target.value)}
                placeholder={t("profile.projects.namePlaceholder")}
                className={inputClassName}
              />
            </Field>

            <Field
              label={t("profile.projects.description")}
              required
              error={errors.description}
            >
              <textarea
                value={form.description}
                onChange={(event) =>
                  updateField("description", event.target.value)
                }
                placeholder={t("profile.projects.descriptionPlaceholder")}
                rows={4}
                maxLength={400}
                className={`${inputClassName} resize-none`}
              />
            </Field>

            <Field label={t("profile.projects.technologies")}>
              <input
                type="text"
                value={form.technologies}
                onChange={(event) =>
                  updateField("technologies", event.target.value)
                }
                placeholder={t("profile.projects.technologiesPlaceholder")}
                className={inputClassName}
              />
            </Field>

            <Field label={t("profile.projects.projectUrl")}>
              <div className="relative">
                <Link size={14} className={iconClassName} />

                <input
                  type="url"
                  dir="ltr"
                  value={form.url}
                  onChange={(event) => updateField("url", event.target.value)}
                  placeholder={t("profile.projects.projectUrlPlaceholder")}
                  className={iconInputClassName}
                />
              </div>
            </Field>

            <Field label={t("profile.projects.github")}>
              <div className="relative">
                <Link size={14} className={iconClassName} />

                <input
                  type="url"
                  dir="ltr"
                  value={form.githubUrl}
                  onChange={(event) =>
                    updateField("githubUrl", event.target.value)
                  }
                  placeholder={t("profile.projects.githubPlaceholder")}
                  className={iconInputClassName}
                />
              </div>
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label={t("profile.projects.startDate")}>
                <div className="relative">
                  <Calendar size={14} className={iconClassName} />

                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(event) =>
                      updateField("startDate", event.target.value)
                    }
                    className={iconInputClassName}
                  />
                </div>
              </Field>

              <Field label={t("profile.projects.endDate")}>
                <div className="relative">
                  <Calendar size={14} className={iconClassName} />

                  <input
                    type="date"
                    value={form.endDate}
                    onChange={(event) =>
                      updateField("endDate", event.target.value)
                    }
                    className={iconInputClassName}
                  />
                </div>
              </Field>
            </div>

            {errors.root && (
              <p className="text-sm text-red-500">{errors.root}</p>
            )}

            <div className="flex gap-2">
              <Btn
                className="flex-1"
                onClick={() => void handleSave()}
                disabled={submitting}
              >
                {submitting ? (
                  <span>{t("common.saving")}</span>
                ) : (
                  <>
                    {editId ? <Check size={15} /> : <Plus size={15} />}{" "}
                    {editId ? t("common.update") : t("profile.projects.submit")}
                  </>
                )}
              </Btn>

              {editId && (
                <Btn variant="outline" onClick={resetForm}>
                  {t("common.cancel")}
                </Btn>
              )}
            </div>
          </div>
        </Card>

        <div className="lg:col-span-3 flex flex-col gap-5">
          <Card className="p-6">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2 dark:text-gray-200">
              <FolderOpen size={15} className="text-blue-500" />
              {t("profile.projects.listTitle", { count: projects.length })}
            </h3>

            {loading ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t("profile.projects.loading")}
              </p>
            ) : projects.length === 0 ? (
              <div className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                {t("profile.projects.empty")}
              </div>
            ) : (
              <div className="space-y-4">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/60"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-gray-100">
                          {project.name}
                        </p>

                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {project.startDate
                            ? formatDate(project.startDate)
                            : "—"}{" "}
                          {project.endDate
                            ? `- ${formatDate(project.endDate)}`
                            : ""}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(project)}
                          className="p-2 text-gray-500 hover:text-blue-700 dark:text-gray-400 dark:hover:text-blue-400"
                        >
                          <Edit2 size={14} />
                        </button>

                        <button
                          type="button"
                          onClick={() => void handleDelete(project.id)}
                          className="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      {project.description}
                    </p>

                    {project.technologies.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {project.technologies.map((tech) => (
                          <span
                            key={tech}
                            className="rounded-full bg-blue-100 px-2 py-1 text-[10px] font-medium text-blue-800 dark:bg-blue-500/15 dark:text-blue-300"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}

                    {(project.liveDemo || project.github) && (
                      <a
                        href={project.liveDemo ?? project.github ?? "#"}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 inline-block text-xs text-blue-700 hover:underline dark:text-blue-400"
                      >
                        {project.liveDemo ?? project.github}
                      </a>
                    )}
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
