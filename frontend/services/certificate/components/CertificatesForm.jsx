"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { createCertificate , getCertificates , updateCertificate , deleteCertificate } from "../api/certificate.service";
// const initialCertificates = [
//   {
//     id: crypto.randomUUID(),
//     name: "Front-End",
//     issuer: "NTI",
//     issueDate: "2025-06-20",
//     expirationDate: "2025-12-20",
//     credentialId: "qwfdsd",
//     credentialUrl: "https://example.com",
//   },
// ];

const emptyCertificate = {
  name: "",
  issuer: "",
  issueDate: "",
  expirationDate: "",
  credentialId: "",
  credentialUrl: "",
};

export default function Form() {
  const [certificates, setCertificates] = useState("");

  const [loading, setLoading] = useState(false);

  const [editingCertificate, setEditingCertificate] = useState(null);
  const [deletingCertificate, setDeletingCertificate] = useState(null);
  const [viewingCertificate, setViewingCertificate] = useState(null);
  
  
  // =========================
  // Add Form
  // =========================

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: emptyCertificate,
  });

  // =========================
  // Edit Form
  // =========================

  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    reset: resetEdit,
    formState: { errors: errorsEdit },
  } = useForm({
    defaultValues: emptyCertificate,
  });

   // =========================
  // Get Certificate
  // =========================

  useEffect(()=>{
  const getData=async ()=>{
    try{
      const data=await getCertificates()
      setCertificates(data)
    }catch (error) {
      console.log("error:", error )
    }
  }
  getData()
},[])

  // =========================
  // Add Certificate
  // =========================

 const onSubmit = async (data) => {
  const newCertificate = {
    ...data,
    id: crypto.randomUUID(),
  };

  try {
    await createCertificate(newCertificate);

    setCertificates((prev) => [...prev, newCertificate]);
    
    reset();
  } catch (error) {
    console.error(error);
    alert("Error creating certificate");
  }
};

  // =========================
  // Open Edit Modal
  // =========================

  const handleEdit = (certificate) => {
    setEditingCertificate(certificate);

    resetEdit({
      name: certificate.name,
      issuer: certificate.issuer,
      issueDate: certificate.issueDate,
      expirationDate: certificate.expirationDate,
      credentialId: certificate.credentialId,
      credentialUrl: certificate.credentialUrl,
    });
  };

  // =========================
  // Save Edit
  // =========================

  const handleSaveEdit = async (data) => {
  try {
    await updateCertificate(editingCertificate.id, data);

    setCertificates((prev) =>
      prev.map((certificate) =>
        certificate.id === editingCertificate.id
          ? {
              ...certificate,
              ...data,
            }
          : certificate
      )
    );

    setEditingCertificate(null);
    resetEdit();
  } catch (error) {
    console.error(error);
    alert("Error updating certificate");
  }
};

  // =========================
  // Delete
  // =========================

  const handleDelete = (certificate) => {
    setDeletingCertificate(certificate);
  };

  const confirmDelete = async () => {
  try {
    await deleteCertificate(deletingCertificate.id);

    setCertificates((prev) =>
      prev.filter(
        (certificate) => certificate.id !== deletingCertificate.id
      )
    );

    setDeletingCertificate(null);

    alert("Certificate deleted successfully");
  } catch (error) {
    console.error(error);
    alert("Error deleting certificate");
  }
};

  // =========================
  // View
  // =========================

  const handleView = (certificate) => {
    setViewingCertificate(certificate);
  };

  return (
    <>
      {loading ? (
        <div className="flex min-h-screen items-center justify-center">
          Loading...
        </div>
      ) : (
        <div className="flex gap-10 p-10">
          {/* =========================
              ADD CERTIFICATE
          ========================= */}

          <div className="w-1/2 p-10">
            <div>
              <h2 className="text-[22px] font-extrabold">
                Add Certificate
              </h2>

              <p className="text-[14px] text-gray-600">
                List your academic degrees, certifications, or major
                self-learning milestones.
              </p>
            </div>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col gap-4 pt-6"
            >
              {/* Name */}

              <div>
                <label htmlFor="name">Name Certificate</label>

                <input
                  id="name"
                  type="text"
                  {...register("name", {
                    required: "Name is required",
                    minLength: {
                      value: 3,
                      message: "Name must be at least 3 characters",
                    },
                  })}
                  className="w-full rounded border border-gray-300 p-2"
                />

                {errors.name && (
                  <p className="text-sm text-red-600">
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Issuer */}

              <div>
                <label htmlFor="issuer">Issuing Organization</label>

                <input
                  id="issuer"
                  type="text"
                  {...register("issuer", {
                    required: "Issuer is required",
                  })}
                  className="w-full rounded border border-gray-300 p-2"
                />

                {errors.issuer && (
                  <p className="text-sm text-red-600">
                    {errors.issuer.message}
                  </p>
                )}
              </div>

              {/* Dates */}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="issueDate">Issue Date</label>

                  <input
                    id="issueDate"
                    type="date"
                    {...register("issueDate", {
                      required: "Issue date is required",
                    })}
                    className="w-full rounded border border-gray-300 p-2"
                  />

                  {errors.issueDate && (
                    <p className="text-sm text-red-600">
                      {errors.issueDate.message}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="expirationDate">
                    Expiration Date
                  </label>

                  <input
                    id="expirationDate"
                    type="date"
                    {...register("expirationDate", {
                      required: "Expiration date is required",
                    })}
                    className="w-full rounded border border-gray-300 p-2"
                  />

                  {errors.expirationDate && (
                    <p className="text-sm text-red-600">
                      {errors.expirationDate.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Credential ID */}

              <div>
                <label htmlFor="credentialId">
                  Credential ID
                </label>

                <input
                  id="credentialId"
                  type="text"
                  {...register("credentialId")}
                  className="w-full rounded border border-gray-300 p-2"
                />
              </div>

              {/* Credential URL */}

              <div>
                <label htmlFor="credentialUrl">
                  Credential URL
                </label>

                <input
                  id="credentialUrl"
                  type="url"
                  {...register("credentialUrl", {
                    required: "Credential URL is required",
                  })}
                  className="w-full rounded border border-gray-300 p-2"
                />

                {errors.credentialUrl && (
                  <p className="text-sm text-red-600">
                    {errors.credentialUrl.message}
                  </p>
                )}
              </div>

              <div className="flex justify-center pt-4">
                <button
                  type="submit"
                  className="rounded-md bg-gray-700 px-6 py-3 text-white hover:bg-gray-800 cursor-pointer"
                >
                  Save
                </button>
              </div>
            </form>
          </div>

          {/* =========================
              CERTIFICATES LIST
          ========================= */}

          <div className="w-1/2 p-10">
            <div className="pb-4">
              <h2 className="text-[22px] font-extrabold">
                Your Certificates ({certificates.length})
              </h2>
            </div>

            {certificates.length === 0 ? (
              <p className="text-gray-500">
                No certificates yet.
              </p>
            ) : (
              <div className="flex flex-col gap-4">
                {certificates.map((certificate) => (
                  <div
                    key={certificate.id}
                    className="flex items-center gap-4 rounded-md border border-gray-300 p-4"
                  >
                    {/* Image Placeholder */}

                    <div className="h-24 w-24 shrink-0 rounded bg-gray-100" />

                    {/* Certificate Info */}

                    <div className="flex-1">
                      <p className="text-xl font-bold">
                        {certificate.name}
                      </p>

                      <p className="text-gray-600">
                        {certificate.issuer}
                      </p>

                      <p className="text-sm text-gray-500">
                        {certificate.issueDate}
                      </p>

                      {certificate.credentialId && (
                        <p className="text-sm text-gray-500">
                          ID: {certificate.credentialId}
                        </p>
                      )}
                    </div>

                    {/* Actions */}

                    <div className="flex flex-col gap-2">
                      <button
                        type="button"
                        onClick={() => handleView(certificate)}
                        className="rounded-md border border-gray-300 px-4 py-1 text-sm font-bold hover:bg-gray-100 cursor-pointer"
                      >
                        View
                      </button>

                      <button
                        type="button"
                        onClick={() => handleEdit(certificate)}
                        className="rounded-md border border-gray-300 px-4 py-1 text-sm font-bold hover:bg-gray-100 cursor-pointer"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(certificate)}
                        className="rounded-md border border-red-300 px-4 py-1 text-sm font-bold text-red-600 hover:bg-red-50 cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================================================
          EDIT MODAL
      ================================================== */}

      {editingCertificate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setEditingCertificate(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="mb-6 text-center text-3xl font-extrabold">
              Edit Certificate
            </h2>

            <form
              onSubmit={handleSubmitEdit(handleSaveEdit)}
              className="flex flex-col gap-4"
            >
              {/* Name */}

              <div>
                <label htmlFor="edit-name">
                  Name Certificate
                </label>

                <input
                  id="edit-name"
                  type="text"
                  {...registerEdit("name", {
                    required: "Name is required",
                    minLength: {
                      value: 3,
                      message: "Name must be at least 3 characters",
                    },
                  })}
                  className="w-full rounded border border-gray-300 p-2"
                />

                {errorsEdit.name && (
                  <p className="text-sm text-red-600">
                    {errorsEdit.name.message}
                  </p>
                )}
              </div>

              {/* Issuer */}

              <div>
                <label htmlFor="edit-issuer">
                  Issuing Organization
                </label>

                <input
                  id="edit-issuer"
                  type="text"
                  {...registerEdit("issuer", {
                    required: "Issuer is required",
                  })}
                  className="w-full rounded border border-gray-300 p-2"
                />

                {errorsEdit.issuer && (
                  <p className="text-sm text-red-600">
                    {errorsEdit.issuer.message}
                  </p>
                )}
              </div>

              {/* Dates */}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="edit-issueDate">
                    Issue Date
                  </label>

                  <input
                    id="edit-issueDate"
                    type="date"
                    {...registerEdit("issueDate", {
                      required: "Issue date is required",
                      
                    })}
                    className="w-full rounded border border-gray-300 p-2"
                  />

                  {errorsEdit.issueDate && (
                    <p className="text-sm text-red-600">
                      {errorsEdit.issueDate.message}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="edit-expirationDate">
                    Expiration Date
                  </label>

                  <input
                    id="edit-expirationDate"
                    type="date"
                    {...registerEdit("expirationDate", {
                      required: "Expiration date is required",
                    })}
                    className="w-full rounded border border-gray-300 p-2"
                  />

                  {errorsEdit.expirationDate && (
                    <p className="text-sm text-red-600">
                      {errorsEdit.expirationDate.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Credential ID */}

              <div>
                <label htmlFor="edit-credentialId">
                  Credential ID
                </label>

                <input
                  id="edit-credentialId"
                  type="text"
                  {...registerEdit("credentialId")}
                  className="w-full rounded border border-gray-300 p-2"
                />
              </div>

              {/* Credential URL */}

              <div>
                <label htmlFor="edit-credentialUrl">
                  Credential URL
                </label>

                <input
                  id="edit-credentialUrl"
                  type="url"
                  {...registerEdit("credentialUrl", {
                    required: "Credential URL is required",
                  })}
                  className="w-full rounded border border-gray-300 p-2"
                />

                {errorsEdit.credentialUrl && (
                  <p className="text-sm text-red-600">
                    {errorsEdit.credentialUrl.message}
                  </p>
                )}
              </div>

              {/* Buttons */}

              <div className="mt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingCertificate(null)}
                  className="rounded-md border border-gray-300 px-5 py-2 cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-md bg-gray-700 px-5 py-2 text-white cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================
          DELETE MODAL
      ================================================== */}

      {deletingCertificate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setDeletingCertificate(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-center text-2xl font-extrabold">
              Delete Certificate
            </h2>

            <p className="mt-4 text-center text-gray-600">
              Are you sure you want to delete{" "}
              <span className="font-bold">
                {deletingCertificate.name}
              </span>
              ?
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeletingCertificate(null)}
                className="rounded-md border border-gray-300 px-5 py-2 cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmDelete}
                className="rounded-md bg-red-600 px-5 py-2 text-white cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================
          VIEW MODAL
      ================================================== */}

      {viewingCertificate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setViewingCertificate(null)}
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-extrabold">
              {viewingCertificate.name}
            </h2>

            <div className="mt-4 space-y-2">
              <p>
                <strong>Issuer:</strong>{" "}
                {viewingCertificate.issuer}
              </p>

              <p>
                <strong>Issue Date:</strong>{" "}
                {viewingCertificate.issueDate}
              </p>

              <p>
                <strong>Expiration Date:</strong>{" "}
                {viewingCertificate.expirationDate}
              </p>

              {viewingCertificate.credentialId && (
                <p>
                  <strong>Credential ID:</strong>{" "}
                  {viewingCertificate.credentialId}
                </p>
              )}

              {viewingCertificate.credentialUrl && (
                <p>
                  <strong>Credential URL:</strong>{" "}
                  <a
                    href={viewingCertificate.credentialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    View Credential
                  </a>
                </p>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setViewingCertificate(null)}
                className="rounded-md border border-gray-300 px-5 py-2 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}