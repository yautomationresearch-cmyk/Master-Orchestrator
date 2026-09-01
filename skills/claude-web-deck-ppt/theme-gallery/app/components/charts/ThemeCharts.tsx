"use client";

import { useEffect, useState, type CSSProperties } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  BOARD_CHART_DEFAULTS,
  ORBIT_CHART_DEFAULTS,
  financeBars,
  growthSeries,
  impactTrend,
  marketSlices,
  readChartColors,
  type ChartColors,
} from "../../lib/chartTokens";

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return reduced;
}

/** Start empty so Recharts draws pies/areas in instead of popping fully rendered. */
function useEnterData<T>(data: T[], reduce: boolean): T[] {
  const [live, setLive] = useState<T[]>(() => (reduce ? data : []));
  useEffect(() => {
    if (reduce) {
      setLive(data);
      return;
    }
    setLive([]);
    const id = window.setTimeout(() => setLive(data), 40);
    return () => window.clearTimeout(id);
  }, [data, reduce]);
  return live;
}

function useLiveChartColors(rootSelector: string, fallback: ChartColors): ChartColors {
  const [colors, setColors] = useState(fallback);
  useEffect(() => {
    const sync = () => {
      const el = document.querySelector(rootSelector);
      setColors(readChartColors(el, fallback));
    };
    sync();
    const el = document.querySelector(rootSelector);
    if (!el) return;
    const mo = new MutationObserver(sync);
    mo.observe(el, { attributes: true, attributeFilter: ["style", "class"] });
    window.addEventListener("storage", sync);
    const id = window.setInterval(sync, 400);
    return () => {
      mo.disconnect();
      window.removeEventListener("storage", sync);
      window.clearInterval(id);
    };
  }, [rootSelector, fallback]);
  return colors;
}

const tipStyle = (colors: ChartColors, dark: boolean): CSSProperties => ({
  background: dark ? "rgba(10, 12, 16, 0.94)" : "rgba(255, 255, 255, 0.96)",
  border: `1px solid ${colors.grid}`,
  borderRadius: 8,
  color: dark ? "#f8fafc" : "#0f172a",
  fontSize: 12,
  fontFamily: "var(--sans)",
});

