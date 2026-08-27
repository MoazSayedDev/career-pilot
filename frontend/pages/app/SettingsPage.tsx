"use client";

import { useEffect, useState } from "react";
import { User, Bell, Lock, Shield, Mail, MapPin, Upload, Check, Trash2, LogOut, Settings } from "lucide-react";

import { Btn } from "@/components/ui/Btn";
import { Card } from "@/components/ui/Card";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { PageHeader } from "@/components/ui/PageHeader";

import { logout } from "@/services/auth/api/auth.service";
import { getContactInfo, createContactInfo, updateContactInfo } from "@/services/contact-info/api/contact-info.api";
import { getProfile, updateProfile } from "@/services/profile/api/profile.service";

interface SettingsData {
  name: string;
  email: string;
  title: string;
  location: string;
}

const INITIAL_SETTINGS: SettingsData = {
  name: "",
  email: "",
  title: "",
  location: "",
};

type Tab = "profile" | "notifications" | "security" | "privacy";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "profile", label: "Profile", icon: <User size={15} /> },
  { id: "notifications", label: "Notifications", icon: <Bell size={15} /> },
  { id: "security", label: "Security", icon: <Lock size={15} /> },
  { id: "privacy", label: "Privacy", icon: <Shield size={15} /> },
];

interface SettingsPageProps {
  onLogout?: () => void;
}

