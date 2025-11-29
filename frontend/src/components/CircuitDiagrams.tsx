import React from "react";

// ── Palette ────────────────────────────────────────────────────────────────
const W  = "#475569"; // wire
const CC = "#38bdf8"; // component/cyan
const FC = "#f87171"; // fault/red
const LC = "#94a3b8"; // label/slate
const GC = "#4ade80"; // good/green
const AM = "#fbbf24"; // amber – LED
const BG = "#020617"; // dark component fill

// ── Primitive elements ─────────────────────────────────────────────────────

function Ground({ x, y }: { x: number; y: number }) {
  return (
    <g stroke={W} strokeWidth="1.5" fill="none">
      <line x1={x} y1={y} x2={x} y2={y + 7} />
      <line x1={x - 14} y1={y + 7} x2={x + 14} y2={y + 7} />
      <line x1={x - 9}  y1={y + 12} x2={x + 9}  y2={y + 12} />
      <line x1={x - 4}  y1={y + 17} x2={x + 4}  y2={y + 17} />
    </g>
  );
}

function DCSource({ cx, cy, label }: { cx: number; cy: number; label: string }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={22} stroke={CC} strokeWidth="1.5" fill={BG} />
      <text x={cx} y={cy - 4} textAnchor="middle" fill={GC} fontSize="12" fontWeight="bold">+</text>
      <text x={cx} y={cy + 10} textAnchor="middle" fill={FC} fontSize="12" fontWeight="bold">−</text>
      <text x={cx + 26} y={cy - 8} fill={LC} fontSize="9">{label}</text>
    </g>
  );
}

function ACSource({ cx, cy, label }: { cx: number; cy: number; label: string }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={22} stroke={CC} strokeWidth="1.5" fill={BG} />
      <path
        d={`M${cx - 11},${cy} Q${cx - 5},${cy - 10} ${cx},${cy} Q${cx + 5},${cy + 10} ${cx + 11},${cy}`}
        stroke={CC} strokeWidth="1.5" fill="none"
      />
      <text x={cx + 26} y={cy - 8} fill={LC} fontSize="9">{label}</text>
    </g>
  );
}

function ResistorH({
  x1, y, x2, label, fault,
}: { x1: number; y: number; x2: number; label: string; fault?: boolean }) {
  const mid = (x1 + x2) / 2;
  const bw = 38, bh = 14, rx = mid - bw / 2;
  return (
    <g>
      <line x1={x1} y1={y} x2={rx}      y2={y} stroke={W}           strokeWidth="1.5" />
      <rect x={rx} y={y - bh / 2} width={bw} height={bh} rx="2"
        stroke={fault ? FC : CC} strokeWidth="1.5" fill={BG} />
      <line x1={rx + bw} y1={y} x2={x2} y2={y} stroke={W}           strokeWidth="1.5" />
      <text x={mid} y={y - 11} textAnchor="middle" fill={LC} fontSize="9">{label}</text>
    </g>
  );
}

function ResistorV({
  x, y1, y2, label, fault,
}: { x: number; y1: number; y2: number; label: string; fault?: boolean }) {
  const mid = (y1 + y2) / 2;
  const bh = 36, bw = 14, ry = mid - bh / 2;
  return (
    <g>
      <line x1={x} y1={y1}      x2={x} y2={ry}      stroke={W}           strokeWidth="1.5" />
      <rect x={x - bw / 2} y={ry} width={bw} height={bh} rx="2"
        stroke={fault ? FC : CC} strokeWidth="1.5" fill={BG} />
      <line x1={x} y1={ry + bh} x2={x} y2={y2}      stroke={W}           strokeWidth="1.5" />
      <text x={x + 13} y={mid + 4} fill={LC} fontSize="9">{label}</text>
    </g>
  );
}

