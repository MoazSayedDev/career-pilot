import { useState } from "react";
import { User, Bell, Lock, Shield, Mail, MapPin, Upload, Check, Trash2, LogOut } from "lucide-react";
import { Btn } from "../../components/ui/Btn";
import { Card } from "../../components/ui/Card";
import { Field } from "../../components/ui/Field";
import { Input } from "../../components/ui/Input";
import { PageHeader } from "../../components/ui/PageHeader";
import { Settings } from "lucide-react";
import { cn } from "../../utils";

interface SettingsPageProps {
  onLogout: () => void;
}

type Tab = "profile" | "notifications" | "security" | "privacy";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "profile",       label: "Profile",       icon: <User size={15} /> },
  { id: "notifications", label: "Notifications", icon: <Bell size={15} /> },
  { id: "security",      label: "Security",      icon: <Lock size={15} /> },
  { id: "privacy",       label: "Privacy",       icon: <Shield size={15} /> },
];

export function SettingsPage({ onLogout }: SettingsPageProps) {
  const [tab, setTab] = useState<Tab>("profile");
  const [name, setName] = useState("Sarah Johnson");
  const [email, setEmail] = useState("sarah.johnson@email.com");
  const [notifs, setNotifs] = useState({ emailUpdates: true, cvTips: true, newTemplates: false });
  const [saved, setSaved] = useState(false);

  const toggleNotif = (key: keyof typeof notifs) =>
    setNotifs((n) => ({ ...n, [key]: !n[key] }));

  return (
    <div className="max-w-3xl">
      <PageHeader icon={<Settings size={24} />} title="Settings" subtitle="Manage your account preferences" />

      {/* Tab bar */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
              tab === t.id ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            )}
          >
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {/* Profile tab */}
      {tab === "profile" && (
        <Card className="p-6">
          <h3 className="font-semibold text-gray-800 mb-5">Profile Settings</h3>
          <div className="flex items-center gap-5 mb-6 pb-6 border-b border-gray-100">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
              SJ
            </div>
            <div>
              <p className="font-medium text-gray-900">Sarah Johnson</p>
              <p className="text-sm text-gray-400 mb-2">Profile photo</p>
              <Btn size="sm" variant="outline"><Upload size={13} />Upload new photo</Btn>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <Field label="Full Name">
              <Input value={name} onChange={setName} />
            </Field>
            <Field label="Email Address">
              <Input value={email} onChange={setEmail} type="email" icon={<Mail size={14} />} />
            </Field>
            <Field label="Professional Title">
              <Input value="Senior Frontend Developer" onChange={() => {}} />
            </Field>
            <Field label="Location">
              <Input value="San Francisco, CA" onChange={() => {}} icon={<MapPin size={14} />} />
            </Field>
            <div className="flex gap-3">
              <Btn onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000); }}>
                {saved ? <><Check size={15} />Saved!</> : "Save Changes"}
              </Btn>
              <Btn variant="outline">Cancel</Btn>
            </div>
          </div>
        </Card>
      )}

      {/* Notifications tab */}
      {tab === "notifications" && (
        <Card className="p-6">
          <h3 className="font-semibold text-gray-800 mb-5">Notification Preferences</h3>
          <div className="flex flex-col gap-1">
            {[
              { key: "emailUpdates" as const, label: "Email Updates",           desc: "Receive product updates and announcements" },
              { key: "cvTips"       as const, label: "CV Improvement Tips",      desc: "Get tips to improve your CV score" },
              { key: "newTemplates" as const, label: "New Templates",            desc: "Be notified when new templates are available" },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between py-4 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-800">{item.label}</p>
                  <p className="text-xs text-gray-400">{item.desc}</p>
                </div>
                <button
                  onClick={() => toggleNotif(item.key)}
                  className={cn(
                    "w-11 h-6 rounded-full transition-colors relative",
                    notifs[item.key] ? "bg-violet-600" : "bg-gray-200"
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform",
                      notifs[item.key] ? "translate-x-5" : "translate-x-0.5"
                    )}
                  />
                </button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Security tab */}
      {tab === "security" && (
        <Card className="p-6">
          <h3 className="font-semibold text-gray-800 mb-5">Security Settings</h3>
          <div className="flex flex-col gap-5">
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-800">Password</p>
                <p className="text-xs text-gray-400 mt-0.5">Last changed 3 months ago</p>
              </div>
              <Btn variant="outline" size="sm"><Lock size={13} />Change Password</Btn>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-800">Two-Factor Authentication</p>
                <p className="text-xs text-gray-400 mt-0.5">Add an extra layer of security</p>
              </div>
              <Btn variant="secondary" size="sm"><Shield size={13} />Enable 2FA</Btn>
            </div>
            <div className="pt-4 border-t border-gray-100">
              <p className="text-sm font-semibold text-gray-700 mb-3">Active Sessions</p>
              {[
                { device: "MacBook Pro · Chrome", location: "San Francisco, CA", time: "Current session" },
                { device: "iPhone 15 · Safari",   location: "San Francisco, CA", time: "2 hours ago" },
              ].map((s) => (
                <div key={s.device} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{s.device}</p>
                    <p className="text-xs text-gray-400">{s.location} · {s.time}</p>
                  </div>
                  {s.time !== "Current session" && (
                    <Btn size="sm" variant="danger">Revoke</Btn>
                  )}
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Privacy tab */}
      {tab === "privacy" && (
        <Card className="p-6">
          <h3 className="font-semibold text-gray-800 mb-5">Privacy Settings</h3>
          <div className="flex flex-col gap-4">
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <p className="text-sm font-medium text-amber-800 mb-1">Data & Privacy</p>
              <p className="text-xs text-amber-700">
                Your CV data is encrypted and stored securely. We never share your personal information with third parties.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <Btn variant="outline" size="sm" className="w-fit">
                <Upload size={13} />Export my data
              </Btn>
              <button className="text-sm text-red-500 hover:underline w-fit flex items-center gap-2">
                <Trash2 size={14} />Delete my account and all data
              </button>
            </div>
          </div>
        </Card>
      )}

      {/* Logout */}
      <div className="mt-6 pt-5 border-t border-gray-200">
        <Btn variant="danger" onClick={onLogout}>
          <LogOut size={15} />Sign out of all devices
        </Btn>
      </div>
    </div>
  );
}
