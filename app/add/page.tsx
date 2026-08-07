// app/add/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
// Use local createStudent wrapper to avoid relying on a missing external module.
// Posts to the API route that should handle student creation.
const createStudent = async (data: Record<string, any>) => {
  const res = await fetch("/api/students", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || "Failed to create student");
  }
  return res.json();
};
const EMPTY = {
  fullName: "",
  emailAddress: "",
  parentEmail: "",
  phone: "",
  level: "Beginner",
  status: "Active",
  enrollmentDate: "",
  notes: "",
  monthlyFee: "",
};

export default function AddStudent() {
  const router = useRouter();
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const set = (key: string, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.fullName.trim() || form.fullName.trim().length < 2)
      e.fullName = "Full name must be at least 2 characters";
    if (
      !form.emailAddress ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.emailAddress)
    )
      e.emailAddress = "Enter a valid email address";
    if (
      form.parentEmail &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.parentEmail)
    )
      e.parentEmail = "Enter a valid parent email";
    if (form.monthlyFee && isNaN(Number(form.monthlyFee)))
      e.monthlyFee = "Must be a number";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setServerError(null);
    try {
      await createStudent(form);
      router.push("/");
    } catch (err) {
      setServerError("Failed to add student. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page form-page">
      <a href="/" className="btn-back">
        Back to students
      </a>
      <div className="form-page-header">
        <div className="form-page-title">Enroll New Student</div>
        <div style={{ fontSize: 13, color: "#9ca3af" }}>
          Fill in the student details below
        </div>
      </div>

      {serverError && <div className="error-banner">{serverError}</div>}

      <form onSubmit={handleSubmit} className="student-form">
        <div className="form-section-title">Personal Info</div>
        <div className="form-row">
          <div className="form-group">
            <label>Full Name *</label>
            <input
              type="text"
              placeholder="Jane Smith"
              value={form.fullName}
              onChange={(e) => set("fullName", e.target.value)}
            />
            {errors.fullName && (
              <p className="field-error">{errors.fullName}</p>
            )}
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input
              type="tel"
              placeholder="+55 (11) 00000-0000"
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Student Email *</label>
            <input
              type="email"
              placeholder="student@email.com"
              value={form.emailAddress}
              onChange={(e) => set("emailAddress", e.target.value)}
            />
            {errors.emailAddress && (
              <p className="field-error">{errors.emailAddress}</p>
            )}
          </div>
          <div className="form-group">
            <label>Parent Email</label>
            <input
              type="email"
              placeholder="parent@email.com"
              value={form.parentEmail}
              onChange={(e) => set("parentEmail", e.target.value)}
            />
            {errors.parentEmail && (
              <p className="field-error">{errors.parentEmail}</p>
            )}
          </div>
        </div>

        <div className="form-section-title">Enrollment Details</div>
        <div className="form-row">
          <div className="form-group">
            <label>English Level</label>
            <select
              value={form.level}
              onChange={(e) => set("level", e.target.value)}
            >
              <option>Beginner</option>
              <option>Elementary</option>
              <option>Intermediate</option>
              <option>Upper Intermediate</option>
              <option>Advanced</option>
            </select>
          </div>
          <div className="form-group">
            <label>Status</label>
            <select
              value={form.status}
              onChange={(e) => set("status", e.target.value)}
            >
              <option>Active</option>
              <option>Inactive</option>
              <option>On Hold</option>
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Enrollment Date</label>
            <input
              type="date"
              value={form.enrollmentDate}
              onChange={(e) => set("enrollmentDate", e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Monthly Fee (R$)</label>
            <input
              type="text"
              placeholder="150"
              value={form.monthlyFee}
              onChange={(e) => set("monthlyFee", e.target.value)}
            />
            {errors.monthlyFee && (
              <p className="field-error">{errors.monthlyFee}</p>
            )}
          </div>
        </div>
        <div className="form-group">
          <label>Notes</label>
          <textarea
            rows={3}
            placeholder="e.g. Struggles with past tense, very motivated"
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
          />
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Saving..." : "Enroll Student"}
        </button>
      </form>
    </div>
  );
}
