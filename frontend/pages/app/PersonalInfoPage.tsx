"use client";

import { useState } from "react";
import { User, Mail, Phone, MapPin, Globe, Link, Check } from "lucide-react";

import { Btn } from "@/components/ui/Btn";
import { Card } from "@/components/ui/Card";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { PageHeader } from "@/components/ui/PageHeader";

interface PersonalInfo {
  firstName: string;
  lastName: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  linkedin: string;
  github: string;
  summary: string;
}

const INITIAL_DATA: PersonalInfo = {
  firstName: "",
  lastName: "",
  title: "",
  email: "",
  phone: "",
  location: "",
  website: "",
  linkedin: "",
  github: "",
  summary: "",
};

export default function PersonalInfoPage() {
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>(INITIAL_DATA);

  const [saved, setSaved] = useState(false);

  const updateField = (key: keyof PersonalInfo, value: string) => {
    setPersonalInfo((prev) => ({
      ...prev,
      [key]: value,
    }));

    setSaved(false);
  };

  const handleSave = () => {
    // TODO: Replace with API request
    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2000);
  };

  const profileItems = [
    {
      label: "Name",
      done: !!(personalInfo.firstName && personalInfo.lastName),
    },
    {
      label: "Professional title",
      done: !!personalInfo.title,
    },
    {
      label: "Email",
      done: !!personalInfo.email,
    },
    {
      label: "Phone",
      done: !!personalInfo.phone,
    },
    {
      label: "Location",
      done: !!personalInfo.location,
    },
    {
      label: "Summary",
      done: !!personalInfo.summary,
    },
  ];

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
            <User size={16} className="text-violet-500" />
            Basic Information
          </h3>

          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <Field label="First Name" required>
                <Input
                  value={personalInfo.firstName}
                  onChange={(value) => updateField("firstName", value)}
                  placeholder="Sarah"
                />
              </Field>

              <Field label="Last Name" required>
                <Input
                  value={personalInfo.lastName}
                  onChange={(value) => updateField("lastName", value)}
                  placeholder="Johnson"
                />
              </Field>
            </div>

            <Field label="Professional Title" required>
              <Input
                value={personalInfo.title}
                onChange={(value) => updateField("title", value)}
                placeholder="e.g. Senior Frontend Developer"
              />
            </Field>

            <Field label="Email Address" required>
              <Input
                value={personalInfo.email}
                onChange={(value) => updateField("email", value)}
                placeholder="you@email.com"
                type="email"
                icon={<Mail size={14} />}
              />
            </Field>

            <Field label="Phone Number">
              <Input
                value={personalInfo.phone}
                onChange={(value) => updateField("phone", value)}
                placeholder="+1 (555) 234-5678"
                icon={<Phone size={14} />}
              />
            </Field>

            <Field label="Location">
              <Input
                value={personalInfo.location}
                onChange={(value) => updateField("location", value)}
                placeholder="San Francisco, CA"
                icon={<MapPin size={14} />}
              />
            </Field>

            <Field label="Website / Portfolio">
              <Input
                value={personalInfo.website}
                onChange={(value) => updateField("website", value)}
                placeholder="https://yoursite.com"
                icon={<Globe size={14} />}
              />
            </Field>

            <Field label="LinkedIn Profile">
              <Input
                value={personalInfo.linkedin}
                onChange={(value) => updateField("linkedin", value)}
                placeholder="linkedin.com/in/yourname"
                icon={<Link size={14} />}
              />
            </Field>

            <Field label="GitHub Profile">
              <Input
                value={personalInfo.github}
                onChange={(value) => updateField("github", value)}
                placeholder="github.com/yourname"
                icon={<Link size={14} />}
              />
            </Field>

            <Field
              label="Professional Summary"
              hint="A brief 2-3 sentence overview of your professional background"
            >
              <Textarea
                value={personalInfo.summary}
                onChange={(value) => updateField("summary", value)}
                placeholder="Describe your professional background and key strengths…"
                rows={4}
                maxLength={300}
              />
            </Field>

            <Btn onClick={handleSave}>
              {saved ? (
                <>
                  <Check size={16} />
                  Saved!
                </>
              ) : (
                "Save Personal Info"
              )}
            </Btn>
          </div>
        </Card>

        {/* Preview + Strength */}
        <div className="flex flex-col gap-4">
          {/* Live Preview */}
          <Card className="p-5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Live Preview
            </p>

            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                {personalInfo.firstName?.[0] || "?"}
                {personalInfo.lastName?.[0] || ""}
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {personalInfo.firstName || "First"}{" "}
                  {personalInfo.lastName || "Last"}
                </h2>

                <p className="text-violet-600 font-medium text-sm">
                  {personalInfo.title || "Professional Title"}
                </p>

                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                  {personalInfo.email && (
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <Mail size={11} />
                      {personalInfo.email}
                    </span>
                  )}

                  {personalInfo.phone && (
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <Phone size={11} />
                      {personalInfo.phone}
                    </span>
                  )}

                  {personalInfo.location && (
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <MapPin size={11} />
                      {personalInfo.location}
                    </span>
                  )}
                </div>

                {personalInfo.summary && (
                  <p className="mt-3 text-xs text-gray-600 leading-relaxed">
                    {personalInfo.summary}
                  </p>
                )}
              </div>
            </div>
          </Card>

          {/* Profile Strength */}
          <Card className="p-5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Profile Strength
            </p>

            {profileItems.map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0"
              >
                <span className="text-sm text-gray-600">{item.label}</span>

                {item.done ? (
                  <span className="text-emerald-500 flex items-center gap-1 text-xs">
                    <Check size={12} />
                    Done
                  </span>
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
