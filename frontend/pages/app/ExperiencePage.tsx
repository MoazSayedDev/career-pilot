"use client";

import { useEffect, useMemo, useState } from "react";
import { Briefcase, MapPin, Calendar, Edit2, Trash2, Plus, Check } from "lucide-react";

import { Btn } from "@/components/ui/Btn";
import { Card } from "@/components/ui/Card";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { PageHeader } from "@/components/ui/PageHeader";

import {
  createExperience,
  deleteExperience,
  getExperiences,
  updateExperience,
} from "@/services/experience/api/experience.service";
import {
  EMPLOYMENT_TYPE,
  EMPLOYMENT_TYPE_LABELS,
  type Experience,
} from "@/services/experience/types/experience";

const EMPTY_FORM = {
  company: "",
  position: "",
  employmentType: "FULL_TIME" as (typeof EMPLOYMENT_TYPE)[number],
  location: "",
  startDate: "",
  endDate: "",
  currentlyWorking: false,
  description: "",
  technologies: "",
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

export default function ExperiencePage() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [editId, setEditId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadExperiences = async () => {
    try {
      const data = await getExperiences();
      setExperiences(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadExperiences();
  }, []);

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!form.company.trim()) nextErrors.company = "Company name is required";
    if (!form.position.trim()) nextErrors.position = "Job title is required";
    if (!form.startDate) nextErrors.startDate = "Start date is required";
    if (!form.description.trim()) nextErrors.description = "Description is required";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setSubmitting(true);
    try {
      const payload = {
        company: form.company.trim(),
        position: form.position.trim(),
        employmentType: form.employmentType,
        location: form.location.trim() || undefined,
        startDate: new Date(form.startDate).toISOString(),
        endDate: form.currentlyWorking || !form.endDate ? undefined : new Date(form.endDate).toISOString(),
        currentlyWorking: form.currentlyWorking,
        description: parseList(form.description),
        technologies: parseList(form.technologies),
      };

      if (editId) {
        await updateExperience(editId, payload);
      } else {
        await createExperience(payload);
      }

      setForm(EMPTY_FORM);
      setErrors({});
      setEditId(null);
      await loadExperiences();
    } catch (error) {
      console.error(error);
      setErrors((prev) => ({ ...prev, root: "Failed to save experience." }));
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (experience: Experience) => {
    setForm({
      company: experience.company,
      position: experience.position,
      employmentType: experience.employmentType,
      location: experience.location ?? "",
      startDate: formatDate(experience.startDate),
      endDate: formatDate(experience.endDate),
      currentlyWorking: experience.currentlyWorking,
      description: experience.description.join(", "),
      technologies: experience.technologies.join(", "),
    });
    setEditId(experience.id);
    setErrors({});
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteExperience(id);
      if (editId === id) {
        setEditId(null);
        setForm(EMPTY_FORM);
      }
      await loadExperiences();
    } catch (error) {
      console.error(error);
    }
  };

  const cancelEdit = () => {
    setEditId(null);
    setForm(EMPTY_FORM);
    setErrors({});
  };

  const employmentOptions = useMemo(
    () => Object.values(EMPLOYMENT_TYPE).map((value) => ({ value, label: EMPLOYMENT_TYPE_LABELS[value] })),
    [],
  );

  return (
    <div>
      <PageHeader
        icon={<Briefcase size={24} />}
        title="Experience"
        subtitle="Add your work experience to showcase your professional journey"
        tipText="List your relevant work experience in reverse chronological order."
      />

      <div className="grid lg:grid-cols-5 gap-6">
        <Card className="lg:col-span-2 p-6 h-fit">
          <h3 className="font-semibold text-gray-800 mb-1 flex items-center gap-2">
            <Briefcase size={15} className="text-violet-500" />
            {editId ? "Edit Experience" : "Add New Experience"}
          </h3>
          <p className="text-xs text-gray-400 mb-5">Fill in the details of your work experience</p>

          <div className="flex flex-col gap-4">
            <Field label="Job Title" required error={errors.position}>
              <Input value={form.position} onChange={(value) => setForm((prev) => ({ ...prev, position: value }))} placeholder="e.g. Frontend Developer" />
            </Field>

            <Field label="Company Name" required error={errors.company}>
              <Input value={form.company} onChange={(value) => setForm((prev) => ({ ...prev, company: value }))} placeholder="e.g. Google" />
            </Field>

            <Field label="Employment Type">
              <Select
                value={form.employmentType}
                onChange={(value) => setForm((prev) => ({ ...prev, employmentType: value as (typeof EMPLOYMENT_TYPE)[number] }))}
                options={employmentOptions.map((option) => option.label)}
                placeholder="Select employment type"
              />
            </Field>

            <Field label="Location">
              <Input value={form.location} onChange={(value) => setForm((prev) => ({ ...prev, location: value }))} placeholder="e.g. Cairo, Egypt" icon={<MapPin size={14} />} />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Start Date" required error={errors.startDate}>
                <Input value={form.startDate} onChange={(value) => setForm((prev) => ({ ...prev, startDate: value }))} type="date" icon={<Calendar size={14} />} />
              </Field>

              <Field label="End Date">
                <Input value={form.endDate} onChange={(value) => setForm((prev) => ({ ...prev, endDate: value }))} type="date" disabled={form.currentlyWorking} icon={<Calendar size={14} />} />
              </Field>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.currentlyWorking} onChange={(event) => setForm((prev) => ({ ...prev, currentlyWorking: event.target.checked, endDate: event.target.checked ? "" : prev.endDate }))} className="w-4 h-4 rounded border-gray-300 text-violet-600" />
              <span className="text-sm text-gray-600">I currently work here</span>
            </label>

            <Field label="Technologies">
              <Input value={form.technologies} onChange={(value) => setForm((prev) => ({ ...prev, technologies: value }))} placeholder="React, TypeScript, Node.js" />
            </Field>

            <Field label="Description" required error={errors.description}>
              <Textarea value={form.description} onChange={(value) => setForm((prev) => ({ ...prev, description: value }))} placeholder="Describe your responsibilities and achievements..." rows={4} />
            </Field>

            {errors.root && <p className="text-sm text-red-500">{errors.root}</p>}

            <div className="flex gap-2">
              <Btn className="flex-1" onClick={handleSave} disabled={submitting}>
                {submitting ? <span>Saving...</span> : <>{editId ? <Check size={15} /> : <Plus size={15} />} {editId ? "Update" : "Save"}</>}
              </Btn>
              {editId && (
                <Btn variant="outline" onClick={cancelEdit}>Cancel</Btn>
              )}
            </div>
          </div>
        </Card>

        <div className="lg:col-span-3 flex flex-col gap-5">
          <Card className="p-6">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Briefcase size={15} className="text-violet-500" />
              Your Experience ({experiences.length})
            </h3>

            {loading ? (
              <p className="text-sm text-gray-500">Loading experiences...</p>
            ) : experiences.length === 0 ? (
              <div className="py-8 text-center text-sm text-gray-500">No experience added yet.</div>
            ) : (
              <div className="space-y-4">
                {experiences.map((experience) => (
                  <div key={experience.id} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold text-gray-900">{experience.position}</p>
                        <p className="text-sm text-violet-600">{experience.company}</p>
                      </div>
                      <div className="flex gap-2">
                        <button type="button" onClick={() => handleEdit(experience)} className="p-2 text-gray-500 hover:text-violet-600"><Edit2 size={14} /></button>
                        <button type="button" onClick={() => void handleDelete(experience.id)} className="p-2 text-gray-500 hover:text-red-600"><Trash2 size={14} /></button>
                      </div>
                    </div>

                    <div className="mt-2 text-xs text-gray-500">
                      {experience.employmentType && EMPLOYMENT_TYPE_LABELS[experience.employmentType]} · {experience.location || "Remote"} · {formatDate(experience.startDate)} {experience.currentlyWorking ? "- Present" : experience.endDate ? `- ${formatDate(experience.endDate)}` : ""}
                    </div>

                    {experience.description.length > 0 && (
                      <ul className="mt-2 list-disc pl-5 text-sm text-gray-600 space-y-1">
                        {experience.description.map((item) => <li key={item}>{item}</li>)}
                      </ul>
                    )}

                    {experience.technologies.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {experience.technologies.map((tech) => (
                          <span key={tech} className="rounded-full bg-violet-100 px-2 py-1 text-[10px] font-medium text-violet-700">{tech}</span>
                        ))}
                      </div>
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

