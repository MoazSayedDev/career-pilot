"use client";

import { useState } from "react";
import {
  Sparkles,
  Brain,
  Target,
  FileText,
  Wand2,
  Check,
  X,
  Copy,
  RefreshCw,
  Loader2,
  Eye,
} from "lucide-react";

import { Btn } from "@/components/ui/Btn";
import { Card } from "@/components/ui/Card";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { PageHeader } from "@/components/ui/PageHeader";

interface AISummary {
  summary: string;
}

interface AISummaryPageProps {
  aiSummary?: string;
  onSummaryChange?: (summary: string) => void;
}

const SAMPLE_SUMMARIES = [
  "Results-driven Senior Frontend Developer with 5+ years of experience building scalable web applications using React, TypeScript, and Next.js. Proven track record of improving Core Web Vitals scores, leading cross-functional teams, and delivering user-centric products at high-growth companies. Passionate about performance optimization and accessible design.",

  "Creative and detail-oriented UI/UX Engineer specializing in design systems and component libraries. Experienced in translating complex product requirements into elegant, accessible interfaces. Comfortable working across the full product lifecycle from ideation to production deployment.",
];

export default function AISummaryPage({
  aiSummary = "",
  onSummaryChange,
}: AISummaryPageProps) {
  const [jobRole, setJobRole] = useState("");
  const [jobDesc, setJobDesc] = useState("");

  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(aiSummary);

  const [copied, setCopied] = useState(false);

  const generate = () => {
    if (!jobRole.trim()) return;

    setGenerating(true);

    setTimeout(() => {
      const summary =
        SAMPLE_SUMMARIES[Math.floor(Math.random() * SAMPLE_SUMMARIES.length)];

      setGenerated(summary);
      setGenerating(false);
    }, 2500);
  };

  const useSummary = () => {
    if (!generated) return;

    onSummaryChange?.(generated);
  };

  const copySummary = async () => {
    if (!generated) return;

    await navigator.clipboard?.writeText(generated);

    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 1500);
  };

  return (
    <div>
      <PageHeader
        icon={<Sparkles size={24} />}
        title="AI Summary"
        subtitle="Generate a compelling professional summary powered by AI"
        tipText="A strong summary tailored to the job description significantly increases your interview chances."
      />

      <div className="grid lg:grid-cols-2 gap-6">
        {/* ================= GENERATOR ================= */}
        <Card className="p-6">
          <h3 className="font-semibold text-gray-800 mb-1 flex items-center gap-2">
            <Brain size={15} className="text-violet-500" />
            Generate with AI
          </h3>

          <p className="text-xs text-gray-400 mb-5">
            Tell the AI about your target role for a personalized summary
          </p>

          <div className="flex flex-col gap-4">
            <Field label="Target Job Role" required>
              <Input
                value={jobRole}
                onChange={setJobRole}
                placeholder="e.g. Senior Frontend Developer"
                icon={<Target size={14} />}
              />
            </Field>

            <Field
              label="Job Description"
              hint="Paste the job description to get a perfectly tailored summary"
            >
              <Textarea
                value={jobDesc}
                onChange={setJobDesc}
                placeholder="Paste the job description here for best results..."
                rows={6}
              />
            </Field>

            {/* AI Info */}
            <div className="bg-violet-50 border border-violet-200 rounded-xl p-4">
              <p className="text-xs font-semibold text-violet-800 mb-1 flex items-center gap-1">
                <Sparkles size={12} />
                AI will use your CV data
              </p>

              <p className="text-xs text-violet-600">
                The AI will analyze your experience, skills, and education to
                craft a personalized summary.
              </p>
            </div>

            {/* Generate */}
            <Btn onClick={generate} disabled={generating || !jobRole.trim()}>
              {generating ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Generating your summary...
                </>
              ) : (
                <>
                  <Wand2 size={16} />
                  Generate AI Summary
                </>
              )}
            </Btn>
          </div>
        </Card>

        {/* ================= RESULT ================= */}
        <div className="flex flex-col gap-5">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <FileText size={15} className="text-violet-500" />
                Generated Summary
              </h3>

              {generated && !generating && (
                <div className="flex gap-2">
                  <Btn size="sm" variant="ghost" onClick={copySummary}>
                    <Copy size={12} />
                    {copied ? "Copied!" : "Copy"}
                  </Btn>

                  <Btn
                    size="sm"
                    variant="secondary"
                    onClick={generate}
                    disabled={generating || !jobRole.trim()}
                  >
                    <RefreshCw size={12} />
                    Regenerate
                  </Btn>
                </div>
              )}
            </div>

            {/* Generating State */}
            {generating ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full border-4 border-violet-200 border-t-violet-600 animate-spin" />

                  <Sparkles
                    size={16}
                    className="absolute inset-0 m-auto text-violet-600"
                  />
                </div>

                <p className="text-sm text-gray-500">
                  AI is crafting your summary...
                </p>
              </div>
            ) : generated ? (
              <div className="flex flex-col gap-4">
                {/* Generated Text */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {generated}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                  <Btn size="sm" onClick={useSummary}>
                    <Check size={13} />
                    Use this summary
                  </Btn>

                  <Btn
                    size="sm"
                    variant="outline"
                    onClick={() => setGenerated("")}
                  >
                    <X size={13} />
                    Discard
                  </Btn>
                </div>
              </div>
            ) : (
              /* Empty State */
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-14 h-14 rounded-2xl bg-violet-50 flex items-center justify-center mb-3">
                  <Sparkles size={22} className="text-violet-400" />
                </div>

                <p className="font-medium text-gray-600 mb-1">
                  No summary generated yet
                </p>

                <p className="text-sm text-gray-400">
                  Fill in the target role and click Generate.
                </p>
              </div>
            )}
          </Card>

          {/* ================= CURRENT SUMMARY ================= */}
          {aiSummary && (
            <Card className="p-6">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Eye size={15} className="text-violet-500" />
                Current Summary in CV
              </h3>

              <div className="border-t-2 border-violet-600 pt-4">
                <p className="text-xs font-bold tracking-widest text-violet-700 uppercase mb-3">
                  Professional Summary
                </p>

                <p className="text-sm text-gray-700 leading-relaxed">
                  {aiSummary}
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
