"use client";

import { useEffect, useState } from "react";
import { User, Mail, Phone, MapPin, Globe, Link as LinkIcon, Check } from "lucide-react";

import { Btn } from "@/components/ui/Btn";
import { Card } from "@/components/ui/Card";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { PageHeader } from "@/components/ui/PageHeader";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import {
  getProfile,
  updateProfile,
  createProfile,
} from "@/services/profile/api/profile.service";
import { profileSchema, ProfileFormData } from "@/services/profile/schemas/profile.schema";

import {
  getContactInfo,
  createContactInfo,
  updateContactInfo,
} from "@/services/contact-info/api/contact-info.api";
import {
  contactInfoSchema,
  ContactInfoFormData,
} from "@/services/contact-info/schemas/contact-info.schema";

import {
  LinkType,
  type ContactInfo,
  type CreateContactInfoDto,
} from "@/services/contact-info/types/contact-info";
import type { ProfileResponse } from "@/services/profile/types/profile";

const LOADING_INITIAL: PersonalInfo = {
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

export default function PersonalInfoPage() {
  const [personalInfoPreview, setPersonalInfoPreview] = useState<PersonalInfo>(LOADING_INITIAL);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      headline: "",
      bio: "",
      image: "",
    },
  });

  const contactForm = useForm<ContactInfoFormData>({
    resolver: zodResolver(contactInfoSchema),
    defaultValues: {
      phone: "",
      email: "",
      country: "",
      city: "",
      links: [],
    },
  });

  // Track existing contactInfo id to decide create vs update
  const [existingContactInfo, setExistingContactInfo] = useState<ContactInfo | null>(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const [profileResp, contactResp] = await Promise.allSettled([getProfile(), getContactInfo()]);

        if (!mounted) return;

        if (profileResp.status === "fulfilled" && profileResp.value) {
          const p: ProfileResponse = profileResp.value as ProfileResponse;
          profileForm.reset({
            firstName: p.firstName ?? "",
            lastName: p.lastName ?? "",
            headline: p.headline ?? "",
            bio: p.bio ?? "",
            image: p.image ?? "",
          });

          setPersonalInfoPreview((prev) => ({
            ...prev,
            firstName: p.firstName ?? "",
            lastName: p.lastName ?? "",
            title: p.headline ?? "",
            summary: p.bio ?? "",
          }));
        }

        if (contactResp.status === "fulfilled" && contactResp.value) {
          const c = contactResp.value as ContactInfo;
          setExistingContactInfo(c);

          contactForm.reset({
            phone: c.phone ?? "",
            email: c.email ?? "",
            country: c.country ?? "",
            city: c.city ?? "",
            links: c.links ?? [],
          });

          // Extract known links for preview form fields
          const links = c.links ?? [];
          const linkedin = links.find((l) => l.type === "LINKEDIN")?.url ?? "";
          const github = links.find((l) => l.type === "GITHUB")?.url ?? "";
          const portfolio = links.find((l) => l.type === "PORTFOLIO")?.url ?? "";

          setPersonalInfoPreview((prev) => ({
            ...prev,
            email: c.email ?? prev.email,
            phone: c.phone ?? prev.phone,
            website: portfolio,
            linkedin,
            github,
            location: c.city ? `${c.city}${c.country ? ", " + c.country : ""}` : prev.location,
          }));
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, []);

  const onSubmit = async () => {
    setSaving(true);
    setError(null);

    try {
      // Validate both forms (resolvers already run on submit trigger)
      const profileValues = profileForm.getValues();
      const contactValues = contactForm.getValues();

      // Update or create profile
      try {
        await updateProfile(profileValues);
      } catch (err) {
        // If profile doesn't exist, create it
        await createProfile(profileValues);
      }

      const links: CreateContactInfoDto["links"] = [];
      const website = personalInfoPreview.website.trim();
      if (website) {
        links.push({ type: LinkType.PORTFOLIO, url: website });
      }

      const linkedin = personalInfoPreview.linkedin.trim();
      if (linkedin) {
        links.push({ type: LinkType.LINKEDIN, url: linkedin });
      }

      const github = personalInfoPreview.github.trim();
      if (github) {
        links.push({ type: LinkType.GITHUB, url: github });
      }

      const contactDto: CreateContactInfoDto = {
        phone: contactValues.phone || undefined,
        email: contactValues.email || undefined,
        country: contactValues.country || undefined,
        city: contactValues.city || undefined,
        links: links.length ? links : undefined,
      };

      if (existingContactInfo && existingContactInfo.id) {
        await updateContactInfo(contactDto);
      } else {
        await createContactInfo(contactDto);
      }

      // Update preview state from current form values
      const namePreview = `${profileValues.firstName || ""}`;
      setPersonalInfoPreview((prev) => ({
        ...prev,
        firstName: profileValues.firstName || "",
        lastName: profileValues.lastName || "",
        title: profileValues.headline || "",
        summary: profileValues.bio || "",
        email: contactValues.email || prev.email,
        phone: contactValues.phone || prev.phone,
        website: prev.website,
        linkedin: prev.linkedin,
        github: prev.github,
      }));

      setSaved(true);
      setTimeout(() => setSaved(false), 1800);
    } catch (err) {
      console.error(err);
      setError("Failed to save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const profileItems = [
    {
      label: "Name",
      done:
        !!(
          profileForm.getValues("firstName") && profileForm.getValues("lastName")
        ),
    },
    {
      label: "Professional title",
      done: !!profileForm.getValues("headline"),
    },
    {
      label: "Email",
      done: !!contactForm.getValues("email"),
    },
    {
      label: "Phone",
      done: !!contactForm.getValues("phone"),
    },
    {
      label: "Location",
      done: !!(contactForm.getValues("city") || contactForm.getValues("country")),
    },
    {
      label: "Summary",
      done: !!profileForm.getValues("bio"),
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
                  value={profileForm.watch("firstName") ?? ""}
                  onChange={(v) => {
                    profileForm.setValue("firstName", v);
                    setPersonalInfoPreview((prev) => ({ ...prev, firstName: v }));
                  }}
                  placeholder="Sarah"
                />
              </Field>

              <Field label="Last Name" required>
                <Input
                  value={profileForm.watch("lastName") ?? ""}
                  onChange={(v) => {
                    profileForm.setValue("lastName", v);
                    setPersonalInfoPreview((prev) => ({ ...prev, lastName: v }));
                  }}
                  placeholder="Johnson"
                />
              </Field>
            </div>

            <Field label="Professional Title" required>
              <Input
                value={profileForm.watch("headline") ?? ""}
                onChange={(v) => {
                  profileForm.setValue("headline", v);
                  setPersonalInfoPreview((prev) => ({ ...prev, title: v }));
                }}
                placeholder="e.g. Senior Frontend Developer"
              />
            </Field>

            <Field label="Email Address" required>
              <Input
                value={contactForm.watch("email") ?? ""}
                onChange={(v) => {
                  contactForm.setValue("email", v);
                  setPersonalInfoPreview((prev) => ({ ...prev, email: v }));
                }}
                placeholder="you@email.com"
                type="email"
                icon={<Mail size={14} />}
              />
            </Field>

            <Field label="Phone Number">
              <Input
                value={contactForm.watch("phone") ?? ""}
                onChange={(v) => {
                  contactForm.setValue("phone", v);
                  setPersonalInfoPreview((prev) => ({ ...prev, phone: v }));
                }}
                placeholder="+1 (555) 234-5678"
                icon={<Phone size={14} />}
              />
            </Field>

            <Field label="Location">
              <Input
                value={contactForm.watch("city") ?? ""}
                onChange={(v) => {
                  contactForm.setValue("city", v);
                  setPersonalInfoPreview((prev) => ({ ...prev, location: v }));
                }}
                placeholder="San Francisco, CA"
                icon={<MapPin size={14} />}
              />
            </Field>

            <Field label="Website / Portfolio">
              <Input
                value={personalInfoPreview.website}
                onChange={(v) => setPersonalInfoPreview((prev) => ({ ...prev, website: v }))}
                placeholder="https://yoursite.com"
                icon={<Globe size={14} />}
              />
            </Field>

            <Field label="LinkedIn Profile">
              <Input
                value={personalInfoPreview.linkedin}
                onChange={(v) => setPersonalInfoPreview((prev) => ({ ...prev, linkedin: v }))}
                placeholder="linkedin.com/in/yourname"
                icon={<LinkIcon size={14} />}
              />
            </Field>

            <Field label="GitHub Profile">
              <Input
                value={personalInfoPreview.github}
                onChange={(v) => setPersonalInfoPreview((prev) => ({ ...prev, github: v }))}
                placeholder="github.com/yourname"
                icon={<LinkIcon size={14} />}
              />
            </Field>

            <Field
              label="Professional Summary"
              hint="A brief 2-3 sentence overview of your professional background"
            >
              <Textarea
                value={profileForm.watch("bio") ?? ""}
                onChange={(v) => {
                  profileForm.setValue("bio", v);
                  setPersonalInfoPreview((prev) => ({ ...prev, summary: v }));
                }}
                placeholder="Describe your professional background and key strengths…"
                rows={4}
                maxLength={1000}
              />
            </Field>

            <div className="flex items-center gap-3">
              <Btn onClick={onSubmit} disabled={saving}>
                {saving ? (
                  "Saving..."
                ) : saved ? (
                  <>
                    <Check size={16} />
                    Saved!
                  </>
                ) : (
                  "Save Personal Info"
                )}
              </Btn>

              {error && <span className="text-sm text-red-600">{error}</span>}
            </div>
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
                {personalInfoPreview.firstName?.[0] || "?"}
                {personalInfoPreview.lastName?.[0] || ""}
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {personalInfoPreview.firstName || "First"} {" "}
                  {personalInfoPreview.lastName || "Last"}
                </h2>

                <p className="text-violet-600 font-medium text-sm">
                  {personalInfoPreview.title || "Professional Title"}
                </p>

                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                  {personalInfoPreview.email && (
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <Mail size={11} />
                      {personalInfoPreview.email}
                    </span>
                  )}

                  {personalInfoPreview.phone && (
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <Phone size={11} />
                      {personalInfoPreview.phone}
                    </span>
                  )}

                  {personalInfoPreview.location && (
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <MapPin size={11} />
                      {personalInfoPreview.location}
                    </span>
                  )}
                </div>

                {personalInfoPreview.summary && (
                  <p className="mt-3 text-xs text-gray-600 leading-relaxed">
                    {personalInfoPreview.summary}
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