function CapV({ x, y1, y2, label }: { x: number; y1: number; y2: number; label: string }) {
  const mid = (y1 + y2) / 2;
  return (
    <g>
      <line x1={x} y1={y1}     x2={x} y2={mid - 8} stroke={W}  strokeWidth="1.5" />
      <line x1={x - 16} y1={mid - 8} x2={x + 16} y2={mid - 8}  stroke={CC} strokeWidth="2" />
      <line x1={x - 16} y1={mid + 8} x2={x + 16} y2={mid + 8}  stroke={CC} strokeWidth="2" />
      <line x1={x} y1={mid + 8} x2={x} y2={y2}    stroke={W}  strokeWidth="1.5" />
      <text x={x + 22} y={mid + 4} fill={LC} fontSize="9">{label}</text>
    </g>
  );
}

function CapH({ x1, y, x2, label }: { x1: number; y: number; x2: number; label: string }) {
  const mid = (x1 + x2) / 2;
  return (
    <g>
      <line x1={x1}     y1={y} x2={mid - 8} y2={y} stroke={W}  strokeWidth="1.5" />
      <line x1={mid - 8} y1={y - 15} x2={mid - 8} y2={y + 15}  stroke={CC} strokeWidth="2" />
      <line x1={mid + 8} y1={y - 15} x2={mid + 8} y2={y + 15}  stroke={CC} strokeWidth="2" />
      <line x1={mid + 8} y1={y} x2={x2}     y2={y} stroke={W}  strokeWidth="1.5" />
      <text x={mid} y={y - 20} textAnchor="middle" fill={LC} fontSize="9">{label}</text>
    </g>
  );
}

function InductorH({ x1, y, x2, label }: { x1: number; y: number; x2: number; label: string }) {
  const n = 3;
  const inner = x2 - x1 - 14;
  const bw = inner / n;
  const sx = x1 + 7;
  let d = `M${x1},${y} L${sx},${y}`;
  for (let i = 0; i < n; i++) {
    const bx = sx + i * bw;
    // sweep=0 → arcs bulge upward (visually above the wire)
    d += ` A${bw / 2},${bw / 2} 0 0 0 ${bx + bw},${y}`;
  }
  d += ` L${x2},${y}`;
  return (
    <g>
      <path d={d} stroke={CC} strokeWidth="1.5" fill="none" />
      <text x={(x1 + x2) / 2} y={y + 18} textAnchor="middle" fill={LC} fontSize="9">{label}</text>
    </g>
  );
}

function LED_H({ ax, y, fault }: { ax: number; y: number; fault?: boolean }) {
  // ax = anode x. Triangle base left (ax, y±13), apex right (ax+30, y).
  const kx = ax + 30;
  const sc = fault ? FC : AM;
  return (
    <g>
      <polygon points={`${ax},${y - 13} ${ax},${y + 13} ${kx},${y}`}
        stroke={sc} strokeWidth="1.5" fill={fault ? "#450a0a" : "#1c1100"} />
      {/* Cathode bar */}
      <line x1={kx} y1={y - 13} x2={kx} y2={y + 13} stroke={sc} strokeWidth="2" />
      {/* Light rays (above wire level) */}
      <line x1={kx + 5} y1={y - 5}  x2={kx + 16} y2={y - 16} stroke={sc} strokeWidth="1.5" />
      <line x1={kx + 12} y1={y - 16} x2={kx + 16} y2={y - 16} stroke={sc} strokeWidth="1.5" />
      <line x1={kx + 16} y1={y - 16} x2={kx + 16} y2={y - 12} stroke={sc} strokeWidth="1.5" />
      <line x1={kx + 5} y1={y - 1}  x2={kx + 16} y2={y - 12} stroke={sc} strokeWidth="1.5" />
      <line x1={kx + 12} y1={y - 12} x2={kx + 16} y2={y - 12} stroke={sc} strokeWidth="1.5" />
      <line x1={kx + 16} y1={y - 12} x2={kx + 16} y2={y - 8}  stroke={sc} strokeWidth="1.5" />
      <text x={ax + 15} y={y + 27} textAnchor="middle" fill={LC} fontSize="9">LED</text>
    </g>
  );
}

function Diode_H({ ax, y }: { ax: number; y: number }) {
  const kx = ax + 26;
  return (
    <g>
      <polygon points={`${ax},${y - 12} ${ax},${y + 12} ${kx},${y}`}
        stroke={CC} strokeWidth="1.5" fill={BG} />
      <line x1={kx} y1={y - 12} x2={kx} y2={y + 12} stroke={CC} strokeWidth="2" />
      <text x={ax + 13} y={y + 26} textAnchor="middle" fill={LC} fontSize="9">D1</text>
    </g>
  );
}

