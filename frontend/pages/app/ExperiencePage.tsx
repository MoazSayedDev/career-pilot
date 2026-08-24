import { useState } from "react";
import { Briefcase, MapPin, Calendar, ExternalLink, Edit2, Trash2, Plus, Check, Eye, ChevronDown } from "lucide-react";
import { Btn } from "../../components/ui/Btn";
import { Card } from "../../components/ui/Card";
import { Field } from "../../components/ui/Field";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { Textarea } from "../../components/ui/Textarea";
import { Badge } from "../../components/ui/Badge";
import { PageHeader } from "../../components/ui/PageHeader";
import { cn, uid } from "../../utils";
import type { CVData, ExperienceItem } from "../../types";

interface ExperiencePageProps {
  cvData: CVData;
  setCVData: (d: CVData) => void;
}

const EMPTY_FORM = {
  title: "", company: "", type: "", location: "",
  startDate: "", endDate: "", current: false, description: "",
};

export function ExperiencePage({ cvData, setCVData }: ExperiencePageProps) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.title)     e.title   = "Job title is required";
    if (!form.company)   e.company = "Company name is required";
    if (!form.startDate) e.startDate = "Start date is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    if (editId) {
      setCVData({ ...cvData, experiences: cvData.experiences.map((e) => e.id === editId ? { ...form, id: editId } : e) });
      setEditId(null);
    } else {
      setCVData({ ...cvData, experiences: [{ ...form, id: uid() }, ...cvData.experiences] });
    }
    setForm(EMPTY_FORM);
    setErrors({});
  };

  const handleEdit = (exp: ExperienceItem) => {
    setForm({ title: exp.title, company: exp.company, type: exp.type, location: exp.location, startDate: exp.startDate, endDate: exp.endDate, current: exp.current, description: exp.description });
    setEditId(exp.id);
  };

  const handleDelete = (id: string) =>
    setCVData({ ...cvData, experiences: cvData.experiences.filter((e) => e.id !== id) });

  const cancelEdit = () => { setEditId(null); setForm(EMPTY_FORM); setErrors({}); };

  return (
    <div>
      <PageHeader
        icon={<Briefcase size={24} />}
        title="Experience"
        subtitle="Add your work experience to showcase your professional journey"
        tipText="List your relevant work experience in reverse chronological order."
      />

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Form */}
        <Card className="lg:col-span-2 p-6 h-fit">
          <h3 className="font-semibold text-gray-800 mb-1 flex items-center gap-2">
            <Briefcase size={15} className="text-violet-500" />
            {editId ? "Edit Experience" : "Add New Experience"}
          </h3>
          <p className="text-xs text-gray-400 mb-5">Fill in the details of your work experience</p>

          <div className="flex flex-col gap-4">
            <Field label="Job Title" required error={errors.title}>
              <Input value={form.title} onChange={(v) => setForm((f) => ({ ...f, title: v }))} placeholder="e.g. Frontend Developer" />
            </Field>
            <Field label="Company Name" required error={errors.company}>
              <Input value={form.company} onChange={(v) => setForm((f) => ({ ...f, company: v }))} placeholder="e.g. Google" />
            </Field>
            <Field label="Employment Type">
              <Select value={form.type} onChange={(v) => setForm((f) => ({ ...f, type: v }))} options={["Full-time", "Part-time", "Contract", "Freelance", "Internship"]} placeholder="Select employment type" />
            </Field>
            <Field label="Location">
              <Input value={form.location} onChange={(v) => setForm((f) => ({ ...f, location: v }))} placeholder="e.g. San Francisco, CA" icon={<MapPin size={14} />} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Start Date" required error={errors.startDate}>
                <Input value={form.startDate} onChange={(v) => setForm((f) => ({ ...f, startDate: v }))} placeholder="MM/YYYY" icon={<Calendar size={14} />} />
              </Field>
              <Field label="End Date">
                <Input value={form.endDate} onChange={(v) => setForm((f) => ({ ...f, endDate: v }))} placeholder="MM/YYYY" icon={<Calendar size={14} />} disabled={form.current} />
              </Field>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.current}
                onChange={(e) => setForm((f) => ({ ...f, current: e.target.checked, endDate: "" }))}
                className="w-4 h-4 rounded border-gray-300 text-violet-600"
              />
              <span className="text-sm text-gray-600">I currently work here</span>
            </label>
            <Field label="Description" required>
              <Textarea value={form.description} onChange={(v) => setForm((f) => ({ ...f, description: v }))} placeholder="Describe your responsibilities and achievements…" rows={4} maxLength={500} />
            </Field>
            <div className="flex gap-2">
              <Btn className="flex-1" onClick={handleSave}>
                {editId ? <><Check size={15} />Update</> : <><Plus size={15} />Add Experience</>}
              </Btn>
              {editId && <Btn variant="outline" onClick={cancelEdit}>Cancel</Btn>}
            </div>
          </div>
        </Card>

        {/* List + CV Preview */}
        <div className="lg:col-span-3 flex flex-col gap-5">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <Briefcase size={15} className="text-violet-500" />
                Your Experiences ({cvData.experiences.length})
              </h3>
              {cvData.experiences.length > 0 && (
                <button className="flex items-center gap-1 text-xs text-gray-500 hover:text-violet-600">
                  Sort by: Newest First <ChevronDown size={12} />
                </button>
              )}
            </div>

            {cvData.experiences.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-3">
                  <Briefcase size={22} className="text-gray-400" />
                </div>
                <p className="font-medium text-gray-600 mb-1">No experience added yet</p>
                <p className="text-sm text-gray-400">Add your first work experience using the form on the left.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {cvData.experiences.map((exp) => (
                  <div key={exp.id} className="flex gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50 hover:border-gray-200 transition-colors">
                    <div className="w-12 h-12 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center flex-shrink-0">
                      <Briefcase size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-semibold text-gray-900 text-sm">{exp.title}</h4>
                          <p className="text-violet-600 text-xs font-medium mt-0.5">{exp.company}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="flex items-center gap-1 text-xs text-gray-400">
                              <Calendar size={10} />{exp.startDate} – {exp.current ? "Present" : exp.endDate}
                            </span>
                            {exp.location && (
                              <span className="flex items-center gap-1 text-xs text-gray-400">
                                <MapPin size={10} />{exp.location}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-1.5 leading-relaxed line-clamp-2">
                            {exp.description}
                          </p>
                        </div>
                        {exp.type && <Badge color="violet">{exp.type}</Badge>}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5 flex-shrink-0">
                      <Btn size="sm" variant="outline" onClick={() => handleEdit(exp)}>
                        <Edit2 size={12} />Edit
                      </Btn>
                      <Btn size="sm" variant="danger" onClick={() => handleDelete(exp.id)}>
                        <Trash2 size={12} />Delete
                      </Btn>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* CV Preview */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <Eye size={15} className="text-violet-500" />Preview in CV
              </h3>
              <Btn size="sm" variant="ghost"><ExternalLink size={13} />Preview Full CV</Btn>
            </div>
            <p className="text-xs text-gray-400 mb-4">This is how your experience section will appear in your CV</p>
            <div className="border-t-2 border-violet-600 pt-4">
              <p className="text-xs font-bold tracking-widest text-violet-700 uppercase mb-3">Experience</p>
              {cvData.experiences.length === 0 ? (
                <p className="text-xs text-gray-400 italic">Add experience to see the preview</p>
              ) : cvData.experiences.map((exp, i) => (
                <div key={exp.id} className="mb-4 flex gap-2">
                  <div className={cn("w-2 h-2 rounded-full mt-1.5 flex-shrink-0", i === 0 ? "bg-violet-600" : "bg-emerald-500")} />
                  <div>
                    <p className="text-sm font-bold text-gray-900">{exp.title}</p>
                    <p className="text-xs text-gray-500 italic">{exp.company}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {exp.startDate} – {exp.current ? "Present" : exp.endDate}
                      {exp.location && ` | ${exp.location}`}
                    </p>
                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">{exp.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
