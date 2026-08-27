"use client";

import { useEffect, useState } from "react";
import { GraduationCap, Calendar, Edit2, Trash2, Plus, Check, Building2 } from "lucide-react";

import { Btn } from "@/components/ui/Btn";
import { Card } from "@/components/ui/Card";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { PageHeader } from "@/components/ui/PageHeader";

import {
  createEducation,
  deleteEducation,
  getEducations,
  updateEducation,
} from "@/services/education/api/education.service";
import type { Education } from "@/services/education/types/education";

const EMPTY_FORM = {
  degree: "",
  field: "",
  school: "",
  location: "",
  startDate: "",
  endDate: "",
  current: false,
  description: "",
};

const formatDate = (value?: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
};

export default function EducationPage() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [education, setEducation] = useState<Education[]>([]);
  const [editId, setEditId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadEducation = async () => {
    try {
      const data = await getEducations();
      setEducation(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadEducation();
  }, []);

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!form.degree.trim()) nextErrors.degree = "Degree / qualification is required";
    if (!form.school.trim()) nextErrors.school = "School / university is required";
    if (!form.startDate) nextErrors.startDate = "Start date is required";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload = {
        university: form.school.trim(),
        degree: form.degree.trim(),
        field: form.field.trim(),
        description: form.description.trim() || undefined,
        startDate: new Date(form.startDate).toISOString(),
        endDate: form.current || !form.endDate ? undefined : new Date(form.endDate).toISOString(),
      };

      if (editId) {
        await updateEducation(editId, payload);
      } else {
        await createEducation(payload);
      }

      setForm(EMPTY_FORM);
      setEditId(null);
      setErrors({});
      await loadEducation();
    } catch (error) {
      console.error(error);
      setErrors((prev) => ({ ...prev, root: "Failed to save education." }));
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (item: Education) => {
    setForm({
      degree: item.degree,
      field: item.field,
      school: item.university,
      location: "",
      startDate: formatDate(item.startDate),
      endDate: formatDate(item.endDate),
      current: !item.endDate,
      description: item.description ?? "",
    });
    setEditId(item.id);
    setErrors({});
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteEducation(id);
      if (editId === id) {
        setEditId(null);
        setForm(EMPTY_FORM);
      }
      await loadEducation();
    } catch (error) {
      console.error(error);
    }
  };

  const handleCancelEdit = () => {
    setEditId(null);
    setForm(EMPTY_FORM);
    setErrors({});
  };

  return (
    <div>
      <PageHeader
        icon={<GraduationCap size={24} />}
        title="Education"
        subtitle="Add your educational background"
        tipText="Add your highest degree first. Include relevant details to make your CV stand out."
      />

      <div className="grid lg:grid-cols-5 gap-6">
        <Card className="lg:col-span-2 p-6 h-fit">
          <h3 className="font-semibold text-gray-800 mb-1 flex items-center gap-2">
            <GraduationCap size={15} className="text-violet-500" />
            {editId ? "Edit Education" : "Add New Education"}
          </h3>

          <p className="text-xs text-gray-400 mb-5">Fill in the details of your education</p>

          <div className="flex flex-col gap-4">
            <Field label="Degree / Qualification" required error={errors.degree}>
              <Input value={form.degree} onChange={(value) => setForm((prev) => ({ ...prev, degree: value }))} placeholder="e.g. Bachelor of Science" />
            </Field>

            <Field label="Field of Study" required>
              <Input value={form.field} onChange={(value) => setForm((prev) => ({ ...prev, field: value }))} placeholder="e.g. Computer Science" />
            </Field>

            <Field label="School / University" required error={errors.school}>
              <Input value={form.school} onChange={(value) => setForm((prev) => ({ ...prev, school: value }))} placeholder="e.g. Al-Azhar University" icon={<Building2 size={14} />} />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Start Date" required error={errors.startDate}>
                <Input value={form.startDate} onChange={(value) => setForm((prev) => ({ ...prev, startDate: value }))} type="date" icon={<Calendar size={14} />} />
              </Field>

              <Field label="End Date">
                <Input value={form.endDate} onChange={(value) => setForm((prev) => ({ ...prev, endDate: value }))} type="date" disabled={form.current} icon={<Calendar size={14} />} />
              </Field>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.current} onChange={(event) => setForm((prev) => ({ ...prev, current: event.target.checked, endDate: event.target.checked ? "" : prev.endDate }))} className="w-4 h-4 rounded border-gray-300 text-violet-600" />
              <span className="text-sm text-gray-600">I currently study here</span>
            </label>

            <Field label="Additional Notes">
              <Textarea value={form.description} onChange={(value) => setForm((prev) => ({ ...prev, description: value }))} placeholder="Add details about coursework, achievements, or honors..." rows={4} />
            </Field>

            {errors.root && <p className="text-sm text-red-500">{errors.root}</p>}

            <div className="flex gap-2">
              <Btn className="flex-1" onClick={handleSave} disabled={submitting}>
                {submitting ? <span>Saving...</span> : <>{editId ? <Check size={15} /> : <Plus size={15} />} {editId ? "Update" : "Save"}</>}
              </Btn>
              {editId && <Btn variant="outline" onClick={handleCancelEdit}>Cancel</Btn>}
            </div>
          </div>
        </Card>

        <div className="lg:col-span-3 flex flex-col gap-5">
          <Card className="p-6">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <GraduationCap size={15} className="text-violet-500" />
              Your Education ({education.length})
            </h3>

            {loading ? (
              <p className="text-sm text-gray-500">Loading education...</p>
            ) : education.length === 0 ? (
              <div className="py-8 text-center text-sm text-gray-500">No education added yet.</div>
            ) : (
              <div className="space-y-4">
                {education.map((item) => (
                  <div key={item.id} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold text-gray-900">{item.degree}</p>
                        <p className="text-sm text-violet-600">{item.university}</p>
                      </div>
                      <div className="flex gap-2">
                        <button type="button" onClick={() => handleEdit(item)} className="p-2 text-gray-500 hover:text-violet-600"><Edit2 size={14} /></button>
                        <button type="button" onClick={() => void handleDelete(item.id)} className="p-2 text-gray-500 hover:text-red-600"><Trash2 size={14} /></button>
                      </div>
                    </div>

                    <div className="mt-2 text-xs text-gray-500">
                      {item.field} · {formatDate(item.startDate)} {item.endDate ? `- ${formatDate(item.endDate)}` : "- Present"}
                    </div>

                    {item.description && <p className="mt-2 text-sm text-gray-600">{item.description}</p>}
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

