import { useState } from "react";
import { User, Mail, Phone, MapPin, Globe, Link, Check } from "lucide-react";
import { Btn } from "../../components/ui/Btn";
import { Card } from "../../components/ui/Card";
import { Field } from "../../components/ui/Field";
import { Input } from "../../components/ui/Input";
import { Textarea } from "../../components/ui/Textarea";
import { PageHeader } from "../../components/ui/PageHeader";
import type { CVData } from "../../types";

interface PersonalInfoPageProps {
  cvData: CVData;
  setCVData: (d: CVData) => void;
}

export function PersonalInfoPage({ cvData, setCVData }: PersonalInfoPageProps) {
  const p = cvData.personalInfo;
  const [saved, setSaved] = useState(false);

  const set = (k: string, v: string) =>
    setCVData({ ...cvData, personalInfo: { ...p, [k]: v } });

  const save = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div>
      <PageHeader
        icon={<User size={24} />}
        title="Personal Info"
        subtitle="Your basic contact information and professional details"
        tipText="Use a professional email and include your LinkedIn profile to increase your chances."
      />

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Form */}
        <Card className="p-6">
          <h3 className="font-semibold text-gray-800 mb-5 flex items-center gap-2">
            <User size={16} className="text-violet-500" />Basic Information
          </h3>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <Field label="First Name" required>
                <Input value={p.firstName} onChange={(v) => set("firstName", v)} placeholder="Sarah" />
              </Field>
              <Field label="Last Name" required>
                <Input value={p.lastName} onChange={(v) => set("lastName", v)} placeholder="Johnson" />
              </Field>
            </div>
            <Field label="Professional Title" required>
              <Input value={p.title} onChange={(v) => set("title", v)} placeholder="e.g. Senior Frontend Developer" />
            </Field>
            <Field label="Email Address" required>
              <Input value={p.email} onChange={(v) => set("email", v)} placeholder="you@email.com" type="email" icon={<Mail size={14} />} />
            </Field>
            <Field label="Phone Number">
              <Input value={p.phone} onChange={(v) => set("phone", v)} placeholder="+1 (555) 234-5678" icon={<Phone size={14} />} />
            </Field>
            <Field label="Location">
              <Input value={p.location} onChange={(v) => set("location", v)} placeholder="San Francisco, CA" icon={<MapPin size={14} />} />
            </Field>
            <Field label="Website / Portfolio">
              <Input value={p.website} onChange={(v) => set("website", v)} placeholder="https://yoursite.com" icon={<Globe size={14} />} />
            </Field>
            <Field label="LinkedIn Profile">
              <Input value={p.linkedin} onChange={(v) => set("linkedin", v)} placeholder="linkedin.com/in/yourname" icon={<Link size={14} />} />
            </Field>
            <Field label="GitHub Profile">
              <Input value={p.github} onChange={(v) => set("github", v)} placeholder="github.com/yourname" icon={<Link size={14} />} />
            </Field>
            <Field label="Professional Summary" hint="A brief 2-3 sentence overview of your professional background">
              <Textarea value={p.summary} onChange={(v) => set("summary", v)} placeholder="Describe your professional background and key strengths…" rows={4} maxLength={300} />
            </Field>
            <Btn onClick={save}>
              {saved ? <><Check size={16} />Saved!</> : "Save Personal Info"}
            </Btn>
          </div>
        </Card>

        {/* Preview + Strength */}
        <div className="flex flex-col gap-4">
          <Card className="p-5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Live Preview</p>
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                {p.firstName?.[0] || "?"}{p.lastName?.[0] || ""}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {p.firstName || "First"} {p.lastName || "Last"}
                </h2>
                <p className="text-violet-600 font-medium text-sm">{p.title || "Professional Title"}</p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                  {p.email && <span className="flex items-center gap-1 text-xs text-gray-500"><Mail size={11} />{p.email}</span>}
                  {p.phone && <span className="flex items-center gap-1 text-xs text-gray-500"><Phone size={11} />{p.phone}</span>}
                  {p.location && <span className="flex items-center gap-1 text-xs text-gray-500"><MapPin size={11} />{p.location}</span>}
                </div>
                {p.summary && <p className="mt-3 text-xs text-gray-600 leading-relaxed">{p.summary}</p>}
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Profile Strength</p>
            {[
              { label: "Name",              done: !!(p.firstName && p.lastName) },
              { label: "Professional title", done: !!p.title },
              { label: "Email",             done: !!p.email },
              { label: "Phone",             done: !!p.phone },
              { label: "Location",          done: !!p.location },
              { label: "Summary",           done: !!p.summary },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                <span className="text-sm text-gray-600">{item.label}</span>
                {item.done ? (
                  <span className="text-emerald-500 flex items-center gap-1 text-xs"><Check size={12} />Done</span>
                ) : (
                  <span className="text-gray-300 text-xs">Missing</span>
                )}
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}
