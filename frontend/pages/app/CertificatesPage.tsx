"use client";

import { useEffect, useState } from "react";
import {
  Award,
  Calendar,
  Building2,
  Link,
  Edit2,
  Trash2,
  Plus,
  Check,
} from "lucide-react";

import { Btn } from "@/components/ui/Btn";
import { Card } from "@/components/ui/Card";
import { Field } from "@/components/ui/Field";
import { PageHeader } from "@/components/ui/PageHeader";

import {
  createCertificate,
  deleteCertificate,
  getCertificates,
  updateCertificate,
} from "@/services/certificate/api/certificate.service";
import type { Certificate } from "@/services/certificate/types/certificate";

const EMPTY_FORM = {
  name: "",
  organization: "",
  issueDate: "",
  credentialId: "",
  credentialUrl: "",
};

const formatDate = (value?: string | null) => {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return date.toISOString().slice(0, 10);
};

export default function CertificatesPage() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [editId, setEditId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const refresh = () => setReloadKey((key) => key + 1);

  useEffect(() => {
    let cancelled = false;

    const loadCertificates = async () => {
      try {
        const data = await getCertificates();

        if (!cancelled) {
          setCertificates(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadCertificates();

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const validate = () => {
    const nextErrors: Record<string, string> = {};

    if (!form.name.trim()) {
      nextErrors.name = "Certificate name is required";
    }

    if (!form.organization.trim()) {
      nextErrors.organization = "Issuing organization is required";
    }

    if (!form.issueDate) {
      nextErrors.issueDate = "Issue date is required";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setSubmitting(true);

    try {
      const payload = {
        name: form.name.trim(),
        issuer: form.organization.trim(),
        issueDate: new Date(form.issueDate).toISOString(),
        credentialId: form.credentialId.trim() || undefined,
        credentialUrl: form.credentialUrl.trim() || undefined,
      };

      if (editId) {
        await updateCertificate(editId, payload);
      } else {
        await createCertificate(payload);
      }

      setForm(EMPTY_FORM);
      setEditId(null);
      setErrors({});

      refresh();
    } catch (err) {
      console.error(err);

      setErrors((prev) => ({
        ...prev,
        root: "Failed to save certificate.",
      }));
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (certificate: Certificate) => {
    setForm({
      name: certificate.name,
      organization: certificate.issuer,
      issueDate: formatDate(certificate.issueDate),
      credentialId: certificate.credentialId ?? "",
      credentialUrl: certificate.credentialUrl ?? "",
    });

    setEditId(certificate.id);
    setErrors({});
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCertificate(id);

      if (editId === id) {
        setEditId(null);
        setForm(EMPTY_FORM);
      }

      refresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancelEdit = () => {
    setEditId(null);
    setForm(EMPTY_FORM);
    setErrors({});
  };

  return (
    <div>
      <PageHeader
        icon={<Award size={24} />}
        title="Certificates"
        subtitle="Add your certificates to make your CV stronger"
        tipText="Include credential IDs so recruiters can verify your certificates online."
      />

      <div className="grid lg:grid-cols-5 gap-6">
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
              <input
                type="text"
                value={form.name}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    name: event.target.value,
                  }))
                }
                placeholder="e.g. AWS Certified Developer"
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
              />
            </Field>

            <Field
              label="Issuing Organization"
              required
              error={errors.organization}
            >
              <div className="relative">
                <Building2
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="text"
                  value={form.organization}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      organization: event.target.value,
                    }))
                  }
                  placeholder="e.g. Amazon Web Services"
                  className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm text-gray-900 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                />
              </div>
            </Field>

            <Field label="Issue Date" required error={errors.issueDate}>
              <div className="relative">
                <Calendar
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="date"
                  value={form.issueDate}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      issueDate: event.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm text-gray-900 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                />
              </div>
            </Field>

            <Field label="Credential ID (Optional)">
              <input
                type="text"
                value={form.credentialId}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    credentialId: event.target.value,
                  }))
                }
                placeholder="e.g. AWS-DEV-2024-88291"
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
              />
            </Field>

            <Field label="Credential URL (Optional)">
              <div className="relative">
                <Link
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="url"
                  value={form.credentialUrl}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      credentialUrl: event.target.value,
                    }))
                  }
                  placeholder="https://..."
                  className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm text-gray-900 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                />
              </div>
            </Field>

            {errors.root && (
              <p className="text-sm text-red-500">{errors.root}</p>
            )}

            <div className="flex gap-2">
              <Btn
                className="flex-1"
                onClick={() => void handleSave()}
                disabled={submitting}
              >
                {submitting ? (
                  <span>Saving...</span>
                ) : (
                  <>
                    {editId ? <Check size={15} /> : <Plus size={15} />}{" "}
                    {editId ? "Update" : "Save"}
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

        <div className="lg:col-span-3 flex flex-col gap-5">
          <Card className="p-6">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Award size={15} className="text-violet-500" />
              Your Certificates ({certificates.length})
            </h3>

            {loading ? (
              <p className="text-sm text-gray-500">Loading certificates...</p>
            ) : certificates.length === 0 ? (
              <div className="py-8 text-center text-sm text-gray-500">
                No certificates added yet.
              </div>
            ) : (
              <div className="space-y-4">
                {certificates.map((certificate) => (
                  <div
                    key={certificate.id}
                    className="rounded-xl border border-gray-200 bg-gray-50 p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {certificate.name}
                        </p>

                        <p className="text-sm text-violet-600">
                          {certificate.issuer}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(certificate)}
                          className="p-2 text-gray-500 hover:text-violet-600"
                        >
                          <Edit2 size={14} />
                        </button>

                        <button
                          type="button"
                          onClick={() => void handleDelete(certificate.id)}
                          className="p-2 text-gray-500 hover:text-red-600"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="mt-2 text-xs text-gray-500">
                      Issued {formatDate(certificate.issueDate)}
                    </div>

                    {certificate.credentialId && (
                      <p className="mt-2 text-xs text-gray-600">
                        Credential ID: {certificate.credentialId}
                      </p>
                    )}

                    {certificate.credentialUrl && (
                      <a
                        className="mt-2 inline-block text-xs text-violet-600 hover:underline"
                        href={certificate.credentialUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {certificate.credentialUrl}
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
