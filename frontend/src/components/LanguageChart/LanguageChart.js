import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import styles from './LanguageChart.module.css';

const COLORS = ['#0366d6', '#6f42c1', '#28a745', '#d73a49', '#ffd33d', '#a2eeef', '#f66a0a', '#e99695'];

const LanguageChart = ({ data }) => {
  const filteredData = Array.isArray(data) ? data.filter(l => l.percent > 0) : [];
  if (!filteredData || filteredData.length === 0) return null;
  return (
    <div className={styles.section}>
      <h2>Language Distribution</h2>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={filteredData}
            dataKey="percent"
            nameKey="language"
            cx="50%"
            cy="50%"
            outerRadius={80}
            label={false}
          >
            {filteredData.map((entry, idx) => (
              <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(v) => [`${v}%`, 'Percent']} />
        </PieChart>
      </ResponsiveContainer>
      <div className={styles.langLegendScrollable}>
        {filteredData.map((entry, idx) => (
          <div className={styles.langLegendItem} key={entry.language}>
            <span className={styles.langSwatch} style={{background: COLORS[idx % COLORS.length]}}></span>
            <span className={styles.langName}>{entry.language}</span>
            <span className={styles.langPercent}>{entry.percent}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LanguageChart;