function NodeDot({ x, y }: { x: number; y: number }) {
  return <circle cx={x} cy={y} r={3.5} fill={W} />;
}

// ── Helper: standard rectangular loop wires ────────────────────────────────
// Battery at (bx, 90), top rail y=35, bottom rail y=145, right close at rx=255

function LoopWires({ bx = 47, rx = 255, ty = 35, by = 145 }: {
  bx?: number; rx?: number; ty?: number; by?: number
}) {
  return (
    <g stroke={W} strokeWidth="1.5">
      {/* Battery terminals */}
      <line x1={bx} y1={ty} x2={bx} y2={68} />
      <line x1={bx} y1={112} x2={bx} y2={by} />
      {/* Right close + bottom */}
      <line x1={rx} y1={ty} x2={rx} y2={by} />
      <line x1={bx} y1={by} x2={rx} y2={by} />
    </g>
  );
}

// ── Circuits ───────────────────────────────────────────────────────────────

function LEDFaulty() {
  return (
    <svg viewBox="0 0 300 180" style={{ width: "100%", height: "100%" }}>
      <LoopWires />
      {/* Top wire: left segment */}
      <line x1={47} y1={35} x2={100} y2={35} stroke={W} strokeWidth="1.5" />
      {/* Top wire: right segment from LED cathode (ax+30=130) */}
      <line x1={130} y1={35} x2={255} y2={35} stroke={W} strokeWidth="1.5" />
      <DCSource cx={47} cy={90} label="+5V" />
      <LED_H ax={100} y={35} fault />
      {/* Fault banner */}
      <rect x={148} y={5} width={122} height={18} rx="4" fill="#450a0a" opacity="0.95" />
      <text x={209} y={17} textAnchor="middle" fill={FC} fontSize="10" fontWeight="bold">
        ⚠ Missing Resistor!
      </text>
      <Ground x={151} y={145} />
    </svg>
  );
}

function LEDCorrect() {
  // R 47→147, gap wire 147→157, LED ax=157
  return (
    <svg viewBox="0 0 300 180" style={{ width: "100%", height: "100%" }}>
      <LoopWires />
      <ResistorH x1={47} y={35} x2={150} label="330Ω" />
      {/* Wire between R end and LED anode */}
      <line x1={150} y1={35} x2={158} y2={35} stroke={W} strokeWidth="1.5" />
      <LED_H ax={158} y={35} />
      {/* Wire: LED cathode → right close */}
      <line x1={188} y1={35} x2={255} y2={35} stroke={W} strokeWidth="1.5" />
      <DCSource cx={47} cy={90} label="+5V" />
      {/* Safe banner */}
      <rect x={198} y={5} width={72} height={18} rx="4" fill="#052e16" opacity="0.95" />
      <text x={234} y={17} textAnchor="middle" fill={GC} fontSize="10" fontWeight="bold">
        ✓ SAFE
      </text>
      <Ground x={151} y={145} />
    </svg>
  );
}

