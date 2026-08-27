"use client";

import { useEffect, useState } from "react";
import { Download, FileText, Eye, Loader2, CheckCircle, Info } from "lucide-react";
import { useRouter } from "next/navigation";

import { Btn } from "@/components/ui/Btn";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";

import { getProfile } from "@/services/profile/api/profile.service";
import type { Profile } from "@/services/profile/types/profile";
import { getResumes, downloadResumePdf } from "@/services/resume/api/resume.service";
import type { Resume } from "@/services/resume/types/resume";

interface DownloadCVPageProps {
  cvData?: {
    personalInfo?: {
      firstName?: string;
      lastName?: string;
    };
    selectedTemplate?: string;
  };
  onNav?: (page: string) => void;
}

export default function DownloadCVPage({ cvData, onNav }: DownloadCVPageProps) {
  const router = useRouter();
  const [downloading, setDownloading] = useState(false);
  const [done, setDone] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [resume, setResume] = useState<Resume | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [profileData, resumes] = await Promise.all([getProfile().catch(() => null), getResumes().catch(() => [])]);
        setProfile(profileData);
        setResume(resumes[0] ?? null);
      } catch (error) {
        console.error(error);
      }
    };

    void load();
  }, []);

  const fileName = `${profile?.firstName || cvData?.personalInfo?.firstName || "Your"}_${profile?.lastName || cvData?.personalInfo?.lastName || "CV"}_CV.pdf`;

  const handleDownload = async () => {
    if (!resume) {
      return;
    }

    setDownloading(true);
    try {
      const blob = await downloadResumePdf(resume.id);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      link.click();
      URL.revokeObjectURL(url);
      setDone(true);
    } catch (error) {
      console.error(error);
    } finally {
      setDownloading(false);
    }
  };

  const navigate = (page: string) => {
    if (onNav) onNav(page);
    else router.push(`/resume/${page}`);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader icon={<Download size={24} />} title="Download CV" subtitle="Export your CV as a professional PDF" />

      <Card className="p-8">
        {done ? (
          <div className="flex flex-col items-center gap-5 py-8 text-center">
            <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center">
              <CheckCircle size={40} className="text-emerald-500" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">CV Downloaded!</h3>
              <p className="text-sm text-gray-500">{fileName} is ready in your downloads folder.</p>
            </div>
            <div className="flex gap-3">
              <Btn variant="outline" onClick={() => setDone(false)}>
                <Download size={15} />
                Download Again
              </Btn>
              <Btn onClick={() => navigate("preview")}>
                <Eye size={15} />
                Preview CV
              </Btn>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div className="w-12 h-12 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center flex-shrink-0">
                <FileText size={22} />
              </div>
              <div>
                <p className="font-semibold text-gray-900">{fileName}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Template: <span className="font-medium capitalize">{String(resume?.template ?? cvData?.selectedTemplate ?? "modern").toLowerCase()}</span> · Ready to export
                </p>
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-700 mb-3">Export Settings</p>
              <div className="flex flex-col">
                {[
                  { label: "File format", value: "PDF" },
                  { label: "Page size", value: "A4" },
                  { label: "Quality", value: "High (300 DPI)" },
                  { label: "Margins", value: "Normal (25mm)" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-2.5 border-b border-gray-50">
                    <span className="text-sm text-gray-600">{item.label}</span>
                    <span className="text-sm font-medium text-gray-900">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-sm text-blue-800 font-semibold mb-1 flex items-center gap-2">
                <Info size={14} />
                ATS Compatibility
              </p>
              <p className="text-xs text-blue-700">Your selected template is ATS-compatible and passes major applicant tracking systems.</p>
            </div>

            <Btn size="lg" onClick={() => void handleDownload()} disabled={downloading || !resume} className="w-full">
              {downloading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Generating PDF…
                </>
              ) : (
                <>
                  <Download size={18} />
                  Download CV as PDF
                </>
              )}
            </Btn>

            <Btn variant="outline" onClick={() => navigate("preview")} className="w-full">
              <Eye size={15} />
              Preview before downloading
            </Btn>
          </div>
        )}
      </Card>
    </div>
  );
}