export default function SettingsPage({ onLogout }: SettingsPageProps) {
  const [tab, setTab] = useState<Tab>("profile");
  const [settings, setSettings] = useState<SettingsData>(INITIAL_SETTINGS);
  const [notifs, setNotifs] = useState({ emailUpdates: true, cvTips: true, newTemplates: false });
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [profile, contact] = await Promise.all([getProfile().catch(() => null), getContactInfo().catch(() => null)]);
        const fullName = [profile?.firstName, profile?.lastName].filter(Boolean).join(" ");
        const location = [contact?.city, contact?.country].filter(Boolean).join(", ");
        setSettings({
          name: fullName,
          email: contact?.email ?? profile?.contactInfo?.email ?? "",
          title: profile?.headline ?? "",
          location,
        });
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  const updateField = (key: keyof SettingsData, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = async () => {
    try {
      const fullName = settings.name.trim();
      const [firstName, ...rest] = fullName.split(" ");
      const lastName = rest.join(" ");

      await updateProfile({
        firstName: firstName || "",
        lastName: lastName || "",
        headline: settings.title || undefined,
      });

      const city = settings.location.split(",")[0]?.trim() || undefined;
      const country = settings.location.includes(",") ? settings.location.split(",").slice(1).join(",").trim() : undefined;

      const contact = await getContactInfo().catch(() => null);
      const contactPayload = {
        email: settings.email || undefined,
        city,
        country,
      };

      if (contact) {
        await updateContactInfo(contactPayload);
      } else {
        await createContactInfo(contactPayload);
      }

      setSaved(true);
    } catch (error) {
      console.error(error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      onLogout?.();
    }
  };

  const initials =
    settings.name
      .split(" ")
      .filter(Boolean)
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?";

  return (
    <div className="max-w-3xl">
      <PageHeader icon={<Settings size={24} />} title="Settings" subtitle="Manage your account preferences" />

      <div className="flex flex-wrap gap-1 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
        {TABS.map((item) => (
          <button key={item.id} onClick={() => setTab(item.id)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === item.id ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
            {item.icon}
            {item.label}
          </button>
        ))}
      </div>

      {tab === "profile" && (
        <Card className="p-6">
          <h3 className="font-semibold text-gray-800 mb-5 flex items-center gap-2">
            <User size={16} className="text-violet-500" />
            Profile Settings
          </h3>

          <div className="flex items-center gap-5 mb-6 pb-6 border-b border-gray-100">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white text-xl font-bold">
              {initials}
            </div>
            <div>
              <p className="font-medium text-gray-900">{settings.name || "Your Name"}</p>
              <p className="text-sm text-gray-400 mb-2">Profile photo</p>
              <Btn size="sm" variant="outline">
                <Upload size={13} />
                Upload new photo
              </Btn>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <Field label="Full Name" required>
              <Input value={settings.name} onChange={(value) => updateField("name", value)} placeholder="Sarah Johnson" />
            </Field>

            <Field label="Email Address" required>
              <Input value={settings.email} onChange={(value) => updateField("email", value)} placeholder="you@email.com" type="email" icon={<Mail size={14} />} />
            </Field>

            <Field label="Professional Title">
              <Input value={settings.title} onChange={(value) => updateField("title", value)} placeholder="e.g. Senior Frontend Developer" />
            </Field>

            <Field label="Location">
              <Input value={settings.location} onChange={(value) => updateField("location", value)} placeholder="San Francisco, CA" icon={<MapPin size={14} />} />
            </Field>

            <div className="flex gap-3">
              <Btn onClick={() => void handleSave()} disabled={loading}>
                {saved ? <><Check size={15} />Saved!</> : "Save Changes"}
              </Btn>
              <Btn variant="outline" onClick={() => setSettings(INITIAL_SETTINGS)}>Cancel</Btn>
            </div>
          </div>
        </Card>
      )}

      {tab === "notifications" && (
        <Card className="p-6">
          <h3 className="font-semibold text-gray-800 mb-5 flex items-center gap-2">
            <Bell size={16} className="text-violet-500" />
            Notification Preferences
          </h3>
          <div className="flex flex-col">
            {[
              { key: "emailUpdates", label: "Email Updates", description: "Receive product updates and announcements" },
              { key: "cvTips", label: "CV Improvement Tips", description: "Get tips to improve your CV score" },
              { key: "newTemplates", label: "New Templates", description: "Get notified when new CV templates are added" },
            ].map((item) => (
              <button key={item.key} type="button" onClick={() => setNotifs((prev) => ({ ...prev, [item.key]: !prev[item.key as keyof typeof prev] }))} className="flex items-center justify-between py-4 border-b border-gray-100 text-left">
                <div>
                  <p className="font-medium text-gray-800">{item.label}</p>
                  <p className="text-sm text-gray-500">{item.description}</p>
                </div>
                <span className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${notifs[item.key as keyof typeof notifs] ? "bg-violet-600" : "bg-gray-200"}`}>
                  <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${notifs[item.key as keyof typeof notifs] ? "translate-x-6" : "translate-x-1"}`} />
                </span>
              </button>
            ))}
          </div>
        </Card>
      )}

      {tab === "security" && (
        <Card className="p-6">
          <h3 className="font-semibold text-gray-800 mb-5 flex items-center gap-2">
            <Lock size={16} className="text-violet-500" />
            Security
          </h3>
          <div className="space-y-4">
            <Field label="Current Password"><Input value="" onChange={() => {}} type="password" placeholder="••••••••" /></Field>
            <Field label="New Password"><Input value="" onChange={() => {}} type="password" placeholder="Enter new password" /></Field>
            <Field label="Confirm Password"><Input value="" onChange={() => {}} type="password" placeholder="Confirm new password" /></Field>
            <Btn>Update Password</Btn>
          </div>
        </Card>
      )}

      {tab === "privacy" && (
        <Card className="p-6">
          <h3 className="font-semibold text-gray-800 mb-5 flex items-center gap-2">
            <Shield size={16} className="text-violet-500" />
            Privacy & Account
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-xl border border-gray-200 p-4">
              <div>
                <p className="font-medium text-gray-800">Public profile</p>
                <p className="text-sm text-gray-500">Allow recruiters to view your profile</p>
              </div>
              <span className="relative inline-flex h-6 w-11 items-center rounded-full bg-violet-600"><span className="inline-block h-5 w-5 transform rounded-full bg-white translate-x-6" /></span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-gray-200 p-4">
              <div>
                <p className="font-medium text-gray-800">Data visibility</p>
                <p className="text-sm text-gray-500">Control whether your data is shared with third parties</p>
              </div>
              <Btn variant="outline">Manage</Btn>
            </div>
            <div className="border-t border-gray-100 pt-4 mt-4">
              <button type="button" className="text-red-600 font-medium inline-flex items-center gap-2"><Trash2 size={14} />Delete account</button>
            </div>
            <div className="border-t border-gray-100 pt-4 mt-4">
              <button type="button" onClick={() => void handleLogout()} className="text-gray-700 font-medium inline-flex items-center gap-2"><LogOut size={14} />Log out</button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
