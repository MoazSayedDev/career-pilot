import { useState } from "react";
import { FolderOpen, Calendar, Link, ExternalLink, Eye, Edit2, Trash2, Plus, Check } from "lucide-react";
import { Btn } from "../../components/ui/Btn";
import { Card } from "../../components/ui/Card";
import { Field } from "../../components/ui/Field";
import { Input } from "../../components/ui/Input";
import { Textarea } from "../../components/ui/Textarea";
import { PageHeader } from "../../components/ui/PageHeader";
import { uid } from "../../utils";
import type { CVData, ProjectItem } from "../../types";

interface ProjectsPageProps {
  cvData: CVData;
  setCVData: (d: CVData) => void;
}

const EMPTY_FORM = { name: "", description: "", technologies: "", url: "", startDate: "", endDate: "" };

export function ProjectsPage({ cvData, setCVData }: ProjectsPageProps) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name)        e.name        = "Project name is required";
    if (!form.description) e.description = "Description is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    if (editId) {
      setCVData({ ...cvData, projects: cvData.projects.map((p) => p.id === editId ? { ...form, id: editId } : p) });
      setEditId(null);
    } else {
      setCVData({ ...cvData, projects: [{ ...form, id: uid() }, ...cvData.projects] });
    }
    setForm(EMPTY_FORM);
    setErrors({});
  };

  const handleEdit = (proj: ProjectItem) => {
    setForm({ name: proj.name, description: proj.description, technologies: proj.technologies, url: proj.url, startDate: proj.startDate, endDate: proj.endDate });
    setEditId(proj.id);
  };

  const handleDelete = (id: string) =>
    setCVData({ ...cvData, projects: cvData.projects.filter((p) => p.id !== id) });

  return (
    <div>
      <PageHeader
        icon={<FolderOpen size={24} />}
        title="Projects"
        subtitle="Showcase your best work and side projects"
        tipText="Include links to live projects or GitHub repos so recruiters can see your work."
      />

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Form */}
        <Card className="lg:col-span-2 p-6 h-fit">
          <h3 className="font-semibold text-gray-800 mb-1 flex items-center gap-2">
            <FolderOpen size={15} className="text-violet-500" />
            {editId ? "Edit Project" : "Add New Project"}
          </h3>
          <p className="text-xs text-gray-400 mb-5">Fill in the details of your project</p>

          <div className="flex flex-col gap-4">
            <Field label="Project Name" required error={errors.name}>
              <Input value={form.name} onChange={(v) => setForm((f) => ({ ...f, name: v }))} placeholder="e.g. E-commerce Platform" />
            </Field>
            <Field label="Description" required error={errors.description}>
              <Textarea value={form.description} onChange={(v) => setForm((f) => ({ ...f, description: v }))} placeholder="Describe what you built and your key contributions…" rows={4} maxLength={400} />
            </Field>
            <Field label="Technologies Used">
              <Input value={form.technologies} onChange={(v) => setForm((f) => ({ ...f, technologies: v }))} placeholder="e.g. React, Node.js, PostgreSQL" />
            </Field>
            <Field label="Project URL">
              <Input value={form.url} onChange={(v) => setForm((f) => ({ ...f, url: v }))} placeholder="https://project.com" icon={<Link size={14} />} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Start Date">
                <Input value={form.startDate} onChange={(v) => setForm((f) => ({ ...f, startDate: v }))} placeholder="MM/YYYY" icon={<Calendar size={14} />} />
              </Field>
              <Field label="End Date">
                <Input value={form.endDate} onChange={(v) => setForm((f) => ({ ...f, endDate: v }))} placeholder="MM/YYYY" icon={<Calendar size={14} />} />
              </Field>
            </div>
            <div className="flex gap-2">
              <Btn className="flex-1" onClick={handleSave}>
                {editId ? <><Check size={15} />Update</> : <><Plus size={15} />Add Project</>}
              </Btn>
              {editId && (
                <Btn variant="outline" onClick={() => { setEditId(null); setForm(EMPTY_FORM); }}>Cancel</Btn>
              )}
            </div>
          </div>
        </Card>

        {/* List + Preview */}
        <div className="lg:col-span-3 flex flex-col gap-5">
          <Card className="p-6">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FolderOpen size={15} className="text-violet-500" />Your Projects ({cvData.projects.length})
            </h3>
            {cvData.projects.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-3">
                  <FolderOpen size={22} className="text-gray-400" />
                </div>
                <p className="font-medium text-gray-600">No projects added yet</p>
                <p className="text-sm text-gray-400">Add your best work to showcase your skills.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {cvData.projects.map((proj) => (
                  <div key={proj.id} className="p-4 rounded-xl border border-gray-100 bg-gray-50">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-900 text-sm">{proj.name}</h4>
                        {proj.startDate && (
                          <p className="text-xs text-gray-400 mt-0.5">
                            {proj.startDate}{proj.endDate ? ` – ${proj.endDate}` : ""}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-1.5">
                        <Btn size="sm" variant="outline" onClick={() => handleEdit(proj)}>
                          <Edit2 size={12} />
                        </Btn>
                        <Btn size="sm" variant="danger" onClick={() => handleDelete(proj.id)}>
                          <Trash2 size={12} />
                        </Btn>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed mb-2">{proj.description}</p>
                    {proj.technologies && (
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {proj.technologies.split(",").map((t) => (
                          <span key={t} className="text-[11px] px-2 py-0.5 bg-violet-100 text-violet-700 rounded-full font-medium">
                            {t.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                    {proj.url && (
                      <a href={proj.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-violet-600 hover:underline">
                        <ExternalLink size={11} />{proj.url}
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Eye size={15} className="text-violet-500" />Preview in CV
            </h3>
            <div className="border-t-2 border-violet-600 pt-4">
              <p className="text-xs font-bold tracking-widest text-violet-700 uppercase mb-3">Projects</p>
              {cvData.projects.length === 0 ? (
                <p className="text-xs text-gray-400 italic">Add projects to see the preview</p>
              ) : cvData.projects.map((proj) => (
                <div key={proj.id} className="mb-4">
                  <div className="flex items-baseline justify-between">
                    <p className="text-sm font-bold text-gray-900">{proj.name}</p>
                    {proj.url && <a href={proj.url} className="text-xs text-violet-600">{proj.url}</a>}
                  </div>
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">{proj.description}</p>
                  {proj.technologies && (
                    <p className="text-xs text-gray-500 mt-1 font-medium">Tech: {proj.technologies}</p>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
