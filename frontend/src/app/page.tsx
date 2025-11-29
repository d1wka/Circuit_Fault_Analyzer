"use client";

import { useState } from "react";
import { CIRCUIT_TEMPLATES, CircuitTemplate } from "../components/CircuitDiagrams";

interface Fault {
  type: string;
  location: string;
  severity: string;
  explanation: string;
}

interface Fix {
  fault_ref: string;
  action: string;
  details: string;
}

interface Analysis {
  components: string[];
  faults: Fault[];
  fixes: Fix[];
  health_rating: string;
  summary: string;
}

const SEV_COLORS: Record<string, string> = {
  HIGH:   "bg-red-950    border-red-500    text-red-200",
  MEDIUM: "bg-yellow-950 border-yellow-500 text-yellow-200",
  LOW:    "bg-blue-950   border-blue-500   text-blue-200",
};

const HEALTH_STYLE: Record<string, string> = {
  SAFE:     "bg-green-700 text-white",
  WARNING:  "bg-yellow-600 text-white",
  CRITICAL: "bg-red-700 text-white",
};

const HEALTH_ICON: Record<string, string> = {
  SAFE: "✓", WARNING: "⚠", CRITICAL: "✕",
};

// Group templates by category
const CATEGORIES = Array.from(
  new Set(CIRCUIT_TEMPLATES.map((t) => t.category))
);

