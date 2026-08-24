"use client";
import { useRouter } from "next/navigation";
import { Btn } from "@/components/ui/Btn";
import { Card } from "@/components/ui/Card";
import {
  FileText,
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
  return (
    <div className="flex bg-[#f8fafc] h-72">
      <div className="w-40 bg-white border-r border-gray-200 flex-shrink-0 p-3 flex flex-col gap-1">
        {[
          "Dashboard",
          "Personal Info",
          "Experience",
          "Education",
          "Skills",
        ].map((item, i) => (
          <div
            key={item}
            className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs ${
              i === 2 ? "bg-violet-600 text-white" : "text-gray-500"
            }`}
          >
            <div className="w-3 h-3 rounded-sm bg-current opacity-60" />
            {item}
          </div>
        ))}
      </div>
      <div className="flex-1 p-4 overflow-hidden">
        <div className="flex gap-3 h-full">
          <div className="flex-1 bg-white rounded-xl border border-gray-200 p-3">
            <div className="text-xs font-semibold text-gray-700 mb-2">
              Add New Experience
            </div>
            {["Job Title *", "Company Name *", "Location"].map((f) => (
              <div key={f} className="mb-2">
                <div className="text-[10px] text-gray-400 mb-0.5">{f}</div>
                <div className="h-6 rounded-md border border-gray-200 bg-gray-50" />
              </div>
            ))}
            <div className="mt-3 h-7 rounded-lg bg-violet-600" />
          </div>
          <div className="flex-1 bg-white rounded-xl border border-gray-200 p-3">
            <div className="text-xs font-semibold text-gray-700 mb-2">
              Your Experiences (2)
            </div>
            {[
              "Senior Frontend Developer → Stripe",
              "Frontend Developer → Vercel",
            ].map((e) => (
              <div
                key={e}
                className="mb-2 p-2 rounded-lg border border-gray-100 bg-gray-50"
              >
                <div className="text-[10px] font-medium text-gray-700">{e}</div>
                <div className="flex gap-1 mt-1">
                  <div className="px-1.5 py-0.5 rounded border border-gray-200 text-[9px] text-gray-500">
                    Edit
                  </div>
                  <div className="px-1.5 py-0.5 rounded border border-red-200 text-[9px] text-red-500">
                    Delete
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

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Navbar */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center">
              <FileText size={16} className="text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">CareerPilot</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-600">
            <a
              href="#features"
              className="hover:text-violet-600 transition-colors"
            >
              Features
            </a>
            <a href="#how" className="hover:text-violet-600 transition-colors">
              How it works
            </a>
            <a
              href="#templates"
              className="hover:text-violet-600 transition-colors"
            >
              Templates
            </a>
          </div>
          <div className="flex items-center gap-3">
            <Btn variant="ghost" onClick={() => router.push("/login")}>
              Sign in
            </Btn>
            <Btn variant="primary" onClick={() => router.push("/register")}>
              Get started free
            </Btn>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-violet-50 border border-violet-200 rounded-full px-4 py-1.5 text-sm text-violet-700 font-medium mb-8">
            <Sparkles size={14} />
            AI-Powered CV Builder
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
            Build your perfect CV
            <br />
            <span className="text-violet-600">powered by AI</span>
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            Create a professional, ATS-optimized resume in minutes. Let AI
            tailor your CV to any job description, or build it manually with our
            intuitive editor.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Btn size="lg" onClick={() => router.push("/register")}>
              <Sparkles size={18} />
              Generate CV with AI
            </Btn>
            <Btn
              size="lg"
              variant="outline"
              onClick={() => router.push("/register")}
            >
              <Pencil size={18} />
              Build Manually
            </Btn>
          </div>
          <p className="mt-4 text-sm text-gray-400">
            Free forever · No credit card required
          </p>
        </div>

        {/* App preview */}
        <div className="max-w-5xl mx-auto mt-16 rounded-2xl overflow-hidden border border-gray-200 shadow-2xl shadow-violet-100">
          <div className="bg-gray-100 border-b border-gray-200 px-4 py-3 flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-amber-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
            <div className="ml-4 flex-1 bg-white rounded-md px-3 py-1 text-xs text-gray-400 max-w-xs">
              careerpilot.app/dashboard
            </div>
          </div>
          <AppPreviewMockup />
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-gray-50 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything you need to land the job
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              From AI generation to beautiful templates, CareerPilot has every
              tool to make your resume stand out.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: <Wand2 size={22} />,
                title: "AI CV Generation",
                desc: "Paste any job description and get a tailored, keyword-optimized resume in seconds.",
              },
              {
                icon: <LayoutTemplate size={22} />,
                title: "Professional Templates",
                desc: "Choose from 6+ hand-crafted templates designed to impress recruiters and pass ATS filters.",
              },
              {
                icon: <Eye size={22} />,
                title: "Live Preview",
                desc: "See exactly how your CV looks as you edit. No surprises when you download.",
              },
              {
                icon: <Download size={22} />,
                title: "PDF Export",
                desc: "Download pixel-perfect PDFs ready to send to employers, at any time.",
              },
              {
                icon: <Shield size={22} />,
                title: "ATS Optimized",
                desc: "Our templates are tested against leading ATS systems to maximize your interview chances.",
              },
              {
                icon: <Sparkles size={22} />,
                title: "AI Summary Writer",
                desc: "Generate compelling professional summaries tailored to your target role with one click.",
              },
            ].map((f) => (
              <Card
                key={f.title}
                className="p-6 hover:border-violet-200 hover:shadow-md transition-all group"
              >
                <div className="w-11 h-11 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center mb-4 group-hover:bg-violet-100 transition-colors">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">
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
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready in 3 simple steps
          </h2>
          <p className="text-gray-500 mb-12">
            Building a winning CV has never been easier.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Create your account",
                desc: "Sign up free in seconds. No credit card needed.",
              },
              {
                step: "2",
                title: "Add your details",
                desc: "Use AI to auto-fill from a job description, or enter your info manually.",
              },
              {
                step: "3",
                title: "Download & apply",
                desc: "Pick a template, preview your CV, and download a polished PDF.",
              },
            ].map((s) => (
              <div key={s.step} className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-violet-600 text-white flex items-center justify-center text-lg font-bold mb-4">
                  {s.step}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{s.title}</h3>
                <p className="text-sm text-gray-500">{s.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-12">
            <Btn size="lg" onClick={() => router.push("/register")}>
              Start building for free <ArrowRight size={18} />
            </Btn>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-10 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center">
              <FileText size={13} className="text-white" />
            </div>
            <span className="font-bold text-gray-900">CareerPilot</span>
          </div>
          <p className="text-sm text-gray-400">
            © 2026 CareerPilot. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-gray-500">
            <a href="#" className="hover:text-violet-600">
              Privacy
            </a>
            <a href="#" className="hover:text-violet-600">
              Terms
            </a>
            <a href="#" className="hover:text-violet-600">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
