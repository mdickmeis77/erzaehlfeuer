"use client";

import { useState } from "react";

export function CopyButton({ text, label = "Kopieren" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className="btn"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch {
          // Zwischenablage nicht verfügbar – der Link steht ja sichtbar daneben
        }
      }}
    >
      {copied ? "Kopiert ✓" : label}
    </button>
  );
}
