"use client";

import { useState } from "react";
import {
  FolderOpen,
  Calendar,
  Link,
  ExternalLink,
  Eye,
  Edit2,
  Trash2,
  Plus,
  Check,
} from "lucide-react";

import { Btn } from "@/components/ui/Btn";
import { Card } from "@/components/ui/Card";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { PageHeader } from "@/components/ui/PageHeader";

interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string;
  url: string;
  startDate: string;
  endDate: string;
}

const INITIAL_FORM = {
  name: "",
  description: "",
  technologies: "",
  url: "",
  startDate: "",
  endDate: "",
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [form, setForm] = useState(INITIAL_FORM);

  const [editId, setEditId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

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

  const handleSave = () => {
    if (!validate()) return;

    if (editId) {
      setProjects((prev) =>
        prev.map((project) =>
          project.id === editId
            ? {
                ...form,
                id: editId,
              }
            : project,
        ),
      );
    } else {
      const newProject: Project = {
        ...form,
        id: crypto.randomUUID(),
      };

      setProjects((prev) => [newProject, ...prev]);
    }

    resetForm();
  };

  const handleEdit = (project: Project) => {
    setForm({
      name: project.name,
      description: project.description,
      technologies: project.technologies,
      url: project.url,
      startDate: project.startDate,
      endDate: project.endDate,
    });

    setEditId(project.id);
    setErrors({});
  };

  const handleDelete = (id: string) => {
    setProjects((prev) => prev.filter((project) => project.id !== id));

    if (editId === id) {
      resetForm();
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
        {/* Form */}
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
              <Input
                value={form.name}
                onChange={(value) => updateField("name", value)}
                placeholder="e.g. E-commerce Platform"
              />
            </Field>

            <Field label="Description" required error={errors.description}>
              <Textarea
                value={form.description}
                onChange={(value) => updateField("description", value)}
                placeholder="Describe what you built and your key contributions..."
                rows={4}
                maxLength={400}
              />
            </Field>

            <Field label="Technologies Used">
              <Input
                value={form.technologies}
                onChange={(value) => updateField("technologies", value)}
                placeholder="e.g. React, Node.js, PostgreSQL"
              />
            </Field>

            <Field label="Project URL">
              <Input
                value={form.url}
                onChange={(value) => updateField("url", value)}
                placeholder="https://project.com"
                icon={<Link size={14} />}
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Start Date">
                <Input
                  value={form.startDate}
                  onChange={(value) => updateField("startDate", value)}
                  placeholder="MM/YYYY"
                  icon={<Calendar size={14} />}
                />
              </Field>

              <Field label="End Date">
                <Input
                  value={form.endDate}
                  onChange={(value) => updateField("endDate", value)}
                  placeholder="MM/YYYY"
                  icon={<Calendar size={14} />}
                />
              </Field>
            </div>

            <div className="flex gap-2">
              <Btn className="flex-1" onClick={handleSave}>
                {editId ? (
                  <>
                    <Check size={15} />
                    Update
                  </>
                ) : (
                  <>
                    <Plus size={15} />
                    Add Project
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

        {/* Projects + Preview */}
        <div className="lg:col-span-3 flex flex-col gap-5">
          {/* Projects List */}
          <Card className="p-6">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FolderOpen size={15} className="text-violet-500" />
              Your Projects ({projects.length})
            </h3>

            {projects.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-3">
                  <FolderOpen size={22} className="text-gray-400" />
                </div>

                <p className="font-medium text-gray-600">
                  No projects added yet
                </p>

                <p className="text-sm text-gray-400">
                  Add your best work to showcase your skills.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className="p-4 rounded-xl border border-gray-100 bg-gray-50"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-900 text-sm">
                          {project.name}
                        </h4>

                        {project.startDate && (
                          <p className="text-xs text-gray-400 mt-0.5">
                            {project.startDate}
                            {project.endDate && ` – ${project.endDate}`}
                          </p>
                        )}
                      </div>

                      <div className="flex gap-1.5">
                        <Btn
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(project)}
                        >
                          <Edit2 size={12} />
                        </Btn>

                        <Btn
                          size="sm"
                          variant="danger"
                          onClick={() => handleDelete(project.id)}
                        >
                          <Trash2 size={12} />
                        </Btn>
                      </div>
                    </div>

                    <p className="text-xs text-gray-600 leading-relaxed mb-2">
                      {project.description}
                    </p>

                    {project.technologies && (
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {project.technologies.split(",").map((technology) => (
                          <span
                            key={technology}
                            className="text-[11px] px-2 py-0.5 bg-violet-100 text-violet-700 rounded-full font-medium"
                          >
                            {technology.trim()}
                          </span>
                        ))}
                      </div>
                    )}

                    {project.url && (
                      <a
                        href={project.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-violet-600 hover:underline"
                      >
                        <ExternalLink size={11} />
                        {project.url}
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Preview */}
          <Card className="p-6">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Eye size={15} className="text-violet-500" />
              Preview in CV
            </h3>

            <div className="border-t-2 border-violet-600 pt-4">
              <p className="text-xs font-bold tracking-widest text-violet-700 uppercase mb-3">
                Projects
              </p>

              {projects.length === 0 ? (
                <p className="text-xs text-gray-400 italic">
                  Add projects to see the preview
                </p>
              ) : (
                projects.map((project) => (
                  <div key={project.id} className="mb-4">
                    <div className="flex items-baseline justify-between gap-3">
                      <p className="text-sm font-bold text-gray-900">
                        {project.name}
                      </p>

                      {project.url && (
                        <a
                          href={project.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-violet-600 hover:underline"
                        >
                          View Project
                        </a>
                      )}
                    </div>

                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                      {project.description}
                    </p>

                    {project.technologies && (
                      <p className="text-xs text-gray-500 mt-1 font-medium">
                        Tech: {project.technologies}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
