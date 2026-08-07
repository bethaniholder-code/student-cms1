// app/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

interface Student {
  id: string;
  fullName: string;
  emailAddress: string;
  parentEmail: string;
  phone: string;
  level: string;
  status: string;
  enrollmentDate: string;
  notes: string;
  monthlyFee: string;
}

const LEVEL_COLORS: Record<string, { bg: string; color: string }> = {
  "Beginner":           { bg: "#eff3ff", color: "#4f6ef7" },
  "Elementary":         { bg: "#f0fdf4", color: "#16a34a" },
  "Intermediate":       { bg: "#fffbeb", color: "#b45309" },
  "Upper Intermediate": { bg: "#fdf4ff", color: "#7e22ce" },
  "Advanced":           { bg: "#fff1f2", color: "#be123c" },
};

async function fetchStudentsApi(page: number, search: string, status: string) {
  const params = new URLSearchParams({
    page: String(page),
    limit: "10",
    search,
    status,
  });

  const res = await fetch(`/api/students?${params.toString()}`);
  if (!res.ok) {
    throw new Error("Failed to load student data");
  }
  return res.json();
}

async function deleteStudentApi(id: string) {
  const res = await fetch(`/api/students/${id}`, { method: "DELETE" });
  if (!res.ok) {
    throw new Error("Failed to delete student");
  }
}

export default function Dashboard() {
  const router = useRouter();

  const [students, setStudents]       = useState<Student[]>([]);
  const [total, setTotal]             = useState(0);
  const [totalPages, setTotalPages]   = useState(0);
  const [page, setPage]               = useState(1);
  const [search, setSearch]           = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState<string | null>(null);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchStudentsApi(page, search, statusFilter);
      setStudents(data.students);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError("Failed to load students. Check your Wix client ID in .env.local.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const clearSearch = () => {
    setSearchInput("");
    setSearch("");
    setPage(1);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Remove ${name}? This cannot be undone.`)) return;
    try {
      await deleteStudentApi(id);
      fetchStudents();
    } catch {
      alert("Failed to remove student.");
    }
  };

  const activeCount   = students.filter(s => s.status === "Active").length;
  const advancedCount = students.filter(s => s.level === "Advanced" || s.level === "Upper Intermediate").length;
  const monthlyRevenue = students.reduce((sum, s) => sum + (Number(s.monthlyFee) || 0), 0);

  return (
    <div className="page">

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue">👨‍🎓</div>
          <div>
            <div className="stat-label">Total Students</div>
            <div className="stat-value">{total}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">✅</div>
          <div>
            <div className="stat-label">Active</div>
            <div className="stat-value">{activeCount}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon purple">🎓</div>
          <div>
            <div className="stat-label">Advanced+</div>
            <div className="stat-value">{advancedCount}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon amber">💰</div>
          <div>
            <div className="stat-label">Monthly Revenue</div>
            <div className="stat-value">${monthlyRevenue.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="table-card">
        <div className="table-card-header">
          <span className="table-card-title">All Students</span>
          <div className="table-card-actions">

            <form onSubmit={handleSearch} style={{ display: "flex", gap: 6 }}>
              <input
                type="text"
                className="search-input"
                placeholder="Search by name…"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
              />
              <button type="submit" className="btn">Search</button>
              {search && (
                <button type="button" className="btn" onClick={clearSearch}>Clear</button>
              )}
            </form>

            <select
              className="filter-select"
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
            >
              <option value="">All statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="On Hold">On Hold</option>
            </select>

            <a href="/add" className="btn btn-primary">+ Add Student</a>
          </div>
        </div>

        {error && <div className="error-banner">{error}</div>}

        {loading ? (
          <div className="loading">Loading students…</div>
        ) : students.length === 0 ? (
          <div className="empty-state">
            <div style={{ fontSize: 40, marginBottom: 12 }}>👨‍🎓</div>
            <div style={{ fontWeight: 500, marginBottom: 4 }}>No students found</div>
            <div style={{ fontSize: 13, color: "#9ca3af" }}>Try a different search or add a new student</div>
          </div>
        ) : (
          <table className="student-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Contact</th>
                <th>Level</th>
                <th>Monthly Fee</th>
                <th>Enrolled</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map(s => {
                const initials = s.fullName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
                const levelStyle = LEVEL_COLORS[s.level] || LEVEL_COLORS["Beginner"];
                const statusClass = s.status === "Active" ? "active" : s.status === "On Hold" ? "on-hold" : "inactive";
                return (
                  <tr key={s.id}>
                    <td>
                      <div className="student-name-cell">
                        <div className="student-avatar">{initials}</div>
                        <div>
                          <div style={{ fontWeight: 500, color: "#1a1d23" }}>{s.fullName}</div>
                          {s.notes && (
                            <div style={{ fontSize: 11, color: "#9ca3af", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {s.notes}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div>{s.emailAddress}</div>
                      {s.phone && <div style={{ fontSize: 11, color: "#9ca3af" }}>{s.phone}</div>}
                    </td>
                    <td>
                      <span className="badge" style={{ background: levelStyle.bg, color: levelStyle.color }}>
                        {s.level}
                      </span>
                    </td>
                    <td>{s.monthlyFee ? `$${s.monthlyFee}` : "—"}</td>
                    <td style={{ color: "#6b7280" }}>
                      {s.enrollmentDate
                        ? new Date(s.enrollmentDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                        : "—"}
                    </td>
                    <td><span className={`badge ${statusClass}`}>{s.status}</span></td>
                    <td className="actions">
                      <button className="btn-edit" onClick={() => router.push(`/edit/${s.id}`)}>Edit</button>
                      <button className="btn-delete" onClick={() => handleDelete(s.id, s.fullName)}>Remove</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="table-footer">
            <span className="showing-text">Page {page} of {totalPages}</span>
            <div className="pagination">
              <button className="pg-btn" onClick={() => setPage(p => p - 1)} disabled={page === 1}>‹</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} className={`pg-btn ${p === page ? "active" : ""}`} onClick={() => setPage(p)}>{p}</button>
              ))}
              <button className="pg-btn" onClick={() => setPage(p => p + 1)} disabled={page === totalPages}>›</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}