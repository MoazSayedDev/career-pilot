"use client";

import { useState } from "react";
import {
  GraduationCap,
  MapPin,
  Calendar,
  Eye,
  Edit2,
  Trash2,
  Plus,
  Check,
  Building2,
} from "lucide-react";

import { Btn } from "@/components/ui/Btn";
import { Card } from "@/components/ui/Card";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { PageHeader } from "@/components/ui/PageHeader";
import { cn } from "@/utils";

type Education = {
  id: string;
  degree: string;
  field: string;
  school: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
};

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

export default function EducationPage() {
  const [form, setForm] = useState(EMPTY_FORM);

  const [education, setEducation] = useState<Education[]>([]);

  const [editId, setEditId] = useState<string | null>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const nextErrors: Record<string, string> = {};

    if (!form.degree.trim()) {
      nextErrors.degree = "Degree / qualification is required";
    }

    if (!form.school.trim()) {
      nextErrors.school = "School / university is required";
    }

    if (!form.startDate.trim()) {
      nextErrors.startDate = "Start date is required";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    if (editId) {
      setEducation((prev) =>
        prev.map((item) =>
          item.id === editId
            ? {
                ...form,
                id: editId,
              }
            : item,
        ),
      );

      setEditId(null);
    } else {
      const newEducation: Education = {
        ...form,
        id: crypto.randomUUID(),
      };

      setEducation((prev) => [newEducation, ...prev]);
    }

    setForm(EMPTY_FORM);
    setErrors({});
  };

  const handleEdit = (item: Education) => {
    setForm({
      degree: item.degree,
      field: item.field,
      school: item.school,
      location: item.location,
      startDate: item.startDate,
      endDate: item.endDate,
      current: item.current,
      description: item.description,
    });

    setEditId(item.id);
  };

  const handleDelete = (id: string) => {
    setEducation((prev) => prev.filter((item) => item.id !== id));
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
        {/* Form */}
        <Card className="lg:col-span-2 p-6 h-fit">
          <h3 className="font-semibold text-gray-800 mb-1 flex items-center gap-2">
            <GraduationCap size={15} className="text-violet-500" />

            {editId ? "Edit Education" : "Add New Education"}
          </h3>

          <p className="text-xs text-gray-400 mb-5">
            Fill in the details of your education
          </p>

          <div className="flex flex-col gap-4">
            <Field
              label="Degree / Qualification"
              required
              error={errors.degree}
            >
              <Input
                value={form.degree}
                onChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    degree: value,
                  }))
                }
                placeholder="e.g. Bachelor of Science"
              />
            </Field>

            <Field label="Field of Study" required>
              <Input
                value={form.field}
                onChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    field: value,
                  }))
                }
                placeholder="e.g. Computer Science"
              />
            </Field>

            <Field label="School / University" required error={errors.school}>
              <Input
                value={form.school}
                onChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    school: value,
                  }))
                }
                placeholder="e.g. Al-Azhar University"
                icon={<Building2 size={14} />}
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Start Date" required error={errors.startDate}>
                <Input
                  value={form.startDate}
                  onChange={(value) =>
                    setForm((prev) => ({
                      ...prev,
                      startDate: value,
                    }))
                  }
                  placeholder="MM/YYYY"
                  icon={<Calendar size={14} />}
                />
              </Field>

              <Field label="End Date">
                <Input
                  value={form.endDate}
                  onChange={(value) =>
                    setForm((prev) => ({
                      ...prev,
                      endDate: value,
                    }))
                  }
                  placeholder="MM/YYYY"
                  icon={<Calendar size={14} />}
                  disabled={form.current}
                />
              </Field>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.current}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    current: event.target.checked,
                    endDate: "",
                  }))
                }
                className="w-4 h-4 rounded border-gray-300 text-violet-600"
              />

              <span className="text-sm text-gray-600">Currently studying</span>
            </label>

            <Field label="Location">
              <Input
                value={form.location}
                onChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    location: value,
                  }))
                }
                placeholder="e.g. Cairo, Egypt"
                icon={<MapPin size={14} />}
              />
            </Field>

            <Field label="Description (Optional)">
              <Textarea
                value={form.description}
                onChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    description: value,
                  }))
                }
                placeholder="Relevant coursework, achievements, honors…"
                rows={3}
                maxLength={200}
              />
            </Field>

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
                    Add Education
                  </>
                )}
              </Btn>

              {editId && (
                <Btn variant="outline" onClick={handleCancelEdit}>
                  Cancel
                </Btn>
              )}
            </div>
          </div>
        </Card>

        {/* List + Preview */}
        <div className="lg:col-span-3 flex flex-col gap-5">
          <Card className="p-6">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <GraduationCap size={15} className="text-violet-500" />
              Your Education ({education.length})
            </h3>

            {education.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-3">
                  <GraduationCap size={22} className="text-gray-400" />
                </div>

                <p className="font-medium text-gray-600 mb-1">
                  No education added yet
                </p>

                <p className="text-sm text-gray-400">
                  Add your educational background using the form.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {education.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50"
                  >
                    <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
                      <GraduationCap size={18} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 text-sm">
                        {item.degree}
                      </h4>

                      {item.field && (
                        <p className="text-xs text-gray-500 mt-0.5">
                          {item.field}
                        </p>
                      )}

                      <p className="text-violet-600 text-xs font-medium mt-0.5">
                        {item.school}
                      </p>

                      <div className="flex items-center gap-3 mt-1">
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                          <Calendar size={10} />
                          {item.startDate} –{" "}
                          {item.current ? "Present" : item.endDate}
                        </span>

                        {item.location && (
                          <span className="flex items-center gap-1 text-xs text-gray-400">
                            <MapPin size={10} />

                            {item.location}
                          </span>
                        )}
                      </div>

                      {item.description && (
                        <p className="text-xs text-gray-500 mt-1.5 line-clamp-2">
                          {item.description}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <Btn
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(item)}
                      >
                        <Edit2 size={12} />
                        Edit
                      </Btn>

                      <Btn
                        size="sm"
                        variant="danger"
                        onClick={() => handleDelete(item.id)}
                      >
                        <Trash2 size={12} />
                        Delete
                      </Btn>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* CV Preview */}
          <Card className="p-6">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Eye size={15} className="text-violet-500" />
              Preview in CV
            </h3>

            <p className="text-xs text-gray-400 mb-4">
              This is how your education section will appear in your CV
            </p>

            <div className="border-t-2 border-violet-600 pt-4">
              <p className="text-xs font-bold tracking-widest text-violet-700 uppercase mb-3">
                Education
              </p>

              {education.length === 0 ? (
                <p className="text-xs text-gray-400 italic">
                  Add education to see the preview
                </p>
              ) : (
                education.map((item, index) => (
                  <div key={item.id} className="mb-4 flex gap-2">
                    <div
                      className={cn(
                        "w-2 h-2 rounded-full mt-1.5 flex-shrink-0",
                        index === 0 ? "bg-violet-600" : "bg-emerald-500",
                      )}
                    />

                    <div className="flex-1">
                      <div className="flex justify-between gap-4">
                        <p className="text-sm font-bold text-gray-900">
                          {item.degree}
                        </p>

                        <p className="text-xs text-gray-400 whitespace-nowrap">
                          {item.startDate} –{" "}
                          {item.current ? "Present" : item.endDate}
                        </p>
                      </div>

                      {item.field && (
                        <p className="text-xs text-gray-500">{item.field}</p>
                      )}

                      <p className="text-xs text-gray-500 italic">
                        {item.school}
                      </p>

                      {item.description && (
                        <p className="text-xs text-gray-600 mt-1">
                          {item.description}
                        </p>
                      )}
                    </div>
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
