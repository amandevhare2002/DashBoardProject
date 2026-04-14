"use client";

import { useState } from "react";
import { Resizable } from "re-resizable";
import { Label } from "reactstrap";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Legend,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  ZAxis,
  CartesianGrid,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Treemap,
  ComposedChart,
  RadialBarChart,
  RadialBar,
} from "recharts";
interface Column {
  Colname: string;
  Value: number;
  Color: string;
}

interface ChartDataItem {
  Name: string;
  Columns: Column[];
}

/**
 * Flat series: [{ name, <Colname>: Value, color_<Colname>: Color, ... }]
 * Used by Bar, Line, Area charts.
 */
function toFlatSeries(data: ChartDataItem[]) {
  return data.map((item) => {
    const row: Record<string, any> = { name: item.Name };
    item.Columns.forEach((col) => {
      row[col.Colname] = col.Value;
      row[`__color_${col.Colname}`] = col.Color;
    });
    return row;
  });
}

/** All unique column names across all items */
function getColNames(data: ChartDataItem[]): string[] {
  const seen = new Set<string>();
  data.forEach((d) => d.Columns.forEach((c) => seen.add(c.Colname)));
  return Array.from(seen);
}

/** First color per column name */
function getColColors(data: ChartDataItem[]): Record<string, string> {
  const map: Record<string, string> = {};
  data.forEach((d) =>
    d.Columns.forEach((c) => {
      if (!map[c.Colname]) map[c.Colname] = c.Color;
    }),
  );
  return map;
}

/** Pie/Donut: aggregate values per column across all periods */
function toPieData(data: ChartDataItem[]) {
  const map: Record<string, { value: number; color: string }> = {};
  data.forEach((d) =>
    d.Columns.forEach((c) => {
      if (!map[c.Colname]) map[c.Colname] = { value: 0, color: c.Color };
      map[c.Colname].value += c.Value;
    }),
  );
  return Object.entries(map).map(([name, v]) => ({
    name,
    value: v.value,
    color: v.color,
  }));
}

/** Scatter data: one point per (item, column). x = item index, y = value, z = value, color from column */
function toScatterData(data: ChartDataItem[]) {
  return data.flatMap((item, i) =>
    item.Columns.map((col) => ({
      x: i + 1,
      y: col.Value,
      z: col.Value,
      name: item.Name,
      colname: col.Colname,
      color: col.Color,
    })),
  );
}

// ─────────────────────────────────────────────
//  CUSTOM TOOLTIP (used across SVG-based charts)
// ─────────────────────────────────────────────

function SVGTooltip({
  visible,
  x,
  y,
  content,
}: {
  visible: boolean;
  x: number;
  y: number;
  content: string;
}) {
  if (!visible) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: x + 12,
        top: y - 10,
        background: "rgba(15,23,42,0.88)",
        color: "#fff",
        padding: "4px 10px",
        borderRadius: 6,
        fontSize: 12,
        pointerEvents: "none",
        whiteSpace: "nowrap",
        zIndex: 99,
      }}
    >
      {content}
    </div>
  );
}

// ─────────────────────────────────────────────
//  INDIVIDUAL CHART RENDERERS
// ─────────────────────────────────────────────