export function GrowthAreaChart({
  rootSelector,
  dark = true,
}: {
  rootSelector: string;
  dark?: boolean;
}) {
  const colors = useLiveChartColors(rootSelector, dark ? ORBIT_CHART_DEFAULTS : BOARD_CHART_DEFAULTS);
  const reduce = usePrefersReducedMotion();
  return (
    <div className="chart-frame" role="img" aria-label="Growth rising from 32 to 87 across eight months">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={growthSeries} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={`growth-fill`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={colors.c1} stopOpacity={0.45} />
              <stop offset="100%" stopColor={colors.c1} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={colors.grid} vertical={false} />
          <XAxis dataKey="m" stroke={colors.axis} tick={{ fill: colors.axis, fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis stroke={colors.axis} tick={{ fill: colors.axis, fontSize: 11 }} axisLine={false} tickLine={false} width={28} />
          <Tooltip contentStyle={tipStyle(colors, dark)} />
          <Area
            type="monotone"
            dataKey="v"
            stroke={colors.c1}
            strokeWidth={3}
            fill={`url(#growth-fill)`}
            isAnimationActive={!reduce}
            animationBegin={60}
            animationDuration={900}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function MarketPieChart({
  rootSelector,
  dark = true,
}: {
  rootSelector: string;
  dark?: boolean;
}) {
  const colors = useLiveChartColors(rootSelector, dark ? ORBIT_CHART_DEFAULTS : BOARD_CHART_DEFAULTS);
  const reduce = usePrefersReducedMotion();
  const data = useEnterData(marketSlices, reduce);
  const map = { c1: colors.c1, c2: colors.c2, c3: colors.c3 };
  return (
    <div className="chart-frame" role="img" aria-label="Market mix: Enterprise 48%, Mid-market 32%, SMB 20%">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            startAngle={90}
            endAngle={-270}
            innerRadius="46%"
            outerRadius="78%"
            paddingAngle={2}
            cornerRadius={6}
            isAnimationActive={!reduce}
            animationBegin={0}
            animationDuration={1400}
            animationEasing="ease-out"
          >
            {data.map((s) => (
              <Cell key={s.name} fill={map[s.key]} stroke="transparent" />
            ))}
          </Pie>
          <Tooltip contentStyle={tipStyle(colors, dark)} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function FinanceComboChart({
  rootSelector,
  dark = true,
}: {
  rootSelector: string;
  dark?: boolean;
}) {
  const colors = useLiveChartColors(rootSelector, dark ? ORBIT_CHART_DEFAULTS : BOARD_CHART_DEFAULTS);
  const reduce = usePrefersReducedMotion();
  return (
    <div className="chart-frame" role="img" aria-label="Quarterly revenue versus target, closing at 2.4 million">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={financeBars} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke={colors.grid} vertical={false} />
          <XAxis dataKey="q" stroke={colors.axis} tick={{ fill: colors.axis, fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis stroke={colors.axis} tick={{ fill: colors.axis, fontSize: 11 }} axisLine={false} tickLine={false} width={28} />
          <Tooltip contentStyle={tipStyle(colors, dark)} />
          <Bar dataKey="revenue" fill={colors.c3} radius={[6, 6, 0, 0]} isAnimationActive={!reduce} animationDuration={900} />
          <Line type="monotone" dataKey="target" stroke={colors.c2} strokeWidth={3} dot={{ r: 4, fill: colors.c2 }} isAnimationActive={!reduce} animationDuration={1000} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ImpactDonut({
  rootSelector,
  value = 98,
  dark = true,
}: {
  rootSelector: string;
  value?: number;
  dark?: boolean;
}) {
  const colors = useLiveChartColors(rootSelector, dark ? ORBIT_CHART_DEFAULTS : BOARD_CHART_DEFAULTS);
  const reduce = usePrefersReducedMotion();
  const [live, setLive] = useState<{ name: string; value: number }[]>(() =>
    reduce
      ? [
          { name: "score", value },
          { name: "rest", value: 100 - value },
        ]
      : [],
  );
  useEffect(() => {
    const full = [
      { name: "score", value },
      { name: "rest", value: 100 - value },
    ];
    if (reduce) {
      setLive(full);
      return;
    }
    setLive([]);
    const id = window.setTimeout(() => setLive(full), 40);
    return () => window.clearTimeout(id);
  }, [value, reduce]);
  return (
    <div className="chart-frame donut" role="img" aria-label={`Customer impact score ${value} percent`}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={live}
            dataKey="value"
            cx="50%"
            cy="50%"
            startAngle={90}
            endAngle={-270}
            innerRadius="68%"
            outerRadius="88%"
            stroke="none"
            cornerRadius={8}
            isAnimationActive={!reduce}
            animationBegin={0}
            animationDuration={1400}
            animationEasing="ease-out"
          >
            {live.map((d) => (
              <Cell key={d.name} fill={d.name === "score" ? colors.c2 : colors.track} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="donut-center">
        <strong>{value}%</strong>
        <span>impact</span>
      </div>
    </div>
  );
}

export function SparkTrend({
  rootSelector,
  dark = true,
}: {
  rootSelector: string;
  dark?: boolean;
}) {
  const colors = useLiveChartColors(rootSelector, dark ? ORBIT_CHART_DEFAULTS : BOARD_CHART_DEFAULTS);
  const reduce = usePrefersReducedMotion();
  const data = useEnterData(impactTrend, reduce);
  return (
    <div className="chart-frame spark" role="img" aria-label="NPS climbing from 72 to 98 over five weeks">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 4 }}>
          <CartesianGrid stroke={colors.grid} vertical={false} />
          <XAxis
            dataKey="w"
            stroke={colors.axis}
            tick={{ fill: colors.axis, fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            ticks={[0, 25, 50, 75, 100]}
            allowDataOverflow={false}
            stroke={colors.axis}
            tick={{ fill: colors.axis, fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            width={30}
          />
          <Area
            type="monotone"
            dataKey="nps"
            stroke={colors.c2}
            fill={colors.c2}
            fillOpacity={0.22}
            strokeWidth={2.5}
            baseLine={0}
            isAnimationActive={!reduce}
            animationDuration={900}
            animationEasing="ease-out"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function SegmentBars({
  rootSelector,
  dark = true,
}: {
  rootSelector: string;
  dark?: boolean;
}) {
  const colors = useLiveChartColors(rootSelector, dark ? ORBIT_CHART_DEFAULTS : BOARD_CHART_DEFAULTS);
  const reduce = usePrefersReducedMotion();
  const data = marketSlices.map((s) => ({ name: s.name, value: s.value, fill: colors[s.key] }));
  return (
    <div className="chart-frame" role="img" aria-label="Horizontal market segment bars">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 12, left: 8, bottom: 4 }}>
          <XAxis type="number" hide />
          <YAxis type="category" dataKey="name" width={88} tick={{ fill: colors.axis, fontSize: 12 }} axisLine={false} tickLine={false} />
          <Bar dataKey="value" radius={[0, 8, 8, 0]} isAnimationActive={!reduce}>
            {data.map((d) => (
              <Cell key={d.name} fill={d.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
