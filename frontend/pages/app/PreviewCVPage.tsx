import { Eye, LayoutTemplate, Download, Mail, Phone, MapPin, Globe, Link } from "lucide-react";
import { Btn } from "../../components/ui/Btn";
import { Card } from "../../components/ui/Card";
import type { CVData, Page } from "../../types";

interface PreviewCVPageProps {
  cvData: CVData;
  onNav: (p: Page) => void;
}

export function PreviewCVPage({ cvData, onNav }: PreviewCVPageProps) {
  const p = cvData.personalInfo;

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-violet-100 flex items-center justify-center text-violet-600">
            <Eye size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Preview CV</h1>
            <p className="text-sm text-gray-500">
              Template: <span className="font-medium capitalize">{cvData.selectedTemplate}</span>
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Btn variant="outline" onClick={() => onNav("templates")}>
            <LayoutTemplate size={15} />Change Template
          </Btn>
          <Btn onClick={() => onNav("download-cv")}>
            <Download size={15} />Download PDF
          </Btn>
        </div>
      </div>

      <div className="max-w-3xl mx-auto">
        <Card className="overflow-hidden shadow-xl">
          {/* CV Header */}
          <div className="bg-violet-700 text-white px-10 py-8">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold">{p.firstName || "First"} {p.lastName || "Last"}</h1>
                <p className="text-violet-200 text-lg mt-1">{p.title || "Professional Title"}</p>
                <div className="flex flex-wrap gap-4 mt-4">
                  {p.email    && <span className="flex items-center gap-1.5 text-sm text-violet-100"><Mail size={13} />{p.email}</span>}
                  {p.phone    && <span className="flex items-center gap-1.5 text-sm text-violet-100"><Phone size={13} />{p.phone}</span>}
                  {p.location && <span className="flex items-center gap-1.5 text-sm text-violet-100"><MapPin size={13} />{p.location}</span>}
                  {p.website  && <span className="flex items-center gap-1.5 text-sm text-violet-100"><Globe size={13} />{p.website}</span>}
                  {p.linkedin && <span className="flex items-center gap-1.5 text-sm text-violet-100"><Link size={13} />{p.linkedin}</span>}
                </div>
              </div>
              <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-3xl font-bold text-white flex-shrink-0">
                {p.firstName?.[0] || "?"}{p.lastName?.[0] || ""}
              </div>
            </div>
          </div>

          {/* CV Body */}
          <div className="p-10 flex gap-8">
            {/* Left / main column */}
            <div className="flex-1 min-w-0">
              {/* Summary */}
              {(p.summary || cvData.aiSummary) && (
                <section className="mb-7">
                  <SectionTitle label="Summary" />
                  <p className="text-sm text-gray-700 leading-relaxed">{cvData.aiSummary || p.summary}</p>
                </section>
              )}

              {/* Experience */}
              {cvData.experiences.length > 0 && (
                <section className="mb-7">
                  <SectionTitle label="Experience" />
                  {cvData.experiences.map((exp) => (
                    <div key={exp.id} className="mb-5 pl-4 border-l-2 border-gray-100 hover:border-violet-300 transition-colors">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-bold text-gray-900">{exp.title}</p>
                          <p className="text-violet-600 text-sm font-medium">{exp.company}</p>
                        </div>
                        <div className="text-right text-xs text-gray-400 flex-shrink-0 ml-4">
                          <p>{exp.startDate} – {exp.current ? "Present" : exp.endDate}</p>
                          {exp.location && <p>{exp.location}</p>}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mt-1.5 leading-relaxed">{exp.description}</p>
                    </div>
                  ))}
                </section>
              )}

              {/* Projects */}
              {cvData.projects.length > 0 && (
                <section className="mb-7">
                  <SectionTitle label="Projects" />
                  {cvData.projects.map((proj) => (
                    <div key={proj.id} className="mb-4">
                      <div className="flex items-baseline justify-between">
                        <p className="font-bold text-gray-900">{proj.name}</p>
                        {proj.url && <a href={proj.url} className="text-xs text-violet-600">{proj.url}</a>}
                      </div>
                      <p className="text-sm text-gray-600 mt-1 leading-relaxed">{proj.description}</p>
                      {proj.technologies && (
                        <p className="text-xs text-gray-500 mt-1">
                          <span className="font-medium">Tech:</span> {proj.technologies}
                        </p>
                      )}
                    </div>
                  ))}
                </section>
              )}
            </div>

            {/* Right sidebar column */}
            <div className="w-48 flex-shrink-0">
              {/* Education */}
              {cvData.education.length > 0 && (
                <section className="mb-7">
                  <SideTitle label="Education" />
                  {cvData.education.map((edu) => (
                    <div key={edu.id} className="mb-4">
                      <p className="text-sm font-bold text-gray-900 leading-tight">{edu.degree}</p>
                      <p className="text-xs text-violet-600 font-medium">{edu.school}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {edu.startDate} – {edu.current ? "Present" : edu.endDate}
                      </p>
                    </div>
                  ))}
                </section>
              )}

              {/* Skills */}
              {cvData.skills.length > 0 && (
                <section className="mb-7">
                  <SideTitle label="Skills" />
                  <div className="flex flex-col gap-1.5">
                    {cvData.skills.slice(0, 10).map((skill) => (
                      <div key={skill.id} className="flex items-center justify-between">
                        <span className="text-xs text-gray-700">{skill.name}</span>
                        <div className="flex gap-0.5">
                          {["Beginner", "Intermediate", "Advanced", "Expert"].map((l, i) => (
                            <div
                              key={l}
                              className={`w-2 h-2 rounded-full ${
                                ["Beginner", "Intermediate", "Advanced", "Expert"].indexOf(skill.level) >= i
                                  ? "bg-violet-500"
                                  : "bg-gray-200"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Certificates */}
              {cvData.certificates.length > 0 && (
                <section>
                  <SideTitle label="Certificates" />
                  {cvData.certificates.map((cert) => (
                    <div key={cert.id} className="mb-3">
                      <p className="text-xs font-bold text-gray-900 leading-tight">{cert.name}</p>
                      <p className="text-xs text-violet-600">{cert.organization}</p>
                      <p className="text-xs text-gray-400">{cert.issueDate}</p>
                    </div>
                  ))}
                </section>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function SectionTitle({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <h2 className="text-sm font-bold tracking-widest text-violet-700 uppercase">{label}</h2>
      <div className="flex-1 h-px bg-violet-200" />
    </div>
  );
}

function SideTitle({ label }: { label: string }) {
  return (
    <div className="mb-3">
      <h2 className="text-xs font-bold tracking-widest text-violet-700 uppercase border-b border-violet-200 pb-1">
        {label}
      </h2>
    </div>
  );
}