function HBridgeFault() {
  function Transistor(cx: number, cy: number, label: string, isFault: boolean) {
    const sc = isFault ? FC : CC;
    const fill = isFault ? "#450a0a" : BG;
    return (
      <g key={label}>
        <rect x={cx - 18} y={cy - 18} width={36} height={36} rx="5"
          stroke={sc} strokeWidth="1.5" fill={fill} />
        <text x={cx} y={cy + 5} textAnchor="middle"
          fill={isFault ? FC : CC} fontSize="12" fontWeight="bold">{label}</text>
      </g>
    );
  }

  return (
    <svg viewBox="0 0 300 180" style={{ width: "100%", height: "100%" }}>
      {/* VCC and GND rails */}
      <line x1={55} y1={22} x2={245} y2={22} stroke={CC} strokeWidth="2" />
      <line x1={55} y1={158} x2={245} y2={158} stroke={W} strokeWidth="1.5" />
      <text x={36} y={26} fill={CC} fontSize="9" fontWeight="bold">VCC</text>
      <text x={36} y={162} fill={LC} fontSize="9">GND</text>

      {/* Left column: x=92 */}
      <line x1={92} y1={22}  x2={92} y2={42}  stroke={W} strokeWidth="1.5" />
      {Transistor(92, 60, "Q1", true)}
      <line x1={92} y1={78}  x2={92} y2={90}  stroke={W} strokeWidth="1.5" />
      <line x1={92} y1={90}  x2={92} y2={102} stroke={W} strokeWidth="1.5" />
      {Transistor(92, 120, "Q2", true)}
      <line x1={92} y1={138} x2={92} y2={158} stroke={W} strokeWidth="1.5" />

      {/* Right column: x=208 */}
      <line x1={208} y1={22}  x2={208} y2={42}  stroke={W} strokeWidth="1.5" />
      {Transistor(208, 60, "Q3", false)}
      <line x1={208} y1={78}  x2={208} y2={90}  stroke={W} strokeWidth="1.5" />
      <line x1={208} y1={90}  x2={208} y2={102} stroke={W} strokeWidth="1.5" />
      {Transistor(208, 120, "Q4", false)}
      <line x1={208} y1={138} x2={208} y2={158} stroke={W} strokeWidth="1.5" />

      {/* Motor */}
      <line x1={92}  y1={90} x2={122} y2={90} stroke={W} strokeWidth="1.5" />
      <rect x={122} y={79} width={56} height={22} rx="4"
        stroke={CC} strokeWidth="1.5" fill={BG} />
      <text x={150} y={94} textAnchor="middle" fill={CC} fontSize="13" fontWeight="bold">M</text>
      <line x1={178} y1={90} x2={208} y2={90} stroke={W} strokeWidth="1.5" />

      {/* Shoot-through path indicator on left side */}
      <line x1={73} y1={22} x2={73} y2={158}
        stroke={FC} strokeWidth="1.5" strokeDasharray="4,2" opacity="0.7" />
      <text x={58} y={92} textAnchor="middle" fill={FC} fontSize="8"
        transform="rotate(-90,58,92)">SHORT</text>

      {/* Fault banner */}
      <rect x={82} y={5} width={136} height={15} rx="3" fill="#450a0a" opacity="0.95" />
      <text x={150} y={15} textAnchor="middle" fill={FC} fontSize="9" fontWeight="bold">
        ⚠ SHOOT-THROUGH FAULT
      </text>
    </svg>
  );
}

function RCLowPass() {
  return (
    <svg viewBox="0 0 300 180" style={{ width: "100%", height: "100%" }}>
      {/* Source wires */}
      <line x1={47} y1={35}  x2={47} y2={68}  stroke={W} strokeWidth="1.5" />
      <line x1={47} y1={112} x2={47} y2={148} stroke={W} strokeWidth="1.5" />
      {/* Bottom wire to cap */}
      <line x1={47} y1={148} x2={188} y2={148} stroke={W} strokeWidth="1.5" />
      {/* R on top wire */}
      <ResistorH x1={47} y={35} x2={168} label="R = 10 kΩ" />
      {/* Wire from R to node */}
      <line x1={168} y1={35} x2={188} y2={35} stroke={W} strokeWidth="1.5" />
      <NodeDot x={188} y={35} />
      {/* C vertical */}
      <CapV x={188} y1={35} y2={148} label="C = 100 nF" />
      {/* Vout dashed */}
      <line x1={188} y1={35} x2={255} y2={35}
        stroke={GC} strokeWidth="1.2" strokeDasharray="5,3" />
      <text x={260} y={38} fill={GC} fontSize="9">Vout</text>
      <text x={52}  y={28} fill={LC} fontSize="9">Vin</text>
      <ACSource cx={47} cy={90} label="~" />
      <Ground x={188} y={148} />
    </svg>
  );
}

