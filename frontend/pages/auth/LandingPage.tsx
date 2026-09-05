"use client";
import { useRouter } from "next/navigation";
import { Btn } from "@/components/ui/Btn";
import { Card } from "@/components/ui/Card";
import { LogoMark } from "@/components/ui/Logo";
import { LanguageSwitcher, ThemeToggle } from "@/components/layout/Controls";
import { useI18n } from "@/lib/i18n/I18nProvider";
import {
  Sparkles,
  Wand2,
  LayoutTemplate,
  Eye,
  Download,
  Shield,
  ArrowRight,
  Pencil,
} from "lucide-react";

function AppPreviewMockup() {
  const { t } = useI18n();

  const sidebarItems = [
    t("landing.mockup.dashboard"),
    t("landing.mockup.personalInfo"),
    t("landing.mockup.experience"),
    t("landing.mockup.education"),
    t("landing.mockup.skills"),
  ];

  return (
    <div className="flex bg-[#f8fafc] h-72 dark:bg-gray-800">
      <div className="w-40 bg-white border-e border-gray-200 flex-shrink-0 p-3 flex flex-col gap-1 dark:bg-gray-900 dark:border-gray-700">
        {sidebarItems.map((item, i) => (
          <div
            key={item}
            className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs ${
              i === 2
                ? "bg-blue-700 text-white"
                : "text-gray-500 dark:text-gray-400"
            }`}
          >
            <div className="w-3 h-3 rounded-sm bg-current opacity-60" />
            {item}
          </div>
        ))}
      </div>
      <div className="flex-1 p-4 overflow-hidden">
        <div className="flex gap-3 h-full">
          <div className="flex-1 bg-white rounded-xl border border-gray-200 p-3 dark:bg-gray-900 dark:border-gray-700">
            <div className="text-xs font-semibold text-gray-700 mb-2 dark:text-gray-200">
              {t("landing.mockup.addExperience")}
            </div>
            {[
              t("landing.mockup.jobTitle"),
              t("landing.mockup.companyName"),
              t("landing.mockup.location"),
            ].map((f) => (
              <div key={f} className="mb-2">
                <div className="text-[10px] text-gray-400 mb-0.5 dark:text-gray-500">
                  {f}
                </div>
                <div className="h-6 rounded-md border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800" />
              </div>
            ))}
            <div className="mt-3 h-7 rounded-lg bg-blue-700" />
          </div>
          <div className="flex-1 bg-white rounded-xl border border-gray-200 p-3 dark:bg-gray-900 dark:border-gray-700">
            <div className="text-xs font-semibold text-gray-700 mb-2 dark:text-gray-200">
              {t("landing.mockup.yourExperiences")}
            </div>
            {[t("landing.mockup.exp1"), t("landing.mockup.exp2")].map((e) => (
              <div
                key={e}
                className="mb-2 p-2 rounded-lg border border-gray-100 bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
              >
                <div className="text-[10px] font-medium text-gray-700 dark:text-gray-300">
                  {e}
                </div>
                <div className="flex gap-1 mt-1">
                  <div className="px-1.5 py-0.5 rounded border border-gray-200 text-[9px] text-gray-500 dark:border-gray-600 dark:text-gray-400">
                    {t("landing.mockup.edit")}
                  </div>
                  <div className="px-1.5 py-0.5 rounded border border-red-200 text-[9px] text-red-500 dark:border-red-500/40">
                    {t("landing.mockup.delete")}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const router = useRouter();
  const { t } = useI18n();

  const features = [
    {
      icon: <Wand2 size={22} />,
      title: t("landing.features.aiCvTitle"),
      desc: t("landing.features.aiCvDesc"),
    },
    {
      icon: <LayoutTemplate size={22} />,
      title: t("landing.features.templatesTitle"),
      desc: t("landing.features.templatesDesc"),
    },
    {
      icon: <Eye size={22} />,
      title: t("landing.features.livePreviewTitle"),
      desc: t("landing.features.livePreviewDesc"),
    },
    {
      icon: <Download size={22} />,
      title: t("landing.features.pdfTitle"),
      desc: t("landing.features.pdfDesc"),
    },
    {
      icon: <Shield size={22} />,
      title: t("landing.features.atsTitle"),
      desc: t("landing.features.atsDesc"),
    },
    {
      icon: <Sparkles size={22} />,
      title: t("landing.features.summaryTitle"),
      desc: t("landing.features.summaryDesc"),
    },
  ];

  const steps = [
    {
      step: "1",
      title: t("landing.how.step1Title"),
      desc: t("landing.how.step1Desc"),
    },
    {
      step: "2",
      title: t("landing.how.step2Title"),
      desc: t("landing.how.step2Desc"),
    },
    {
      step: "3",
      title: t("landing.how.step3Title"),
      desc: t("landing.how.step3Desc"),
    },
  ];

  return (
    <div className="min-h-screen bg-white font-sans dark:bg-gray-950">
      {/* Navbar */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100 dark:bg-gray-950/90 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <LogoMark size={32} />
            <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
              CareerPilot
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-600 dark:text-gray-400">
            <a
              href="#features"
              className="hover:text-blue-700 transition-colors dark:hover:text-blue-400"
            >
              {t("landing.nav.features")}
            </a>
            <a
              href="#how"
              className="hover:text-blue-700 transition-colors dark:hover:text-blue-400"
            >
              {t("landing.nav.howItWorks")}
            </a>
            <a
              href="#templates"
              className="hover:text-blue-700 transition-colors dark:hover:text-blue-400"
            >
              {t("landing.nav.templates")}
            </a>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />

            <ThemeToggle />

            {/* Hidden on phones so the navbar never overflows the viewport */}
            <div className="hidden sm:block">
              <Btn variant="ghost" onClick={() => router.push("/login")}>
                {t("landing.nav.signIn")}
              </Btn>
            </div>
            <Btn variant="primary" onClick={() => router.push("/register")}>
              {t("landing.nav.getStarted")}
            </Btn>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full px-4 py-1.5 text-sm text-blue-800 font-medium mb-8 dark:bg-blue-500/10 dark:border-blue-500/30 dark:text-blue-300">
            <Sparkles size={14} />
            {t("landing.hero.badge")}
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-6 dark:text-gray-100">
            {t("landing.hero.title1")}
            <br />
            <span className="text-blue-700 dark:text-blue-400">
              {t("landing.hero.title2")}
            </span>
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed dark:text-gray-400">
            {t("landing.hero.subtitle")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Btn size="lg" onClick={() => router.push("/register")}>
              <Sparkles size={18} />
              {t("landing.hero.generateWithAi")}
            </Btn>
            <Btn
              size="lg"
              variant="outline"
              onClick={() => router.push("/register")}
            >
              <Pencil size={18} />
              {t("landing.hero.buildManually")}
            </Btn>
          </div>
          <p className="mt-4 text-sm text-gray-400 dark:text-gray-500">
            {t("landing.hero.freeNote")}
          </p>
        </div>

        {/* App preview */}
        <div className="max-w-5xl mx-auto mt-16 rounded-2xl overflow-hidden border border-gray-200 shadow-2xl shadow-blue-100 dark:border-gray-800 dark:shadow-blue-950/50">
          <div className="bg-gray-100 border-b border-gray-200 px-4 py-3 flex items-center gap-2 dark:bg-gray-800 dark:border-gray-700">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-amber-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
            <div className="ms-4 flex-1 bg-white rounded-md px-3 py-1 text-xs text-gray-400 max-w-xs dark:bg-gray-900 dark:text-gray-500">
              careerpilot.app/dashboard
            </div>
          </div>
          <AppPreviewMockup />
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-gray-50 px-6 dark:bg-gray-900">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 dark:text-gray-100">
              {t("landing.features.title")}
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto dark:text-gray-400">
              {t("landing.features.subtitle")}
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((f) => (
              <Card
                key={f.title}
                className="p-6 hover:border-blue-200 hover:shadow-md transition-all group dark:hover:border-blue-500/40"
              >
                <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors dark:bg-blue-500/10 dark:text-blue-300 dark:group-hover:bg-blue-500/20">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 dark:text-gray-100">
                  {f.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed dark:text-gray-400">
                  {f.desc}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4 dark:text-gray-100">
            {t("landing.how.title")}
          </h2>
          <p className="text-gray-500 mb-12 dark:text-gray-400">
            {t("landing.how.subtitle")}
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((s) => (
              <div key={s.step} className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-blue-700 text-white flex items-center justify-center text-lg font-bold mb-4">
                  {s.step}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 dark:text-gray-100">
                  {s.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-12">
            <Btn size="lg" onClick={() => router.push("/register")}>
              {t("landing.how.cta")} <ArrowRight size={18} className="rtl-flip" />
            </Btn>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-10 px-6 dark:border-gray-800">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <LogoMark size={28} />
            <span className="font-bold text-gray-900 dark:text-gray-100">
              CareerPilot
            </span>
          </div>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            {t("landing.footer.copyright")}
          </p>
          <div className="flex gap-6 text-sm text-gray-500 dark:text-gray-400">
            <a
              href="#"
              className="hover:text-blue-700 dark:hover:text-blue-400"
            >
              {t("landing.footer.privacy")}
            </a>
            <a
              href="#"
              className="hover:text-blue-700 dark:hover:text-blue-400"
            >
              {t("landing.footer.terms")}
            </a>
            <a
              href="#"
              className="hover:text-blue-700 dark:hover:text-blue-400"
            >
              {t("landing.footer.contact")}
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
