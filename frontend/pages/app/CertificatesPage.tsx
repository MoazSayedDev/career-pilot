"use client";

import { useState } from "react";
import {
  Award,
  Calendar,
  Building2,
  Link,
  Upload,
  Eye,
  Edit2,
  Trash2,
  Plus,
  Check,
  X,
  ChevronDown,
} from "lucide-react";

import { Btn } from "@/components/ui/Btn";
import { Card } from "@/components/ui/Card";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { PageHeader } from "@/components/ui/PageHeader";

const EMPTY_FORM = {
  name: "",
  organization: "",
  issueDate: "",
  credentialId: "",
  credentialUrl: "",
};

type Certificate = {
  id: string;
  name: string;
  organization: string;
  issueDate: string;
  credentialId: string;
  credentialUrl: string;
};

export default function CertificatesPage() {
  const [form, setForm] = useState(EMPTY_FORM);

  const [certificates, setCertificates] = useState<Certificate[]>([]);

  const [editId, setEditId] = useState<string | null>(null);

  const [previewId, setPreviewId] = useState<string | null>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errors: Record<string, string> = {};

    if (!form.name.trim()) {
      errors.name = "Certificate name is required";
    }

    if (!form.organization.trim()) {
      errors.organization = "Issuing organization is required";
    }

    if (!form.issueDate.trim()) {
      errors.issueDate = "Issue date is required";
    }

    setErrors(errors);

    return Object.keys(errors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    if (editId) {
      setCertificates((prev) =>
        prev.map((certificate) =>
          certificate.id === editId
            ? {
                ...form,
                id: editId,
              }
            : certificate,
        ),
      );

      setEditId(null);
    } else {
      const newCertificate: Certificate = {
        ...form,
        id: crypto.randomUUID(),
      };

      setCertificates((prev) => [newCertificate, ...prev]);
    }

    setForm(EMPTY_FORM);
    setErrors({});
  };

  const handleEdit = (certificate: Certificate) => {
    setForm({
      name: certificate.name,
      organization: certificate.organization,
      issueDate: certificate.issueDate,
      credentialId: certificate.credentialId,
      credentialUrl: certificate.credentialUrl,
    });

    setEditId(certificate.id);
  };

  const handleDelete = (id: string) => {
    setCertificates((prev) =>
      prev.filter((certificate) => certificate.id !== id),
    );

    if (previewId === id) {
      setPreviewId(null);
    }
  };

  const handleCancelEdit = () => {
    setEditId(null);
    setForm(EMPTY_FORM);
    setErrors({});
  };

  const previewedCertificate = certificates.find(
    (certificate) => certificate.id === previewId,
  );

  return (
    <div>
      <PageHeader
        icon={<Award size={24} />}
        title="Certificates"
        subtitle="Add your certificates to make your CV stronger"
        tipText="Include credential IDs so recruiters can verify your certificates online."
      />

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Form */}
        <Card className="lg:col-span-2 p-6 h-fit">
          <h3 className="font-semibold text-gray-800 mb-1 flex items-center gap-2">
            <Award size={15} className="text-violet-500" />

            {editId ? "Edit Certificate" : "Add New Certificate"}
          </h3>

          <p className="text-xs text-gray-400 mb-5">
            Fill in the details of your certificate
          </p>

          <div className="flex flex-col gap-4">
            <Field label="Certificate Name" required error={errors.name}>
              <Input
                value={form.name}
                onChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    name: value,
                  }))
                }
                placeholder="e.g. AWS Certified Developer"
              />
            </Field>

            <Field
              label="Issuing Organization"
              required
              error={errors.organization}
            >
              <Input
                value={form.organization}
                onChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    organization: value,
                  }))
                }
                placeholder="e.g. Amazon Web Services"
                icon={<Building2 size={14} />}
              />
            </Field>

            <Field label="Issue Date" required error={errors.issueDate}>
              <Input
                value={form.issueDate}
                onChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    issueDate: value,
                  }))
                }
                placeholder="e.g. January 2024"
                icon={<Calendar size={14} />}
              />
            </Field>

            <Field label="Credential ID (Optional)">
              <Input
                value={form.credentialId}
                onChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    credentialId: value,
                  }))
                }
                placeholder="e.g. AWS-DEV-2024-88291"
              />
            </Field>

            <Field label="Credential URL (Optional)">
              <Input
                value={form.credentialUrl}
                onChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    credentialUrl: value,
                  }))
                }
                placeholder="https://verify.aws.com/..."
                icon={<Link size={14} />}
              />
            </Field>

            {/* Upload */}
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center gap-2 text-center hover:border-violet-300 transition-colors cursor-pointer">
              <Upload size={20} className="text-gray-400" />

              <p className="text-sm font-medium text-gray-600">
                Upload certificate image
              </p>

              <p className="text-xs text-gray-400">
                JPG, PNG or PDF (Max. 5MB)
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Btn className="flex-1" onClick={handleSave}>
                {editId ? (
                  <>
                    <Check size={15} />
                    Update
                  </>
                ) : (
                  <>
                    <Plus size={15} />
                    Add Certificate
                  </>
                )}
              </Btn>

              {editId && (
                <Btn variant="outline" onClick={handleCancelEdit}>
                  Cancel
                </Btn>
              )}
            </div>
          </div>
        </Card>

        {/* List + Preview */}
        <div className="lg:col-span-3 flex flex-col gap-5">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <Award size={15} className="text-violet-500" />
                Your Certificates ({certificates.length})
              </h3>

              {certificates.length > 0 && (
                <button className="flex items-center gap-1 text-xs text-gray-500 hover:text-violet-600">
                  Newest First
                  <ChevronDown size={12} />
                </button>
              )}
            </div>

            {certificates.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-3">
                  <Award size={22} className="text-gray-400" />
                </div>

                <p className="font-medium text-gray-600">
                  No certificates added yet
                </p>

                <p className="text-sm text-gray-400">
                  Add your certifications to strengthen your CV.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {certificates.map((certificate) => (
                  <div
                    key={certificate.id}
                    className="flex gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50"
                  >
                    <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0">
                      <Award size={18} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 text-sm">
                        {certificate.name}
                      </h4>

                      <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                        <Building2 size={10} />
                        {certificate.organization}
                      </p>

                      <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                        <Calendar size={10} />
                        Issued: {certificate.issueDate}
                      </p>

                      {certificate.credentialId && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          ID: {certificate.credentialId}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <Btn
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          setPreviewId(
                            previewId === certificate.id
                              ? null
                              : certificate.id,
                          )
                        }
                      >
                        <Eye size={12} />
                        View
                      </Btn>

                      <Btn
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(certificate)}
                      >
                        <Edit2 size={12} />
                        Edit
                      </Btn>

                      <Btn
                        size="sm"
                        variant="danger"
                        onClick={() => handleDelete(certificate.id)}
                      >
                        <Trash2 size={12} />
                        Delete
                      </Btn>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Preview */}
          {previewedCertificate && (
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  <Eye size={15} className="text-violet-500" />
                  Certificate Preview
                </h3>

                <Btn
                  size="sm"
                  variant="ghost"
                  onClick={() => setPreviewId(null)}
                >
                  <X size={13} />
                  Close Preview
                </Btn>
              </div>

              <div className="bg-[#0f1f3d] rounded-xl p-8 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-400/30 to-transparent rounded-bl-full" />

                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-amber-400/20 to-transparent rounded-tr-full" />

                <div className="relative">
                  <div className="text-amber-400 text-xs font-bold tracking-[0.3em] uppercase mb-1">
                    Certificate
                  </div>

                  <div className="text-white/60 text-[10px] tracking-widest uppercase mb-6">
                    of Completion
                  </div>

                  <div className="w-16 h-px bg-amber-400/50 mx-auto mb-6" />

                  <p className="text-white/70 text-xs mb-2">
                    This is to certify that
                  </p>

                  <h2 className="text-white text-2xl font-bold mb-4">
                    {previewedCertificate.name}
                  </h2>

                  <p className="text-white/70 text-xs mb-6">
                    has successfully completed the training program
                    <br />
                    and met all the requirements.
                  </p>

                  <div className="flex justify-between items-end text-white mt-4">
                    <div className="text-center">
                      <div className="w-20 h-px bg-white/30 mb-1" />

                      <p className="text-xs font-semibold">
                        {previewedCertificate.organization}
                      </p>

                      <p className="text-[10px] text-white/50">
                        Issuing Organization
                      </p>
                    </div>

                    <div className="w-12 h-12 rounded-full bg-amber-400 flex items-center justify-center text-[#0f1f3d] font-bold text-xs">
                      {previewedCertificate.organization
                        .slice(0, 3)
                        .toUpperCase()}
                    </div>

                    <div className="text-center">
                      <div className="w-20 h-px bg-white/30 mb-1" />

                      <p className="text-xs font-semibold">
                        {previewedCertificate.issueDate}
                      </p>

                      <p className="text-[10px] text-white/50">Date of Issue</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