function RCHighPass() {
  return (
    <svg viewBox="0 0 300 180" style={{ width: "100%", height: "100%" }}>
      <line x1={47} y1={35}  x2={47} y2={68}  stroke={W} strokeWidth="1.5" />
      <line x1={47} y1={112} x2={47} y2={148} stroke={W} strokeWidth="1.5" />
      <line x1={47} y1={148} x2={188} y2={148} stroke={W} strokeWidth="1.5" />
      {/* C on top wire */}
      <CapH x1={47} y={35} x2={168} label="C = 100 nF" />
      <line x1={168} y1={35} x2={188} y2={35} stroke={W} strokeWidth="1.5" />
      <NodeDot x={188} y={35} />
      {/* R vertical */}
      <ResistorV x={188} y1={35} y2={148} label="R = 10 kΩ" />
      <line x1={188} y1={35} x2={255} y2={35}
        stroke={GC} strokeWidth="1.2" strokeDasharray="5,3" />
      <text x={260} y={38} fill={GC} fontSize="9">Vout</text>
      <text x={52}  y={28} fill={LC} fontSize="9">Vin</text>
      <ACSource cx={47} cy={90} label="~" />
      <Ground x={188} y={148} />
    </svg>
  );
}

function VoltageDivider() {
  return (
    <svg viewBox="0 0 300 180" style={{ width: "100%", height: "100%" }}>
      {/* DC source */}
      <line x1={55} y1={35}  x2={55} y2={68}  stroke={W} strokeWidth="1.5" />
      <line x1={55} y1={112} x2={55} y2={148} stroke={W} strokeWidth="1.5" />
      <DCSource cx={55} cy={90} label="+12V" />
      {/* Top wire */}
      <line x1={55} y1={35} x2={170} y2={35} stroke={W} strokeWidth="1.5" />
      {/* R1 vertical from (170,35) to (170,90) */}
      <ResistorV x={170} y1={35} y2={90} label="R1 = 10 kΩ" />
      {/* Mid node */}
      <NodeDot x={170} y={90} />
      {/* Vout tap */}
      <line x1={170} y1={90} x2={245} y2={90}
        stroke={GC} strokeWidth="1.2" strokeDasharray="5,3" />
      <text x={250} y={93} fill={GC} fontSize="9">Vout = 6V</text>
      {/* R2 vertical from (170,90) to (170,148) */}
      <ResistorV x={170} y1={90} y2={148} label="R2 = 10 kΩ" />
      {/* Bottom wire */}
      <line x1={55} y1={148} x2={170} y2={148} stroke={W} strokeWidth="1.5" />
      <Ground x={170} y={148} />
    </svg>
  );
}

function SeriesRLC() {
  return (
    <svg viewBox="0 0 300 180" style={{ width: "100%", height: "100%" }}>
      <LoopWires rx={260} />
      {/* R | L | C in series on top wire */}
      <ResistorH x1={47}  y={35} x2={120} label="R = 10Ω" />
      <InductorH  x1={120} y={35} x2={195} label="L = 50 mH" />
      <CapH       x1={195} y={35} x2={260} label="C = 47 μF" />
      {/* Right close wire */}
      <line x1={260} y1={35} x2={260} y2={145} stroke={W} strokeWidth="1.5" />
      <line x1={47}  y1={35} x2={47}  y2={68}  stroke={W} strokeWidth="1.5" />
      <line x1={47}  y1={112} x2={47} y2={145} stroke={W} strokeWidth="1.5" />
      <ACSource cx={47} cy={90} label="120V 60Hz" />
      <Ground x={153} y={145} />
    </svg>
  );
}

function HalfWaveRectifier() {
  return (
    <svg viewBox="0 0 300 180" style={{ width: "100%", height: "100%" }}>
      {/* AC source */}
      <line x1={47} y1={35}  x2={47} y2={68}  stroke={W} strokeWidth="1.5" />
      <line x1={47} y1={112} x2={47} y2={148} stroke={W} strokeWidth="1.5" />
      {/* Bottom wire */}
      <line x1={47} y1={148} x2={198} y2={148} stroke={W} strokeWidth="1.5" />
      {/* Top left wire → diode */}
      <line x1={47} y1={35} x2={105} y2={35} stroke={W} strokeWidth="1.5" />
      <Diode_H ax={105} y={35} />
      {/* Wire from diode → node */}
      <line x1={131} y1={35} x2={198} y2={35} stroke={W} strokeWidth="1.5" />
      <NodeDot x={198} y={35} />
      {/* RL load vertical */}
      <ResistorV x={198} y1={35} y2={148} label="RL = 1 kΩ" />
      {/* Vout measurement */}
      <line x1={198} y1={35}  x2={258} y2={35}
        stroke={GC} strokeWidth="1.2" strokeDasharray="5,3" />
      <line x1={198} y1={148} x2={258} y2={148}
        stroke={W}  strokeWidth="1"   strokeDasharray="5,3" />
      <text x={262} y={38}  fill={GC} fontSize="9">Vout+</text>
      <text x={262} y={152} fill={LC} fontSize="9">GND</text>
      <text x={44}  y={28}  fill={LC} fontSize="9">Vin~</text>
      <ACSource cx={47} cy={90} label="230V 50Hz" />
      <Ground x={198} y={148} />
    </svg>
  );
}