export default function Home() {
  const [selected, setSelected] = useState<CircuitTemplate | null>(null);
  const [description, setDescription] = useState("");
  const [voltage, setVoltage] = useState("");
  const [current, setCurrent] = useState("");
  const [frequency, setFrequency] = useState("");
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [previewExpanded, setPreviewExpanded] = useState(true);

  function pickTemplate(t: CircuitTemplate) {
    setSelected(t);
    setDescription(t.description);
    setVoltage(t.voltage?.toString() ?? "");
    setCurrent(t.current?.toString() ?? "");
    setFrequency(t.frequency?.toString() ?? "");
    setAnalysis(null);
    setError("");
    setPreviewExpanded(true);
  }

  function clearTemplate() {
    setSelected(null);
    setDescription("");
    setVoltage("");
    setCurrent("");
    setFrequency("");
    setAnalysis(null);
    setError("");
  }

  async function handleAnalyze() {
    if (!description.trim()) return;
    setLoading(true);
    setError("");
    setAnalysis(null);
    try {
      const res = await fetch("http://localhost:8000/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description,
          voltage:   voltage   ? parseFloat(voltage)   : null,
          current:   current   ? parseFloat(current)   : null,
          frequency: frequency ? parseFloat(frequency) : null,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      setAnalysis(await res.json());
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-950 text-gray-100 font-sans">

      {/* ── Sidebar ───────────────────────────────────────────────────────── */}
      <aside className="w-56 shrink-0 bg-gray-900 border-r border-gray-800 overflow-y-auto flex flex-col">
        <div className="px-4 py-4 border-b border-gray-800 sticky top-0 bg-gray-900 z-10">
          <p className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">
            Circuit Library
          </p>
          <p className="text-[10px] text-gray-600 mt-0.5">
            {CIRCUIT_TEMPLATES.length} templates
          </p>
        </div>

        {CATEGORIES.map((cat) => (
          <div key={cat} className="mt-1">
            <p className="px-4 py-1.5 text-[9px] font-bold text-gray-600 uppercase tracking-widest">
              {cat}
            </p>
            {CIRCUIT_TEMPLATES.filter((t) => t.category === cat).map((t) => (
              <button
                key={t.id}
                onClick={() => pickTemplate(t)}
                className={`w-full text-left px-4 py-2 text-xs flex items-start gap-2 transition-colors
                  ${selected?.id === t.id
                    ? "bg-gray-800 border-l-2 border-cyan-400 text-white"
                    : "text-gray-400 hover:bg-gray-800 hover:text-gray-200 border-l-2 border-transparent"
                  }`}
              >
                <span className={`mt-0.5 text-[10px] shrink-0 ${t.hasFault ? "text-red-400" : "text-green-500"}`}>
                  {t.hasFault ? "⚠" : "○"}
                </span>
                <span className="leading-tight">{t.name}</span>
              </button>
            ))}
          </div>
        ))}

        <div className="mt-auto px-4 py-3 border-t border-gray-800 text-[9px] text-gray-700">
          ⚠ red = fault circuit
        </div>
      </aside>

      {/* ── Main ──────────────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto">

        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b border-gray-800 flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-bold text-cyan-400 tracking-tight">
              Circuit Fault Analyzer
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Select a template or describe any circuit — Gemini AI diagnoses faults
            </p>
          </div>
          {selected && (
            <span className={`text-xs px-2 py-1 rounded-full border font-medium ${
              selected.hasFault
                ? "bg-red-950 border-red-700 text-red-300"
                : "bg-green-950 border-green-700 text-green-300"
            }`}>
              {selected.hasFault ? "⚠ Fault Circuit" : "✓ Reference Circuit"}
            </span>
          )}
        </div>

        <div className="p-5 space-y-4 max-w-3xl">

          {/* ── Circuit diagram preview ──────────────────────────────────── */}
          {selected && (
            <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
              {/* Preview header */}
              <div className="flex items-center justify-between px-4 py-2 border-b border-gray-800">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-white">{selected.name}</span>
                  <span className="text-[10px] text-gray-600">{selected.category}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-gray-600">SVG Schematic</span>
                  <button
                    onClick={() => setPreviewExpanded((v) => !v)}
                    className="text-xs text-gray-500 hover:text-gray-300 transition"
                  >
                    {previewExpanded ? "▲ collapse" : "▼ expand"}
                  </button>
                </div>
              </div>

              {/* Diagram canvas */}
              {previewExpanded && (
                <div
                  className="bg-gray-950 px-6 py-4"
                  style={{ height: 230 }}
                >
                  {(() => {
                    const Diagram = selected.Diagram;
                    return <Diagram />;
                  })()}
                </div>
              )}

              {/* Legend row */}
              <div className="flex gap-4 px-4 py-2 text-[10px] text-gray-600 border-t border-gray-800">
                <span className="flex items-center gap-1">
                  <span className="inline-block w-4 h-px bg-sky-400 mt-0.5" /> Component
                </span>
                <span className="flex items-center gap-1">
                  <span className="inline-block w-4 h-px bg-slate-500 mt-0.5" /> Wire
                </span>
                <span className="flex items-center gap-1">
                  <span className="inline-block w-4 h-px bg-red-400 mt-0.5" /> Fault
                </span>
                <span className="flex items-center gap-1">
                  <span className="inline-block w-4 h-px bg-green-400 mt-0.5 border-dashed border-t" /> Signal / Vout
                </span>
              </div>
            </div>
          )}

          {/* ── Input form ──────────────────────────────────────────────── */}
          <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
            {selected && (
              <div className="flex items-center gap-2 mb-3 text-[11px]">
                <span className="text-cyan-500 font-medium">Template loaded:</span>
                <span className="text-gray-300">{selected.name}</span>
                <button
                  onClick={clearTemplate}
                  className="ml-auto text-gray-600 hover:text-gray-300 text-xs transition"
                >
                  ✕ Clear
                </button>
              </div>
            )}

            <label className="block text-xs text-gray-500 mb-1 uppercase tracking-wide">
              Circuit Description *
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your circuit — components, topology, connections, values…"
              className="w-full bg-gray-800 rounded-lg p-3 text-sm border border-gray-700
                focus:outline-none focus:border-cyan-500 mb-3 resize-none"
            />

            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                { label: "Voltage (V)", value: voltage, set: setVoltage },
                { label: "Current (A)", value: current, set: setCurrent },
                { label: "Frequency (Hz)", value: frequency, set: setFrequency },
              ].map((f) => (
                <div key={f.label}>
                  <label className="block text-[10px] text-gray-600 mb-1 uppercase tracking-wide">
                    {f.label}
                  </label>
                  <input
                    type="number"
                    value={f.value}
                    onChange={(e) => f.set(e.target.value)}
                    className="w-full bg-gray-800 rounded-lg p-2 text-sm border border-gray-700
                      focus:outline-none focus:border-cyan-500"
                  />
                </div>
              ))}
            </div>

            <button
              onClick={handleAnalyze}
              disabled={loading || !description.trim()}
              className="w-full py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 font-semibold
                text-sm transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? "Analyzing circuit…" : "Analyze Circuit with Gemini"}
            </button>
            {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
          </div>

          {/* ── Analysis results ──────────────────────────────────────────── */}
          {analysis && (
            <div className="space-y-3">

              {/* Health badge */}
              <div className={`rounded-xl p-4 flex items-center gap-3 font-bold text-base
                ${HEALTH_STYLE[analysis.health_rating] ?? "bg-gray-700 text-white"}`}>
                <span className="text-xl">
                  {HEALTH_ICON[analysis.health_rating] ?? "?"}
                </span>
                Circuit Health: {analysis.health_rating}
                <span className="ml-auto text-sm font-normal opacity-80">
                  {analysis.faults.length} fault{analysis.faults.length !== 1 ? "s" : ""} detected
                </span>
              </div>

              {/* Summary */}
              <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
                <h2 className="text-xs font-bold text-cyan-400 uppercase tracking-wide mb-2">
                  Summary
                </h2>
                <p className="text-sm text-gray-300 leading-relaxed">{analysis.summary}</p>
              </div>

              {/* Components */}
              <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
                <h2 className="text-xs font-bold text-cyan-400 uppercase tracking-wide mb-2">
                  Identified Components
                </h2>
                <div className="flex flex-wrap gap-2">
                  {analysis.components.map((c, i) => (
                    <span key={i}
                      className="text-xs px-2.5 py-1 bg-gray-800 rounded-full border border-gray-700 text-gray-300">
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              {/* Faults */}
              {analysis.faults.length > 0 && (
                <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
                  <h2 className="text-xs font-bold text-cyan-400 uppercase tracking-wide mb-3">
                    Detected Faults ({analysis.faults.length})
                  </h2>
                  <div className="space-y-2">
                    {analysis.faults.map((f, i) => (
                      <div key={i}
                        className={`border rounded-lg p-3 text-sm
                          ${SEV_COLORS[f.severity?.toUpperCase()] ?? "bg-gray-800 border-gray-700 text-gray-300"}`}>
                        <div className="flex justify-between font-semibold mb-1">
                          <span>{f.type}</span>
                          <span className="text-[10px] uppercase tracking-widest opacity-70">
                            {f.severity}
                          </span>
                        </div>
                        <p className="text-[11px] opacity-60 mb-1">Location: {f.location}</p>
                        <p className="text-xs leading-relaxed">{f.explanation}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Fixes */}
              {analysis.fixes.length > 0 && (
                <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
                  <h2 className="text-xs font-bold text-cyan-400 uppercase tracking-wide mb-3">
                    Recommended Fixes
                  </h2>
                  <div className="space-y-2">
                    {analysis.fixes.map((f, i) => (
                      <div key={i}
                        className="bg-gray-800 rounded-lg p-3 border border-gray-700">
                        <p className="text-sm font-semibold text-green-400 mb-1">{f.action}</p>
                        <p className="text-xs text-gray-400 leading-relaxed">{f.details}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}
        </div>
      </main>
    </div>
  );
}
