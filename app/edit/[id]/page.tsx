"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

async function fetchStudentApi(id: string) {
  const res = await fetch(`/api/students/${id}`);
  if (!res.ok) {
    throw new Error("Failed to load student");
  }
  return res.json();
}

async function updateStudentApi(id: string, data: Record<string, any>) {
  const res = await fetch(`/api/students/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    throw new Error("Failed to update student");
  }
  return res.json();
}

export default function EditStudent () {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [fullName, setFullName]             = useState("");
  const [emailAddress, setEmailAddress]     = useState("");
  const [parentEmail, setParentEmail]       = useState("");
  const [phone, setPhone]                   = useState("");
  const [level, setLevel]                   = useState("Beginner");
  const [status, setStatus]                 = useState("Active");
  const [enrollmentDate, setEnrollmentDate] = useState("");
  const [notes, setNotes]                   = useState("");
  const [monthlyFee, setMonthlyFee]         = useState("");
  const [errors, setErrors]                 = useState<Record<string, string>>({});
  const [loading, setLoading]               = useState(false);
  const [fetching, setFetching]             = useState(true);
  const [serverError, setServerError]       = useState<string | null>(null);

  useEffect(() => {
    fetchStudentApi(id)
      .then((data: any) => {
        setFullName(data.fullName);
        setEmailAddress(data.emailAddress);
        setParentEmail(data.parentEmail);
        setPhone(data.phone);
        setLevel(data.level);
        setStatus(data.status);
        setEnrollmentDate(data.enrollmentDate);
        setNotes(data.notes);
        setMonthlyFee(data.monthlyFee);
      })
      .catch(() => setServerError("Could not load student."))
      .finally(() => setFetching(false));
  }, [id]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!fullName.trim() || fullName.trim().length < 2)
      e.fullName = "Full name must be at least 2 characters";
    if (!emailAddress || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailAddress))
      e.emailAddress = "Enter a valid email address";
    if (parentEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(parentEmail))
      e.parentEmail = "Enter a valid parent email";
    if (monthlyFee && isNaN(Number(monthlyFee)))
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
      await updateStudentApi(id, {
        fullName,
        emailAddress,
        parentEmail,
        phone,
        level,
        status,
        enrollmentDate,
        notes,
        monthlyFee,
      });
      router.push("/");
    } catch (err) {
      setServerError("Failed to update student. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="loading">Loading student...</div>;

  return (
    <div className="page form-page">
      <a href="/" className="btn-back">Back to students</a>
      <div className="form-page-header">
        <div className="form-page-title">Edit Student</div>
        {fullName && <div style={{ fontSize: 13, color: "#9ca3af" }}>Editing record for {fullName}</div>}
      </div>

      {serverError && <div className="error-banner">{serverError}</div>}

      <form onSubmit={handleSubmit} className="student-form">
        <div className="form-section-title">Personal Info</div>
        <div className="form-row">
          <div className="form-group">
            <label>Full Name *</label>
            <input type="text" placeholder="Jane Smith"
              value={fullName} onChange={e => setFullName(e.target.value)} />
            {errors.fullName && <p className="field-error">{errors.fullName}</p>}
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input type="tel" placeholder="+55 (11) 00000-0000"
              value={phone} onChange={e => setPhone(e.target.value)} />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Student Email *</label>
            <input type="email" placeholder="student@email.com"
              value={emailAddress} onChange={e => setEmailAddress(e.target.value)} />
            {errors.emailAddress && <p className="field-error">{errors.emailAddress}</p>}
          </div>
          <div className="form-group">
            <label>Parent Email</label>
            <input type="email" placeholder="parent@email.com"
              value={parentEmail} onChange={e => setParentEmail(e.target.value)} />
            {errors.parentEmail && <p className="field-error">{errors.parentEmail}</p>}
          </div>
        </div>

        <div className="form-section-title">Enrollment Details</div>
        <div className="form-row">
          <div className="form-group">
            <label>English Level</label>
            <select value={level} onChange={e => setLevel(e.target.value)}>
              <option>Beginner</option>
              <option>Elementary</option>
              <option>Intermediate</option>
              <option>Upper Intermediate</option>
              <option>Advanced</option>
            </select>
          </div>
          <div className="form-group">
            <label>Status</label>
            <select value={status} onChange={e => setStatus(e.target.value)}>
              <option>Active</option>
              <option>Inactive</option>
              <option>On Hold</option>
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Enrollment Date</label>
            <input type="date"
              value={enrollmentDate} onChange={e => setEnrollmentDate(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Monthly Fee (R$)</label>
            <input type="text" placeholder="150"
              value={monthlyFee} onChange={e => setMonthlyFee(e.target.value)} />
            {errors.monthlyFee && <p className="field-error">{errors.monthlyFee}</p>}
          </div>
        </div>
        <div className="form-group">
          <label>Notes</label>
          <textarea rows={3} placeholder="e.g. Struggles with past tense, very motivated"
            value={notes} onChange={e => setNotes(e.target.value)} />
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}