// ── Template registry ──────────────────────────────────────────────────────

export interface CircuitTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  voltage?: number;
  current?: number;
  frequency?: number;
  hasFault: boolean;
  Diagram: React.FC;
}

export const CIRCUIT_TEMPLATES: CircuitTemplate[] = [
  {
    id: "led-faulty",
    name: "LED – No Resistor",
    category: "Common Faults",
    description:
      "5V DC supply connected directly to an LED with no current-limiting resistor. The LED will overdraw current and immediately burn out.",
    voltage: 5,
    hasFault: true,
    Diagram: LEDFaulty,
  },
  {
    id: "led-correct",
    name: "LED – With Resistor",
    category: "Common Faults",
    description:
      "5V DC supply driving an LED through a 330Ω current-limiting resistor in series. Output brightness is stable and component-safe.",
    voltage: 5,
    hasFault: false,
    Diagram: LEDCorrect,
  },
  {
    id: "hbridge-fault",
    name: "H-Bridge Shoot-Through",
    category: "Common Faults",
    description:
      "DC motor H-bridge where Q1 and Q2 on the left half-bridge are switched ON simultaneously, creating a direct VCC-to-GND short circuit through the left branch.",
    voltage: 12,
    current: 5,
    hasFault: true,
    Diagram: HBridgeFault,
  },
  {
    id: "rc-lowpass",
    name: "RC Low-Pass Filter",
    category: "Filters",
    description:
      "RC low-pass filter with R=10kΩ and C=100nF. Input is a 5Vpp sine wave at 1kHz. Output is measured across the capacitor. Analyse cutoff frequency and attenuation.",
    voltage: 5,
    frequency: 1000,
    hasFault: false,
    Diagram: RCLowPass,
  },
  {
    id: "rc-highpass",
    name: "RC High-Pass Filter",
    category: "Filters",
    description:
      "RC high-pass filter with C=100nF and R=10kΩ. Input is a 5Vpp sine wave at 1kHz. Output measured across the resistor. Analyse cutoff frequency and phase shift.",
    voltage: 5,
    frequency: 1000,
    hasFault: false,
    Diagram: RCHighPass,
  },
  {
    id: "series-rlc",
    name: "Series RLC Circuit",
    category: "AC Circuits",
    description:
      "Series RLC circuit with R=10Ω, L=50mH and C=47μF on a 120V 60Hz AC supply. Calculate impedance, resonant frequency, current, and quality factor Q.",
    voltage: 120,
    frequency: 60,
    hasFault: false,
    Diagram: SeriesRLC,
  },
  {
    id: "voltage-divider",
    name: "Voltage Divider",
    category: "DC Circuits",
    description:
      "Resistive voltage divider with R1=R2=10kΩ from a 12V DC supply. Output Vout is tapped between the two resistors. Verify the output voltage and loading effect.",
    voltage: 12,
    hasFault: false,
    Diagram: VoltageDivider,
  },
  {
    id: "half-wave-rect",
    name: "Half-Wave Rectifier",
    category: "DC Circuits",
    description:
      "Half-wave rectifier using a 1N4007 diode with a 1kΩ resistive load, supplied from 230V 50Hz AC. Analyse peak output voltage, ripple, and PIV of the diode.",
    voltage: 230,
    frequency: 50,
    hasFault: false,
    Diagram: HalfWaveRectifier,
  },
];
