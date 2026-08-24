import { useState } from "react";
import { LayoutTemplate, Eye, Download, Check } from "lucide-react";
import { Btn } from "../../components/ui/Btn";
import { Badge } from "../../components/ui/Badge";
import { PageHeader } from "../../components/ui/PageHeader";
import { cn } from "../../utils";
import type { CVData, Page } from "../../types";

interface TemplatesPageProps {
  cvData: CVData;
  setCVData: (d: CVData) => void;
  onNav: (p: Page) => void;
}

const TEMPLATES = [
  { id: "modern",    name: "Modern",    desc: "Clean two-column layout with accent colors",      tag: "Popular",  accent: "violet" },
  { id: "classic",   name: "Classic",   desc: "Traditional single-column, timeless and ATS-safe", tag: "ATS Safe", accent: "gray" },
  { id: "minimal",   name: "Minimal",   desc: "Ultra-clean with generous whitespace",              tag: "Clean",    accent: "slate" },
  { id: "executive", name: "Executive", desc: "Bold header for senior professionals",              tag: "Premium",  accent: "navy" },
  { id: "creative",  name: "Creative",  desc: "Colorful design for design/creative roles",         tag: "Creative", accent: "rose" },
  { id: "technical", name: "Technical", desc: "Skills-first layout for engineers",                 tag: "Tech",     accent: "blue" },
];

const ACCENT_COLORS: Record<string, string> = {
  violet: "bg-violet-600",
  gray:   "bg-gray-700",
  slate:  "bg-slate-600",
  navy:   "bg-[#1e3a5f]",
  rose:   "bg-rose-500",
  blue:   "bg-blue-600",
};

function TemplateMock({ id, accent }: { id: string; accent: string }) {
  const bg = ACCENT_COLORS[accent] || "bg-violet-600";
  return (
    <div className="w-full h-full bg-white p-3 flex flex-col gap-2">
      {id === "modern" ? (
        <div className="flex gap-2 flex-1">
          <div className={cn("w-1/3 rounded p-2 flex flex-col gap-1.5 opacity-20", bg)}>
            <div className="w-8 h-8 rounded-full bg-gray-400 mb-1" />
            {[1, 2, 3, 4].map((i) => <div key={i} className="h-1.5 bg-gray-400 rounded w-full" />)}
          </div>
          <div className="flex-1 flex flex-col gap-2">
            <div className={cn("h-2 rounded w-3/4", bg)} />
            <div className="h-1.5 bg-gray-200 rounded w-1/2" />
            {[1, 2, 3].map((i) => <div key={i} className="h-1 bg-gray-100 rounded w-full" />)}
          </div>
        </div>
      ) : id === "creative" ? (
        <div className="flex flex-col flex-1 gap-2">
          <div className={cn("h-8 rounded-lg w-full flex items-center px-2 gap-2", bg)}>
            <div className="w-5 h-5 rounded-full bg-white/30" />
            <div className="flex-1 flex flex-col gap-1">
              <div className="h-1.5 bg-white/80 rounded w-1/2" />
              <div className="h-1 bg-white/40 rounded w-1/3" />
            </div>
          </div>
          <div className="flex gap-1.5 flex-1">
            {[1, 2].map((i) => (
              <div key={i} className="flex-1 flex flex-col gap-1">
                {[1, 2, 3].map((j) => <div key={j} className="h-1 bg-gray-100 rounded" />)}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col flex-1 gap-2">
          <div className={cn("h-7 rounded-t flex items-center px-2", bg)}>
            <div className="flex flex-col gap-0.5">
              <div className="h-2 bg-white/80 rounded w-20" />
              <div className="h-1 bg-white/40 rounded w-14" />
            </div>
          </div>
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-1.5 bg-gray-100 rounded w-full" />)}
          <div className="flex gap-1 mt-auto flex-wrap">
            {[1, 2, 3].map((i) => (
              <div key={i} className={cn("h-3 w-10 rounded-full opacity-30", bg)} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function TemplatesPage({ cvData, setCVData, onNav }: TemplatesPageProps) {
  const [selected, setSelected] = useState(cvData.selectedTemplate);

  return (
    <div>
      <PageHeader
        icon={<LayoutTemplate size={24} />}
        title="Templates"
        subtitle="Choose a professional template for your CV"
        tipText="The Modern and Classic templates have the best ATS compatibility."
      />

      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-gray-500">{TEMPLATES.length} templates available</p>
        <div className="flex gap-2">
          <Btn size="sm" variant="outline" onClick={() => { setCVData({ ...cvData, selectedTemplate: selected }); onNav("preview-cv"); }}>
            <Eye size={14} />Preview Selected
          </Btn>
          <Btn size="sm" onClick={() => { setCVData({ ...cvData, selectedTemplate: selected }); onNav("download-cv"); }}>
            <Download size={14} />Use & Download
          </Btn>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {TEMPLATES.map((t) => (
          <div
            key={t.id}
            onClick={() => setSelected(t.id)}
            className={cn(
              "rounded-2xl border-2 overflow-hidden cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-lg",
              selected === t.id
                ? "border-violet-500 shadow-md shadow-violet-100"
                : "border-gray-200 hover:border-gray-300"
            )}
          >
            {/* Mini preview */}
            <div className="h-44 bg-gray-50 relative overflow-hidden">
              <TemplateMock id={t.id} accent={t.accent} />
              {selected === t.id && (
                <div className="absolute inset-0 bg-violet-600/10 flex items-center justify-center">
                  <div className="bg-violet-600 text-white rounded-full p-2">
                    <Check size={16} />
                  </div>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="p-4 bg-white">
              <div className="flex items-center justify-between mb-1">
                <p className="font-semibold text-gray-900">{t.name}</p>
                <Badge color={t.tag === "Popular" ? "violet" : t.tag === "Premium" ? "amber" : "gray"}>
                  {t.tag}
                </Badge>
              </div>
              <p className="text-xs text-gray-500">{t.desc}</p>
              <div className="mt-3">
                {selected === t.id ? (
                  <span className="text-xs font-semibold text-violet-600 flex items-center gap-1">
                    <Check size={12} />Selected
                  </span>
                ) : (
                  <button
                    onClick={() => setSelected(t.id)}
                    className="text-xs font-medium text-gray-500 hover:text-violet-600"
                  >
                    Select template
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
