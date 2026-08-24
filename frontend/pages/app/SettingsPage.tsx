"use client";

import { useState } from "react";
import {
  User,
  Bell,
  Lock,
  Shield,
  Mail,
  MapPin,
  Upload,
  Check,
  Trash2,
  LogOut,
  Settings,
} from "lucide-react";

import { Btn } from "@/components/ui/Btn";
import { Card } from "@/components/ui/Card";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { PageHeader } from "@/components/ui/PageHeader";

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

const TABS: {
  id: Tab;
  label: string;
  icon: React.ReactNode;
}[] = [
  {
    id: "profile",
    label: "Profile",
    icon: <User size={15} />,
  },
  {
    id: "notifications",
    label: "Notifications",
    icon: <Bell size={15} />,
  },
  {
    id: "security",
    label: "Security",
    icon: <Lock size={15} />,
  },
  {
    id: "privacy",
    label: "Privacy",
    icon: <Shield size={15} />,
  },
];

interface SettingsPageProps {
  onLogout: () => void;
}

export default function SettingsPage({ onLogout }: SettingsPageProps) {
  const [tab, setTab] = useState<Tab>("profile");

  const [settings, setSettings] = useState<SettingsData>(INITIAL_SETTINGS);

  const [notifs, setNotifs] = useState({
    emailUpdates: true,
    cvTips: true,
    newTemplates: false,
  });

  const [saved, setSaved] = useState(false);

  const updateField = (key: keyof SettingsData, value: string) => {
    setSettings((prev) => ({
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

  const toggleNotification = (key: keyof typeof notifs) => {
    setNotifs((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
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
      <PageHeader
        icon={<Settings size={24} />}
        title="Settings"
        subtitle="Manage your account preferences"
      />

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
        {TABS.map((item) => (
          <button
            key={item.id}
            onClick={() => setTab(item.id)}
            className={`
              flex items-center gap-2
              px-4 py-2
              rounded-lg
              text-sm font-medium
              transition-all
              ${
                tab === item.id
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }
            `}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </div>

      {/* ================= PROFILE ================= */}
      {tab === "profile" && (
        <Card className="p-6">
          <h3 className="font-semibold text-gray-800 mb-5 flex items-center gap-2">
            <User size={16} className="text-violet-500" />
            Profile Settings
          </h3>

          {/* Profile Preview */}
          <div className="flex items-center gap-5 mb-6 pb-6 border-b border-gray-100">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white text-xl font-bold">
              {initials}
            </div>

            <div>
              <p className="font-medium text-gray-900">
                {settings.name || "Your Name"}
              </p>

              <p className="text-sm text-gray-400 mb-2">Profile photo</p>

              <Btn size="sm" variant="outline">
                <Upload size={13} />
                Upload new photo
              </Btn>
            </div>
          </div>

          {/* Form */}
          <div className="flex flex-col gap-4">
            <Field label="Full Name" required>
              <Input
                value={settings.name}
                onChange={(value) => updateField("name", value)}
                placeholder="Sarah Johnson"
              />
            </Field>

            <Field label="Email Address" required>
              <Input
                value={settings.email}
                onChange={(value) => updateField("email", value)}
                placeholder="you@email.com"
                type="email"
                icon={<Mail size={14} />}
              />
            </Field>

            <Field label="Professional Title">
              <Input
                value={settings.title}
                onChange={(value) => updateField("title", value)}
                placeholder="e.g. Senior Frontend Developer"
              />
            </Field>

            <Field label="Location">
              <Input
                value={settings.location}
                onChange={(value) => updateField("location", value)}
                placeholder="San Francisco, CA"
                icon={<MapPin size={14} />}
              />
            </Field>

            <div className="flex gap-3">
              <Btn onClick={handleSave}>
                {saved ? (
                  <>
                    <Check size={15} />
                    Saved!
                  </>
                ) : (
                  "Save Changes"
                )}
              </Btn>

              <Btn
                variant="outline"
                onClick={() => setSettings(INITIAL_SETTINGS)}
              >
                Cancel
              </Btn>
            </div>
          </div>
        </Card>
      )}

      {/* ================= NOTIFICATIONS ================= */}
      {tab === "notifications" && (
        <Card className="p-6">
          <h3 className="font-semibold text-gray-800 mb-5 flex items-center gap-2">
            <Bell size={16} className="text-violet-500" />
            Notification Preferences
          </h3>

          <div className="flex flex-col">
            {[
              {
                key: "emailUpdates" as const,
                label: "Email Updates",
                description: "Receive product updates and announcements",
              },
              {
                key: "cvTips" as const,
                label: "CV Improvement Tips",
                description: "Get tips to improve your CV score",
              },
              {
                key: "newTemplates" as const,
                label: "New Templates",
                description: "Be notified when new templates are available",
              },
            ].map((item) => (
              <div
                key={item.key}
                className="flex items-center justify-between py-4 border-b border-gray-50 last:border-0"
              >
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    {item.label}
                  </p>

                  <p className="text-xs text-gray-400 mt-0.5">
                    {item.description}
                  </p>
                </div>

                <button
                  onClick={() => toggleNotification(item.key)}
                  className={`
                    w-11 h-6
                    rounded-full
                    relative
                    transition-colors
                    ${notifs[item.key] ? "bg-violet-600" : "bg-gray-200"}
                  `}
                >
                  <span
                    className={`
                      absolute top-0.5
                      w-5 h-5
                      bg-white
                      rounded-full
                      shadow-sm
                      transition-transform
                      ${notifs[item.key] ? "translate-x-5" : "translate-x-0.5"}
                    `}
                  />
                </button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ================= SECURITY ================= */}
      {tab === "security" && (
        <Card className="p-6">
          <h3 className="font-semibold text-gray-800 mb-5 flex items-center gap-2">
            <Lock size={16} className="text-violet-500" />
            Security Settings
          </h3>

          <div className="flex flex-col gap-5">
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-gray-800">Password</p>

                <p className="text-xs text-gray-400 mt-0.5">
                  Keep your password secure and updated
                </p>
              </div>

              <Btn variant="outline" size="sm">
                <Lock size={13} />
                Change Password
              </Btn>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-gray-800">
                  Two-Factor Authentication
                </p>

                <p className="text-xs text-gray-400 mt-0.5">
                  Add an extra layer of security
                </p>
              </div>

              <Btn variant="secondary" size="sm">
                <Shield size={13} />
                Enable 2FA
              </Btn>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <p className="text-sm font-semibold text-gray-700 mb-3">
                Active Sessions
              </p>

              <div className="flex items-center justify-between py-3 border-b border-gray-50">
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    Current Browser
                  </p>

                  <p className="text-xs text-gray-400">Current session</p>
                </div>

                <span className="text-xs text-emerald-500 font-medium">
                  Active
                </span>
              </div>

              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    Previous Session
                  </p>

                  <p className="text-xs text-gray-400">Last active session</p>
                </div>

                <Btn size="sm" variant="danger">
                  Revoke
                </Btn>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* ================= PRIVACY ================= */}
      {tab === "privacy" && (
        <Card className="p-6">
          <h3 className="font-semibold text-gray-800 mb-5 flex items-center gap-2">
            <Shield size={16} className="text-violet-500" />
            Privacy Settings
          </h3>

          <div className="flex flex-col gap-5">
            <div className="p-4 bg-violet-50 border border-violet-100 rounded-xl">
              <p className="text-sm font-medium text-violet-800 mb-1">
                Data & Privacy
              </p>

              <p className="text-xs text-violet-700 leading-relaxed">
                Your CV data is stored securely. You can export your data or
                permanently delete your account at any time.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <Btn variant="outline" size="sm" className="w-fit">
                <Upload size={13} />
                Export My Data
              </Btn>

              <button className="text-sm text-red-500 hover:underline w-fit flex items-center gap-2">
                <Trash2 size={14} />
                Delete my account and all data
              </button>
            </div>
          </div>
        </Card>
      )}

      {/* ================= LOGOUT ================= */}
      <div className="mt-6 pt-5 border-t border-gray-200">
        <Btn variant="danger" onClick={onLogout}>
          <LogOut size={15} />
          Sign out
        </Btn>
      </div>
    </div>
  );
}
