import React, { useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { CATEGORY_META, CATEGORY_ORDER } from '../utils';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--color-bg-card)',
      border: '1px solid var(--color-border)',
      borderRadius: 10,
      padding: '12px 16px',
      boxShadow: 'var(--shadow-card)',
    }}>
      <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 8 }}>{label}</p>
      {payload.map((entry) => (
        <div key={entry.dataKey} style={{
          display: 'flex', justifyContent: 'space-between', gap: 16,
          fontSize: 12, marginBottom: 4,
        }}>
          <span style={{ color: entry.color, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: entry.color, display: 'inline-block' }} />
            {CATEGORY_META[entry.dataKey]?.label ?? entry.dataKey}
          </span>
          <span style={{ fontFamily: 'DM Mono, monospace', color: 'var(--text-primary)' }}>
            {Number(entry.value).toFixed(1)}
          </span>
        </div>
      ))}
    </div>
  );
};

export function ScoreHistoryChart({ history }) {
  const chartData = useMemo(() => {
    if (!history || !history.length) return [];

    // Group by computed_at date (day granularity)
    const byDate = {};

    for (const point of history) {
      const date = new Date(point.computed_at);
      const key = date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' });
      if (!byDate[key]) byDate[key] = {};
      byDate[key][point.category] = point.weighted_score;
    }

    return Object.entries(byDate)
      .map(([label, scores]) => ({ date: label, label, ...scores }))
      .slice(-30); // last 30 data points
  }, [history]);

  const activeCategories = useMemo(() => {
    if (!history) return [];
    const seen = new Set();
    history.forEach(h => seen.add(h.category));
    return CATEGORY_ORDER.filter(c => seen.has(c));
  }, [history]);

  if (!chartData.length) {
    return (
      <div className="empty-state">
        <div className="empty-state-title">No score history yet</div>
        <div className="empty-state-body">Scores will appear here after the first scoring run.</div>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={320}>
      <LineChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="rgba(99, 120, 200, 0.1)"
          vertical={false}
        />
        <XAxis
          dataKey="label"
          tick={{ fill: 'var(--text-tertiary)', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          domain={[0, 10]}
          tick={{ fill: 'var(--text-tertiary)', fontSize: 11, fontFamily: 'DM Mono' }}
          axisLine={false}
          tickLine={false}
          ticks={[0, 2, 4, 6, 8, 10]}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ fontSize: 11, paddingTop: 16 }}
          formatter={(value) =>
            CATEGORY_META[value]?.label ?? value
          }
        />
        <ReferenceLine y={7} stroke="rgba(16,185,129,0.2)" strokeDasharray="4 4" />

        {activeCategories.map((cat) => (
          <Line
            key={cat}
            type="monotone"
            dataKey={cat}
            stroke={CATEGORY_META[cat].color}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: CATEGORY_META[cat].color }}
            connectNulls
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