// ── LINE ──────────────────────────────────────
function ChartLine({ data }: { data: ChartDataItem[] }) {
  const flat = toFlatSeries(data);
  const cols = getColNames(data);
  const colors = getColColors(data);
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={flat}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        {cols.map((col) => (
          <Line
            key={col}
            type="monotone"
            dataKey={col}
            stroke={colors[col]}
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 6 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

// ── STEP LINE ─────────────────────────────────
function ChartStepLine({ data }: { data: ChartDataItem[] }) {
  const flat = toFlatSeries(data);
  const cols = getColNames(data);
  const colors = getColColors(data);
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={flat}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        {cols.map((col) => (
          <Line
            key={col}
            type="step"
            dataKey={col}
            stroke={colors[col]}
            strokeWidth={2}
            dot
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

// ── AREA STACKED ──────────────────────────────
function ChartAreaStacked({ data }: { data: ChartDataItem[] }) {
  const flat = toFlatSeries(data);
  const cols = getColNames(data);
  const colors = getColColors(data);
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={flat}>
        <defs>
          {cols.map((col) => (
            <linearGradient
              key={col}
              id={`grad_${col}`}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="5%" stopColor={colors[col]} stopOpacity={0.8} />
              <stop offset="95%" stopColor={colors[col]} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        {cols.map((col) => (
          <Area
            key={col}
            type="monotone"
            dataKey={col}
            stackId="1"
            stroke={colors[col]}
            fill={`url(#grad_${col})`}
            fillOpacity={1}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ── STEP AREA ─────────────────────────────────
function ChartStepArea({ data }: { data: ChartDataItem[] }) {
  const flat = toFlatSeries(data);
  const cols = getColNames(data);
  const colors = getColColors(data);
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={flat}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        {cols.map((col) => (
          <Area
            key={col}
            type="step"
            dataKey={col}
            stroke={colors[col]}
            fill={colors[col]}
            fillOpacity={0.25}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ── BAR GROUPED ───────────────────────────────
function ChartBarGrouped({ data }: { data: ChartDataItem[] }) {
  const flat = toFlatSeries(data);
  const cols = getColNames(data);
  const colors = getColColors(data);
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={flat}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        {cols.map((col) => (
          <Bar
            key={col}
            dataKey={col}
            fill={colors[col]}
            radius={[6, 6, 0, 0]}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

// ── BAR STACKED ───────────────────────────────
function ChartBarStacked({ data }: { data: ChartDataItem[] }) {
  const flat = toFlatSeries(data);
  const cols = getColNames(data);
  const colors = getColColors(data);
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={flat}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        {cols.map((col) => (
          <Bar key={col} dataKey={col} stackId="a" fill={colors[col]} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

// ── LOLLIPOP ──────────────────────────────────
function ChartLollipop({ data }: { data: ChartDataItem[] }) {
  const flat = toFlatSeries(data);
  const cols = getColNames(data);
  const colors = getColColors(data);
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={flat}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        {cols.map((col) => (
          <Line
            key={col}
            dataKey={col}
            stroke={colors[col]}
            strokeWidth={2}
            dot={{ r: 7, fill: colors[col] }}
          />
        ))}
      </ComposedChart>
    </ResponsiveContainer>
  );
}

// ── DOT PLOT ──────────────────────────────────
function ChartDotPlot({ data }: { data: ChartDataItem[] }) {
  const flat = toFlatSeries(data);
  const cols = getColNames(data);
  const colors = getColColors(data);
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={flat}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        {cols.map((col) => (
          <Line
            key={col}
            dataKey={col}
            stroke="none"
            dot={{ r: 6, fill: colors[col] }}
          />
        ))}
      </ComposedChart>
    </ResponsiveContainer>
  );
}

// ── SLOPE CHART ───────────────────────────────
function ChartSlope({ data }: { data: ChartDataItem[] }) {
  // First and last items are "start" and "end"
  const first = data[0];
  const last = data[data.length - 1];
  const cols = getColNames(data);
  const colors = getColColors(data);
  const [tip, setTip] = useState({ visible: false, x: 0, y: 0, content: "" });

  const allVals = data.flatMap((d) => d.Columns.map((c) => c.Value));
  const minVal = Math.min(...allVals);
  const maxVal = Math.max(...allVals);
  const norm = (v: number) =>
    ((v - minVal) / (maxVal - minVal || 1)) * 140 + 20;

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <SVGTooltip {...tip} />
      <svg viewBox="0 0 320 200" style={{ width: "100%", height: "100%" }}>
        <text x="50" y="14" fontSize="10" fill="#64748b">
          {first?.Name}
        </text>
        <text x="230" y="14" fontSize="10" fill="#64748b">
          {last?.Name}
        </text>
        {cols.map((col) => {
          const v1 = first?.Columns.find((c) => c.Colname === col)?.Value ?? 0;
          const v2 = last?.Columns.find((c) => c.Colname === col)?.Value ?? 0;
          const y1 = 180 - norm(v1);
          const y2 = 180 - norm(v2);
          return (
            <g key={col}>
              <line
                x1={60}
                y1={y1}
                x2={240}
                y2={y2}
                stroke={colors[col]}
                strokeWidth={2}
              />
              <circle
                cx={60}
                cy={y1}
                r={5}
                fill={colors[col]}
                onMouseEnter={(e) =>
                  setTip({
                    visible: true,
                    x: 60,
                    y: y1,
                    content: `${col} (${first.Name}): ${v1}`,
                  })
                }
                onMouseLeave={() => setTip((t) => ({ ...t, visible: false }))}
              />
              <circle
                cx={240}
                cy={y2}
                r={5}
                fill={colors[col]}
                onMouseEnter={(e) =>
                  setTip({
                    visible: true,
                    x: 240,
                    y: y2,
                    content: `${col} (${last.Name}): ${v2}`,
                  })
                }
                onMouseLeave={() => setTip((t) => ({ ...t, visible: false }))}
              />
              <text x={244} y={y2 + 4} fontSize="9" fill={colors[col]}>
                {col}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ── BUMP CHART ────────────────────────────────
function ChartBump({ data }: { data: ChartDataItem[] }) {
  // Rank each column by value per period (lower rank = higher value)
  const cols = getColNames(data);
  const colors = getColColors(data);
  const [tip, setTip] = useState({ visible: false, x: 0, y: 0, content: "" });

  const ranks: Record<string, number>[] = data.map((item) => {
    const sorted = [...item.Columns].sort((a, b) => b.Value - a.Value);
    const rank: Record<string, number> = {};
    sorted.forEach((c, i) => {
      rank[c.Colname] = i + 1;
    });
    return rank;
  });

  const maxRank = cols.length;
  const xStep = data.length > 1 ? 260 / (data.length - 1) : 260;

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <SVGTooltip {...tip} />
      <svg viewBox="0 0 320 180" style={{ width: "100%", height: "100%" }}>
        {data.map((item, i) => (
          <text
            key={i}
            x={30 + i * xStep}
            y="175"
            fontSize="9"
            fill="#64748b"
            textAnchor="middle"
          >
            {item.Name}
          </text>
        ))}
        {cols.map((col) => {
          const path = ranks
            .map((r, i) => {
              const x = 30 + i * xStep;
              const y = 20 + ((r[col] - 1) / Math.max(maxRank - 1, 1)) * 130;
              return `${i === 0 ? "M" : "L"} ${x} ${y}`;
            })
            .join(" ");
          return (
            <g key={col}>
              <path d={path} fill="none" stroke={colors[col]} strokeWidth="3" />
              {ranks.map((r, i) => {
                const x = 30 + i * xStep;
                const y = 20 + ((r[col] - 1) / Math.max(maxRank - 1, 1)) * 130;
                const val =
                  data[i].Columns.find((c) => c.Colname === col)?.Value ?? 0;
                return (
                  <circle
                    key={i}
                    cx={x}
                    cy={y}
                    r={5}
                    fill={colors[col]}
                    onMouseEnter={() =>
                      setTip({
                        visible: true,
                        x,
                        y,
                        content: `${col} (${data[i].Name}): rank ${r[col]}, val ${val}`,
                      })
                    }
                    onMouseLeave={() =>
                      setTip((t) => ({ ...t, visible: false }))
                    }
                  />
                );
              })}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ── PARETO ────────────────────────────────────
function ChartPareto({ data }: { data: ChartDataItem[] }) {
  const cols = getColNames(data);
  const colors = getColColors(data);
  // Aggregate total per period
  const flat = data.map((item) => {
    const row: Record<string, any> = { name: item.Name };
    item.Columns.forEach((col) => {
      row[col.Colname] = col.Value;
    });
    const total = item.Columns.reduce((s, c) => s + c.Value, 0);
    row["__total"] = total;
    return row;
  });
  const grandTotal = flat.reduce((s, r) => s + r["__total"], 0);
  let cum = 0;
  const withCum = flat.map((r) => {
    cum += r["__total"];
    return { ...r, cumPct: parseFloat(((cum / grandTotal) * 100).toFixed(1)) };
  });

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={withCum}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis yAxisId="left" />
        <YAxis
          yAxisId="right"
          orientation="right"
          domain={[0, 100]}
          tickFormatter={(v) => `${v}%`}
        />
        <Tooltip />
        <Legend />
        {cols.map((col) => (
          <Bar
            key={col}
            yAxisId="left"
            dataKey={col}
            fill={colors[col]}
            stackId="a"
          />
        ))}
        <Line
          yAxisId="right"
          dataKey="cumPct"
          name="Cumulative %"
          stroke="#0f172a"
          strokeWidth={2}
          dot={false}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

// ── PIE ───────────────────────────────────────
function ChartPie({
  data,
  donut = false,
}: {
  data: ChartDataItem[];
  donut?: boolean;
}) {
  const pieData = toPieData(data);
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Tooltip formatter={(value, name) => [value, name]} />
        <Legend />
        <Pie
          data={pieData}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius="75%"
          innerRadius={donut ? "40%" : "0%"}
          paddingAngle={4}
          label={({ name, value }) => `${name}: ${value}`}
        >
          {pieData.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
}

// ── TREEMAP ───────────────────────────────────
function ChartTreemap({ data }: { data: ChartDataItem[] }) {
  const pieData = toPieData(data);
  const CustomContent = (props: any) => {
    const { x, y, width, height, name, value, root } = props;
    const color = pieData.find((d) => d.name === name)?.color || "#1155CC";
    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          fill={color}
          stroke="#fff"
          strokeWidth={2}
        />
        {width > 40 && height > 20 && (
          <text
            x={x + width / 2}
            y={y + height / 2}
            textAnchor="middle"
            fill="#fff"
            fontSize={11}
          >
            {name}: {value}
          </text>
        )}
      </g>
    );
  };
  return (
    <ResponsiveContainer width="100%" height="100%">
      <Treemap
        data={pieData}
        dataKey="value"
        stroke="#fff"
        content={<CustomContent />}
      >
        <Tooltip />
      </Treemap>
    </ResponsiveContainer>
  );
}

// ── ICON ARRAY ────────────────────────────────
function ChartIconArray({ data }: { data: ChartDataItem[] }) {
  const pieData = toPieData(data);
  const total = pieData.reduce((s, d) => s + d.value, 0);
  const cells = 100;
  let filled = 0;
  const segments = pieData.map((d) => {
    const count = Math.round((d.value / total) * cells);
    const seg = { ...d, count };
    return seg;
  });
  const grid: { color: string; label: string }[] = [];
  segments.forEach((s) => {
    for (let i = 0; i < s.count && grid.length < cells; i++) {
      grid.push({ color: s.color, label: `${s.name}: ${s.value}` });
    }
  });
  while (grid.length < cells) grid.push({ color: "#e2e8f0", label: "" });

  const [tip, setTip] = useState({ visible: false, x: 0, y: 0, content: "" });
  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <SVGTooltip {...tip} />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(10, 1fr)",
          gap: 3,
          padding: 8,
        }}
      >
        {grid.map((cell, i) => (
          <div
            key={i}
            style={{
              height: 14,
              borderRadius: 3,
              background: cell.color,
              cursor: cell.label ? "pointer" : "default",
            }}
            onMouseEnter={(e) => {
              if (cell.label) {
                const rect = (e.target as HTMLElement).getBoundingClientRect();
                setTip({
                  visible: true,
                  x: (i % 10) * 20,
                  y: Math.floor(i / 10) * 18,
                  content: cell.label,
                });
              }
            }}
            onMouseLeave={() => setTip((t) => ({ ...t, visible: false }))}
          />
        ))}
      </div>
    </div>
  );
}

// ── SCATTER / BUBBLE ──────────────────────────
function ChartScatterBubble({ data }: { data: ChartDataItem[] }) {
  const scatterData = toScatterData(data);
  const cols = getColNames(data);
  const colors = getColColors(data);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ScatterChart>
        <CartesianGrid />
        <XAxis
          type="number"
          dataKey="x"
          name="Period"
          tickFormatter={(v) => data[v - 1]?.Name || v}
        />
        <YAxis type="number" dataKey="y" name="Value" />
        <ZAxis type="number" dataKey="z" range={[60, 400]} />
        <Tooltip
          cursor={{ strokeDasharray: "3 3" }}
          content={({ payload }) => {
            if (!payload?.length) return null;
            const d = payload[0].payload;
            return (
              <div
                style={{
                  background: "#fff",
                  border: "1px solid #e2e8f0",
                  padding: "6px 10px",
                  fontSize: 12,
                  borderRadius: 6,
                }}
              >
                <div>
                  <b>{d.name}</b>
                </div>
                <div style={{ color: d.color }}>
                  {d.colname}: {d.y}
                </div>
              </div>
            );
          }}
        />
        {cols.map((col) => (
          <Scatter
            key={col}
            name={col}
            data={scatterData.filter((d) => d.colname === col)}
            fill={colors[col]}
          />
        ))}
        <Legend />
      </ScatterChart>
    </ResponsiveContainer>
  );
}

// ── CORRELATION MATRIX ────────────────────────
function ChartCorrelationMatrix({ data }: { data: ChartDataItem[] }) {
  const cols = getColNames(data);
  const colors = getColColors(data);
  const [tip, setTip] = useState({ visible: false, x: 0, y: 0, content: "" });

  // Compute simple correlation-like values (normalized dot product)
  const vals: Record<string, number[]> = {};
  cols.forEach((c) => {
    vals[c] = data.map(
      (d) => d.Columns.find((col) => col.Colname === c)?.Value ?? 0,
    );
  });

  const corr = (a: number[], b: number[]) => {
    const meanA = a.reduce((s, v) => s + v, 0) / a.length;
    const meanB = b.reduce((s, v) => s + v, 0) / b.length;
    const num = a.reduce((s, v, i) => s + (v - meanA) * (b[i] - meanB), 0);
    const den = Math.sqrt(
      a.reduce((s, v) => s + (v - meanA) ** 2, 0) *
        b.reduce((s, v) => s + (v - meanB) ** 2, 0),
    );
    return den === 0 ? 0 : num / den;
  };

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        padding: 8,
      }}
    >
      <SVGTooltip {...tip} />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `auto ${cols.map(() => "1fr").join(" ")}`,
          gap: 3,
          fontSize: 11,
        }}
      >
        <div />
        {cols.map((c) => (
          <div
            key={c}
            style={{
              textAlign: "center",
              fontWeight: 600,
              padding: "2px 4px",
              color: colors[c],
            }}
          >
            {c}
          </div>
        ))}
        {cols.map((r, ri) => (
          <>
            <div
              key={r}
              style={{ fontWeight: 600, padding: "2px 4px", color: colors[r] }}
            >
              {r}
            </div>
            {cols.map((c, ci) => {
              const v = corr(vals[r], vals[c]);
              const abs = Math.abs(v);
              const bg =
                v >= 0
                  ? `rgba(17,85,204,${0.1 + abs * 0.85})`
                  : `rgba(239,68,68,${0.1 + abs * 0.85})`;
              return (
                <div
                  key={c}
                  style={{
                    height: 36,
                    borderRadius: 4,
                    background: bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    fontSize: 10,
                    color: abs > 0.5 ? "#fff" : "#0f172a",
                    fontWeight: 600,
                  }}
                  onMouseEnter={(e) =>
                    setTip({
                      visible: true,
                      x: ci * 40,
                      y: ri * 40,
                      content: `${r} vs ${c}: ${v.toFixed(2)}`,
                    })
                  }
                  onMouseLeave={() => setTip((t) => ({ ...t, visible: false }))}
                >
                  {v.toFixed(2)}
                </div>
              );
            })}
          </>
        ))}
      </div>
    </div>
  );
}

// ── HEATMAP GRID ──────────────────────────────
function ChartHeatmapGrid({ data }: { data: ChartDataItem[] }) {
  const cols = getColNames(data);
  const [tip, setTip] = useState({ visible: false, x: 0, y: 0, content: "" });
  const allVals = data.flatMap((d) => d.Columns.map((c) => c.Value));
  const minVal = Math.min(...allVals);
  const maxVal = Math.max(...allVals);
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        padding: 8,
      }}
    >
      <SVGTooltip {...tip} />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `auto ${cols.map(() => "1fr").join(" ")}`,
          gap: 3,
          fontSize: 11,
        }}
      >
        <div />
        {cols.map((c) => (
          <div
            key={c}
            style={{ textAlign: "center", fontWeight: 600, padding: "2px 4px" }}
          >
            {c}
          </div>
        ))}
        {data.map((item, ri) => (
          <>
            <div
              key={item.Name}
              style={{
                fontWeight: 600,
                padding: "2px 4px",
                whiteSpace: "nowrap",
              }}
            >
              {item.Name}
            </div>
            {cols.map((col, ci) => {
              const colData = item.Columns.find((c) => c.Colname === col);
              const v = colData?.Value ?? 0;
              const intensity = (v - minVal) / (maxVal - minVal || 1);
              const color = colData?.Color || "#1155CC";
              const [r, g, b] = hexToRgb(color);
              return (
                <div
                  key={col}
                  style={{
                    height: 36,
                    borderRadius: 4,
                    background: `rgba(${r},${g},${b},${0.15 + intensity * 0.8})`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    fontSize: 11,
                    fontWeight: 600,
                  }}
                  onMouseEnter={() =>
                    setTip({
                      visible: true,
                      x: ci * 50,
                      y: ri * 40,
                      content: `${item.Name} / ${col}: ${v}`,
                    })
                  }
                  onMouseLeave={() => setTip((t) => ({ ...t, visible: false }))}
                >
                  {v}
                </div>
              );
            })}
          </>
        ))}
      </div>
    </div>
  );
}

// ── RADAR ─────────────────────────────────────
function ChartRadar({ data }: { data: ChartDataItem[] }) {
  const cols = getColNames(data);
  const colors = getColColors(data);
  // Each period is a "subject", each column is a series
  const radarData = data.map((item) => {
    const row: Record<string, any> = { subject: item.Name };
    item.Columns.forEach((col) => {
      row[col.Colname] = col.Value;
    });
    return row;
  });

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RadarChart outerRadius="70%" data={radarData}>
        <PolarGrid />
        <PolarAngleAxis dataKey="subject" />
        <PolarRadiusAxis />
        <Tooltip />
        <Legend />
        {cols.map((col) => (
          <Radar
            key={col}
            name={col}
            dataKey={col}
            stroke={colors[col]}
            fill={colors[col]}
            fillOpacity={0.3}
          />
        ))}
      </RadarChart>
    </ResponsiveContainer>
  );
}

// ── WATERFALL ─────────────────────────────────
function ChartWaterfall({ data }: { data: ChartDataItem[] }) {
  const cols = getColNames(data);
  const colors = getColColors(data);
  // Use total per period as the bar value
  const steps = data.map((item) => ({
    name: item.Name,
    total: item.Columns.reduce((s, c) => s + c.Value, 0),
    color: item.Columns[0]?.Color || "#1155CC",
  }));

  let acc = 0;
  const bars = steps.map((s) => {
    const start = acc;
    acc += s.total;
    return {
      name: s.name,
      start: Math.min(start, acc),
      end: Math.max(start, acc),
      delta: s.total,
      color: s.color,
    };
  });

  const [tip, setTip] = useState({ visible: false, x: 0, y: 0, content: "" });
  const maxVal = Math.max(...bars.map((b) => b.end));
  const scale = 130 / maxVal;

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <SVGTooltip {...tip} />
      <svg
        viewBox={`0 0 ${bars.length * 60 + 20} 180`}
        style={{ width: "100%", height: "100%" }}
      >
        {bars.map((b, i) => {
          const x = 10 + i * 60;
          const y = 160 - b.end * scale;
          const h = Math.max(2, (b.end - b.start) * scale);
          return (
            <g key={i}>
              <rect
                x={x}
                y={y}
                width={44}
                height={h}
                rx={4}
                fill={b.color}
                onMouseEnter={() =>
                  setTip({
                    visible: true,
                    x,
                    y,
                    content: `${b.name}: +${b.delta}`,
                  })
                }
                onMouseLeave={() => setTip((t) => ({ ...t, visible: false }))}
              />
              <text
                x={x + 22}
                y={170}
                textAnchor="middle"
                fontSize="9"
                fill="#64748b"
              >
                {b.name}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ── FUNNEL ────────────────────────────────────
function ChartFunnel({ data }: { data: ChartDataItem[] }) {
  const totals = data.map((item) => ({
    name: item.Name,
    total: item.Columns.reduce((s, c) => s + c.Value, 0),
    color: item.Columns[0]?.Color || "#1155CC",
  }));
  const maxTotal = Math.max(...totals.map((t) => t.total));
  const [tip, setTip] = useState({ visible: false, x: 0, y: 0, content: "" });

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <SVGTooltip {...tip} />
      <svg viewBox="0 0 240 180" style={{ width: "100%", height: "100%" }}>
        {totals.map((t, i) => {
          const nextTotal = totals[i + 1]?.total ?? totals[i].total * 0.5;
          const topW = (t.total / maxTotal) * 180 + 20;
          const botW = (nextTotal / maxTotal) * 180 + 20;
          const y = 10 + i * (160 / totals.length);
          const h = 160 / totals.length - 4;
          return (
            <g key={i}>
              <polygon
                points={`${120 - topW / 2},${y} ${120 + topW / 2},${y} ${120 + botW / 2},${y + h} ${120 - botW / 2},${y + h}`}
                fill={t.color}
                opacity={0.85}
                onMouseEnter={() =>
                  setTip({
                    visible: true,
                    x: 120,
                    y,
                    content: `${t.name}: ${t.total}`,
                  })
                }
                onMouseLeave={() => setTip((t) => ({ ...t, visible: false }))}
              />
              <text
                x={120}
                y={y + h / 2 + 4}
                textAnchor="middle"
                fontSize="10"
                fill="#fff"
              >
                {t.name}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ── GANTT ─────────────────────────────────────
function ChartGantt({ data }: { data: ChartDataItem[] }) {
  const cols = getColNames(data);
  const colors = getColColors(data);
  const [tip, setTip] = useState({ visible: false, x: 0, y: 0, content: "" });
  const totalPeriods = data.length;

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <SVGTooltip {...tip} />
      <svg
        viewBox={`0 0 320 ${cols.length * 28 + 30}`}
        style={{ width: "100%", height: "100%" }}
      >
        {cols.map((col, ci) => {
          const startIdx = data.findIndex((d) =>
            d.Columns.find((c) => c.Colname === col && c.Value > 0),
          );
          const endIdx = [...data]
            .reverse()
            .findIndex((d) =>
              d.Columns.find((c) => c.Colname === col && c.Value > 0),
            );
          const realEnd = totalPeriods - 1 - endIdx;
          const x = 80 + (startIdx / totalPeriods) * 220;
          const w = Math.max(
            10,
            ((realEnd - startIdx + 1) / totalPeriods) * 220,
          );
          const y = 10 + ci * 28;
          return (
            <g key={col}>
              <text x={5} y={y + 13} fontSize={10} fill="#64748b">
                {col}
              </text>
              <rect
                x={x}
                y={y}
                width={w}
                height={18}
                rx={4}
                fill={colors[col]}
                onMouseEnter={() =>
                  setTip({
                    visible: true,
                    x,
                    y,
                    content: `${col}: ${data[startIdx]?.Name} → ${data[realEnd]?.Name}`,
                  })
                }
                onMouseLeave={() => setTip((t) => ({ ...t, visible: false }))}
              />
            </g>
          );
        })}
        {data.map((item, i) => (
          <text
            key={i}
            x={80 + (i / totalPeriods) * 220}
            y={cols.length * 28 + 22}
            fontSize={9}
            fill="#94a3b8"
          >
            {item.Name}
          </text>
        ))}
      </svg>
    </div>
  );
}

// ── BULLET ────────────────────────────────────
function ChartBullet({ data }: { data: ChartDataItem[] }) {
  const cols = getColNames(data);
  const colors = getColColors(data);
  const allVals = data.flatMap((d) => d.Columns.map((c) => c.Value));
  const maxVal = Math.max(...allVals);
  // Use last period as "actual", second-to-last as "target"
  const last = data[data.length - 1];
  const prev = data[data.length - 2] || data[0];
  const [tip, setTip] = useState({ visible: false, x: 0, y: 0, content: "" });

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        padding: 8,
      }}
    >
      <SVGTooltip {...tip} />
      {cols.map((col, i) => {
        const actual = last?.Columns.find((c) => c.Colname === col)?.Value ?? 0;
        const target = prev?.Columns.find((c) => c.Colname === col)?.Value ?? 0;
        const color = colors[col];
        return (
          <div key={col} style={{ marginBottom: 14 }}>
            <div
              style={{ fontSize: 11, fontWeight: 600, marginBottom: 3, color }}
            >
              {col}
            </div>
            <div
              style={{
                position: "relative",
                height: 20,
                background: "#f1f5f9",
                borderRadius: 4,
              }}
            >
              {/* Background ranges */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "#fca5a5",
                  borderRadius: 4,
                  width: "33%",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "#fde68a",
                  borderRadius: 4,
                  left: "33%",
                  width: "33%",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "#bbf7d0",
                  borderRadius: 4,
                  left: "66%",
                  width: "34%",
                }}
              />
              {/* Actual bar */}
              <div
                style={{
                  position: "absolute",
                  top: "25%",
                  height: "50%",
                  background: color,
                  borderRadius: 3,
                  width: `${(actual / maxVal) * 100}%`,
                }}
                onMouseEnter={(e) =>
                  setTip({
                    visible: true,
                    x: (actual / maxVal) * 200,
                    y: i * 40,
                    content: `${col} actual: ${actual}`,
                  })
                }
                onMouseLeave={() => setTip((t) => ({ ...t, visible: false }))}
              />
              {/* Target marker */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  bottom: 0,
                  width: 3,
                  background: "#0f172a",
                  borderRadius: 2,
                  left: `calc(${(target / maxVal) * 100}% - 1.5px)`,
                }}
                onMouseEnter={() =>
                  setTip({
                    visible: true,
                    x: (target / maxVal) * 200,
                    y: i * 40,
                    content: `${col} target (${prev.Name}): ${target}`,
                  })
                }
                onMouseLeave={() => setTip((t) => ({ ...t, visible: false }))}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── GAUGE ─────────────────────────────────────
function ChartGauge({ data }: { data: ChartDataItem[] }) {
  const cols = getColNames(data);
  const colors = getColColors(data);
  const allVals = data.flatMap((d) => d.Columns.map((c) => c.Value));
  const maxVal = Math.max(...allVals);
  // Show the last period's values
  const last = data[data.length - 1];
  const [tip, setTip] = useState({ visible: false, x: 0, y: 0, content: "" });

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        padding: 8,
      }}
    >
      <SVGTooltip {...tip} />
      {cols.map((col, i) => {
        const val = last?.Columns.find((c) => c.Colname === col)?.Value ?? 0;
        const pct = val / maxVal;
        const color = colors[col];
        const sweep = pct * 180;
        const rad = Math.PI * pct;
        const nx = 30 + 80 * Math.cos(Math.PI - rad);
        const ny = 80 - 80 * Math.sin(Math.PI - rad);
        return (
          <svg
            key={col}
            viewBox="0 0 160 100"
            style={{ width: "45%", minWidth: 100 }}
          >
            <path
              d="M10,80 A80,80 0 0 1 150,80"
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="14"
            />
            <path
              d={`M10,80 A80,80 0 0 1 ${10 + 140 * pct},80`}
              fill="none"
              stroke={color}
              strokeWidth="14"
            />
            <circle
              cx={10 + 140 * pct}
              cy={80}
              r={5}
              fill={color}
              onMouseEnter={() =>
                setTip({
                  visible: true,
                  x: 10 + 140 * pct,
                  y: 80,
                  content: `${col}: ${val}`,
                })
              }
              onMouseLeave={() => setTip((t) => ({ ...t, visible: false }))}
            />
            <text
              x={80}
              y={68}
              textAnchor="middle"
              fontSize="13"
              fontWeight="bold"
              fill={color}
            >
              {val}
            </text>
            <text x={80} y={82} textAnchor="middle" fontSize="9" fill="#64748b">
              {col}
            </text>
          </svg>
        );
      })}
    </div>
  );
}

// ── CANDLESTICK ───────────────────────────────
function ChartCandlestick({ data }: { data: ChartDataItem[] }) {
  // Treat each period as one "candle": open=first col, close=last col, high=max, low=min
  const [tip, setTip] = useState({ visible: false, x: 0, y: 0, content: "" });
  const allVals = data.flatMap((d) => d.Columns.map((c) => c.Value));
  const minVal = Math.min(...allVals);
  const maxVal = Math.max(...allVals);
  const norm = (v: number) =>
    10 + ((v - minVal) / (maxVal - minVal || 1)) * 120;

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <SVGTooltip {...tip} />
      <svg
        viewBox={`0 0 ${data.length * 60 + 20} 160`}
        style={{ width: "100%", height: "100%" }}
      >
        {data.map((item, i) => {
          const vals = item.Columns.map((c) => c.Value);
          const open = vals[0],
            close = vals[vals.length - 1];
          const high = Math.max(...vals),
            low = Math.min(...vals);
          const up = close >= open;
          const color = up
            ? item.Columns[0]?.Color || "#22c55e"
            : item.Columns[item.Columns.length - 1]?.Color || "#ef4444";
          const x = 10 + i * 60 + 10;
          const yH = 140 - norm(high),
            yL = 140 - norm(low);
          const yO = 140 - norm(Math.max(open, close));
          const h = Math.max(2, Math.abs(norm(open) - norm(close)));
          return (
            <g
              key={i}
              onMouseEnter={() =>
                setTip({
                  visible: true,
                  x,
                  y: yH,
                  content: `${item.Name} O:${open} H:${high} L:${low} C:${close}`,
                })
              }
              onMouseLeave={() => setTip((t) => ({ ...t, visible: false }))}
            >
              <line x1={x + 10} y1={yH} x2={x + 10} y2={yL} stroke="#64748b" />
              <rect x={x} y={yO} width={20} height={h} fill={color} />
              <text
                x={x + 10}
                y={150}
                textAnchor="middle"
                fontSize="9"
                fill="#64748b"
              >
                {item.Name}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ── HISTOGRAM ─────────────────────────────────
function ChartHistogram({ data }: { data: ChartDataItem[] }) {
  const allVals = data.flatMap((d) =>
    d.Columns.map((c) => ({ val: c.Value, color: c.Color, name: c.Colname })),
  );
  const binCount = 8;
  const minVal = Math.min(...allVals.map((v) => v.val));
  const maxVal = Math.max(...allVals.map((v) => v.val));
  const binSize = (maxVal - minVal) / binCount || 1;
  const bins: { range: string; count: number; color: string }[] = Array.from(
    { length: binCount },
    (_, i) => ({
      range: `${Math.round(minVal + i * binSize)}-${Math.round(minVal + (i + 1) * binSize)}`,
      count: 0,
      color: allVals[0]?.color || "#1155CC",
    }),
  );
  allVals.forEach(({ val }) => {
    const idx = Math.min(binCount - 1, Math.floor((val - minVal) / binSize));
    bins[idx].count++;
  });
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={bins}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="range" tick={{ fontSize: 9 }} />
        <YAxis />
        <Tooltip formatter={(v) => [`${v} items`, "Count"]} />
        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
          {bins.map((b, i) => (
            <Cell key={i} fill={b.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ── BOX PLOT ──────────────────────────────────
function ChartBoxPlot({ data }: { data: ChartDataItem[] }) {
  const cols = getColNames(data);
  const colors = getColColors(data);
  const [tip, setTip] = useState({ visible: false, x: 0, y: 0, content: "" });
  const allVals = data.flatMap((d) => d.Columns.map((c) => c.Value));
  const minVal = Math.min(...allVals);
  const maxVal = Math.max(...allVals);
  const norm = (v: number) =>
    10 + ((v - minVal) / (maxVal - minVal || 1)) * 130;

  const boxData = cols.map((col) => {
    const vals = data
      .map((d) => d.Columns.find((c) => c.Colname === col)?.Value ?? 0)
      .sort((a, b) => a - b);
    const q1 = vals[Math.floor(vals.length * 0.25)];
    const median = vals[Math.floor(vals.length * 0.5)];
    const q3 = vals[Math.floor(vals.length * 0.75)];
    return {
      col,
      min: vals[0],
      q1,
      median,
      q3,
      max: vals[vals.length - 1],
      color: colors[col],
    };
  });

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <SVGTooltip {...tip} />
      <svg
        viewBox={`0 0 ${boxData.length * 80 + 20} 180`}
        style={{ width: "100%", height: "100%" }}
      >
        {boxData.map((b, i) => {
          const cx = 30 + i * 80 + 20;
          const yMin = 155 - norm(b.min),
            yMax = 155 - norm(b.max);
          const yQ1 = 155 - norm(b.q1),
            yQ3 = 155 - norm(b.q3);
          const yMed = 155 - norm(b.median);
          return (
            <g
              key={b.col}
              onMouseEnter={() =>
                setTip({
                  visible: true,
                  x: cx,
                  y: yMax,
                  content: `${b.col}: min=${b.min} Q1=${b.q1} med=${b.median} Q3=${b.q3} max=${b.max}`,
                })
              }
              onMouseLeave={() => setTip((t) => ({ ...t, visible: false }))}
            >
              <line x1={cx} y1={yMin} x2={cx} y2={yMax} stroke={b.color} />
              <rect
                x={cx - 20}
                y={yQ3}
                width={40}
                height={Math.max(2, yQ1 - yQ3)}
                fill={`${b.color}55`}
                stroke={b.color}
              />
              <line
                x1={cx - 20}
                y1={yMed}
                x2={cx + 20}
                y2={yMed}
                stroke={b.color}
                strokeWidth={2}
              />
              <text
                x={cx}
                y={168}
                textAnchor="middle"
                fontSize="10"
                fill="#64748b"
              >
                {b.col}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ── VIOLIN ────────────────────────────────────
function ChartViolin({ data }: { data: ChartDataItem[] }) {
  const cols = getColNames(data);
  const colors = getColColors(data);
  const [tip, setTip] = useState({ visible: false, x: 0, y: 0, content: "" });
  const allVals = data.flatMap((d) => d.Columns.map((c) => c.Value));
  const minVal = Math.min(...allVals);
  const maxVal = Math.max(...allVals);
  const norm = (v: number) =>
    15 + ((v - minVal) / (maxVal - minVal || 1)) * 130;

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <SVGTooltip {...tip} />
      <svg
        viewBox={`0 0 ${cols.length * 80 + 20} 180`}
        style={{ width: "100%", height: "100%" }}
      >
        {cols.map((col, i) => {
          const vals = data.map(
            (d) => d.Columns.find((c) => c.Colname === col)?.Value ?? 0,
          );
          const cx = 30 + i * 80 + 20;
          const maxSpread = 30;
          const points = vals.map((v) => {
            const spread =
              maxSpread * (0.3 + 0.7 * ((v - minVal) / (maxVal - minVal || 1)));
            return { y: 155 - norm(v), spread, v };
          });
          const sorted = [...points].sort((a, b) => a.y - b.y);
          const pathRight = sorted
            .map((p, j) => `${j === 0 ? "M" : "L"} ${cx + p.spread} ${p.y}`)
            .join(" ");
          const pathLeft = [...sorted]
            .reverse()
            .map((p, j) => `L ${cx - p.spread} ${p.y}`)
            .join(" ");
          const color = colors[col];
          return (
            <g
              key={col}
              onMouseEnter={() =>
                setTip({
                  visible: true,
                  x: cx,
                  y: sorted[0]?.y || 0,
                  content: `${col}: ${vals.join(", ")}`,
                })
              }
              onMouseLeave={() => setTip((t) => ({ ...t, visible: false }))}
            >
              <path
                d={`${pathRight} ${pathLeft} Z`}
                fill={`${color}44`}
                stroke={color}
                strokeWidth={1.5}
              />
              <text
                x={cx}
                y={170}
                textAnchor="middle"
                fontSize="10"
                fill="#64748b"
              >
                {col}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ── DENSITY ───────────────────────────────────
function ChartDensity({ data }: { data: ChartDataItem[] }) {
  const cols = getColNames(data);
  const colors = getColColors(data);
  const allVals = data.flatMap((d) => d.Columns.map((c) => c.Value));
  const minVal = Math.min(...allVals),
    maxVal = Math.max(...allVals);
  const W = 300,
    H = 130;

  const densityPath = (vals: number[], color: string) => {
    const points = vals
      .map((v, i) => {
        const x = ((v - minVal) / (maxVal - minVal || 1)) * W;
        return x;
      })
      .sort((a, b) => a - b);
    const pathPts = points
      .map(
        (x, i) => `${i === 0 ? "M" : "L"} ${x} ${H - (i % 3 === 0 ? 60 : 40)}`,
      )
      .join(" ");
    return pathPts + ` L ${W} ${H} L 0 ${H} Z`;
  };

  const [tip, setTip] = useState({ visible: false, x: 0, y: 0, content: "" });
  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <SVGTooltip {...tip} />
      <svg
        viewBox={`0 0 ${W} ${H + 20}`}
        style={{ width: "100%", height: "100%" }}
      >
        {cols.map((col, i) => {
          const vals = data.map(
            (d) => d.Columns.find((c) => c.Colname === col)?.Value ?? 0,
          );
          const color = colors[col];
          return (
            <path
              key={col}
              d={densityPath(vals, color)}
              fill={`${color}33`}
              stroke={color}
              strokeWidth={2}
              onMouseEnter={() =>
                setTip({
                  visible: true,
                  x: W / 2,
                  y: H / 2,
                  content: `${col}: ${vals.join(", ")}`,
                })
              }
              onMouseLeave={() => setTip((t) => ({ ...t, visible: false }))}
            />
          );
        })}
      </svg>
    </div>
  );
}

// ── QQ PLOT ───────────────────────────────────
function ChartQQPlot({ data }: { data: ChartDataItem[] }) {
  const cols = getColNames(data);
  const colors = getColColors(data);
  const [tip, setTip] = useState({ visible: false, x: 0, y: 0, content: "" });
  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <SVGTooltip {...tip} />
      <svg viewBox="0 0 220 200" style={{ width: "100%", height: "100%" }}>
        <line
          x1="20"
          y1="180"
          x2="200"
          y2="20"
          stroke="#cbd5e1"
          strokeDasharray="4 3"
        />
        <text x="5" y="185" fontSize="9" fill="#94a3b8">
          Theoretical
        </text>
        {cols.map((col) => {
          const vals = data
            .map((d) => d.Columns.find((c) => c.Colname === col)?.Value ?? 0)
            .sort((a, b) => a - b);
          const allVals = data.flatMap((d) => d.Columns.map((c) => c.Value));
          const minV = Math.min(...allVals),
            maxV = Math.max(...allVals);
          return vals.map((v, i) => {
            const x = 20 + (i / (vals.length - 1 || 1)) * 180;
            const y = 180 - ((v - minV) / (maxV - minV || 1)) * 160;
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r={3}
                fill={colors[col]}
                onMouseEnter={() =>
                  setTip({
                    visible: true,
                    x,
                    y,
                    content: `${col} Q${i + 1}: ${v}`,
                  })
                }
                onMouseLeave={() => setTip((t) => ({ ...t, visible: false }))}
              />
            );
          });
        })}
      </svg>
    </div>
  );
}

// ── STREAMGRAPH ───────────────────────────────
function ChartStreamgraph({ data }: { data: ChartDataItem[] }) {
  const flat = toFlatSeries(data);
  const cols = getColNames(data);
  const colors = getColColors(data);
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={flat}>
        <XAxis dataKey="name" />
        <Tooltip />
        <Legend />
        {cols.map((col) => (
          <Area
            key={col}
            type="monotone"
            dataKey={col}
            stackId="stream"
            stroke={colors[col]}
            fill={`${colors[col]}66`}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ── SMALL MULTIPLES ───────────────────────────
function ChartSmallMultiples({ data }: { data: ChartDataItem[] }) {
  const cols = getColNames(data);
  const colors = getColColors(data);
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${Math.min(3, cols.length)}, 1fr)`,
        gap: 6,
        padding: 6,
        height: "100%",
      }}
    >
      {cols.map((col) => {
        const seriesData = data.map((d) => ({
          name: d.Name,
          value: d.Columns.find((c) => c.Colname === col)?.Value ?? 0,
        }));
        return (
          <div
            key={col}
            style={{ border: "1px solid #e2e8f0", borderRadius: 6, padding: 4 }}
          >
            <div
              style={{
                fontSize: 10,
                fontWeight: 600,
                color: colors[col],
                marginBottom: 2,
              }}
            >
              {col}
            </div>
            <ResponsiveContainer width="100%" height={80}>
              <LineChart data={seriesData}>
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={colors[col]}
                  dot={false}
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        );
      })}
    </div>
  );
}

// ── CALENDAR HEATMAP ──────────────────────────
function ChartCalendarHeatmap({ data }: { data: ChartDataItem[] }) {
  const cols = getColNames(data);
  const colors = getColColors(data);
  const [tip, setTip] = useState({ visible: false, x: 0, y: 0, content: "" });
  const allVals = data.flatMap((d) => d.Columns.map((c) => c.Value));
  const minVal = Math.min(...allVals),
    maxVal = Math.max(...allVals);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        overflowX: "auto",
        padding: 8,
      }}
    >
      <SVGTooltip {...tip} />
      {cols.map((col) => (
        <div key={col} style={{ marginBottom: 8 }}>
          <div
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: colors[col],
              marginBottom: 4,
            }}
          >
            {col}
          </div>
          <div style={{ display: "flex", gap: 3 }}>
            {data.map((item, i) => {
              const v = item.Columns.find((c) => c.Colname === col)?.Value ?? 0;
              const intensity = (v - minVal) / (maxVal - minVal || 1);
              const [r, g, b] = hexToRgb(colors[col]);
              return (
                <div
                  key={i}
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: 3,
                    background: `rgba(${r},${g},${b},${0.15 + intensity * 0.8})`,
                    cursor: "pointer",
                  }}
                  onMouseEnter={() =>
                    setTip({
                      visible: true,
                      x: i * 20,
                      y: 0,
                      content: `${col} / ${item.Name}: ${v}`,
                    })
                  }
                  onMouseLeave={() => setTip((t) => ({ ...t, visible: false }))}
                />
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── MEKKO ─────────────────────────────────────
function ChartMekko({ data }: { data: ChartDataItem[] }) {
  const cols = getColNames(data);
  const colors = getColColors(data);
  const [tip, setTip] = useState({ visible: false, x: 0, y: 0, content: "" });
  const totals = data.map((d) => d.Columns.reduce((s, c) => s + c.Value, 0));
  const grandTotal = totals.reduce((s, t) => s + t, 0);
  const W = 300,
    H = 140;

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <SVGTooltip {...tip} />
      <svg
        viewBox={`0 0 ${W + 20} ${H + 30}`}
        style={{ width: "100%", height: "100%" }}
      >
        {(() => {
          let x = 10;
          return data.map((item, di) => {
            const colW = (totals[di] / grandTotal) * W;
            let y = 10;
            const rects = item.Columns.map((col) => {
              const colH = (col.Value / totals[di]) * H;
              const rect = (
                <rect
                  key={col.Colname}
                  x={x}
                  y={y}
                  width={colW - 1}
                  height={colH}
                  fill={colors[col.Colname] || col.Color}
                  onMouseEnter={() =>
                    setTip({
                      visible: true,
                      x,
                      y,
                      content: `${item.Name} / ${col.Colname}: ${col.Value}`,
                    })
                  }
                  onMouseLeave={() => setTip((t) => ({ ...t, visible: false }))}
                />
              );
              y += colH;
              return rect;
            });
            const gx = x;
            x += colW;
            return (
              <g key={di}>
                {rects}
                <text
                  x={gx + colW / 2}
                  y={H + 22}
                  textAnchor="middle"
                  fontSize="9"
                  fill="#64748b"
                >
                  {item.Name}
                </text>
              </g>
            );
          });
        })()}
      </svg>
    </div>
  );
}

// ── RENKO ─────────────────────────────────────
function ChartRenko({ data }: { data: ChartDataItem[] }) {
  const cols = getColNames(data);
  const colors = getColColors(data);
  const [tip, setTip] = useState({ visible: false, x: 0, y: 0, content: "" });

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <SVGTooltip {...tip} />
      <svg
        viewBox={`0 0 ${data.length * cols.length * 22 + 20} 160`}
        style={{ width: "100%", height: "100%" }}
      >
        {cols.map((col, ci) =>
          data.map((item, di) => {
            const v = item.Columns.find((c) => c.Colname === col)?.Value ?? 0;
            const prev =
              di > 0
                ? (data[di - 1].Columns.find((c) => c.Colname === col)?.Value ??
                  0)
                : 0;
            const up = v >= prev;
            const x = 10 + (di * cols.length + ci) * 22;
            const y = 60 + (di % 3) * 22;
            return (
              <rect
                key={`${col}-${di}`}
                x={x}
                y={y}
                width={18}
                height={18}
                rx={3}
                fill={up ? colors[col] : `${colors[col]}66`}
                stroke={colors[col]}
                strokeWidth={1}
                onMouseEnter={() =>
                  setTip({
                    visible: true,
                    x,
                    y,
                    content: `${col} ${item.Name}: ${v} (${up ? "▲" : "▼"})`,
                  })
                }
                onMouseLeave={() => setTip((t) => ({ ...t, visible: false }))}
              />
            );
          }),
        )}
      </svg>
    </div>
  );
}

// ── KAGI ──────────────────────────────────────
function ChartKagi({ data }: { data: ChartDataItem[] }) {
  const cols = getColNames(data);
  const colors = getColColors(data);
  const [tip, setTip] = useState({ visible: false, x: 0, y: 0, content: "" });
  const allVals = data.flatMap((d) => d.Columns.map((c) => c.Value));
  const minVal = Math.min(...allVals),
    maxVal = Math.max(...allVals);
  const norm = (v: number) =>
    20 + ((v - minVal) / (maxVal - minVal || 1)) * 110;
  const W = 300;

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <SVGTooltip {...tip} />
      <svg
        viewBox={`0 0 ${W + 20} 160`}
        style={{ width: "100%", height: "100%" }}
      >
        {cols.map((col) => {
          const vals = data.map((d) => ({
            name: d.Name,
            v: d.Columns.find((c) => c.Colname === col)?.Value ?? 0,
          }));
          const xStep = W / (vals.length - 1 || 1);
          let path = "";
          vals.forEach((pt, i) => {
            const x = 10 + i * xStep;
            const y = 140 - norm(pt.v);
            path += i === 0 ? `M${x},${y}` : `L${x},${y}`;
          });
          return (
            <path
              key={col}
              d={path}
              stroke={colors[col]}
              strokeWidth={3}
              fill="none"
              onMouseEnter={() =>
                setTip({
                  visible: true,
                  x: W / 2,
                  y: 60,
                  content: `${col}: ${vals.map((v) => v.v).join(" → ")}`,
                })
              }
              onMouseLeave={() => setTip((t) => ({ ...t, visible: false }))}
            />
          );
        })}
        {data.map((item, i) => (
          <text
            key={i}
            x={10 + i * (W / (data.length - 1 || 1))}
            y={155}
            textAnchor="middle"
            fontSize="9"
            fill="#94a3b8"
          >
            {item.Name}
          </text>
        ))}
      </svg>
    </div>
  );
}

// ── HEXBIN ────────────────────────────────────
function ChartHexbin({ data }: { data: ChartDataItem[] }) {
  const cols = getColNames(data);
  const colors = getColColors(data);
  const [tip, setTip] = useState({ visible: false, x: 0, y: 0, content: "" });
  const allVals = data.flatMap((d) => d.Columns.map((c) => c.Value));
  const minVal = Math.min(...allVals),
    maxVal = Math.max(...allVals);

  const hexPoints = (cx: number, cy: number, size: number) =>
    Array.from({ length: 6 }, (_, i) => {
      const a = (Math.PI / 3) * i;
      return `${cx + size * Math.cos(a)},${cy + size * Math.sin(a)}`;
    }).join(" ");

  const size = 16;
  const items: JSX.Element[] = [];
  data.forEach((item, di) =>
    cols.forEach((col, ci) => {
      const v = item.Columns.find((c) => c.Colname === col)?.Value ?? 0;
      const intensity = (v - minVal) / (maxVal - minVal || 1);
      const cx = 30 + di * (size * 2.1) + (ci % 2 ? size : 0);
      const cy = 30 + ci * (size * 1.8);
      const [r, g, b] = hexToRgb(colors[col]);
      items.push(
        <polygon
          key={`${di}-${ci}`}
          points={hexPoints(cx, cy, size)}
          fill={`rgba(${r},${g},${b},${0.2 + intensity * 0.75})`}
          stroke="#fff"
          strokeWidth={1}
          onMouseEnter={() =>
            setTip({
              visible: true,
              x: cx,
              y: cy,
              content: `${item.Name} / ${col}: ${v}`,
            })
          }
          onMouseLeave={() => setTip((t) => ({ ...t, visible: false }))}
        />,
      );
    }),
  );

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <SVGTooltip {...tip} />
      <svg
        viewBox={`0 0 ${data.length * size * 2.1 + 60} ${cols.length * size * 1.8 + 40}`}
        style={{ width: "100%", height: "100%" }}
      >
        {items}
      </svg>
    </div>
  );
}

// ── PARALLEL COORDINATES ──────────────────────
function ChartParallelCoords({ data }: { data: ChartDataItem[] }) {
  const cols = getColNames(data);
  const colors = getColColors(data);
  const [tip, setTip] = useState({ visible: false, x: 0, y: 0, content: "" });
  const allVals = data.flatMap((d) => d.Columns.map((c) => c.Value));
  const minVal = Math.min(...allVals),
    maxVal = Math.max(...allVals);
  const norm = (v: number) =>
    20 + ((v - minVal) / (maxVal - minVal || 1)) * 120;
  const W = 300;
  const xStep = cols.length > 1 ? W / (cols.length - 1) : W;

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <SVGTooltip {...tip} />
      <svg
        viewBox={`0 0 ${W + 20} 180`}
        style={{ width: "100%", height: "100%" }}
      >
        {cols.map((col, ci) => (
          <g key={col}>
            <line
              x1={10 + ci * xStep}
              y1={20}
              x2={10 + ci * xStep}
              y2={150}
              stroke="#e2e8f0"
            />
            <text
              x={10 + ci * xStep}
              y={165}
              textAnchor="middle"
              fontSize="9"
              fill="#64748b"
            >
              {col}
            </text>
          </g>
        ))}
        {data.map((item, di) => {
          const path = cols
            .map((col, ci) => {
              const v = item.Columns.find((c) => c.Colname === col)?.Value ?? 0;
              const x = 10 + ci * xStep;
              const y = 150 - norm(v) + 20;
              return `${ci === 0 ? "M" : "L"} ${x} ${y}`;
            })
            .join(" ");
          const firstColor = item.Columns[0]?.Color || "#1155CC";
          return (
            <path
              key={di}
              d={path}
              fill="none"
              stroke={firstColor}
              strokeWidth={1.5}
              opacity={0.75}
              onMouseEnter={() =>
                setTip({
                  visible: true,
                  x: W / 2,
                  y: 80,
                  content:
                    item.Name +
                    ": " +
                    item.Columns.map((c) => `${c.Colname}=${c.Value}`).join(
                      ", ",
                    ),
                })
              }
              onMouseLeave={() => setTip((t) => ({ ...t, visible: false }))}
            />
          );
        })}
      </svg>
    </div>
  );
}

// ── NETWORK ───────────────────────────────────
function ChartNetwork({ data }: { data: ChartDataItem[] }) {
  const cols = getColNames(data);
  const colors = getColColors(data);
  const [tip, setTip] = useState({ visible: false, x: 0, y: 0, content: "" });
  const cx = 110,
    cy = 100,
    r = 70;
  // Central node = all periods combined, outer nodes = columns
  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <SVGTooltip {...tip} />
      <svg viewBox="0 0 220 200" style={{ width: "100%", height: "100%" }}>
        <circle cx={cx} cy={cy} r={12} fill="#0f172a" />
        <text
          x={cx}
          y={cy + 25}
          textAnchor="middle"
          fontSize="9"
          fill="#64748b"
        >
          All
        </text>
        {cols.map((col, i) => {
          const angle = (i / cols.length) * Math.PI * 2 - Math.PI / 2;
          const nx = cx + r * Math.cos(angle);
          const ny = cy + r * Math.sin(angle);
          const totalVal = data.reduce(
            (s, d) =>
              s + (d.Columns.find((c) => c.Colname === col)?.Value ?? 0),
            0,
          );
          return (
            <g key={col}>
              <line
                x1={cx}
                y1={cy}
                x2={nx}
                y2={ny}
                stroke="#e2e8f0"
                strokeWidth={2}
              />
              <circle
                cx={nx}
                cy={ny}
                r={8}
                fill={colors[col]}
                onMouseEnter={() =>
                  setTip({
                    visible: true,
                    x: nx,
                    y: ny,
                    content: `${col}: total ${totalVal}`,
                  })
                }
                onMouseLeave={() => setTip((t) => ({ ...t, visible: false }))}
              />
              <text
                x={nx}
                y={ny + 18}
                textAnchor="middle"
                fontSize="9"
                fill={colors[col]}
              >
                {col}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ── CHORD ─────────────────────────────────────
function ChartChord({ data }: { data: ChartDataItem[] }) {
  const cols = getColNames(data);
  const colors = getColColors(data);
  const [tip, setTip] = useState({ visible: false, x: 0, y: 0, content: "" });
  const cx = 100,
    cy = 100,
    r = 70;

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <SVGTooltip {...tip} />
      <svg viewBox="0 0 200 200" style={{ width: "100%", height: "100%" }}>
        {cols.map((col, i) => {
          const startAngle = (i / cols.length) * Math.PI * 2 - Math.PI / 2;
          const endAngle = ((i + 1) / cols.length) * Math.PI * 2 - Math.PI / 2;
          const x1 = cx + r * Math.cos(startAngle),
            y1 = cy + r * Math.sin(startAngle);
          const x2 = cx + r * Math.cos(endAngle),
            y2 = cy + r * Math.sin(endAngle);
          return (
            <path
              key={col}
              d={`M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} L ${cx} ${cy} Z`}
              fill={colors[col]}
              opacity={0.7}
              onMouseEnter={() => {
                const totalVal = data.reduce(
                  (s, d) =>
                    s + (d.Columns.find((c) => c.Colname === col)?.Value ?? 0),
                  0,
                );
                setTip({
                  visible: true,
                  x: (x1 + x2) / 2,
                  y: (y1 + y2) / 2,
                  content: `${col}: ${totalVal}`,
                });
              }}
              onMouseLeave={() => setTip((t) => ({ ...t, visible: false }))}
            />
          );
        })}
        {cols.map((colA, i) =>
          cols.slice(i + 1).map((colB, j) => {
            const ai = ((i + 0.5) / cols.length) * Math.PI * 2 - Math.PI / 2;
            const bi =
              ((i + j + 1.5) / cols.length) * Math.PI * 2 - Math.PI / 2;
            const x1 = cx + (r - 10) * Math.cos(ai),
              y1 = cy + (r - 10) * Math.sin(ai);
            const x2 = cx + (r - 10) * Math.cos(bi),
              y2 = cy + (r - 10) * Math.sin(bi);
            return (
              <path
                key={`${colA}-${colB}`}
                d={`M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`}
                stroke={colors[colA]}
                strokeWidth={2}
                fill="none"
                opacity={0.4}
              />
            );
          }),
        )}
      </svg>
    </div>
  );
}

// ── SANKEY ────────────────────────────────────
function ChartSankey({ data }: { data: ChartDataItem[] }) {
  const cols = getColNames(data);
  const colors = getColColors(data);
  const [tip, setTip] = useState({ visible: false, x: 0, y: 0, content: "" });
  const W = 300,
    H = 140;
  // Left nodes = periods, right nodes = columns
  const totalVal = data.reduce(
    (s, d) => s + d.Columns.reduce((ss, c) => ss + c.Value, 0),
    0,
  );

  let leftY = 10;
  const leftNodes = data.map((item) => {
    const total = item.Columns.reduce((s, c) => s + c.Value, 0);
    const h = (total / totalVal) * (H - data.length * 5);
    const node = {
      name: item.Name,
      y: leftY,
      h,
      total,
      color: item.Columns[0]?.Color || "#1155CC",
    };
    leftY += h + 5;
    return node;
  });

  let rightY = 10;
  const rightNodes = cols.map((col) => {
    const total = data.reduce(
      (s, d) => s + (d.Columns.find((c) => c.Colname === col)?.Value ?? 0),
      0,
    );
    const h = (total / totalVal) * (H - cols.length * 5);
    const node = { name: col, y: rightY, h, total, color: colors[col] };
    rightY += h + 5;
    return node;
  });

  const links: { d: string; color: string; label: string }[] = [];
  data.forEach((item, di) => {
    item.Columns.forEach((col) => {
      const ln = leftNodes[di];
      const rn = rightNodes.find((n) => n.name === col.Colname);
      if (!ln || !rn) return;
      const lx = 50,
        rx = W - 50;
      const ly = 10 + ln.y + ln.h / 2;
      const ry = 10 + rn.y + rn.h / 2;
      const strokeW = Math.max(1, (col.Value / totalVal) * 40);
      links.push({
        d: `M ${lx} ${ly} C ${(lx + rx) / 2} ${ly}, ${(lx + rx) / 2} ${ry}, ${rx} ${ry}`,
        color: col.Color,
        label: `${item.Name} → ${col.Colname}: ${col.Value}`,
      });
    });
  });

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <SVGTooltip {...tip} />
      <svg
        viewBox={`0 0 ${W + 20} ${H + 30}`}
        style={{ width: "100%", height: "100%" }}
      >
        {links.map((l, i) => (
          <path
            key={i}
            d={l.d}
            fill="none"
            stroke={l.color}
            strokeWidth={3}
            opacity={0.5}
            onMouseEnter={() =>
              setTip({ visible: true, x: W / 2, y: H / 2, content: l.label })
            }
            onMouseLeave={() => setTip((t) => ({ ...t, visible: false }))}
          />
        ))}
        {leftNodes.map((n, i) => (
          <g key={i}>
            <rect
              x={10}
              y={10 + n.y}
              width={40}
              height={Math.max(4, n.h)}
              rx={3}
              fill={n.color}
            />
            <text x={55} y={10 + n.y + n.h / 2 + 4} fontSize="9" fill="#64748b">
              {n.name}
            </text>
          </g>
        ))}
        {rightNodes.map((n, i) => (
          <g key={i}>
            <rect
              x={W - 40}
              y={10 + n.y}
              width={40}
              height={Math.max(4, n.h)}
              rx={3}
              fill={n.color}
            />
            <text
              x={W - 44}
              y={10 + n.y + n.h / 2 + 4}
              fontSize="9"
              fill="#64748b"
              textAnchor="end"
            >
              {n.name}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

// ── RADIAL BARS ───────────────────────────────
function ChartRadialBars({ data }: { data: ChartDataItem[] }) {
  const cols = getColNames(data);
  const colors = getColColors(data);
  const last = data[data.length - 1];
  const allVals = data.flatMap((d) => d.Columns.map((c) => c.Value));
  const maxVal = Math.max(...allVals);
  const [tip, setTip] = useState({ visible: false, x: 0, y: 0, content: "" });
  const cx = 100,
    cy = 100;

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <SVGTooltip {...tip} />
      <svg viewBox="0 0 200 200" style={{ width: "100%", height: "100%" }}>
        {cols.map((col, i) => {
          const v = last?.Columns.find((c) => c.Colname === col)?.Value ?? 0;
          const pct = v / maxVal;
          const r = 25 + i * 15;
          const c2 = 2 * Math.PI * r;
          return (
            <g key={col}>
              <circle
                cx={cx}
                cy={cy}
                r={r}
                fill="none"
                stroke="#f1f5f9"
                strokeWidth={8}
              />
              <circle
                cx={cx}
                cy={cy}
                r={r}
                fill="none"
                stroke={colors[col]}
                strokeWidth={8}
                strokeDasharray={`${c2 * pct} ${c2}`}
                strokeDashoffset={c2 * 0.25}
                strokeLinecap="round"
                onMouseEnter={() =>
                  setTip({
                    visible: true,
                    x: cx + r,
                    y: cy,
                    content: `${col}: ${v}`,
                  })
                }
                onMouseLeave={() => setTip((t) => ({ ...t, visible: false }))}
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ── PROGRESS RING ─────────────────────────────
function ChartProgressRing({ data }: { data: ChartDataItem[] }) {
  const cols = getColNames(data);
  const colors = getColColors(data);
  const allVals = data.flatMap((d) => d.Columns.map((c) => c.Value));
  const maxVal = Math.max(...allVals);
  const last = data[data.length - 1];
  const [tip, setTip] = useState({ visible: false, x: 0, y: 0, content: "" });

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        gap: 8,
        padding: 8,
      }}
    >
      <SVGTooltip {...tip} />
      {cols.map((col) => {
        const v = last?.Columns.find((c) => c.Colname === col)?.Value ?? 0;
        const pct = Math.round((v / maxVal) * 100);
        const r = 35,
          c2 = 2 * Math.PI * r;
        return (
          <svg
            key={col}
            viewBox="0 0 100 100"
            style={{ width: 80, height: 80 }}
            onMouseEnter={() =>
              setTip({
                visible: true,
                x: 40,
                y: 10,
                content: `${col}: ${v} (${pct}%)`,
              })
            }
            onMouseLeave={() => setTip((t) => ({ ...t, visible: false }))}
          >
            <circle
              cx={50}
              cy={50}
              r={r}
              fill="none"
              stroke="#e2e8f0"
              strokeWidth={10}
            />
            <circle
              cx={50}
              cy={50}
              r={r}
              fill="none"
              stroke={colors[col]}
              strokeWidth={10}
              strokeDasharray={`${(c2 * pct) / 100} ${c2}`}
              strokeDashoffset={c2 * 0.25}
              strokeLinecap="round"
            />
            <text
              x={50}
              y={54}
              textAnchor="middle"
              fontWeight="bold"
              fontSize="14"
              fill={colors[col]}
            >
              {pct}%
            </text>
            <text x={50} y={68} textAnchor="middle" fontSize="8" fill="#64748b">
              {col}
            </text>
          </svg>
        );
      })}
    </div>
  );
}

// ── WORD CLOUD ────────────────────────────────
function ChartWordCloud({ data }: { data: ChartDataItem[] }) {
  const cols = getColNames(data);
  const colors = getColColors(data);
  const allVals = data.flatMap((d) => d.Columns.map((c) => c.Value));
  const maxVal = Math.max(...allVals);
  const [tip, setTip] = useState({ visible: false, x: 0, y: 0, content: "" });

  const words = cols
    .map((col) => {
      const totalVal = data.reduce(
        (s, d) => s + (d.Columns.find((c) => c.Colname === col)?.Value ?? 0),
        0,
      );
      return { col, totalVal, color: colors[col] };
    })
    .sort((a, b) => b.totalVal - a.totalVal);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        padding: 12,
        position: "relative",
      }}
    >
      <SVGTooltip {...tip} />
      {words.map(({ col, totalVal, color }) => {
        const size = 12 + (totalVal / maxVal) * 22;
        return (
          <span
            key={col}
            style={{
              fontSize: size,
              fontWeight: 700,
              color,
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              const rect = (e.target as HTMLElement).getBoundingClientRect();
              setTip({
                visible: true,
                x: 0,
                y: 0,
                content: `${col}: ${totalVal}`,
              });
            }}
            onMouseLeave={() => setTip((t) => ({ ...t, visible: false }))}
          >
            {col}
          </span>
        );
      })}
    </div>
  );
}

// ── SUNBURST ──────────────────────────────────
function ChartSunburst({ data }: { data: ChartDataItem[] }) {
  const cols = getColNames(data);
  const colors = getColColors(data);
  const [tip, setTip] = useState({ visible: false, x: 0, y: 0, content: "" });
  const allTotal = data
    .flatMap((d) => d.Columns)
    .reduce((s, c) => s + c.Value, 0);
  const cx = 100,
    cy = 100,
    innerR = 35,
    outerR = 90;

  // Outer ring: each period
  let outerAngle = 0;
  const outerArcs = data.map((item) => {
    const total = item.Columns.reduce((s, c) => s + c.Value, 0);
    const sweep = (total / allTotal) * 2 * Math.PI;
    const arc = {
      item,
      startAngle: outerAngle,
      endAngle: outerAngle + sweep,
      color: item.Columns[0]?.Color || "#1155CC",
    };
    outerAngle += sweep;
    return arc;
  });

  // Inner ring: each column
  let innerAngle = 0;
  const innerArcs = cols.map((col) => {
    const total = data.reduce(
      (s, d) => s + (d.Columns.find((c) => c.Colname === col)?.Value ?? 0),
      0,
    );
    const sweep = (total / allTotal) * 2 * Math.PI;
    const arc = {
      col,
      startAngle: innerAngle,
      endAngle: innerAngle + sweep,
      color: colors[col],
    };
    innerAngle += sweep;
    return arc;
  });

  const arcPath = (start: number, end: number, r1: number, r2: number) => {
    const x1 = cx + r1 * Math.cos(start - Math.PI / 2);
    const y1 = cy + r1 * Math.sin(start - Math.PI / 2);
    const x2 = cx + r2 * Math.cos(start - Math.PI / 2);
    const y2 = cy + r2 * Math.sin(start - Math.PI / 2);
    const x3 = cx + r2 * Math.cos(end - Math.PI / 2);
    const y3 = cy + r2 * Math.sin(end - Math.PI / 2);
    const x4 = cx + r1 * Math.cos(end - Math.PI / 2);
    const y4 = cy + r1 * Math.sin(end - Math.PI / 2);
    const large = end - start > Math.PI ? 1 : 0;
    return `M${x1},${y1} L${x2},${y2} A${r2},${r2} 0 ${large} 1 ${x3},${y3} L${x4},${y4} A${r1},${r1} 0 ${large} 0 ${x1},${y1} Z`;
  };

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <SVGTooltip {...tip} />
      <svg viewBox="0 0 200 200" style={{ width: "100%", height: "100%" }}>
        {innerArcs.map((arc) => (
          <path
            key={arc.col}
            d={arcPath(arc.startAngle, arc.endAngle, 0, innerR)}
            fill={arc.color}
            stroke="#fff"
            strokeWidth={1}
            onMouseEnter={() => {
              const total = data.reduce(
                (s, d) =>
                  s +
                  (d.Columns.find((c) => c.Colname === arc.col)?.Value ?? 0),
                0,
              );
              setTip({
                visible: true,
                x: cx,
                y: cy,
                content: `${arc.col}: ${total}`,
              });
            }}
            onMouseLeave={() => setTip((t) => ({ ...t, visible: false }))}
          />
        ))}
        {outerArcs.map((arc, i) => (
          <path
            key={i}
            d={arcPath(arc.startAngle, arc.endAngle, innerR + 5, outerR)}
            fill={arc.color}
            stroke="#fff"
            strokeWidth={1}
            onMouseEnter={() => {
              const total = arc.item.Columns.reduce((s, c) => s + c.Value, 0);
              setTip({
                visible: true,
                x: cx,
                y: cy,
                content: `${arc.item.Name}: ${total}`,
              });
            }}
            onMouseLeave={() => setTip((t) => ({ ...t, visible: false }))}
          />
        ))}
      </svg>
    </div>
  );
}

// ── ICICLE ────────────────────────────────────
function ChartIcicle({ data }: { data: ChartDataItem[] }) {
  const cols = getColNames(data);
  const colors = getColColors(data);
  const [tip, setTip] = useState({ visible: false, x: 0, y: 0, content: "" });
  const allTotal = data
    .flatMap((d) => d.Columns)
    .reduce((s, c) => s + c.Value, 0);
  const W = 300;

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <SVGTooltip {...tip} />
      <svg
        viewBox={`0 0 ${W + 20} 170`}
        style={{ width: "100%", height: "100%" }}
      >
        {/* Root row */}
        <rect x={10} y={10} width={W} height={30} rx={3} fill="#e2e8f0" />
        <text
          x={10 + W / 2}
          y={30}
          textAnchor="middle"
          fontSize="10"
          fill="#64748b"
        >
          Total: {allTotal}
        </text>
        {/* Period row */}
        {(() => {
          let x = 10;
          return data.map((item, i) => {
            const total = item.Columns.reduce((s, c) => s + c.Value, 0);
            const w = (total / allTotal) * W;
            const el = (
              <g key={i}>
                <rect
                  x={x}
                  y={45}
                  width={w - 1}
                  height={30}
                  rx={2}
                  fill={item.Columns[0]?.Color || "#1155CC"}
                  onMouseEnter={() =>
                    setTip({
                      visible: true,
                      x,
                      y: 45,
                      content: `${item.Name}: ${total}`,
                    })
                  }
                  onMouseLeave={() => setTip((t) => ({ ...t, visible: false }))}
                />
                {w > 30 && (
                  <text
                    x={x + w / 2}
                    y={65}
                    textAnchor="middle"
                    fontSize="9"
                    fill="#fff"
                  >
                    {item.Name}
                  </text>
                )}
              </g>
            );
            x += w;
            return el;
          });
        })()}
        {/* Column row */}
        {(() => {
          let x = 10;
          return cols.map((col, ci) => {
            const total = data.reduce(
              (s, d) =>
                s + (d.Columns.find((c) => c.Colname === col)?.Value ?? 0),
              0,
            );
            const w = (total / allTotal) * W;
            const el = (
              <g key={ci}>
                <rect
                  x={x}
                  y={80}
                  width={w - 1}
                  height={30}
                  rx={2}
                  fill={colors[col]}
                  onMouseEnter={() =>
                    setTip({
                      visible: true,
                      x,
                      y: 80,
                      content: `${col}: ${total}`,
                    })
                  }
                  onMouseLeave={() => setTip((t) => ({ ...t, visible: false }))}
                />
                {w > 20 && (
                  <text
                    x={x + w / 2}
                    y={100}
                    textAnchor="middle"
                    fontSize="9"
                    fill="#fff"
                  >
                    {col}
                  </text>
                )}
              </g>
            );
            x += w;
            return el;
          });
        })()}
      </svg>
    </div>
  );
}

// ── CHOROPLETH / BUBBLE MAP / FLOW MAP (simplified without geo) ───
function ChartGeoPlaceholder({
  data,
  label,
}: {
  data: ChartDataItem[];
  label: string;
}) {
  const cols = getColNames(data);
  const colors = getColColors(data);
  const total = data.flatMap((d) => d.Columns).reduce((s, c) => s + c.Value, 0);
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 12,
      }}
    >
      <div style={{ fontSize: 12, color: "#64748b", marginBottom: 8 }}>
        {label}
      </div>
      <div
        style={{
          display: "flex",
          gap: 8,
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        {cols.map((col) => {
          const v = data.reduce(
            (s, d) =>
              s + (d.Columns.find((c) => c.Colname === col)?.Value ?? 0),
            0,
          );
          const r = 10 + (v / total) * 30;
          return (
            <div
              key={col}
              title={`${col}: ${v}`}
              style={{
                width: r * 2,
                height: r * 2,
                borderRadius: "50%",
                background: colors[col],
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 10,
                color: "#fff",
                fontWeight: 600,
              }}
            >
              {col}
            </div>
          );
        })}
      </div>
      <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 8 }}>
        Bubble size = relative value
      </div>
    </div>
  );
}

// ── GAUGE RADIAL BAR ──────────────────────────
function ChartGaugeRadialBar({ data }: { data: ChartDataItem[] }) {
  const cols = getColNames(data);
  const colors = getColColors(data);
  const allVals = data.flatMap((d) => d.Columns.map((c) => c.Value));
  const maxVal = Math.max(...allVals);
  const last = data[data.length - 1];

  const radialData = cols.map((col) => ({
    name: col,
    value: last?.Columns.find((c) => c.Colname === col)?.Value ?? 0,
    fill: colors[col],
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RadialBarChart
        innerRadius="30%"
        outerRadius="100%"
        data={radialData}
        startAngle={180}
        endAngle={0}
      >
        <RadialBar
          dataKey="value"
          label={{ position: "insideStart", fill: "#fff", fontSize: 10 }}
          background
        >
          {radialData.map((entry, i) => (
            <Cell key={i} fill={entry.fill} />
          ))}
        </RadialBar>
        <Legend iconSize={10} layout="vertical" verticalAlign="bottom" />
        <Tooltip formatter={(v, name) => [v, name]} />
      </RadialBarChart>
    </ResponsiveContainer>
  );
}

// ── DUMBBELL ──────────────────────────────────
function ChartDumbbell({ data }: { data: ChartDataItem[] }) {
  const cols = getColNames(data);
  const colors = getColColors(data);
  const allVals = data.flatMap((d) => d.Columns.map((c) => c.Value));
  const minVal = Math.min(...allVals),
    maxVal = Math.max(...allVals);
  const [tip, setTip] = useState({ visible: false, x: 0, y: 0, content: "" });

  // Each row = one column, showing range across periods
  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <SVGTooltip {...tip} />
      <svg
        viewBox={`0 0 320 ${cols.length * 36 + 20}`}
        style={{ width: "100%", height: "100%" }}
      >
        {cols.map((col, i) => {
          const vals = data.map(
            (d) => d.Columns.find((c) => c.Colname === col)?.Value ?? 0,
          );
          const low = Math.min(...vals),
            high = Math.max(...vals);
          const y = 20 + i * 36;
          const x1 = 60 + ((low - minVal) / (maxVal - minVal || 1)) * 220;
          const x2 = 60 + ((high - minVal) / (maxVal - minVal || 1)) * 220;
          const lowPeriod = data[vals.indexOf(low)]?.Name;
          const highPeriod = data[vals.indexOf(high)]?.Name;
          return (
            <g key={col}>
              <text x={5} y={y + 5} fontSize="10" fill="#64748b">
                {col}
              </text>
              <line
                x1={x1}
                y1={y}
                x2={x2}
                y2={y}
                stroke="#cbd5e1"
                strokeWidth={4}
              />
              <circle
                cx={x1}
                cy={y}
                r={7}
                fill={colors[col]}
                onMouseEnter={() =>
                  setTip({
                    visible: true,
                    x: x1,
                    y,
                    content: `${col} min: ${low} (${lowPeriod})`,
                  })
                }
                onMouseLeave={() => setTip((t) => ({ ...t, visible: false }))}
              />
              <circle
                cx={x2}
                cy={y}
                r={7}
                fill={colors[col]}
                opacity={0.5}
                onMouseEnter={() =>
                  setTip({
                    visible: true,
                    x: x2,
                    y,
                    content: `${col} max: ${high} (${highPeriod})`,
                  })
                }
                onMouseLeave={() => setTip((t) => ({ ...t, visible: false }))}
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ── RIBBON CHART ──────────────────────────────
function ChartRibbon({ data }: { data: ChartDataItem[] }) {
  const flat = toFlatSeries(data);
  const cols = getColNames(data);
  const colors = getColColors(data);
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={flat}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        {cols.map((col) => (
          <Area
            key={col}
            type="natural"
            dataKey={col}
            stroke={colors[col]}
            fill={`${colors[col]}44`}
            strokeWidth={2}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ── OHLC ──────────────────────────────────────
function ChartOHLC({ data }: { data: ChartDataItem[] }) {
  // Reuse candlestick logic with OHLC lines style
  const [tip, setTip] = useState({ visible: false, x: 0, y: 0, content: "" });
  const allVals = data.flatMap((d) => d.Columns.map((c) => c.Value));
  const minVal = Math.min(...allVals),
    maxVal = Math.max(...allVals);
  const norm = (v: number) =>
    10 + ((v - minVal) / (maxVal - minVal || 1)) * 120;

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <SVGTooltip {...tip} />
      <svg
        viewBox={`0 0 ${data.length * 60 + 20} 160`}
        style={{ width: "100%", height: "100%" }}
      >
        {data.map((item, i) => {
          const vals = item.Columns.map((c) => c.Value);
          const open = vals[0],
            close = vals[vals.length - 1];
          const high = Math.max(...vals),
            low = Math.min(...vals);
          const x = 10 + i * 60 + 15;
          return (
            <g
              key={i}
              onMouseEnter={() =>
                setTip({
                  visible: true,
                  x,
                  y: 20,
                  content: `${item.Name} O:${open} H:${high} L:${low} C:${close}`,
                })
              }
              onMouseLeave={() => setTip((t) => ({ ...t, visible: false }))}
            >
              <line
                x1={x}
                y1={140 - norm(high)}
                x2={x}
                y2={140 - norm(low)}
                stroke="#64748b"
              />
              <line
                x1={x - 8}
                y1={140 - norm(open)}
                x2={x}
                y2={140 - norm(open)}
                stroke={item.Columns[0]?.Color || "#ef4444"}
                strokeWidth={2}
              />
              <line
                x1={x}
                y1={140 - norm(close)}
                x2={x + 8}
                y2={140 - norm(close)}
                stroke={
                  item.Columns[item.Columns.length - 1]?.Color || "#22c55e"
                }
                strokeWidth={2}
              />
              <text
                x={x}
                y={155}
                textAnchor="middle"
                fontSize="9"
                fill="#64748b"
              >
                {item.Name}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ── DUAL AXIS ─────────────────────────────────
function ChartDualAxis({ data }: { data: ChartDataItem[] }) {
  const flat = toFlatSeries(data);
  const cols = getColNames(data);
  const colors = getColColors(data);
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={flat}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis yAxisId="left" />
        <YAxis yAxisId="right" orientation="right" />
        <Tooltip />
        <Legend />
        {cols.map((col, i) =>
          i === 0 ? (
            <Bar key={col} yAxisId="left" dataKey={col} fill={colors[col]} />
          ) : (
            <Line
              key={col}
              yAxisId="right"
              type="monotone"
              dataKey={col}
              stroke={colors[col]}
              strokeWidth={2}
            />
          ),
        )}
      </ComposedChart>
    </ResponsiveContainer>
  );
}

// ── TREEMAP PARTITION ─────────────────────────
function ChartTreemapPartition({ data }: { data: ChartDataItem[] }) {
  // Hierarchical: root -> periods -> columns
  const CustomContent = (props: any) => {
    const { x, y, width, height, name, value, depth } = props;
    const colorEntry = data
      .flatMap((d) => d.Columns)
      .find((c) => c.Colname === name || c.Value === value);
    const color = colorEntry?.Color || (depth === 1 ? "#1155CC" : "#D4AF37");
    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          fill={color}
          stroke="#fff"
          strokeWidth={depth === 1 ? 2 : 1}
          opacity={0.8 + depth * 0.1}
        />
        {width > 30 && height > 15 && (
          <text
            x={x + width / 2}
            y={y + height / 2 + 4}
            textAnchor="middle"
            fill="#fff"
            fontSize={9}
            fontWeight={depth === 1 ? 600 : 400}
          >
            {name}
          </text>
        )}
      </g>
    );
  };

  const treeData = data.map((item) => ({
    name: item.Name,
    children: item.Columns.map((col) => ({
      name: col.Colname,
      size: col.Value,
      color: col.Color,
    })),
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <Treemap
        data={treeData}
        dataKey="size"
        stroke="#fff"
        content={<CustomContent />}
      >
        <Tooltip />
      </Treemap>
    </ResponsiveContainer>
  );
}

// ── BUBBLE MATRIX ─────────────────────────────
function ChartBubbleMatrix({ data }: { data: ChartDataItem[] }) {
  const cols = getColNames(data);
  const colors = getColColors(data);
  const [tip, setTip] = useState({ visible: false, x: 0, y: 0, content: "" });
  const allVals = data.flatMap((d) => d.Columns.map((c) => c.Value));
  const maxVal = Math.max(...allVals);
  const xStep = 60,
    yStep = 40;

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <SVGTooltip {...tip} />
      <svg
        viewBox={`0 0 ${data.length * xStep + 60} ${cols.length * yStep + 40}`}
        style={{ width: "100%", height: "100%" }}
      >
        {data.map((item, di) => (
          <text
            key={di}
            x={60 + di * xStep}
            y={15}
            textAnchor="middle"
            fontSize="9"
            fill="#64748b"
          >
            {item.Name}
          </text>
        ))}
        {cols.map((col, ci) => (
          <text
            key={ci}
            x={5}
            y={30 + ci * yStep + 5}
            fontSize="9"
            fill={colors[col]}
          >
            {col}
          </text>
        ))}
        {data.map((item, di) =>
          cols.map((col, ci) => {
            const v = item.Columns.find((c) => c.Colname === col)?.Value ?? 0;
            const r = 4 + (v / maxVal) * 14;
            const cx = 60 + di * xStep;
            const cy = 30 + ci * yStep;
            return (
              <circle
                key={`${di}-${ci}`}
                cx={cx}
                cy={cy}
                r={r}
                fill={colors[col]}
                opacity={0.75}
                onMouseEnter={() =>
                  setTip({
                    visible: true,
                    x: cx,
                    y: cy,
                    content: `${item.Name} / ${col}: ${v}`,
                  })
                }
                onMouseLeave={() => setTip((t) => ({ ...t, visible: false }))}
              />
            );
          }),
        )}
      </svg>
    </div>
  );
}

// ─────────────────────────────────────────────
//  UTILITIES
// ─────────────────────────────────────────────

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  if (clean.length === 3) {
    return [
      parseInt(clean[0] + clean[0], 16),
      parseInt(clean[1] + clean[1], 16),
      parseInt(clean[2] + clean[2], 16),
    ];
  }
  return [
    parseInt(clean.slice(0, 2), 16) || 17,
    parseInt(clean.slice(2, 4), 16) || 85,
    parseInt(clean.slice(4, 6), 16) || 204,
  ];
}

// ─────────────────────────────────────────────
//  MASTER RENDER FUNCTION
// ─────────────────────────────────────────────

export function renderChart(field: any) {
  const rawData: ChartDataItem[] = Array.isArray(field.ChartData)
    ? field.ChartData
    : [field.ChartData];
  if (!rawData || rawData.length === 0)
    return <div style={{ color: "#999", padding: 8 }}>No data</div>;

  switch (field.ValueType.toUpperCase()) {
    // ── Trend
    case "LINE":
      return <ChartLine data={rawData} />;
    case "STEP_LINE":
    case "STEPLINE":
      return <ChartStepLine data={rawData} />;
    case "AREA":
    case "AREA_STACKED":
    case "AREASTACKED":
      return <ChartAreaStacked data={rawData} />;
    case "STEP_AREA":
    case "STEPAREA":
      return <ChartStepArea data={rawData} />;
    case "STREAMGRAPH":
      return <ChartStreamgraph data={rawData} />;
    case "SMALL_MULTIPLES":
    case "SMALLMULTIPLES":
      return <ChartSmallMultiples data={rawData} />;
    case "CALENDAR_HEATMAP":
    case "CALENDARHEATMAP":
      return <ChartCalendarHeatmap data={rawData} />;
    case "RIBBON":
      return <ChartRibbon data={rawData} />;
    case "DUAL_AXIS":
    case "DUALAXIS":
      return <ChartDualAxis data={rawData} />;

    // ── Comparison
    case "BAR":
    case "BAR_GROUPED":
    case "BARGROUPED":
      return <ChartBarGrouped data={rawData} />;
    case "BAR_STACKED":
    case "BARSTACKED":
      return <ChartBarStacked data={rawData} />;
    case "LOLLIPOP":
      return <ChartLollipop data={rawData} />;
    case "DOT_PLOT":
    case "DOTPLOT":
      return <ChartDotPlot data={rawData} />;
    case "SLOPE":
      return <ChartSlope data={rawData} />;
    case "BUMP":
      return <ChartBump data={rawData} />;
    case "PARETO":
      return <ChartPareto data={rawData} />;
    case "RADAR":
    case "SPIDER":
      return <ChartRadar data={rawData} />;
    case "DUMBBELL":
      return <ChartDumbbell data={rawData} />;

    // ── Proportion
    case "PIE":
      return <ChartPie data={rawData} />;
    case "DONUT":
    case "DOUGHNUT":
      return <ChartPie data={rawData} donut />;
    case "TREEMAP":
      return <ChartTreemap data={rawData} />;
    case "ICON_ARRAY":
    case "ICONARRAY":
      return <ChartIconArray data={rawData} />;

    // ── Relationship / Correlation
    case "SCATTER":
    case "BUBBLE":
    case "SCATTER_BUBBLE":
    case "SCATTERBUBBLE":
      return <ChartScatterBubble data={rawData} />;
    case "CORRELATION":
    case "CORRELATION_MATRIX":
    case "CORRELATIONMATRIX":
      return <ChartCorrelationMatrix data={rawData} />;
    case "HEATMAP":
      return <ChartHeatmapGrid data={rawData} />;
    case "BUBBLE_MATRIX":
    case "BUBBLEMATRIX":
      return <ChartBubbleMatrix data={rawData} />;

    // ── Distribution
    case "HISTOGRAM":
      return <ChartHistogram data={rawData} />;
    case "BOXPLOT":
    case "BOX_PLOT":
      return <ChartBoxPlot data={rawData} />;
    case "VIOLIN":
      return <ChartViolin data={rawData} />;
    case "DENSITY":
      return <ChartDensity data={rawData} />;

    // ── Statistics
    case "QQ_PLOT":
    case "QQPLOT":
      return <ChartQQPlot data={rawData} />;

    // ── Business
    case "WATERFALL":
      return <ChartWaterfall data={rawData} />;
    case "FUNNEL":
      return <ChartFunnel data={rawData} />;
    case "GANTT":
      return <ChartGantt data={rawData} />;
    case "BULLET":
      return <ChartBullet data={rawData} />;
    case "GAUGE":
      return <ChartGauge data={rawData} />;
    case "GAUGE_RADIALBAR":
    case "GAUGERADIALBAR":
    case "RADIALBAR":
      return <ChartGaugeRadialBar data={rawData} />;
    case "MEKKO":
    case "MARIMEKKO":
      return <ChartMekko data={rawData} />;

    // ── Finance
    case "CANDLESTICK":
      return <ChartCandlestick data={rawData} />;
    case "RENKO":
      return <ChartRenko data={rawData} />;
    case "KAGI":
      return <ChartKagi data={rawData} />;
    case "OHLC":
      return <ChartOHLC data={rawData} />;

    // ── Hierarchy
    case "SUNBURST":
      return <ChartSunburst data={rawData} />;
    case "ICICLE":
      return <ChartIcicle data={rawData} />;
    case "TREEMAP_PARTITION":
    case "TREEMAPPARTITION":
      return <ChartTreemapPartition data={rawData} />;

    // ── Map (geo-lite via bubble representation)
    case "CHOROPLETH":
      return (
        <ChartGeoPlaceholder data={rawData} label="Choropleth (Geo Lite)" />
      );
    case "BUBBLE_MAP":
    case "BUBBLEMAP":
      return (
        <ChartGeoPlaceholder data={rawData} label="Bubble Map (Geo Lite)" />
      );
    case "FLOW_MAP":
    case "FLOWMAP":
      return <ChartGeoPlaceholder data={rawData} label="Flow Map (Geo Lite)" />;

    // ── Flow / Network
    case "CHORD":
      return <ChartChord data={rawData} />;
    case "SANKEY":
      return <ChartSankey data={rawData} />;
    case "NETWORK":
      return <ChartNetwork data={rawData} />;
    case "PARALLEL_COORDS":
    case "PARALLELCOORDS":
      return <ChartParallelCoords data={rawData} />;

    // ── Creative
    case "RADIAL_BARS":
    case "RADIALBARS":
      return <ChartRadialBars data={rawData} />;
    case "PROGRESS_RING":
    case "PROGRESSRING":
      return <ChartProgressRing data={rawData} />;
    case "WORDCLOUD":
    case "WORD_CLOUD":
      return <ChartWordCloud data={rawData} />;

    // ── Advanced
    case "HEXBIN":
      return <ChartHexbin data={rawData} />;

    default:
      return (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            color: "#999",
            fontStyle: "italic",
            fontSize: 13,
          }}
        >
          Unknown chart type: {field.ValueType}
        </div>
      );
  }
}
