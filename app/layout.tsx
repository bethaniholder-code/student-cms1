import { Geist, Geist_Mono } from "next/font/google";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EduTrack — Student Manager",
  description: "English student management system",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="app-shell">
          <div className="sidebar">
            <div className="sidebar-logo">
              <div className="logo-icon">📚</div>
              <div>
                <div className="logo-text">EduTrack</div>
                <div className="logo-sub">English Student Manager</div>
              </div>
            </div>
            <nav className="sidebar-nav">
              <a href="/" className="nav-item">🏠 Dashboard</a>
              <a href="/add" className="nav-item">➕ Enroll Student</a>
            </nav>
            <div className="sidebar-footer">
              <div className="nav-item" style={{ opacity: 0.4, cursor: "default" }}>
                📖 Teacher Admin
              </div>
            </div>
          </div>

          <div className="main">
            <div className="topbar">
              <div className="topbar-left">
                <span className="topbar-title">Student Management</span>
              </div>
              <div className="topbar-right">
                <div className="user-group">
                  <div className="user-avatar">👨‍🏫</div>
                  <div>
                    <div className="user-name">Teacher</div>
                    <div className="user-role">Admin</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="content">
              {children}
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}