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

export default function ProjectsPage() {
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
      newErrors.name = "Project name is required";
    }

    if (!form.description.trim()) {
      newErrors.description = "Project description is required";
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
        root: "Failed to save project.",
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
        title="Projects"
        subtitle="Showcase your best work and side projects"
        tipText="Include links to live projects or GitHub repositories so recruiters can see your work."
      />

      <div className="grid lg:grid-cols-5 gap-6">
        <Card className="lg:col-span-2 p-6 h-fit">
          <h3 className="font-semibold text-gray-800 mb-1 flex items-center gap-2">
            <FolderOpen size={15} className="text-violet-500" />
            {editId ? "Edit Project" : "Add New Project"}
          </h3>

          <p className="text-xs text-gray-400 mb-5">
            {editId
              ? "Update your project details"
              : "Fill in the details of your project"}
          </p>

          <div className="flex flex-col gap-4">
            <Field label="Project Name" required error={errors.name}>
              <input
                type="text"
                value={form.name}
                onChange={(event) => updateField("name", event.target.value)}
                placeholder="e.g. E-commerce Platform"
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
              />
            </Field>

            <Field label="Description" required error={errors.description}>
              <textarea
                value={form.description}
                onChange={(event) =>
                  updateField("description", event.target.value)
                }
                placeholder="Describe what you built and your key contributions..."
                rows={4}
                maxLength={400}
                className="w-full resize-none rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
              />
            </Field>

            <Field label="Technologies Used">
              <input
                type="text"
                value={form.technologies}
                onChange={(event) =>
                  updateField("technologies", event.target.value)
                }
                placeholder="e.g. React, Node.js, PostgreSQL"
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
              />
            </Field>

            <Field label="Project URL">
              <div className="relative">
                <Link
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="url"
                  value={form.url}
                  onChange={(event) => updateField("url", event.target.value)}
                  placeholder="https://project.com"
                  className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm text-gray-900 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                />
              </div>
            </Field>

            <Field label="GitHub Repository">
              <div className="relative">
                <Link
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="url"
                  value={form.githubUrl}
                  onChange={(event) =>
                    updateField("githubUrl", event.target.value)
                  }
                  placeholder="https://github.com/username/project"
                  className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm text-gray-900 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                />
              </div>
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Start Date">
                <div className="relative">
                  <Calendar
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(event) =>
                      updateField("startDate", event.target.value)
                    }
                    className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm text-gray-900 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                  />
                </div>
              </Field>

              <Field label="End Date">
                <div className="relative">
                  <Calendar
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    type="date"
                    value={form.endDate}
                    onChange={(event) =>
                      updateField("endDate", event.target.value)
                    }
                    className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm text-gray-900 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
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
                  <span>Saving...</span>
                ) : (
                  <>
                    {editId ? <Check size={15} /> : <Plus size={15} />}{" "}
                    {editId ? "Update" : "Add Project"}
                  </>
                )}
              </Btn>

              {editId && (
                <Btn variant="outline" onClick={resetForm}>
                  Cancel
                </Btn>
              )}
            </div>
          </div>
        </Card>

        <div className="lg:col-span-3 flex flex-col gap-5">
          <Card className="p-6">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FolderOpen size={15} className="text-violet-500" />
              Your Projects ({projects.length})
            </h3>

            {loading ? (
              <p className="text-sm text-gray-500">Loading projects...</p>
            ) : projects.length === 0 ? (
              <div className="py-8 text-center text-sm text-gray-500">
                No projects added yet.
              </div>
            ) : (
              <div className="space-y-4">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className="rounded-xl border border-gray-200 bg-gray-50 p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {project.name}
                        </p>

                        <p className="text-xs text-gray-500">
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
                          className="p-2 text-gray-500 hover:text-violet-600"
                        >
                          <Edit2 size={14} />
                        </button>

                        <button
                          type="button"
                          onClick={() => void handleDelete(project.id)}
                          className="p-2 text-gray-500 hover:text-red-600"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    <p className="mt-2 text-sm text-gray-600">
                      {project.description}
                    </p>

                    {project.technologies.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {project.technologies.map((tech) => (
                          <span
                            key={tech}
                            className="rounded-full bg-violet-100 px-2 py-1 text-[10px] font-medium text-violet-700"
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
                        className="mt-3 inline-block text-xs text-violet-600 hover:underline"
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
