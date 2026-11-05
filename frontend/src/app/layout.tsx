import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "ServiceDesk | Incident Resolution System",
  description: "Intelligent IT Service Management & Incident Resolution System (ServiceDesk)",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <header
            style={{
              backgroundColor: "var(--bg-surface)",
              borderBottom: "1px solid var(--border-color)",
              padding: "1rem 2rem",
            }}
          >
            <div
              style={{
                maxWidth: "1100px",
                margin: "0 auto",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: "0.5rem",
                }}
              >
                <span
                  style={{
                    fontSize: "1.125rem",
                    fontWeight: 700,
                    letterSpacing: "-0.025em",
                    color: "var(--text-primary)",
                  }}
                >
                  ServiceDesk
                </span>
                <span
                  style={{
                    fontSize: "0.8125rem",
                    color: "var(--text-muted)",
                  }}
                >
                  Platform
                </span>
              </div>
              <nav
                style={{
                  fontSize: "0.875rem",
                  color: "var(--text-secondary)",
                }}
              >
                <span>v0.1.0-alpha</span>
              </nav>
            </div>
          </header>

          <main
            style={{
              flex: 1,
              maxWidth: "1100px",
              width: "100%",
              margin: "0 auto",
              padding: "2.5rem 2rem",
            }}
          >
            {children}
          </main>

          <footer
            style={{
              backgroundColor: "var(--bg-surface)",
              borderTop: "1px solid var(--border-color)",
              padding: "1.5rem 2rem",
              fontSize: "0.8125rem",
              color: "var(--text-muted)",
            }}
          >
            <div
              style={{
                maxWidth: "1100px",
                margin: "0 auto",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span>ServiceDesk &bull; OOP Course Project</span>
              <span>Backend Domain Isolation Enabled</span>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
