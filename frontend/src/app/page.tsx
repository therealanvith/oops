"use client";

import { type HealthResponse, checkBackendHealth } from "@/lib/apiClient";
import { useEffect, useState } from "react";

export default function HomePage() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    async function loadHealth() {
      setLoading(true);
      const res = await checkBackendHealth();
      if (isMounted) {
        setHealth(res);
        setLoading(false);
      }
    }
    loadHealth();
    return () => {
      isMounted = false;
    };
  }, []);

  const isUp = health?.status === "UP";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      <section
        style={{
          borderBottom: "1px solid var(--border-color)",
          paddingBottom: "1.5rem",
        }}
      >
        <h1
          style={{
            fontSize: "1.75rem",
            fontWeight: 600,
            letterSpacing: "-0.03em",
            marginBottom: "0.5rem",
            color: "var(--text-primary)",
          }}
        >
          System Overview
        </h1>
        <p
          style={{
            fontSize: "0.9375rem",
            color: "var(--text-secondary)",
            maxWidth: "680px",
          }}
        >
          Intelligent IT Service Management &amp; Incident Resolution System. The backend domain
          layer operates framework-free, connected to Next.js via a stateless REST API.
        </p>
      </section>

      <section
        style={{
          backgroundColor: "var(--bg-surface)",
          border: "1px solid var(--border-color)",
          borderRadius: "6px",
          padding: "1.5rem",
          maxWidth: "540px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1rem",
          }}
        >
          <span
            style={{
              fontSize: "0.875rem",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: "var(--text-muted)",
            }}
          >
            Backend Service Status
          </span>
          {loading ? (
            <span
              style={{
                fontSize: "0.8125rem",
                color: "var(--text-muted)",
                fontFamily: "var(--font-mono)",
              }}
            >
              Checking...
            </span>
          ) : (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "0.25rem 0.625rem",
                borderRadius: "9999px",
                fontSize: "0.75rem",
                fontWeight: 600,
                fontFamily: "var(--font-mono)",
                backgroundColor: isUp ? "var(--status-up-bg)" : "var(--status-down-bg)",
                color: isUp ? "var(--status-up-text)" : "var(--status-down-text)",
                border: `1px solid ${isUp ? "var(--status-up-border)" : "var(--status-down-border)"}`,
              }}
            >
              Backend: {isUp ? "UP" : "DOWN"}
            </span>
          )}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "130px 1fr",
            rowGap: "0.625rem",
            fontSize: "0.875rem",
          }}
        >
          <span style={{ color: "var(--text-muted)" }}>Target URL:</span>
          <code
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.8125rem",
              color: "var(--text-primary)",
            }}
          >
            {process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080/api/v1"}
          </code>

          <span style={{ color: "var(--text-muted)" }}>Service:</span>
          <span style={{ color: "var(--text-primary)" }}>
            {health?.service ?? (loading ? "..." : "unavailable")}
          </span>

          <span style={{ color: "var(--text-muted)" }}>Server Time:</span>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.8125rem",
              color: "var(--text-primary)",
            }}
          >
            {health?.time ?? (loading ? "..." : "n/a")}
          </span>
        </div>
      </section>
    </div>
  );
}
